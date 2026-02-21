# Enterprise Risk Assessment

**Organization:** IncentEdge
**Assessment Period:** 2026
**Assessment Date:** February 17, 2026
**Next Review:** May 17, 2026 (Quarterly)
**Version:** 1.0

---

## Executive Summary

This comprehensive risk assessment identifies, analyzes, and prioritizes information security and privacy risks facing IncentEdge. The assessment covers 100+ risk scenarios across 12 categories.

**Key Findings:**
- **Critical Risks:** 0
- **High Risks:** 8 (require immediate attention)
- **Medium Risks:** 25 (managed with existing controls)
- **Low Risks:** 67 (accepted with monitoring)
- **Overall Risk Posture:** MODERATE (trending toward LOW)

**Top 3 Risks:**
1. **R001:** Data breach - customer PII (Risk Score: 15 - High)
2. **R002:** Ransomware attack (Risk Score: 15 - High)
3. **R005:** Third-party vendor security breach (Risk Score: 12 - Medium)

**Remediation Status:** 95% of high/medium risks have active mitigation controls

---

## Risk Assessment Methodology

### Risk Scoring Formula
**Risk Score = Likelihood × Impact**

### Likelihood Scale (1-5)
| Score | Level | Probability | Description |
|-------|-------|-------------|-------------|
| 5 | Almost Certain | >90% | Expected to occur in most circumstances |
| 4 | Likely | 60-90% | Will probably occur in most circumstances |
| 3 | Possible | 30-60% | Might occur at some time |
| 2 | Unlikely | 10-30% | Could occur at some time |
| 1 | Rare | <10% | May occur only in exceptional circumstances |

### Impact Scale (1-5)
| Score | Level | Financial | Reputation | Regulatory | Description |
|-------|-------|-----------|------------|------------|-------------|
| 5 | Catastrophic | >$1M | Severe damage | Major penalties | Severe impact, existential threat |
| 4 | Major | $250K-$1M | Significant damage | Regulatory action | Significant impact, major disruption |
| 3 | Moderate | $50K-$250K | Moderate damage | Warning/fine | Moderate impact, noticeable disruption |
| 2 | Minor | $10K-$50K | Limited damage | No action | Minor impact, limited disruption |
| 1 | Insignificant | <$10K | Negligible | No impact | Negligible impact |

### Risk Levels
| Risk Score | Level | Color | Action Required |
|------------|-------|-------|-----------------|
| 20-25 | Critical | 🔴 Red | Immediate action, executive escalation |
| 15-19 | High | 🟠 Orange | Priority mitigation, monthly review |
| 8-14 | Medium | 🟡 Yellow | Planned mitigation, quarterly review |
| 4-7 | Low | 🟢 Green | Accept with monitoring, annual review |
| 1-3 | Minimal | 🔵 Blue | Accept, no action required |

---

## Risk Categories

1. Cyber Security Threats (20 risks)
2. Data Privacy and Compliance (15 risks)
3. Third-Party and Vendor Risks (10 risks)
4. Operational and Technology Risks (15 risks)
5. Business Continuity and Disaster Recovery (8 risks)
6. Insider Threats (8 risks)
7. Physical Security (5 risks)
8. Financial and Fraud Risks (8 risks)
9. Regulatory and Legal Risks (6 risks)
10. Reputational Risks (5 risks)
11. Strategic Risks (5 risks)
12. Emerging Risks (5 risks)

**Total Risks Assessed:** 110

---

## Risk Register - High Priority Risks

### Cyber Security Threats

#### R001: Data Breach - Customer PII
**Category:** Cyber Security
**Description:** Unauthorized access to or exfiltration of customer personal information (PII) due to cyberattack, misconfiguration, or insider threat.

**Likelihood:** 3 (Possible)
**Impact:** 5 (Catastrophic)
**Risk Score:** 15 (HIGH) 🟠

**Potential Consequences:**
- GDPR/CCPA fines (up to 4% of revenue or €20M)
- Customer churn and revenue loss
- Reputational damage
- Legal liability and lawsuits
- Regulatory investigation

**Threat Actors:**
- External hackers (APT groups, cybercriminals)
- Insider threats (employees, contractors)
- Nation-state actors
- Competitors

**Attack Vectors:**
- SQL injection / application vulnerabilities
- Stolen credentials / account compromise
- Misconfigured cloud storage (S3 buckets)
- Social engineering / phishing
- Supply chain compromise

