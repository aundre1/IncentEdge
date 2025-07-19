#!/usr/bin/env python3
"""
Batch scraping script to process all expansion YAML configs and scale to 1000+ programs
"""

import yaml
import asyncio
import aiohttp
import os
from pathlib import Path
import subprocess
import time
from datetime import datetime

class ExpansionScrapingEngine:
    def __init__(self):
        self.config_dir = Path("scraper/configs")
        self.expansion_configs = [
            "usda_rural_development.yaml",
            "sba_green_business.yaml", 
            "dot_transportation.yaml",
            "commerce_innovation.yaml",
            "treasury_financing.yaml",
            "nj_clean_energy.yaml",
            "ma_clean_energy.yaml",
            "pa_energy_programs.yaml",
            "ct_green_programs.yaml",
            "utility_northeast.yaml",
            "municipal_northeast.yaml",
            "foundations_climate.yaml"
        ]
        
    def get_expected_totals(self):
        """Calculate expected program totals from all configs"""
        total_expected = 0
        breakdown = {}
        
        for config_file in self.expansion_configs:
            config_path = self.config_dir / config_file
            if config_path.exists():
                with open(config_path, 'r') as f:
                    config = yaml.safe_load(f)
                    expected = config.get('expected_programs', 0)
                    total_expected += expected
                    breakdown[config['name']] = expected
        
        return total_expected, breakdown
    
    def validate_configs(self):
        """Validate all expansion configs exist and are properly formatted"""
        valid_configs = []
        missing_configs = []
        
        for config_file in self.expansion_configs:
            config_path = self.config_dir / config_file
            if config_path.exists():
                try:
                    with open(config_path, 'r') as f:
                        config = yaml.safe_load(f)
                        # Validate required fields
                        required_fields = ['name', 'base_url', 'expected_programs']
                        if all(field in config for field in required_fields):
                            valid_configs.append(config_file)
                        else:
                            missing_fields = [f for f in required_fields if f not in config]
                            print(f"❌ {config_file}: Missing fields {missing_fields}")
                except yaml.YAMLError as e:
                    print(f"❌ {config_file}: YAML parsing error - {e}")
            else:
                missing_configs.append(config_file)
        
        return valid_configs, missing_configs
    
    def run_batch_scraping(self, configs_to_run=None):
        """Execute batch scraping for specified configs"""
        if configs_to_run is None:
            configs_to_run = self.expansion_configs
        
        print("🚀 Starting IncentEdge Database Expansion")
        print("=" * 60)
        
        total_expected, breakdown = self.get_expected_totals()
        print(f"📊 Target: {total_expected} programs across {len(configs_to_run)} sources")
        print()
        
        results = {}
        total_scraped = 0
        
        for config_file in configs_to_run:
            config_path = self.config_dir / config_file
            if not config_path.exists():
                print(f"⚠️  Skipping {config_file} - file not found")
                continue
            
            with open(config_path, 'r') as f:
                config = yaml.safe_load(f)
            
            source_name = config['name']
            expected = config.get('expected_programs', 0)
            
            print(f"🔍 Processing: {source_name}")
            print(f"   Expected: {expected} programs")
            
            # Run scraping command
            try:
                cmd = [
                    "python3", "comprehensive_deep_crawl.py",
                    "--config", str(config_path),
                    "--output", f"expansion_results/{config_file.replace('.yaml', '.csv')}"
                ]
                
                start_time = time.time()
                result = subprocess.run(cmd, capture_output=True, text=True, timeout=1800)  # 30 min timeout
                duration = time.time() - start_time
                
                if result.returncode == 0:
                    # Parse output to get actual scraped count
                    scraped_count = self.parse_scraped_count(result.stdout)
                    total_scraped += scraped_count
                    results[source_name] = {
                        'expected': expected,
                        'scraped': scraped_count,
                        'duration': duration,
                        'status': 'success'
                    }
                    print(f"   ✅ Scraped: {scraped_count} programs ({duration:.1f}s)")
                else:
                    print(f"   ❌ Failed: {result.stderr[:100]}...")
                    results[source_name] = {
                        'expected': expected,
                        'scraped': 0,
                        'duration': duration,
                        'status': 'failed',
                        'error': result.stderr[:200]
                    }
                
            except subprocess.TimeoutExpired:
                print(f"   ⏰ Timeout after 30 minutes")
                results[source_name] = {
                    'expected': expected,
                    'scraped': 0,
                    'duration': 1800,
                    'status': 'timeout'
                }
            except Exception as e:
                print(f"   ❌ Error: {e}")
                results[source_name] = {
                    'expected': expected,
                    'scraped': 0,
                    'duration': 0,
                    'status': 'error',
                    'error': str(e)
                }
            
            print()
        
        return self.generate_summary_report(results, total_expected, total_scraped)
    
    def parse_scraped_count(self, output):
        """Parse the scraped program count from scraper output"""
        lines = output.split('\n')
        for line in lines:
            if 'programs extracted' in line.lower():
                try:
                    # Extract number from output like "45 programs extracted"
                    count = int(''.join(filter(str.isdigit, line)))
                    return count
                except ValueError:
                    pass
        return 0
    
    def generate_summary_report(self, results, total_expected, total_scraped):
        """Generate comprehensive summary report"""
        print("📈 EXPANSION SUMMARY REPORT")
        print("=" * 60)
        
        successful_sources = [name for name, data in results.items() if data['status'] == 'success']
        failed_sources = [name for name, data in results.items() if data['status'] in ['failed', 'timeout', 'error']]
        
        print(f"🎯 Target Achievement: {total_scraped}/{total_expected} programs ({(total_scraped/total_expected)*100:.1f}%)")
        print(f"✅ Successful Sources: {len(successful_sources)}/{len(results)}")
        print(f"❌ Failed Sources: {len(failed_sources)}")
        print()
        
        if successful_sources:
            print("✅ SUCCESSFUL EXTRACTIONS:")
            for source in successful_sources:
                data = results[source]
                print(f"   {source}: {data['scraped']}/{data['expected']} programs ({data['duration']:.1f}s)")
        
        if failed_sources:
            print()
            print("❌ FAILED EXTRACTIONS:")
            for source in failed_sources:
                data = results[source]
                print(f"   {source}: {data['status']} - {data.get('error', 'Unknown error')[:100]}")
        
        print()
        print("📊 CATEGORY BREAKDOWN:")
        
        # Calculate by category
        federal_count = sum(data['scraped'] for name, data in results.items() 
                          if any(x in name.lower() for x in ['usda', 'sba', 'dot', 'treasury', 'commerce']))
        state_count = sum(data['scraped'] for name, data in results.items()
                         if any(x in name.lower() for x in ['nj', 'ma', 'pa', 'ct', 'new jersey', 'massachusetts']))
        utility_count = sum(data['scraped'] for name, data in results.items()
                          if 'utility' in name.lower())
        municipal_count = sum(data['scraped'] for name, data in results.items()
                            if 'municipal' in name.lower())
        foundation_count = sum(data['scraped'] for name, data in results.items()
                             if 'foundation' in name.lower())
        
        print(f"   Federal Programs:    {federal_count:4d}")
        print(f"   State Programs:      {state_count:4d}")
        print(f"   Utility Programs:    {utility_count:4d}")
        print(f"   Municipal Programs:  {municipal_count:4d}")
        print(f"   Foundation Programs: {foundation_count:4d}")
        print(f"   {'Total':20}: {total_scraped:4d}")
        
        # Calculate database impact
        current_programs = 187  # Current database size
        new_total = current_programs + total_scraped
        
        print()
        print("🎯 DATABASE IMPACT:")
        print(f"   Current Database:  {current_programs} programs")
        print(f"   New Programs:      {total_scraped} programs")
        print(f"   Final Database:    {new_total} programs")
        print(f"   Growth Factor:     {new_total/current_programs:.1f}x")
        
        if new_total >= 1000:
            print("   🎉 TARGET ACHIEVED: 1000+ programs!")
        else:
            remaining = 1000 - new_total
            print(f"   📈 Remaining to 1000: {remaining} programs")
        
        # Generate next steps
        print()
        print("🚀 NEXT STEPS:")
        print("1. Import successful extractions to database")
        print("2. Review and retry failed sources")
        print("3. Add additional configs if target not reached") 
        print("4. Validate data quality and remove duplicates")
        
        return results

def main():
    """Main execution function"""
    engine = ExpansionScrapingEngine()
    
    # Validate configs first
    valid_configs, missing_configs = engine.validate_configs()
    
    if missing_configs:
        print(f"⚠️  Missing config files: {missing_configs}")
    
    if not valid_configs:
        print("❌ No valid config files found. Exiting.")
        return
    
    print(f"✅ Found {len(valid_configs)} valid config files")
    
    # Show expected totals
    total_expected, breakdown = engine.get_expected_totals()
    print(f"📊 Expected total programs: {total_expected}")
    
    # Create results directory
    os.makedirs("expansion_results", exist_ok=True)
    
    # Run batch scraping
    results = engine.run_batch_scraping(valid_configs)
    
    # Save detailed results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    with open(f"expansion_results/summary_{timestamp}.yaml", 'w') as f:
        yaml.dump(results, f, default_flow_style=False)
    
    print(f"📁 Detailed results saved to: expansion_results/summary_{timestamp}.yaml")

if __name__ == "__main__":
    main()