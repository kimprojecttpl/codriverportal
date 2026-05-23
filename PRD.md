# Codriver Portal — Product Requirements Document (PRD)

> **Version:** 1.0 (Draft)
> **Owner:** Kim
> **Date:** 2026-05-23
> **Status:** Pending Kim review

---

## 1. Problem Statement / ปัญหา

Kim มีโครงการและงานส่วนตัวกระจายอยู่หลายที่ — Notion, GitHub repos, web apps ที่ deploy ไว้, Google Docs, internal tools ฯลฯ ทำให้:

- เสียเวลาเปิดหา link แต่ละครั้ง (bookmark กระจาย, ค้นใน history)
- ไม่เห็นภาพรวมว่าตอนนี้กำลังทำอะไรอยู่บ้าง โครงการไหน active โครงการไหนค้าง
- ไม่มี single source of truth ของงานส่วนตัว

**Impact ถ้าไม่แก้:** เสียเวลาวันละ 5-15 นาทีในการสลับ context, โครงการที่ paused อาจถูกลืม, ไม่มีระบบให้กลับมาดู context ของโครงการเก่าได้เร็ว

---

## 2. Goals / เป้าหมาย

| # | Goal | วัดผลอย่างไร |
|---|------|--------------|
| G1 | ลดเวลาเข้าถึงโครงการ — คลิกเดียวจาก portal | Self-reported: เปิดโครงการได้ < 3 วินาที |
| G2 | ภาพรวมสถานะทุกโครงการในหน้าจอเดียว | 100% โครงการแสดง status (active/paused/done) |
| G3 | Self-service config — เพิ่ม/แก้/ลบโครงการได้เองโดยไม่เขียนโค้ด | Kim เพิ่มโครงการใหม่ใน UI ได้ภายใน 30 วินาที |
| G4 | เก็บ context สั้นๆ ของแต่ละโครงการ (notes, last accessed) | ทุก project มี notes field + last_accessed_at tracking |
| G5 | Production-ready บน Vercel + Supabase ใช้งานจริงทุกวัน | Deploy สำเร็จ, uptime ≥ 99% ในเดือนแรก |

---

## 3. Non-Goals (v1) / ขอบเขตที่ไม่ทำ

| # | Non-Goal | เหตุผล |
|---|----------|--------|
| NG1 | Multi-user / sharing / role permission | Single-user เท่านั้น — ไม่ over-engineer |
| NG2 | Full project management (tasks, milestones, kanban, Gantt) | ใช้ Notion/Linear แยกอยู่แล้ว Portal คือ launcher + status รวม |
| NG3 | Integration ดึงข้อมูลจาก external apps (GitHub commit, Vercel deploy) | scope ใหญ่เกิน — Kim update status manual ก่อน |
| NG4 | Native mobile app (iOS/Android) | Responsive web ก็พอ — เปิดบน mobile browser ได้ |
| NG5 | Notification / reminder / alerts | ไว้พิจารณา v2 ถ้าจำเป็น |

---

## 4. User Stories / เรื่องราวผู้ใช้

จัดลำดับตามความสำคัญ (high → low):

1. **Quick overview** — As Kim, อยากเห็น list โครงการทั้งหมดในหน้าแรกพร้อม status, category, last accessed → เปิดมาทีเดียวรู้ทันทีว่าอะไรเดินอยู่ อะไรค้าง
2. **One-click launch** — As Kim, อยากคลิกที่ row โครงการแล้วเปิด URL ของแอปนั้นใน tab ใหม่ → ไม่ต้องเก็บ bookmark หลายอัน
3. **Add new project** — As Kim, อยากเพิ่มโครงการใหม่ผ่าน form (name, url, category, tags, notes) → ไม่ต้อง edit DB หรือ redeploy
4. **Edit project** — As Kim, อยากแก้ url/name/status/tags/notes ของโครงการ → ปรับ context ได้ตลอดเวลา
5. **Filter & focus** — As Kim, อยาก filter ตาม category + status + tags → โฟกัสเฉพาะ active ได้
6. **Detail view** — As Kim, อยากเห็น detail panel ด้านขวาเมื่อ click row → ดู notes/metadata โดยไม่ออกจาก list
7. **Search** — As Kim, อยาก search ชื่อโครงการได้ → หาเร็วเมื่อโครงการเยอะ
8. **Empty state** — As Kim, ถ้ายังไม่มีโครงการ อยากเห็น CTA "เพิ่มโครงการแรก" ที่ชัด → ไม่งงตอนเปิดครั้งแรก
9. **Error state** — As Kim, ถ้า save fail อยากเห็น error message ชัด ไม่ใช่ silent fail → รู้ว่าต้องลองใหม่/ตรวจ network

