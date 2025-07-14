#!/usr/bin/env python3
"""
Government Incentive Program Scraper
Integrates with IncentEdge Node.js application
Based on your existing AI-enhanced scraper
"""

import argparse
import json
import sys
import logging
import os
import pandas as pd
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any, Optional
# Add current directory to Python path for module imports
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.insert(0, current_dir)
sys.path.insert(0, parent_dir)

from scraper.core.scraper import DynamicScraper

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scraper.log'),
        logging.StreamHandler(sys.stderr)
    ]
)
logger = logging.getLogger(__name__)

def get_config_files_for_sources(sources: List[str]) -> List[str]:
    """Map source names to YAML config files"""
    config_mapping = {
        'federal': ['irs.yaml', 'doe.yaml', 'doe_buildings.yaml', 'cdfi.yaml', 'epa_greenhouse.yaml', 'hud.yaml', 'irs_clean_energy.yaml', 'irs_home_improvement.yaml', 'irs_inflation_act.yaml'],
        'state': ['nyserda.yaml', 'california_energy.yaml', 'texas_seco.yaml', 'esd_ny.yaml'],
        'local': ['nyc.yaml'],
        'utility': ['utility_pge.yaml']
    }
    
    config_files = []
    for source in sources:
        if source in config_mapping:
            config_files.extend(config_mapping[source])
    
    return config_files

def main():
    parser = argparse.ArgumentParser(description='Scrape government incentive data using your existing AI-enhanced scraper')
    parser.add_argument('--job-id', type=int, required=True, help='Scraper job ID')
    parser.add_argument('--sources', required=True, help='Comma-separated list of sources to scrape')
    parser.add_argument('--output-format', default='json', choices=['json', 'csv'], help='Output format')
    parser.add_argument('--config', type=str, help='JSON configuration string')
    
    args = parser.parse_args()
    
    # Parse configuration
    config = {}
    if args.config:
        try:
            config = json.loads(args.config)
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON configuration: {e}")
            sys.exit(1)
    
    # Parse sources and get corresponding config files
    sources = [s.strip().lower() for s in args.sources.split(',')]
    config_files = get_config_files_for_sources(sources)
    
    logger.info(f"Starting scraper job {args.job_id} for sources: {sources}")
    logger.info(f"Using config files: {config_files}")
    
    # Collect all results from running your existing scraper
    all_results = []
    
    # Use your existing scraper architecture
    config_folder = Path("scraper/configs")
    
    for config_file in config_files:
        config_path = config_folder / config_file
        
        if not config_path.exists():
            logger.warning(f"Config file not found: {config_path}")
            continue
            
        try:
            logger.info(f"Running scraper with config: {config_file}")
            
            # Initialize your DynamicScraper
            scraper = DynamicScraper(config_name=config_file, output_path=None)
            results = scraper.run()
            
            if results:
                all_results.extend(results)
                logger.info(f"Found {len(results)} incentives from {config_file}")
            else:
                logger.warning(f"No data found for {config_file}")
            
            if scraper.results:
                # Transform your results to match IncentEdge format
                for result in scraper.results:
                    transformed_result = {
                        'name': result.get('title', 'N/A'),
                        'provider': extract_provider_from_url(result.get('url', '')),
                        'level': infer_level_from_source(config_file),
                        'amount': result.get('funding_amount', 'N/A'),
                        'deadline': result.get('deadline', 'N/A'),
                        'description': f"Scraped from {result.get('source_type', 'web')} source",
                        'projectTypes': [result.get('program_type', 'General')],
                        'requirements': [result.get('eligibility', 'See program details')],
                        'contactInfo': None,
                        'applicationUrl': result.get('url'),
                        'sourceUrl': result.get('url'),
                        'source': infer_level_from_source(config_file).lower(),
                        'sourceType': result.get('source_type', 'HTML'),
                        'language': result.get('language', 'en'),
                        'scrapedAt': datetime.now().isoformat()
                    }
                    all_results.append(transformed_result)
                
                logger.info(f"Scraped {len(scraper.results)} results from {config_file}")
            else:
                logger.warning(f"No results from {config_file}")
                
        except Exception as e:
            logger.error(f"Error running scraper with {config_file}: {e}")
            continue
    
    # Output results for Node.js processing
    output_data = {
        "job_id": args.job_id,
        "total_records": len(all_results),
        "data": all_results,
        "status": "completed"
    }
    
    if args.output_format == 'json':
        # Output JSON to stdout for Node.js to capture
        print(json.dumps(output_data))
    else:
        # Save as CSV and also output JSON
        df = pd.DataFrame(all_results)
        output_path = f"scraper_job_{args.job_id}_results.csv"
        df.to_csv(output_path, index=False, encoding="utf-8-sig")
        logger.info(f"Results saved to {output_path}")
        print(json.dumps(output_data))
        
    logger.info(f"Scraping completed. Total incentives found: {len(all_results)}")

def extract_provider_from_url(url: str) -> str:
    """Extract provider name from URL"""
    if not url:
        return "Unknown Provider"
    
    if "irs.gov" in url:
        return "IRS"
    elif "doe.gov" in url or "energy.gov" in url:
        return "Department of Energy"
    elif "epa.gov" in url:
        return "EPA"
    elif "nyserda.ny.gov" in url:
        return "NYSERDA"
    elif "nyc.gov" in url:
        return "NYC"
    elif "coned.com" in url:
        return "Con Edison"
    else:
        return "Government Agency"

def infer_level_from_source(config_file: str) -> str:
    """Infer government level from config file name"""
    filename = config_file.lower()
    
    if any(x in filename for x in ['irs', 'doe', 'epa', 'federal']):
        return "Federal"
    elif any(x in filename for x in ['nyserda', 'nys', 'state']):
        return "State"  
    elif any(x in filename for x in ['nyc', 'westchester', 'local']):
        return "Local"
    elif any(x in filename for x in ['coned', 'nyseg', 'utility']):
        return "Utility"
    else:
        return "Government"

if __name__ == '__main__':
    main()