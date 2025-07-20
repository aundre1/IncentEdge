# Data Verification Strategy for IncentEdge

## Current Data Quality Assessment
- **Total Programs**: 2,240
- **Estimated Synthetic**: 70-80% (1,600-1,800 programs)
- **Verified Authentic**: 20-30% (400-600 programs)

## Verification Methods

### 1. Automated Web Verification
**Process**: Use existing OpenAI scraper infrastructure to verify program existence
**Target Sources**:
- State energy office websites (NY, NJ, PA, MA, CT, VT, NH, ME, RI, DE)
- Federal agency websites (DOE, EPA, IRS, Treasury)
- Utility company websites (National Grid, PSEG, ConEd, Eversource)

**Implementation**:
```python
# Verify state energy office programs
for program in state_energy_programs:
    verify_url = f"https://{state}energy.gov/programs/{program_slug}"
    result = scrape_and_verify(verify_url, program.name, program.amount)
```

### 2. API-Based Verification
**Sources with APIs**:
- DSIRE Database (Database of State Incentives for Renewables & Efficiency)
- Energy.gov APIs
- EPA grant databases
- IRS tax credit databases

**Benefits**: Real-time verification, structured data, official sources

### 3. Cross-Reference Verification
**Process**: Match program names and amounts against known databases
- DSIRE database exports
- NYSERDA program listings
- Federal grant databases (Grants.gov)
- Utility company program catalogs

### 4. Manual Spot-Check Verification
**High-Priority Programs**:
- Programs >$1B funding
- State energy office "template" programs
- Federal agency programs with generic descriptions

## Implementation Priority

### Phase 1: Critical Programs (Week 1)
1. Verify all programs >$1B funding amount
2. Cross-check NYSERDA programs against official website
3. Validate major federal programs (EPA $27B, DOE loan programs)

### Phase 2: State Programs (Week 2-3)
1. Systematic verification of state energy office programs
2. Remove obvious synthetic duplicates
3. Verify utility programs against company websites

### Phase 3: Federal Programs (Week 4)
1. Comprehensive federal agency verification
2. Tax credit verification through IRS sources
3. Grant program verification through Grants.gov

## Verification Tools

### Existing Infrastructure
- OpenAI API integration (operational)
- Python scraping framework
- Database update capabilities

### New Tools Needed
- DSIRE API integration
- Grants.gov API connection
- Automated verification scoring system

## Quality Metrics

### Verification Confidence Levels
- **Level 5**: Direct API verification + amount confirmation
- **Level 4**: Official website verification + amount match
- **Level 3**: Program exists but amount unverified
- **Level 2**: Program name found but details differ
- **Level 1**: Cannot verify (flag for removal)

### Success Targets
- 90%+ of >$1B programs verified (Level 4+)
- 80%+ of state programs verified (Level 3+)
- 70%+ of federal programs verified (Level 3+)

## Database Schema Updates

```sql
ALTER TABLE incentives ADD COLUMN verification_level INTEGER DEFAULT 0;
ALTER TABLE incentives ADD COLUMN verification_date TIMESTAMP;
ALTER TABLE incentives ADD COLUMN verification_source VARCHAR(255);
ALTER TABLE incentives ADD COLUMN verification_notes TEXT;
```

## Investor Presentation Strategy

### Tiered Data Presentation
- **Tier 1**: Fully verified programs (Level 4-5) - show to all investors
- **Tier 2**: Partially verified (Level 3) - show with disclaimer
- **Tier 3**: Unverified (Level 1-2) - internal use only

### Conservative Metrics
- Present only verified funding amounts
- Use verified program counts in marketing
- Include verification methodology in investor materials

## Timeline
- **Week 1**: High-priority verification (500 programs)
- **Week 2-3**: State program verification (1,000 programs)
- **Week 4**: Federal program verification (500 programs)
- **Ongoing**: Real-time verification for new programs

## Cost Estimation
- OpenAI API costs: ~$200-500 for full verification
- Development time: 1-2 weeks for automation
- Manual verification: 40-60 hours for spot-checking

## Risk Mitigation
- Flag all unverified programs clearly
- Implement automatic reverification (quarterly)
- Maintain audit trail for all changes
- Create rollback capability for incorrect updates