---

## 5. Requirements / ความต้องการเชิงฟังก์ชัน

### P0 — Must Have (v1 ship blockers)

#### R-01: Project CRUD
- เพิ่ม/แก้/ลบ project ผ่าน UI form (no SQL/deploy)
- **Fields:** `id`, `name_th`, `name_en`, `url`, `category_id`, `tags[]`, `status`, `description_th`, `description_en`, `icon` (emoji or url), `created_at`, `updated_at`, `last_accessed_at`
- **AC:**
  - เพิ่ม project ใหม่ → ปรากฏใน list ภายใน 1 วินาที (no manual refresh)
  - Delete มี confirmation dialog 2 ภาษา
  - Required fields: `name_th`, `name_en`, `url`, `category_id`
  - URL validation: ต้องเป็น http(s) format

#### R-02: Status Tracking
- 3 status: `active` / `paused` / `done`
- เปลี่ยน status จาก detail panel หรือ inline dropdown
- **AC:**
  - Status badge สีต่าง: active=เขียว / paused=เหลือง / done=เทา
  - Filter ตาม status ได้จาก top bar
  - Default new project status = `active`

#### R-03: Launch to External App
- Click row หรือปุ่ม "Open ↗" → เปิด `url` ใน tab ใหม่ (`target="_blank" rel="noopener"`)
- Update `last_accessed_at` ทุกครั้งที่ launch
- **AC:**
  - Launch ทำงานจริงทุก browser หลัก (Chrome, Safari, Edge)
  - `last_accessed_at` อัพเดทใน DB และสะท้อนใน UI

#### R-04: Category + Sub-category + Tags
- **Category** (folder, 1-to-many): 1 project อยู่ 1 category
  - **Sub-category support** (2 levels): category สามารถมี parent ได้ — เช่น `Work > Client A`, `Work > Client B`
  - แต่ละ category มี optional `parent_id`; child ไม่สามารถมี grandchild ได้ (จำกัด 2 ระดับ)
- **Tags** (cross-cutting, many-to-many): tag จำนวนเท่าไหร่ก็ได้
- Sidebar ซ้ายแสดง category tree พร้อม counter (จำนวน project)
  - คลิก **parent** → รวม projects ของ sub-category ทั้งหมดเข้าด้วยกัน
  - คลิก **child** → projects ของ child เท่านั้น
  - Parent count = own projects + children's projects (rollup)
- **AC:**
  - คลิก category ใน sidebar → list filter ทันที (parent rollup, child exact)
  - คลิก tag badge บน row → filter ตาม tag นั้น
  - CRUD category ได้จาก Settings page — เลือก parent ตอนสร้าง/แก้ไข
  - ลบ parent → children's parent_id = NULL (กลายเป็น top-level) — ไม่ลบ projects
  - Tag auto-create จาก input (พิมพ์แล้ว create ทันทีถ้าไม่มี)

#### R-05: Phocas-Inspired Layout
- **Left sidebar (~220px):**
  - Logo + ชื่อ portal
  - Section: Home, Categories list, Tags, Settings
  - Collapsible บน mobile
- **Top filter bar:**
  - Search box (left)
  - Status filter (chips: All / Active / Paused / Done)
  - Tag multi-select dropdown
  - View toggle (Table / Grid card — Grid เป็น P1)
  - "+ New Project" button (right)
- **Main area — Data table:**
  - Columns: `#`, Icon, Name (TH/EN stacked), Category, Status, Tags, Last accessed, Actions
  - Sticky header, hover row highlight
  - Click row → open detail panel
- **Right detail panel (slide-in 400px):**
  - Full info, edit form, status change, tags edit, notes
  - Close button + ESC key dismiss
- **AC:**
  - Responsive: ≤ 768px → sidebar collapses to hamburger, detail = full-screen modal
  - Layout ไม่ shift เมื่อ data load (skeleton state)

#### R-06: Bilingual UI (TH + EN) — Critical
- ทุก UI text 2 ภาษา (label, button, error, empty state, tooltip)
- รูปแบบ: Thai บรรทัดบน, English บรรทัดล่าง (หรือสลับให้ Kim เลือก)
- Project data fields แยก `_th` / `_en`
- **AC:**
  - 0 text ภาษาเดียวหลุด (manual audit pre-launch)
  - i18n key-based (ใช้ next-intl หรือ react-i18next) — แก้ภาษาที่เดียวสะท้อนทั้งแอป
  - Form มี 2 input field สำหรับ TH และ EN ชัดเจน

