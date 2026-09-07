from typing import Any
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Date
from fastapi import HTTPException
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
from app.models.api_expense import ApiExpense
from app.models.plan import Plan
import csv
import io


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


    total_tokens_spent = db.query(func.sum(ApiExpense.tokens_used)).scalar() or 0
    total_cost = db.query(func.sum(ApiExpense.cost)).scalar() or 0.0

    current_tokens = db.query(func.sum(ApiExpense.tokens_used)).filter(ApiExpense.created_at >= thirty_days_ago).scalar() or 0
    previous_tokens = db.query(func.sum(ApiExpense.tokens_used)).filter(ApiExpense.created_at >= sixty_days_ago, ApiExpense.created_at < thirty_days_ago).scalar() or 0

    tokens_change_percentage = 0.0
    if previous_tokens > 0:
        tokens_change_percentage = ((current_tokens- previous_tokens) / previous_tokens) * 100
    
    elif current_tokens > 0:
        tokens_change_percentage = 100.0
    
    current_cost = db.query(func.sum(ApiExpense.cost)).filter(ApiExpense.created_at >= thirty_days_ago).scalar() or 0.0
    previous_cost = db.query(func.sum(ApiExpense.cost)).filter(ApiExpense.created_at >= sixty_days_ago, ApiExpense.created_at < thirty_days_ago).scalar() or 0.0

    cost_change_percentage = 0.0
    if previous_cost > 0:
        cost_change_percentage = ((current_cost - previous_cost) / previous_cost) * 100
    elif current_cost > 0:
        cost_change_percentage = 100.0
    

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
        "total_tokens_spent": total_tokens_spent,
        "total_cost": total_cost,
        "users_change_percentage": round(users_change_percentage, 1),
        "campaigns_change_percentage": round(campaigns_change_percentage, 1),
        "tokens_change_percentage": round(tokens_change_percentage, 1),
        "cost_change_percentage": round(cost_change_percentage, 1),
        "active_users": active_users,
        "daily_campaigns": daily_campaigns
    }

