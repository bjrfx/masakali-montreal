# Masakali Restaurant - Database & Forms Documentation

**Last Updated:** April 23, 2026  
**Database:** MySQL  
**Database Name:** `masakali_california`

---

## 📊 DATABASE TABLES OVERVIEW

### 1. **restaurants** Table
**Purpose:** Stores restaurant location/branch information  
**Key Columns:**
- `id` (INT, PK) - Unique identifier
- `name` (VARCHAR) - Restaurant name
- `slug` (VARCHAR) - URL slug (e.g., 'california', 'wellington')
- `brand` (VARCHAR) - Brand name
- `address` (VARCHAR) - Full address
- `city` (VARCHAR) - City name
- `province_state` (VARCHAR) - Province/State
- `country` (VARCHAR) - Country
- `postal_code` (VARCHAR)
- `phone` (VARCHAR)
- `email` (VARCHAR)
- `website` (VARCHAR)
- `google_maps_url` (TEXT)
- `latitude` (DECIMAL)
- `longitude` (DECIMAL)
- `opening_hours` (JSON)
- `image_url` (VARCHAR)
- `is_active` (BOOLEAN) - Default: TRUE
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Current Branches:**
- Stittsville, Ontario (slug: stittsville)
- Wellington, Ottawa (slug: wellington)
- Byward Market, Ottawa (slug: restobar)
- Kanata, Ontario (slug: rangde)
- Montreal, Quebec (slug: montreal)
- Cupertino, California (slug: california)

---

### 2. **menu_categories** Table
**Purpose:** Stores menu item categories  
**Key Columns:**
- `id` (INT, PK)
- `name` (VARCHAR) - Category name (e.g., "Appetizers", "Curries")
- `sort_order` (INT) - Display order
- `is_active` (BOOLEAN) - Default: TRUE
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Data Fetching:** Categories are fetched on [Menu.js](src/pages/Menu.js) page to display menu filters

---

### 3. **menu_items** Table
**Purpose:** Stores individual menu items/dishes  
**Key Columns:**
- `id` (INT, PK)
- `name` (VARCHAR) - Dish name
- `description` (TEXT) - Dish description
- `price` (INT) - Price in cents (e.g., 1599 = $15.99)
- `category_id` (INT, FK) - References menu_categories.id
- `image_url` (VARCHAR) - Dish image URL
- `images` (JSON) - Array of images
- `is_vegetarian` (BOOLEAN)
- `spice_level` (ENUM) - 'mild', 'medium', 'hot', 'extra_hot'
- `is_featured` (BOOLEAN) - Displayed on homepage
- `is_active` (BOOLEAN) - Default: TRUE
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Data Fetching:** 
- [Menu.js](src/pages/Menu.js) - Fetches all active menu items with categories using `api.getMenu()`
- Query: `SELECT mi.*, mc.name as category_name FROM menu_items mi JOIN menu_categories mc ON mi.category_id = mc.id WHERE mi.is_active = 1`

**Admin Management:** [MenuManagement.js](src/pages/admin/MenuManagement.js)
- Create: `INSERT INTO menu_items (name, description, price, category_id, is_vegetarian, spice_level, is_featured)`
- Update: `UPDATE menu_items SET name=?, description=?, price=?, category_id=?, is_vegetarian=?, spice_level=?, is_featured=?`
- Delete: `DELETE FROM menu_items WHERE id = ?`

---

### 4. **reservations** Table
**Purpose:** Stores restaurant table reservations  
**Key Columns:**
- `id` (INT, PK)
- `restaurant_id` (INT, FK) - References restaurants.id
- `name` (VARCHAR) - Guest name
- `email` (VARCHAR) - Guest email
- `phone` (VARCHAR) - Guest phone
- `date` (DATE) - Reservation date
- `time` (TIME) - Reservation time
- `persons` (INT) - Number of guests
- `special_requests` (TEXT) - Special dietary/seating requests
- `confirmation_code` (VARCHAR) - Unique confirmation (e.g., "MAS-001")
- `status` (ENUM) - 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'
- **IP/Geolocation Columns:**
  - `request_ip` (VARCHAR)
  - `request_user_agent` (TEXT)
  - `request_browser` (VARCHAR)
  - `request_os` (VARCHAR)
  - `request_device_type` (VARCHAR)
  - `ip_lookup_status`, `ip_country`, `ip_region`, `ip_city`, etc.
  - `geolocation_latitude`, `geolocation_longitude`