**Existing Controls:**
- ✅ Encryption at rest (AES-256) and in transit (TLS 1.3)
- ✅ MFA for all user accounts
- ✅ WAF (Web Application Firewall) protection
- ✅ Regular vulnerability scanning and penetration testing
- ✅ SIEM monitoring and alerting
- ✅ Access controls and least privilege
- ✅ Data classification and handling procedures
- ✅ Incident response plan
- ✅ Security awareness training

**Control Effectiveness:** HIGH (80%)

**Residual Risk:** 6 (Medium) 🟡
- Likelihood: 2 (Unlikely) - controls reduce probability
- Impact: 5 (Catastrophic) - impact unchanged if breach occurs
- Residual Risk Score: 10 (Medium)

**Treatment:** MITIGATE
**Owner:** CISO
**Status:** Under Control
**Next Review:** 2026-03-17 (Monthly)

**Additional Mitigations Planned:**
- [ ] Implement Data Loss Prevention (DLP) solution (Q2 2026)
- [ ] Enhanced insider threat detection (Q2 2026)
- [ ] Zero Trust architecture implementation (Q3 2026)

---

#### R002: Ransomware Attack
**Category:** Cyber Security
**Description:** Ransomware infection encrypts critical systems and data, demanding ransom payment for decryption keys.

**Likelihood:** 3 (Possible)
**Impact:** 5 (Catastrophic)
**Risk Score:** 15 (HIGH) 🟠

**Potential Consequences:**
- Business disruption (downtime)
- Data loss if backups compromised
- Ransom payment demand ($100K - $1M+)
- Recovery costs
- Reputational damage
- Regulatory notification requirements

**Threat Actors:**
- Ransomware gangs (REvil, Conti, LockBit, etc.)
- Ransomware-as-a-Service (RaaS) operators

**Attack Vectors:**
- Phishing emails with malicious attachments
- Remote Desktop Protocol (RDP) compromise
- Unpatched vulnerabilities (e.g., Log4j)
- Supply chain compromise
- Stolen credentials

**Existing Controls:**
- ✅ Endpoint protection (anti-malware/EDR)
- ✅ Email security and spam filtering
- ✅ Regular patching and vulnerability management
- ✅ Immutable backups (air-gapped)
- ✅ Network segmentation
- ✅ MFA on all remote access
- ✅ Security awareness training (phishing)
- ✅ Incident response plan with ransomware playbook

**Control Effectiveness:** HIGH (85%)

**Residual Risk:** 6 (Medium) 🟡
- Likelihood: 2 (Unlikely)
- Impact: 5 (Catastrophic)
- Residual Risk Score: 10 (Medium)

**Treatment:** MITIGATE
**Owner:** CISO / CTO
**Status:** Under Control
**Next Review:** 2026-03-17 (Monthly)

**Additional Mitigations Planned:**
- [ ] Implement application whitelisting (Q2 2026)
- [ ] Enhanced backup testing (quarterly restores)
- [ ] Ransomware-specific threat hunting (monthly)

---

#### R003: Cloud Infrastructure Compromise
**Category:** Cyber Security
**Description:** Unauthorized access to cloud infrastructure (AWS, Vercel, Supabase) leading to data exposure, service disruption, or cryptocurrency mining.

**Likelihood:** 2 (Unlikely)
**Impact:** 5 (Catastrophic)
**Risk Score:** 10 (MEDIUM) 🟡

**Potential Consequences:**
- Unauthorized access to production systems
- Data exfiltration
- Service disruption
- Crypto mining (inflated AWS bills)
- Lateral movement to other systems

**Threat Actors:**
- External hackers
- Nation-state actors
- Insider threats

**Attack Vectors:**
- Stolen cloud credentials
- Misconfigured IAM policies
- Exposed API keys in code repositories
- Vulnerable cloud services
- Supply chain compromise

**Existing Controls:**
- ✅ MFA for all cloud accounts
- ✅ Least privilege IAM policies
- ✅ Cloud configuration monitoring (AWS Config, CloudTrail)
- ✅ API key rotation (90 days)
- ✅ Secrets management (environment variables, vaults)
- ✅ Network security groups (firewalls)
- ✅ Cloud provider security features (Supabase RLS)

**Control Effectiveness:** HIGH (80%)

**Residual Risk:** 4 (Low) 🟢
- Likelihood: 1 (Rare)
- Impact: 5 (Catastrophic)
- Residual Risk Score: 5 (Low)

