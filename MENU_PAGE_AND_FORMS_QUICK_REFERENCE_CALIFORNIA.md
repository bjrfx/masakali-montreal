# Masakali Restaurant - Quick Reference Guide

## 📊 MENU PAGE DATABASE ARCHITECTURE

### What Data Does Menu Page Use?

The **Menu.js** page fetches data from **2 database tables**:

```
┌─────────────────────────────────────────────────────────────┐
│                     MENU PAGE (Menu.js)                      │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
        ┌───────▼────────┐        ┌────────▼──────┐
        │  menu_categories        │  menu_items    │
        ├──────────────┤        ├───────────────┤
        │ id           │        │ id             │
        │ name         │        │ name           │
        │ sort_order   │        │ description    │
        │ is_active    │        │ price (cents)  │
        └──────────────┘        │ category_id*   │
                                │ image_url      │
                                │ is_vegetarian  │
                                │ spice_level    │
                                │ is_featured    │
                                │ is_active      │
                                └────────────────┘
                                      │
                                      └─ *Foreign Key to menu_categories
```

### Menu Page Queries:

**On Page Load:**
```javascript
Promise.all([
  api.getCategories(),  // GET /api/categories
  api.getMenu()         // GET /api/menu
])
```

**Backend SQL:**
```sql
-- Categories
SELECT * FROM menu_categories 
WHERE is_active = 1 
ORDER BY sort_order

-- Menu Items
SELECT mi.*, mc.name as category_name 
FROM menu_items mi 
JOIN menu_categories mc ON mi.category_id = mc.id 
WHERE mi.is_active = 1 
ORDER BY mc.sort_order, mi.name
```

### Form Controls on Menu Page:
- ✏️ **Search Box** - Filters by dish name and description
- 🏷️ **Category Buttons** - Shows only dishes from selected category
- 👁️ **View Mode Toggle** - Compact/Card/List view (UI only, no DB impact)

---

## 📋 ALL FORMS IN APPLICATION

### PUBLIC FORMS (Customer-Facing)

#### 1. RESERVATION FORM
**Location:** `src/pages/Reservations.js`

**Fields Submitted to `reservations` table:**
```
✓ name              → reservations.name
✓ email             → reservations.email
✓ phone             → reservations.phone (formatted as 1-XXXXXXXXXX)
✓ restaurant_id     → reservations.restaurant_id (FK to restaurants)
✓ date              → reservations.date
✓ time              → reservations.time
✓ persons           → reservations.persons
  special_requests  → reservations.special_requests (optional)

Auto-Generated:
  confirmation_code → reservations.confirmation_code (e.g., "MAS-001")
  status            → reservations.status (default: "pending")
  created_at        → reservations.created_at
  request_ip        → reservations.request_ip (captured)
  device info       → Various request_* columns
```

**Triggers Email Notifications:**
- ✉️ To Customer: Confirmation email with booking details
- ✉️ To Admin: New reservation notification

---

#### 2. CATERING FORM
**Location:** `src/pages/Catering.js`

**Fields Submitted to `catering_requests` table:**
```
✓ name              → catering_requests.name
✓ email             → catering_requests.email
✓ phone             → catering_requests.phone
✓ event_date        → catering_requests.event_date
✓ guests            → catering_requests.guests
  event_location    → catering_requests.event_location (optional)
  event_type        → catering_requests.event_type (optional)
  notes             → catering_requests.notes (optional)

Auto-Generated:
  status            → catering_requests.status (default: "new")
  created_at        → catering_requests.created_at
  request_ip        → catering_requests.request_ip (captured)
  device info       → Various request_* columns
```

**Triggers Email Notifications:**
- ✉️ To Admin: New catering request notification

---

#### 3. MANAGE RESERVATIONS - LOOKUP FORM
**Location:** `src/pages/ManageReservations.js`

**Not Submitted to DB - Used to Search:**
```
✓ email             → Search parameter in query
✓ phone             → Search parameter in query

API Call: POST /api/reservations/manage
Returns: All reservations matching email AND phone
Fetches from: reservations table
```

---

#### 4. MANAGE RESERVATIONS - EDIT FORM
**Location:** `src/pages/ManageReservations.js`

