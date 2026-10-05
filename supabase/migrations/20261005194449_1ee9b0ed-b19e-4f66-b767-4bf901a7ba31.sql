create or replace function public.get_home_stats()
returns json
language sql
stable
security definer
set search_path = public
as $$
  select json_build_object(
    'week_orders', (select count(*) from orders where status <> 'cancelled' and created_at >= now() - interval '7 days'),
    'today_orders', (select count(*) from orders where status <> 'cancelled' and (created_at at time zone 'Asia/Jerusalem')::date = (now() at time zone 'Asia/Jerusalem')::date),
    'avg_rating', (select round(avg(rating)::numeric, 1) from orders where rating is not null),
    'rating_count', (select count(*) from orders where rating is not null),
    'min_price', (select min(price) from model_repair_prices where price > 0)
  );
$$;
grant execute on function public.get_home_stats() to anon, authenticated;