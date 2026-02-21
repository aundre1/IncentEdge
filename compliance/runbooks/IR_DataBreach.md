# Incident Response Runbook: Data Breach

**Type:** Security Incident - Data Breach
**Severity:** CRITICAL
**Response Time:** IMMEDIATE
**GDPR Notification Deadline:** 72 hours from discovery

---

## Overview

This runbook provides step-by-step procedures for responding to a data breach involving unauthorized access, disclosure, or exfiltration of personal data (PII), protected health information (PHI), payment card data (PCI), or other confidential information.

**Definition:** A data breach is a security incident where sensitive, protected, or confidential data has been accessed, disclosed, or stolen by an unauthorized party.

---

## Severity Classification

| Level | Description | Examples | Response Time |
|-------|-------------|----------|---------------|
| **Critical** | Large-scale breach of sensitive data | >1,000 records, PII/PHI/PCI exposed | Immediate |
| **High** | Moderate breach of sensitive data | 100-1,000 records affected | <15 minutes |
| **Medium** | Limited breach, low-sensitivity data | <100 records, internal data | <1 hour |

---

## Response Team

### Incident Commander (IC)
**Primary:** CISO
**Backup:** CTO
**Responsibilities:**
- Overall incident coordination
- Decision-making authority
- External communications approval
- Executive and board notifications

### Technical Lead
**Primary:** Security Operations Manager
**Backup:** Senior Security Engineer
**Responsibilities:**
- Technical investigation and containment
- Forensic evidence collection
- System remediation
- Root cause analysis

### Legal/Compliance Lead
**Primary:** General Counsel
**Backup:** Compliance Officer
**Responsibilities:**
- Regulatory notification requirements
- Legal implications assessment
- Breach notification letter approval
- Regulatory authority liaison

### Communications Lead
**Primary:** VP Marketing
**Backup:** CEO
**Responsibilities:**
- Customer notifications
- Public relations
- Media inquiries
- Internal communications

### Customer Support Lead
**Primary:** Customer Success Manager
**Responsibilities:**
- Customer inquiry handling
- Support ticket management
- Customer communication execution

---

## Phase 1: Detection and Assessment (0-1 hour)

### Step 1.1: Incident Detection
**Trigger Events:**
- SIEM alert for unusual data access
- Customer report of unauthorized account access
- Security researcher disclosure
- Anomalous data exfiltration detected
- Ransomware or malware detection
- Media or third-party notification

**Action Items:**
- [ ] Document initial detection time and source
- [ ] Create incident ticket (Jira/ServiceNow)
- [ ] Notify CISO and Security Team immediately
- [ ] Activate incident response team

**Documentation Required:**
- Timestamp of detection
- Source of alert/notification
- Initial indicators of compromise (IOCs)
- Screenshot of alert/notification

---

### Step 1.2: Initial Assessment (15 minutes)
**Objectives:**
- Determine if incident is confirmed data breach
- Assess scope and severity
- Identify affected systems

**Assessment Questions:**
1. What data was accessed/disclosed/exfiltrated?
   - [ ] PII (names, emails, SSN, addresses)
   - [ ] PHI (health information)
   - [ ] PCI (payment card data)
   - [ ] Credentials (passwords, tokens)
   - [ ] Financial data
   - [ ] Proprietary/trade secrets
   - [ ] Other: ___________

2. How many individuals affected?
   - [ ] <100
   - [ ] 100-1,000
   - [ ] 1,000-10,000
   - [ ] >10,000

3. What systems/databases were compromised?
   - [ ] Production database
   - [ ] Customer portal
   - [ ] Admin systems
   - [ ] Backup systems
   - [ ] Third-party systems

4. How did the breach occur?
   - [ ] External attack (hacking)
   - [ ] Insider threat
   - [ ] Lost/stolen device
   - [ ] Misconfiguration (S3 bucket, etc.)
   - [ ] Phishing/social engineering
   - [ ] Third-party vendor breach
   - [ ] Unknown (investigation ongoing)

**Action Items:**
- [ ] Determine breach severity (Critical/High/Medium)
- [ ] Estimate number of affected individuals
- [ ] Identify data types compromised
- [ ] Document initial findings
- [ ] Notify Incident Commander (CISO)

---

### Step 1.3: Executive Notification (30 minutes)
**Notification Matrix:**

| Severity | Notify Immediately | Notify Within 1h | Notify Within 4h |
|----------|-------------------|------------------|------------------|
| Critical | CISO, CEO, CTO | Board Chair, Legal | Full Board |
| High | CISO, CTO | CEO, Legal | Board Chair |
| Medium | CISO | CTO, Legal | CEO |

