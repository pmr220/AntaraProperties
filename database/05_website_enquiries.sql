-- Run in the existing Supabase project's SQL Editor before deploying.
begin;
create or replace function public.submit_website_enquiry(
 request_id uuid, visitor_name text, visitor_phone text, enquiry_kind text,
 property_category text default null, visitor_city text default null,
 contact_preference text default null
) returns void language plpgsql security definer set search_path = '' as $$
declare
 n text := btrim(visitor_name);
 p text := regexp_replace(visitor_phone,'[^0-9]','','g');
 c text := coalesce(nullif(btrim(property_category),''),'Plot');
 city text := coalesce(nullif(btrim(visitor_city),''),'Amravati');
 pref text := coalesce(nullif(btrim(contact_preference),''),'Phone Call');
begin
 if request_id is null or n is null or length(n) not between 2 and 100 then
  raise exception 'Please enter your name (2 to 100 characters).';
 end if;
 if length(p)=12 and left(p,2)='91' then p:=substring(p from 3); end if;
 if p is null or p !~ '^[6-9][0-9]{9}$' then raise exception 'Please enter a valid mobile number.'; end if;
 if enquiry_kind is null or enquiry_kind not in ('project','property','seller') then raise exception 'Invalid enquiry type.'; end if;
 if c not in ('Plot','Flat','Row House','Shop','Farm','Office Space','Villa','Independent House','Raw / Unfinished House','Commercial','Other') then raise exception 'Invalid category.'; end if;
 if length(city)>120 or pref not in ('Phone Call','WhatsApp') then raise exception 'Invalid contact details.'; end if;
 -- A client-generated request ID makes retries safe without exposing saved records.
 perform pg_advisory_xact_lock(hashtextextended(request_id::text,0));
 if exists(select 1 from public.leads where id=request_id)
 or exists(select 1 from public.seller_submissions where id=request_id) then return; end if;
 if enquiry_kind='seller' then
  insert into public.seller_submissions(id,owner_name,owner_phone,category,property_details,consent_at)
  values(request_id,n,p,c,jsonb_build_object('city',city,'contact_preference',pref,'source','Sell Your Property'),now());
 else
  insert into public.leads(id,name,phone,property_reference,source,requirements,consent_at)
  values(request_id,n,p,case when enquiry_kind='project' then 'Rangoli Heights - 2 BHK' else c || ' enquiry' end,
   case when enquiry_kind='project' then 'homepage_rangoli' else 'homepage_property' end,
   jsonb_build_object('category',case when enquiry_kind='project' then '2 BHK' else c end),now());
 end if;
end;
$$;
revoke all on function public.submit_website_enquiry(uuid,text,text,text,text,text,text) from public;
grant execute on function public.submit_website_enquiry(uuid,text,text,text,text,text,text) to anon,authenticated;
-- Existing RLS continues to allow only admins to read/change submitted records.
notify pgrst,'reload schema';
commit;
