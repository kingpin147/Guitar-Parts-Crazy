# Guitar Parts Crazy – Client Requirements & Scope of Work

## Executive Summary
This document captures the full scope of work, technical specifications, design standards, and operational guidelines provided in the **Guitar Parts Crazy – Website Development Scope**.

---

## 1. Project Objective
* **Homepage Redesign:** Redesign and develop the Guitar Parts Crazy homepage based on the supplied landing-page mock-up.
* **CMS-Driven Product Discovery:** Build a robust, dynamic product discovery and multi-path navigation system using **Wix CMS + Velo**.
* **Preserve Wix Stores:** Keep existing Wix Stores functionality, inventory, pricing, variants, cart, and checkout as the single source of truth without creating duplicate product entries.
* **Preserve Integrations:** Ensure the live **Wix-to-eBay synchronization** remains 100% operational and undisturbed.
* **Scope Boundary:** This is an enhancement of the homepage, navigation, filtering, and visual presentation—not a ground-up rebuild of the entire store infrastructure.

---

## 2. Detailed Scope & Deliverables

### Phase 1: Homepage Redesign & UI Refresh
* **Visual Aesthetic:** Clean, modern, predominantly white visual style based on the supplied mock-up.
* **Call to Action:** Prominently retain the existing `"FREE GUITAR TEMPLATE HERE"` call-to-action.
* **Responsiveness:** Ensure seamless responsiveness across Desktop, Tablet, and Mobile devices.
* **Store Visual Consistency:** Review and update existing product listings / shop pages so they visually match the clean white aesthetic of the new homepage.
* **Assets:** Begin development using placeholder images until final photography/assets are supplied.

---

### Phase 2: CMS Architecture & Product Discovery
Implement the 4 agreed customer navigation and filtering pathways:
1. **Shop by Guitar**
2. **Shop by Part**
3. **Shop by Brand**
4. **Find Parts for Your Guitar** (Compatibility Finder)

#### Technical Guidelines:
* **Architecture:** Utilize Wix CMS + Velo with reference links pointing to native `Stores/Products`.
* **Multi-Path Discovery:** Products must appear through all relevant filter pathways without duplicating items in Wix Stores.
* **Smart UI Display:** Empty or upcoming categories must not display in customer-facing live navigation.
* **Scalability:** System architecture must allow the client to independently add new products, brands, models, and categories in the future.

---

### Phase 3: Existing Store, Integrations & Checkout
* **eBay Integration Safety:**
  * Do not restructure or replace the native Wix Stores product system in any manner that disrupts eBay listings or sync (inventory, pricing, orders).
  * Any architectural change that could affect eBay must be formally discussed and approved beforehand.
* **Cart & Checkout Optimization:**
  * Review the current cart and checkout flow.
  * Provide recommendations for native Wix checkout improvements/simplifications.
  * Discuss major changes prior to implementation.
* **SEO & URL Continuity:**
  * Maintain existing product and category page URLs to preserve established search rankings.
  * Implement 301 redirects if any legacy URL must change.

---

### Phase 4: Staging, Testing & Launch Protection
* **Safety Backup:** Duplicate and create a complete backup of the existing live website prior to commencing development.
* **Zero Disruption:** Avoid interfering with the active live store during the build phase.
* **End-to-End Testing Checklist:**
  - [ ] Customer flow: Homepage $\rightarrow$ Navigation / Finder $\rightarrow$ Category / Filter $\rightarrow$ Product Page $\rightarrow$ Variants $\rightarrow$ Cart $\rightarrow$ Checkout.
  - [ ] All 4 navigation routes (`Shop by Guitar`, `Shop by Part`, `Shop by Brand`, `Find Parts for Your Guitar`).
  - [ ] Dynamic CMS-to-Store references, compatibility rules, and zero-result/fallback scenarios.
  - [ ] Desktop, tablet, and mobile responsiveness & loading performance.
  - [ ] eBay product/listing sync and stock deduction verification.
* **Client Approval:** No code or design changes are published to the live domain without testing and explicit client sign-off.

---

### Phase 5: New Zealand Website Duplication (Separately Quoted)
* **Execution Timing:** Begins after the Australian (AU) site is completed, tested, and approved.
* **Key Deliverables:**
  * Full clone of the approved AU site (homepage, CMS architecture, filters, and store layouts).
  * Configure New Zealand market settings: **NZD currency**, NZ shipping rates/rules, checkout, and taxes.
  * Configure dedicated NZ local SEO (e.g., hreflang, regional metadata).
  * Connect and verify the NZ custom domain.
  * Ensure complete isolation from the AU eBay integration.
  * Inform client in advance of any required Wix subscription plans, apps, or recurring costs.

---

### Phase 6: Handover & Documentation
Provide a simple client guide and handover covering:
* Adding new products to the CMS.
* Assigning categories, tags, and technical compatibility parameters.
* Adding new guitar brands, models, and subcategories.
* Maintaining the "Find Parts" system without developer assistance.

---

## 3. Project Start & Confirmation Checklist
Before commencing development:
1. **Confirm Scope & Velo Solution:** Confirm mutual alignment on the Wix CMS + Velo architecture.
2. **Quote Confirmation:**
   - [ ] Base price for the Australian website redesign, CMS & filtering development.
   - [ ] Separate quoted line item for New Zealand site duplication & localization.
   - [ ] Explicit identification of any potential out-of-scope costs upfront.
3. **Receive Assets:** Client will provide the final CMS master workbook and landing page mock-up package upon quote confirmation.
