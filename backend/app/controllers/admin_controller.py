from typing import Any
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Date
from fastapi import HTTPException
from app.models.user import User
from app.models.campaign import Campaign
from app.models.product import Product
from app.models.plan import Plan
from app.models.campaign_result import CampaignResult
from app.schemas.admin_schema import UserAdminUpdateRequest

def check_access(current_admin: User) -> Any:
    """
    Check if the current user has admin access.
    """
    return {
        "status": "ok", 
        "message": "Admin access verified", 
        "user_id": str(current_admin.id)
    }

def get_dashboard_stats(db: Session) -> dict:
    total_users = db.query(User).count()
    total_campaigns = db.query(Campaign).count()

    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)

    # Calculate percentage change for users
    current_users_count = db.query(User).filter(User.created_at >= thirty_days_ago).count()
    previous_users_count = db.query(User).filter(User.created_at >= sixty_days_ago, User.created_at < thirty_days_ago).count()
    
    users_change_percentage = 0.0
    if previous_users_count > 0:
        users_change_percentage = ((current_users_count - previous_users_count) / previous_users_count) * 100
    elif current_users_count > 0:
        users_change_percentage = 100.0

    # Calculate percentage change for campaigns
    current_campaigns_count = db.query(Campaign).filter(Campaign.created_at >= thirty_days_ago).count()
    previous_campaigns_count = db.query(Campaign).filter(Campaign.created_at >= sixty_days_ago, Campaign.created_at < thirty_days_ago).count()

    campaigns_change_percentage = 0.0
    if previous_campaigns_count > 0:
        campaigns_change_percentage = ((current_campaigns_count - previous_campaigns_count) / previous_campaigns_count) * 100
    elif current_campaigns_count > 0:
        campaigns_change_percentage = 100.0

    # Get most active users (by campaign count)
    active_users_query = (
        db.query(
            User.name,
            User.surname,
            func.count(Campaign.id).label("campaign_count")
        )
        .join(Product, User.id == Product.user_id)
        .join(Campaign, Product.id == Campaign.product_id)
        .group_by(User.id)
        .order_by(desc("campaign_count"))
        .limit(5)
        .all()
    )

    active_users = [
        {
            "name": user.name,
            "surname": user.surname,
            "campaign_count": user.campaign_count
        }
        for user in active_users_query
    ]

    # Calculate Daily Campaigns for the last 7 days
    today = datetime.now(timezone.utc).date()
    last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]
    start_date = last_7_days[0]

    # Query campaigns grouped by date
    campaigns_by_day_query = (
        db.query(
            cast(Campaign.created_at, Date).label("day"),
            func.count(Campaign.id).label("count")
        )
        .filter(cast(Campaign.created_at, Date) >= start_date)
        .group_by("day")
        .all()
    )

    counts_by_day = {c.day: c.count for c in campaigns_by_day_query}

    daily_campaigns = []
    for day in last_7_days:
        daily_campaigns.append({
            "date": day.isoformat(),
            "count": counts_by_day.get(day, 0)
        })

    return {
        "total_users": total_users,
        "total_campaigns": total_campaigns,
        "users_change_percentage": round(users_change_percentage, 1),
        "campaigns_change_percentage": round(campaigns_change_percentage, 1),
        "active_users": active_users,
        "daily_campaigns": daily_campaigns
    }

def get_users_paginated(db: Session, page: int = 1, limit: int = 5) -> dict:
    offset = (page - 1) * limit
    total_users = db.query(User).count()
    
    users = db.query(User).order_by(desc(User.created_at)).offset(offset).limit(limit).all()
    
    items = []
    for user in users:
        design_usage = db.query(Campaign).join(Product).filter(Product.user_id == user.id).count()
        product_usage = db.query(Product).filter(Product.user_id == user.id).count()
        
        plan_name = "Free"
        if user.plan_id:
            plan = db.query(Plan).filter(Plan.id == user.plan_id).first()
            if plan:
                plan_name = plan.name
                
        items.append({
            "id": str(user.id),
            "name": f"{user.name} {user.surname}".strip(),
            "email": user.email,
            "role": user.role,
            "plan": plan_name,
            "designUsage": design_usage,
            "designLimit": user.design_limit,
            "productUsage": product_usage,
            "productLimit": user.product_limit,
            "status": "Active" if user.is_active else "Inactive"
        })
        
    return {
        "items": items,
        "total": total_users,
        "page": page,
        "limit": limit
    }

