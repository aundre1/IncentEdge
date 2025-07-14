import os

# Instructions for setting OpenAI API key
print("To set your OpenAI API key, copy and paste this command into the shell:")
print()
print("export OPENAI_API_KEY='sk-your-actual-key-here'")
print()
print("Replace 'sk-your-actual-key-here' with your real OpenAI API key")
print()
print("After setting the key, run: python3 test_scraper.py")

# Create test script
test_script = '''import os
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
'''

with open('test_scraper.py', 'w') as f:
    f.write(test_script)

print("Test script created. After setting your API key, run: python3 test_scraper.py")