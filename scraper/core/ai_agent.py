import os
import json
import re
import requests
from dotenv import load_dotenv
load_dotenv()

class AIAgent:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        self.fallback_enabled = True
        
    def extract_fields(self, raw_text):
        """Extract structured data from government incentive text using DeepSeek API"""
        prompt = f"""
Extract government incentive information from this text. Return ONLY a JSON object with these exact fields:

{{
  "title": "Program name or incentive name",
  "provider": "Government agency or organization",
  "funding_amount": "Dollar amount, percentage, or funding range (e.g. '$50,000', '30% tax credit')", 
  "deadline": "Application deadline, expiration date, or program status",
  "project_types": "Eligible technologies or sectors (e.g. 'Solar, Wind, Energy Storage')",
  "eligibility": "Who can apply or requirements",
  "description": "Brief program description"
}}

TEXT:
{raw_text[:4000]}

Return only valid JSON. If any field is not found, use "N/A".
"""

        # Try OpenAI GPT-3.5 API first
        if self.api_key:
            try:
                response = requests.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-3.5-turbo",
                        "messages": [
                            {"role": "system", "content": "You are an expert at extracting structured data from government documents. Return only valid JSON."},
                            {"role": "user", "content": prompt}
                        ],
                        "max_tokens": 1000,
                        "temperature": 0.2
                    },
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    content = result["choices"][0]["message"]["content"].strip()
                    
                    # Clean up content to extract JSON
                    if content.startswith("```json"):
                        content = content[7:]
                    if content.endswith("```"):
                        content = content[:-3]
                    content = content.strip()
                    
                    extracted_data = json.loads(content)
                    print(f"🤖 OpenAI extraction successful: {extracted_data.get('title', 'N/A')}")
                    return extracted_data
                else:
                    print(f"OpenAI API error: {response.status_code} - {response.text}")
                    
            except Exception as e:
                print(f"OpenAI extraction failed: {e}")
        
        # Fallback to pattern matching
        print("Using fallback pattern matching extraction")
        return self.fallback_extraction(raw_text)
    
    def fallback_extraction(self, text):
        """Pattern matching fallback when API is unavailable"""
        data = {
            "title": "N/A",
            "provider": "N/A", 
            "funding_amount": "N/A",
            "deadline": "N/A",
            "project_types": "N/A",
            "eligibility": "N/A",
            "description": "N/A"
        }
        
        # Extract title with comprehensive patterns
        title_patterns = [
            r'<h1[^>]*>([^<]+)</h1>',
            r'<title[^>]*>([^<]+)</title>',
            r'((?:investment|energy|solar|wind|tax)\s+(?:tax\s+)?(?:credit|incentive|program|rebate))',
            r'([^.\n]{10,100}(?:credit|incentive|program|rebate|grant))',
            r'(?:section\s+\d+[a-z]?)[:\s]*([^.\n]{5,80})'
        ]
        for pattern in title_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                data["title"] = match.group(1).strip()
                break
        
        # Extract funding amounts
        money_patterns = [
            r'\$[\d,]+(?:\.\d{2})?(?:\s*(?:million|billion|thousand|k|m|b))?',
            r'(?:\d{1,3}(?:,\d{3})*|\d+)(?:\.\d{2})?\s*(?:percent|%)',
            r'(?:up\s+to\s+)?\$[\d,]+',
            r'\d+%\s*(?:tax\s+)?credit'
        ]
        for pattern in money_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data["funding_amount"] = match.group(0).strip()
                break
        
        # Extract provider/agency
        provider_patterns = [
            r'((?:Department|Agency|Commission|Authority|Service)\s+of\s+[^.\n]{5,50})',
            r'((?:EPA|IRS|DOE|HUD|NYSERDA|DSIRE)[^.\n]{0,30})',
            r'((?:Federal|State|Local|Municipal)\s+[^.\n]{5,40})'
        ]
        for pattern in provider_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data["provider"] = match.group(1).strip()
                break
        
        # Extract project types
        tech_keywords = ['solar', 'wind', 'geothermal', 'battery', 'storage', 'hvac', 'insulation', 'efficiency', 'retrofit']
        found_techs = []
        for tech in tech_keywords:
            if re.search(rf'\b{tech}\b', text, re.IGNORECASE):
                found_techs.append(tech.title())
        if found_techs:
            data["project_types"] = ', '.join(found_techs[:3])
        
        # Extract deadlines
        deadline_patterns = [
            r'(?:deadline|expires?|due|until)[:\s]*([^.\n]{5,30})',
            r'(?:by|before)\s+([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})',
            r'(\d{4}-\d{2}-\d{2})',
            r'(December\s+31,?\s+\d{4})'
        ]
        for pattern in deadline_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                data["deadline"] = match.group(1).strip()
                break
        
        print(f"📋 Fallback extraction: {data['title']}")
        return data