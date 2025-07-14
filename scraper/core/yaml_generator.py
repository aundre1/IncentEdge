"""
YAML Configuration Generator for IncentEdge Scraper
Automatically generates YAML configs for new websites
"""

import yaml
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import re
from typing import Dict, List, Optional

class YAMLGenerator:
    def __init__(self):
        self.common_selectors = {
            'title': ['h1', 'h2', '.title', '.program-title', '.page-title'],
            'description': ['.description', '.summary', '.content p', '.program-info'],
            'amount': ['.amount', '.funding', '.cost', '.rebate-amount', '.grant-amount'],
            'deadline': ['.deadline', '.expires', '.due-date', '.application-deadline'],
            'eligibility': ['.eligibility', '.requirements', '.who-can-apply']
        }
        
        self.amount_patterns = [
            r'\$[\d,]+(?:\.\d{2})?(?:\s*(?:to|-)\s*\$[\d,]+(?:\.\d{2})?)?',
            r'up to \$[\d,]+',
            r'[\d,]+ per \w+',
            r'[\d,]+ million',
            r'[\d,]+% of cost'
        ]
        
        self.deadline_patterns = [
            r'\d{1,2}/\d{1,2}/\d{4}',
            r'\d{4}-\d{2}-\d{2}',
            r'\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}',
            r'\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}'
        ]

    def analyze_website(self, url: str) -> Dict:
        """Analyze a website and suggest YAML configuration"""
        try:
            response = requests.get(url, timeout=30)
            soup = BeautifulSoup(response.content, 'html.parser')
            
            domain = urlparse(url).netloc
            
            # Detect potential program links
            program_links = self._find_program_links(soup, url)
            
            # Analyze page structure
            selectors = self._analyze_selectors(soup)
            
            # Generate config
            config = {
                'name': self._extract_site_name(soup, domain),
                'description': f"Incentive programs from {domain}",
                'base_url': f"https://{domain}",
                'start_urls': [url] + program_links[:3],  # Include up to 3 additional URLs
                'selectors': selectors,
                'rate_limit': 2,
                'timeout': 30,
                'extraction_rules': {
                    'amount_patterns': self.amount_patterns,
                    'deadline_patterns': self.deadline_patterns
                }
            }
            
            return config
            
        except Exception as e:
            return {'error': f"Failed to analyze website: {str(e)}"}

    def _find_program_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Find links that likely lead to program/incentive pages"""
        keywords = ['program', 'incentive', 'rebate', 'grant', 'loan', 'funding', 'efficiency', 'renewable']
        links = []
        
        for link in soup.find_all('a', href=True):
            href = link.get('href')
            text = link.get_text().lower()
            
            if any(keyword in href.lower() or keyword in text for keyword in keywords):
                full_url = urljoin(base_url, href)
                if full_url not in links:
                    links.append(full_url)
                    
        return links[:10]  # Return up to 10 relevant links

    def _analyze_selectors(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Analyze page structure and suggest CSS selectors"""
        selectors = {}
        
        for field, candidates in self.common_selectors.items():
            for selector in candidates:
                elements = soup.select(selector)
                if elements and len(elements) > 0:
                    # Check if the content looks relevant
                    sample_text = ' '.join([el.get_text()[:100] for el in elements[:3]])
                    if self._is_relevant_content(sample_text, field):
                        selectors[field] = selector
                        break
            
            # If no selector found, try a generic approach
            if field not in selectors:
                selectors[field] = f".{field}, #{field}"
        
        # Add program links selector
        selectors['program_links'] = "a[href*='program'], a[href*='incentive'], a[href*='rebate']"
        
        return selectors

    def _is_relevant_content(self, text: str, field: str) -> bool:
        """Check if text content is relevant to the field"""
        text_lower = text.lower()
        
        relevance_keywords = {
            'title': ['program', 'incentive', 'rebate', 'grant'],
            'description': ['description', 'summary', 'about', 'overview'],
            'amount': ['$', 'dollar', 'funding', 'cost', 'rebate'],
            'deadline': ['deadline', 'due', 'expires', 'until', 'apply by'],
            'eligibility': ['eligible', 'requirements', 'who can', 'qualify']
        }
        
        keywords = relevance_keywords.get(field, [])
        return any(keyword in text_lower for keyword in keywords)

    def _extract_site_name(self, soup: BeautifulSoup, domain: str) -> str:
        """Extract a meaningful site name"""
        # Try to get from title tag
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text().strip()
            if title and not title.lower().startswith('page not found'):
                return title.split('|')[0].split('-')[0].strip()
        
        # Try to get from h1
        h1 = soup.find('h1')
        if h1:
            return h1.get_text().strip()
        
        # Fallback to domain
        return domain.replace('www.', '').replace('.com', '').replace('.gov', '').replace('.org', '').title()

    def generate_yaml_string(self, config: Dict) -> str:
        """Convert config dictionary to YAML string"""
        return yaml.dump(config, default_flow_style=False, sort_keys=False)

    def save_config(self, config: Dict, filename: str) -> bool:
        """Save configuration to YAML file"""
        try:
            config_path = f"configs/{filename}.yaml"
            with open(config_path, 'w') as f:
                yaml.dump(config, f, default_flow_style=False, sort_keys=False)
            return True
        except Exception as e:
            print(f"Error saving config: {e}")
            return False

def main():
    """CLI interface for generating YAML configs"""
    import sys
    
    if len(sys.argv) != 3:
        print("Usage: python yaml_generator.py <url> <config_name>")
        sys.exit(1)
    
    url = sys.argv[1]
    config_name = sys.argv[2]
    
    generator = YAMLGenerator()
    config = generator.analyze_website(url)
    
    if 'error' in config:
        print(f"Error: {config['error']}")
        sys.exit(1)
    
    yaml_content = generator.generate_yaml_string(config)
    print("Generated YAML configuration:")
    print("=" * 50)
    print(yaml_content)
    
    # Save to file
    if generator.save_config(config, config_name):
        print(f"\nConfiguration saved to configs/{config_name}.yaml")
    else:
        print("\nFailed to save configuration file")

if __name__ == "__main__":
    main()