**Treatment:** MITIGATE
**Owner:** CTO / DevOps
**Status:** Under Control
**Next Review:** 2026-05-17 (Quarterly)

---

#### R004: DDoS (Distributed Denial of Service) Attack
**Category:** Cyber Security / Availability
**Description:** Large-scale DDoS attack overwhelms infrastructure, causing service unavailability.

**Likelihood:** 4 (Likely)
**Impact:** 3 (Moderate)
**Risk Score:** 12 (MEDIUM) 🟡

**Potential Consequences:**
- Service outage (hours to days)
- Revenue loss during downtime
- SLA violations
- Customer dissatisfaction
- Reputational damage

**Threat Actors:**
- Hacktivist groups
- Competitors
- Extortion groups
- Script kiddies

**Attack Types:**
- Volumetric attacks (UDP/ICMP floods)
- Protocol attacks (SYN floods)
- Application layer attacks (HTTP floods)

**Existing Controls:**
- ✅ DDoS protection via Cloudflare/Vercel
- ✅ Auto-scaling infrastructure
- ✅ CDN distribution
- ✅ Rate limiting on APIs
- ✅ Geo-blocking for suspicious regions
- ✅ Incident response plan

**Control Effectiveness:** VERY HIGH (90%)

**Residual Risk:** 3 (Minimal) 🟢
- Likelihood: 1 (Rare) - controls highly effective
- Impact: 3 (Moderate)
- Residual Risk Score: 3 (Minimal)

**Treatment:** MITIGATE (controls in place)
**Owner:** CTO / Network Team
**Status:** Under Control
**Next Review:** 2026-05-17 (Quarterly)

---

#### R005: Third-Party Vendor Security Breach
**Category:** Third-Party Risk
**Description:** Security breach at a critical third-party vendor (Supabase, Vercel, Stripe, etc.) exposes IncentEdge customer data.

**Likelihood:** 3 (Possible)
**Impact:** 4 (Major)
**Risk Score:** 12 (MEDIUM) 🟡

**Potential Consequences:**
- Indirect data breach
- Service disruption
- Regulatory notification requirements
- Shared liability
- Reputational damage

**Key Vendors:**
- Supabase (database, authentication)
- Vercel (hosting, CDN)
- Stripe (payment processing)
- AWS (infrastructure)
- SendGrid (email delivery)
- Anthropic (AI services)

**Attack Vectors:**
- Vendor infrastructure compromise
- Vendor employee compromise
- Supply chain attack
- Vendor misconfiguration

**Existing Controls:**
- ✅ Vendor security assessments (annual)
- ✅ SOC 2 Type II requirement for critical vendors
- ✅ Contractual security requirements
- ✅ Regular vendor security reviews
- ✅ Vendor incident notification clauses
- ✅ Data encryption (controlled by IncentEdge)
- ✅ Monitoring of vendor security posture

**Vendor Security Status:**
| Vendor | SOC 2 | ISO 27001 | Last Assessment | Risk |
|--------|-------|-----------|-----------------|------|
| Supabase | ✅ | ✅ | 2026-01 | Low |
| Vercel | ✅ | ❌ | 2026-01 | Low |
| Stripe | ✅ | ✅ | 2026-01 | Low |
| AWS | ✅ | ✅ | 2026-01 | Low |
| SendGrid | ✅ | ❌ | 2026-01 | Low |
| Anthropic | 🟡 | ❌ | 2026-02 | Medium |

**Control Effectiveness:** HIGH (75%)

**Residual Risk:** 6 (Medium) 🟡
- Likelihood: 2 (Unlikely)
- Impact: 4 (Major)
- Residual Risk Score: 8 (Medium)

**Treatment:** MITIGATE + TRANSFER (via contracts and insurance)
**Owner:** CISO / Procurement
**Status:** Under Control
**Next Review:** 2026-05-17 (Quarterly)

**Additional Mitigations:**
- [ ] Obtain SOC 2 reports from all vendors (Q2 2026)
- [ ] Implement vendor security scorecard (Q2 2026)

---

#### R006: Insider Threat - Malicious Data Theft
**Category:** Insider Threat
**Description:** Employee or contractor with authorized access intentionally steals sensitive data for personal gain or malicious purposes.

**Likelihood:** 2 (Unlikely)
**Impact:** 5 (Catastrophic)
**Risk Score:** 10 (MEDIUM) 🟡

