# Admin panel implementation checkpoint

## Required before deployment

1. In the existing Mumbai Supabase project, run **02_admin_publishing.sql** in SQL
   Editor. Do not rerun 01_initial_setup.sql. This adds an admin membership check
   and an atomic publish function which allowlists public fields.
2. Confirm the broker's Auth UUID is in antara_private.admin_users (already done
   during initial setup). Do not commit passwords or secret keys.
3. Preview admin.html on localhost, or deploy these files together after the SQL
   succeeds. Sign in with the broker's account privately.
4. Save a draft with test property details and 1–4 JPG/PNG/WebP photos. Check that
   an incognito visitor cannot see the draft. Publish, inspect properties.html,
   edit and republish, hide, and mark sold. Confirm owner notes never appear.
5. Test bad passwords, non-admin access, photo errors and narrow phone screens.
   Then remove/hide test listings before client handover.

## Current behavior

- Admin and catalogue use Supabase instead of localStorage inventory.
- Refresh tokens/access tokens live in sessionStorage for the current tab;
  logout clears the session. Database authorization remains authoritative.
- Save draft / changes keeps an existing status; Save & publish refreshes the
  public snapshot. Main title/type/locality plus one photo are the provisional
  minimum publication fields. Most other inputs remain optional.
- Core public data: title, category, city/locality, description, price/rate and
  main areas. Address, owner information and extended details remain private.
- Existing photo removal is immediate and asks for confirmation. New photos
  upload on save. Position 1 is the cover; the catalogue uses the lowest existing
  position first if that slot has been removed. Cover reordering is not yet built.
- A property/photo upload can partially succeed; successful data is kept and
  remaining photos can be selected again. Unexpected storage cleanup failures
  may leave orphan files; reconcile files against property_photos before deleting
  any orphan. Do not delete files by modifying storage.objects directly.
- Signed photo URLs expire after five minutes. Reload the page to refresh them.
- WhatsApp uses the currently configured number and includes the property ID and
  page link. It does not yet record buyer identity or confirm message delivery.

## Not part of this checkpoint

Public seller form still uses its old localStorage demo, and old contact forms
still use FormSubmit. Neither writes into the new admin tables. Replace these
before launch. Email/Sheets delivery workers, protected public intake, password
recovery UI, photo ordering, full category-dependent fields and end-to-end remote
admin verification remain pending. Confirm the real broker WhatsApp number and
email before launch; existing contact values were not changed here.

Checks completed locally: JavaScript syntax, six mocked API session/authorization
tests, desktop/phone login rendering, and live anonymous catalogue read showing
the empty-state response without console errors. No broker password was used;
authenticated database writes and the new SQL functions require the acceptance
test above. Code is not pushed or deployed by this checkpoint.
