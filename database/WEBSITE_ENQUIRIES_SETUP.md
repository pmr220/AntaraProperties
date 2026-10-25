# Homepage and seller enquiries

1. In the existing Supabase project, run `05_website_enquiries.sql` in SQL Editor.
2. Commit/push the changed site files and wait for deployment.
3. Test homepage Rangoli (name/phone), homepage buy/invest (name/phone/category), and Sell Your Property (no photos).
4. Verify the first two in Admin > Enquiries > Buyer enquiries; verify sellers in Seller submissions. Check email notifications at antaraproperties1@gmail.com, including spam and any FormSubmit activation message.

All three save privately to Supabase before requesting an email notification. A failed database save retains the form and does not send email. Email failure after a successful database save confirms that the enquiry was received in admin; it does not ask the visitor to submit it again. Email is best-effort from the browser, not a guaranteed background delivery queue. Closing the page after saving may prevent notification, but the admin record remains. FormSubmit activation and live inbox delivery need to be verified by the mailbox owner.

The narrowly scoped RPC validates name, Indian mobile, category and contact preference. It sets consent time and source server-side. Existing admin-only RLS protects read/update/delete access. No public table-read or photo-upload permission is added. Repeated attempts using the same request ID do not create duplicate records; this applies to retries in the current page session. This is not an anti-spam rate limiter.

Seller photos and local-browser-only seller saving have been removed. Historical browser drafts are not automatically uploaded. Existing Rangoli Builder Projects enquiries continue using their previous RPC.

Live migration execution and real database/email checks are not covered by local mocked tests.