**Fields Updated in `reservations` table:**
```
✓ name              → reservations.name
✓ email             → reservations.email
✓ phone             → reservations.phone
✓ date              → reservations.date
✓ time              → reservations.time
✓ persons           → reservations.persons
  special_requests  → reservations.special_requests (optional)

Auto-Updated:
  updated_at        → reservations.updated_at
```

**Triggers Email Notifications:**
- ✉️ To Customer: Update confirmation showing old and new details

---

#### 5. CONTACT FORM (if present)
**Status:** Not found in Contact.js - Page shows info only, no form

---

### ADMIN FORMS (Dashboard/CMS)

#### 1. LOGIN FORM
**Location:** `src/pages/admin/Login.js`

**Fields Checked Against `admins` table:**
```
✓ email             → admins.email (UNIQUE, must match)
✓ password          → admins.password_hash (bcrypt verified)

Query: SELECT * FROM admins 
       WHERE email = ? AND is_active = 1

Auto-Updated on Success:
  last_login        → admins.last_login
  JWT Token         → Stored in localStorage
```

---

#### 2. MENU MANAGEMENT - CREATE ITEM
**Location:** `src/pages/admin/MenuManagement.js`

**Fields Inserted into `menu_items` table:**
```
✓ name              → menu_items.name
  description       → menu_items.description (optional)
✓ price             → menu_items.price (in cents)
✓ category_id       → menu_items.category_id (FK to menu_categories)
  is_vegetarian     → menu_items.is_vegetarian (boolean)
  spice_level       → menu_items.spice_level (enum)
  is_featured       → menu_items.is_featured (boolean)

Auto-Generated:
  is_active         → menu_items.is_active (default: TRUE)
  created_at        → menu_items.created_at
  updated_at        → menu_items.updated_at
```

---

#### 3. MENU MANAGEMENT - EDIT ITEM
**Location:** `src/pages/admin/MenuManagement.js`

**Same fields as CREATE, updates existing record**

---

#### 4. TESTIMONIALS FORM
**Location:** `src/pages/admin/HomepageContentManagement.js`

**Fields in `testimonials` table:**
```
✓ name              → testimonials.name
✓ text              → testimonials.text (testimonial content)
  branch            → testimonials.branch (optional, which location)
  rating            → testimonials.rating (1-5 stars)
  sort_order        → testimonials.sort_order (display order)
  is_active         → testimonials.is_active (show/hide)

Auto-Generated:
  created_at        → testimonials.created_at
  updated_at        → testimonials.updated_at (on edit)
```

---

#### 5. FEATURED DISHES MANAGEMENT
**Location:** `src/pages/admin/HomepageContentManagement.js`

**Submitted to `homepage_featured_dishes` table:**
```
✓ menu_item_key[]   → homepage_featured_dishes.menu_item_key (up to 6)
  sort_order        → homepage_featured_dishes.sort_order (auto-numbered)

Note: Max 6 featured dishes. All dishes must exist in menu_items table.
Operation: DELETE all, then INSERT new set
```

---

#### 6. EMAIL NOTIFICATION SETTINGS
**Location:** `src/pages/admin/NotificationEmailSettings.js`

**Fields in `email_notification_settings` table:**
```
  reservations_email  → email_notification_settings.reservations_email
  contact_email       → email_notification_settings.contact_email
  catering_email      → email_notification_settings.catering_email

Format: Comma-separated email addresses
Example: "admin@restaurant.com, manager@restaurant.com"
```

---

## 🗺️ COMPLETE DATABASE TABLE USAGE MAP

| Table Name | Used By Pages | Purpose | Records Count |
|---|---|---|---|
| `menu_categories` | Menu.js, MenuManagement | Store dish categories | ~10-20 |
| `menu_items` | Menu.js, Home.js, MenuManagement | Store all dishes | ~200+ |
| `restaurants` | Reservations.js, All pages | Store branch info | 6 |
| `reservations` | Reservations.js, ManageReservations, ReservationMgmt | Customer bookings | Growing |
| `catering_requests` | Catering.js, CateringManagement | Event catering requests | Growing |
| `contact_inquiries` | ContactManagement | General inquiries | Growing |
| `homepage_featured_dishes` | Home.js, HomepageContentManagement | Featured menu items | ≤6 |
| `testimonials` | Home.js, HomepageContentManagement | Customer reviews | ~10-50 |
| `admins` | Login.js, Dashboard | Admin user accounts | ~5-10 |
| `email_notification_settings` | NotificationEmailSettings, Email system | Email recipients config | 1 |

