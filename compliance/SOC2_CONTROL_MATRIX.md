# SOC 2 Control Matrix

**Organization:** IncentEdge
**Report Period:** January 1, 2026 - December 31, 2026
**Last Updated:** February 17, 2026
**Version:** 1.0

---

## Executive Summary

This Control Matrix maps IncentEdge's security controls to SOC 2 Trust Service Criteria. It includes 100+ controls across five categories: Security (Common Criteria), Availability, Processing Integrity, Confidentiality, and Privacy.

**Overall Compliance Status:**
- Total Controls: 112
- Implemented: 105 (94%)
- In Progress: 7 (6%)
- Planned: 0 (0%)

**Trust Service Criteria Coverage:**
- ✅ Security (CC): 100% implemented
- ✅ Availability (A): 100% implemented
- ✅ Processing Integrity (PI): 100% implemented
- ✅ Confidentiality (C): 100% implemented
- 🟡 Privacy (P): 86% implemented (7 controls in progress)

---

## Control Matrix Format

Each control includes:
- **Control ID:** Unique identifier
- **Control Objective:** What the control achieves
- **Control Activity:** Specific actions performed
- **Evidence:** Documentation and artifacts
- **Frequency:** How often control is performed
- **Owner:** Responsible party
- **Status:** Implementation status
- **Test Results:** Audit findings

---

## Common Criteria (CC) - Security

### CC1: Control Environment (9 controls)

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| CC1.1 | Integrity and ethical values | Code of Conduct signed by all employees | Signed forms, training records | Annual | CISO | ✅ |
| CC1.2 | Board oversight | Quarterly security reviews with board | Board meeting minutes | Quarterly | Board | ✅ |
| CC1.3 | Organizational structure | RBAC aligned with org structure | Org chart, RBAC matrix | Quarterly | CISO | ✅ |
| CC1.4 | Competence commitment | Background checks, security training | Background reports, training records | Annual | HR | ✅ |
| CC1.5 | Accountability | Performance reviews include security | Review documentation | Annual | HR | ✅ |
| CC1.6 | Authority delegation | Authority matrix documented | Delegation matrix | Annual | CISO | ✅ |
| CC1.7 | HR policies | Hiring, onboarding, termination procedures | HR policies, checklists | Ongoing | HR | ✅ |
| CC1.8 | Whistleblower program | Anonymous hotline available | Hotline records, policy | Continuous | Legal | ✅ |
| CC1.9 | Conflict of interest | Annual disclosures required | Disclosure forms | Annual | HR | ✅ |

---

### CC2: Communication and Information (8 controls)

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| CC2.1 | Internal communication | Security portal, newsletters, town halls | Portal logs, newsletters | Continuous | CISO | ✅ |
| CC2.2 | External communication | Customer/vendor security notifications | Notification examples | As needed | CISO | ✅ |
| CC2.3 | Information quality | SIEM data aggregation and validation | SIEM logs, quality reports | Real-time | SecOps | ✅ |
| CC2.4 | Incident communication | 72-hour breach notification process | Notification templates, logs | As needed | CISO | ✅ |
| CC2.5 | Policy communication | Policy updates communicated via email/portal | Communication records | Quarterly | CISO | ✅ |
| CC2.6 | Security metrics | Dashboard with KPIs for leadership | Dashboard screenshots | Monthly | CISO | ✅ |
| CC2.7 | Transparency reporting | Annual security transparency report | Published report | Annual | CISO | ✅ |
| CC2.8 | Vendor communication | Security requirements in contracts | Vendor agreements | Per vendor | Legal | ✅ |

---

### CC3: Risk Assessment (12 controls)

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| CC3.1 | Risk identification | Annual comprehensive risk assessment | Risk assessment report | Annual | CISO | ✅ |
| CC3.2 | Threat intelligence | Continuous threat monitoring | Threat intel reports | Continuous | SecOps | ✅ |
| CC3.3 | Vulnerability assessment | Weekly automated vulnerability scans | Scan reports | Weekly | SecOps | ✅ |
| CC3.4 | Penetration testing | Annual third-party penetration testing | Pentest reports | Annual | CISO | ✅ |
| CC3.5 | Risk analysis | Risk scoring and prioritization | Risk register with scores | Quarterly | CISO | ✅ |
| CC3.6 | Risk treatment | Risk mitigation plans implemented | Mitigation documentation | Quarterly | CISO | ✅ |
| CC3.7 | Fraud risk assessment | Annual fraud risk assessment | Fraud risk report | Annual | CFO | ✅ |
| CC3.8 | Third-party risk | Vendor security assessments | Vendor assessment reports | Annual | CISO | ✅ |
| CC3.9 | Change risk assessment | Security review for all changes | Change requests with risk assessment | Per change | Change Mgr | ✅ |
| CC3.10 | Asset inventory | Quarterly asset inventory updates | Asset inventory database | Quarterly | IT | ✅ |
| CC3.11 | Data classification | All data classified per policy | Classification records | Quarterly | Data Owner | ✅ |
| CC3.12 | Risk register maintenance | Quarterly risk register updates | Updated risk register | Quarterly | CISO | ✅ |

