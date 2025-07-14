#!/usr/bin/env python3
"""
Deep crawling and PDF extraction from all 195 target websites
Comprehensive program discovery with multi-level crawling and PDF processing
"""

import requests
import time
import json
import re
import pymupdf
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import openai
import os
from pathlib import Path
import concurrent.futures
from threading import Lock

# Set up APIs
openai.api_key = os.getenv('OPENAI_API_KEY')
db_lock = Lock()

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
    found_programs = []
    visited_urls = set()
    to_visit = [(base_url, 0)]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    program_keywords = [
        'grant', 'program', 'incentive', 'rebate', 'credit', 'funding',
        'opportunity', 'assistance', 'support', 'initiative', 'award',
        'finance', 'loan', 'subsidy', 'tax', 'deduction', 'benefit'
    ]
    
    while to_visit and len(visited_urls) < max_pages:
        current_url, depth = to_visit.pop(0)
        
        if current_url in visited_urls or depth > max_depth:
            continue
            
        try:
            print(f"  Crawling: {current_url} (depth {depth})")
            response = requests.get(current_url, headers=headers, timeout=15)
            
            if response.status_code != 200:
                continue
                
            visited_urls.add(current_url)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract program information from current page
            page_programs = extract_programs_from_page(soup, current_url, program_keywords)
            found_programs.extend(page_programs)
            
            # Find PDFs on this page
            pdf_programs = extract_programs_from_pdfs(soup, current_url)
            found_programs.extend(pdf_programs)
            
            # Find more pages to crawl (only if not too deep)
            if depth < max_depth:
                for link in soup.find_all('a', href=True)[:20]:  # Limit links per page
                    href = link.get('href')
                    full_url = urljoin(current_url, href)
                    
                    # Only crawl if URL contains program-related terms
                    if (any(keyword in full_url.lower() or keyword in link.get_text().lower() 
                           for keyword in program_keywords) and 
                        full_url not in visited_urls):
                        to_visit.append((full_url, depth + 1))
            
            time.sleep(1)  # Rate limiting
            
        except Exception as e:
            print(f"    Error crawling {current_url}: {str(e)[:50]}")
            continue
    
    return found_programs[:20]  # Limit results per site

def extract_programs_from_page(soup, url, keywords):
    """Extract program information from a webpage"""
    programs = []
    
    # Look for program headings and content
    for heading in soup.find_all(['h1', 'h2', 'h3', 'h4'], text=re.compile('|'.join(keywords), re.I)):
        title = heading.get_text(strip=True)
        
        # Find associated content
        content_elem = heading.find_next(['p', 'div', 'section'])
        description = content_elem.get_text(strip=True)[:500] if content_elem else ""
        
        if len(title) > 10 and len(title) < 150:
            programs.append({
                'title': title,
                'description': description,
                'url': url,
                'source': 'webpage'
            })
    
    # Look for program links
    for link in soup.find_all('a', href=True):
        link_text = link.get_text(strip=True)
        href = link.get('href')
        
        if (any(keyword in link_text.lower() or keyword in href.lower() for keyword in keywords) and
            len(link_text) > 15 and len(link_text) < 120):
            
            programs.append({
                'title': link_text,
                'description': f"Program link from {urlparse(url).netloc}",
                'url': urljoin(url, href),
                'source': 'link'
            })
    
    return programs[:5]  # Limit per page

def extract_programs_from_pdfs(soup, base_url):
    """Find and extract programs from PDFs on the page"""
    programs = []
    
    # Find PDF links
    pdf_links = []
    for link in soup.find_all('a', href=True):
        href = link.get('href')
        if href.lower().endswith('.pdf'):
            pdf_url = urljoin(base_url, href)
            pdf_links.append((pdf_url, link.get_text(strip=True)))
    
    # Process first 3 PDFs per page
    for pdf_url, pdf_title in pdf_links[:3]:
        try:
            print(f"    Processing PDF: {pdf_title}")
            pdf_programs = extract_from_pdf(pdf_url, base_url)
            programs.extend(pdf_programs)
        except Exception as e:
            print(f"    PDF error: {str(e)[:50]}")
            continue
    
    return programs

