# IncentEdge Rollback & Disaster Recovery Procedure

**Status:** READY
**Last Updated:** February 24, 2026
**Owner:** Claude Code (DevOps/Emergency Response)
**Audience:** Aundre, Steve (CTO), Support Team

---

## Emergency Decision Tree

### CRITICAL: When to Rollback Immediately

**ROLLBACK WITHOUT HESITATION IF ANY OF:**

```
UPTIME CRITERION
└─ Platform uptime < 95% for 4+ consecutive hours
   OR
   API response times consistently > 5 seconds for 30+ min
   OR
   Database unresponsive for > 5 minutes

ERROR RATE CRITERION
└─ Error rate > 5% for 30+ consecutive minutes
   OR
   25%+ of users reporting complete inability to log in
   OR
   All requests to /api/programs/eligible returning 500+

DATA INTEGRITY CRITERION
└─ Data corruption detected (e.g., duplicate records, missing fields)
   OR
   Unexpected database state changes
   OR
   RLS policies not enforcing (unauthorized access confirmed)

SECURITY CRITERION
└─ SQL injection successfully executed
   OR
   Authentication bypass discovered
   OR
   API keys exposed in logs
   OR
   Unauthorized access to user data confirmed

CUSTOMER IMPACT CRITERION
└─ >50% of beta users unable to complete core workflow
   OR
   Data loss reported by any user
   OR
   Complete feature unavailability (search, analysis, etc.)
```

### PAUSE & INVESTIGATE IF

```
MINOR ERROR RATE
└─ 1-2% error rate with clear error category (safe to fix live)

SPECIFIC FEATURE BROKEN
└─ Only one feature broken, others working (safe to fix live)

PERFORMANCE DEGRADATION
└─ Slow but responsive (can optimize without rollback)

UX ISSUES
└─ UI confusing, buttons misplaced, cosmetic issues (can fix live)
```

### DON'T ROLLBACK IF

```
✗ Issue is with specific user's browser/device
✗ User has network connectivity issue
✗ Feature working as designed (just needs UX improvement)
✗ Documentation unclear (fix docs, not code)
```

---

## Rollback Decision Checklist

**Before rolling back, answer these questions:**

1. [ ] Is this a CRITICAL issue per the criteria above?
2. [ ] Have you verified it's not a user device/network issue?
3. [ ] Have you consulted with Aundre (90 sec max if critical)?
4. [ ] Do you have the previous deployment version number?
5. [ ] Is the database backup fresh and tested?
6. [ ] Have you prepared the rollback communication?

**If YES to all:** Proceed with rollback
**If NO to any:** Fix live instead

---

## Phase 1: Decision & Notification (0-5 minutes)

### Step 1: Verify the Issue (2 min)

```bash
# Check current status
curl -X GET https://api.incentedge.dev/api/health
# Expected: 200 OK response with status=ok

# Check error rate in Sentry/logs
# Is it > 5%? Is it affecting > 50% of users?

# Check database connectivity
# Can you query the main tables?

# Check response times
# Are responses > 5 seconds consistently?

# Check user reports in Slack
# Are multiple users unable to complete core tasks?
```

### Step 2: Make Go/No-Go Decision (1 min)

**If YES to critical criteria → ROLLBACK**
**If NO → FIX LIVE**

### Step 3: Notify Stakeholders (2 min)