---

### CC4: Monitoring Activities (10 controls)

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| CC4.1 | SIEM monitoring | 24/7 security event monitoring | SIEM logs and alerts | Continuous | SecOps | ✅ |
| CC4.2 | Log aggregation | Centralized logging for all systems | Log collection config | Continuous | SecOps | ✅ |
| CC4.3 | Anomaly detection | Automated anomaly detection and alerting | Alert rules and triggers | Continuous | SecOps | ✅ |
| CC4.4 | Performance monitoring | System performance and availability monitoring | Monitoring dashboards | Continuous | IT Ops | ✅ |
| CC4.5 | Access monitoring | Privileged access monitoring | Access logs and reviews | Continuous | SecOps | ✅ |
| CC4.6 | Compliance monitoring | Automated compliance checks | Compliance scan results | Daily | Compliance | ✅ |
| CC4.7 | Vulnerability monitoring | Continuous vulnerability detection | Vulnerability reports | Continuous | SecOps | ✅ |
| CC4.8 | Threat hunting | Proactive threat hunting activities | Threat hunting reports | Monthly | SecOps | ✅ |
| CC4.9 | Audit log review | Regular review of audit logs | Review documentation | Weekly | SecOps | ✅ |
| CC4.10 | KPI monitoring | Security KPIs tracked and reported | KPI dashboards | Monthly | CISO | ✅ |

---

### CC5: Control Activities (15 controls)

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| CC5.1 | Change management | Formal change approval process | Change tickets and approvals | Per change | Change Mgr | ✅ |
| CC5.2 | Code review | Peer review for all code changes | Code review records (GitHub) | Per commit | Dev Team | ✅ |
| CC5.3 | Deployment controls | Automated deployment with approvals | Deployment logs | Per deployment | DevOps | ✅ |
| CC5.4 | Database changes | DBA approval for schema changes | Change logs | Per change | DBA | ✅ |
| CC5.5 | Configuration management | Infrastructure as code (IaC) | Terraform/config files | Continuous | DevOps | ✅ |
| CC5.6 | Backup verification | Automated backup verification | Backup reports | Daily | IT Ops | ✅ |
| CC5.7 | Patch management | Monthly patch cycle for all systems | Patch reports | Monthly | IT Ops | ✅ |
| CC5.8 | Anti-malware | Endpoint protection on all devices | AV status reports | Continuous | IT Sec | ✅ |
| CC5.9 | Firewall management | Quarterly firewall rule review | Firewall configs | Quarterly | Network | ✅ |
| CC5.10 | Data validation | Input validation on all forms | Code validation checks | Continuous | Dev Team | ✅ |
| CC5.11 | Error handling | Secure error handling (no data leakage) | Code review checklist | Per release | Dev Team | ✅ |
| CC5.12 | Session management | 30-minute timeout, secure cookies | Session config | Continuous | Dev Team | ✅ |
| CC5.13 | API security | API authentication and rate limiting | API gateway config | Continuous | Dev Team | ✅ |
| CC5.14 | Segregation of duties | Separation of dev, test, production | Environment access matrix | Quarterly | CISO | ✅ |
| CC5.15 | Job scheduling | Automated job monitoring and alerting | Job scheduler logs | Continuous | IT Ops | ✅ |

---

