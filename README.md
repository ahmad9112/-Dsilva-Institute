# Dsilva Institute Website

Responsive, single-page institute website created from the supplied course and contact information. The supplied banner images are **not** used on the website. The admission form includes personal, parent/guardian, address, course, batch and academic details.

## Run locally

1. Install Node.js 18 or newer.
2. Extract the ZIP and open this folder in VS Code / terminal.
3. Run `npm install`.
4. Copy `.env.example` to `.env` and configure the SMTP values (see below).
5. Run `npm start` and open `http://localhost:3000`.

## Configure admission email delivery

The form sends applications to `build.career@dsilvainstitute.com` and CCs `sz.dsilva@gmail.com` by default. The backend must be running and SMTP must be configured before emails can be sent.

For Gmail SMTP, use a dedicated sending mailbox, enable 2-Step Verification, create a Google App Password, and put that App Password in `SMTP_PASS` (not your regular Gmail password). Set `SMTP_USER` to the sending mailbox. If the institute has its own mailbox SMTP credentials, use the provider's SMTP host, port, and security settings instead.

Environment variables:

- `SMTP_HOST`: SMTP server hostname
- `SMTP_PORT`: typically `587` for STARTTLS or `465` for implicit TLS
- `SMTP_SECURE`: `false` for port 587, `true` for port 465
- `SMTP_USER`, `SMTP_PASS`: sender mailbox credentials / app password
- `ADMISSIONS_EMAIL`: primary admissions inbox
- `ADMISSIONS_CC`: optional CC inbox

**Important:** Email delivery is not live until valid SMTP credentials are added to `.env` and the Node server is deployed to a host that supports a persistent Node.js server. Do not put SMTP credentials in frontend JavaScript or commit `.env` to GitHub. This project includes `.env.example` only.

## Deploy

Deploy the Node app to a Node.js host such as Render, Railway, or a VPS and add the environment variables in that host's dashboard. A static-only host (for example, Vercel static output without the API/server) will not send admissions emails using this Express endpoint unless you adapt the API to that platform's serverless functions.
