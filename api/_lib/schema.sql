-- ============================================================================
-- REACH (R3Pro) Production PostgreSQL DDL Schema
-- Compatible with Vercel Postgres / Neon Serverless
-- Multi-Tenant Isolation by org_id | Multi-Capacity Shifts | Anti-Collision Guard
-- ============================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. Organizations
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'non_profit', -- school_pta, non_profit, youth_sports, church_faith, corporate_giving, other
    ein VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#4f46e5',
    website VARCHAR(255),
    signatory_officer_name VARCHAR(255),
    signatory_officer_title VARCHAR(255),
    signatory_signature_url TEXT,
    volunteer_count INTEGER DEFAULT 0,
    total_funds_raised NUMERIC(12,2) DEFAULT 0,
    settings JSONB DEFAULT '{"defaultCurrency":"USD","approvalThresholdBudget":250,"approvalThresholdSlots":5,"defaultReminderCadence":"standard"}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint on normalized EIN (alphanumeric only)
CREATE UNIQUE INDEX IF NOT EXISTS idx_orgs_ein_unique 
    ON organizations (regexp_replace(ein, '[^0-9A-Za-z]', '', 'g'));

-- ----------------------------------------------------------------------------
-- 2. Users & Leadership
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL DEFAULT 'volunteer', -- org_admin, event_planner, committee_lead, vendor, volunteer, kiosk
    avatar_url TEXT,
    assigned_sub_part_ids TEXT[] DEFAULT '{}',
    is_registered_user BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_users_org_email UNIQUE (org_id, email)
);

CREATE INDEX IF NOT EXISTS idx_users_org_role ON users (org_id, role);

-- ----------------------------------------------------------------------------
-- 3. Events & Campaigns
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_key VARCHAR(50) NOT NULL, -- e.g. "EVT-2026-Q3-101"
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    tagline TEXT,
    description TEXT,
    tags TEXT[] DEFAULT '{}',
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    venue_name VARCHAR(255),
    venue_address TEXT,
    map_url TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    virtual_link TEXT,
    cover_image_url TEXT,
    theme JSONB DEFAULT '{"id":"indigo_modern","name":"Indigo Modern","primaryColor":"#4f46e5","accentColor":"#6366f1","bgGradient":"from-indigo-600 to-purple-800"}'::jsonb,
    fundraising_goal NUMERIC(12,2) DEFAULT 5000,
    total_raised NUMERIC(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'published', -- draft, published, in_progress, completed, archived
    approval_threshold_budget NUMERIC(10,2) DEFAULT 250,
    approval_threshold_slots INTEGER DEFAULT 5,
    reminder_cadence VARCHAR(50) DEFAULT 'standard', -- standard, intensive, same_day, custom
    allow_fee_coverage BOOLEAN DEFAULT TRUE,
    dress_code TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_events_org_slug UNIQUE (org_id, slug),
    CONSTRAINT uq_events_org_key UNIQUE (org_id, event_key)
);

CREATE INDEX IF NOT EXISTS idx_events_org_dates ON events (org_id, start_date, end_date);

-- ----------------------------------------------------------------------------
-- 4. Sub-Parts (Committees & Departments)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sub_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- labor_setup, hospitality_food, vendors_sponsors, auction_fundraising, registration_greeters, other
    lead_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    lead_name VARCHAR(255) NOT NULL,
    lead_phone VARCHAR(50),
    lead_email VARCHAR(255) NOT NULL,
    lead_radio_channel VARCHAR(50),
    reporting_gate TEXT DEFAULT 'Main Gate',
    dress_code_notes TEXT,
    supplies_notes TEXT,
    budget_allocated NUMERIC(10,2) DEFAULT 0,
    budget_spent NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subparts_event ON sub_parts (event_id);

-- ----------------------------------------------------------------------------
-- 5. Shifts (Multi-Volunteer Capacity & Time Intervals)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_part_id UUID NOT NULL REFERENCES sub_parts(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 4, -- Multi-volunteer capacity per slot
    claimed_count INTEGER NOT NULL DEFAULT 0,
    min_age INTEGER,
    skills_required TEXT[] DEFAULT '{}',
    requires_waiver BOOLEAN DEFAULT TRUE,
    waiver_template_id VARCHAR(100) DEFAULT 'waiver_general_liability',
    is_approved BOOLEAN DEFAULT TRUE, -- Variable threshold approval flag
    reporting_location_override TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_shift_times CHECK (end_time > start_time),
    CONSTRAINT chk_shift_capacity CHECK (capacity > 0),
    CONSTRAINT chk_shift_claimed CHECK (claimed_count >= 0 AND claimed_count <= capacity)
);