---

## 🔄 DATA FETCHING FROM DATABASE

### Menu Page Data Flow:

```
User visits /menu
     │
     ├─ useEffect() triggers
     │
     ├─ api.getCategories()
     │  └─ GET /api/categories
     │     └─ SELECT * FROM menu_categories WHERE is_active=1
     │        └─ Returns array of categories
     │
     ├─ api.getMenu()
     │  └─ GET /api/menu
     │     └─ SELECT mi.*, mc.name as category_name 
     │        FROM menu_items mi 
     │        JOIN menu_categories mc ON mi.category_id = mc.id 
     │        WHERE mi.is_active=1
     │        └─ Returns array of menu items WITH category names
     │
     ├─ Both promises resolve
     │
     ├─ setCategories(cats)
     ├─ setMenuItems(items)
     ├─ setLoading(false)
     │
     └─ Render menu with:
        ├─ Category filter buttons (from categories)
        ├─ Search box
        ├─ View mode toggle
        └─ Menu items grouped by category
           (items automatically associated via category_id)
```

### Search & Filter Logic (Client-Side):

```javascript
const filteredItems = menuItems.filter(item => {
  // Filter by category if selected
  if (activeCategory && item.category_id !== activeCategory) 
    return false;
  
  // Filter by search text
  if (search && !item.name.toLowerCase().includes(search.toLowerCase()) 
      && !item.description?.toLowerCase().includes(search.toLowerCase())) 
    return false;
  
  return true;
});

// No new database query - filtering done on already-loaded data
```

---

## 📝 FORM FIELDS THAT TRIGGER DATABASE WRITES

### Reservation Form:
```
❌ name           → ✅ INSERT reservations.name
❌ email          → ✅ INSERT reservations.email
❌ phone          → ✅ INSERT reservations.phone
❌ restaurant_id  → ✅ INSERT reservations.restaurant_id
❌ date           → ✅ INSERT reservations.date
❌ time           → ✅ INSERT reservations.time
❌ persons        → ✅ INSERT reservations.persons
❌ special_requests → ✅ INSERT reservations.special_requests
```

### Menu Item Form (Admin):
```
❌ name           → ✅ INSERT/UPDATE menu_items.name
❌ description    → ✅ INSERT/UPDATE menu_items.description
❌ price          → ✅ INSERT/UPDATE menu_items.price
❌ category_id    → ✅ INSERT/UPDATE menu_items.category_id
❌ is_vegetarian  → ✅ INSERT/UPDATE menu_items.is_vegetarian
❌ spice_level    → ✅ INSERT/UPDATE menu_items.spice_level
❌ is_featured    → ✅ INSERT/UPDATE menu_items.is_featured
```

---

## 🎯 QUICK STATISTICS

| Metric | Count |
|--------|-------|
| Database Tables | 10 |
| Forms in Application | 10+ |
| Public-Facing Forms | 4 |
| Admin Forms | 6+ |
| API Endpoints | 30+ |
| Restaurant Locations | 6 |
| Max Featured Dishes | 6 |
| Max Reservation Guests | 30 |
| Min Catering Guests | 10 |

---

## 💡 KEY TAKEAWAYS

### Menu Page:
- Fetches from 2 tables: `menu_categories` + `menu_items`
- JOIN combines them by `category_id`
- Search/filter done on client-side (no DB queries)
- Displays `price` (stored as cents), `spice_level`, `is_vegetarian`

### All Forms Combined:
- 4 customer-facing forms (reservations, catering, manage, contact)
- 6 admin management forms (menu, testimonials, featured, settings, login, analytics)
- All store data directly to database
- Most trigger email notifications

### Database Usage:
- **Heavy Read:** `menu_categories`, `menu_items`, `reservations`
- **Heavy Write:** `reservations`, `catering_requests` (customer inputs)
- **Admin Only:** `menu_items` (CRUD), `admins`, `email_notification_settings`
- **Single Record:** `email_notification_settings` (always id=1)

