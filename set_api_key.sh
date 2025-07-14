#!/bin/bash
echo "Setting OpenAI API Key..."
echo "Please paste your OpenAI API key (starts with sk-) and press Enter:"
read -r api_key
export OPENAI_API_KEY="$api_key"
echo "API key set successfully!"
echo "Testing the key..."
python3 -c "
import os
from openai import OpenAI
try:
    client = OpenAI(api_key=os.environ['OPENAI_API_KEY'])
    response = client.chat.completions.create(
        model='gpt-4o-mini',
        messages=[{'role': 'user', 'content': 'Test'}],
        max_tokens=5
    )
    print('✅ OpenAI API key is working!')
except Exception as e:
    print(f'❌ Error: {e}')
"