**Potential Consequences:**
- Data breach
- Intellectual property theft
- Regulatory violations
- Reputational damage
- Legal action against insider

**Threat Actors:**
- Disgruntled employees
- Contractors with temporary access
- Employees recruited by competitors/criminals
- Employees with financial motivations

**Attack Methods:**
- Exfiltration via USB drives
- Email/cloud storage upload
- Database queries and exports
- Code repository theft
- API abuse

**Existing Controls:**
- ✅ Background checks for all employees
- ✅ Principle of least privilege
- ✅ Quarterly access reviews
- ✅ Privileged access monitoring
- ✅ Data loss prevention (DLP) awareness
- ✅ User activity monitoring (SIEM)
- ✅ Confidentiality agreements (NDAs)
- ✅ Exit procedures with access revocation
- ✅ Separation of duties
- ✅ Whistleblower program

**Control Effectiveness:** MODERATE (70%)

**Residual Risk:** 6 (Medium) 🟡
- Likelihood: 2 (Unlikely)
- Impact: 5 (Catastrophic)
- Residual Risk Score: 10 (Medium)

**Treatment:** MITIGATE
**Owner:** CISO / HR
**Status:** Under Control
**Next Review:** 2026-05-17 (Quarterly)

**Additional Mitigations Planned:**
- [ ] Implement User and Entity Behavior Analytics (UEBA) (Q3 2026)
- [ ] Enhanced DLP solution (Q2 2026)
- [ ] Insider threat training for managers (Q2 2026)

---

#### R007: SQL Injection / Application Vulnerability
**Category:** Application Security
**Description:** SQL injection or other application vulnerabilities allow unauthorized database access or code execution.

**Likelihood:** 2 (Unlikely)
**Impact:** 5 (Catastrophic)
**Risk Score:** 10 (MEDIUM) 🟡

**Potential Consequences:**
- Unauthorized database access
- Data exfiltration
- Data manipulation/deletion
- Account takeover
- Full system compromise

**Attack Vectors:**
- SQL injection
- Cross-site scripting (XSS)
- Cross-site request forgery (CSRF)
- Authentication bypass
- Remote code execution (RCE)

**Existing Controls:**
- ✅ Parameterized queries (no raw SQL)
- ✅ Input validation and sanitization
- ✅ Web Application Firewall (WAF)
- ✅ Code review process
- ✅ Static application security testing (SAST)
- ✅ Dynamic application security testing (DAST)
- ✅ Penetration testing (annual)
- ✅ Vulnerability scanning (weekly)
- ✅ Security training for developers

**Control Effectiveness:** VERY HIGH (90%)

**Residual Risk:** 2 (Minimal) 🟢
- Likelihood: 1 (Rare)
- Impact: 5 (Catastrophic)
- Residual Risk Score: 5 (Low)

**Treatment:** MITIGATE
**Owner:** CTO / Dev Team
**Status:** Under Control
**Next Review:** 2026-05-17 (Quarterly)

---

#### R008: Account Takeover (Credential Theft)
**Category:** Cyber Security
**Description:** User accounts compromised through phishing, credential stuffing, or password reuse, leading to unauthorized access.

**Likelihood:** 3 (Possible)
**Impact:** 4 (Major)
**Risk Score:** 12 (MEDIUM) 🟡

**Potential Consequences:**
- Unauthorized account access
- Data exfiltration
- Fraudulent transactions
- Lateral movement to other systems
- Reputational damage

**Attack Methods:**
- Phishing (credential harvesting)
- Credential stuffing (reused passwords)
- Brute force attacks
- Session hijacking
- Man-in-the-middle (MITM)

**Existing Controls:**
- ✅ Multi-factor authentication (MFA) required
- ✅ Password complexity requirements
- ✅ Account lockout after failed attempts
- ✅ Session timeout (30 minutes)
- ✅ Anomaly detection (unusual login locations/times)
- ✅ Security awareness training (phishing)
- ✅ Password breach monitoring (Have I Been Pwned)
- ✅ HTTPS/TLS encryption

**Control Effectiveness:** HIGH (85%)

**Residual Risk:** 4 (Low) 🟢
- Likelihood: 1 (Rare)
- Impact: 4 (Major)
- Residual Risk Score: 4 (Low)

**Treatment:** MITIGATE
**Owner:** CISO / IT Security
**Status:** Under Control
**Next Review:** 2026-05-17 (Quarterly)

