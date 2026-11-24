alter table public.portfolio_items
  add column if not exists social_wall_row smallint
    check (social_wall_row is null or social_wall_row between 1 and 3),
  add column if not exists social_wall_sort_order integer not null default 0
    check (social_wall_sort_order >= 0);

create index if not exists portfolio_social_wall_order_idx
  on public.portfolio_items (social_wall_row, social_wall_sort_order, sort_order)
  where status = 'published' and social_wall_row is not null;
