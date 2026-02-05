from pymongo import MongoClient
import pandas as pd
import os

class DataLoader:
    def __init__(self):
        self.mongo_uri = os.getenv('MONGO_URI', 'mongodb://mongodb:27017/')
        self.client = MongoClient(self.mongo_uri)
        self.db = self.client['cloud_optimizer']
        self.collection = self.db['metrics']

    def load_metrics(self, resource_id=None):
        query = {}
        if resource_id:
            query['resourceId'] = resource_id
        
        cursor = self.collection.find(query)
        df = pd.DataFrame(list(cursor))
        
        if not df.empty and '_id' in df.columns:
            df = df.drop(columns=['_id'])
            
        return df