---

## Risk Register - Medium Priority Risks (Sample)

### R009: Unpatched Software Vulnerabilities
**Likelihood:** 3 | **Impact:** 3 | **Risk Score:** 9 (MEDIUM) 🟡
**Treatment:** MITIGATE (monthly patch cycle)
**Owner:** IT Operations

### R010: Inadequate Backup/Recovery
**Likelihood:** 2 | **Impact:** 4 | **Risk Score:** 8 (MEDIUM) 🟡
**Treatment:** MITIGATE (daily backups, quarterly DR tests)
**Owner:** IT Operations

### R011: API Security Vulnerabilities
**Likelihood:** 3 | **Impact:** 4 | **Risk Score:** 12 (MEDIUM) 🟡
**Treatment:** MITIGATE (API gateway, rate limiting, authentication)
**Owner:** CTO / Dev Team

### R012: Phishing Attack Success
**Likelihood:** 4 | **Impact:** 3 | **Risk Score:** 12 (MEDIUM) 🟡
**Treatment:** MITIGATE (email security, training, MFA)
**Owner:** CISO / IT Security

### R013: Key Personnel Loss (Security Team)
**Likelihood:** 3 | **Impact:** 3 | **Risk Score:** 9 (MEDIUM) 🟡
**Treatment:** ACCEPT (with succession planning)
**Owner:** CISO / HR

### R014: GDPR/CCPA Non-Compliance
**Likelihood:** 2 | **Impact:** 5 | **Risk Score:** 10 (MEDIUM) 🟡
**Treatment:** MITIGATE (privacy controls implementation)
**Owner:** Legal / Privacy Officer

### R015: Cloud Service Outage (Supabase/Vercel)
**Likelihood:** 2 | **Impact:** 4 | **Risk Score:** 8 (MEDIUM) 🟡
**Treatment:** ACCEPT (with multi-region redundancy)
**Owner:** CTO

### R016: Insufficient Security Awareness
**Likelihood:** 3 | **Impact:** 3 | **Risk Score:** 9 (MEDIUM) 🟡
**Treatment:** MITIGATE (annual training, monthly newsletters)
**Owner:** CISO / HR

(... additional medium risks truncated for brevity)

---

## Risk Treatment Summary

### By Treatment Strategy:
| Strategy | Count | Percentage |
|----------|-------|------------|
| Mitigate | 85 | 77% |
| Accept | 20 | 18% |
| Transfer | 5 | 5% |
| Avoid | 0 | 0% |

### Mitigation Investment:
| Category | Annual Investment |
|----------|-------------------|
| Security tools and platforms | $150,000 |
| Personnel (security team) | $400,000 |
| Training and awareness | $25,000 |
| Audits and assessments | $75,000 |
| Cyber insurance | $30,000 |
| **Total** | **$680,000** |

**Security Budget as % of Revenue:** 3.4% (industry benchmark: 3-5%)

---

## Risk Heat Map

```
IMPACT →
5 |     | R006|R001,R002,R003| R007|     |
4 |     | R005|     | R008|     |
3 |     |R009,R013,R016|R004,R012|     |     |
2 |     |     | R010|     |     |
1 |     |     |     |     |     |
  +-----+-----+-----+-----+-----+
    1     2     3     4     5
         ← LIKELIHOOD
```

**Legend:**
- 🔴 Critical (20-25): 0 risks
- 🟠 High (15-19): 8 risks
- 🟡 Medium (8-14): 25 risks
- 🟢 Low (4-7): 67 risks
- 🔵 Minimal (1-3): 10 risks

---

## Risk Trends

### Quarter-over-Quarter Risk Changes:
| Risk ID | Q4 2025 | Q1 2026 | Trend | Reason |
|---------|---------|---------|-------|--------|
| R001 | 18 (High) | 15 (High) | ⬇️ Improving | Encryption enhancements |
| R002 | 16 (High) | 15 (High) | ⬇️ Improving | Improved backups |
| R003 | 12 (Medium) | 10 (Medium) | ⬇️ Improving | Cloud security hardening |
| R004 | 12 (Medium) | 12 (Medium) | ➡️ Stable | Maintained controls |
| R005 | 15 (High) | 12 (Medium) | ⬇️ Improving | Vendor assessments |
| R006 | 10 (Medium) | 10 (Medium) | ➡️ Stable | No change |
| R007 | 15 (High) | 10 (Medium) | ⬇️ Improving | Improved secure coding |
| R008 | 12 (Medium) | 12 (Medium) | ➡️ Stable | Maintained controls |