- `reminder_sent` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Data Operations:**
- **Create:** [Reservations.js](src/pages/Reservations.js) form submits to `/api/reservations`
- **Read:** Admin panel and [ManageReservations.js](src/pages/ManageReservations.js)
- **Update:** Customer can update via [ManageReservations.js](src/pages/ManageReservations.js) or admin via Dashboard
- **Email Notifications:** Sent to customer and admin when reservation is created/updated

---

### 5. **catering_requests** Table
**Purpose:** Stores catering service requests for events  
**Key Columns:**
- `id` (INT, PK)
- `name` (VARCHAR) - Contact name
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `event_date` (DATE)
- `guests` (INT)
- `event_location` (VARCHAR)
- `event_type` (VARCHAR) - 'Wedding', 'Corporate Event', 'Birthday Party', etc.
- `budget_range` (VARCHAR)
- `notes` (TEXT)
- `status` (ENUM) - 'new', 'contacted', 'quoted', 'confirmed', 'completed', 'cancelled'
- **IP/Geolocation Columns** (same as reservations)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Data Operations:**
- **Create:** [Catering.js](src/pages/Catering.js) form submits to `/api/catering`
- **Read/Manage:** Admin panel at [CateringManagement.js](src/pages/admin/CateringManagement.js)

---

### 6. **contact_inquiries** Table
**Purpose:** Stores general contact form submissions  
**Key Columns:**
- `id` (INT, PK)
- `name` (VARCHAR)
- `email` (VARCHAR)
- `phone` (VARCHAR)
- `subject` (VARCHAR)
- `message` (TEXT)
- `restaurant_id` (INT, FK) - References restaurants.id (nullable)
- **IP/Geolocation Columns** (same as reservations)
- `is_read` (BOOLEAN)
- `created_at` (TIMESTAMP)

**Data Operations:**
- **Create:** Contact form submits to `/api/contact`
- **Read/Manage:** Admin panel at [ContactManagement.js](src/pages/admin/ContactManagement.js)

---

### 7. **homepage_featured_dishes** Table
**Purpose:** Stores which menu items are featured on the homepage  
**Key Columns:**
- `id` (INT, PK)
- `menu_item_key` (VARCHAR) - References menu_items.id
- `sort_order` (INT) - Display order (max 6 items)
- `created_at` (TIMESTAMP)

**Data Fetching:** `/api/featured-dishes` returns up to 6 featured dishes

**Admin Management:** [HomepageContentManagement.js](src/pages/admin/HomepageContentManagement.js)
- Update: `DELETE FROM homepage_featured_dishes` then `INSERT` new items

---

### 8. **testimonials** Table
**Purpose:** Stores customer testimonials for homepage  
**Key Columns:**
- `id` (INT, PK)
- `name` (VARCHAR) - Customer name
- `text` (TEXT) - Testimonial text
- `rating` (TINYINT) - 1-5 star rating
- `branch` (VARCHAR) - Which branch (optional)
- `sort_order` (INT)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**Data Fetching:** `/api/testimonials` returns only active testimonials

**Admin Management:** [HomepageContentManagement.js](src/pages/admin/HomepageContentManagement.js)

---

### 9. **admins** Table
**Purpose:** Stores admin user accounts for the admin portal  
**Key Columns:**
- `id` (INT, PK)
- `name` (VARCHAR)
- `email` (VARCHAR) - UNIQUE
- `password_hash` (VARCHAR) - bcrypt hashed
- `role` (ENUM) - 'super_admin', 'branch_admin', 'staff'
- `restaurant_id` (INT, FK) - Which branch they manage (nullable)
- `is_active` (BOOLEAN)
- `last_login` (TIMESTAMP)
- `created_at` (TIMESTAMP)