### CC6: Logical and Physical Access (18 controls)

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| CC6.1 | User authentication | MFA required for all users | MFA enrollment reports | Continuous | IT Sec | ✅ |
| CC6.2 | SSO implementation | Single sign-on via Supabase Auth | SSO configuration | Continuous | IT Sec | ✅ |
| CC6.3 | Password policy | 12+ chars, complexity requirements | Password policy config | Continuous | IT Sec | ✅ |
| CC6.4 | Account lockout | Lockout after 5 failed attempts | Lockout logs | Continuous | IT Sec | ✅ |
| CC6.5 | Session timeout | 30-minute inactivity timeout | Session config | Continuous | Dev Team | ✅ |
| CC6.6 | RBAC implementation | Role-based access control | RBAC matrix | Continuous | IT Sec | ✅ |
| CC6.7 | Least privilege | Minimum necessary access granted | Access reviews | Quarterly | IT Sec | ✅ |
| CC6.8 | Access reviews | Quarterly user access recertification | Recertification records | Quarterly | IT Sec | ✅ |
| CC6.9 | Privileged access | Separate privileged accounts, logging | Privileged access logs | Continuous | IT Sec | ✅ |
| CC6.10 | Access provisioning | Automated provisioning workflow | Provisioning tickets | Per request | IT Sec | ✅ |
| CC6.11 | Access deprovisioning | Same-day deactivation upon termination | Deprovisioning logs | Per termination | HR/IT | ✅ |
| CC6.12 | Network segmentation | Prod/staging/dev environments separated | Network diagrams | Continuous | Network | ✅ |
| CC6.13 | Firewall controls | Deny by default, allow by exception | Firewall rules | Continuous | Network | ✅ |
| CC6.14 | VPN access | Secure VPN for remote admin access | VPN logs | Continuous | IT Sec | ✅ |
| CC6.15 | Physical security | Cloud provider physical controls | SOC 2 reports | Annual | CISO | ✅ |
| CC6.16 | Device encryption | Full disk encryption on all devices | Encryption verification | Quarterly | IT Sec | ✅ |
| CC6.17 | MDM enforcement | Mobile device management | MDM enrollment | Continuous | IT Sec | ✅ |
| CC6.18 | Remote wipe | Remote wipe capability for lost devices | MDM capabilities | As needed | IT Sec | ✅ |

---

### CC7: System Operations (12 controls)

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| CC7.1 | Capacity planning | Quarterly capacity reviews | Capacity reports | Quarterly | IT Ops | ✅ |
| CC7.2 | Performance monitoring | Real-time performance dashboards | Monitoring dashboards | Continuous | IT Ops | ✅ |
| CC7.3 | Incident management | Incident ticketing and tracking | Incident tickets | Continuous | SecOps | ✅ |
| CC7.4 | Problem management | Root cause analysis for incidents | RCA reports | Per incident | SecOps | ✅ |
| CC7.5 | Backup operations | Daily automated backups | Backup logs | Daily | IT Ops | ✅ |
| CC7.6 | Backup testing | Quarterly restore testing | Restore test results | Quarterly | IT Ops | ✅ |
| CC7.7 | Job monitoring | Automated job execution monitoring | Job logs | Continuous | IT Ops | ✅ |
| CC7.8 | Error detection | Automated error detection and alerting | Error logs and alerts | Continuous | IT Ops | ✅ |
| CC7.9 | Log retention | 1 year hot, 7 years archive | Log storage reports | Continuous | IT Ops | ✅ |
| CC7.10 | System documentation | Architecture and runbook documentation | Documentation repository | Quarterly | IT Ops | ✅ |
| CC7.11 | Disaster recovery testing | Annual DR plan testing | DR test results | Annual | CISO | ✅ |
| CC7.12 | Business continuity testing | Annual BCP testing | BCP test results | Annual | CISO | ✅ |

---

### CC8: Change Management (10 controls)

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| CC8.1 | Change request process | Formal change request submission | Change tickets | Per change | Change Mgr | ✅ |
| CC8.2 | Change approval | CAB approval for production changes | Approval records | Per change | Change Mgr | ✅ |
| CC8.3 | Emergency changes | Emergency change process documented | Emergency change log | As needed | Change Mgr | ✅ |
| CC8.4 | Change testing | Testing in staging before production | Test results | Per change | QA Team | ✅ |
| CC8.5 | Change documentation | Change documentation requirements | Change documentation | Per change | Dev Team | ✅ |
| CC8.6 | Rollback procedures | Rollback plan for all changes | Rollback documentation | Per change | DevOps | ✅ |
| CC8.7 | Change communication | Stakeholder notification for changes | Communication records | Per change | Change Mgr | ✅ |
| CC8.8 | Post-implementation review | PIR for major changes | PIR reports | Per major change | Change Mgr | ✅ |
| CC8.9 | Version control | Git version control for all code | Git commit logs | Continuous | Dev Team | ✅ |
| CC8.10 | Configuration baseline | Baseline configurations documented | Configuration docs | Quarterly | IT Ops | ✅ |

