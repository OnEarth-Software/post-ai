from typing import Any
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, cast, Date
from app.models.user import User
from app.models.campaign import Campaign
from app.models.product import Product

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
