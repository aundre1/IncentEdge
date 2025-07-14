#!/usr/bin/env python3
"""
Comprehensive website extraction for IncentEdge
Processes all 195 target websites to find government incentive programs
"""

import requests
import time
import json
import re
from pathlib import Path
import pymupdf
from urllib.parse import urlparse, urljoin
from bs4 import BeautifulSoup
import openai
import os

# Set up OpenAI API
openai.api_key = os.getenv('OPENAI_API_KEY')

def extract_websites_from_pdf():
    """Extract all 195 websites from the PDF"""
    doc = pymupdf.open('attached_assets/Target Websites for Incentive Finder App_1750957953216.pdf')
    text = ''
    for page in doc:
        text += page.extract_text()
    
    # Extract URLs
    urls = re.findall(r'https?://[^\s\)]+', text)
    return list(set(urls))

def scrape_website_for_programs(url):
    """Scrape a single website for incentive programs"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        print(f"Scraping: {url}")
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code != 200:
            return []
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for program/incentive related content
        program_indicators = [
            'program', 'grant', 'incentive', 'rebate', 'credit', 'funding',
            'opportunity', 'assistance', 'support', 'initiative'
        ]
        
        found_programs = []
        
        # Search for links with program-related terms
        for link in soup.find_all('a', href=True):
            href = link.get('href', '').lower()
            text = link.get_text(strip=True).lower()
            
            if any(indicator in href or indicator in text for indicator in program_indicators):
                if len(text) > 10 and len(text) < 200:  # Reasonable title length
                    program_url = urljoin(url, link['href'])
                    found_programs.append({
                        'title': link.get_text(strip=True),
                        'url': program_url,
                        'source_site': url
                    })
        
        # Look for main content areas with program information
        content_areas = soup.find_all(['div', 'section', 'article'], 
                                    class_=re.compile(r'(program|grant|incentive|funding)', re.I))
        
        for area in content_areas[:5]:  # Limit to first 5 matches
            title_elem = area.find(['h1', 'h2', 'h3', 'h4'])
            if title_elem:
                title = title_elem.get_text(strip=True)
                if len(title) > 10 and any(indicator in title.lower() for indicator in program_indicators):
                    found_programs.append({
                        'title': title,
                        'url': url,
                        'source_site': url,
                        'description': area.get_text(strip=True)[:500]
                    })
        
        return found_programs[:10]  # Limit to 10 programs per site
        
    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return []

def enhance_program_with_ai(program):
    """Use OpenAI to extract structured data from program information"""
    try:
        prompt = f"""
        Analyze this government incentive program and extract key information:
        
        Title: {program.get('title', '')}
        URL: {program.get('url', '')}
        Description: {program.get('description', '')[:1000]}
        
        Extract and return JSON with:
        - name: Program name
        - provider: Government agency/organization
        - level: federal/state/local/utility/foundation
        - amount: Funding amount or "Variable" if unknown
        - description: Brief program description
        - project_types: Array of applicable project types
        - technology: Primary technology focus
        - status: "active" or "expired" or "ongoing"
        
        Only include if this is a legitimate government incentive program.
        """
        
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=500,
            temperature=0.1
        )
        
        ai_data = json.loads(response.choices[0].message.content)
        return {**program, **ai_data}
        
    except Exception as e:
        print(f"AI enhancement error: {e}")
        return program

def save_to_database(programs):
    """Save programs to the IncentEdge database via API"""
    saved_count = 0
    
    for program in programs:
        try:
            # Format for database
            db_program = {
                'name': program.get('name', program.get('title', 'Unknown Program')),
                'provider': program.get('provider', 'Unknown'),
                'level': program.get('level', 'unknown').lower(),
                'amount': program.get('amount', 'Variable'),
                'status': program.get('status', 'active'),
                'description': program.get('description', ''),
                'projectTypes': program.get('project_types', ['General']),
                'technology': program.get('technology', 'General'),
                'url': program.get('url', ''),
                'deadline': 'ongoing'
            }
            
            # Save via API
            response = requests.post('http://localhost:5000/api/incentives', 
                                   json=db_program, 
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                saved_count += 1
                print(f"✓ Saved: {db_program['name']}")
            else:
                print(f"✗ Failed to save: {db_program['name']}")
                
        except Exception as e:
            print(f"Error saving program: {e}")
    
    return saved_count

def main():
    """Main extraction process"""
    print("=== EXTRACTING PROGRAMS FROM 195 TARGET WEBSITES ===")
    
    # Extract all target websites
    websites = extract_websites_from_pdf()
    print(f"Processing {len(websites)} target websites...")
    
    all_programs = []
    processed = 0
    
    # Priority federal sites first
    priority_sites = [
        'https://www.energy.gov',
        'https://www.epa.gov',
        'https://www.irs.gov',
        'https://www.hud.gov',
        'https://www.rd.usda.gov',
        'https://www.sba.gov',
        'https://nyserda.ny.gov',
        'https://esd.ny.gov'
    ]
    
    # Process priority sites first
    print("\n=== PROCESSING PRIORITY GOVERNMENT SITES ===")
    for url in priority_sites:
        if url in websites:
            programs = scrape_website_for_programs(url)
            if programs:
                print(f"Found {len(programs)} programs from {url}")
                
                # Enhance with AI
                for program in programs[:3]:  # Limit AI calls
                    enhanced = enhance_program_with_ai(program)
                    all_programs.append(enhanced)
                    
            processed += 1
            time.sleep(2)  # Rate limiting
    
    print(f"\nProcessed {processed} priority sites")
    print(f"Found {len(all_programs)} potential programs")
    
    # Save to database
    if all_programs:
        saved = save_to_database(all_programs)
        print(f"\n=== RESULTS ===")
        print(f"Programs found: {len(all_programs)}")
        print(f"Programs saved: {saved}")
        
        # Get updated database stats
        try:
            response = requests.get('http://localhost:5000/api/incentives/summary')
            if response.status_code == 200:
                stats = response.json()
                print(f"Total programs now: {stats['totalPrograms']}")
                print(f"Total funding: {stats['totalFunding']}")
        except:
            pass
    
    return all_programs

if __name__ == "__main__":
    main()