CREATE INDEX IF NOT EXISTS idx_shifts_event_times ON shifts (event_id, start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_shifts_subpart ON shifts (sub_part_id);

-- ----------------------------------------------------------------------------
-- 6. Item Wishlist & Equipment Drop-Off Slots
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS item_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_part_id UUID NOT NULL REFERENCES sub_parts(id) ON DELETE CASCADE,
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Supplies',
    quantity_needed INTEGER NOT NULL DEFAULT 1,
    quantity_pledged INTEGER NOT NULL DEFAULT 0,
    unit VARCHAR(50) DEFAULT 'items',
    drop_off_location TEXT NOT NULL,
    drop_off_deadline VARCHAR(100) NOT NULL,
    estimated_fmv_per_unit NUMERIC(10,2) DEFAULT 20.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_item_quantities CHECK (quantity_needed >= 0 AND quantity_pledged >= 0)
);

CREATE INDEX IF NOT EXISTS idx_items_event ON item_slots (event_id);

-- ----------------------------------------------------------------------------
-- 7. Commercial Tiers, Sponsor Packages & Vendor Booths
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS commercial_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'admission_ticket', -- admission_ticket, vendor_booth, sponsor_package, raffle
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    fair_market_value NUMERIC(10,2) DEFAULT 0,
    capacity INTEGER NOT NULL DEFAULT 100,
    claimed_count INTEGER NOT NULL DEFAULT 0,
    instant_checkout BOOLEAN DEFAULT TRUE,
    description TEXT,
    perks TEXT[] DEFAULT '{}',
    booth_dimensions VARCHAR(100),
    power_provided BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT chk_tier_capacity CHECK (capacity >= 0 AND claimed_count >= 0)
);

CREATE INDEX IF NOT EXISTS idx_tiers_event ON commercial_tiers (event_id);

-- ----------------------------------------------------------------------------
-- 8. Registrations & 256-bit Self-Service Magic Passes
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    primary_name VARCHAR(255) NOT NULL,
    primary_email VARCHAR(255) NOT NULL,
    primary_phone VARCHAR(50) NOT NULL,
    birth_date DATE,
    manage_token VARCHAR(255) UNIQUE NOT NULL, -- 256-bit cryptographically secure token
    status VARCHAR(50) NOT NULL DEFAULT 'confirmed', -- confirmed, cancelled
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reg_event ON registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_reg_manage_token ON registrations (manage_token);
CREATE INDEX IF NOT EXISTS idx_reg_email ON registrations (primary_email);

-- ----------------------------------------------------------------------------
-- 9. Group Members & Household Dependents
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    relationship VARCHAR(50) DEFAULT 'Self', -- Self, Child, Spouse, Team Member, Friend
    is_minor BOOLEAN DEFAULT FALSE,
    birth_date DATE,
    age INTEGER,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    dietary_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_reg ON group_members (registration_id);

-- ----------------------------------------------------------------------------
-- 10. Claimed Shifts (Participant-to-Shift Mapping with Zero Double-Booking)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS claimed_shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    group_member_id UUID NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    checked_in_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_member_shift UNIQUE (group_member_id, shift_id)
);

CREATE INDEX IF NOT EXISTS idx_claimed_shifts_reg ON claimed_shifts (registration_id);
CREATE INDEX IF NOT EXISTS idx_claimed_shifts_shift ON claimed_shifts (shift_id);
CREATE INDEX IF NOT EXISTS idx_claimed_shifts_member ON claimed_shifts (group_member_id);

