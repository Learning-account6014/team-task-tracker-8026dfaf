# Free Online Storage + Multi-Manager Task System

## Part 1: Free Hosting & Storage (Student-Friendly)

**Recommended: Lovable Cloud** (powered by Supabase under the hood)
- Every workspace gets **$25 free Cloud balance + $1 free AI balance every month**
- For a small team app (10 users, low traffic), this is effectively free
- Zero setup: no separate account, no credit card to start
- Includes: PostgreSQL database, auth, file storage, serverless functions
- App is already deployable for free at `*.lovable.app`

**Alternatives if you want to stay outside Lovable:**
- Supabase Free Tier (direct): 500 MB DB, 50k monthly active users, 1 GB storage — free forever, no card required. Good for students.
- Neon / Turso / PlanetScale free tiers — DB only, you'd still need hosting.

**Recommendation:** Use Lovable Cloud. It's the simplest path and fits free usage for your size.

## Part 2: New Role Model

Replace the current `admin / employee` model with:

- **admin** — bootstraps the system, creates manager and employee accounts directly (sets password, no email verification)
- **manager** — can be assigned tasks; can assign tasks to employees AND to other managers
- **employee** — receives tasks; can see which manager assigned each task

Authentication stays password-only (no Google/email verification), created by admin.

## Part 3: Data Model

```text
profiles
  id (uuid, FK auth.users)
  name
  role: 'admin' | 'manager' | 'employee'

user_roles                  -- security-critical, separate table
  user_id, role

tasks
  id
  title, description
  status: todo | in_progress | done
  priority: low | medium | high
  assigned_by   -> profiles.id   (the manager/admin who created it)
  assigned_to   -> profiles.id   (employee OR manager)
  created_at, updated_at

task_comments
  id, task_id, user_id, text, created_at
```

Key rule: `assigned_to` can reference any profile (manager or employee), enabling manager→manager assignment.

## Part 4: Permissions (RLS)

- **admin**: full access; can create users (manager/employee), see everything
- **manager**: can create tasks, assign to any employee or manager, see tasks they assigned + tasks assigned to them
- **employee**: can see only tasks assigned to them; can update status + comment; sees `assigned_by` (their manager)

## Part 5: UI Changes

- **Login**: unchanged (email + password)
- **Admin dashboard**: Manage Team dialog gets a role selector (manager / employee) when adding a user
- **Manager dashboard**:
  - "My Assigned Tasks" (tasks given to me)
  - "Tasks I Created" (tasks I assigned to others)
  - Create Task dialog: assignee dropdown shows both managers and employees
- **Employee dashboard**:
  - "My Tasks" with a visible "Assigned by: {manager name}" field on each task

## Part 6: Migration Steps

1. Enable Lovable Cloud
2. Create tables (`profiles`, `user_roles`, `tasks`, `task_comments`) + RLS policies + `has_role()` security-definer function
3. Replace `src/lib/store.ts` (localStorage) with Supabase client calls
4. Update `useAuth` to use Supabase auth
5. Extend Manage Team dialog with role selector
6. Update Create Task dialog to allow assigning to managers
7. Update Dashboard views per role
8. Seed an initial admin account

## Technical Notes

- Roles live in a separate `user_roles` table (never on profiles) to prevent privilege escalation
- A SECURITY DEFINER `has_role(user_id, role)` function is used in all RLS policies
- Admin creates users via an edge function using the service role key (so no email verification is needed)

## Open Questions

1. Should a manager see **all** tasks in the company, or only tasks they created / are assigned to? (Plan currently assumes the latter.)
2. Should employees be able to comment on tasks, or only update status?
3. Do you want a single admin account, or multiple admins?