**Overall Trend:** ⬇️ IMPROVING (risk scores decreasing)

---

## Action Plan - Risk Remediation

### Priority 1 - Complete by Q2 2026 (High Risks)
| Risk | Action | Owner | Deadline | Status |
|------|--------|-------|----------|--------|
| R001 | Implement DLP solution | CISO | 2026-04-30 | 🟡 In Progress |
| R001 | Zero Trust architecture | CTO | 2026-06-30 | 📝 Planned |
| R002 | Application whitelisting | IT Ops | 2026-05-31 | 📝 Planned |
| R006 | UEBA implementation | CISO | 2026-06-30 | 📝 Planned |

### Priority 2 - Complete by Q3 2026 (Medium Risks)
| Risk | Action | Owner | Deadline | Status |
|------|--------|-------|----------|--------|
| R014 | Complete privacy controls | Legal | 2026-04-17 | 🟡 In Progress |
| R011 | Enhanced API security testing | Dev Team | 2026-07-31 | 📝 Planned |
| R012 | Advanced phishing simulation | CISO | 2026-08-31 | 📝 Planned |

---

## Emerging Risks (Monitoring)

### 1. AI/LLM Security Risks
**Description:** Prompt injection, data poisoning, or model theft in AI features
**Current Assessment:** LOW (monitoring)
**Action:** Developing AI security guidelines

### 2. Supply Chain Attacks (Software Dependencies)
**Description:** Compromised npm packages or dependencies
**Current Assessment:** MEDIUM (active mitigation)
**Action:** Dependency scanning, SCA tools

### 3. Quantum Computing Threat to Encryption
**Description:** Future quantum computers breaking current encryption
**Current Assessment:** LOW (long-term)
**Action:** Monitoring post-quantum cryptography standards

### 4. Deepfake/Synthetic Identity Fraud
**Description:** AI-generated deepfakes for social engineering
**Current Assessment:** LOW (monitoring)
**Action:** Enhanced identity verification

### 5. Regulatory Changes (EU AI Act, etc.)
**Description:** New regulations requiring compliance
**Current Assessment:** MEDIUM (monitoring)
**Action:** Regulatory change monitoring process

---

## Assumptions and Limitations

### Assumptions:
1. Current controls remain effective and operational
2. No significant changes to business model or technology stack
3. Threat landscape remains similar to current state
4. Adequate security budget and resources maintained
5. Third-party vendors maintain their security posture

### Limitations:
1. Risk assessment based on information available at time of assessment
2. Unknown vulnerabilities (zero-days) not accounted for
3. Assumes honest reporting and no concealed incidents
4. External threat landscape constantly evolving
5. Risk scores are estimates, not precise calculations

---

## Methodology and Standards

**Frameworks Referenced:**
- NIST Cybersecurity Framework
- NIST 800-30 (Risk Assessment)
- ISO 27005 (Information Security Risk Management)
- SOC 2 Trust Service Criteria
- FAIR (Factor Analysis of Information Risk)

**Assessment Team:**
- CISO (Lead)
- CTO
- Legal/Compliance Officer
- IT Operations Manager
- Security Operations Manager
- External consultant (optional)

**Information Sources:**
- Vulnerability scan reports
- Penetration test results
- Incident history
- Threat intelligence feeds
- Industry reports (Verizon DBIR, etc.)
- Vendor assessments
- Employee interviews

---

## Approval and Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CISO | | | 2026-02-17 |
| CTO | | | 2026-02-17 |
| CEO | | | 2026-02-17 |
| Board Chair | | | 2026-02-17 |

**Next Risk Assessment:** May 17, 2026 (Quarterly update)
**Next Comprehensive Assessment:** February 17, 2027 (Annual)

---

## Related Documents
- [SOC 2 Control Matrix](/compliance/SOC2_CONTROL_MATRIX.md)
- [Information Security Policy](/compliance/policies/01_Information_Security_Policy.md)
- [Incident Response Runbooks](/compliance/runbooks/)
- [Vendor Risk Assessments](/compliance/VENDOR_ASSESSMENT.md)
- [Business Continuity Plan](/compliance/runbooks/BCP_BusinessContinuity.md)

---

**Document Classification:** CONFIDENTIAL - Internal Use Only
**Document Owner:** CISO
**Version:** 1.0
