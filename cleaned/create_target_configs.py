#!/usr/bin/env python3
"""
Create YAML configurations for target websites from PDF
Generates comprehensive scraping configs for IncentEdge expansion
"""

import pymupdf
import re
import yaml
import os
from urllib.parse import urlparse

def extract_websites_from_pdf():
    """Extract all websites from the target PDF"""
    doc = pymupdf.open('attached_assets/Target Websites for Incentive Finder App_1750957953216.pdf')
    text = ''
    for page in doc:
        text += page.get_text()
    
    # Extract URLs
    urls = re.findall(r'https?://[^\s\)]+', text)
    urls = list(set(urls))  # Remove duplicates
    
    return sorted(urls)

def categorize_website(url):
    """Categorize website by type and level"""
    url_lower = url.lower()
    domain = urlparse(url).netloc.lower()
    
    # Federal government sites
    if any(x in url_lower for x in ['.gov']) and not any(x in url_lower for x in ['ny.gov', 'nyc.gov', 'sf.gov', 'boston.gov']):
        if any(x in domain for x in ['energy.gov', 'doe.gov']):
            return 'federal', 'Department of Energy', 'doe_enhanced'
        elif any(x in domain for x in ['epa.gov']):
            return 'federal', 'EPA', 'epa_enhanced'
        elif any(x in domain for x in ['irs.gov']):
            return 'federal', 'IRS', 'irs_enhanced'
        elif any(x in domain for x in ['hud.gov']):
            return 'federal', 'HUD', 'hud_enhanced'
        elif any(x in domain for x in ['usda.gov', 'rd.usda.gov']):
            return 'federal', 'USDA', 'usda_enhanced'
        elif any(x in domain for x in ['sba.gov']):
            return 'federal', 'SBA', 'sba_enhanced'
        else:
            return 'federal', 'Federal Agency', 'federal_general'
    
    # State and regional sites
    elif any(x in url_lower for x in ['ny.gov', 'nyserda', 'dsire']):
        if 'nyserda' in domain:
            return 'state', 'NYSERDA', 'nyserda_enhanced'
        elif 'dsire' in domain:
            return 'state', 'DSIRE', 'dsire_enhanced'
        else:
            return 'state', 'New York State', 'nys_enhanced'
    
    # Utility companies
    elif any(x in domain for x in ['coned.com', 'nationalgrid', 'pseg.com', 'lipower.org']):
        return 'utility', 'Utility Company', 'utility_enhanced'
    
    # Research institutions
    elif any(x in domain for x in ['nrel.gov', 'lbl.gov', 'mit.edu', 'stanford.edu', 'berkeley.edu']):
        return 'research', 'Research Institution', 'research_enhanced'
    
    # Foundations
    elif any(x in domain for x in ['foundation', 'kresge.org', 'fordfoundation.org', 'macfound.org', 'bloomberg.org']):
        return 'foundation', 'Foundation', 'foundation_enhanced'
    
    # Private organizations
    else:
        return 'private', 'Private Organization', 'private_enhanced'

def create_yaml_config(url, level, provider, config_name):
    """Create YAML configuration for a website"""
    domain = urlparse(url).netloc
    
    config = {
        'name': f"{provider} Programs",
        'base_url': url,
        'level': level,
        'provider': provider,
        'selectors': {
            'program_links': [
                'a[href*="program"]',
                'a[href*="grant"]',
                'a[href*="incentive"]',
                'a[href*="rebate"]',
                'a[href*="credit"]',
                'a[href*="funding"]',
                'a[href*="opportunity"]',
                '.program-link',
                '.grant-link',
                '.incentive-item'
            ],
            'program_title': [
                'h1',
                'h2',
                '.program-title',
                '.grant-title',
                '.page-title',
                'title'
            ],
            'description': [
                '.program-description',
                '.description',
                '.summary',
                'p:first-of-type',
                '.content p:first-child'
            ],
            'amount': [
                '.amount',
                '.funding-amount',
                '.grant-amount',
                '.incentive-amount',
                '*[class*="amount"]',
                '*[class*="funding"]',
                '*[class*="dollar"]'
            ],
            'deadline': [
                '.deadline',
                '.due-date',
                '.application-deadline',
                '*[class*="deadline"]',
                '*[class*="due"]'
            ],
            'eligibility': [
                '.eligibility',
                '.requirements',
                '.criteria',
                '*[class*="eligible"]',
                '*[class*="requirement"]'
            ]
        },
        'pdf_detection': {
            'enabled': True,
            'selectors': [
                'a[href$=".pdf"]',
                'a[href*=".pdf"]',
                '.pdf-link'
            ]
        },
        'request_settings': {
            'delay': 2,
            'timeout': 30,
            'headers': {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }
    }
    
    return config

def main():
    """Main function to create all YAML configs"""
    print("Extracting websites from PDF...")
    websites = extract_websites_from_pdf()
    
    print(f"Found {len(websites)} unique websites")
    print("Creating YAML configurations...")
    
    # Create configs directory if it doesn't exist
    os.makedirs('scraper/configs_enhanced', exist_ok=True)
    
    created_configs = []
    
    for url in websites:
        try:
            level, provider, config_name = categorize_website(url)
            config = create_yaml_config(url, level, provider, config_name)
            
            # Create filename
            domain = urlparse(url).netloc.replace('.', '_').replace('-', '_')
            filename = f"{config_name}_{domain}.yaml"
            filepath = f"scraper/configs_enhanced/{filename}"
            
            # Write YAML file
            with open(filepath, 'w') as f:
                yaml.dump(config, f, default_flow_style=False, sort_keys=False)
            
            created_configs.append({
                'file': filename,
                'url': url,
                'provider': provider,
                'level': level
            })
            
        except Exception as e:
            print(f"Error processing {url}: {e}")
            continue
    
    print(f"\n=== YAML CONFIGS CREATED ===")
    print(f"Total configs: {len(created_configs)}")
    
    # Summary by level
    levels = {}
    for config in created_configs:
        level = config['level']
        levels[level] = levels.get(level, 0) + 1
    
    for level, count in levels.items():
        print(f"{level.upper()}: {count} configs")
    
    print("\n=== READY FOR SCRAPING ===")
    print("Configs saved to: scraper/configs_enhanced/")
    print("Run scraper with: python scraper/main.py")
    
    return created_configs

if __name__ == "__main__":
    main()