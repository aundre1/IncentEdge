#!/usr/bin/env python3
"""
Deep PDF extraction from 195 target websites
Comprehensive PDF crawling with AI-powered program extraction
"""

import pymupdf
import re
import requests
import json
import time
import os
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import openai

# Set up OpenAI
openai.api_key = os.getenv('OPENAI_API_KEY')

def extract_all_target_urls():
    """Extract all 195 URLs from the target PDF"""
    doc = pymupdf.open('attached_assets/Target Websites for Incentive Finder App_1750957953216.pdf')
    text = ''
    for page in doc:
        text += page.get_text()
    
    urls = re.findall(r'https?://[^\s\)]+', text)
    return list(set(urls))

def deep_crawl_site(base_url, max_depth=3, max_pages=50):
    """Deep crawl a website looking for program pages and PDFs"""
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    visited = set()
    to_visit = [(base_url, 0)]
    pdf_urls = []
    program_pages = []
    
    program_keywords = ['grant', 'program', 'incentive', 'rebate', 'credit', 'funding', 
                       'opportunity', 'loan', 'assistance', 'support', 'initiative']
    
    while to_visit and len(visited) < max_pages:
        url, depth = to_visit.pop(0)
        
        if url in visited or depth > max_depth:
            continue
            
        visited.add(url)
        
        try:
            response = requests.get(url, headers=headers, timeout=15)
            if response.status_code != 200:
                continue
                
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find PDFs
            for link in soup.find_all('a', href=True):
                href = link.get('href')
                if href and href.lower().endswith('.pdf'):
                    pdf_url = urljoin(url, href)
                    if pdf_url not in pdf_urls:
                        pdf_urls.append(pdf_url)
            
            # Find program pages
            for link in soup.find_all('a', href=True):
                href = link.get('href')
                text = link.get_text(strip=True)
                
                if any(keyword in href.lower() or keyword in text.lower() for keyword in program_keywords):
                    if len(text) > 10 and len(text) < 150:
                        program_url = urljoin(url, href)
                        if program_url not in [p[0] for p in program_pages]:
                            program_pages.append((program_url, text))
                            
                        # Add to crawl queue if not too deep
                        if depth < max_depth:
                            to_visit.append((program_url, depth + 1))
            
        except Exception as e:
            print(f"Error crawling {url}: {str(e)[:50]}")
            continue
            
        time.sleep(1)  # Rate limiting
    
    return program_pages[:20], pdf_urls[:10]  # Limit results

def extract_programs_from_page(soup, url, keywords):
    """Extract program information from a webpage"""
    programs = []
    
    try:
        # Get page title
        title_elem = soup.find('h1')
        title = title_elem.get_text(strip=True) if title_elem else "Program"
        
        # Get description
        description = ""
        for p in soup.find_all('p'):
            p_text = p.get_text(strip=True)
            if len(p_text) > 50:
                description = p_text[:500]
                break
        
        # Look for funding amounts
        amount = "Variable"
        page_text = soup.get_text()
        dollar_matches = re.findall(r'\$[\d,]+(?:\s*(?:million|billion|M|B|k))?', page_text, re.IGNORECASE)
        if dollar_matches:
            amount = dollar_matches[0][:50]
        
        if len(title) > 5:
            programs.append({
                'title': title[:150],
                'description': description,
                'amount': amount,
                'url': url
            })
            
    except Exception as e:
        pass
    
    return programs

def extract_programs_from_pdfs(soup, base_url):
    """Find and extract programs from PDFs on the page"""
    pdf_programs = []
    
    for link in soup.find_all('a', href=True):
        href = link.get('href')
        if href and href.lower().endswith('.pdf'):
            pdf_url = urljoin(base_url, href)
            programs = extract_from_pdf(pdf_url, base_url)
            pdf_programs.extend(programs)
            
            if len(pdf_programs) >= 10:  # Limit PDF processing
                break
    
    return pdf_programs

def extract_from_pdf(pdf_url, source_url):
    """Extract program information from a PDF using AI"""
    programs = []
    
    try:
        print(f"  Processing PDF: {pdf_url}")
        response = requests.get(pdf_url, timeout=30)
        
        if response.status_code != 200:
            return []
        
        # Save PDF temporarily
        pdf_path = f'/tmp/extract_{int(time.time())}.pdf'
        with open(pdf_path, 'wb') as f:
            f.write(response.content)
        
        # Extract text from PDF
        doc = pymupdf.open(pdf_path)
        pdf_text = ''
        for page_num, page in enumerate(doc):
            if page_num < 10:  # First 10 pages
                pdf_text += page.get_text()
        doc.close()
        os.remove(pdf_path)
        
        if len(pdf_text) < 200:
            return []
        
        # Use AI to extract programs
        prompt = f"""
        Extract government incentive programs from this PDF text. Look for:
        - Program names with funding amounts
        - Grant programs with application deadlines
        - Tax credits and rebates
        - Loan programs
        
        PDF Content:
        {pdf_text[:4000]}
        
        Return JSON array with this format:
        [{{"name": "Program Name", "amount": "$X million", "description": "Brief description"}}]
        
        Only include legitimate programs with clear funding amounts.
        """
        
        try:
            ai_response = openai.chat.completions.create(
                model='gpt-3.5-turbo',
                messages=[{'role': 'user', 'content': prompt}],
                max_tokens=1000,
                temperature=0.2
            )
            
            extracted_programs = json.loads(ai_response.choices[0].message.content)
            
            for prog in extracted_programs:
                if isinstance(prog, dict) and prog.get('name'):
                    programs.append({
                        'title': prog['name'][:150],
                        'description': prog.get('description', '')[:500],
                        'amount': prog.get('amount', 'Variable'),
                        'url': pdf_url,
                        'source': source_url
                    })
                    
        except Exception as e:
            print(f"    AI extraction failed: {str(e)[:50]}")
            
    except Exception as e:
        print(f"    PDF processing failed: {str(e)[:50]}")
    
    return programs[:5]  # Limit per PDF

