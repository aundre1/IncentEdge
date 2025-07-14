#!/usr/bin/env python3
import os
import sys
from openai import OpenAI

def test_openai_key(api_key):
    """Test if OpenAI API key works"""
    try:
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model='gpt-4o-mini',
            messages=[{'role': 'user', 'content': 'Test connection'}],
            max_tokens=5
        )
        return True, "API key working"
    except Exception as e:
        return False, str(e)

def main():
    print("Enter your OpenAI API key (starts with sk-):")
    api_key = input().strip()
    
    if not api_key.startswith('sk-'):
        print("Invalid key format. Should start with 'sk-'")
        return
    
    # Test the key
    works, message = test_openai_key(api_key)
    
    if works:
        print("✅ API key verified and working!")
        
        # Set environment variable for current session
        os.environ['OPENAI_API_KEY'] = api_key
        
        # Write to .env file for persistence
        with open('.env', 'a') as f:
            f.write(f'\nOPENAI_API_KEY={api_key}\n')
        
        print("Key saved. Starting government data scraping...")
        
        # Import and run scraper
        sys.path.append('scraper')
        from core.scraper import DynamicScraper
        
        sources = ['irs_clean_energy', 'nyserda', 'doe']
        total_extracted = 0
        
        for source in sources:
            try:
                scraper = DynamicScraper(source, f'/tmp/{source}_data.csv')
                scraper.run()
                if scraper.results:
                    total_extracted += len(scraper.results)
                    print(f"Extracted {len(scraper.results)} programs from {source}")
            except Exception as e:
                print(f"Error with {source}: {e}")
        
        print(f"Total programs extracted: {total_extracted}")
        
    else:
        print(f"❌ API key error: {message}")

if __name__ == "__main__":
    main()