def extract_from_pdf(pdf_url, source_url):
    """Extract program information from a PDF using AI"""
    try:
        response = requests.get(pdf_url, timeout=30)
        if response.status_code != 200:
            return []
        
        # Save PDF temporarily
        pdf_path = f"/tmp/temp_pdf_{int(time.time())}.pdf"
        with open(pdf_path, 'wb') as f:
            f.write(response.content)
        
        # Extract text from PDF
        doc = pymupdf.open(pdf_path)
        text = ""
        for page in doc[:10]:  # Limit to first 10 pages
            text += page.get_text()
        doc.close()
        
        # Clean up temp file
        os.remove(pdf_path)
        
        if len(text) < 100:
            return []
        
        # Use AI to extract programs
        prompt = f"""
        Extract government incentive programs from this PDF text. Return JSON array with programs found:
        
        Text: {text[:4000]}
        
        For each program, extract:
        - name: Program name
        - provider: Government agency/organization
        - amount: Funding amount (or "Variable")
        - description: Brief description
        - eligibility: Who can apply
        
        Only include legitimate government incentive programs. Return JSON array.
        """
        
        try:
            ai_response = openai.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=1000,
                temperature=0.1
            )
            
            programs_data = json.loads(ai_response.choices[0].message.content)
            
            # Format for our system
            formatted_programs = []
            for prog in programs_data:
                if isinstance(prog, dict) and prog.get('name'):
                    formatted_programs.append({
                        'title': prog.get('name', 'Unknown Program'),
                        'description': prog.get('description', ''),
                        'provider': prog.get('provider', 'Unknown'),
                        'amount': prog.get('amount', 'Variable'),
                        'url': pdf_url,
                        'source': 'pdf'
                    })
            
            return formatted_programs[:5]  # Limit per PDF
            
        except:
            return []
            
    except Exception as e:
        return []

def categorize_program(program, source_url):
    """Categorize program by source and content"""
    url_lower = source_url.lower()
    
    # Determine level
    if '.gov' in url_lower and not any(x in url_lower for x in ['ny.gov', 'nyc.gov']):
        level = 'federal'
    elif any(x in url_lower for x in ['ny.gov', 'nyc.gov', 'nyserda']):
        level = 'state'
    elif any(x in url_lower for x in ['coned.com', 'nationalgrid', 'pseg.com']):
        level = 'utility'
    elif 'foundation' in url_lower or any(x in url_lower for x in ['kresge', 'ford', 'macfound']):
        level = 'foundation'
    else:
        level = 'private'
    
    # Determine provider
    domain_parts = urlparse(source_url).netloc.split('.')
    if len(domain_parts) >= 2:
        provider = domain_parts[-2].upper()
    else:
        provider = program.get('provider', 'Unknown')
    
    return level, provider

def save_programs_to_database(programs):
    """Save discovered programs to database"""
    saved_count = 0
    
    for program in programs:
        try:
            level, provider = categorize_program(program, program.get('url', ''))
            
            # Prepare database record
            db_program = {
                'name': program['title'][:100],
                'provider': provider,
                'level': level,
                'amount': program.get('amount', 'Variable'),
                'status': 'active',
                'description': program['description'][:500],
                'project_types': '["General"]',
                'technology': 'General',
                'application_url': program.get('url', ''),
                'deadline': 'ongoing',
                'requirements': '["See program details"]'
            }
            
            # Insert via SQL to avoid API issues
            with db_lock:
                insert_query = """
                INSERT INTO incentives (name, provider, level, amount, status, description, project_types, technology, application_url, deadline, requirements, created_at, updated_at) 
                VALUES (%(name)s, %(provider)s, %(level)s, %(amount)s, %(status)s, %(description)s, %(project_types)s::json, %(technology)s, %(application_url)s, %(deadline)s, %(requirements)s::json, NOW(), NOW())
                ON CONFLICT (name) DO NOTHING
                """
                
                # Use requests to trigger database insert
                response = requests.post('http://localhost:5000/api/incentives',
                                       json={
                                           'name': db_program['name'],
                                           'provider': db_program['provider'],
                                           'level': db_program['level'],
                                           'amount': db_program['amount'],
                                           'status': db_program['status'],
                                           'description': db_program['description'],
                                           'projectTypes': ['General'],
                                           'technology': db_program['technology'],
                                           'url': db_program['application_url'],
                                           'deadline': db_program['deadline']
                                       })
                
                if response.status_code == 200:
                    saved_count += 1
                    print(f"      ✓ Saved: {db_program['name'][:50]}...")
        
        except Exception as e:
            print(f"      Error saving program: {str(e)[:50]}")
            continue
    
    return saved_count

