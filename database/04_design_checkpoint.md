# Landing page and optional photos

Run `03_optional_photos.sql` in the same Mumbai project before publishing a
property without photos. It replaces the publish function, preserving the admin
check and public-field allowlist, and removes only the photo-count requirement.
An initial install should run 01, 02, then 03 in order. Existing users run only 03.

Admin uploads allow zero to four photos. Website listings with no photo use the
local architectural placeholder. Seller intake is still the existing prototype
and is not changed to Supabase in this checkpoint.

Homepage: cream/forest layout, CSS architectural model with pointer perspective,
scroll depth and image parallax, layered architectural frames, category search,
pause-motion control and reduced-motion support. The hero is an illustration;
category photographs are illustrative external Unsplash images, not inventory.
The homepage no longer loads the automatic enquiry popup or GSAP.

WhatsApp remains 918329788386. Email configuration and hardcoded email references
on existing public pages now use antaraproperties1@gmail.com. FormSubmit delivery
to the new recipient must be activated/tested separately; no test email was sent.

Verified: JS syntax, mobile overflow, desktop/mobile visual review, homepage
category search navigation and link destinations. Production SQL and a zero-photo
publish still need the user's database run and authenticated acceptance test.

Other public pages retain their earlier layouts, with Antara branding updates.
No automatic deployment or Git push was performed for this change.