**Authentication:** Login via [Login.js](src/pages/admin/Login.js) → `/api/auth/login`

---

### 10. **email_notification_settings** Table
**Purpose:** Stores admin email addresses for notifications  
**Key Columns:**
- `id` (TINYINT, PK) - Always 1
- `reservations_email` (VARCHAR) - Comma-separated emails for reservation notifications
- `contact_email` (VARCHAR) - Comma-separated emails for contact form notifications
- `catering_email` (VARCHAR) - Comma-separated emails for catering request notifications
- `updated_at` (TIMESTAMP)

**Admin Management:** [NotificationEmailSettings.js](src/pages/admin/NotificationEmailSettings.js)

---

## 📝 FORMS IN ALL PAGES

### PUBLIC-FACING PAGES

#### 1. **Reservations Page** ([Reservations.js](src/pages/Reservations.js))
**Form Name:** Reservation Booking Form

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Full Name | Text | ✓ | Min 1 char |
| Email Address | Email | ✓ | Valid email |
| Phone Number | Tel | ✓ | Exactly 10 digits |
| Restaurant Branch | Select | ✓ | Must select location |
| Date of Visit | Date | ✓ | Must be today or future |
| Time | Select | ✓ | Pre-defined time slots |
| Number of Guests | Number | ✓ | 1-30 |
| Special Requests | Textarea | ✗ | Optional |

**Time Slots Available:**
```
11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30
17:00, 17:30, 18:00, 18:30, 19:00, 19:30, 20:00, 20:30, 21:00, 21:30
```

**Database Table:** `reservations`

**Submitted Data:** 
```javascript
{
  name, email, phone, date, time, persons, restaurant_id, special_requests
}
```

**API Endpoint:** `POST /api/reservations` (no auth required)

**Actions on Success:**
1. Create record in `reservations` table
2. Generate unique `confirmation_code`
3. Send email to customer with confirmation
4. Send email to admin notification list
5. Track Google Analytics event
6. Track Google Ads conversion

---

#### 2. **Catering Page** ([Catering.js](src/pages/Catering.js))
**Form Name:** Catering Request Form

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Full Name | Text | ✓ | Min 1 char |
| Email Address | Email | ✓ | Valid email |
| Phone Number | Tel | ✓ | Exactly 10 digits |
| Event Type | Select | ✗ | Wedding, Corporate Event, Birthday Party, etc. |
| Event Date | Date | ✓ | Must be today or future |
| Number of Guests | Number | ✓ | Min 10 |
| Event Location | Text | ✗ | Optional venue name/address |
| Additional Notes | Textarea | ✗ | Dietary requirements, theme preferences |

**Event Type Options:**
```
Wedding, Corporate Event, Birthday Party, Anniversary, Festival/Holiday, Private Dining, Other
```

**Database Table:** `catering_requests`

**Submitted Data:**
```javascript
{
  name, email, phone, event_date, guests, event_location, event_type, notes
}
```

**API Endpoint:** `POST /api/catering` (no auth required)

**Actions on Success:**
1. Create record in `catering_requests` table with status='new'
2. Send email to catering admin notification list
3. Display success message

---

#### 3. **Menu Page** ([Menu.js](src/pages/Menu.js))
**No Submit Form** - This is a display/filter interface

**Filter Controls:**
- Search box (searches dish names and descriptions)
- Category filter buttons (All, Appetizers, Curries, etc.)
- View mode toggle (Compact, Card, List)

**Data Fetched:**
- `GET /api/categories` - Menu categories
- `GET /api/menu` - All menu items

**Database Tables:** `menu_categories`, `menu_items`

---

