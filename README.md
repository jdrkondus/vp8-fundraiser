# VP-8 Fighting Tigers — Fundraiser Order Form

A static order form for the VP-8 Tiger Support Group apparel fundraiser. Buyers
pick items/sizes/colors, enter their contact info, choose a payment method
(PayPal or Venmo), and submit. Every submission is recorded to a Google Sheet
and confirmed by email via a Google Apps Script backend.

## Project structure

- [index.html](index.html) — page markup and all client-side logic (cart,
  validation, order submission, payment deep links).
- [styles.css](styles.css) — styling.
- [VP8-Fundraiser-AppsScript.gs](VP8-Fundraiser-AppsScript.gs) — Google Apps
  Script Web App (`doPost`) that writes orders to a Google Sheet and sends
  confirmation emails via `MailApp`.
- `images/` — gallery photos shown at the top of the page.
- `CNAME` — custom domain config for GitHub Pages.

## Local development

Requires [Node.js](https://nodejs.org/) and npm.

```bash
npm install
npm run dev
```

This serves the site at `http://localhost:8080`. You can also press **F5** in
VS Code ("Launch Chrome against localhost") to start the dev server and open
Chrome automatically.

## Deployment

- **Frontend**: this is a static site deployed via GitHub Pages. Deploying is
  just `git push origin main`.
- **Backend**: [VP8-Fundraiser-AppsScript.gs](VP8-Fundraiser-AppsScript.gs) is
  deployed separately/manually by pasting it into the Apps Script editor at
  [script.google.com](https://script.google.com) and publishing a new Web App
  deployment. The deployed Web App URL is set as the `SCRIPT_URL` constant in
  [index.html](index.html).

## Order flow notes

- Buyer info (name, email, phone) is required before submission.
- Orders are recorded (Sheet row + emails) immediately at submit time, not
  after the buyer returns from PayPal/Venmo — this avoids losing orders when
  buyers pay in-app and never come back to the original tab.
- Payment links are rendered as real `<a href>` tap targets (not
  JS-triggered redirects) so mobile OSes correctly hand off to the
  Venmo/PayPal app with the amount prefilled.