#### R-07: Search
- Search bar ค้นจาก `name_th`, `name_en`, `description_th`, `description_en`, tags
- Debounce 200ms, case-insensitive, partial match
- **AC:**
  - พิมพ์ ≥ 2 ตัวอักษร → filter list ทันที (client-side ถ้า project < 500, else server-side)
  - Clear button (×) ใน search box

#### R-08: Persistence (Supabase)
- **Tables:**
  - `projects` — ตามที่ระบุใน R-01
  - `categories` — `id`, `name_th`, `name_en`, `icon`, `order`, `created_at`
  - `tags` — `id`, `name` (unique), `color` (optional)
  - `project_tags` — `project_id`, `tag_id` (junction)
- **RLS:** เปิดทุก table, policy = `auth.uid() = owner_id` (แม้ single-user)
- **AC:**
  - Data persist ข้าม refresh, ข้าม device
  - Backup: Supabase auto-backup เปิดใช้

#### R-09: Auth (Single User)
- Magic link หรือ email + password (Supabase Auth)
- Login page bilingual
- Auto-redirect ไปหน้าแรกถ้า logged in
- **AC:**
  - Session persist ≥ 7 วัน
  - Logout button ใน sidebar bottom

---

### P1 — Nice to Have (Fast follow)

| # | Requirement | Why |
|---|-------------|-----|
| R-10 | Sort table ตาม column (name, last_accessed, created_at, status) | UX ที่คุ้นเคย |
| R-11 | Icon/emoji per project (selectable) | Visual scan ได้เร็ว |
| R-12 | Pin favorites ขึ้นบนสุด | โครงการที่เปิดบ่อยอยู่บนเสมอ |
| R-13 | Dark mode toggle | สอดคล้องกับ Phocas-style + ใช้กลางคืน |
| R-14 | Export/Import projects เป็น JSON | Backup + migration |
| R-15 | Category counter badge (active count) | เห็นโหลดงานได้เร็ว |
| R-16 | Grid card view (toggle จาก table view) | Visual lover mode |
| R-17 | Keyboard shortcuts (`/` search, `n` new, `esc` close panel) | Power user |

---

### P2 — Future Considerations

| # | Consideration | Note |
|---|---------------|------|
| R-18 | Multi-user / sharing | ถ้าจะเปิดให้ทีมใช้ — Supabase RLS รองรับอยู่แล้ว |
| R-19 | External integration (GitHub commit count, Vercel deploy status) | Auto-update status จาก external state |
| R-20 | Dashboard view มี chart (active over time, category breakdown) | Insight layer |
| R-21 | Rich-text/markdown notes | Notes ลึกขึ้น |
| R-22 | Reminder / nudge ถ้า paused > 30 วัน | Anti-forgetting |
| R-23 | AI assistant — "ผมควรทำโครงการไหนต่อ?" | Codriver จริงๆ |

> **Design note:** R-18 (multi-user) ต้อง design schema ให้รองรับ owner_id ตั้งแต่ v1 — ใส่แล้วใน R-08

---

## 6. Success Metrics / ตัวชี้วัดความสำเร็จ

### Leading Indicators (1-2 สัปดาห์หลัง launch)
- **Adoption:** เพิ่ม project ≥ 10 รายการเข้า portal ภายใน 7 วัน
- **Engagement:** เปิด portal ≥ 5 ครั้ง/สัปดาห์
- **Activation:** Launch (click external URL) ≥ 10 ครั้ง/สัปดาห์
- **CRUD use:** อย่างน้อย 1 edit/week (สะท้อนว่า portal คือ live source)

### Lagging Indicators (1 เดือนหลัง launch)
- **Habituation:** Portal เป็น default home tab/bookmark (self-reported)
- **Time savings:** เปิดโครงการได้ภายใน 3 วินาที (vs. baseline ~10-20 วินาทีเดิม)
- **Reduced forgotten work:** จำนวน project ที่ paused > 30 วันลดลง (เพราะเห็นชัดบน portal)
- **System health:** Uptime ≥ 99%, 0 data loss incident

---

## 7. Open Questions / คำถามที่ยังเปิด

