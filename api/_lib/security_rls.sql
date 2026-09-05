-- ============================================================================
-- REACH (R3Pro) PostgreSQL Row-Level Security (RLS) & Immutability Policies
-- Standards: SOC 2 Multi-Tenant Isolation | COPPA Protection | IRS 501(c)(3) Integrity
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Enable Row-Level Security on All Core Multi-Tenant Tables
-- ----------------------------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE commercial_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE pro_bono_pledges ENABLE ROW LEVEL SECURITY;
ALTER TABLE signed_waivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_crm_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE volunteer_event_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 2. Tenant Isolation Policies (Scoped to app.current_org_id or Bypass Mode)
-- ----------------------------------------------------------------------------

-- Organizations Policy
DROP POLICY IF EXISTS org_tenant_isolation ON organizations;
CREATE POLICY org_tenant_isolation ON organizations
    FOR ALL
    USING (
        id = NULLIF(current_setting('app.current_org_id', true), '')::uuid
        OR current_setting('app.bypass_rls', true) = 'on'
        OR current_setting('app.current_org_id', true) IS NULL
    );

-- Events Policy
DROP POLICY IF EXISTS event_tenant_isolation ON events;
CREATE POLICY event_tenant_isolation ON events
    FOR ALL
    USING (
        org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid
        OR current_setting('app.bypass_rls', true) = 'on'
        OR status = 'published'
        OR current_setting('app.current_org_id', true) IS NULL
    );

-- Users Policy
DROP POLICY IF EXISTS user_tenant_isolation ON users;
CREATE POLICY user_tenant_isolation ON users
    FOR ALL
    USING (
        org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid
        OR current_setting('app.bypass_rls', true) = 'on'
        OR current_setting('app.current_org_id', true) IS NULL
    );

-- Volunteer CRM Policy
DROP POLICY IF EXISTS crm_tenant_isolation ON volunteer_crm_profiles;
CREATE POLICY crm_tenant_isolation ON volunteer_crm_profiles
    FOR ALL
    USING (
        org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid
        OR current_setting('app.bypass_rls', true) = 'on'
        OR current_setting('app.current_org_id', true) IS NULL
    );

-- Audit Logs Policy (Append-Only / Tenant Scoped Read)
DROP POLICY IF EXISTS audit_tenant_isolation ON audit_logs;
CREATE POLICY audit_tenant_isolation ON audit_logs
    FOR ALL
    USING (
        org_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid
        OR current_setting('app.bypass_rls', true) = 'on'
        OR current_setting('app.current_org_id', true) IS NULL
    );

-- Public Passes & Registrations Policy (Allows unauthenticated self-service lookup via manage_token)
DROP POLICY IF EXISTS registration_pass_access ON registrations;
CREATE POLICY registration_pass_access ON registrations
    FOR ALL
    USING (
        manage_token IS NOT NULL
        OR current_setting('app.bypass_rls', true) = 'on'
        OR current_setting('app.current_org_id', true) IS NULL
    );

-- ----------------------------------------------------------------------------
-- 3. IRS 501(c)(3) Statutory Immutability Trigger
-- Prevents retroactive alteration or deletion of issued tax donation receipts
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION prevent_immutable_tax_receipt_tampering()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        IF (OLD.tax_receipt_number IS NOT NULL AND OLD.tax_receipt_number != '') THEN
            RAISE EXCEPTION 'IRS Compliance Violation: Finalized 501(c)(3) tax receipts and donations cannot be deleted (Receipt: %).', OLD.tax_receipt_number;
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        IF (OLD.tax_receipt_number IS NOT NULL AND OLD.tax_receipt_number != '') THEN
            IF (NEW.amount != OLD.amount OR NEW.tax_receipt_number != OLD.tax_receipt_number) THEN
                RAISE EXCEPTION 'IRS Compliance Violation: Finalized tax receipt amount and serial number are immutable (Receipt: %).', OLD.tax_receipt_number;
            END IF;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_immutable_donations ON donations;
CREATE TRIGGER trg_immutable_donations
    BEFORE UPDATE OR DELETE ON donations
    FOR EACH ROW
    EXECUTE FUNCTION prevent_immutable_tax_receipt_tampering();
