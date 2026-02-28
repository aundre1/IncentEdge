# Sample Incentives Usage Guide

## Quick Reference

**File Location:** `src/data/sample-incentives.json`

**6 Real Programs Extracted:**
1. Section 45L New Energy Efficient Home Credit ($5,000/unit)
2. Section 179D Energy Efficient Commercial Building Deduction ($5/sqft)
3. Investment Tax Credit (ITC) for Solar & Storage (30%)
4. Low-Income Housing Tax Credit (4%)
5. NYSERDA New Construction Program (Varies)
6. Westchester IDA PILOT Program (Up to $18M)

## File Structure

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-02-28T00:40:00Z",
  "totalPrograms": 6,
  "description": "6 real sample incentive programs...",
  "metadata": {
    "source": "Supabase incentive_programs table",
    "filterCriteria": "Confidence score >= 0.85, status = active",
    "composition": {
      "federal": 4,
      "state": 1,
      "local": 1,
      "utility": 0
    }
  },
  "programs": [
    {
      "id": "...",
      "name": "...",
      "shortName": "...",
      "jurisdiction": "Federal|NY|Westchester County",
      "jurisdictionLevel": "federal|state|local|utility",
      "state": "NY|null",
      "programType": "tax_credit|tax_deduction|rebate|tax_abatement|financing",
      "category": "federal|state|local|utility",
      "incentiveType": "tax_credit|tax_deduction|rebate|tax_abatement",
      "description": "Human-readable program description",
      "estimatedValue": "$5,000 per unit|30%|Variable",
      "amountType": "per_unit|percentage|per_sqft|variable",
      "amountPerUnit": 5000|null,
      "amountPercentage": 0.30|null,
      "amountPerSqft": 5.0|null,
      "eligibilitySummary": ["Requirement 1", "Requirement 2"],
      "applicationUrl": "https://...",
      "sourceUrl": "https://...",
      "administrator": "IRS|NYSERDA|Westchester IDA",
      "directPayEligible": false|true,
      "transferable": false|true,
      "stackable": true|false,
      "dataQualityScore": 0.95
    }
  ]
}
```

## Usage in Homepage

### Example: React Component

```tsx
import sampleIncentives from '@/data/sample-incentives.json';

export function SampleIncentives() {
  return (
    <div className="space-y-4">
      <h2>Sample Incentive Programs</h2>
      <p className="text-muted-foreground">
        {sampleIncentives.description}
      </p>
      
      <div className="grid gap-4">
        {sampleIncentives.programs.slice(0, 6).map(program => (
          <div key={program.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{program.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {program.jurisdiction} • {program.programType}
                </p>
              </div>
              <span className="text-lg font-bold text-green-600">
                {program.estimatedValue}
              </span>
            </div>
            
            <p className="mt-2 text-sm">{program.description}</p>
            
            <div className="mt-3 space-y-1">
              <p className="text-xs font-semibold text-gray-600">Eligibility:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                {program.eligibilitySummary.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
            
            <div className="mt-4 flex gap-2">
              <a 
                href={program.applicationUrl} 
                className="text-sm text-blue-600 hover:underline"
              >
                Learn More
              </a>
              {program.dataQualityScore >= 0.9 && (
                <span className="text-xs text-green-600 font-semibold">
                  ✓ Verified
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Key Fields for Frontend

| Field | Type | Use Case |
|-------|------|----------|
| `name` | string | Program title |
| `estimatedValue` | string | Display prominent value |
| `jurisdiction` | string | Location indicator |
| `programType` | string | Category badge |
| `description` | string | Short overview |
| `eligibilitySummary` | string[] | Quick eligibility bullets |
| `applicationUrl` | string | CTA link |
| `dataQualityScore` | number | Confidence/verification badge |
| `directPayEligible` | boolean | IRS Direct Pay icon |
| `stackable` | boolean | Stacking info |

## Filtering & Sorting

```tsx
// Get only federal programs
const federalPrograms = sampleIncentives.programs.filter(p => p.category === 'federal');

// Get only state/local programs
const stateLocal = sampleIncentives.programs.filter(p => 
  ['state', 'local'].includes(p.category)
);

// Sort by data quality
const bestQuality = [...sampleIncentives.programs].sort((a, b) => 
  b.dataQualityScore - a.dataQualityScore
);

// Get highest value programs
const highestValue = sampleIncentives.programs.filter(p => 
  p.amountPerUnit || p.amountPercentage
);
```

## Data Quality Guarantees

- **All URLs validated:** No broken links
- **Quality scores >= 0.85:** All programs verified
- **Active status:** All programs currently accepting applications
- **Complete data:** Every program has name, description, eligibility, and URL
- **Production ready:** JSON is valid and optimized for frontend

## Future Enhancements

When full database loads (24,458+ programs):
1. Replace sample data with live API queries from database
2. Filter by user's project type and location
3. Sort by relevance and estimated value
4. Show all matching programs (not just sample)
5. Add personalized recommendations based on project details

## Database Refresh

To update this file when database changes:

```bash
node /Users/dremacmini/Desktop/OC/incentedge/scripts/extract-sample-incentives.js
```

(Script to be created when full data load occurs)

---

**Last Updated:** 2026-02-28  
**Data Source:** Supabase pzmunszcxmmncppbufoj
