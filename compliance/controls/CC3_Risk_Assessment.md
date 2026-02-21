# CC3: Risk Assessment

**Trust Service Criteria:** Common Criteria - Risk Assessment

## Control Objective
The entity specifies objectives with sufficient clarity to enable identification and assessment of risks, identifies and analyzes risks, assesses fraud risk, and identifies and assesses changes that could significantly impact internal control.

## Control Points

### CC3.1: Risk Identification
**Description:** The entity identifies risks to the achievement of its objectives across the entity.

**Control Activities:**
- Annual comprehensive risk assessment
- Quarterly threat landscape reviews
- Continuous vulnerability scanning
- Penetration testing (annual)
- Third-party risk assessments
- Asset inventory and classification

**Evidence Required:**
- Annual risk assessment report
- Quarterly threat reports
- Vulnerability scan results (weekly)
- Penetration test reports
- Vendor risk assessments
- Asset inventory with classifications

**Frequency:** Annual (comprehensive), Quarterly (updates), Continuous (scanning)
**Owner:** CISO / Risk Manager
**Status:** ✅ Implemented

---

### CC3.2: Risk Analysis
**Description:** The entity analyzes identified risks to estimate their significance.

**Risk Scoring Methodology:**

**Likelihood Scale (1-5):**
- 5 = Almost Certain (>90% probability)
- 4 = Likely (60-90% probability)
- 3 = Possible (30-60% probability)
- 2 = Unlikely (10-30% probability)
- 1 = Rare (<10% probability)

**Impact Scale (1-5):**
- 5 = Catastrophic (>$1M loss, severe reputation damage, regulatory action)
- 4 = Major ($250K-$1M loss, significant reputation damage)
- 3 = Moderate ($50K-$250K loss, moderate reputation impact)
- 2 = Minor ($10K-$50K loss, limited impact)
- 1 = Insignificant (<$10K loss, negligible impact)

**Risk Score = Likelihood × Impact**

**Risk Levels:**
- Critical: 20-25 (Red)
- High: 15-19 (Orange)
- Medium: 8-14 (Yellow)
- Low: 4-7 (Green)
- Minimal: 1-3 (Blue)

**Control Activities:**
- Risk scoring matrix applied to all identified risks
- Quarterly risk register review
- Risk heat map visualization
- Trend analysis (risk over time)
- Residual risk calculation after controls

**Evidence Required:**
- Risk register with scores
- Risk heat maps
- Trend analysis reports
- Control effectiveness assessments
- Residual risk documentation

**Frequency:** Quarterly
**Owner:** CISO / Risk Manager
**Status:** ✅ Implemented

---

### CC3.3: Fraud Risk Assessment
**Description:** The entity considers potential for fraud in assessing risks.

**Fraud Risk Scenarios:**

1. **Financial Fraud:**
   - Unauthorized fund transfers
   - Invoice manipulation
   - Expense reimbursement fraud
   - Revenue recognition manipulation

2. **Data Fraud:**
   - Insider data theft
   - Unauthorized data access
   - Data manipulation
   - False data entry

3. **Identity Fraud:**
   - Account takeover
   - Credential theft
   - Privilege escalation
   - Social engineering

4. **Vendor Fraud:**
   - Fake vendor schemes
   - Kickback arrangements
   - Invoice fraud
   - Contract manipulation

**Control Activities:**
- Fraud risk assessment (annual)
- Segregation of duties enforcement
- Dual authorization for high-value transactions
- Anomaly detection monitoring
- Whistleblower hotline
- Forensic accounting reviews (random)

**Evidence Required:**
- Fraud risk assessment report
- Segregation of duties matrix
- Dual authorization logs
- Anomaly detection alerts and investigations
- Whistleblower reports (anonymized)
- Forensic review results

**Frequency:** Annual (assessment), Continuous (monitoring)
**Owner:** CFO / CISO / Internal Audit
**Status:** ✅ Implemented

---

### CC3.4: Change Impact Assessment
**Description:** The entity identifies and assesses changes that could significantly impact the system of internal control.

**Change Categories:**

1. **Technology Changes:**
   - New system implementations
   - Major upgrades
   - Cloud migrations
   - Architecture changes

2. **Business Changes:**
   - New product launches
   - Market expansion
   - M&A activities
   - Business model changes

3. **Regulatory Changes:**
   - New compliance requirements
   - Industry standards updates
   - Legal/contractual obligations
   - Geographic expansion

4. **Organizational Changes:**
   - Leadership transitions
   - Restructuring
   - Workforce changes
   - Vendor changes

**Control Activities:**
- Change management process with security review
- Risk assessment required for major changes
- Change advisory board (CAB) reviews
- Post-implementation reviews
- Continuous monitoring for external changes

**Evidence Required:**
- Change requests with risk assessments
- CAB meeting minutes and approvals
- Post-implementation review reports
- External change monitoring logs
- Impact assessment documentation

