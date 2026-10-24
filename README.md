# KALA MAIA — GitHub Pages + Google Sheets starter

A new-brand starter inspired by the *general* clean, warm, editorial style of the reference site. It does not copy the original brand, text, or assets.

## What is included

- Responsive landing page with order, tracking, and support/refund entry points
- Order form with an estimated total
- Tracking lookup UI
- Shipping/refund support request UI
- Demo mode so the site can be previewed before connecting a backend
- Google Apps Script backend starter for order creation, customer-safe order lookup, and support requests
- Server-side item-price validation and spreadsheet formula-injection protection

## Architecture

`GitHub Pages (public frontend) → Apps Script Web App (API) → private Google Sheet`

GitHub Pages is static hosting. It must not contain secrets or private customer data. Google Sheets should be accessible only to the business owner/team and Apps Script. The starter verifies order lookup using both the order reference and checkout email. Support requests are accepted only after that order/email combination is verified.

## 1. Preview and publish the frontend

1. Create a new GitHub repository, for example `kala-maia-portal`.
2. Upload `index.html`, `styles.css`, and `app.js` to the repository root.
3. In GitHub, open **Settings → Pages**.
4. Choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. Open the generated GitHub Pages URL. The website runs in demo mode by default.

The demo is not a live database: demo-created order references are not persisted. The demo tracking example is `PN-DEMO1` with `demo@example.com`.

## 2. Create the private Google Sheet

Create a new Google Sheet. Copy the spreadsheet ID from its URL, the long value between `/d/` and `/edit`.

Do not share the sheet publicly. The Apps Script creates `Orders` and `SupportRequests` tabs and headers when first needed.

## 3. Deploy the Apps Script API

1. From the Sheet, select **Extensions → Apps Script**.
2. Replace the editor contents with `apps-script/Code.gs`.
3. Open **Project Settings → Script properties**.
4. Add `SPREADSHEET_ID` with the ID of the sheet.
5. Save. In Apps Script, select **Deploy → New deployment → Web app**.
6. Execute as **Me**. Set access to the least-permissive setting that still permits your intended public customer workflow; a public customer form usually requires anonymous access, so use strict validation and monitor abuse.
7. Deploy and copy the Web App URL ending in `/exec`.

Google changes deployment labels and access options periodically. Test from a signed-out/private browser before using it with customers.

## 4. Connect the frontend

In `app.js`, update:

```js
const CONFIG = {
  apiUrl: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE",
  currency: "IDR",
  demoMode: false
};
```

Commit and push. Wait for GitHub Pages to rebuild, then test:
- create an order;
- verify a new row appears in `Orders`;
- track using the exact order reference + checkout email;
- submit shipping/refund support using the same matching email;
- change the status and tracking number in the restricted sheet, then track again.

## 5. Operations workflow

Suggested order statuses: `Order received → Confirmed → Preparing → Ready to ship → Shipped → Delivered`. `Cancelled` is a terminal status. Update tracking number/URL and status in the private `Orders` sheet.

Refund requests are **requests for review**, not automatic refunds. Review `SupportRequests`, verify the case, and record approval/rejection and actual payment/refund status using a controlled staff workflow. Never store card details in the sheet.

## Before real launch — required hardening

This is a starter, not a production-ready commerce platform. Before accepting real customer data:
- Add abuse prevention / rate limiting (Apps Script public endpoints can be spammed).
- Add email confirmation and staff notifications.
- Add an authenticated admin interface; never expose `setOrderStatusAdmin` or its token in the public frontend.
- Decide payment handling. Do not collect card numbers or passwords in this site; use a trusted payment provider if online payment is required.
- Add privacy policy, terms, refund policy, retention rules, and an appropriate contact channel.
- Validate shipping rates, product availability, promotions, and prices on the server.
- Consider Apps Script quotas and concurrency; use a lock around ID allocation / writes if order volume increases.
- Test duplicate submissions, malformed requests, cross-customer lookups, spreadsheet access, and all status transitions.

## Important implementation notes

- The browser sends the item name and quantity, but the Apps Script calculates price from a server-side price book.
- Tracking lookup returns only customer-safe order fields, not address or phone.
- `setOrderStatusAdmin()` is a server-side helper intended for restricted staff execution only. It is not exposed as a public `doPost` action.
- The demo mode generates temporary references and is not connected to Google Sheets.
