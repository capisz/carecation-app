drop policy if exists "Anyone can submit quote requests" on public.quote_requests;
create policy "Anyone can submit quote requests"
on public.quote_requests for insert
with check (
  plan_id is null
  or exists (
    select 1
    from public.care_plans
    where care_plans.id = quote_requests.plan_id
      and care_plans.user_id = auth.uid()
  )
);

drop policy if exists "Users can write affiliate clicks" on public.affiliate_clicks;
create policy "Users can write affiliate clicks"
on public.affiliate_clicks for insert
with check (
  user_id is null
  or (
    auth.uid() = user_id
    and (
      plan_id is null
      or exists (
        select 1
        from public.care_plans
        where care_plans.id = affiliate_clicks.plan_id
          and care_plans.user_id = auth.uid()
      )
    )
  )
);
