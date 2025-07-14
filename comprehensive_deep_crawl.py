#!/usr/bin/env python3
"""
Comprehensive deep crawling with PDF extraction
Focus on multi-state and New York state/county/city programs
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
    """Extract all URLs from the target PDF and additional sources"""
    doc = pymupdf.open('attached_assets/Target Websites for Incentive Finder App_1750957953216.pdf')
    text = ''
    for page in doc:
        text += page.get_text()
    
    urls = re.findall(r'https?://[^\s\)]+', text)
    
    # Add additional priority NY/multi-state sites
    additional_sites = [
        'https://www.nyc.gov/site/sustainability/',
        'https://www.westchestergov.com/environment',
        'https://www.suffolkcountyny.gov/environment',
        'https://www.nassaucountyny.gov/sustainability',
        'https://www.albany.gov/government/departments/planning/sustainability',
        'https://www.cityofrochester.gov/sustainability/',
        'https://www.syracuse.ny.us/sustainability/',
        'https://www.buffalony.gov/sustainability',
        'https://www.yonkersny.gov/government/departments/planning/sustainability',
        'https://www.rggi.org/',
        'https://www.cleanenergystates.org/',
        'https://www.aceee.org/',
        'https://www.ase.org/',
        'https://www.smartgrowthamerica.org/'
    ]
    
    return list(set(urls + additional_sites))

def categorize_url_priority(url):
    """Categorize URLs by priority for NY/multi-state focus"""
    url_lower = url.lower()
    
    # High priority - NY state and multi-state
    if any(term in url_lower for term in ['ny.gov', 'nyc.gov', 'nyserda', 'rggi', 'cleanenergystates', 'multistate']):
        return 'high'
    
    # Medium priority - County/city NY
    if any(term in url_lower for term in ['westchester', 'suffolk', 'nassau', 'albany', 'rochester', 'syracuse', 'buffalo', 'yonkers']):
        return 'medium'
    
    # Lower priority - Federal but important
    if any(term in url_lower for term in ['energy.gov', 'epa.gov', 'hud.gov', 'treasury.gov']):
        return 'medium'
        
    return 'low'

def deep_crawl_with_pdf_focus(base_url, max_depth=3, max_pdfs=15):
    """Enhanced crawling with PDF extraction focus"""
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
    visited = set()
    to_visit = [(base_url, 0)]
    found_programs = []
    pdf_programs = []
    
    # Keywords for NY/multi-state focus
    ny_keywords = ['new york', 'ny state', 'nyc', 'multi-state', 'regional', 'northeast', 'tri-state']
    program_keywords = ['grant', 'program', 'incentive', 'rebate', 'credit', 'funding', 'opportunity', 'loan']
    
    print(f"Deep crawling: {base_url}")
    
    while to_visit and len(visited) < 40:
        url, depth = to_visit.pop(0)
        
        if url in visited or depth > max_depth:
            continue
            
        visited.add(url)
        
        try:
            response = requests.get(url, headers=headers, timeout=20)
            if response.status_code != 200:
                continue
                
            soup = BeautifulSoup(response.content, 'html.parser')
            page_text = soup.get_text().lower()
            
            # Prioritize NY/multi-state content
            ny_relevance = sum(1 for keyword in ny_keywords if keyword in page_text)
            
            # Find and process PDFs
            pdf_links = []
            for link in soup.find_all('a', href=True):
                href = link.get('href')
                if href and href.lower().endswith('.pdf'):
                    pdf_url = urljoin(url, href)
                    if pdf_url not in pdf_links:
                        pdf_links.append(pdf_url)
            
            # Process PDFs with AI
            for pdf_url in pdf_links[:max_pdfs]:
                try:
                    pdf_programs_found = extract_programs_from_pdf_ai(pdf_url, base_url, ny_focus=True)
                    pdf_programs.extend(pdf_programs_found)
                    print(f"  PDF processed: {len(pdf_programs_found)} programs found")
                except Exception as e:
                    print(f"  PDF error: {str(e)[:40]}")
                    continue
                
                time.sleep(2)  # Rate limiting for PDFs
            
            # Find program pages
            for link in soup.find_all('a', href=True):
                href = link.get('href')
                text = link.get_text(strip=True)
                
                # Check for program relevance
                if any(keyword in href.lower() or keyword in text.lower() for keyword in program_keywords):
                    if len(text) > 15 and len(text) < 200:
                        program_url = urljoin(url, href)
                        
                        # Extract program details
                        try:
                            prog_response = requests.get(program_url, headers=headers, timeout=15)
                            if prog_response.status_code == 200:
                                prog_soup = BeautifulSoup(prog_response.content, 'html.parser')
                                program_data = extract_program_details(prog_soup, program_url, text)
                                
                                if program_data and (ny_relevance > 0 or 'multi' in program_data['description'].lower()):
                                    found_programs.append(program_data)
                                    print(f"  Program found: {program_data['title'][:50]}...")
                                    
                        except:
                            continue
                        
                        # Add to crawl queue
                        if depth < max_depth:
                            to_visit.append((program_url, depth + 1))
            
        except Exception as e:
            print(f"  Error crawling {url}: {str(e)[:50]}")
            continue
            
        time.sleep(1.5)  # Rate limiting
    
    all_programs = found_programs + pdf_programs
    print(f"  Total programs discovered: {len(all_programs)} (Web: {len(found_programs)}, PDF: {len(pdf_programs)})")
    
    return all_programs

def extract_programs_from_pdf_ai(pdf_url, source_url, ny_focus=False):
    """Enhanced PDF extraction with NY/multi-state focus"""
    programs = []
    
    try:
        print(f"    Processing PDF: {pdf_url}")
        response = requests.get(pdf_url, timeout=45)
        
        if response.status_code != 200:
            return []
        
        # Save and process PDF
        pdf_path = f'/tmp/extract_{int(time.time())}.pdf'
        with open(pdf_path, 'wb') as f:
            f.write(response.content)
        
        doc = pymupdf.open(pdf_path)
        pdf_text = ''
        for page_num, page in enumerate(doc):
            if page_num < 15:  # First 15 pages
                pdf_text += page.get_text()
        doc.close()
        os.remove(pdf_path)
        
        if len(pdf_text) < 300:
            return []
        
        # Enhanced AI prompt for NY/multi-state focus
        focus_instruction = ""
        if ny_focus:
            focus_instruction = "PRIORITY: Focus on New York state, NYC, multi-state, and regional programs. "
        
        prompt = f"""
        {focus_instruction}Extract government incentive programs from this PDF. Look for:
        - Programs specifically for New York state, NYC, or multi-state regions
        - Grant programs with clear funding amounts
        - Tax credits and rebate programs
        - Loan and financing programs
        - County and city-level programs in NY
        
        PDF Content (first 5000 chars):
        {pdf_text[:5000]}
        
        Return JSON array:
        [{{"name": "Program Name", "amount": "$X million", "description": "Brief description", "location": "NY/Multi-state/County"}}]
        
        Only include programs with clear funding amounts and location information.
        """
        
        try:
            ai_response = openai.chat.completions.create(
                model='gpt-3.5-turbo',
                messages=[{'role': 'user', 'content': prompt}],
                max_tokens=1200,
                temperature=0.2
            )
            
            extracted_programs = json.loads(ai_response.choices[0].message.content)
            
            for prog in extracted_programs:
                if isinstance(prog, dict) and prog.get('name') and prog.get('amount'):
                    programs.append({
                        'title': prog['name'][:150],
                        'description': prog.get('description', '')[:600],
                        'amount': prog.get('amount', 'Variable')[:100],
                        'location': prog.get('location', 'Unknown'),
                        'url': pdf_url,
                        'source': source_url,
                        'type': 'pdf_extract'
                    })
                    
        except Exception as e:
            print(f"      AI extraction failed: {str(e)[:50]}")
            
    except Exception as e:
        print(f"      PDF processing failed: {str(e)[:50]}")
    
    return programs[:8]  # Limit per PDF

def extract_program_details(soup, url, link_text):
    """Extract detailed program information from web pages"""
    try:
        # Get program title
        title_elem = soup.find('h1')
        title = title_elem.get_text(strip=True) if title_elem else link_text
        
        # Get comprehensive description
        description = ""
        for elem in soup.find_all(['p', 'div'], class_=re.compile(r'(description|summary|overview|content)')):
            elem_text = elem.get_text(strip=True)
            if len(elem_text) > 100:
                description = elem_text[:700]
                break
        
        if not description:
            # Fallback to first substantial paragraph
            for p in soup.find_all('p'):
                p_text = p.get_text(strip=True)
                if len(p_text) > 80:
                    description = p_text[:700]
                    break
        
        # Enhanced amount detection
        amount = "Variable"
        page_text = soup.get_text()
        
        # Multiple amount patterns
        amount_patterns = [
            r'\$[\d,]+(?:\.\d+)?\s*(?:million|billion|M|B|k)',
            r'\$[\d,]+(?:\.\d+)?',
            r'(?:up to|maximum of|total of)\s*\$[\d,]+',
            r'[\d,]+\s*(?:million|billion)\s*(?:dollars?)?'
        ]
        
        for pattern in amount_patterns:
            matches = re.findall(pattern, page_text, re.IGNORECASE)
            if matches:
                amount = matches[0].strip()[:80]
                break
        
        # Check for NY/multi-state relevance
        ny_indicators = ['new york', 'ny state', 'nyc', 'multi-state', 'regional', 'northeast', 'tri-state']
        page_text_lower = page_text.lower()
        ny_relevance = any(indicator in page_text_lower for indicator in ny_indicators)
        
        if len(title) > 8 and len(description) > 50:
            return {
                'title': title[:150],
                'description': description,
                'amount': amount,
                'url': url,
                'ny_relevant': ny_relevance,
                'type': 'web_extract'
            }
            
    except Exception as e:
        pass
    
    return None

def categorize_and_save_programs(programs, source_url):
    """Categorize and save programs with NY/multi-state priority"""
    saved_count = 0
    
    for prog in programs:
        try:
            # Enhanced categorization
            source_lower = source_url.lower()
            prog_text = (prog.get('description', '') + ' ' + prog.get('location', '')).lower()
            
            # Determine level and provider
            if 'nyc.gov' in source_lower or 'nyc' in prog_text:
                level = 'local'
                provider = 'New York City'
            elif any(county in source_lower or county in prog_text for county in ['westchester', 'suffolk', 'nassau']):
                level = 'local'
                provider = 'NY County'
            elif 'ny.gov' in source_lower or 'nyserda' in source_lower or 'new york' in prog_text:
                level = 'state'
                provider = 'New York State'
            elif 'rggi' in source_lower or 'multi-state' in prog_text or 'regional' in prog_text:
                level = 'state'
                provider = 'Multi-State'
            elif '.gov' in source_lower:
                level = 'federal'
                domain_parts = source_lower.split('.')
                provider = domain_parts[1].upper() if len(domain_parts) > 1 else 'Federal'
            else:
                level = 'private'
                provider = 'Organization'
            
            # Determine technology based on content
            tech_keywords = {
                'solar': 'Solar',
                'wind': 'Wind',
                'efficiency': 'Energy Efficiency',
                'heat pump': 'Heat Pumps',
                'storage': 'Energy Storage',
                'electric vehicle': 'Electric Vehicles',
                'geothermal': 'Geothermal',
                'retrofit': 'Building Retrofit'
            }
            
            technology = 'General'
            content_lower = prog['description'].lower()
            for keyword, tech in tech_keywords.items():
                if keyword in content_lower:
                    technology = tech
                    break
            
            # Create database record
            db_program = {
                'name': prog['title'],
                'provider': provider,
                'level': level,
                'amount': prog['amount'],
                'status': 'active',
                'description': prog['description'],
                'projectTypes': ['General'],
                'technology': technology,
                'url': prog['url'],
                'deadline': 'ongoing'
            }
            
            # Save to database
            response = requests.post('http://localhost:5000/api/incentives',
                                   json=db_program,
                                   headers={'Content-Type': 'application/json'})
            
            if response.status_code == 200:
                saved_count += 1
                print(f"    ✓ Saved: {prog['title'][:50]}... [{provider}]")
            else:
                print(f"    → Duplicate: {prog['title'][:50]}...")
                
        except Exception as e:
            continue
    
    return saved_count

def main():
    """Main comprehensive crawling process"""
    print("=== COMPREHENSIVE DEEP CRAWL WITH NY/MULTI-STATE FOCUS ===")
    
    # Get all target URLs
    all_urls = extract_all_target_urls()
    print(f"Processing {len(all_urls)} target websites")
    
    # Prioritize URLs
    high_priority = [url for url in all_urls if categorize_url_priority(url) == 'high']
    medium_priority = [url for url in all_urls if categorize_url_priority(url) == 'medium']
    
    priority_urls = high_priority + medium_priority[:15]  # Process top medium priority
    
    print(f"High priority NY/multi-state sites: {len(high_priority)}")
    print(f"Medium priority sites: {len([url for url in all_urls if categorize_url_priority(url) == 'medium'])}")
    print(f"Processing {len(priority_urls)} priority sites")
    
    total_programs = []
    total_saved = 0
    
    for i, url in enumerate(priority_urls):
        print(f"\n[{i+1}/{len(priority_urls)}] Processing: {url}")
        
        try:
            site_programs = deep_crawl_with_pdf_focus(url, max_depth=2, max_pdfs=10)
            
            if site_programs:
                total_programs.extend(site_programs)
                saved = categorize_and_save_programs(site_programs, url)
                total_saved += saved
                print(f"  Result: {len(site_programs)} found, {saved} saved")
            else:
                print(f"  No relevant programs found")
            
        except Exception as e:
            print(f"  Error processing {url}: {str(e)[:60]}")
        
        time.sleep(3)  # Rate limiting between sites
    
    print(f"\n=== COMPREHENSIVE CRAWL COMPLETE ===")
    print(f"Total programs discovered: {len(total_programs)}")
    print(f"Total programs saved: {total_saved}")
    
    # Get final database stats
    try:
        response = requests.get('http://localhost:5000/api/incentives/summary')
        if response.status_code == 200:
            stats = response.json()
            print(f"\nUpdated database:")
            print(f"  Total programs: {stats['totalPrograms']}")
            print(f"  Total funding: {stats['totalFunding']}")
            
            if stats['totalPrograms'] > 155:
                new_count = stats['totalPrograms'] - 155
                print(f"  SUCCESS: Added {new_count} new NY/multi-state programs!")
                print(f"  Program distribution: {stats['programDistribution']}")
    except:
        print("Could not retrieve final stats")

if __name__ == "__main__":
    main()