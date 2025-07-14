#!/usr/bin/env python3
import os
import sys
import requests
import json

def test_openai_and_scrape():
    # Test OpenAI connection
    sys.path.append('scraper')
    from core.ai_agent import AIAgent
    
    print("Testing OpenAI API connection...")
    agent = AIAgent()
    
    test_text = """
    Federal Clean Energy Tax Credit
    30% tax credit for solar installations
    Available through 2032
    Residential and commercial properties eligible
    Maximum credit: 30% of qualified expenditures
    """
    
    result = agent.extract_fields(test_text)
    print(f"API Test Result: {result}")
    
    if result.get('title', 'N/A') != 'N/A' and 'Clean Energy' in str(result.get('title', '')):
        print("✅ OpenAI API working! Starting comprehensive government data scraping...")
        
        # Trigger multiple scraping jobs for comprehensive data collection
        sources_to_scrape = [
            ["irs_clean_energy", "irs_inflation_act"],
            ["nyserda", "doe"],
            ["hud", "epa_greenhouse", "cdfi"],
            ["dsire"]
        ]
        
        job_ids = []
        for source_group in sources_to_scrape:
            try:
                response = requests.post('http://localhost:5000/api/scraper/trigger', 
                                       json={"sources": source_group, "immediate": True},
                                       timeout=30)
                if response.status_code == 200:
                    job_data = response.json()
                    job_ids.append(job_data.get('jobId'))
                    print(f"Started scraping job {job_data.get('jobId')} for sources: {', '.join(source_group)}")
                else:
                    print(f"Failed to start scraping for {source_group}: {response.status_code}")
            except Exception as e:
                print(f"Error starting scraping for {source_group}: {e}")
        
        print(f"\nStarted {len(job_ids)} scraping jobs. Monitoring progress...")
        
        # Check summary after jobs complete
        import time
        time.sleep(10)
        
        try:
            summary_response = requests.get('http://localhost:5000/api/incentives/summary')
            if summary_response.status_code == 200:
                summary = summary_response.json()
                print(f"\nDatabase Status:")
                print(f"Total Programs: {summary.get('totalPrograms', 0)}")
                print(f"Total Funding: {summary.get('totalFunding', 'N/A')}")
                print(f"Program Distribution: {summary.get('programDistribution', {})}")
        except Exception as e:
            print(f"Could not fetch updated summary: {e}")
            
    else:
        print("❌ OpenAI API not working properly. Please check your API key and billing status.")
        print("Visit https://platform.openai.com/account/billing to verify your account setup.")

if __name__ == "__main__":
    test_openai_and_scrape()