**Frequency:** Per change (ongoing), Quarterly (external review)
**Owner:** Change Manager / CISO
**Status:** ✅ Implemented

---

## Risk Register Structure

### Top Enterprise Risks (Sample)

| Risk ID | Risk Description | Category | Likelihood | Impact | Risk Score | Treatment | Owner | Status |
|---------|-----------------|----------|------------|--------|------------|-----------|-------|--------|
| R001 | Data breach - customer PII | Security | 3 | 5 | 15 (High) | Mitigate | CISO | Active |
| R002 | Ransomware attack | Security | 3 | 5 | 15 (High) | Mitigate | CISO | Active |
| R003 | Cloud service outage | Availability | 2 | 4 | 8 (Medium) | Accept | CTO | Active |
| R004 | Insider threat - data theft | Security | 2 | 5 | 10 (Medium) | Mitigate | CISO | Active |
| R005 | Vendor security breach | Third-party | 3 | 4 | 12 (Medium) | Mitigate | CISO | Active |
| R006 | DDoS attack | Availability | 4 | 3 | 12 (Medium) | Mitigate | CTO | Active |
| R007 | Regulatory non-compliance | Compliance | 2 | 5 | 10 (Medium) | Mitigate | Legal | Active |
| R008 | Key personnel loss | Operational | 3 | 3 | 9 (Medium) | Accept | CISO | Active |
| R009 | Supply chain attack | Security | 2 | 4 | 8 (Medium) | Mitigate | CISO | Active |
| R010 | API security vulnerability | Security | 3 | 4 | 12 (Medium) | Mitigate | CTO | Active |

Full risk register: [Complete Risk Assessment](/compliance/RISK_ASSESSMENT.md)

---

## Risk Treatment Strategies

### 1. Mitigate (Reduce likelihood or impact)
**Actions:**
- Implement security controls
- Deploy monitoring and detection
- Strengthen processes
- Increase redundancy

**Example:** Data breach risk → Encryption, access controls, DLP, monitoring

---

### 2. Transfer (Share or transfer to third party)
**Actions:**
- Cyber insurance
- Service provider agreements
- Contractual protections
- Outsourcing

**Example:** Financial loss from breach → Cyber liability insurance

---

### 3. Accept (Accept residual risk)
**Actions:**
- Document risk acceptance
- Senior leadership approval
- Periodic re-evaluation
- Monitoring

**Example:** Minor service interruptions → Accept with monitoring

---

### 4. Avoid (Eliminate risk by not pursuing activity)
**Actions:**
- Discontinue risky feature
- Exit risky market
- Terminate risky vendor
- Change business model

**Example:** High-risk data processing → Avoid collecting that data type

---

## Control Testing Procedures

### Annual Testing:
1. Comprehensive risk assessment covering all risk categories
2. Penetration testing to validate security controls
3. Fraud risk assessment review
4. Risk register validation (100% of entries)
5. Risk treatment effectiveness evaluation

### Quarterly Testing:
1. Risk register updates with new/changed risks
2. Risk score recalculation for top 20 risks
3. Control effectiveness review
4. Trend analysis
5. External threat landscape review

### Monthly Testing:
1. Vulnerability scan review
2. Threat intelligence digest
3. Incident trend analysis
4. Change impact reviews

---

## Risk Metrics and KPIs

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Critical vulnerabilities (open) | 0 | 0 | ✅ |
| High vulnerabilities (open) | <5 | 2 | ✅ |
| Mean time to remediate (critical) | <24h | 18h | ✅ |
| Mean time to remediate (high) | <7d | 4d | ✅ |
| Risk assessment completion | 100% annually | 100% | ✅ |
| Penetration test findings (critical) | 0 | 0 | ✅ |
| Third-party assessments completed | 100% | 100% | ✅ |
| Fraud incidents detected | 0 | 0 | ✅ |

---

## Compliance Status

| Control Point | Implementation | Evidence | Testing | Status |
|--------------|----------------|----------|---------|--------|
| CC3.1 | ✅ Complete | ✅ Available | ✅ Passed | Compliant |
| CC3.2 | ✅ Complete | ✅ Available | ✅ Passed | Compliant |
| CC3.3 | ✅ Complete | ✅ Available | ✅ Passed | Compliant |
| CC3.4 | ✅ Complete | ✅ Available | ✅ Passed | Compliant |

**Overall CC3 Readiness:** 100% (4/4 controls fully compliant)

---

## Review History

| Date | Reviewer | Changes | Next Review |
|------|----------|---------|-------------|
| 2026-02-17 | CISO | Initial documentation | 2026-05-17 |

---

## Related Documents
- [Complete Risk Assessment](/compliance/RISK_ASSESSMENT.md)
- [Vulnerability Management Policy](/compliance/policies/09_Vulnerability_Management_Policy.md)
- [Change Management Policy](/compliance/policies/08_Change_Management_Policy.md)
- [Vendor Risk Management Policy](/compliance/policies/07_Vendor_Risk_Management_Policy.md)
