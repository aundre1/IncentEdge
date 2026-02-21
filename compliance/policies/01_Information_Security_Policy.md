# Information Security Policy (ISMS)

**Policy Owner:** Chief Information Security Officer (CISO)
**Effective Date:** 2026-01-01
**Last Reviewed:** 2026-02-17
**Next Review:** 2026-08-17
**Version:** 1.0

---

## 1. Purpose and Scope

### 1.1 Purpose
This Information Security Policy establishes the framework for protecting IncentEdge's information assets, customer data, and technology infrastructure from unauthorized access, disclosure, modification, destruction, or disruption.

### 1.2 Scope
This policy applies to:
- All employees, contractors, and third-party vendors
- All information systems, applications, and data
- All physical and virtual infrastructure
- Cloud services and SaaS applications
- Mobile devices and remote access

---

## 2. Policy Statements

### 2.1 Information Security Objectives
IncentEdge is committed to:
- **Confidentiality:** Protect sensitive information from unauthorized disclosure
- **Integrity:** Ensure accuracy and completeness of information
- **Availability:** Maintain reliable access to systems and data (99.9% uptime)
- **Compliance:** Meet all regulatory and contractual obligations
- **Privacy:** Protect personal data per GDPR, CCPA, and other regulations

### 2.2 Security Governance
- CISO has overall responsibility for information security
- Security Team reports to CISO and executive leadership
- Board of Directors provides oversight through Audit Committee
- Quarterly security reviews presented to board
- Annual security strategy approved by CEO

### 2.3 Risk Management
- Annual comprehensive risk assessments conducted
- Risk-based approach to security control implementation
- Continuous monitoring of threats and vulnerabilities
- Quarterly risk register updates
- Risk treatment aligned with business objectives

### 2.4 Asset Management
- All information assets classified (Public, Internal, Confidential, Restricted)
- Asset inventory maintained and updated quarterly
- Asset owners assigned and accountable
- Data retention policies enforced
- Secure disposal procedures for all asset types

### 2.5 Access Control
- Least privilege principle enforced
- Multi-factor authentication (MFA) required for all users
- Role-based access control (RBAC) implemented
- Quarterly access reviews and recertification
- Immediate deprovisioning upon termination

### 2.6 Cryptography
- AES-256 encryption for data at rest
- TLS 1.3 (minimum 1.2) for data in transit
- Encryption keys managed via AWS KMS / Supabase Vault
- Key rotation every 90 days
- Strong cipher suites and algorithms only

### 2.7 Physical and Environmental Security
- Cloud-native infrastructure (no on-premise servers)
- SOC 2 Type II certified cloud providers
- Full disk encryption on all employee devices
- Mobile device management (MDM) enforced
- Secure home office requirements

### 2.8 Operations Security
- Change management process for all system changes
- Vulnerability scanning (weekly automated, annual penetration testing)
- Malware protection on all endpoints
- Centralized log management and monitoring
- Backup and recovery procedures tested quarterly

### 2.9 Communications Security
- Network segmentation (production, staging, development)
- Firewall rules (deny by default)
- Web application firewall (WAF) enabled
- DDoS protection implemented
- Secure remote access via VPN

### 2.10 Security Incident Management
- 24/7 incident response capability
- Incident response plan tested annually
- Data breach notification within 72 hours (GDPR)
- Post-incident reviews and lessons learned
- Continuous improvement of incident handling

### 2.11 Business Continuity
- Business continuity plan (BCP) documented and tested
- Disaster recovery plan (DRP) with RTO/RPO objectives
- Critical systems identified and prioritized
- Redundancy and failover mechanisms
- Annual BCP/DRP testing and updates

### 2.12 Compliance
- SOC 2 Type II certification maintained
- GDPR and CCPA compliance
- PCI DSS compliance for payment processing
- Regular compliance audits (internal and external)
- Privacy by design principles

---

## 3. Roles and Responsibilities

### 3.1 Board of Directors / Audit Committee
- Provide oversight and governance
- Review security posture quarterly
- Approve security budgets and strategy
- Receive escalation of critical incidents

### 3.2 Chief Executive Officer (CEO)
- Ultimate accountability for information security
- Approve information security policy
- Allocate resources for security program
- Champion security culture

### 3.3 Chief Information Security Officer (CISO)
- Develop and maintain security policies and procedures
- Manage security team and operations
- Conduct risk assessments
- Report security metrics to leadership
- Incident response coordination
- Vendor security assessments

### 3.4 Chief Technology Officer (CTO)
- Implement security controls in systems and applications
- Ensure secure development practices
- Manage infrastructure security
- Support incident response
- Technology risk management

### 3.5 Chief Financial Officer (CFO)
- Budget allocation for security initiatives
- Cyber insurance management
- Financial fraud prevention
- Security of financial systems

