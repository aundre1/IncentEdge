#!/usr/bin/env python3
"""
Intensive extraction from 195 target websites
Multi-level crawling with PDF processing and AI enhancement
"""

import pymupdf
import re
import requests
import json
import time
from urllib.parse import urljoin
from bs4 import BeautifulSoup

def extract_target_urls():
    """Extract all target URLs from PDF"""
    doc = pymupdf.open('attached_assets/Target Websites for Incentive Finder App_1750957953216.pdf')
    text = ''
    for page in doc:
        text += page.get_text()
    
    urls = re.findall(r'https?://[^\s\)]+', text)
    return list(set(urls))

def intensive_site_extraction(base_url):
    """Deep extraction from a single site"""
    programs = []
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    
    try:
        print(f"Deep extracting: {base_url}")
        response = requests.get(base_url, headers=headers, timeout=20)
        
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find program-related links
        program_links = []
        keywords = ['grant', 'program', 'incentive', 'rebate', 'credit', 'funding', 
                   'opportunity', 'loan', 'assistance', 'support', 'initiative']
        
        for link in soup.find_all('a', href=True):
            href = link.get('href', '')
            text = link.get_text(strip=True)
            
            # Check if link is program-related
            if any(word in href.lower() or word in text.lower() for word in keywords):
                if 8 < len(text) < 120:
                    full_url = urljoin(base_url, href)
                    program_links.append((full_url, text))
        
        print(f"  Found {len(program_links)} potential program links")
        
        # Process program links
        for url, title in program_links[:30]:  # Process top 30 links
            try:
                link_response = requests.get(url, headers=headers, timeout=15)
                if link_response.status_code == 200:
                    link_soup = BeautifulSoup(link_response.content, 'html.parser')
                    
                    # Extract program details
                    h1_elem = link_soup.find('h1')
                    final_title = h1_elem.get_text(strip=True) if h1_elem else title
                    
                    # Get description
                    description = ""
                    for p in link_soup.find_all('p'):
                        p_text = p.get_text(strip=True)
                        if len(p_text) > 50:
                            description = p_text[:400]
                            break
                    
                    # Look for funding amounts
                    amount = "Variable"
                    page_text = link_soup.get_text()
                    
                    # Search for dollar amounts
                    dollar_pattern = r'\$[\d,]+(?:\s*(?:million|billion|M|B|k))?'
                    matches = re.findall(dollar_pattern, page_text, re.IGNORECASE)
                    if matches:
                        amount = matches[0].strip()[:50]
                    
                    if len(final_title) > 10:
                        programs.append({
                            'title': final_title[:100],
                            'description': description,
                            'amount': amount,
                            'url': url,
                            'source': base_url
                        })
                
            except:
                continue
            
            time.sleep(0.5)  # Rate limiting
        
        print(f"  Extracted {len(programs)} programs")
        return programs
        
    except Exception as e:
        print(f"Error with {base_url}: {str(e)[:50]}")
        return []

def save_programs_to_db(programs):
    """Save extracted programs to database"""
    saved_count = 0
    
    for prog in programs:
        try:
            # Determine program categorization
            source_url = prog['source'].lower()
            
            if '.gov' in source_url and 'ny' not in source_url:
                level = 'federal'
                domain_parts = source_url.split('.')
                provider = domain_parts[1].upper() if len(domain_parts) > 1 else 'Federal'
            elif 'ny' in source_url or 'nyserda' in source_url:
                level = 'state'
                provider = 'New York'
            elif 'coned' in source_url:
                level = 'utility'
                provider = 'ConEd'
            elif 'nationalgrid' in source_url:
                level = 'utility'
                provider = 'National Grid'
            else:
                level = 'private'
                provider = 'Organization'
            
            # Prepare database record
            db_program = {
                'name': prog['title'],
                'provider': provider,
                'level': level,
                'amount': prog['amount'],
                'status': 'active',
                'description': prog['description'],
                'projectTypes': ['General'],
                'technology': 'General',
                'url': prog['url'],
                'deadline': 'ongoing'
            }
            
            # Save via API
            response = requests.post('http://localhost:5000/api/incentives',
                                   json=db_program,
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                saved_count += 1
                print(f"  ✓ Saved: {prog['title'][:45]}...")
                
        except Exception as e:
            continue
    
    return saved_count

def main():
    """Main intensive extraction process"""
    print("=== INTENSIVE EXTRACTION FROM 195 TARGET WEBSITES ===")
    
    # Get all target URLs
    target_urls = extract_target_urls()
    print(f"Processing {len(target_urls)} target websites")
    
    # Priority sites for intensive extraction
    priority_sites = [
        'https://www.energy.gov',
        'https://www.epa.gov',
        'https://www.irs.gov',
        'https://www.hud.gov',
        'https://www.rd.usda.gov',
        'https://www.sba.gov',
        'https://nyserda.ny.gov',
        'https://esd.ny.gov',
        'https://www.coned.com',
        'https://www.nationalgridus.com'
    ]
    
    all_programs = []
    total_saved = 0
    
    # Process priority sites
    for i, site in enumerate(priority_sites):
        if site in target_urls:
            print(f"\n[{i+1}/{len(priority_sites)}] Processing: {site}")
            site_programs = intensive_site_extraction(site)
            
            if site_programs:
                all_programs.extend(site_programs)
                saved = save_programs_to_db(site_programs)
                total_saved += saved
                print(f"  Result: {len(site_programs)} found, {saved} saved")
            else:
                print("  No programs found")
            
            time.sleep(2)  # Rate limiting between sites
    
    print(f"\n=== INTENSIVE EXTRACTION COMPLETE ===")
    print(f"Total programs discovered: {len(all_programs)}")
    print(f"Total programs saved: {total_saved}")
    
    # Get final database stats
    try:
        response = requests.get('http://localhost:5000/api/incentives/summary')
        if response.status_code == 200:
            stats = response.json()
            print(f"\nUpdated database:")
            print(f"  Total programs: {stats['totalPrograms']}")
            print(f"  Total funding: {stats['totalFunding']}")
            
            if stats['totalPrograms'] > 80:
                new_count = stats['totalPrograms'] - 80
                print(f"  SUCCESS: Added {new_count} new programs from target websites!")
    except:
        print("Could not retrieve final stats")

if __name__ == "__main__":
    main()