| # | Question | Owner | Blocking? |
|---|----------|-------|-----------|
| Q1 | สี/theme หลัก — ใช้ Phocas blue/teal เหมือนรูป หรือเลือกใหม่ (อิงตาม brand ของ Kim)? | Design (Kim) | No — ใช้ neutral ไปก่อน |
| Q2 | Logo/branding ของ Codriver Portal — มี asset อยู่แล้วหรือต้อง generate? | Design (Kim) | No — text logo ชั่วคราว |
| Q3 | Supabase region — Singapore (SEA, latency ต่ำ) หรือ US East (eco system ครบ)? | Eng (Kim) | Yes — ต้องเลือกก่อน setup |
| Q4 | GitHub repo URL — Kim จะระบุภายหลังหรือสร้างใหม่? | Eng (Kim) | Yes — ก่อน push code |
| Q5 | Seed data v1 — มีโครงการ existing ที่ต้อง import? ถ้ามี รูปแบบไหน (CSV/JSON)? | Product (Kim) | No — เริ่ม empty ได้ |
| Q6 | Auth method — magic link หรือ email/password? | Eng (Kim) | Yes — ก่อน Phase 1 |
| Q7 | Tag color — auto-assign จาก hash หรือเลือกเอง? | Design (Kim) | No — เริ่ม auto |
| Q8 | Layout TH/EN — บรรทัดบน/ล่าง หรือ toggle ภาษา? | Design (Kim) | No — เริ่มแบบ stacked |

---

## 8. Timeline & Phasing / ช่วงเวลาและขั้นตอน

**ประมาณการ:** ~2-3 สัปดาห์ ถ้า dedicated, แบ่ง 4 phases

### Phase 1 — Foundation (3-4 วัน)
- Supabase project + schema + RLS policies
- Next.js 14+ App Router setup + Tailwind + shadcn/ui
- Auth flow (Supabase Auth)
- Layout shell (sidebar + topbar + main + right panel)
- i18n setup (next-intl)
- **Exit criteria:** Login → see empty layout shell → logout works

### Phase 2 — Core CRUD (4-5 วัน)
- Project table view + filter + search
- Add/Edit/Delete project (form with TH/EN fields)
- Category CRUD + sidebar list
- Status badges + status change
- Tags create/select
- **Exit criteria:** เพิ่ม-แก้-ลบ-เปิด project ได้ครบ flow

### Phase 3 — Polish (3-4 วัน)
- Detail panel (right slide-in) — full edit + notes
- Responsive (mobile/tablet)
- Loading / empty / error states
- Bilingual audit (no leaked text)
- Last accessed tracking
- **Exit criteria:** ใช้งานบน mobile + desktop ได้สบาย, ไม่มี text ภาษาเดียว

### Phase 4 — Deploy (1-2 วัน)
- Vercel project setup + env vars (Supabase keys)
- Production smoke test (manual checklist)
- Backup script (export JSON)
- Domain setup (ถ้ามี)
- **Exit criteria:** เข้า production URL → ใช้งานได้จริงเหมือน local

---

## 9. Tech Stack / สถาปัตยกรรม (อ้างอิงจาก CLAUDE.md)

| Layer | Tech | Notes |
|-------|------|-------|
| Frontend | Next.js 14+ (App Router) + React + Tailwind CSS | Liquid responsive |
| UI components | shadcn/ui (Radix + Tailwind) | accessible, ปรับ theme ง่าย |
| i18n | next-intl | bilingual key-based |
| Hosting | Vercel | front + serverless |
| Database | Supabase (Postgres) | + RLS เปิดทุก table |
| Auth | Supabase Auth | magic link หรือ password (Q6) |
| State | React Server Components + minimal client state | ลด complexity |

---

## 10. Risks & Mitigations / ความเสี่ยง

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Scope creep ไปสู่ full PM tool | สูง | สูง | NG2 ชัดเจน, refer back to Goals |
| Bilingual ทำให้ schema/code ยุ่ง | กลาง | กลาง | i18n library + naming convention (_th/_en) ตั้งแต่แรก |
| Supabase free tier เต็ม | ต่ำ | ต่ำ | < 500 projects, free tier เพียงพอ |
| Mobile UX แย่ (Phocas-style desktop-heavy) | กลาง | กลาง | Mobile-first design pass ใน Phase 3 |
| Forgot to update status → data stale | กลาง | ต่ำ | Last accessed visible, P2 ทำ nudge |

---

## 11. Approval / การอนุมัติ

- [ ] Kim — Problem & Goals
- [ ] Kim — Non-Goals (สำคัญที่สุด — ป้องกัน scope creep)
- [ ] Kim — P0 requirements complete
- [ ] Kim — Open questions answered (Q3, Q4, Q6 blocking)
- [ ] Ready for system design phase

---

*End of PRD v1.0*
