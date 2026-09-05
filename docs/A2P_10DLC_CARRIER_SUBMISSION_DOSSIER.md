# A2P 10DLC Carrier Registration & Compliance Submission Dossier

**Platform**: REACH (R3Pro)  
**ISV / Brand Category**: Community Event Operating System & 501(c)(3) Non-Profit Platform  
**Target Submission**: The Campaign Registry (TCR) / Twilio A2P 10DLC Brand & Campaign Registration  
**Standard**: CTIA Messaging Principles, TCPA, and Carrier Code of Conduct (AT&T, T-Mobile, Verizon)  

---

## 1. Brand Information (Form Fields)

* **Legal Business Name**: REACH Inc.
* **DBA / Brand Display Name**: REACH
* **Organization Type**: Private Corporation (ISV Platform for 501(c)(3) Non-Profits & Schools)
* **Employer Identification Number (EIN)**: Normalized 9-digit alphanumeric Tax ID
* **Corporate Website**: `https://reachplatform.com`
* **Support Email**: `sms-support@reachplatform.com`
* **Support Phone**: `(800) 555-0199`
* **Privacy Policy URL**: `https://reachplatform.com/privacy`
* **Terms of Service URL**: `https://reachplatform.com/terms`

---

## 2. Campaign Details (Form Fields)

* **Campaign Type / Use Case**: `Mixed` / `Nonprofit & Higher Education` / `Customer Care & Operational Alerts`
* **Campaign Description**:
  > "REACH provides community non-profit organizations, PTAs, and schools with automated transactional SMS alerts. Messages include instant shift registration confirmations, automated logistics arrival reminders at T-72h/T-24h/T-2h before scheduled volunteer shifts, digital QR check-in boarding passes, day-of-event weather/gate reassignment updates, and 6-digit login security OTP codes."

---

## 3. Mandatory Sample Messages (Verbatim Submission)

### Sample Message 1 (Immediate Volunteer Registration Confirmation)
> `[Lincoln High PTA] Hi David, your Face Painting shift is confirmed for Sat Oct 10 at 10:00 AM. Gate 2 entrance. View pass & directions: https://reachplatform.com/p/x94827 Reply STOP to cancel.`

### Sample Message 2 (T-72h / T-24h Shift Arrival Reminder)
> `[Lincoln High PTA] Reminder: Your setup shift is tomorrow at 8:00 AM at East Gate Canopy. Dress code: Closed-toe shoes. Pass: https://reachplatform.com/p/x94827 Reply HELP for help, STOP to opt out.`

### Sample Message 3 (Day-of-Event Emergency Gate Update)
> `[Lincoln High PTA] Urgent Update: Check-in has moved to Main Gymnasium due to morning rain. Please report to Desk B. Pass: https://reachplatform.com/p/x94827 Reply STOP to opt out.`

### Sample Message 4 (HELP Keyword Auto-Responder)
> `[REACH] For support regarding your event shift or check-in pass, contact support@reachplatform.com or call (800) 555-0199. Msg&data rates may apply. Reply STOP to cancel.`

### Sample Message 5 (STOP Keyword Auto-Responder)
> `[REACH] You have successfully opted out of SMS notifications from Lincoln High PTA via REACH. No further text messages will be sent. Reply START to re-subscribe.`

---

## 4. End-User Opt-In Workflow & Evidence

### 4.1 Opt-In Call-to-Action (CTA) Verbatim Text
The following text is rendered directly adjacent to the phone input field on registration forms (`UnifiedRegistrationModal.tsx`, `DoorKioskModal.tsx`, `AuthModal.tsx`):

> **[ ] Yes, send me automated shift reminders, gate check-in passes, and event updates via SMS.**  
> *By checking this box and providing your mobile number, you expressly consent to receive automated transactional text messages from [Organization Name] and REACH. Consent is not a condition of registration, donation, or volunteering. Message frequency varies (~3-5 msgs/event). Msg & data rates may apply. Reply HELP for help, STOP to cancel. View Privacy Policy and Terms of Service. Mobile information will not be shared with third parties for marketing.*

### 4.2 Opt-In Confirmation Rules
1. **Never Pre-Checked**: The checkbox defaults to `unchecked` (`checked={false}`).
2. **Never Mandatory**: Users can volunteer, purchase tickets, and donate without consenting to SMS.
3. **Audit Ledger**: When consented, the timestamp, IP address, and opt-in version are recorded in `registrations.sms_opt_in_timestamp`.
4. **Zero Third-Party Sharing**: Mobil phone numbers and opt-in records are strictly quarantined within the specific organization tenant and are never shared or sold to third-party marketers.
