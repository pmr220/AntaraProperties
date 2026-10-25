# Antara Properties search setup

Primary search domain: https://antaraproperties.in

## Implemented

- Unique titles/descriptions for six public pages, static canonical tags, Open Graph sharing metadata.
- RealEstateAgent, WebSite, WebPage and inner-page breadcrumb JSON-LD using the site's real contact details. No fabricated ratings, opening hours, registrations, prices or awards.
- Contact-page FAQs covering local buying/selling, flats, plots, farms, commercial properties and Rangoli Heights. “Best real estate company” appears as a customer question about selection, not an independently verified ranking claim.
- Sitemap contains public pages only. Admin retains noindex,nofollow; it is not in the sitemap. Robots allows crawling so search engines can see that directive. Robots rules are not access control.
- Existing lightweight responsive layout and image dimensions retained. No hidden keywords or meta-keywords tags.

To regenerate after changing domain or metadata: `python tools/update-seo.py --origin https://antaraproperties.in`.

## Owner setup after deployment

1. Confirm Vercel serves antaraproperties.in over HTTPS and redirects www to the chosen apex domain. These domain settings have not been changed by this SEO task.
2. Open Google Search Console, add a Domain property for antaraproperties.in, and add its exact TXT verification record at the DNS provider. Do not remove existing DNS/email records.
3. After ownership verification, submit https://antaraproperties.in/sitemap.xml. Inspect the homepage, properties page, Rangoli page and contact page; request indexing once for each. Check actual rendered listings in URL Inspection because the catalogue loads from Supabase.
4. Validate the deployed business structured data using Google's Rich Results Test and inspect the chosen canonical in Search Console. Static parsing tests do not confirm Google's eligibility or indexing.
5. Claim/verify the real Antara Properties Google Business Profile. Use the real business name, actual office address, phone and domain. Add accurate business hours, appropriate categories, office photos and services. Do not add keywords to the business name unless they are part of its real name.
6. Ask real customers for honest reviews without incentives or scripted keyword stuffing. Keep contact information consistent across legitimate local listings and profiles.
7. Monitor Search Console impressions, queries, clicks and indexing monthly. Keep property availability and contact details current. Ranking is not guaranteed.

## Follow-up improvements requiring separate implementation or information

- Individual property URLs with HTML-rendered listing details: the present catalogue is dynamic and uses hash links, not separate indexable property pages. This needs a publishing/rendering design tied to the database; it is not solved by metadata alone.
- Marathi content can help local visitors if written/reviewed accurately. No auto-generated locality doorway pages.
- Real-world mobile performance testing and optimization based on measured results.
- Search Console and Business Profile ownership verification require the owner's account. No ownership token or Google profile was invented or registered.

FAQ content is for visitors and topical relevance; no special FAQ search-result appearance is promised. Metadata, FAQ and structured data do not guarantee first-page or first-place rankings.