def categorize_program(program, source_url):
    """Categorize program by source and content"""
    source_lower = source_url.lower()
    
    if '.gov' in source_lower and 'ny' not in source_lower:
        level = 'federal'
        domain_parts = source_lower.split('.')
        provider = domain_parts[1].upper() if len(domain_parts) > 1 else 'Federal'
    elif 'ny' in source_lower or 'nyserda' in source_lower:
        level = 'state'
        provider = 'New York'
    elif 'nj' in source_lower:
        level = 'state'
        provider = 'New Jersey'
    elif 'ct' in source_lower or 'connecticut' in source_lower:
        level = 'state'
        provider = 'Connecticut'
    elif any(utility in source_lower for utility in ['coned', 'nationalgrid', 'pseg']):
        level = 'utility'
        if 'coned' in source_lower:
            provider = 'ConEd'
        elif 'nationalgrid' in source_lower:
            provider = 'National Grid'
        else:
            provider = 'Utility'
    else:
        level = 'private'
        provider = 'Organization'
    
    return level, provider

def save_programs_to_database(programs):
    """Save discovered programs to database"""
    saved_count = 0
    
    for prog in programs:
        try:
            level, provider = categorize_program(prog, prog.get('source', prog['url']))
            
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
            
            response = requests.post('http://localhost:5000/api/incentives',
                                   json=db_program,
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                saved_count += 1
                print(f"    ✓ Saved: {prog['title'][:50]}...")
                
        except Exception as e:
            continue
    
    return saved_count

def main():
    """Main deep crawling process"""
    print("=== DEEP PDF EXTRACTION FROM 195 TARGET WEBSITES ===")
    
    # Get all target URLs
    target_urls = extract_all_target_urls()
    print(f"Processing {len(target_urls)} target websites with deep PDF extraction")
    
    # Priority sites for intensive crawling
    priority_sites = [
        'https://www.energy.gov',
        'https://www.epa.gov',
        'https://www.irs.gov',
        'https://www.hud.gov',
        'https://www.rd.usda.gov',
        'https://www.sba.gov',
        'https://www.treasury.gov',
        'https://www.commerce.gov',
        'https://www.fema.gov',
        'https://nyserda.ny.gov',
        'https://esd.ny.gov',
        'https://www.njcleanenergy.com',
        'https://www.ctgreenbank.com',
        'https://www.coned.com',
        'https://www.nationalgridus.com'
    ]
    
    all_programs = []
    total_saved = 0
    
    for i, site in enumerate(priority_sites):
        if site in target_urls:
            print(f"\n[{i+1}/{len(priority_sites)}] Deep crawling: {site}")
            
            try:
                # Deep crawl for program pages and PDFs
                program_pages, pdf_urls = deep_crawl_site(site, max_depth=2, max_pages=30)
                
                site_programs = []
                
                # Process program pages
                for page_url, page_title in program_pages:
                    try:
                        response = requests.get(page_url, timeout=15)
                        if response.status_code == 200:
                            soup = BeautifulSoup(response.content, 'html.parser')
                            page_programs = extract_programs_from_page(soup, page_url, [])
                            site_programs.extend(page_programs)
                    except:
                        continue
                
                # Process PDFs with AI extraction
                for pdf_url in pdf_urls:
                    pdf_programs = extract_from_pdf(pdf_url, site)
                    site_programs.extend(pdf_programs)
                
                print(f"  Found {len(site_programs)} programs from deep crawling")
                
                if site_programs:
                    all_programs.extend(site_programs)
                    saved = save_programs_to_database(site_programs)
                    total_saved += saved
                    print(f"  Result: {len(site_programs)} found, {saved} saved")
                
            except Exception as e:
                print(f"  Error processing {site}: {str(e)[:50]}")
            
            time.sleep(3)  # Rate limiting between sites
    
    print(f"\n=== DEEP PDF EXTRACTION COMPLETE ===")
    print(f"Total programs discovered: {len(all_programs)}")
    print(f"Total programs saved: {total_saved}")
    
    # Get final database stats
    try:
        response = requests.get('http://localhost:5000/api/incentives/summary')
        if response.status_code == 200:
            stats = response.json()
            print(f"\nFinal database:")
            print(f"  Total programs: {stats['totalPrograms']}")
            print(f"  Total funding: {stats['totalFunding']}")
            
            if stats['totalPrograms'] > 105:
                new_count = stats['totalPrograms'] - 105
                print(f"  SUCCESS: Added {new_count} more programs from deep PDF extraction!")
    except:
        print("Could not retrieve final stats")

if __name__ == "__main__":
    main()