def update_user_profile(db: Session, user_id: str, update_data: UserAdminUpdateRequest) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if update_data.name is not None:
        parts = update_data.name.split(" ", 1)
        user.name = parts[0]
        if len(parts) > 1:
            user.surname = parts[1]
            
    if update_data.email is not None:
        user.email = update_data.email
    if update_data.role is not None:
        user.role = update_data.role
    if update_data.status is not None:
        user.is_active = update_data.status == "Active"
    if update_data.designLimit is not None:
        user.design_limit = update_data.designLimit
    if update_data.productLimit is not None:
        user.product_limit = update_data.productLimit
        
    # Handling plan changes
    if update_data.plan is not None:
        new_plan = None
        if update_data.plan != "Free":
            new_plan = db.query(Plan).filter(Plan.name == update_data.plan).first()
        
        # Check if plan actually changed
        current_plan_name = user.plan.name if user.plan else "Free"
        if current_plan_name != update_data.plan:
            if new_plan:
                user.plan_id = new_plan.id
                # Only sync limits if the admin didn't manually change them in this request
                # A heuristic: if the incoming limits are identical to the old user limits, it means they didn't touch the inputs.
                if update_data.designLimit == user.design_limit:
                    user.design_limit = new_plan.design_limit
                if update_data.productLimit == user.product_limit:
                    user.product_limit = new_plan.product_limit
            elif update_data.plan == "Free":
                user.plan_id = None
                if update_data.designLimit == user.design_limit:
                    user.design_limit = 5
                if update_data.productLimit == user.product_limit:
                    user.product_limit = 5
            
    db.commit()
    return {"message": "User updated successfully"}

def delete_user(db: Session, user_id: str) -> dict:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}

def get_campaigns_paginated(
    db: Session, 
    page: int = 1, 
    limit: int = 5, 
    search: str = None,
    platform: str = None,
    type_filter: str = None,
    sort: str = "desc",
    date_range: str = "all"
) -> dict:
    offset = (page - 1) * limit
    
    query = db.query(Campaign).join(Product, Campaign.product_id == Product.id).join(User, Product.user_id == User.id)
    
    if search:
        search_term = f"%{search}%"
        from sqlalchemy import or_
        query = query.filter(or_(
            Campaign.goal.ilike(search_term),
            Campaign.slogan.ilike(search_term),
            User.name.ilike(search_term),
            User.surname.ilike(search_term)
        ))

    if platform and platform != "all":
        query = query.filter(Campaign.platform.ilike(platform))
        
    if type_filter and type_filter != "all":
        query = query.filter(Campaign.type.ilike(type_filter))
        
    if date_range and date_range != "all":
        now = datetime.now(timezone.utc)
        if date_range == "7d":
            query = query.filter(Campaign.created_at >= now - timedelta(days=7))
        elif date_range == "1m":
            query = query.filter(Campaign.created_at >= now - timedelta(days=30))
        elif date_range == "6m":
            query = query.filter(Campaign.created_at >= now - timedelta(days=180))
        elif date_range == "1y":
            query = query.filter(Campaign.created_at >= now - timedelta(days=365))

    total_campaigns = query.count()
    
    if sort == "asc":
        query = query.order_by(Campaign.created_at.asc())
    else:
        query = query.order_by(desc(Campaign.created_at))
        
    campaigns = query.offset(offset).limit(limit).all()

    items = []
    for campaign in campaigns:
        image_url = ""
        if campaign.results and len(campaign.results) > 0:
            image_url = campaign.results[0].image_url
        elif campaign.product:
            image_url = campaign.product.image_url
            
        user_name = "Bilinmeyen"
        user_avatar = "U"
        if campaign.product and campaign.product.user:
            user = campaign.product.user
            user_name = f"{user.name} {user.surname}".strip()
            user_avatar = user.name[0].upper() if user.name else "U"

        items.append({
            "id": str(campaign.id),
            "imageUrl": image_url,
            "platform": campaign.platform,
            "type": campaign.type,
            "goal": campaign.goal,
            "slogan": campaign.slogan or "",
            "tokensSpent": 45,
            "cost": "0.12",
            "user": {
                "name": user_name,
                "avatar": user_avatar
            },
            "createdAt": campaign.created_at.isoformat() if campaign.created_at else "",
            "user_prompt": campaign.user_prompt,
            "system_prompt": campaign.system_prompt,
            "subtext": campaign.subtext
        })
        
    return {
        "items": items,
        "total": total_campaigns,
        "page": page,
        "limit": limit
    }

def delete_campaign(db: Session, campaign_id: str) -> dict:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        raise HTTPException(status_code=404, detail="Campaign not found")
        
    db.delete(campaign)
    db.commit()
    return {"message": "Campaign deleted successfully"}
