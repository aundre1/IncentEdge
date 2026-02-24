# IncentEdge Incentive Program Extraction - Quick Start Guide

## Overview

This guide shows how to use the incentive program extraction system to convert PDFs into structured incentive program data.

## 3-Step Process

### Step 1: Upload PDF Document

**Endpoint:** `POST /api/programs/ingest`

Upload a PDF containing incentive programs:

```bash
curl -X POST http://localhost:3000/api/programs/ingest \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@incentive-programs.pdf"
```

**Response:**
```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "processing",
  "message": "Document queued for extraction. Poll the status endpoint for results."
}
```

**What Happens:**
1. PDF is uploaded to Supabase Storage
2. Document record created in `documents` table
3. Background job created in `background_jobs` table
4. Job status set to `queued`

### Step 2: Process the Document

**Endpoint:** `POST /api/programs/ingest/process`

Trigger extraction processing (usually done by background worker):

```bash
curl -X POST http://localhost:3000/api/programs/ingest/process \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"}'
```

**Response:**
```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "success",
  "programs_extracted": 8,
  "programs_needing_review": 2,
  "message": "Extraction completed successfully"
}
```

**What Happens:**
1. PDF is downloaded and text extracted
2. Anthropic API classifies document (issuer, type, region)
3. Anthropic API extracts all programs (name, amount, deadline, etc.)
4. Anthropic API validates and scores confidence
5. Programs with confidence >= 0.8 are saved to `incentive_programs`
6. Programs with confidence < 0.8 are marked `needs_review`
7. Job status updated to `completed` or `needs_review`

### Step 3: Poll for Results

**Endpoint:** `GET /api/programs/ingest/status/[jobId]`

Check extraction status and get results:

```bash
curl http://localhost:3000/api/programs/ingest/status/a1b2c3d4-e5f6-7890-abcd-ef1234567890 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

**Response (In Progress):**
```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "processing",
  "programs_extracted": 0,
  "programs_needing_review": 0,
  "message": "Extraction in progress..."
}
```

**Response (Complete):**
```json
{
  "job_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "status": "completed",
  "programs_extracted": 8,
  "programs_needing_review": 2,
  "results": [
    {
      "name": "Solar Rebate Program",
      "confidence_score": 0.95,
      "low_confidence_fields": [],
      "warnings": []
    },
    ...
  ],
  "completed_at": "2026-02-24T18:30:45.123Z"
}
```

## Example: Complete Workflow

```bash
#!/bin/bash
API_BASE="http://localhost:3000"
TOKEN="your-auth-token"

