-- Run after 01_initial_setup.sql in the Mumbai project's SQL Editor.
-- Safe to run again. No records are deleted by installing these functions.
begin;
create or replace function public.antara_admin_session() returns boolean
language sql stable security invoker set search_path = '' as $$
  select antara_private.is_admin();
$$;
revoke all on function public.antara_admin_session() from public, anon;
grant execute on function public.antara_admin_session() to authenticated;

create or replace function public.antara_publish_property(target_id uuid) returns void
language plpgsql security definer set search_path = '' as $$
declare p public.properties;
begin
  if not antara_private.is_admin() then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  select * into p from public.properties where id = target_id for update;
  if not found then raise exception 'Property not found'; end if;
  if nullif(trim(p.title),'') is null or p.category is null
     or nullif(trim(p.locality),'') is null then
    raise exception 'Add a title, category and locality before publishing';
  end if;
  if not exists (select 1 from public.property_photos where property_id = target_id) then
    raise exception 'Add at least one photo before publishing';
  end if;
  update public.properties set status = 'published' where id = target_id;
  insert into public.property_listings
    (property_id,reference,title,category,city,locality,description,asking_price,rate,rate_unit,display_details)
  values (p.id,p.reference,p.title,p.category,p.city,p.locality,p.description,p.asking_price,p.rate,p.rate_unit,
    jsonb_strip_nulls(jsonb_build_object(
      'land_area',p.land_area,'land_area_unit',p.land_area_unit,
      'carpet_area',p.carpet_area,'carpet_area_unit',p.carpet_area_unit,
      'built_up_area',p.built_up_area,'built_up_area_unit',p.built_up_area_unit,
      'transaction_type',p.transaction_type)))
  on conflict (property_id) do update set
    reference=excluded.reference,title=excluded.title,category=excluded.category,
    city=excluded.city,locality=excluded.locality,description=excluded.description,
    asking_price=excluded.asking_price,rate=excluded.rate,rate_unit=excluded.rate_unit,
    display_details=excluded.display_details;
end;
$$;
revoke all on function public.antara_publish_property(uuid) from public, anon;
grant execute on function public.antara_publish_property(uuid) to authenticated;
commit;