#### 4. **Manage Reservations Page** ([ManageReservations.js](src/pages/ManageReservations.js))
**Form 1: Lookup Form**

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Email Address | Email | ✓ | Valid email |
| Phone Number | Tel | ✓ | Exactly 10 digits |

**API Endpoint:** `POST /api/reservations/manage` (no auth required)

**Returns:** All reservations matching the email and phone, sorted newest first

---

**Form 2: Edit Reservation Form**

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Full Name | Text | ✓ | Min 1 char |
| Email Address | Email | ✓ | Valid email |
| Phone Number | Tel | ✓ | Exactly 10 digits |
| Date of Visit | Date | ✓| Must be today or future |
| Time | Select | ✓ | Pre-defined time slots |
| Number of Guests | Number | ✓ | 1-30 |
| Special Requests | Textarea | ✗ | Optional |

**API Endpoint:** `PUT /api/reservations/manage/:id` (no auth required)

**Actions on Update:**
1. Update `reservations` table record
2. Send update email to customer with old and new details
3. Send notification to admin

---

#### 5. **Contact Page** ([Contact.js](src/pages/Contact.js))
**No Form** - This page displays contact information only

**Displays:**
- Location details
- Phone number
- Email
- Hours

---

#### 6. **Home Page** ([Home.js](src/pages/Home.js))
**No Form** - Landing/hero page with navigation and promotional content

---

### ADMIN PAGES

#### 1. **Admin Login Page** ([Login.js](src/pages/admin/Login.js))
**Form Name:** Admin Authentication Form

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Email Address | Email | ✓ | Valid email |
| Password | Password | ✓ | Min 1 char |

**Database Table:** `admins`

**API Endpoint:** `POST /api/auth/login` (no auth required)

**Query:** `SELECT * FROM admins WHERE email = ? AND is_active = 1`

**Actions on Success:**
1. Compare password with `password_hash` using bcrypt
2. Update `last_login` timestamp
3. Return JWT token and admin details
4. Store token in `localStorage` as `adminToken`

---

#### 2. **Menu Management Page** ([MenuManagement.js](src/pages/admin/MenuManagement.js))
**Form 1: Create Menu Item Modal**

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Item Name | Text | ✓ | Min 1 char |
| Description | Textarea | ✗ | Optional |
| Price ($) | Number | ✓ | Decimal, ≥ 0 |
| Category | Select | ✓ | Must select from categories |
| Spice Level | Buttons | ✗ | mild, medium, hot, extra_hot |
| Vegetarian | Checkbox | ✗ | Boolean |
| Featured | Checkbox | ✗ | Boolean |

**Database Table:** `menu_items`

**API Endpoint:** `POST /api/menu` (auth required)

**Query:** `INSERT INTO menu_items (name, description, price, category_id, is_vegetarian, spice_level, is_featured)`

---

**Form 2: Edit Menu Item Modal**

**Same fields as Create form, but updates existing record**

**API Endpoint:** `PUT /api/menu/:id` (auth required)

**Query:** `UPDATE menu_items SET name=?, description=?, price=?, category_id=?, is_vegetarian=?, spice_level=?, is_featured=?`

---

**Controls:**
- Search by item name
- Filter by category
- Delete menu items (with confirmation)
- Auto-refresh every 8 seconds

**Database Tables:** `menu_items`, `menu_categories`

---

#### 3. **Reservation Management** ([ReservationManagement.js](src/pages/admin/ReservationManagement.js))
**No Form** - Admin view/management interface

**Features:**
- View all reservations
- Filter by status, restaurant, date
- Update reservation status (pending, confirmed, cancelled, completed, no_show)
- Delete reservations
- Send reminder emails

**Database Table:** `reservations`

**API Endpoints:**
- `GET /api/reservations` - List all
- `PUT /api/reservations/:id` - Update status
- `DELETE /api/reservations/:id` - Delete

---

#### 4. **Catering Management** ([CateringManagement.js](src/pages/admin/CateringManagement.js))
**No Form** - Admin view/management interface

