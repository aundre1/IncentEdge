-- IncentEdge Database Schema
-- Migration: 020_tax_credit_marketplace
-- Description: Tax Credit Marketplace — Section 6418 transfers & C-PACE financing referrals
-- Date: 2026-02-25
--
-- REGULATORY CONTEXT:
--
-- Section 6418 Tax Credit Transfers (Inflation Reduction Act):
--   The IRS allows DIRECT cash-for-credit sales under Section 6418 of the IRA.
--   This does NOT require a broker-dealer license — it is a direct sale of tax
--   credits, not securities. Eligible credits: §45 (wind/solar PTC), §48 (ITC),
--   §45Q (carbon capture), §45V (clean hydrogen), §45X (advanced manufacturing).
--   Developer SELLS the credit; buyer PURCHASES with cash at a discount
--   (typically 88–96 cents on the dollar).
--   IncentEdge facilitates MATCHING and DOCUMENTATION only — not a financial
--   intermediary. Revenue model: 1% transaction fee on matched deals (seller-paid).
--
-- C-PACE Financing (Commercial Property Assessed Clean Energy):
--   100% debt financing repaid through property tax assessment.
--   This is DEBT, not securities — no broker-dealer license required.
--   IncentEdge acts as a REFERRAL platform connecting developers with C-PACE
--   lenders (not a lender itself).
--   Revenue model: referral fee from C-PACE lenders ($500–$2,000 per closed deal).


-- ============================================================================
-- TAX CREDIT LISTINGS TABLE
-- Section 6418 transferable credit listings
-- ============================================================================
CREATE TABLE IF NOT EXISTS tax_credit_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,

    -- Credit details (Section 6418 eligible credit types)
    credit_type VARCHAR(20) NOT NULL CHECK (credit_type IN (
        'ITC_48', 'PTC_45', 'CARBON_45Q', 'HYDROGEN_45V', 'MANUFACTURING_45X', 'OTHER'
    )),
    program_id UUID REFERENCES incentive_programs(id) ON DELETE SET NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Financial terms
    credit_amount NUMERIC(15,2) NOT NULL CHECK (credit_amount > 0),
    asking_price_cents_on_dollar NUMERIC(4,2) CHECK (asking_price_cents_on_dollar BETWEEN 50 AND 100),
    minimum_purchase NUMERIC(15,2),

    -- Qualification status
    irs_pre_filing_complete BOOLEAN DEFAULT false,
    -- Section 6417 direct pay election is mutually exclusive with 6418 transfer
    direct_pay_elected BOOLEAN DEFAULT false,

    -- Listing status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'under_review', 'matched', 'sold', 'cancelled'
    )),

    -- Description
    title VARCHAR(200) NOT NULL,
    description TEXT,
    state CHAR(2),

    -- Timestamps
    listing_date TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Platform fee (1% of credit_amount, calculated on match)
    platform_fee_pct NUMERIC(4,2) DEFAULT 1.00
);

COMMENT ON TABLE tax_credit_listings IS 'Section 6418 transferable tax credit listings. IncentEdge facilitates matching only — not a broker-dealer or financial intermediary.';
COMMENT ON COLUMN tax_credit_listings.credit_type IS 'IRA Section 6418 eligible credit type: ITC §48, PTC §45, Carbon Capture §45Q, Clean Hydrogen §45V, Advanced Manufacturing §45X';
COMMENT ON COLUMN tax_credit_listings.asking_price_cents_on_dollar IS 'Asking price in cents per dollar of credit face value (typically 88–96)';
COMMENT ON COLUMN tax_credit_listings.direct_pay_elected IS 'Section 6417 direct pay election — mutually exclusive with 6418 transfer';
COMMENT ON COLUMN tax_credit_listings.platform_fee_pct IS 'IncentEdge platform fee percentage on matched deals (default 1%, seller-paid)';


-- ============================================================================
-- C-PACE REFERRALS TABLE
-- Commercial Property Assessed Clean Energy financing referral requests
-- ============================================================================
CREATE TABLE IF NOT EXISTS cpace_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,

    -- Project details
    project_name VARCHAR(200) NOT NULL,
    project_type VARCHAR(50) CHECK (project_type IN (
        'commercial', 'mixed_use', 'industrial', 'multifamily', 'hotel', 'office', 'retail', 'other'
    )),
    state CHAR(2) NOT NULL,
    county VARCHAR(100),
    property_value NUMERIC(15,2),

    -- Financing request
    financing_amount_requested NUMERIC(15,2) NOT NULL CHECK (financing_amount_requested > 0),
    use_of_proceeds VARCHAR(500),  -- solar, efficiency, etc.

    -- Contact
    contact_name VARCHAR(200) NOT NULL,
    contact_email VARCHAR(254) NOT NULL,
    contact_phone VARCHAR(20),

    -- Status
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'matched_to_lender', 'in_underwriting', 'closed', 'declined'
    )),

    -- Notes
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE cpace_referrals IS 'C-PACE financing referral requests. IncentEdge connects developers with C-PACE lenders as a referral platform — not a lender.';
COMMENT ON COLUMN cpace_referrals.financing_amount_requested IS 'Requested C-PACE financing amount. C-PACE provides 100% debt financing repaid via property tax assessment.';
COMMENT ON COLUMN cpace_referrals.use_of_proceeds IS 'Intended use: solar, efficiency, EV chargers, resilience, etc.';