**Notification Template:**
```
URGENT: POTENTIAL DATA BREACH DETECTED

Severity: [CRITICAL/HIGH/MEDIUM]
Detection Time: [YYYY-MM-DD HH:MM UTC]
Estimated Affected Users: [NUMBER or RANGE]
Data Types: [PII/PHI/PCI/etc.]
Systems Affected: [LIST]
Attack Vector: [KNOWN/UNDER INVESTIGATION]

Current Status: [INVESTIGATING/CONTAINING/REMEDIATING]

Incident Commander: [NAME]
Next Update: [TIME]
```

**Action Items:**
- [ ] Send executive notification email
- [ ] Schedule emergency executive briefing (within 1 hour)
- [ ] Prepare incident summary slide deck
- [ ] Document notification timestamps

---

## Phase 2: Containment (1-4 hours)

### Step 2.1: Immediate Containment
**Objective:** Stop ongoing data exfiltration and limit exposure

**Critical Containment Actions:**
- [ ] Isolate affected systems from network (if safe to do so)
- [ ] Disable compromised user accounts
- [ ] Revoke exposed API keys/credentials
- [ ] Block malicious IP addresses at firewall/WAF
- [ ] Enable additional logging and monitoring
- [ ] Preserve forensic evidence (take snapshots, copy logs)

**IMPORTANT:** Do NOT take actions that will destroy forensic evidence without consulting legal/forensics team.

**Containment Checklist:**
- [ ] Network isolation completed (if applicable)
- [ ] Compromised accounts disabled
- [ ] Credentials rotated
- [ ] Malicious IPs blocked
- [ ] Enhanced monitoring enabled
- [ ] Forensic snapshots taken
- [ ] Evidence preservation verified

**Documentation Required:**
- Containment actions taken (with timestamps)
- Systems isolated
- Accounts disabled
- Credentials rotated
- Forensic evidence preserved

---

### Step 2.2: Forensic Evidence Collection
**Objective:** Collect evidence for investigation and legal proceedings

**Evidence to Collect:**
- [ ] System logs (application, database, web server, firewall)
- [ ] Authentication logs (successful and failed logins)
- [ ] Network traffic captures (if available)
- [ ] Database query logs
- [ ] File access logs
- [ ] Cloud provider logs (AWS CloudTrail, etc.)
- [ ] SIEM events and alerts
- [ ] System snapshots/disk images
- [ ] Memory dumps (if malware suspected)
- [ ] Email communications (if phishing/social engineering)

**Chain of Custody:**
- Document who collected evidence
- Document when evidence was collected
- Document where evidence is stored
- Ensure evidence integrity (checksums/hashes)
- Limit access to evidence (need-to-know basis)

**Action Items:**
- [ ] Collect all relevant logs (extend retention if needed)
- [ ] Create forensic images of affected systems
- [ ] Document chain of custody
- [ ] Secure evidence in designated storage
- [ ] Notify legal of evidence collection

---

### Step 2.3: Scope Determination
**Objective:** Determine full extent of breach

**Investigation Questions:**
1. What was the initial compromise vector?
2. When did the breach begin (first unauthorized access)?
3. When was the breach discovered?
4. What data was accessed/exfiltrated?
5. How many individuals are affected?
6. Were any third parties involved?
7. Is the breach ongoing or contained?

**Data Mapping:**
- [ ] Identify all affected databases/tables
- [ ] Determine exact data fields exposed
- [ ] Extract list of affected user IDs/accounts
- [ ] Quantify number of records compromised
- [ ] Identify jurisdictions of affected individuals (GDPR, CCPA, etc.)

**Action Items:**
- [ ] Complete detailed scope assessment
- [ ] Generate list of affected individuals
- [ ] Document timeline of breach
- [ ] Identify all compromised data elements
- [ ] Determine regulatory notification requirements

---

## Phase 3: Notification (Within 72 hours)

### Step 3.1: Regulatory Notification Assessment
**Objective:** Determine notification requirements and deadlines

**Regulations Requiring Notification:**

| Regulation | Trigger | Deadline | Authority |
|------------|---------|----------|-----------|
| **GDPR** | PII of EU residents | 72 hours | Relevant DPA (Data Protection Authority) |
| **CCPA** | PII of CA residents | Without unreasonable delay | California Attorney General |
| **HIPAA** | PHI breach (>500 individuals) | 60 days | HHS Office for Civil Rights |
| **PCI DSS** | Payment card data | Immediately | Payment brands, acquiring bank |
| **State Laws** | Varies by state | Varies (typically "prompt") | State Attorney General |