**Features:**
- View all catering requests
- Update status (new, contacted, quoted, confirmed, completed, cancelled)
- Delete requests

**Database Table:** `catering_requests`

**API Endpoints:**
- `GET /api/catering` - List all
- `PUT /api/catering/:id` - Update status
- `DELETE /api/catering/:id` - Delete

---

#### 5. **Contact Management** ([ContactManagement.js](src/pages/admin/ContactManagement.js))
**No Form** - Admin view/management interface

**Features:**
- View all contact inquiries
- Mark as read/unread
- Delete inquiries
- Reply via email

**Database Table:** `contact_inquiries`

**API Endpoints:**
- `GET /api/contact` - List all
- `PUT /api/contact/:id` - Update is_read status
- `DELETE /api/contact/:id` - Delete

---

#### 6. **Notification Email Settings** ([NotificationEmailSettings.js](src/pages/admin/NotificationEmailSettings.js))
**Form Name:** Email Configuration Form

**Fields:**
| Field | Type | Required | Validation |
|-------|------|----------|-----------|
| Reservations Email(s) | Text | ✗ | Comma-separated emails |
| Contact Email(s) | Text | ✗ | Comma-separated emails |
| Catering Email(s) | Text | ✗ | Comma-separated emails |

**Database Table:** `email_notification_settings`

**API Endpoints:**
- `GET /api/admin/notification-emails` - Get current settings
- `PUT /api/admin/notification-emails` - Update settings

**Note:** Admin emails can receive multiple comma-separated addresses

---

#### 7. **Homepage Content Management** ([HomepageContentManagement.js](src/pages/admin/HomepageContentManagement.js))
**Contains Multiple Forms:**

**Form 1: Featured Dishes Management**
- Drag-and-drop to reorder (max 6 items)
- Select from available menu items
- API: `PUT /api/admin/featured-dishes`
- Database Table: `homepage_featured_dishes`

**Form 2: Testimonials Management**
- Create/Edit testimonials
- Fields: Name, Text, Rating (1-5), Branch, Sort Order, Is Active
- API: `POST/PUT/DELETE /api/admin/testimonials`
- Database Table: `testimonials`

---

#### 8. **Dashboard/Analytics** ([Dashboard.js](src/pages/admin/Dashboard.js) and [Analytics.js](src/pages/admin/Analytics.js))
**No Form** - Display only

**Data Displayed:**
- Total reservations count
- Confirmed reservations count
- Today's reservations count
- Total catering requests count
- Total menu items count
- Reservations by branch
- Analytics overview

**API Endpoint:** `GET /api/analytics/overview` (auth required)

**Database Queries:**
```sql
SELECT COUNT(*) as count FROM reservations
SELECT COUNT(*) as count FROM reservations WHERE status = 'confirmed'
SELECT COUNT(*) as count FROM reservations WHERE date = CURDATE()
SELECT COUNT(*) as count FROM catering_requests
SELECT COUNT(*) as count FROM menu_items WHERE is_active = 1
SELECT r.name, COUNT(res.id) as count FROM restaurants r 
  LEFT JOIN reservations res ON r.id = res.restaurant_id 
  GROUP BY r.id, r.name
```

---

## 🔗 DATA FLOW DIAGRAM

