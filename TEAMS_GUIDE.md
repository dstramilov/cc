# Microsoft Teams App Deployment Guide

This guide explains how to package and deploy the "Customer Central" application to Microsoft Teams.

## Prerequisites
1.  **Public Hosting**: Your Next.js app must be deployed to a public URL (e.g., Vercel, Azure Static Web Apps) with HTTPS. Teams cannot access `localhost` without a tunnel (like ngrok).
2.  **Microsoft 365 Account**: You need an account with permissions to upload custom apps to Teams.

## Step 0: Create Partner Center Account
To publish apps to the Microsoft Teams Store, you need a verified **Microsoft Partner Center** account.

1.  **Go to Enrollment Page**: Visit [Partner Center Enrollment](https://partner.microsoft.com/dashboard/account/v3/enrollment/introduction/partnership).
2.  **Sign In**: Use a work account (recommended) or create a new one.
    - **Individual**: For independent developers.
    - **Company**: For businesses (requires DUNS number and business verification).
3.  **Complete Verification**:
    - **Email Verification**: Confirm ownership of your email domain.
    - **Business Verification**: Submit documents if requested (for Company accounts).
4.  **Pay Registration Fee**: There may be a one-time registration fee depending on your program selection.

## Step 1: Update Manifest
Open `public/teams/manifest.json` and replace the placeholder URLs with your actual deployed URL:
- Replace all instances of `https://YOUR_PUBLIC_URL` with your actual app URL (e.g., `https://customer-central.vercel.app`).
- Ensure `validDomains` includes your domain (e.g., `customer-central.vercel.app`).

## Step 2: Create the App Package
The Teams app package is simply a `.zip` file containing three files:
1.  `manifest.json`
2.  `color.png` (App icon)
3.  `outline.png` (Transparent icon)

**To create the package:**
1.  Navigate to the `public/teams` folder.
2.  Select all three files (`manifest.json`, `color.png`, `outline.png`).
3.  Right-click -> "Compress to ZIP file" (or "Send to -> Compressed (zipped) folder").
4.  Name the file `customer-central-teams.zip`.

## Step 3: Deploy to Teams
There are two ways to deploy:

### Option A: Sideloading (For Testing)
1.  Open Microsoft Teams.
2.  Go to **Apps** (in the sidebar).
3.  Click **Manage your apps** -> **Upload an app**.
4.  Select **Upload a custom app**.
5.  Choose your `customer-central-teams.zip` file.
6.  Click **Add** to install it for yourself.

### Option B: Developer Portal (For Distribution)
1.  Go to the [Developer Portal for Teams](https://dev.teams.microsoft.com).
2.  Click **Apps** -> **Import app**.
3.  Select your `customer-central-teams.zip` file.
4.  From here, you can:
    - Preview the app.
    - Publish to your organization's catalog.
    - Submit to the Microsoft Commercial Marketplace (Partner Center account required).

## Troubleshooting
- **Manifest Error**: Use the "App Validation" tool in the Developer Portal to check for syntax errors.
- **"Refused to connect"**: Ensure your app allows being embedded in an iframe. You may need to adjust `Content-Security-Policy` headers in your Next.js config if strict security is enabled.
