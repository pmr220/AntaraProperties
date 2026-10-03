# NOVA ESTATES — 5-page real estate broker website

A premium, mobile-first static website template with:

- 5 pages: Home, Properties, Builder Project, About, Contact
- Auto-open lead capture popup on first visit per browser session
- Lead fields: name, phone, property type, preferred place, budget, timeline, message
- Email capture wired to `parthrathi7@gmail.com` using FormSubmit's AJAX endpoint
- WhatsApp integration for `+91 8329788386`
- Property categories: Flats, Plots, Farm Land, Raw Houses, Villas
- Dedicated builder project page
- 3D-feel UI: perspective hero card, 3D tilt, orbit rings, depth/parallax, reveal animation
- GSAP + ScrollTrigger progressive animation (with CSS fallback)
- Responsive layout for mobile/tablet/desktop

## 1. Customize the broker details
Open `config.js` and change:

- `brand`
- `city`
- `brokerName`
- `builderProject.name`
- `builderProject.location`
- `builderProject.starting`
- `builderProject.possession`
- `builderProject.rera`
- `email`
- `phone`
- `whatsapp`

The supplied email and WhatsApp number are already filled from the project brief.

## 2. Replace sample project details and images
The website currently uses stock/demo images and placeholder project data so the structure is complete.
For a real client launch, replace the image URLs in the HTML with the broker's:

- flat photos
- plot photos
- farm photos
- raw house photos
- villa photos
- actual builder project photos
- project logo / brochure / map

## 3. Email form setup
The form uses FormSubmit (`https://formsubmit.co/ajax/...`) so a separate backend is not required for this static site.
On first use, FormSubmit may send an activation email to the destination address. Complete that one-time activation if prompted.
For a production setup with stricter deliverability, replace this with a serverless endpoint (for example, Vercel Function + Resend) and keep the same form UI.

## 4. Deploy on Vercel
This is a static site; no build command is required.
- Upload the folder to GitHub and import it into Vercel, or drag the project into a Vercel-supported workflow.
- Framework preset can be `Other` / static.
- Output directory is the project root.

## 5. Important production checks
- Replace placeholder property prices with actual figures.
- Add the broker's legal business name and registration details as required.
- Add actual RERA/project information where applicable.
- Confirm image usage rights for all supplied property photos.
- Test WhatsApp on both iPhone and Android.
- Test the lead email on mobile before client handover.

## 6. Pages
- `index.html`
- `properties.html`
- `builder-project.html`
- `about.html`
- `contact.html`

## 7. Notes
No claim of live inventory, pricing, RERA status, or availability is made by this template. Sample values are clearly intended to be replaced with actual client data.

## Sell Your Property + Admin Workflow

New pages:
- `sell-property.html` — seller submits contact/property details and uploads 3–8 photos.
- `admin.html` — review pending submissions, Publish or Reject, and unpublish later.

Flow in this static package:
`Seller Form → Pending Submission → Admin Publish → Properties Page`

The current implementation stores submissions and compressed photos in browser `localStorage`, so it is suitable for a working prototype/demo in the same browser. For a real multi-user production website, replace the local storage layer with a secure backend + database + image storage (for example Supabase/Firebase/your own API) and real admin authentication.

Demo admin password is set in `config.js` (`adminPassword`). Do not treat client-side password protection as production security.