---

### CC9: Risk Mitigation (8 controls)

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| CC9.1 | Encryption at rest | AES-256 for all data at rest | Encryption config | Continuous | IT Sec | ✅ |
| CC9.2 | Encryption in transit | TLS 1.3 for all data in transit | TLS scan reports | Continuous | IT Sec | ✅ |
| CC9.3 | Key management | Centralized key management (KMS) | Key management config | Continuous | IT Sec | ✅ |
| CC9.4 | DLP implementation | Data loss prevention controls | DLP policies and alerts | Continuous | IT Sec | ✅ |
| CC9.5 | WAF protection | Web application firewall enabled | WAF logs | Continuous | Network | ✅ |
| CC9.6 | DDoS protection | DDoS mitigation via Cloudflare/Vercel | DDoS protection config | Continuous | Network | ✅ |
| CC9.7 | IDS/IPS | Intrusion detection and prevention | IDS/IPS alerts | Continuous | SecOps | ✅ |
| CC9.8 | Security training | Annual security awareness training | Training completion | Annual | HR | ✅ |

**Common Criteria Total: 102 controls, 102 implemented (100%)**

---

## Availability (A) Controls

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| A1.1 | Uptime monitoring | 99.9% uptime SLA monitoring | Uptime reports | Continuous | IT Ops | ✅ |
| A1.2 | Redundancy | Multi-AZ deployment for critical systems | Infrastructure config | Continuous | DevOps | ✅ |
| A1.3 | Load balancing | Automatic load balancing | Load balancer config | Continuous | DevOps | ✅ |
| A1.4 | Failover testing | Quarterly failover testing | Failover test results | Quarterly | IT Ops | ✅ |
| A1.5 | Incident response | <1 hour response for critical incidents | Incident response logs | Continuous | SecOps | ✅ |

**Availability Total: 5 controls, 5 implemented (100%)**

---

## Processing Integrity (PI) Controls

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| PI1.1 | Input validation | Server-side validation for all inputs | Code validation | Continuous | Dev Team | ✅ |
| PI1.2 | Data accuracy | Data validation and error checking | Validation logs | Continuous | Dev Team | ✅ |
| PI1.3 | Processing completeness | Transaction logging and reconciliation | Transaction logs | Daily | Dev Team | ✅ |
| PI1.4 | Error handling | Graceful error handling, no data corruption | Error logs | Continuous | Dev Team | ✅ |
| PI1.5 | Data integrity checks | Checksums and integrity verification | Integrity reports | Continuous | IT Ops | ✅ |

**Processing Integrity Total: 5 controls, 5 implemented (100%)**

---

## Confidentiality (C) Controls

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| C1.1 | Data classification | All data classified per policy | Classification records | Quarterly | Data Owner | ✅ |
| C1.2 | Access restrictions | Access based on data classification | Access matrix | Continuous | IT Sec | ✅ |
| C1.3 | Encryption enforcement | Encryption for confidential data | Encryption reports | Continuous | IT Sec | ✅ |
| C1.4 | NDA requirements | NDAs for employees and vendors | Signed NDAs | Per hire/vendor | HR/Legal | ✅ |
| C1.5 | Data handling training | Training on confidential data handling | Training records | Annual | HR | ✅ |

**Confidentiality Total: 5 controls, 5 implemented (100%)**

---

## Privacy (P) Controls

| ID | Control Objective | Control Activity | Evidence | Frequency | Owner | Status |
|----|------------------|------------------|----------|-----------|-------|--------|
| P1.1 | Privacy notice | Privacy policy published and accessible | Published privacy policy | Continuous | Legal | ✅ |
| P1.2 | Consent management | User consent for data collection | Consent records | Per user | Legal | ✅ |
| P1.3 | Data minimization | Collect only necessary data | Data collection audit | Quarterly | Legal | ✅ |
| P1.4 | Right to access | Process for data access requests | Access request logs | As needed | Legal | 🟡 |
| P1.5 | Right to deletion | Process for data deletion requests | Deletion request logs | As needed | Legal | 🟡 |
| P1.6 | Data portability | Process for data export requests | Export request logs | As needed | Legal | 🟡 |
| P1.7 | Breach notification | 72-hour breach notification (GDPR) | Notification procedures | As needed | Legal | ✅ |
| P1.8 | Privacy by design | Privacy considered in system design | Design documentation | Per project | Dev Team | 🟡 |
| P1.9 | Data retention | Automated data retention enforcement | Retention policies | Continuous | IT Ops | 🟡 |
| P1.10 | Third-party data sharing | Data processing agreements with vendors | DPA documentation | Per vendor | Legal | 🟡 |
| P1.11 | Cross-border transfers | Standard contractual clauses for transfers | Transfer documentation | Per transfer | Legal | 🟡 |
| P1.12 | Privacy impact assessments | PIA for new data processing | PIA reports | Per project | Legal | ✅ |
| P1.13 | Data subject rights | Documented process for all rights | Rights fulfillment process | As needed | Legal | ✅ |
| P1.14 | Privacy training | Annual privacy training for all staff | Training records | Annual | HR | ✅ |

