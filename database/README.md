# Antara database setup

## Initial installation

Keep Supabase GitHub **Deploy to production** off for this manual workflow.
Open `01_initial_setup.sql`, copy the whole file into a new Supabase SQL Editor
query, and run as postgres in the intended Mumbai project. Run once, on the new
database. The transaction rolls back if any setup statement fails. Existing
objects with these names cause an error rather than being overwritten.

Successful output lists seven public tables with row_security = true. Check
Storage for property-photos and seller-photos; both must be private. No remote
execution has been performed by creating these local files.

## Admin account (next step)

Create the intended broker account through Supabase Authentication. Signing up
alone does NOT grant admin access. After verifying its email and UUID in the
dashboard, run the following in SQL Editor, replacing the placeholder UUID:

```sql
insert into antara_private.admin_users(user_id)
values ('REPLACE_WITH_AUTH_USER_UUID'::uuid);
```

Never expose the service_role/secret key or database password in browser code.
The private admin table cannot be changed by website users, including admins.

## Data model and privacy

- properties: full private master record, including owner contacts and notes.
  All business inputs are nullable so incomplete drafts can be saved.
- property_listings: deliberate public snapshot. Every column here is public.
  Public visibility is controlled by presence of a snapshot, not by the master
  status alone. The later publish backend must set status and snapshot together
  in a transaction, using an explicit allowlist. Never copy arbitrary JSON or
  owner information into display_details. Setting the master status to hidden,
  sold, rented, archived or draft removes the snapshot automatically.
- property_photos: up to four slots; position 1 is the cover. Metadata and file
  reads are public only while a snapshot exists. Use Storage APIs to manage
  actual files: deleting database rows does not remove stored file bytes.
- seller_submissions / seller_submission_photos: private incoming submissions;
  no automatic publication. Copy only reviewed data/photos into master records.
- leads: private buyer enquiries with consent and follow-up status.
- delivery_jobs: retry state for future email/Sheets integrations; no worker or
  automatic email/Sheets sending is installed by this script.

Optional properties.details vocabulary: dimensions, dimensions_unit, road_width,
road_width_unit, frontage, facing, access_road, water_source, electricity,
land_use, survey_number, ownership_type, title_notes, bedrooms, bathrooms,
balconies, floor_number, total_floors, parking_spaces, furnishing, property_age,
construction_stage, builder_name, project_name, unit_types, possession_date,
registration_number. Keep private details in this master JSON; public display
uses a separate allowlist. Use numeric values with explicit units where possible.

Seller property_details preserves submitted property fields independently of
reviewed inventory. Backend validation must enforce category-specific types,
lengths, consent, upload limits, rate limiting and spam protection before using
the service role. Email and Sheets jobs should be queued in the same transaction
as each accepted submission. Sheet writes must prevent formula injection and
deduplicate by lead/submission UUID. Do not send full private records to public
clients. Signed photo links may remain usable until expiry after unpublishing;
use short expiry and avoid publicly caching private images.

## Verification before connecting the website

1. Confirm all seven tables have RLS enabled and both buckets are private.
2. Anonymous requests may read only listing snapshots and published photos.
3. Anonymous and ordinary authenticated users cannot read owner/submission/lead
   records or upload/update/delete data. Ordinary users cannot become admins.
4. An explicitly allowlisted admin can edit records and upload images.
5. A fifth photo slot fails. Hiding a master removes its public listing/photo
   access. Draft/seller photo access remains private.

Run these integration checks using test records before release. SQL has not yet
been executed or permission-tested against the hosted project. Keep this setup
outside supabase/migrations until manual history is explicitly baselined; do not
also deploy the same SQL through GitHub migrations.

The existing demo website still uses localStorage and FormSubmit until replaced.
Back up database records and Storage files separately. No real client data or
credentials belong in GitHub.