**Notification Requirements Checklist:**
- [ ] GDPR notification required? (EU residents affected)
- [ ] CCPA notification required? (CA residents affected)
- [ ] HIPAA notification required? (PHI exposed, >500 individuals)
- [ ] PCI DSS notification required? (Card data exposed)
- [ ] State breach notification laws triggered?
- [ ] Contractual notification requirements? (customers, partners)

---

### Step 3.2: Regulatory Authority Notification
**Timeline:** Within 72 hours (GDPR) or per applicable regulation

**GDPR Notification (Article 33):**
Notify relevant DPA within 72 hours with:
- [ ] Description of nature of breach
- [ ] Categories and approximate number of data subjects affected
- [ ] Categories and approximate number of records affected
- [ ] Contact point for more information (DPO or CISO)
- [ ] Likely consequences of breach
- [ ] Measures taken or proposed to address breach

**Template: GDPR Notification**
```
To: [Relevant Data Protection Authority]
Subject: Personal Data Breach Notification pursuant to GDPR Article 33

Dear Sir/Madam,

IncentEdge is notifying you of a personal data breach pursuant to Article 33 of the GDPR.

1. Nature of Breach:
   [Description of breach, including attack vector and timeline]

2. Data Subjects Affected:
   Approximate number: [NUMBER]
   Categories: [Customers, employees, etc.]

3. Data Records Affected:
   Approximate number: [NUMBER]
   Categories: [Names, email addresses, etc.]

4. Contact Point:
   Name: [CISO Name]
   Email: ciso@incentedge.com
   Phone: [PHONE]

5. Likely Consequences:
   [Assessment of potential impact on data subjects]

6. Measures Taken:
   [Description of containment, remediation, and mitigation measures]

Sincerely,
[CISO Name]
Chief Information Security Officer
IncentEdge
```

**Action Items:**
- [ ] Prepare breach notification for each required authority
- [ ] Legal review of notification
- [ ] Submit notifications within regulatory deadlines
- [ ] Document submission timestamps
- [ ] Monitor for authority response/requests

---

### Step 3.3: Individual Notification
**Timeline:** "Without undue delay" (typically within 72 hours to 7 days)

**Notification Required When:**
- Breach likely to result in high risk to rights and freedoms of individuals
- Regulatory authority requires individual notification
- Industry-specific regulations require notification (HIPAA, etc.)

**Notification Must Include:**
- [ ] Description of breach in clear, plain language
- [ ] Types of personal data affected
- [ ] Contact point for questions (DPO, CISO, support)
- [ ] Likely consequences of breach
- [ ] Measures taken to address breach
- [ ] Recommendations for individuals (password reset, credit monitoring, etc.)

**Template: Individual Notification Email**
```
Subject: Important Security Notice from IncentEdge

Dear [Customer Name],

We are writing to inform you of a security incident that may have affected your personal information.

What Happened:
On [DATE], we discovered that [DESCRIPTION OF INCIDENT]. We immediately took steps to secure our systems and investigate the incident.

What Information Was Involved:
The following types of your information may have been accessed: [LIST DATA TYPES]

What We Are Doing:
We have [DESCRIPTION OF REMEDIATION]. We have also notified law enforcement and regulatory authorities as required.

What You Can Do:
We recommend that you:
- Reset your password immediately (if applicable)
- Monitor your accounts for unusual activity
- Consider placing a fraud alert on your credit file
- Review our FAQ at [URL] for more information

We take this incident very seriously and sincerely apologize for any concern this may cause.

For questions, please contact:
Email: security-incident@incentedge.com
Phone: 1-800-XXX-XXXX
FAQ: https://incentedge.com/security-incident

Sincerely,
[CEO Name]
Chief Executive Officer
IncentEdge
```

**Action Items:**
- [ ] Prepare individual notification (email, letter, or both)
- [ ] Legal and executive review of notification
- [ ] Set up dedicated support channel (email, phone, FAQ)
- [ ] Send notifications to all affected individuals
- [ ] Document notification timestamps
- [ ] Monitor customer inquiries and provide support

---

### Step 3.4: Other Notifications

**Credit Bureaus (if SSN/financial data exposed):**
- [ ] Notify Equifax, Experian, TransUnion
- [ ] Provide information for fraud alerts

**Law Enforcement (for criminal activity):**
- [ ] Notify FBI/local law enforcement if appropriate
- [ ] Provide cooperation with investigation

**Insurance Provider:**
- [ ] Notify cyber insurance carrier
- [ ] Initiate claims process

**Business Partners/Customers:**
- [ ] Notify enterprise customers per contracts
- [ ] Notify vendors/partners if their data affected

**Media/Public (if high-profile):**
- [ ] Prepare press release (if appropriate)
- [ ] Coordinate with PR firm
- [ ] Designate media spokesperson

---

## Phase 4: Remediation (Days to Weeks)