def get_users_paginated(db: Session, page: int = 1, limit: int = 5) -> dict:
    offset = (page - 1) * limit
    total_users = db.query(User).count()
    
    users = db.query(User).order_by(desc(User.created_at)).offset(offset).limit(limit).all()
    
    items = []
    for user in users:
        items.append({
            "id": str(user.id),
            "name": f"{user.name} {user.surname}".strip(),
            "email": user.email,
            "role": user.role,
            "credits": user.credits,
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
    if update_data.credits is not None:
        user.credits = update_data.credits
            
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

        campaign_expenses = db.query(ApiExpense).filter(
            ApiExpense.related_entity_id == str(campaign.id)
        ).all()

        total_tokens = sum([e.tokens_used for e in campaign_expenses])
        total_c = sum([e.cost for e in campaign_expenses])

        items.append({
            "id": str(campaign.id),
            "imageUrl": image_url,
            "platform": campaign.platform,
            "type": campaign.type,
            "goal": campaign.goal,
            "slogan": campaign.slogan or "",
            "tokensSpent": total_tokens,
            "cost": f"{total_c:.4f}",
            "user": {
                "name": user_name,
                "avatar": user_avatar
            },
            "createdAt": campaign.created_at.isoformat() if campaign.created_at else "",
            "user_prompt": campaign.user_prompt,
            "system_prompt": campaign.system_prompt,
            "subtext": campaign.subtext,
            "post_text": campaign.post_text
        })
        
    return {
        "items": items,
        "total": total_campaigns,
        "page": page,
        "limit": limit
    }

def get_products_paginated(
    db: Session, 
    page: int = 1, 
    limit: int = 5, 
    search: str = None,
    sort: str = "desc",
    date_range: str = "all"
) -> dict:
    from app.models.product_analyze import ProductAnalyze
    from app.models.api_expense import ApiExpense

    offset = (page - 1) * limit
    
    query = db.query(Product).outerjoin(User, Product.user_id == User.id)
    
    if search:
        search_term = f"%{search}%"
        from sqlalchemy import or_
        query = query.filter(or_(
            Product.name.ilike(search_term),
            User.name.ilike(search_term),
            User.surname.ilike(search_term)
        ))

    if date_range and date_range != "all":
        now = datetime.now(timezone.utc)
        if date_range == "7d":
            query = query.filter(Product.created_at >= now - timedelta(days=7))
        elif date_range == "1m":
            query = query.filter(Product.created_at >= now - timedelta(days=30))
        elif date_range == "6m":
            query = query.filter(Product.created_at >= now - timedelta(days=180))
        elif date_range == "1y":
            query = query.filter(Product.created_at >= now - timedelta(days=365))

    total_products = query.count()
    
    if sort == "asc":
        query = query.order_by(Product.created_at.asc())
    else:
        query = query.order_by(desc(Product.created_at))
        
    products = query.offset(offset).limit(limit).all()

    items = []
    for product in products:
        analyze = db.query(ProductAnalyze).filter(ProductAnalyze.product_id == product.id).first()
        expenses = db.query(ApiExpense).filter(ApiExpense.related_entity_id == product.id).all()
        
        tokens_spent = sum(e.tokens_used for e in expenses if e.tokens_used)
        total_cost = sum(e.cost for e in expenses if e.cost)
        
        user_name = "Unknown User"
        user_avatar = "?"
        if product.user:
            name_part = product.user.name or ""
            surname_part = product.user.surname or ""
            full_name = f"{name_part} {surname_part}".strip()
            user_name = full_name if full_name else "Unknown User"
            user_avatar = name_part[0].upper() if name_part else "?"

        items.append({
            "id": str(product.id),
            "imageUrl": product.image_url,
            "name": product.name,
            "analysisStatus": "Analyzed" if analyze else "Pending",
            "tokensSpent": tokens_spent,
            "cost": f"{total_cost:.4f}",
            "user": {
                "name": user_name,
                "avatar": user_avatar
            },
            "createdAt": product.created_at.strftime("%d.%m.%Y") if product.created_at else ""
        })

    return {
        "items": items,
        "total": total_products,
        "page": page,
        "limit": limit
    }

def delete_campaign(db: Session, campaign_id: str) -> dict:
    campaign = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not campaign:
        return {"error": "Campaign not found"}
    
    db.delete(campaign)
    db.commit()
    return {"message": "Campaign deleted successfully"}

def delete_product(db: Session, product_id: str) -> dict:
    from app.models.product_analyze import ProductAnalyze
    from app.models.api_expense import ApiExpense
    
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return {"error": "Product not found"}
        
    # Delete associated expenses
    expenses = db.query(ApiExpense).filter(ApiExpense.related_entity_id == product.id).all()
    for e in expenses:
        db.delete(e)
        
    # Delete associated analysis
    analysis = db.query(ProductAnalyze).filter(ProductAnalyze.product_id == product.id).all()
    for a in analysis:
        db.delete(a)
        
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}



def get_financial_stats(
    db:Session
) -> dict:

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)

    # Gelir (Şimdilik 0)
    total_revenue = 0.0
    plan_revenues = []

    # Aktif Kullanıcılar (Kredili sisteme geçtik, sadece kayıtları sayabiliriz)
    new_subs = db.query(User).filter(
        User.created_at >= thirty_days_ago
    ).count()

    #gider
    expenses_query = db.query(
        ApiExpense.service_type,
        func.sum(ApiExpense.tokens_used).label("total_tokens"),
        func.sum(ApiExpense.cost).label("total_cost")
    ).group_by(ApiExpense.service_type).all()

    api_expenses = []
    total_api_cost = 0.0

    for idx, expense in enumerate(expenses_query):
        cost = expense.total_cost or 0.0
        tokens =expense.total_tokens or 0
        total_api_cost += cost

        token_str = f"{tokens / 1000000:.1f}M" if tokens >= 1000000 else (f"{tokens / 1000:.1f}k" if tokens >= 1000 else str(tokens))

        if cost == 0:
            cost_str = "$0.00"
        elif cost < 1.0:
            cost_str = f"${cost:.4f}"
        else:
            cost_str = f"${cost:.2f}"

        api_expenses.append({
            "id": str(idx),
            "service": expense.service_type,
            "tokensUsed": token_str,
            "totalCost": cost_str,
            "trend": "Aktif"
        })
    
    #Aylık Grafik
    monthly_chart = []
    months_tr = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]

    # Gelirler şimdilik sıfır (Son 6 ay)
    mock_incomes = [0.0, 0.0, 0.0, 0.0, 0.0, 0.0]

    for i in range(5, -1, -1):
        month_start = datetime.now(timezone.utc).replace(day=1) - timedelta(days=30 * i)
        month_idx = month_start.month - 1
        
        # Gider gerçek veritabanından
        month_expense = db.query(func.sum(ApiExpense.cost)).filter(
            func.extract('month', ApiExpense.created_at) == month_start.month,
            func.extract('year', ApiExpense.created_at) == month_start.year
        ).scalar() or 0.0
        
        # Gelir sahte
        month_income = mock_incomes[5 - i]
        
        monthly_chart.append({
            "month": months_tr[month_idx],
            "income": month_income,
            "expense": month_expense
        })

    user_expenses_query = db.query(
        User.id,
        User.name,
        User.surname,
        User.email,
        func.sum(ApiExpense.tokens_used).label("total_tokens"),
        func.sum(ApiExpense.cost).label("total_cost")
    ).join(ApiExpense, User.id == ApiExpense.user_id)\
     .group_by(User.id, User.name, User.surname, User.email)\
     .order_by(func.sum(ApiExpense.cost).desc())\
     .all()

    user_api_costs = []
    for u in user_expenses_query:
        cost = u.total_cost or 0.0
        tokens = u.total_tokens or 0
        
        token_str = f"{tokens / 1000000:.1f}M" if tokens >= 1000000 else (f"{tokens / 1000:.1f}k" if tokens >= 1000 else str(tokens))
        
        if cost == 0:
            cost_str = "$0.00"
        elif cost < 1.0:
            cost_str = f"${cost:.4f}"
        else:
            cost_str = f"${cost:.2f}"

        user_api_costs.append({
            "id": str(u.id),
            "name": f"{u.name} {u.surname}".strip(),
            "email": u.email,
            "tokensUsed": token_str,
            "totalCost": cost_str
        })

    return {
        "totalRevenue": total_revenue,
        "apiCost": total_api_cost,
        "netProfit": total_revenue - total_api_cost,
        "activeSubscribers": 0,
        "revenueGrowth": 0.0,
        "apiCostGrowth": 0.0,
        "netProfitGrowth": 0.0,
        "newSubscribers": new_subs,
        "planRevenues": plan_revenues,
        "apiExpenses": api_expenses,
        "monthlyChart": monthly_chart,
        "userApiCosts": user_api_costs
    }

