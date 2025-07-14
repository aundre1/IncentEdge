import os
import sys
sys.path.append('scraper')
from core.ai_agent import AIAgent

# Test OpenAI connection
agent = AIAgent()
test_text = """
Federal Clean Energy Tax Credit
30% tax credit for solar installations
Available through 2032
Residential and commercial properties eligible
"""

print("Testing OpenAI API connection...")
result = agent.extract_fields(test_text)
print("Extraction result:", result)

if result.get('title') != 'N/A':
    print("✅ OpenAI API working! Starting comprehensive scraping...")
    
    # Trigger comprehensive scraping
    import requests
    response = requests.post('http://localhost:5000/api/scraper/trigger', 
                           json={"sources": ["irs_clean_energy", "nyserda", "doe", "hud"], "immediate": True})
    print("Scraping job started:", response.json())
else:
    print("❌ API key not working. Please check your OpenAI account.")
