import time
import schedule
import os
from loader.data_loader import DataLoader
from analyzer.usage_analyzer import UsageAnalyzer
from sqlalchemy import create_engine
import pandas as pd
import requests

# Database connection for MySQL (Analysis Results)
MYSQL_URI = os.getenv('MYSQL_URI', 'mysql+pymysql://root:root@mysql:3306/cloud_optimizer')
OPTIMIZATION_URL = os.getenv('OPTIMIZATION_URL', 'http://optimization-engine:8082/optimize/analyze')

def run_analysis():
    print("Starting analysis job...")
    loader = DataLoader()
    analyzer = UsageAnalyzer()
    
    # In a real scenario, we would get a list of all resources
    # For now, let's assume we fetch all and group by resourceId
    df = loader.load_metrics()
    
    if df.empty:
        print("No metrics found.")
        return

    engine = create_engine(MYSQL_URI)
    
    # Group by resourceId
    for resource_id, group_df in df.groupby('resourceId'):
        result = analyzer.analyze_usage(group_df)
        print(f"Analyzed {resource_id}: {result}")
        
        # Save to MySQL
        result_df = pd.DataFrame([result])
        result_df.to_sql('usage_analysis', engine, if_exists='append', index=False)

        try:
            payload = {
                "resourceId": result.get("resource_id"),
                "avgCpu": result.get("avg_cpu"),
                "avgMemory": result.get("avg_memory"),
                "idleHours": result.get("idle_hours"),
            }
            resp = requests.post(OPTIMIZATION_URL, json=payload, timeout=10)
            print(f"Triggered recommendation for {resource_id}: {resp.status_code}")
        except Exception as e:
            print(f"Failed to trigger recommendation for {resource_id}: {e}")

def main():
    print("Usage Analysis Service Started")
    # Run once on startup
    try:
        run_analysis()
    except Exception as e:
        print(f"Error during initial analysis: {e}")

    # Schedule to run every hour
    schedule.every(1).hours.do(run_analysis)

    while True:
        schedule.run_pending()
        time.sleep(60)

if __name__ == "__main__":
    main()