### 3.6 Human Resources (HR)
- Background checks for new hires
- Security awareness training coordination
- Employee onboarding/offboarding security procedures
- Disciplinary actions for policy violations

### 3.7 All Employees
- Complete security awareness training annually
- Report security incidents immediately
- Follow all security policies and procedures
- Protect credentials and access
- Use approved tools and systems only

---

## 4. Procedures

### 4.1 Policy Development and Review
- Policies reviewed and updated annually (minimum)
- Changes approved by CISO and Legal
- Employee acknowledgment required within 30 days
- Version control maintained

### 4.2 Security Awareness and Training
- Annual mandatory security awareness training (100% completion)
- Phishing simulation testing quarterly
- Role-specific security training (developers, admins)
- New hire security orientation within 7 days
- Continuous security communications

### 4.3 Vendor Management
- Security assessments for all vendors with data access
- Vendor security questionnaires and due diligence
- Contractual security requirements
- Annual vendor reviews
- Vendor incident notification requirements

### 4.4 Audit and Monitoring
- Continuous security monitoring (SIEM)
- Quarterly internal security audits
- Annual external SOC 2 audit
- Penetration testing annually
- Log retention: 1 year hot, 7 years archive

---

## 5. Compliance and Enforcement

### 5.1 Compliance Requirements
- SOC 2 Type II (annual recertification)
- GDPR (General Data Protection Regulation)
- CCPA (California Consumer Privacy Act)
- PCI DSS (Payment Card Industry Data Security Standard)
- State data breach notification laws

### 5.2 Policy Violations
Violations of this policy may result in:
- Verbal or written warning
- Mandatory retraining
- Suspension of access privileges
- Termination of employment or contract
- Legal action (criminal or civil)

### 5.3 Exceptions
- Exception requests submitted to CISO in writing
- Risk assessment required for all exceptions
- Executive approval required for exceptions
- Exceptions documented and reviewed quarterly
- Compensating controls implemented where possible

---

## 6. Policy Review and Maintenance

### 6.1 Review Schedule
- Annual comprehensive review (minimum)
- Ad-hoc reviews for significant changes:
  - Regulatory changes
  - Major incidents
  - Business changes
  - Technology changes

### 6.2 Approval and Communication
- CISO approval required for all changes
- Legal and Compliance review
- Board notification for significant changes
- Employee communication via email and portal
- Training updated to reflect changes

---

## 7. Related Policies and Documents

### Supporting Policies:
- Access Control Policy
- Encryption and Key Management Policy
- Incident Response Policy
- Business Continuity and Disaster Recovery Policy
- Data Retention and Disposal Policy
- Vendor Risk Management Policy
- Change Management Policy
- Vulnerability Management Policy
- Acceptable Use Policy
- Privacy Policy

### Standards and Frameworks:
- SOC 2 Trust Service Criteria
- ISO 27001/27002 (Information Security Management)
- NIST Cybersecurity Framework
- NIST 800-53 (Security and Privacy Controls)
- CIS Controls (Center for Internet Security)

---

## 8. Acknowledgment

I acknowledge that I have read, understood, and agree to comply with the IncentEdge Information Security Policy. I understand that violations may result in disciplinary action up to and including termination.

**Employee Signature:** ___________________________
**Employee Name:** _____________________________
**Date:** _____________

---

## 9. Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-01 | CISO | Initial policy creation |
| 1.0 | 2026-02-17 | CISO | SOC 2 compliance review |

---

## 10. Appendices

### Appendix A: Data Classification Scheme
| Classification | Description | Examples | Controls |
|----------------|-------------|----------|----------|
| Restricted | Highly sensitive, severe impact if disclosed | PII, PCI data, trade secrets | Encryption, strict access, DLP |
| Confidential | Sensitive, moderate impact | Financial data, contracts | Encryption, access controls |
| Internal | Internal use only | Policies, procedures | Access controls |
| Public | No confidentiality | Marketing materials | None |

### Appendix B: Incident Severity Levels
| Severity | Impact | Response Time | Escalation |
|----------|--------|---------------|------------|
| Critical | Severe impact, data breach | Immediate | CISO, CEO, Board |
| High | Significant impact | <1 hour | CISO, Leadership |
| Medium | Moderate impact | <4 hours | Security Team |
| Low | Minor impact | <24 hours | Security Team |

### Appendix C: Contact Information
- **Security Team:** security@incentedge.com
- **Incident Reporting:** incidents@incentedge.com (24/7)
- **CISO:** ciso@incentedge.com
- **Compliance:** compliance@incentedge.com
- **Whistleblower Hotline:** 1-800-XXX-XXXX (anonymous)

---

**Document Classification:** Internal
**Document Owner:** CISO
**Distribution:** All Employees
