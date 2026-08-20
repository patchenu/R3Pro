# R3Pro Database Architecture & Migration Roadmap

**Current Phase**: Phase 1 — Vercel Postgres / Neon Schema Baseline  
**Target Phase**: Phase 2 — Supabase (PostgreSQL + Realtime WebSockets + Storage Bucket)

---

## 1. Database Schema Specification (PostgreSQL / SQL DDL)

```sql
-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    ein VARCHAR(50) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    address TEXT,
    logo_url TEXT,
    primary_color VARCHAR(20) DEFAULT '#4f46e5',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) NOT NULL, -- org_admin, event_planner, committee_lead, vendor, volunteer, kiosk
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    tagline TEXT,
    description TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    venue_name VARCHAR(255),
    venue_address TEXT,
    map_url TEXT,
    is_virtual BOOLEAN DEFAULT FALSE,
    cover_image_url TEXT,
    theme JSONB DEFAULT '{}',
    fundraising_goal NUMERIC(12,2) DEFAULT 0,
    total_raised NUMERIC(12,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'published',
    approval_threshold_budget NUMERIC(10,2) DEFAULT 250,
    approval_threshold_slots INTEGER DEFAULT 5,
    reminder_cadence VARCHAR(50) DEFAULT 'standard',
    allow_fee_coverage BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sub-Parts (Committees)
CREATE TABLE sub_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    lead_user_id UUID REFERENCES users(id),
    lead_name VARCHAR(255),
    lead_phone VARCHAR(50),
    lead_email VARCHAR(255),
    lead_radio_channel VARCHAR(50),
    reporting_gate TEXT,
    dress_code_notes TEXT,
    supplies_notes TEXT,
    budget_allocated NUMERIC(10,2) DEFAULT 0,
    budget_spent NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shifts
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_part_id UUID REFERENCES sub_parts(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 1,
    claimed_count INTEGER NOT NULL DEFAULT 0,
    min_age INTEGER,
    skills_required TEXT[],
    requires_waiver BOOLEAN DEFAULT FALSE,
    waiver_template_id VARCHAR(100),
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Item Slots (Wishlist)
CREATE TABLE item_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sub_part_id UUID REFERENCES sub_parts(id) ON DELETE CASCADE,
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    quantity_needed INTEGER NOT NULL,
    quantity_pledged INTEGER DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    drop_off_location TEXT,
    drop_off_deadline TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Tiers & Vendor Packages
CREATE TABLE ticket_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    fair_market_value NUMERIC(10,2) DEFAULT 0,
    capacity INTEGER NOT NULL,
    claimed_count INTEGER DEFAULT 0,
    instant_checkout BOOLEAN DEFAULT TRUE,
    description TEXT,
    perks TEXT[],
    booth_dimensions VARCHAR(100),
    power_provided BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Registrations
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    primary_name VARCHAR(255) NOT NULL,
    primary_email VARCHAR(255) NOT NULL,
    primary_phone VARCHAR(50) NOT NULL,
    manage_token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Group Members
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    relationship VARCHAR(50) NOT NULL,
    is_minor BOOLEAN DEFAULT FALSE,
    age INTEGER,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    dietary_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signed Waivers
CREATE TABLE signed_waivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    group_member_id UUID REFERENCES group_members(id) ON DELETE CASCADE,
    waiver_template_id VARCHAR(100) NOT NULL,
    waiver_title VARCHAR(255) NOT NULL,
    waiver_text TEXT NOT NULL,
    signer_name VARCHAR(255) NOT NULL,
    signer_relationship VARCHAR(100) NOT NULL,
    signature_data TEXT NOT NULL, -- base64 vector signature
    signed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address VARCHAR(100),
    is_verified_at_door BOOLEAN DEFAULT TRUE
);

-- Shift Claims
CREATE TABLE shift_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES registrations(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts(id) ON DELETE CASCADE,
    group_member_id UUID REFERENCES group_members(id) ON DELETE CASCADE,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMPTZ,
    checked_in_by VARCHAR(255)
);

-- Donations & Payments
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    sub_part_id UUID REFERENCES sub_parts(id),
    donor_name VARCHAR(255) NOT NULL,
    donor_email VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    fee_amount NUMERIC(10,2) DEFAULT 0,
    net_amount NUMERIC(10,2) NOT NULL,
    fee_covered_by_donor BOOLEAN DEFAULT TRUE,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'completed',
    is_anonymous BOOLEAN DEFAULT FALSE,
    tax_receipt_number VARCHAR(100) UNIQUE NOT NULL,
    deductible_amount NUMERIC(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 2. Supabase Migration Checklist (Phase 2)

When ready for full production deployment:
1. **Provision Supabase Project**: Create project at [supabase.com](https://supabase.com).
2. **Execute Schema Migration**: Run the SQL schema above in the Supabase SQL Editor.
3. **Configure Row-Level Security (RLS)**:
   ```sql
   ALTER TABLE events ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "Multi-tenant Org Isolation" ON events
       FOR ALL USING (org_id = current_setting('app.current_org_id')::uuid);
   ```
4. **Enable Realtime Broadcast Channels**:
   - In Supabase Table Editor $\rightarrow$ enable Realtime for `shifts`, `registrations`, and `donations`.
5. **Create Storage Buckets**:
   - `waiver-pdfs`: For archiving generated legal waiver signatures.
   - `vendor-coi-documents`: For storing Certificate of Insurance uploads.
6. **Set Environment Variables in Vercel**:
   - `NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...`
