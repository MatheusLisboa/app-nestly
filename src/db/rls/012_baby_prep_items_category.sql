-- Nestly — expand prep categories + allow re-seed of suggestions
-- Run after 011_baby_refine.sql

do $$ begin
  alter type public.baby_prep_category add value if not exists 'items';
exception
  when duplicate_object then null;
  when others then
    -- PG < 15 may not support IF NOT EXISTS on ADD VALUE
    begin
      alter type public.baby_prep_category add value 'items';
    exception when duplicate_object then null;
    end;
end $$;