```
PUBLIC WEBSITE
│
├─→ Menu Page
│   ├─ GET /api/categories → menu_categories table
│   └─ GET /api/menu → menu_items + menu_categories (JOIN)
│
├─→ Reservations Page
│   ├─ GET /api/restaurants (filter for current location)
│   └─ POST /api/reservations → reservations table
│       └─ Email: reservations_email from email_notification_settings
│
├─→ Catering Page
│   └─ POST /api/catering → catering_requests table
│       └─ Email: catering_email from email_notification_settings
│
├─→ Manage Reservations Page
│   ├─ POST /api/reservations/manage → search reservations table
│   └─ PUT /api/reservations/manage/:id → update reservations table
│       └─ Email: reservations_email from email_notification_settings
│
└─→ Contact Page
    └─ Display only (no forms)


ADMIN PORTAL
│
├─→ Login Page
│   └─ POST /api/auth/login → admins table (bcrypt password check)
│       └─ Returns JWT token
│
├─→ Menu Management
│   ├─ GET /api/categories → menu_categories table
│   ├─ GET /api/menu → menu_items table
│   ├─ POST /api/menu → INSERT menu_items
│   ├─ PUT /api/menu/:id → UPDATE menu_items
│   └─ DELETE /api/menu/:id → DELETE menu_items
│
├─→ Reservation Management
│   ├─ GET /api/reservations → reservations + restaurants (JOIN)
│   ├─ PUT /api/reservations/:id → UPDATE reservations (status)
│   └─ DELETE /api/reservations/:id → DELETE reservations
│
├─→ Catering Management
│   ├─ GET /api/catering → catering_requests table
│   ├─ PUT /api/catering/:id → UPDATE catering_requests (status)
│   └─ DELETE /api/catering/:id → DELETE catering_requests
│
├─→ Contact Management
│   ├─ GET /api/contact → contact_inquiries table
│   ├─ PUT /api/contact/:id → UPDATE contact_inquiries (is_read)
│   └─ DELETE /api/contact/:id → DELETE contact_inquiries
│
├─→ Homepage Content Management
│   ├─ Featured Dishes
│   │   ├─ GET /api/featured-dishes → homepage_featured_dishes + menu_items
│   │   └─ PUT /api/admin/featured-dishes → homepage_featured_dishes table
│   │
│   └─ Testimonials
│       ├─ GET /api/admin/testimonials → testimonials table
│       ├─ POST /api/admin/testimonials → INSERT testimonials
│       ├─ PUT /api/admin/testimonials/:id → UPDATE testimonials
│       └─ DELETE /api/admin/testimonials/:id → DELETE testimonials
│
├─→ Notification Settings
│   ├─ GET /api/admin/notification-emails → email_notification_settings
│   └─ PUT /api/admin/notification-emails → UPDATE email_notification_settings
│
└─→ Analytics/Dashboard
    └─ GET /api/analytics/overview → Multiple aggregated queries
        ├─ COUNT reservations
        ├─ COUNT catering_requests
        ├─ COUNT menu_items
        └─ GROUP BY restaurants for branch stats
```

---

## 📧 EMAIL INTEGRATION

### Email Notification System

**SMTP Configuration:**
```
Host: mail.masakalicalifornia.com
Port: 465 (secure)
Sender 1: reservations@masakalicalifornia.com
Sender 2: contact@masakalicalifornia.com
```

**Email Notification Types:**

1. **Reservation Confirmation Email** (to customer + admin)
   - Triggered: When reservation is created
   - Recipient (Customer): Guest email
   - Recipient (Admin): `email_notification_settings.reservations_email`
   - Subject: "Reservation Confirmed - {confirmation_code}"

2. **Reservation Update Email** (to customer + admin)
   - Triggered: When reservation is updated
   - Shows old and new details

3. **Catering Request Email** (to admin only)
   - Triggered: When catering request is submitted
   - Recipient: `email_notification_settings.catering_email`
   - Subject: "New Catering Request"

4. **Contact Inquiry Email** (to admin only)
   - Triggered: When contact form is submitted
   - Recipient: `email_notification_settings.contact_email`
   - Subject: "New Contact Form Submission"

---

## 🔐 AUTHENTICATION & AUTHORIZATION

**JWT Secret:** Stored in environment variable `JWT_SECRET`

**Token Expiry:** 24 hours

**Admin Roles:**
- `super_admin` - Full access to all features
- `branch_admin` - Access to specific branch only
- `staff` - Limited access

**Protected Routes Require:**
- Authorization header: `Bearer {token}`
- Valid JWT token signed with `JWT_SECRET`

---

## 📱 FEATURED PAGES USING DATABASE

