from app.database.connection import SessionLocal
from app.models.campaign import Campaign
from app.models.campaign_result import CampaignResult

def main():
    db = SessionLocal()
    try:
        # Find all campaigns that have an associated result
        campaigns_with_results = db.query(Campaign).join(CampaignResult).all()
        
        for c in campaigns_with_results:
            c.status = True
            
        db.commit()
        print(f"Updated {len(campaigns_with_results)} campaigns to True.")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main()