-- ============================================================================
-- MARKETPLACE INQUIRIES TABLE
-- Buyer interest in specific tax credit listings
-- ============================================================================
CREATE TABLE IF NOT EXISTS marketplace_inquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES tax_credit_listings(id) ON DELETE CASCADE,
    inquiring_organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

    -- Buyer info (could be external party not yet registered)
    buyer_name VARCHAR(200) NOT NULL,
    buyer_email VARCHAR(254) NOT NULL,
    buyer_type VARCHAR(50) CHECK (buyer_type IN (
        'corporate', 'financial_institution', 'insurance', 'family_office', 'other'
    )),

    -- Inquiry details
    purchase_amount_interested NUMERIC(15,2),
    message TEXT,

    -- Status
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
        'pending', 'reviewed', 'in_negotiation', 'matched', 'declined'
    )),

    created_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE marketplace_inquiries IS 'Buyer inquiries for tax credit listings. Tracks interest from potential credit purchasers.';
COMMENT ON COLUMN marketplace_inquiries.buyer_type IS 'Entity type of the prospective credit buyer';


-- ============================================================================
-- INDEXES
-- ============================================================================

-- Tax Credit Listings
CREATE INDEX idx_tcl_organization ON tax_credit_listings(organization_id);
CREATE INDEX idx_tcl_status ON tax_credit_listings(status);
CREATE INDEX idx_tcl_state ON tax_credit_listings(state);
CREATE INDEX idx_tcl_credit_type ON tax_credit_listings(credit_type);
CREATE INDEX idx_tcl_credit_amount ON tax_credit_listings(credit_amount DESC);
CREATE INDEX idx_tcl_active ON tax_credit_listings(status, credit_type, state) WHERE status = 'active';

-- C-PACE Referrals
CREATE INDEX idx_cpace_organization ON cpace_referrals(organization_id);
CREATE INDEX idx_cpace_status ON cpace_referrals(status);
CREATE INDEX idx_cpace_state ON cpace_referrals(state);

-- Marketplace Inquiries
CREATE INDEX idx_inquiry_listing ON marketplace_inquiries(listing_id);
CREATE INDEX idx_inquiry_org ON marketplace_inquiries(inquiring_organization_id);
CREATE INDEX idx_inquiry_status ON marketplace_inquiries(status);


-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE tax_credit_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cpace_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_inquiries ENABLE ROW LEVEL SECURITY;

-- Tax Credit Listings: users can manage their own org's listings
CREATE POLICY "Org members can manage own listings" ON tax_credit_listings
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Tax Credit Listings: anyone authenticated can view active listings
CREATE POLICY "Authenticated users can view active listings" ON tax_credit_listings
    FOR SELECT USING (
        status = 'active' AND auth.uid() IS NOT NULL
    );

-- C-PACE Referrals: users can manage their own org's referrals
CREATE POLICY "Org members can manage own referrals" ON cpace_referrals
    FOR ALL USING (
        organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );

-- Marketplace Inquiries: listing owners can view inquiries on their listings
CREATE POLICY "Listing owners can view inquiries" ON marketplace_inquiries
    FOR SELECT USING (
        listing_id IN (
            SELECT id FROM tax_credit_listings
            WHERE organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

-- Marketplace Inquiries: authenticated users can create inquiries
CREATE POLICY "Authenticated users can create inquiries" ON marketplace_inquiries
    FOR INSERT WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Marketplace Inquiries: inquiring org can view own inquiries
CREATE POLICY "Inquiring org can view own inquiries" ON marketplace_inquiries
    FOR SELECT USING (
        inquiring_organization_id IN (SELECT organization_id FROM profiles WHERE id = auth.uid())
    );


-- ============================================================================
-- TRIGGERS (reuse update_updated_at_column from migration 001)
-- ============================================================================

CREATE TRIGGER update_tax_credit_listings_updated_at
    BEFORE UPDATE ON tax_credit_listings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cpace_referrals_updated_at
    BEFORE UPDATE ON cpace_referrals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