# Step 1: Upload PDF
echo "Uploading PDF..."
UPLOAD=$(curl -s -X POST "$API_BASE/api/programs/ingest" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@nyserda-rebates.pdf")

JOB_ID=$(echo $UPLOAD | jq -r '.job_id')
echo "Job created: $JOB_ID"

# Step 2: Process extraction
echo "Processing extraction..."
curl -s -X POST "$API_BASE/api/programs/ingest/process" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"job_id\": \"$JOB_ID\"}" | jq .

# Step 3: Get results
echo "Fetching results..."
curl -s "$API_BASE/api/programs/ingest/status/$JOB_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .

# View in database
echo "Programs saved to database:"
curl -s "$API_BASE/api/programs?source=document_extraction_$JOB_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.programs | length'
```

## Confidence Scores

Programs are automatically classified by confidence level:

| Score | Status | Action |
|-------|--------|--------|
| 0.9-1.0 | ✅ Auto-approved | Ready for users immediately |
| 0.7-0.89 | ⚠️ Needs review | Queued for human review |
| 0.5-0.69 | 🔴 Low confidence | High priority for review |
| < 0.5 | ❌ Failed | Requires human extraction |

**Example Response:**
```json
{
  "status": "needs_review",
  "programs_extracted": 8,
  "programs_needing_review": 2,
  "results": [
    {
      "name": "Program 1",
      "confidence_score": 0.95,
      "low_confidence_fields": [],
      "warnings": []
    },
    {
      "name": "Program 2",
      "confidence_score": 0.72,
      "low_confidence_fields": ["funding_amount", "application_deadline"],
      "warnings": ["Deadline text unclear"]
    }
  ]
}
```

## What Gets Extracted

For each incentive program, the system extracts:

### Basic Information
- Program name
- Issuer (agency/organization)
- Program type (rebate, tax credit, grant, loan, etc.)
- Category (federal, state, local, utility)

### Financial Details
- Incentive amount (fixed, percentage, per-unit, per-kW, per-sqft)
- Minimum and maximum amounts
- Amount calculation formula (if applicable)
- Currency

### Eligibility
- Eligible sectors (residential, commercial, industrial, nonprofit)
- Eligible technologies (solar, heat pump, battery, EV charger, etc.)
- Eligibility criteria (structured JSON)
- Income limits
- Required documents

### Timeline
- Application deadline
- Program end date
- Funding status (open, waitlist, closed)

### Administration
- Contact information
- Application URL
- Relevant PDFs/links
- Application steps

### Stacking
- Whether program can be stacked with others
- Stacking rules and restrictions
- Conflicting programs

## Error Handling

### Common Errors

**"No file provided"**
```
Fix: Make sure file is included in multipart form data
curl -F "file=@document.pdf" ...
```

**"Only PDF files are supported"**
```
Fix: Document must be a valid PDF file
Check file type: file -b document.pdf
```

**"Job not found"**
```
Fix: Job ID doesn't exist or is from another organization
Check: Job ID is correct and you have organization access
```

**"Document not found"**
```
Fix: Document was deleted or storage is unreachable
Check: Document exists in Supabase Storage
```

### Processing Failures

If extraction fails:

1. Check `job_logs` table for details:
```sql
SELECT * FROM job_logs WHERE job_id = 'a1b2c3d4...' ORDER BY created_at DESC;
```

2. Common causes:
   - PDF too large (> 50 MB)
   - Corrupted PDF file
   - Anthropic API error (check API key)
   - Network timeout (retry)

3. Retry:
```bash
# Re-submit same job
curl -X POST http://localhost:3000/api/programs/ingest/process \
  -d '{"job_id": "a1b2c3d4..."}'
```

## Database Queries

### View Extracted Programs

```sql
-- All programs from a specific extraction
SELECT * FROM incentive_programs
WHERE data_source = 'document_extraction_<jobId>'
ORDER BY confidence_score DESC;

-- Programs needing review
SELECT * FROM incentive_programs
WHERE data_source = 'document_extraction_<jobId>'
AND confidence_score < 0.8
ORDER BY confidence_score ASC;

-- High confidence programs
SELECT * FROM incentive_programs
WHERE data_source = 'document_extraction_<jobId>'
AND confidence_score >= 0.9;
```

### Check Job Status and Logs

```sql
-- View job details
SELECT id, status, progress_message, result, created_at, completed_at
FROM background_jobs
WHERE id = '<jobId>';

-- View job execution logs
SELECT created_at, level, message, data
FROM job_logs
WHERE job_id = '<jobId>'
ORDER BY created_at DESC;

-- View failed jobs
SELECT id, last_error, error_stack
FROM background_jobs
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 10;
```

## Monitoring & Debugging

### View Processing Progress

```bash
# Watch status updates
while true; do
  curl -s http://localhost:3000/api/programs/ingest/status/$JOB_ID \
    -H "Authorization: Bearer $TOKEN" | jq '.status, .programs_extracted'
  sleep 2
done
```

### Debug Mode

Add logging to worker:

```typescript
// In incentive-extraction-worker.ts
await logJobProgress(supabase, jobId, 'debug', 'Detailed info', {
  document_size: buffer.byteLength,
  text_length: documentText.length,
  // ... more data
});
```

View logs:
```bash
curl -s http://localhost:3000/api/background-jobs/$JOB_ID/logs \
  -H "Authorization: Bearer $TOKEN" | jq '.logs[] | select(.level == "debug")'
```

## Integration with Applications

### React Component Example

```typescript
import { useState } from 'react';

export function IncentiveExtractor() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');

  const uploadPDF = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/programs/ingest', { method: 'POST', body: formData });
    const { job_id } = await res.json();
    setJobId(job_id);
    setStatus('processing');

    // Poll for results
    const interval = setInterval(async () => {
      const statusRes = await fetch(`/api/programs/ingest/status/${job_id}`);
      const statusData = await statusRes.json();

      if (statusData.status !== 'processing') {
        clearInterval(interval);
        setStatus(statusData.status);
      }
    }, 2000);
  };

  return (
    <div>
      <input type="file" accept=".pdf" onChange={(e) => uploadPDF(e.target.files[0])} />
      <p>Status: {status}</p>
      {jobId && <a href={`/extractions/${jobId}`}>View Results</a>}
    </div>
  );
}
```

## Performance Tips

1. **Batch Upload:** Process multiple PDFs sequentially
   - Current: 1 at a time
   - Future: Implement queue for parallel processing

2. **Large PDFs:** Split into sections before uploading
   - Max recommended: 20-30 MB
   - Impacts processing time (linear with size)

3. **Cost Optimization:**
   - Anthropic API: ~$0.003 per 1K tokens
   - Average document: 5-20K tokens
   - Cost per extraction: $0.015-0.06

4. **Scheduling:**
   - Run extractions during off-peak hours
   - Batch similar documents together
   - Monitor API rate limits

## Support & Troubleshooting

### Documentation

- Full implementation details: `INCENTIVE_EXTRACTION_IMPLEMENTATION.md`
- API endpoints: `API_DOCUMENTATION.md`
- Database schema: `DATABASE_OPTIMIZATION.md`

### Testing

```bash
# Run test suite
npm test -- incentive-extraction.test.ts

# Run with coverage
npm test -- --coverage incentive-extraction.test.ts

# Debug single test
npm test -- --inspect-brk incentive-extraction.test.ts
```

### Getting Help

1. Check `job_logs` table for error details
2. Review application logs
3. Verify Anthropic API key is set
4. Test with known-good PDF
5. Check database connectivity
6. Verify file permissions on storage bucket

---

**Version:** 1.0.0
**Last Updated:** 2026-02-24
**Status:** ✅ Production Ready