**Slack Announcement (to #incentedge-beta):**

```
🚨 INCIDENT: Platform Degradation Detected

STATUS: [Investigating | Mitigating | Rolling back]
IMPACT: [X users affected | ~X% of functionality unavailable]
ETA FIX: [Estimated time]

We're on it. Updates every 15 minutes.
```

**Direct to Aundre:**

```
URGENT: [Brief issue description]
SEVERITY: Critical
ACTION: Rolling back to [version]
ETA: [Time to restore]
CAUSE: [Preliminary diagnosis]
NEXT: Post-mortem at [time]
```

---

## Phase 2: Rollback Execution (5-15 minutes)

### Option A: Rollback via Vercel (If using Vercel)

```bash
# 1. Access Vercel dashboard
# Go to: https://vercel.com/dashboard

# 2. Find IncentEdge project
# Click on project

# 3. Go to Deployments tab
# Find most recent STABLE deployment (before incident)

# 4. Click three dots → "Rollback to this"
# Confirm rollback

# Typical rollback time: 2-3 minutes
# Monitor: New deployment will be green when complete
```

### Option B: Rollback via Docker/Railway (If using Railway)

```bash
# 1. Access Railway dashboard
# https://railway.app/dashboard

# 2. Find IncentEdge project
# Click on backend service

# 3. Go to Deployments
# Click on previous working deployment

# 4. Click "Activate"
# Confirm

# Typical rollback time: 3-5 minutes
```

### Option C: Manual Docker Rollback (If necessary)

```bash
# 1. Get previous image
export PREVIOUS_IMAGE="incentedge:v1.0.0-stable"

# 2. Stop current container
docker stop incentedge-prod || true

# 3. Run previous image
docker run -d \
  --name incentedge-prod \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY \
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \
  --restart unless-stopped \
  $PREVIOUS_IMAGE

# 4. Verify health
sleep 5
curl -X GET http://localhost:3000/api/health
# Expected: 200 OK
```

### Step 2: Verify Rollback Success (2 min)

```bash
# Health check
curl -X GET https://api.incentedge.dev/api/health
# Expected: 200 OK, status: "ok"

# API test
curl -X GET https://api.incentedge.dev/api/programs?limit=1 \
  -H "Authorization: Bearer $TEST_TOKEN"
# Expected: 200 OK, data array returned

# Database connectivity
# Verify data is consistent with expected state

# Check error rate
# Should drop to <1% immediately
```

### Step 3: Update Status (1 min)

**Slack Announcement:**

```
✅ ROLLBACK COMPLETE

Platform has been rolled back to v1.0.0-stable (Feb 28 9:30 AM)
All systems operational
Error rate: <1%
Uptime: 100% (last 10 min)

Investigation and fix in progress.
Post-mortem scheduled for [time].
```

---

## Phase 3: Database Rollback (If Data Corruption)

**ONLY IF:** Data corruption detected after code rollback

### Step 1: Prepare Rollback (5 min)

```bash
# Contact Supabase support
# https://supabase.com/dashboard/support

# Provide:
# - Project ID: dxbtycycyvmzgufdhnae
# - Time of corruption: [exact time]
# - Affected tables: [list]
# - Recovery target time: [specific time before corruption]

# Ask for: Point-in-Time Recovery (PITR) to specific timestamp
```

### Step 2: Execute Database Rollback

```bash
# Supabase support will provide PITR link
# Click link → Select recovery timestamp

# Recovery process:
# - Supabase creates new database with recovered data
# - You switch connection string to new database
# - Old database kept for 7 days (in case recovery is wrong)

# Typical PITR time: 30 minutes to 2 hours
```

### Step 3: Verify Database State

```bash
# Connect to recovered database
# Run validation queries

# Verify key tables:
SELECT COUNT(*) FROM incentive_programs;
# Expected: 24,458

SELECT COUNT(*) FROM projects;
# Expected: [whatever was there before corruption]

SELECT COUNT(*) FROM users;
# Expected: [correct number]

# Verify no orphaned records
SELECT COUNT(*) FROM projects WHERE deleted_at IS NULL;
# All should be valid
```

---

## Phase 4: Incident Communication

### During Incident (Real-Time Updates Every 15 Min)

**If Rollback In Progress:**

```
[Time + 0 min] 🚨 INCIDENT: Platform degradation
[Time + 5 min] 🔧 Rolling back to stable version
[Time + 10 min] ⏳ Rollback in progress (2 min remaining)
[Time + 15 min] ✅ Rollback complete, verifying
[Time + 20 min] ✅ All systems operational
```

**If Fixing Live:**

```
[Time + 0 min] 🚨 INCIDENT: [Issue description]
[Time + 5 min] 🔧 Working on fix
[Time + 10 min] ⏳ Testing fix in staging
[Time + 15 min] ✅ Fix deployed
[Time + 20 min] ✅ Monitoring - all metrics green
```

### Post-Incident Communication (Within 2 Hours)

**Slack Announcement:**

```
📋 INCIDENT SUMMARY

WHAT HAPPENED:
[Clear, non-technical explanation]

DURATION:
[Start time] - [End time] = [X minutes of impact]

IMPACT:
- [X% of users affected]
- [Specific features unavailable]
- [Estimated cost/lost revenue]

ROOT CAUSE:
[What caused this?]

RESOLUTION:
[What did we do?]

PREVENTION:
[What will we do to prevent this?]

TIMELINE:
[When things happened - detailed]

We apologize for the disruption.
```

### Post-Mortem (Schedule Within 24 Hours)

**Attendees:** Aundre, Steve (CTO), Claude Code
**Duration:** 30-45 minutes
**Output:** Written post-mortem with action items

**Template:**

```markdown
# Incident Post-Mortem

## Incident Summary
- Duration: [Time]
- Impact: [X users, Y% functionality]
- Severity: Critical / High / Medium

## Timeline
1. [Time] - Issue started (symptom noticed)
2. [Time] - Investigation began
3. [Time] - Root cause identified
4. [Time] - Mitigation started
5. [Time] - Incident resolved

## Root Cause Analysis
**What happened:** [Technical explanation]
**Why:** [Underlying cause]
**Why not caught earlier:** [Monitoring/testing gap]

## What Went Well
- [Something good]
- [Rapid response]
- [Clear communication]

## What Could Be Better
- [Monitoring gap]
- [Testing insufficient]
- [Documentation unclear]

## Action Items
- [ ] [Fix] - [Owner] - [Due date]
- [ ] [Improve monitoring] - [Owner] - [Due date]
- [ ] [Add test] - [Owner] - [Due date]

## Prevention
[How will we prevent this in future?]
```

---

## Phase 5: Root Cause Fix (Next 24-48 Hours)

### Step 1: Understand the Root Cause

```bash
# Analyze logs from time of incident
# Check error messages, stack traces
# Review commits deployed around incident time
# Compare with previous stable version

# Questions to answer:
# - What changed in the new deployment?
# - Does that change explain the issue?
# - Are there similar issues in the code?
```

### Step 2: Implement Fix

```bash
# 1. Create fix branch
git checkout -b fix/incident-[incident-name]

# 2. Make code changes
# Apply fix to root cause

# 3. Add test case
# Ensure this issue can't happen again

# 4. Commit with detailed message
git commit -m "fix: [Issue description]

Fixes #[incident-number]

Root cause: [What caused it]
Fix: [What we changed]
Tests: [What test prevents recurrence]

Tested: [How you tested it]
"

# 5. Create PR
# Link to incident post-mortem
# Get review from Steve (CTO)

# 6. Merge and deploy
# Deploy to staging first
# Smoke test for 30 minutes
# Deploy to production
```

### Step 3: Deploy with Extra Caution

```bash
# Deploy during business hours (9 AM - 5 PM)
# Have team on standby
# Monitor metrics closely for 2 hours
# Be ready to rollback if issues appear

# After fix is live:
# - Monitor for 24 hours
# - Keep metrics visible
# - Be on high alert
```

---

## Testing Rollback Procedure (Monthly)

**To ensure rollback works when needed:**

**Monthly Rollback Drill** (First Friday of each month)

```bash
# 1. Schedule 30-minute maintenance window
# Announce to beta users: "Planned maintenance test"

# 2. Document current deployment
CURRENT_DEPLOYMENT=$(curl -s https://api.incentedge.dev/api/status | jq '.deployment_id')
echo "Current deployment: $CURRENT_DEPLOYMENT"

# 3. Execute rollback
# Follow steps in Phase 2 above
# Roll to one version back

# 4. Verify rollback works
curl -X GET https://api.incentedge.dev/api/health

# 5. Roll forward again
# Verify current version works

# 6. Document results
# Did rollback work? How long did it take?
# Any issues to fix?

# 7. Report to Aundre
# "Rollback drill successful - ready for emergencies"
```

---

## Contact Information & Escalation

### During Incident

**Tier 1 (0-5 min):** Check monitoring dashboard, verify issue

**Tier 2 (5-15 min):** Contact Aundre
- Slack: @aundre (fastest)
- Phone: [emergency number]
- Email: aundre@incentedge.dev

**Tier 3 (15-30 min):** Contact Steve (CTO)
- If Aundre unreachable and issue is critical

### For Infrastructure Issues

**Supabase Support:** https://supabase.com/dashboard/support
**Vercel Support:** https://vercel.com/support
**Email Support:** [emergency email]

---

## Prevention & Monitoring Setup

### Proactive Monitoring

**Alert Thresholds:**

```
CRITICAL (Page on-call):
- Uptime < 99% for 10+ min
- Error rate > 5% for 5+ min
- Response time p95 > 5s for 10+ min
- Database connections > 80%

HIGH (Slack alert):
- Uptime < 99.5% for 15+ min
- Error rate > 2% for 10+ min
- Response time p95 > 2s for 15+ min
- Memory usage > 85%

MEDIUM (Slack notification):
- Uptime < 99.9% for 20+ min
- Error rate > 0.5% for 20+ min
- Cache hit rate < 85%
```

### Pre-Deployment Checks

**Before deploying ANY code to production:**

```
[ ] Tests pass locally (npm test)
[ ] Build succeeds (npm run build)
[ ] No console errors or warnings
[ ] No new console.log statements
[ ] Environment variables verified
[ ] Database migrations tested
[ ] Backwards compatibility verified
[ ] Performance impact analyzed
[ ] Security audit passed
[ ] Code reviewed by another person
[ ] Staging deployment verified
[ ] Rollback plan documented
```

### Staging Environment Testing

**Always test in staging first:**

```bash
# 1. Deploy to staging
vercel deploy --env production --confirm

# 2. Run smoke tests
npm run test:smoke

# 3. Manual testing
# - Create project, search, analyze
# - Try edge cases that failed before
# - Check performance

# 4. Load testing
# Simulate 10x traffic

# 5. Monitor for 1 hour
# Check metrics, no errors?

# 6. If all green, deploy to production
# If any issues, fix and retest
```

---

## Checklist for Code Reviews

**Before approving PRs, ensure:**

- [ ] No breaking changes to API
- [ ] No database migrations without testing
- [ ] No new dependencies added without review
- [ ] Error handling is comprehensive
- [ ] Performance impact is minimal
- [ ] Security reviewed
- [ ] Tests added for new code
- [ ] Documentation updated
- [ ] Backwards compatible

---

## Sign-Off

**Procedure Status:** ✅ READY
**Created:** 2026-02-24
**Last Tested:** [Never - will test monthly]
**Owner:** Claude Code (DevOps)
**Review:** Required by Aundre & Steve

**To Activate This Procedure:**

1. [ ] Aundre reviews and approves
2. [ ] Share link with all team members
3. [ ] Brief team on decision criteria
4. [ ] Schedule first monthly drill (Mar 7)
5. [ ] Add to on-call playbook

---

**Questions?** Contact Aundre or Steve
**Emergency?** Follow the decision tree above
**After-hours?** Call [emergency number] - procedure is self-guided

---

*Last Updated: 2026-02-24*
*Next Review: 2026-03-15*
