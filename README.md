# KALA MAIA — Existing Google Sheets read-only lookup

This starter connects the GitHub Pages frontend to the existing `DB SEP26` worksheet and only reads records. It does not write to, modify, or replace spreadsheet data.

## Included
- Responsive KALA MAIA website
- Customer ID lookup
- Apps Script read-only API for `DB SEP26`
- Limited output: title, author, format, quantity, and unit price
- Demo mode until API URL is configured

## Deploy Apps Script
1. Open the existing Google Sheet.
2. Choose Extensions → Apps Script.
3. Paste `apps-script/Code.gs` into the editor and save.
4. In Project Settings → Script properties, set `SPREADSHEET_ID` to the existing spreadsheet ID:
   `188-HcXMJtjo8AQL_ELk_QMatXXv0pRN6ZE27UJXz1SB8`
5. Deploy → New deployment → Web app. Execute as **Me**. Choose access appropriate for your intended customer flow; public access means anyone can call the endpoint.
6. Copy the `/exec` URL.

The code expects headers on row 2 and data starting on row 3, based on the supplied screenshot. It only reads the worksheet named `DB SEP26`.

## Connect GitHub Pages
Edit `app.js`:
```js
const CONFIG = {
  apiUrl: "https://script.google.com/macros/s/AKfycbwX_k8uad64KW3JVSbgox0PXTfYdKXKMm-0wil9Ag67W4dQDyeFmrjoPltumxApitLq/exec",
  currency: "IDR",
  demoMode: false
};
```
Commit changes to GitHub. Test lookup using a known customer ID.

## Privacy
Customer-ID-only lookup is not strong identity verification. The API deliberately excludes DP, OCT, and Note, but a person who knows a customer ID can still see book titles, authors, formats, quantities, and unit prices. Use only if that disclosure is acceptable; add a second verification factor before showing sensitive customer or payment details.