### Step 4.1: Root Cause Analysis
**Objective:** Identify how breach occurred and why controls failed

**Analysis Questions:**
1. What was the initial attack vector?
2. How did the attacker move laterally/escalate privileges?
3. What security controls failed or were bypassed?
4. Were there any warning signs missed?
5. How long did the attacker have access?
6. What data was exfiltrated (confirmed)?

**Action Items:**
- [ ] Conduct thorough forensic investigation
- [ ] Document complete attack timeline
- [ ] Identify all control failures
- [ ] Determine if insider threat or external attack
- [ ] Assess adequacy of existing controls
- [ ] Prepare root cause analysis report

---

### Step 4.2: System Remediation
**Objective:** Fix vulnerabilities and strengthen security

**Remediation Actions:**
- [ ] Patch vulnerabilities exploited in attack
- [ ] Fix misconfigurations
- [ ] Strengthen access controls
- [ ] Implement additional monitoring
- [ ] Rotate all credentials and keys
- [ ] Update firewall/WAF rules
- [ ] Enhance data encryption
- [ ] Improve security logging

**Validation:**
- [ ] Penetration test to validate fixes
- [ ] Vulnerability scan to confirm patches
- [ ] Security control testing
- [ ] Monitoring validation

---

### Step 4.3: Control Enhancements
**Objective:** Implement additional controls to prevent recurrence

**Potential Enhancements:**
- Enhanced monitoring and alerting
- Additional data encryption
- Improved access controls
- Data loss prevention (DLP)
- Network segmentation
- Privileged access management (PAM)
- Security awareness training
- Third-party security assessments

**Action Items:**
- [ ] Identify control gaps revealed by breach
- [ ] Develop remediation plan with timeline
- [ ] Obtain budget approval for enhancements
- [ ] Implement priority controls
- [ ] Test control effectiveness

---

## Phase 5: Post-Incident Activities

### Step 5.1: Post-Incident Review (Within 7 days)
**Objective:** Learn from incident and improve response

**Review Questions:**
1. What went well in our response?
2. What could have been done better?
3. Were roles and responsibilities clear?
4. Was communication effective?
5. Were notification deadlines met?
6. What processes/tools need improvement?

**Action Items:**
- [ ] Conduct post-incident review meeting
- [ ] Document lessons learned
- [ ] Update incident response plan
- [ ] Update runbooks based on learnings
- [ ] Conduct tabletop exercise with improvements

---

### Step 5.2: Final Reporting
**Deliverables:**
- [ ] Final incident report for executive leadership
- [ ] Board presentation on incident
- [ ] Final regulatory notifications/updates
- [ ] Customer communication (if appropriate)
- [ ] Insurance claim documentation

**Action Items:**
- [ ] Prepare comprehensive incident report
- [ ] Present to executive leadership and board
- [ ] Archive all incident documentation
- [ ] Close incident ticket

---

## Key Contacts

### Internal Contacts:
| Role | Name | Phone | Email |
|------|------|-------|-------|
| CISO | | | ciso@incentedge.com |
| CTO | | | cto@incentedge.com |
| CEO | | | ceo@incentedge.com |
| General Counsel | | | legal@incentedge.com |
| VP Marketing | | | marketing@incentedge.com |

### External Contacts:
| Organization | Contact | Phone | Email |
|--------------|---------|-------|-------|
| Cyber Insurance | | | |
| Legal Counsel (External) | | | |
| Forensics Firm | | | |
| PR Firm | | | |
| FBI Cyber Division | | 1-800-CALL-FBI | |

### Regulatory Authorities:
| Authority | Jurisdiction | Contact |
|-----------|-------------|---------|
| ICO (UK) | GDPR - UK | casework@ico.org.uk |
| CNIL (France) | GDPR - France | |
| California AG | CCPA | oag.ca.gov |
| HHS OCR | HIPAA | ocrmail@hhs.gov |

---

## Appendices

### Appendix A: Incident Severity Matrix
| Factor | Critical | High | Medium | Low |
|--------|----------|------|--------|-----|
| Records | >1,000 | 100-1,000 | 10-100 | <10 |
| Data Sensitivity | PII/PHI/PCI | Financial | Internal | Public |
| Impact | Severe | Significant | Moderate | Minor |

### Appendix B: Communication Templates
- Executive notification email
- Board notification
- Regulatory notification (GDPR, CCPA, HIPAA)
- Individual notification email
- Customer FAQ
- Press release template

### Appendix C: Evidence Collection Checklist
- System logs
- Authentication logs
- Network captures
- Database logs
- SIEM events
- Forensic images

---

**Document Owner:** CISO
**Last Updated:** 2026-02-17
**Next Review:** 2026-08-17
**Version:** 1.0
