import re
import io
import requests
import pandas as pd
from bs4 import BeautifulSoup
from pathlib import Path
from urllib.parse import urlparse, unquote
from dateutil.parser import parse
from PyPDF2 import PdfReader
from scraper.core.config_loader import ConfigLoader
from scraper.core.ai_agent import AIAgent
from langdetect import detect

class DynamicScraper:
    def __init__(self, config_name, output_path):
        self.config_name = config_name
        self.output_path = Path(output_path) if output_path else None
        self.config = ConfigLoader().load(config_name)
        self.results = []
        self.ai = AIAgent()
        self.visited_urls = set()
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1"
        })

        self.pdf_pattern = re.compile(r'\.pdf($|\?)', re.I)
        self.pdf_indicators = ['pdf', 'guidelines', 'form', 'application', 'download']
        self.pdf_min_size = self.config.get("pdf_min_size", 10_000)
        self.pdf_max_size = self.config.get("pdf_max_size", 10_000_000)
        self.auto_pdf = self.config.get("auto_pdf_detection", True)

    def run(self):
        url = self.config["site"]
        print(f"\n🚀 Starting scrape: {url}")
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, "html.parser")
        except Exception as e:
            print(f"❌ Failed to fetch root page: {e}")
            return

        # Extract from main page first
        print("📄 Extracting from main page...")
        main_page_data = self.extract_from_html(soup, url)
        if main_page_data:
            self.results.append(main_page_data)
            print(f"✅ Extracted: {main_page_data.get('title', 'N/A')}")

        # Handle deep links if enabled
        deep_cfg = self.config.get("deep_links")
        if deep_cfg and deep_cfg.get("enabled", True):
            sub_urls = set()

            if isinstance(deep_cfg, dict) and "selector" in deep_cfg:
                elements = soup.select(deep_cfg["selector"])
                for el in elements:
                    href = el.get(deep_cfg.get("attribute", "href"))
                    if href and isinstance(href, str):
                        from urllib.parse import urljoin
                        full_url = href if href.startswith("http") else urljoin(url, href)
                        sub_urls.add(full_url)
            elif isinstance(deep_cfg, dict) and "urls" in deep_cfg:
                sub_urls.update(deep_cfg["urls"])

            print(f"🔗 Found {len(sub_urls)} subpages to crawl")
            for sub_url in list(sub_urls)[:3]:  # Limit to 3 subpages
                self.scrape_page(sub_url)

        if self.output_path:
            self.save()

    def scrape_page(self, page_url):
        if page_url in self.visited_urls:
            return
        self.visited_urls.add(page_url)

        print(f"📄 Scraping subpage: {page_url}")
        try:
            response = self.session.get(page_url, timeout=30)
            response.raise_for_status()

            if "application/pdf" in response.headers.get("Content-Type", ""):
                if pdf_data := self.process_pdf(page_url):
                    self.results.append(pdf_data)
                return

            soup = BeautifulSoup(response.text, "html.parser")

            if self.auto_pdf:
                pdf_links = self.detect_pdf_links(soup, page_url)
                for pdf_url in pdf_links:
                    if pdf_data := self.process_pdf(pdf_url):
                        self.results.append(pdf_data)

            data = self.extract_from_html(soup, page_url)
            self.results.append(data)

        except Exception as e:
            print(f"❌ Failed to scrape {page_url}: {e}")

    def extract_from_html(self, soup, url):
        s = self.config["selectors"]
        raw_text = soup.get_text(" ")
        
        # Extract basic fields first
        data = {
            "title": unquote(self.extract_text(soup, s.get("title")) or "N/A"),
            "url": url,
            "funding_amount": self.extract_text(soup, s.get("funding")) or "N/A",
            "deadline": self.extract_deadline(soup, s.get("deadline")) or "N/A",
            "program_type": self.config.get("program_type", "Incentive"),
            "eligibility": self.extract_text(soup, s.get("eligibility")) or "N/A",
            "source_type": "HTML",
            "language": detect(raw_text) if raw_text.strip() else "und"
        }

        # Use AI extraction for comprehensive data
        print("🤖 Using AI extraction for comprehensive field extraction...")
        ai_result = self.ai.extract_fields(raw_text)
        
        # Update data with AI results and map to proper fields
        if ai_result:
            # Map AI results to expected data structure
            if ai_result.get("title") and ai_result["title"] != "N/A":
                data["title"] = ai_result["title"]
            if ai_result.get("funding_amount") and ai_result["funding_amount"] != "N/A":
                data["funding_amount"] = ai_result["funding_amount"]
            if ai_result.get("deadline") and ai_result["deadline"] != "N/A":
                data["deadline"] = ai_result["deadline"]
            if ai_result.get("eligibility") and ai_result["eligibility"] != "N/A":
                data["eligibility"] = ai_result["eligibility"]
            
            # Add new fields from AI extraction
            data["provider"] = ai_result.get("provider", "Government")
            data["project_types"] = ai_result.get("project_types", "General")
            data["description"] = ai_result.get("description", "Government incentive program")

        return data

    def detect_pdf_links(self, soup, base_url):
        pdfs = set()
        for tag in soup.find_all("a", href=True):
            href = tag["href"]
            text = tag.get_text().lower()
            if self.pdf_pattern.search(href) or any(ind in text for ind in self.pdf_indicators):
                from urllib.parse import urljoin
                full_url = urljoin(base_url, href)
                if full_url not in self.visited_urls:
                    pdfs.add(full_url)
        return pdfs

    def process_pdf(self, url):
        try:
            if ".pdf" in url and "irs.gov" in url:
                print(f"⚠️ Skipping broken IRS PDF: {url}")
                return None

            response = self.session.get(url, stream=True, timeout=30)
            size = int(response.headers.get("content-length", 0))
            if size < self.pdf_min_size or size > self.pdf_max_size:
                return None

            with io.BytesIO(response.content) as f:
                reader = PdfReader(f)
                text = "\n".join(page.extract_text() or '' for page in reader.pages)

            if not text.strip():
                raise ValueError("Empty PDF")

            ai_result = self.ai.extract_fields(text)
            return {
                "title": unquote(Path(urlparse(url).path).name),
                "url": url,
                "funding_amount": ai_result.get("funding_amount", "N/A"),
                "deadline": ai_result.get("deadline", "N/A"),
                "program_type": ai_result.get("program_type", self.config.get("program_type", "Document")),
                "eligibility": ai_result.get("eligibility", "N/A"),
                "source_type": "PDF",
                "language": detect(text) if text.strip() else "und"
            }

        except Exception as e:
            print(f"❌ PDF parsing error: {e}")
            bad_dir = Path("bad_pdfs")
            bad_dir.mkdir(exist_ok=True)
            filename = bad_dir / Path(urlparse(url).path).name
            try:
                with open(filename, "wb") as f:
                    f.write(response.content)
            except Exception as save_err:
                print(f"⚠️ Failed to save bad PDF: {save_err}")
            return None

    def extract_text(self, soup, selector):
        try:
            if not selector:
                return None
            el = soup.select_one(selector)
            return re.sub(r"\s+", " ", el.get_text(strip=True)) if el else None
        except:
            return None

    def extract_deadline(self, soup, selector):
        raw = self.extract_text(soup, selector)
        if not raw:
            return None
        try:
            return parse(raw, fuzzy=True).strftime("%Y-%m-%d")
        except:
            return raw.strip()

    def is_bad(self, val):
        if not val:
            return True
        val = val.strip()
        return val == "N/A" or "PrintShare" in val or "Next Section" in val or len(val) > 2000

    def save(self):
        if not self.results:
            print("⚠️ No results to save")
            return
        
        df = pd.DataFrame(self.results)
        if self.output_path:
            self.output_path.parent.mkdir(parents=True, exist_ok=True)
            df.to_csv(self.output_path, index=False, encoding="utf-8-sig")
            print(f"💾 Saved {len(df)} records to {self.output_path}")
        
        return self.results