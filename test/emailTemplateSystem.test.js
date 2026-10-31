const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createEmailTemplateSystem } = require('../emailTemplateSystem');

test('reservation update and test emails use Montreal despite unrelated shared location rows', async () => {
  const previousEnvironment = {
    EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST,
    RESERVATION_EMAIL_USER: process.env.RESERVATION_EMAIL_USER,
    RESERVATION_EMAIL_PASS: process.env.RESERVATION_EMAIL_PASS,
  };
  process.env.EMAIL_SMTP_HOST = 'smtp.example.test';
  process.env.RESERVATION_EMAIL_USER = 'reservations@masakalimontreal.ca';
  process.env.RESERVATION_EMAIL_PASS = 'test-password';

  const sentEmails = [];
  const registeredRoutes = new Map();
  const locations = [
    { id: 1, restaurant_id: 1, location_slug: 'stittsville', restaurant_name: 'Masakali Indian Cuisine - Stittsville', address: 'Stittsville address', is_active: 1 },
    { id: 3, restaurant_id: 3, location_slug: 'montreal', restaurant_name: 'Masakali Indian Cuisine - Montreal', address: '1015 Sherbrooke St W, Montreal, QC H3A 1G5', phone: '(514) 228-6777', business_hours: 'Mon-Sun: 12:00 PM - 10:00 PM', online_order_url: 'https://www.clover.com/online-ordering/masakali-montreal', is_active: 1 },
    { id: 7, restaurant_id: 5, location_slug: 'ottawa-stittsville', restaurant_name: 'Masakali Indian Cuisine - Stittsville', address: 'Stittsville address', is_active: 1 },
  ];
  const db = {
    async query(sql) {
      if (sql.includes('FROM email_notification_settings')) {
        return [[{ reservations_email: 'admin@masakalimontreal.ca' }], []];
      }
      if (sql.includes('FROM email_location_settings')) return [locations, []];
      if (sql.includes('FROM email_templates')) return [[], []];
      return [{ affectedRows: 1 }, []];
    },
  };
  const app = {
    get: () => {},
    post: (path, ...handlers) => registeredRoutes.set(path, handlers[handlers.length - 1]),
    put: () => {},
    delete: () => {},
  };
  const emailSystem = createEmailTemplateSystem({
    app,
    nodemailer: {
      createTransport: () => ({ sendMail: async (email) => sentEmails.push(email) }),
    },
    io: { to: () => ({ emit: () => {} }) },
    getDb: () => db,
    authMiddleware: () => {},
    mockRestaurants: [{ id: 3, name: 'Masakali Indian Cuisine - Montreal', slug: 'montreal' }],
    mockReservationBlockouts: [],
    mockAdminNotifications: [],
    mockEmailNotificationSettings: {},
    siteConfig: {
      brand: 'Masakali Indian Cuisine',
      defaultRestaurantName: 'Masakali Montreal',
      smtpHost: 'smtp.example.test',
      reservationUser: 'reservations@masakalimontreal.ca',
      reservationAdminEmail: 'admin@masakalimontreal.ca',
      reservationPass: 'test-password',
      contactUser: '',
      contactPass: '',
      baseUrl: 'https://masakalimontreal.ca',
      logoPath: '/logo/Masakali-Indian-Cuisine.png',
      logoAlt: 'Masakali Indian Cuisine',
      locations: [{
        restaurant_id: 3,
        location_slug: 'montreal',
        restaurant_name: 'Masakali Indian Cuisine - Montreal',
        address: '1015 Sherbrooke St W, Montreal, QC H3A 1G5',
        phone: '(514) 228-6777',
        business_hours: 'Mon-Sun: 12:00 PM - 10:00 PM',
        online_order_url: 'https://www.clover.com/online-ordering/masakali-montreal',
        sort_order: 1,
      }],
    },
  });

  try {
    await emailSystem.sendReservationUpdateEmails(
      { id: 1285, confirmation_code: 'MAS-809418', name: 'Test Guest', email: 'guest@example.com', phone: '15145550100', date: '2026-11-07', time: '18:30:00', persons: 2 },
      { id: 1285, restaurant_id: 5, restaurant_name: 'Masakali Indian Cuisine - Montreal', restaurant_slug: 'montreal', confirmation_code: 'MAS-809418', name: 'Test Guest', email: 'guest@example.com', phone: '15145550100', date: '2026-11-08', time: '19:00:00', persons: 4 },
      { id: 5, name: 'Masakali Indian Cuisine - Montreal', slug: 'montreal' }
    );

    const updateCustomerEmail = sentEmails[0];
    const updateAdminEmail = sentEmails[1];
    assert.equal(updateCustomerEmail.to, 'guest@example.com');
    assert.equal(updateAdminEmail.to, 'admin@masakalimontreal.ca');
    for (const email of [updateCustomerEmail, updateAdminEmail]) {
      assert.match(email.html, /Masakali Indian Cuisine - Montreal/);
      assert.doesNotMatch(email.html, /Stittsville|Ottawa/);
      assert.match(email.html, /MAS-809418/);
      assert.match(email.html, /Sat, Nov 7, 2026/);
      assert.match(email.html, /18:30/);
      assert.match(email.html, /Guests<\/td><td[^>]*>4/);
      assert.match(email.html, /Sun, Nov 8, 2026/);
      assert.match(email.html, /19:00/);
    }
    assert.match(updateCustomerEmail.html, /Previous Details:<\/strong> Date: Sat, Nov 7, 2026, Time: 18:30, Guests: 2/);
    assert.match(updateCustomerEmail.html, /Updated Details:<\/strong> Date: Sun, Nov 8, 2026, Time: 19:00, Guests: 4/);
    assert.match(updateCustomerEmail.text, /Previous: Date: Sat, Nov 7, 2026, Time: 18:30, Guests: 2/);
    assert.match(updateCustomerEmail.text, /Updated: Date: Sun, Nov 8, 2026, Time: 19:00, Guests: 4/);
    assert.match(updateAdminEmail.html, /Previous Details/);
    assert.match(updateAdminEmail.html, /Updated Details/);

    const testEmailRoute = registeredRoutes.get('/api/admin/email-templates/:templateKey/test');
    const testResponse = {
      statusCode: 200,
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; },
    };
    await testEmailRoute(
      { params: { templateKey: 'reservation_update_customer' }, body: { to: 'test@example.com', restaurant_id: 5 } },
      testResponse
    );
    assert.equal(testResponse.statusCode, 200);
    assert.deepEqual(testResponse.body, { success: true });
    assert.equal(sentEmails[2].to, 'test@example.com');
    assert.match(sentEmails[2].html, /Masakali Indian Cuisine - Montreal/);
    assert.doesNotMatch(sentEmails[2].html, /Stittsville|Ottawa/);
  } finally {
    for (const [key, value] of Object.entries(previousEnvironment)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
});
