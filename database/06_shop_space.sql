-- Add Shop Space without relabelling existing house records as shops.
begin;
alter table public.properties drop constraint if exists properties_category_check;
alter table public.properties add constraint properties_category_check
check (category in ('plot','farm','row_house','unfinished_house','shop_space','flat',
 'villa','independent_house','commercial','builder_project','other'));
notify pgrst,'reload schema';
commit;
