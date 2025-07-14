#!/usr/bin/env python3
"""
Batch scraping system for target websites
Processes priority government sites to expand IncentEdge database
"""

import os
import sys
import requests
import json
from pathlib import Path

def get_available_configs():
    """Get list of available enhanced configs"""
    config_dir = Path('scraper/configs_enhanced')
    if not config_dir.exists():
        return []
    
    configs = []
    for yaml_file in config_dir.glob('*.yaml'):
        configs.append(yaml_file.stem)
    
    return configs

def trigger_scraping_job(config_name):
    """Trigger a scraping job via API"""
    api_url = "http://localhost:5000/api/scraper/jobs"
    
    payload = {
        "sources": [config_name],
        "immediate": True
    }
    
    try:
        response = requests.post(api_url, json=payload)
        if response.status_code == 200:
            job_data = response.json()
            print(f"✓ Started scraping job for {config_name}: Job ID {job_data.get('id', 'unknown')}")
            return job_data
        else:
            print(f"✗ Failed to start job for {config_name}: {response.status_code}")
            return None
    except Exception as e:
        print(f"✗ Error starting job for {config_name}: {e}")
        return None

def check_job_status(job_id):
    """Check status of a scraping job"""
    try:
        response = requests.get(f"http://localhost:5000/api/scraper/jobs/{job_id}")
        if response.status_code == 200:
            return response.json()
        return None
    except:
        return None

def wait_for_completion(job_ids, timeout=300):
    """Wait for jobs to complete"""
    import time
    start_time = time.time()
    completed = []
    
    print(f"Monitoring {len(job_ids)} jobs...")
    
    while len(completed) < len(job_ids) and (time.time() - start_time) < timeout:
        for job_id in job_ids:
            if job_id not in completed:
                status = check_job_status(job_id)
                if status and status.get('status') in ['completed', 'failed']:
                    completed.append(job_id)
                    print(f"✓ Job {job_id} {status.get('status')}: {status.get('recordsImported', 0)} records")
        
        time.sleep(10)  # Check every 10 seconds
    
    return completed

def main():
    """Main batch scraping function"""
    print("=== BATCH SCRAPING TARGET WEBSITES ===")
    
    # Get available configs
    configs = get_available_configs()
    print(f"Found {len(configs)} enhanced configurations")
    
    if not configs:
        print("No enhanced configs found. Creating them first...")
        return
    
    # Priority order for scraping
    priority_configs = [
        'energy_www_energy_gov',
        'epa_www_epa_gov', 
        'irs_www_irs_gov',
        'hud_www_hud_gov',
        'usda_www_rd_usda_gov',
        'sba_www_sba_gov',
        'nyserda_nyserda_ny_gov',
        'esd_esd_ny_gov'
    ]
    
    # Filter to available configs
    available_priority = [c for c in priority_configs if c in configs]
    
    print(f"Starting batch scraping of {len(available_priority)} priority sites...")
    
    # Start all jobs
    job_ids = []
    for config in available_priority:
        job = trigger_scraping_job(config)
        if job:
            job_ids.append(job.get('id'))
    
    if not job_ids:
        print("No jobs started successfully")
        return
    
    print(f"Started {len(job_ids)} scraping jobs")
    
    # Wait for completion
    completed = wait_for_completion(job_ids)
    
    print(f"\n=== BATCH SCRAPING COMPLETE ===")
    print(f"Jobs completed: {len(completed)}/{len(job_ids)}")
    
    # Get final summary
    try:
        response = requests.get("http://localhost:5000/api/incentives/summary")
        if response.status_code == 200:
            summary = response.json()
            print(f"Total programs now: {summary.get('totalPrograms', 'unknown')}")
            print(f"Total funding: {summary.get('totalFunding', 'unknown')}")
    except:
        print("Could not fetch updated summary")

if __name__ == "__main__":
    main()