def export_campaigns_csv(db: Session, start_date_str: str, end_date_str: str) -> str:
    # Parse dates
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d").replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    # Query Campaigns within date range, joined with Product and User
    campaigns = db.query(Campaign, User).join(Product, Campaign.product_id == Product.id).join(User, Product.user_id == User.id).filter(
        Campaign.created_at >= start_date,
        Campaign.created_at <= end_date
    ).order_by(Campaign.created_at.desc()).all()

    # Generate CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "Kullanıcı ID", "Kullanıcı Adı", "E-posta", 
        "Kampanya ID", "Görsel Linki", "Platform", 
        "Tür", "Hedef", "Harcanan Token", 
        "Maliyet ($)", "Tarih"
    ])
    
    # Write rows
    for campaign, user in campaigns:
        # Avoid timezone errors by safely converting datetime
        created_str = campaign.created_at.strftime("%Y-%m-%d %H:%M:%S") if campaign.created_at else ""
        
        # Determine image url
        image_url = ""
        if campaign.results and len(campaign.results) > 0:
            image_url = campaign.results[0].image_url or ""
            
        # Calculate tokens and cost
        campaign_expenses = db.query(ApiExpense).filter(
            ApiExpense.related_entity_id == str(campaign.id)
        ).all()
        total_tokens = sum([e.tokens_used for e in campaign_expenses])
        total_c = sum([e.cost for e in campaign_expenses])
            
        writer.writerow([
            str(user.id),
            f"{user.name} {user.surname}",
            user.email,
            str(campaign.id),
            image_url,
            campaign.platform,
            campaign.type,
            campaign.goal,
            str(total_tokens),
            f"{total_c:.4f}".replace(".", ","),
            created_str
        ])
        
    return output.getvalue()
