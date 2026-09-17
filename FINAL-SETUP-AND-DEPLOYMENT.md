# Raveena & Roshana Wedding Invitation — Final Setup & Deployment Guide

This version includes the complete public invitation, personalised guest links, RSVP, WhatsApp sharing, Super Admin / Client Admin permissions, admin dashboard, invitation management, RSVP management, wedding settings, gallery uploads, account/password management, Supabase storage/database integration and Vercel deployment readiness.

## 1. Keep your existing `.env.local`

Your project root must contain:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxx
SUPABASE_SECRET_KEY=sb_secret_xxxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never commit `.env.local` and never share `SUPABASE_SECRET_KEY`.

## 2. Run the FINAL database migration

You already ran the original schema and the Super Admin upgrade. Now run only this final migration:

`supabase/migrations/03-final-platform.sql`

Navigation:

1. Open https://supabase.com/dashboard
2. Open project `raveena-roshana-wedding`
3. Left sidebar -> SQL Editor
4. Click `New query`
5. Open `supabase/migrations/03-final-platform.sql` in VS Code
6. Copy all SQL
7. Paste into Supabase SQL Editor
8. Click `Run`

This adds/updates:

- wedding settings fields
- gallery image table
- Supabase Storage bucket `wedding-media`
- default programme/story/contact/marketing settings
- wedding-scoped settings indexes

It does NOT remove your existing invitations, RSVPs, Super Admin or Client Admin data.

## 3. Install dependencies and run locally

Open Command Prompt / PowerShell in the project folder:

```bash
npm install
npm run dev
```

Open:

- Public invitation: http://localhost:3000
- Gallery: http://localhost:3000/gallery
- Admin login: http://localhost:3000/admin/login
- Admin dashboard: http://localhost:3000/admin/dashboard
- Invitations: http://localhost:3000/admin/invitations
- RSVPs: http://localhost:3000/admin/rsvps
- Gallery management: http://localhost:3000/admin/gallery
- Wedding settings: http://localhost:3000/admin/settings
- My account: http://localhost:3000/admin/account
- Super Admin management: http://localhost:3000/admin/admins

## 4. Add the background music

The music file is not included in the ZIP. Put your own file here:

`public/music/datha-dara-instrumental.mp3`

The public invitation, gallery and RSVP pages share one global music player. Normal Next.js navigation keeps the same music session alive. Browser autoplay rules may still require the guest's first tap before audible music is allowed.

## 5. Create the Client Admin

Log in as your Super Admin account and open:

`http://localhost:3000/admin/admins`

Use **Create Client Admin**:

- Full name
- Email
- Temporary password
- Assign wedding: Raveena & Roshana

You can use the Generate button for a strong temporary password.

The client can then sign in at:

`http://localhost:3000/admin/login`

Client Admin can manage:

- invitations
- WhatsApp sharing
- RSVPs
- gallery
- wedding settings
- their own account/password

Client Admin cannot access `/admin/admins` or create/disable other admins.

## 6. Create and send personalised invitations

Open:

`/admin/invitations`

Enter:

- invitee display name
- type: single / couple / family / custom
- WhatsApp number

The system creates a unique URL such as:

`/invite/HAS_UNIQUE_TOKEN`

It also prepares a premium WhatsApp message. The message is editable before sharing.

When **Open WhatsApp** is clicked, WhatsApp opens for the saved number with the message ready. WhatsApp still requires the sender to press Send.

## 7. RSVP workflow

The guest opens their personal invitation and presses `RSVP Now`.

The RSVP form contains:

- invitation name (read-only)
- attending / unable to attend
- optional message

There is no guest-count field.

Responses appear in:

`/admin/rsvps`

Admin can:

- search guests
- filter attending / not attending
- change attendance status
- remove a response

If the guest submits again, the existing RSVP is updated instead of creating a duplicate response.

## 8. Wedding settings

Open:

`/admin/settings`

You can edit without changing source code:

- bride/groom names
- wedding date
- RSVP deadline
- venue
- ballroom
- dress code
- programme
- love story paragraphs
- couple contact numbers
- developer marketing footer

The public invitation reads these values from Supabase on the next page load.

## 9. Gallery management

Open:

`/admin/gallery`

Upload JPG, PNG or WebP images up to 10 MB.

Uploaded files are saved in Supabase Storage bucket:

`wedding-media`

Database metadata is stored in:

`public.gallery_images`

Uploaded photos appear in the public `/gallery` page. The original five bundled photographs remain available as fallback images.

## 10. Where to see data in Supabase

Supabase Dashboard -> Table Editor:

- `profiles` — Super Admin / Client Admin roles
- `weddings` — wedding project
- `wedding_admins` — which admin is assigned to which wedding
- `invitations` — guest links, names and WhatsApp numbers
- `rsvps` — attendance and messages
- `wedding_settings` — programme/story/contacts/marketing JSON
- `gallery_images` — uploaded gallery photo metadata

Supabase Dashboard -> Authentication -> Users:

- actual login accounts and Auth user IDs

Supabase Dashboard -> Storage -> `wedding-media`:

- uploaded image files

## 11. Production deployment — FREE Vercel

Websites:

- GitHub: https://github.com/
- Vercel: https://vercel.com/
- Supabase: https://supabase.com/dashboard

### A. Create a GitHub repository

Create a private repository, then push the project. `.env.local` is already ignored by `.gitignore`.

### B. Import into Vercel

1. Open https://vercel.com/
2. Add New -> Project
3. Import your GitHub repository
4. Framework should be detected as Next.js
5. Add these Environment Variables in Vercel:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
NEXT_PUBLIC_SITE_URL
```

For the first deployment, `NEXT_PUBLIC_SITE_URL` can temporarily be your expected Vercel URL. After Vercel gives you the exact production URL, update it and redeploy.

Example:

`NEXT_PUBLIC_SITE_URL=https://raveena-roshana-wedding.vercel.app`

### C. Update Supabase Auth URLs

Supabase -> Authentication -> URL Configuration

Set production Site URL to your actual Vercel URL.

Keep/add redirect URLs:

```text
http://localhost:3000/**
https://YOUR-VERCEL-DOMAIN.vercel.app/**
```

### D. Redeploy

After environment variables and Auth URLs are correct, redeploy the Vercel project.

## 12. Final production test checklist

Test these from a phone and desktop:

- opening animation
- falling leaves across the public pages
- music starts when browser allows it
- music remains through Invitation -> Gallery -> RSVP navigation
- all photos align correctly
- personal invite displays the invitee name only in the welcome area
- RSVP saves to Supabase
- Super Admin login
- Client Admin login
- Client Admin cannot open `/admin/admins`
- invitation create/edit/delete
- WhatsApp message and number
- RSVP dashboard
- gallery upload/delete
- wedding settings changes appear publicly
- account password change
- mobile admin sidebar

## 13. Professional marketing footer

The invitation now uses this positioning at the bottom so it does not compete with the couple's content:

**Digital Wedding Experience by Imesh Peiris**

Beautifully crafted wedding invitation websites designed to make your celebration memorable from the very first impression.

Personalised guest invitations • Interactive RSVP • Elegant galleries • Seamless digital sharing

Bookings & Enquiries: 0767550215 · t.i.tpeeriya@gmail.com

This content can also be edited from `/admin/settings`.
