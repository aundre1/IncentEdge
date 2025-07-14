#!/usr/bin/env python3
"""
IncentEdge Database Scaling Script
Automated expansion from 32 to 200+ programs using GPT-3.5-turbo
"""

import requests
import time
import json
from datetime import datetime

class IncentEdgeScaler:
    def __init__(self):
        self.base_url = "http://localhost:5000"
        self.batch_sources = [
            ["nyserda", "doe"],
            ["irs_clean_energy", "irs_inflation_act"], 
            ["epa_greenhouse", "hud"],
            ["dsire", "cdfi"],
            ["utility_pge", "doe_buildings"]
        ]
        
    def trigger_scraping_batch(self, sources):
        """Trigger scraping for a batch of sources"""
        print(f"🚀 Starting scraping batch: {', '.join(sources)}")
        
        response = requests.post(f"{self.base_url}/api/scraper/trigger", json={
            'sources': sources,
            'immediate': True
        })
        
        if response.status_code == 200:
            job_data = response.json()
            job_id = job_data.get('jobId')
            print(f"✓ Job {job_id} started for sources: {', '.join(sources)}")
            return job_id
        else:
            print(f"✗ Failed to start job for {sources}: {response.status_code}")
            return None
    
    def monitor_job(self, job_id, timeout=300):
        """Monitor job completion"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            try:
                response = requests.get(f"{self.base_url}/api/scraper/jobs/{job_id}")
                if response.status_code == 200:
                    job = response.json()
                    status = job.get('status')
                    records = job.get('recordsImported', 0)
                    
                    if status == 'completed':
                        print(f"✓ Job {job_id} completed - {records} records imported")
                        return records
                    elif status == 'failed':
                        print(f"✗ Job {job_id} failed")
                        return 0
                        
                time.sleep(10)
            except Exception as e:
                print(f"⚠ Error monitoring job {job_id}: {str(e)}")
                time.sleep(10)
                continue
            
        print(f"⏰ Job {job_id} timed out")
        return 0
    
    def get_current_stats(self):
        """Get current database statistics"""
        response = requests.get(f"{self.base_url}/api/incentives/summary")
        if response.status_code == 200:
            return response.json()
        return None
    
    def run_expansion(self):
        """Execute the complete database expansion"""
        print("🎯 IncentEdge Database Expansion Started")
        print("=" * 50)
        
        # Get baseline stats
        initial_stats = self.get_current_stats()
        if initial_stats:
            print(f"Starting with {initial_stats['totalPrograms']} programs")
            print(f"Current funding tracked: {initial_stats['totalFunding']}")
        
        total_new_records = 0
        
        # Process each batch
        for i, sources in enumerate(self.batch_sources, 1):
            print(f"\n📊 Batch {i}/{len(self.batch_sources)}")
            
            job_id = self.trigger_scraping_batch(sources)
            if job_id:
                records = self.monitor_job(job_id)
                total_new_records += records
                
                # Brief pause between batches
                if i < len(self.batch_sources):
                    print("⏳ Waiting 30 seconds before next batch...")
                    time.sleep(30)
        
        # Final statistics
        print("\n" + "=" * 50)
        print("📈 EXPANSION COMPLETE")
        
        final_stats = self.get_current_stats()
        if final_stats:
            print(f"Final program count: {final_stats['totalPrograms']}")
            print(f"Total funding tracked: {final_stats['totalFunding']}")
            
            if initial_stats:
                growth = final_stats['totalPrograms'] - initial_stats['totalPrograms'] 
                print(f"Programs added: {growth}")
                print(f"Growth rate: {(growth/initial_stats['totalPrograms']*100):.1f}%")
        
        print(f"Total scraped records: {total_new_records}")
        print("🎉 IncentEdge ready for institutional investors!")

if __name__ == "__main__":
    scaler = IncentEdgeScaler()
    scaler.run_expansion()