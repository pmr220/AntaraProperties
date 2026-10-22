# Rangoli Heights: review and activation

Reviewed all eight pages of the supplied Rangoli brochure on 22 October 2026.

## Content review

1. Cover: Rangoli Heights branding and lifestyle image.
2. Overview: residential lifestyle positioning; no measurable area or price information.
3. Proposed elevation: Rangoli Heights at Shamnagar, Amravati; architect Sameer Kulkarni. Displayed as an artist's impression, not a construction photograph.
4. Plans: two 2 BHK configurations, a 4 BHK configuration, ground-floor and basement parking. Total carpet/built-up areas are not supplied. Small room dimensions remain in the source drawings rather than being guessed or summed.
5. Schematic location map: Kathora Road, Gurudev Nagar, Narayan Nagar Road and routes towards Kathora Naka/Pote Patil Chowk. No verified GPS coordinates supplied.
6. Features: common-area solar and automated lights, modular kitchen platform, UPVC windows, POP plaster, video doorbell, decorated lobbies, premium bath fittings, CCTV and dedicated parking. Rooftop courtyard, solar and toilet. Three advertised 10% partner discounts are labelled subject to current eligibility/terms confirmation.
7. Specifications: structure, doors, kitchen, paint, parking, solar, flooring, windows, electrical, plumbing and tanks transcribed into the page.
8. Developer: Rangoli Builders & Developers. Site: Shyam Nagar, Kathora Road, Amravati 444605. Developer office: Rangoli Lawns, Kathora Road. Brochure email: rangolibuilders8787@gmail.com. Booking numbers: 8329788386, 9665093697, 9890098787. Architect Sameer Kulkarni; RCC consultant Nilesh Doshi; legal advisor Swapnil S. Jaju. Brochure disclaimer retained in condensed form.

The website routes enquiries to Antara's existing admin and uses Antara's existing contact number. Developer office/contact information is distinct from Antara's office. The page does not claim a price, total area, possession date, registration number, approved status or current stock count; these were not provided. The 2 BHK callback is the primary action; 4 BHK drawings remain available as supplementary brochure content.

## Activate database capture

1. Open the existing Supabase project's SQL Editor.
2. Run `database/04_rangoli_enquiries.sql` in full. It is re-runnable.
3. Deploy the changed website files and `assets/rangoli/` together.
4. Submit one clearly labelled test enquiry with a phone number you control.
5. Sign into admin, open Enquiries, check the Rangoli Heights - 2 BHK entry, mark it contacted, refresh to verify persistence, then delete the test entry and verify it is gone.

No admin password, service key or new environment variable is required. The migration adds only a narrowly scoped submission function, using existing leads columns and existing admin-only RLS policies. Anonymous users cannot read, modify or delete leads. New records have status `new`; project/source and consent timestamp are assigned by the database. Names and Indian mobile numbers are validated both in the form and database. Repeat submissions for the same number/project within ten minutes are coalesced; no existing lead data is returned.

The repeat guard is not a full bot defence or per-IP rate limiter. Add a server-side CAPTCHA/rate limiter if spam becomes a problem. Google Sheets/email delivery is not part of this change. Database migration and real authenticated end-to-end verification require the project owner session; do not report these as completed from local mock tests.

Delete permanently removes the selected lead and any related delivery jobs via the existing foreign-key cascade. The UI asks for confirmation first.