def main():
    """Main deep crawling process"""
    print("=== DEEP CRAWLING 195 TARGET WEBSITES ===")
    
    # Get all target URLs
    target_urls = extract_all_target_urls()
    print(f"Processing {len(target_urls)} target websites with deep crawling and PDF extraction")
    
    # Prioritize high-value sites
    priority_sites = []
    other_sites = []
    
    for url in target_urls:
        if any(domain in url.lower() for domain in [
            'energy.gov', 'epa.gov', 'irs.gov', 'hud.gov', 'usda.gov', 'sba.gov',
            'nyserda.ny.gov', 'esd.ny.gov', 'coned.com', 'nationalgrid'
        ]):
            priority_sites.append(url)
        else:
            other_sites.append(url)
    
    print(f"Priority sites: {len(priority_sites)}")
    print(f"Other sites: {len(other_sites)}")
    
    all_discovered_programs = []
    total_saved = 0
    
    # Process priority sites first with deep crawling
    print(f"\n=== DEEP CRAWLING PRIORITY SITES ===")
    for i, url in enumerate(priority_sites[:15]):  # Top 15 priority sites
        print(f"\n[{i+1}/{len(priority_sites[:15])}] Deep crawling: {url}")
        try:
            site_programs = deep_crawl_site(url, max_depth=3, max_pages=30)
            if site_programs:
                print(f"  Found {len(site_programs)} programs")
                all_discovered_programs.extend(site_programs)
                
                # Save in batches
                saved = save_programs_to_database(site_programs)
                total_saved += saved
                print(f"  Saved {saved} programs to database")
            
            time.sleep(2)  # Rate limiting between sites
            
        except Exception as e:
            print(f"  Error processing {url}: {str(e)[:50]}")
            continue
    
    # Process other high-value sites
    print(f"\n=== CRAWLING ADDITIONAL SITES ===")
    for i, url in enumerate(other_sites[:25]):  # Top 25 other sites
        print(f"\n[{i+1}/{len(other_sites[:25])}] Crawling: {url}")
        try:
            site_programs = deep_crawl_site(url, max_depth=2, max_pages=15)
            if site_programs:
                print(f"  Found {len(site_programs)} programs")
                all_discovered_programs.extend(site_programs)
                
                saved = save_programs_to_database(site_programs)
                total_saved += saved
                print(f"  Saved {saved} programs to database")
            
            time.sleep(1)
            
        except Exception as e:
            print(f"  Error processing {url}: {str(e)[:50]}")
            continue
    
    print(f"\n=== DEEP CRAWLING COMPLETE ===")
    print(f"Websites processed: {len(priority_sites[:15]) + len(other_sites[:25])}")
    print(f"Programs discovered: {len(all_discovered_programs)}")
    print(f"Programs saved to database: {total_saved}")
    
    # Get final database count
    try:
        response = requests.get('http://localhost:5000/api/incentives/summary')
        if response.status_code == 200:
            stats = response.json()
            print(f"\nFinal database: {stats['totalPrograms']} programs")
            print(f"Total funding: {stats['totalFunding']}")
    except:
        pass
    
    return all_discovered_programs

if __name__ == "__main__":
    main()