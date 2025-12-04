"""
DSIRE API Client

Connects to the DSIRE (Database of State Incentives for Renewables & Efficiency)
API to fetch incentive program data.

DSIRE API Endpoints:
- Programs listing: https://programs.dsireusa.org/api/v1/programs
- Program details: https://programs.dsireusa.org/api/v1/programs/{id}
- Search: https://programs.dsireusa.org/api/v1/programs/search
"""

import requests
import logging
import time
from typing import Optional, List, Dict, Any
from datetime import datetime
from urllib.parse import urljoin, urlencode
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class DSIREClient:
    """Client for interacting with the DSIRE API and website."""

    BASE_URL = "https://programs.dsireusa.org"
    API_BASE = "https://programs.dsireusa.org/api/v1"

    # All US states and territories
    US_STATES = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
        'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
        'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
        'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
        'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
        'DC', 'PR', 'VI', 'GU', 'AS', 'MP'  # Territories
    ]

    # Program types in DSIRE
    PROGRAM_TYPES = [
        'State Rebate Program',
        'State Loan Program',
        'State Grant Program',
        'State Tax Credit',
        'Federal Tax Credit',
        'Utility Rebate Program',
        'Local Rebate Program',
        'Net Metering',
        'Property Tax Incentive',
        'Sales Tax Incentive',
        'Performance-Based Incentive',
        'Green Building Incentive',
        'PACE Financing'
    ]

    # Technology categories
    TECHNOLOGIES = [
        'Solar Photovoltaic',
        'Solar Thermal',
        'Wind',
        'Geothermal',
        'Biomass',
        'Fuel Cells',
        'Energy Efficiency',
        'Electric Vehicles',
        'Energy Storage',
        'HVAC',
        'Building Envelope',
        'Lighting'
    ]

    def __init__(self, timeout: int = 30, rate_limit_delay: float = 1.0):
        """
        Initialize the DSIRE client.

        Args:
            timeout: Request timeout in seconds
            rate_limit_delay: Delay between requests to avoid rate limiting
        """
        self.timeout = timeout
        self.rate_limit_delay = rate_limit_delay
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'IncentEdge/1.0 (Incentive Research Platform)',
            'Accept': 'application/json, text/html',
            'Accept-Language': 'en-US,en;q=0.9',
            'Cache-Control': 'no-cache'
        })
        self._last_request_time = 0

    def _rate_limit(self):
        """Enforce rate limiting between requests."""
        elapsed = time.time() - self._last_request_time
        if elapsed < self.rate_limit_delay:
            time.sleep(self.rate_limit_delay - elapsed)
        self._last_request_time = time.time()

    def _make_request(self, url: str, params: Optional[Dict] = None,
                      method: str = 'GET') -> Optional[requests.Response]:
        """
        Make an HTTP request with error handling and rate limiting.

        Args:
            url: The URL to request
            params: Optional query parameters
            method: HTTP method (GET, POST)

        Returns:
            Response object or None if request failed
        """
        self._rate_limit()

        try:
            if method.upper() == 'GET':
                response = self.session.get(url, params=params, timeout=self.timeout)
            else:
                response = self.session.post(url, json=params, timeout=self.timeout)

            response.raise_for_status()
            return response

        except requests.exceptions.Timeout:
            logger.error(f"Request timeout for URL: {url}")
        except requests.exceptions.HTTPError as e:
            logger.error(f"HTTP error {e.response.status_code} for URL: {url}")
        except requests.exceptions.RequestException as e:
            logger.error(f"Request failed for URL: {url} - {e}")

        return None

    def get_programs_by_state(self, state_code: str) -> List[Dict[str, Any]]:
        """
        Fetch all incentive programs for a specific state.

        Args:
            state_code: Two-letter state code (e.g., 'NY', 'CA')

        Returns:
            List of program dictionaries
        """
        programs = []
        state_code = state_code.upper()

        # Try API endpoint first
        api_url = f"{self.API_BASE}/programs"
        params = {'state': state_code}

        response = self._make_request(api_url, params=params)

        if response:
            try:
                data = response.json()
                if isinstance(data, list):
                    programs = data
                elif isinstance(data, dict) and 'programs' in data:
                    programs = data['programs']
                elif isinstance(data, dict) and 'data' in data:
                    programs = data['data']
                logger.info(f"Found {len(programs)} programs via API for {state_code}")
                return programs
            except ValueError:
                logger.warning("API response is not JSON, falling back to web scraping")

        # Fallback to web scraping
        programs = self._scrape_state_programs(state_code)
        return programs

    def _scrape_state_programs(self, state_code: str) -> List[Dict[str, Any]]:
        """
        Scrape programs from the DSIRE website for a state.

        Args:
            state_code: Two-letter state code

        Returns:
            List of program dictionaries
        """
        programs = []
        url = f"{self.BASE_URL}/system/program/{state_code.lower()}"

        response = self._make_request(url)
        if not response:
            return programs

        soup = BeautifulSoup(response.text, 'html.parser')

        # Find program links
        program_links = soup.select('a[href*="/system/program/detail/"]')

        for link in program_links:
            program_url = link.get('href', '')
            if not program_url.startswith('http'):
                program_url = urljoin(self.BASE_URL, program_url)

            program_id = program_url.split('/')[-1] if '/' in program_url else None
            program_name = link.get_text(strip=True)

            if program_id and program_name:
                programs.append({
                    'id': program_id,
                    'name': program_name,
                    'url': program_url,
                    'state': state_code,
                    'scraped_at': datetime.now().isoformat()
                })

        logger.info(f"Scraped {len(programs)} program links for {state_code}")
        return programs

    def get_program_details(self, program_id: str) -> Optional[Dict[str, Any]]:
        """
        Fetch detailed information for a specific program.

        Args:
            program_id: The DSIRE program ID

        Returns:
            Program details dictionary or None
        """
        # Try API first
        api_url = f"{self.API_BASE}/programs/{program_id}"
        response = self._make_request(api_url)

        if response:
            try:
                data = response.json()
                return self._normalize_program(data)
            except ValueError:
                pass

        # Fallback to web scraping
        return self._scrape_program_details(program_id)

    def _scrape_program_details(self, program_id: str) -> Optional[Dict[str, Any]]:
        """
        Scrape detailed program information from the DSIRE website.

        Args:
            program_id: The DSIRE program ID

        Returns:
            Program details dictionary or None
        """
        url = f"{self.BASE_URL}/system/program/detail/{program_id}"
        response = self._make_request(url)

        if not response:
            return None

        soup = BeautifulSoup(response.text, 'html.parser')

        program = {
            'id': program_id,
            'url': url,
            'scraped_at': datetime.now().isoformat()
        }

        # Extract program name
        title_elem = soup.select_one('h1, .program-title, .title')
        if title_elem:
            program['name'] = title_elem.get_text(strip=True)

        # Extract program details from definition lists or tables
        for row in soup.select('tr, dl, .program-detail'):
            label_elem = row.select_one('th, dt, .label, strong')
            value_elem = row.select_one('td, dd, .value')

            if label_elem and value_elem:
                label = label_elem.get_text(strip=True).lower()
                value = value_elem.get_text(strip=True)

                if 'state' in label:
                    program['state'] = value
                elif 'type' in label or 'category' in label:
                    program['program_type'] = value
                elif 'implement' in label or 'admin' in label:
                    program['implementing_sector'] = value
                elif 'eligible' in label:
                    program['eligible_sectors'] = value
                elif 'technolog' in label:
                    program['technologies'] = value
                elif 'amount' in label or 'incentive' in label:
                    program['incentive_amount'] = value
                elif 'date' in label:
                    if 'start' in label or 'effective' in label:
                        program['start_date'] = value
                    elif 'end' in label or 'expir' in label:
                        program['end_date'] = value
                    else:
                        program['date_enacted'] = value
                elif 'description' in label or 'summary' in label:
                    program['description'] = value
                elif 'contact' in label:
                    program['contact'] = value
                elif 'web' in label or 'url' in label or 'link' in label:
                    program['website'] = value

        # Extract description from main content if not found
        if 'description' not in program:
            desc_elem = soup.select_one('.description, .program-description, .content p')
            if desc_elem:
                program['description'] = desc_elem.get_text(strip=True)

        return program

    def _normalize_program(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Normalize program data to a consistent format.

        Args:
            data: Raw program data from API or scraping

        Returns:
            Normalized program dictionary
        """
        return {
            'id': str(data.get('id', data.get('program_id', ''))),
            'name': data.get('name', data.get('program_name', 'Unknown Program')),
            'state': data.get('state', data.get('state_code', '')),
            'program_type': data.get('program_type', data.get('type', 'Incentive')),
            'implementing_sector': data.get('implementing_sector', data.get('sector', '')),
            'eligible_sectors': data.get('eligible_sectors', []),
            'technologies': data.get('technologies', data.get('eligible_technologies', [])),
            'incentive_amount': data.get('incentive_amount', data.get('amount', '')),
            'start_date': data.get('start_date', data.get('effective_date', '')),
            'end_date': data.get('end_date', data.get('expiration_date', '')),
            'date_enacted': data.get('date_enacted', data.get('enacted_date', '')),
            'description': data.get('description', data.get('summary', '')),
            'contact': data.get('contact', ''),
            'website': data.get('website', data.get('url', data.get('web_site', ''))),
            'url': data.get('url', f"{self.BASE_URL}/system/program/detail/{data.get('id', '')}"),
            'last_updated': data.get('last_updated', data.get('modified_date', '')),
            'scraped_at': datetime.now().isoformat()
        }

    def get_all_programs(self, states: Optional[List[str]] = None,
                         include_details: bool = False,
                         progress_callback=None) -> List[Dict[str, Any]]:
        """
        Fetch all programs, optionally filtered by states.

        Args:
            states: List of state codes to fetch (default: all states)
            include_details: Whether to fetch full details for each program
            progress_callback: Optional callback function for progress updates

        Returns:
            List of all programs
        """
        all_programs = []
        target_states = states or self.US_STATES
        total_states = len(target_states)

        for idx, state in enumerate(target_states, 1):
            logger.info(f"Fetching programs for {state} ({idx}/{total_states})")

            if progress_callback:
                progress_callback(state, idx, total_states)

            programs = self.get_programs_by_state(state)

            if include_details:
                detailed_programs = []
                for prog in programs:
                    prog_id = prog.get('id')
                    if prog_id:
                        details = self.get_program_details(prog_id)
                        if details:
                            detailed_programs.append(details)
                        else:
                            detailed_programs.append(prog)
                    else:
                        detailed_programs.append(prog)
                programs = detailed_programs

            all_programs.extend(programs)
            logger.info(f"Total programs so far: {len(all_programs)}")

        return all_programs

    def search_programs(self, query: str = None, state: str = None,
                        program_type: str = None, technology: str = None,
                        sector: str = None) -> List[Dict[str, Any]]:
        """
        Search for programs with various filters.

        Args:
            query: Text search query
            state: Filter by state code
            program_type: Filter by program type
            technology: Filter by technology type
            sector: Filter by eligible sector

        Returns:
            List of matching programs
        """
        # Try API search endpoint
        api_url = f"{self.API_BASE}/programs/search"
        params = {}

        if query:
            params['q'] = query
        if state:
            params['state'] = state.upper()
        if program_type:
            params['type'] = program_type
        if technology:
            params['technology'] = technology
        if sector:
            params['sector'] = sector

        response = self._make_request(api_url, params=params)

        if response:
            try:
                data = response.json()
                if isinstance(data, list):
                    return data
                elif isinstance(data, dict):
                    return data.get('programs', data.get('results', data.get('data', [])))
            except ValueError:
                pass

        # Fallback: get state programs and filter locally
        programs = []
        if state:
            programs = self.get_programs_by_state(state)
        else:
            # This would be slow - consider limiting
            logger.warning("No state specified for search - results may be slow")
            for s in self.US_STATES[:5]:  # Limit to first 5 states for demo
                programs.extend(self.get_programs_by_state(s))

        # Filter locally
        if query:
            query_lower = query.lower()
            programs = [p for p in programs if query_lower in str(p).lower()]

        return programs

    def get_federal_programs(self) -> List[Dict[str, Any]]:
        """
        Fetch federal incentive programs.

        Returns:
            List of federal programs
        """
        # Federal programs are often listed under 'US' or 'Federal'
        programs = []

        # Try API with federal filter
        api_url = f"{self.API_BASE}/programs"
        params = {'level': 'federal'}

        response = self._make_request(api_url, params=params)

        if response:
            try:
                data = response.json()
                if isinstance(data, list):
                    programs = data
                elif isinstance(data, dict):
                    programs = data.get('programs', data.get('data', []))
            except ValueError:
                pass

        # Also try scraping federal page
        federal_url = f"{self.BASE_URL}/system/program/federal"
        response = self._make_request(federal_url)

        if response:
            soup = BeautifulSoup(response.text, 'html.parser')
            for link in soup.select('a[href*="/system/program/detail/"]'):
                program_url = link.get('href', '')
                if not program_url.startswith('http'):
                    program_url = urljoin(self.BASE_URL, program_url)

                program_id = program_url.split('/')[-1] if '/' in program_url else None
                program_name = link.get_text(strip=True)

                if program_id and program_name:
                    programs.append({
                        'id': program_id,
                        'name': program_name,
                        'url': program_url,
                        'level': 'Federal',
                        'scraped_at': datetime.now().isoformat()
                    })

        return programs

    def check_api_status(self) -> Dict[str, Any]:
        """
        Check the status and availability of the DSIRE API.

        Returns:
            Status dictionary with availability info
        """
        status = {
            'api_available': False,
            'website_available': False,
            'timestamp': datetime.now().isoformat(),
            'errors': []
        }

        # Check API
        try:
            response = self.session.get(f"{self.API_BASE}/programs",
                                        params={'state': 'NY'},
                                        timeout=10)
            if response.status_code == 200:
                status['api_available'] = True
                status['api_response_code'] = 200
            else:
                status['api_response_code'] = response.status_code
        except Exception as e:
            status['errors'].append(f"API error: {str(e)}")

        # Check website
        try:
            response = self.session.get(f"{self.BASE_URL}/system/program/ny",
                                        timeout=10)
            if response.status_code == 200:
                status['website_available'] = True
                status['website_response_code'] = 200
            else:
                status['website_response_code'] = response.status_code
        except Exception as e:
            status['errors'].append(f"Website error: {str(e)}")

        return status


if __name__ == '__main__':
    # Quick test
    logging.basicConfig(level=logging.INFO)
    client = DSIREClient()

    print("Checking DSIRE API status...")
    status = client.check_api_status()
    print(f"Status: {status}")

    print("\nFetching NY programs...")
    programs = client.get_programs_by_state('NY')
    print(f"Found {len(programs)} programs")

    if programs:
        print(f"First program: {programs[0]}")
