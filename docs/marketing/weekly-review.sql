-- Poocho weekly review: the playbook's core user-count queries, written for
-- Poocho's schema (profiles, questions, answers). Run them in the Neon SQL
-- editor on the production branch, or open /admin, which shows the same numbers.

-- Total and new hosts
select count(*) as total_hosts,
       count(*) filter (where created_at > now() - interval '1 day') as new_today,
       count(*) filter (where created_at > now() - interval '7 days') as new_this_week
from profiles;

-- Weekly active hosts (answered at least once in 7 days) and the north star
select count(distinct host_id) as weekly_active_hosts,
       count(*) as answers_this_week
from answers
where answered_at > now() - interval '7 days';

-- Questions and filter rate this week
select count(*) as questions,
       round(100.0 * avg((status = 'filtered')::int), 1) as filtered_pct
from questions
where created_at > now() - interval '7 days';

-- Activation: hosts who joined 2 to 30 days ago and got an unfiltered question within 48 hours
select count(*) as cohort,
       round(100.0 * avg((exists (
         select 1 from questions q
         where q.host_id = p.id
           and q.status <> 'filtered'
           and q.created_at <= p.created_at + interval '48 hours'
       ))::int), 1) as activation_pct
from profiles p
where p.created_at > now() - interval '30 days'
  and p.created_at <= now() - interval '2 days';

-- Hosts most targeted by filtered questions this week (look closer if the overall rate passes 15%)
select p.handle, count(*) as filtered_this_week
from questions q
join profiles p on p.id = q.host_id
where q.status = 'filtered' and q.created_at > now() - interval '7 days'
group by p.handle
order by filtered_this_week desc
limit 10;