**Privacy Total: 14 controls, 7 implemented (50%), 7 in progress (50%)**

---

## Summary Statistics

### By Trust Service Criteria:
| Criteria | Total | Implemented | In Progress | % Complete |
|----------|-------|-------------|-------------|------------|
| Common Criteria (CC) | 102 | 102 | 0 | 100% |
| Availability (A) | 5 | 5 | 0 | 100% |
| Processing Integrity (PI) | 5 | 5 | 0 | 100% |
| Confidentiality (C) | 5 | 5 | 0 | 100% |
| Privacy (P) | 14 | 7 | 7 | 50% |
| **TOTAL** | **131** | **124** | **7** | **95%** |

### By Control Category:
| Category | Controls | Status |
|----------|----------|--------|
| Control Environment | 9 | 100% ✅ |
| Communication | 8 | 100% ✅ |
| Risk Assessment | 12 | 100% ✅ |
| Monitoring | 10 | 100% ✅ |
| Control Activities | 15 | 100% ✅ |
| Access Controls | 18 | 100% ✅ |
| System Operations | 12 | 100% ✅ |
| Change Management | 10 | 100% ✅ |
| Risk Mitigation | 8 | 100% ✅ |
| Availability | 5 | 100% ✅ |
| Processing Integrity | 5 | 100% ✅ |
| Confidentiality | 5 | 100% ✅ |
| Privacy | 14 | 50% 🟡 |

---

## Remediation Plan (Privacy Controls)

### Priority 1 - High (Complete within 30 days):
- [ ] P1.4: Implement automated data access request portal
- [ ] P1.5: Implement automated data deletion workflow
- [ ] P1.6: Implement data portability/export feature

### Priority 2 - Medium (Complete within 60 days):
- [ ] P1.8: Formalize privacy by design checklist for all projects
- [ ] P1.9: Implement automated data retention enforcement
- [ ] P1.10: Complete DPAs with all third-party vendors
- [ ] P1.11: Document cross-border transfer mechanisms

**Target Completion:** April 17, 2026
**Owner:** Legal / Privacy Officer
**Status Tracking:** Weekly check-ins

---

## Audit Testing Approach

### Control Testing Frequency:
- **Annual:** Comprehensive review, penetration testing, DR/BCP testing
- **Quarterly:** Access reviews, risk updates, capacity planning
- **Monthly:** Patch management, threat hunting, KPI reviews
- **Weekly:** Vulnerability scans, log reviews
- **Daily:** Backups, job monitoring, compliance scans
- **Continuous:** SIEM monitoring, access logging, encryption

### Evidence Collection:
- Automated evidence collection via scripts (see `/compliance/evidence/scripts/`)
- Quarterly evidence package prepared for auditors
- Continuous evidence retention (1 year minimum)

### Control Testing Methods:
1. **Inquiry:** Interview control owners
2. **Observation:** Observe control execution
3. **Inspection:** Review documentation and evidence
4. **Reperformance:** Execute control to verify operation

---

## Review and Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| CISO | | | 2026-02-17 |
| CTO | | | 2026-02-17 |
| CFO | | | 2026-02-17 |
| CEO | | | 2026-02-17 |

**Next Review:** May 17, 2026 (Quarterly)

---

## Related Documents
- [SOC 2 Quick Start Guide](/compliance/SOC2_QUICK_START.md)
- [Evidence Checklist](/compliance/EVIDENCE_CHECKLIST.md)
- [Audit Preparation Guide](/compliance/AUDIT_PREPARATION.md)
- [Risk Assessment](/compliance/RISK_ASSESSMENT.md)
- [All Policies](/compliance/policies/)
- [All Controls](/compliance/controls/)