### Pages Using Menu Database:
1. **Menu.js** - Display all menu items with filters
2. **Home.js** - Display featured dishes carousel
3. **Admin MenuManagement.js** - Manage menu items

### Pages Using Reservation Database:
1. **Reservations.js** - Create new reservation
2. **ManageReservations.js** - View and update existing reservation
3. **Admin ReservationManagement.js** - Manage all reservations

### Pages Using Catering Database:
1. **Catering.js** - Submit catering request
2. **Admin CateringManagement.js** - Manage catering requests

### Pages Using Contact Database:
1. **Admin ContactManagement.js** - Manage contact inquiries

### Pages Using Testimonial Database:
1. **Home.js** - Display testimonials section
2. **Admin HomepageContentManagement.js** - Manage testimonials

---

## 🎯 KEY STATISTICS

**Total Database Tables:** 10

**Total Forms in Application:** 10+

**Forms on Public Pages:** 4 (Reservations, Catering, ManageReservations lookup+edit, Login)

**Forms on Admin Pages:** 5+ (Menu create/edit, Testimonials, Featured Dishes, Email Settings, Analytics)

**Restaurants in Database:** 6 locations

**Authentication Method:** JWT + bcrypt password hashing

**Email Recipients:** Configurable per notification type in `email_notification_settings`

---

## 🚀 API ENDPOINTS SUMMARY

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/auth/login` | POST | ✗ | Admin login |
| `/api/restaurants` | GET | ✗ | Get all restaurants |
| `/api/categories` | GET | ✗ | Get menu categories |
| `/api/menu` | GET | ✗ | Get menu items |
| `/api/menu` | POST | ✓ | Create menu item |
| `/api/menu/:id` | PUT | ✓ | Update menu item |
| `/api/menu/:id` | DELETE | ✓ | Delete menu item |
| `/api/featured-dishes` | GET | ✗ | Get featured dishes |
| `/api/admin/featured-dishes` | PUT | ✓ | Update featured dishes |
| `/api/testimonials` | GET | ✗ | Get testimonials |
| `/api/admin/testimonials` | GET,POST,PUT,DELETE | ✓ | Manage testimonials |
| `/api/reservations` | POST | ✗ | Create reservation |
| `/api/reservations` | GET | ✓ | Get all reservations (admin) |
| `/api/reservations/manage` | POST | ✗ | Customer lookup reservations |
| `/api/reservations/manage/:id` | PUT | ✗ | Customer update reservation |
| `/api/reservations/:id` | PUT | ✓ | Admin update reservation |
| `/api/reservations/:id` | DELETE | ✓ | Admin delete reservation |
| `/api/catering` | POST | ✗ | Create catering request |
| `/api/catering` | GET | ✓ | Get all catering requests (admin) |
| `/api/catering/:id` | PUT | ✓ | Update catering request |
| `/api/catering/:id` | DELETE | ✓ | Delete catering request |
| `/api/contact` | POST | ✗ | Create contact inquiry |
| `/api/contact` | GET | ✓ | Get all contact inquiries (admin) |
| `/api/contact/:id` | PUT | ✓ | Update contact inquiry |
| `/api/contact/:id` | DELETE | ✓ | Delete contact inquiry |
| `/api/admin/notification-emails` | GET | ✓ | Get email settings |
| `/api/admin/notification-emails` | PUT | ✓ | Update email settings |
| `/api/analytics/overview` | GET | ✓ | Get analytics data |

---

## 📌 NOTES

- **Price Storage:** Prices in `menu_items` are stored in cents (e.g., 1599 = $15.99)
- **Phone Format:** 10-digit phone numbers are prefixed with "1" for North American format
- **Confirmation Codes:** Unique format like "MAS-001", "MAS-002"
- **IP Tracking:** All public forms capture IP address and geolocation data for security
- **Soft Delete:** No soft delete implemented; all deletes are permanent
- **Time Zones:** All timestamps are in server timezone (set via environment)

