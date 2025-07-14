import pandas as pd
import re

# Read the CSV file
df = pd.read_csv('attached_assets/all_sites_output_1750952439758.csv')

print("Analyzing CSV data for legitimate government incentive programs...\n")

# Clean and filter data
valid_programs = []
filtered_out = []

for index, row in df.iterrows():
    title = str(row['title']).strip() if pd.notna(row['title']) else ''
    url = str(row['url']).strip() if pd.notna(row['url']) else ''
    funding_amount = str(row['funding_amount']).strip() if pd.notna(row['funding_amount']) else ''
    deadline = str(row['deadline']).strip() if pd.notna(row['deadline']) else 'Not specified'
    program_type = str(row['program_type']).strip() if pd.notna(row['program_type']) else 'Unknown'
    eligibility = str(row['eligibility']).strip() if pd.notna(row['eligibility']) else 'Not specified'
    source_type = str(row['source_type']).strip() if pd.notna(row['source_type']) else 'Unknown'
    language = str(row['language']).strip() if pd.notna(row['language']) else 'en'
    
    # Skip invalid entries
    if not title or title == 'nan' or title == 'N/A':
        filtered_out.append(f"Missing title: {title}")
        continue
        
    # Skip PDF files and technical documents
    if '.pdf' in title or '.ashx' in title or 'FactSheet' in title:
        filtered_out.append(f"Document file: {title}")
        continue
        
    # Skip navigation pages and generic listings
    if any(x in title for x in ['Summary Tables', 'Programs', 'News', 'Sign in', '{{ program', 'Navigation']):
        filtered_out.append(f"Generic page: {title}")
        continue
        
    # Skip non-English unless it's a major program
    if language != 'en' and not any(x in title for x in ['Tax Credit', 'Program', 'Credit']):
        filtered_out.append(f"Non-English: {title} ({language})")
        continue
        
    # Skip entries without meaningful funding
    if not funding_amount or funding_amount in ['nan', 'N/A', 'Not specified', 'No specific']:
        filtered_out.append(f"No funding info: {title}")
        continue
        
    # Get provider from URL
    provider = 'Unknown'
    if 'cdfifund.gov' in url:
        provider = 'CDFI Fund'
    elif 'energy.gov' in url:
        provider = 'Department of Energy'
    elif 'epa.gov' in url:
        provider = 'EPA'
    elif 'esd.ny.gov' in url:
        provider = 'New York ESD'
    elif 'irs.gov' in url:
        provider = 'IRS'
    elif 'nyserda.ny.gov' in url:
        provider = 'NYSERDA'
    elif 'dsireusa.org' in url:
        provider = 'DSIRE Database'
    elif 'dol.gov' in url:
        provider = 'Department of Labor'
    
    # Map program types to our categories
    mapped_type = 'Energy Efficiency'
    if 'Tax Credit' in program_type:
        mapped_type = 'Tax Credit'
    elif 'Grant' in program_type:
        mapped_type = 'Grant'
    elif 'Environmental' in program_type:
        mapped_type = 'Environmental Incentive'
    elif 'Inflation Reduction' in program_type:
        mapped_type = 'Federal Program'
    
    # Create program entry
    program = {
        'title': title,
        'provider': provider,
        'type': mapped_type,
        'amount': funding_amount,
        'deadline': deadline,
        'eligibility': eligibility[:200] + '...' if len(eligibility) > 200 else eligibility,
        'url': url,
        'source_type': source_type
    }
    
    valid_programs.append(program)

# Remove duplicates based on title
seen_titles = set()
unique_programs = []
for program in valid_programs:
    title_key = program['title'].lower().strip()
    if title_key not in seen_titles:
        seen_titles.add(title_key)
        unique_programs.append(program)
    else:
        filtered_out.append(f"Duplicate: {program['title']}")

print(f"=== ANALYSIS RESULTS ===")
print(f"Total entries processed: {len(df)}")
print(f"Valid programs found: {len(unique_programs)}")
print(f"Invalid/filtered entries: {len(filtered_out)}\n")

print(f"=== LEGITIMATE PROGRAMS FOR DATABASE ===\n")

# Group by provider
providers = {}
for program in unique_programs:
    provider = program['provider']
    if provider not in providers:
        providers[provider] = []
    providers[provider].append(program)

for provider, programs in providers.items():
    print(f"--- {provider} ({len(programs)} programs) ---")
    for i, program in enumerate(programs, 1):
        print(f"{i}. {program['title']}")
        print(f"   Type: {program['type']}")
        print(f"   Amount: {program['amount']}")
        print(f"   Deadline: {program['deadline']}")
        print(f"   Eligibility: {program['eligibility']}")
        print(f"   URL: {program['url'][:80]}...")
        print()

print(f"\n=== SUMMARY BY PROVIDER ===")
for provider, programs in providers.items():
    print(f"{provider}: {len(programs)} programs")

print(f"\n=== FILTERED OUT EXAMPLES ===")
for reason in filtered_out[:15]:
    print(f"- {reason}")
if len(filtered_out) > 15:
    print(f"... and {len(filtered_out) - 15} more")