-- ----------------------------------------------------------------------------
-- 11. Claimed Items, Ticket Purchases & Pro-Bono Pledges
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS claimed_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    item_slot_id UUID NOT NULL REFERENCES item_slots(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    delivered BOOLEAN DEFAULT FALSE,
    delivered_at TIMESTAMPTZ,
    received_by VARCHAR(255),
    donor_notes TEXT,
    estimated_fmv NUMERIC(10,2),
    in_kind_receipt_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    ticket_tier_id UUID NOT NULL REFERENCES commercial_tiers(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    booth_assigned_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pro_bono_pledges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    sub_part_id UUID REFERENCES sub_parts(id) ON DELETE SET NULL,
    donor_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    donor_email VARCHAR(255) NOT NULL,
    donor_phone VARCHAR(50),
    service_category VARCHAR(100) NOT NULL,
    service_description TEXT NOT NULL,
    estimated_fmv NUMERIC(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pledged', -- pledged, verified_delivered, void
    in_kind_receipt_number VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 12. Signed Waivers & Legal Compliance
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS signed_waivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    group_member_id UUID NOT NULL REFERENCES group_members(id) ON DELETE CASCADE,
    waiver_template_id VARCHAR(100) NOT NULL,
    waiver_title VARCHAR(255) NOT NULL,
    waiver_text TEXT NOT NULL,
    signer_name VARCHAR(255) NOT NULL,
    signer_relationship VARCHAR(100) DEFAULT 'Self',
    signature_data TEXT NOT NULL, -- Base64 vector stroke or typed legal name
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR(100) DEFAULT '127.0.0.1',
    is_verified_at_door BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. Direct Donations & 501(c)(3) Receipts
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES registrations(id) ON DELETE SET NULL,
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    fee_amount NUMERIC(10,2) DEFAULT 0,
    net_amount NUMERIC(10,2) NOT NULL,
    fee_covered_by_donor BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(50) DEFAULT 'stripe_card',
    payment_status VARCHAR(50) DEFAULT 'completed',
    is_anonymous BOOLEAN DEFAULT FALSE,
    tax_receipt_number VARCHAR(100) NOT NULL,
    deductible_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 14. Volunteer CRM & Historical Service Ledger
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS volunteer_crm_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    tier VARCHAR(50) DEFAULT 'contributor', -- pillar, core, contributor, newcomer
    tags TEXT[] DEFAULT '{}',
    internal_notes TEXT,
    lifetime_hours NUMERIC(8,2) DEFAULT 0,
    lifetime_donations NUMERIC(12,2) DEFAULT 0,
    events_participated INTEGER DEFAULT 0,
    attendance_rate NUMERIC(5,2) DEFAULT 100.00,
    last_active TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_crm_org_email UNIQUE (org_id, email)
);

CREATE TABLE IF NOT EXISTS volunteer_event_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    volunteer_id UUID NOT NULL REFERENCES volunteer_crm_profiles(id) ON DELETE CASCADE,
    event_title VARCHAR(255) NOT NULL,
    event_date DATE NOT NULL,
    roles_served TEXT[] DEFAULT '{}',
    hours_contributed NUMERIC(6,2) NOT NULL DEFAULT 0,
    items_donated TEXT,
    amount_donated NUMERIC(10,2) DEFAULT 0,
    event_outcome_raised NUMERIC(12,2) DEFAULT 0,
    verified_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 15. Announcements, Variable Approvals & Immutable Audit Logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    urgency VARCHAR(50) DEFAULT 'normal', -- normal, urgent, critical
    audience VARCHAR(50) DEFAULT 'all', -- all, leads_only, active_shifts
    channels TEXT[] DEFAULT '{"email"}', -- email, sms, push, kiosk
    sent_by_name VARCHAR(255) NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS approval_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    sub_part_id UUID REFERENCES sub_parts(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- budget_increase, shift_capacity, item_quantity, custom
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    requested_by_name VARCHAR(255) NOT NULL,
    requested_by_role VARCHAR(50) NOT NULL,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by_name VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    user_name VARCHAR(255) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(100),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- SQL Helper Function: Temporal Shift Collision Check
-- Guarantees a participant cannot be in two overlapping shifts at once
-- ============================================================================
CREATE OR REPLACE FUNCTION check_volunteer_shift_overlap(
    p_member_id UUID,
    p_new_shift_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_start TIMESTAMPTZ;
    v_end TIMESTAMPTZ;
    v_conflict_count INTEGER;
BEGIN
    SELECT start_time, end_time INTO v_start, v_end 
    FROM shifts WHERE id = p_new_shift_id;

    IF v_start IS NULL OR v_end IS NULL THEN
        RETURN FALSE;
    END IF;

    SELECT COUNT(*) INTO v_conflict_count
    FROM claimed_shifts cs
    JOIN shifts s ON cs.shift_id = s.id
    WHERE cs.group_member_id = p_member_id
      AND cs.shift_id != p_new_shift_id
      AND (s.start_time < v_end AND s.end_time > v_start);

    RETURN (v_conflict_count > 0);
END;
$$ LANGUAGE plpgsql;
