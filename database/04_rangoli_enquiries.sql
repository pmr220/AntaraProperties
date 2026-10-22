-- Run once in Supabase SQL Editor before deploying the Rangoli enquiry form.
-- Re-runnable. Uses the existing private leads table and admin RLS policies.
begin;
create or replace function public.submit_rangoli_enquiry(visitor_name text, visitor_phone text)
returns void
language plpgsql security definer set search_path = '' as $$
declare
  clean_name text := btrim(visitor_name);
  clean_phone text := regexp_replace(visitor_phone, '[^0-9]', '', 'g');
begin
  if clean_name is null or length(clean_name) < 2 or length(clean_name) > 100 then
    raise exception 'Please enter your name (2 to 100 characters).';
  end if;
  if length(clean_phone) = 12 and left(clean_phone, 2) = '91' then
    clean_phone := substring(clean_phone from 3);
  end if;
  if clean_phone is null or clean_phone !~ '^[6-9][0-9]{9}$' then
    raise exception 'Please enter a valid 10-digit Indian mobile number.';
  end if;
  -- Serialize repeated requests for the same phone, including concurrent retries.
  perform pg_advisory_xact_lock(hashtextextended('rangoli:' || clean_phone, 0));
  if exists (select 1 from public.leads where phone = clean_phone
    and source = 'rangoli_heights' and created_at > now() - interval '10 minutes') then
    return;
  end if;
  insert into public.leads(name, phone, property_reference, source, requirements, consent_at)
  values (clean_name, clean_phone, 'Rangoli Heights - 2 BHK', 'rangoli_heights',
    '{"project":"Rangoli Heights","unit_type":"2 BHK"}'::jsonb, now());
end;
$$;
revoke all on function public.submit_rangoli_enquiry(text,text) from public;
grant execute on function public.submit_rangoli_enquiry(text,text) to anon, authenticated;
-- Anonymous visitors can submit through this function, never read or edit leads.
notify pgrst, 'reload schema';
commit;
