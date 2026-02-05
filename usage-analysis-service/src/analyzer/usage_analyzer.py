import pandas as pd
import numpy as np

class UsageAnalyzer:
    def analyze_usage(self, df):
        if df.empty:
            return None
        
        analysis_result = {
            'resource_id': df['resourceId'].iloc[0],
            'avg_cpu': df['cpu'].mean(),
            'max_cpu': df['cpu'].max(),
            'avg_memory': df['memory'].mean(),
            'max_memory': df['memory'].max(),
            'avg_disk': df['disk'].mean(),
            'idle_hours': self.calculate_idle_hours(df)
        }
        return analysis_result

    def calculate_idle_hours(self, df):
        # Assuming 1 row per hour or we resample. 
        # Simple logic: if cpu < 5% it's idle.
        if 'cpu' not in df.columns:
            return 0
        idle_rows = df[df['cpu'] < 5.0]
        # This is a simplification. In real world we'd use timestamps.
        return len(idle_rows) # Assuming 1 metric = 1 unit of time (e.g. 5 mins or 1 hour)
