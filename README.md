# Faculty of Science — University of Yaoundé I

A responsive institutional website built with Next.js, TypeScript and Supabase. Public academic information and timetable lookup do not require student accounts. Administrators authenticate through Supabase Auth.

## Important project note

The supplied request references an “audit book” describing an existing system, but that audit document was not included in the workspace or attachments. This implementation is an original design and information architecture—not a clone of a legacy system. A verified audit book is needed for a gap analysis and to avoid repeating its specific documented failures. Institutional claims, contact details, department structure and sample dates in the UI must be confirmed by the Faculty before launch.

The University seal was supplied at `/home/lelica/Downloads/univ_Yaoundé_1.png`; copy the approved image into `public/` and update the brand component before production. The current mark is an original text emblem and does not claim to reproduce the official seal.

## Local development

Requirements: Node.js 20.9+ and npm.

1. `npm install`
2. Set `NEXT_PUBLIC_SUPABASE_URL` (the project API URL, `https://<project-ref>.supabase.co`), `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_SITE_URL` in `.env.local`.
3. Apply `supabase/migrations/202609280001_initial_schema.sql`, `supabase/migrations/202609280002_admin_usernames.sql`, and `supabase/migrations/202609280003_faculty_content_architecture.sql` to a dedicated Supabase project. Apply later migrations in numeric order as well: 004 adds department media fields; 005 optionally mirrors login metadata onto profiles. Login uses the protected `admin_login_identities` table created in migration 002, so migration 005 is not required to sign in.
4. Set either `SUPABASE_SECRET_KEY` (`sb_secret_...`) or the legacy `SUPABASE_SERVICE_ROLE_KEY` in the server environment for admin name lookup; never expose it to browser code or use a `NEXT_PUBLIC_` prefix.
5. Run `npm run dev` and open `http://localhost:3000`.

No service-role secret belongs in the browser or `NEXT_PUBLIC_*` variables. Keep Supabase environments separate for development and production.

## Supabase and security

- PostgreSQL tables and relationships are defined in `supabase/migrations/`.
- Public reads are limited to active/public/published content by RLS. Writes require an authenticated `admin_profiles` user.
- Student accounts are not part of the product. Timetable lookup is public.
- Create an administrator through Supabase Auth, then add the matching `auth.users.id` and display name to `public.admin_profiles` using the SQL editor as a trusted operator. Add the corresponding username and Auth email to `public.admin_login_identities` (see the second migration). The login form accepts that username and the Auth password; do not allow self-enrollment as an administrator. The third migration adds specialties and department/specialty links across programmes, research, news, events, gallery, documentation and timetables. Migration 005 optionally mirrors protected login usernames and emails onto admin profiles; the login action reads the protected identity mapping from migration 002.
- The migration creates a public `faculty-public` media bucket for public images and published documents; validate MIME types and file size in the UI and database. Do not store confidential material in this bucket. For stricter document privacy, use a private bucket and signed URLs.
- Review all RLS policies with the university security team before production. The service role bypasses RLS and must remain server-side only.

Tables include admin profiles, departments, programs, timetables and timetable entries, news, events, gallery items, documents, research projects, and editable faculty information.

## Current scope

The site includes department and specialty pages, linked public content detail pages, a public timetable lookup, and an authenticated admin workspace for faculty information, departments, specialties, programmes, research, news, events, gallery, documents, timetables and timetable entries. Admin content changes are written to Supabase; public pages read published content. When the database migration is not applied or Supabase is not configured, some pages use static department fallbacks or display empty published-content sections.

## Central site CMS setup

Apply `supabase/migrations/202609280006_central_site_cms.sql` after migrations `001` through `005`, then apply `supabase/migrations/202609280007_department_academic_content.sql` in the Supabase SQL Editor (or with the Supabase CLI). This adds scoped page sections, contacts, links, media records, gallery albums, academic years, downloadable timetable files, and document visibility. Existing rows are retained; the programs and timetables tables are made compatible with optional specialty/program links.

In `/admin/dashboard`, use **Faculty → Page sections** to add sections. Set the scope to Faculty, Department, or Specialty; use `home` for homepage sections, the exact department slug for a department page, the specialty slug for its page, or a public page slug such as `about`. Choose one of the named sections, provide the title and optional image/link, then enter section content as JSON. For example:

```json
{"eyebrow":"Study at the Faculty","description":"Explore academic pathways.","items":[{"title":"Biology","description":"Study life at every scale.","href":"/departments/biological-sciences"}]}
```

Contacts and links added at faculty scope appear in the site footer. Department and specialty contacts/links appear on their matching pages. Files uploaded in the dashboard are stored in the `faculty-public` Supabase Storage bucket; timetable files can be downloaded from the public timetable lookup.

## On-premise production: Linux VM + Nginx

Assumptions: Ubuntu 24.04 LTS VM managed by university IT, Node.js 20 LTS, DNS A/AAAA records pointed at the VM, and TLS permitted by network policy.

1. Provision a hardened VM, restrict inbound access to SSH (IT-approved source ranges), HTTP and HTTPS, enable OS security updates, and create a non-root deploy account.
2. Install Node.js 20 LTS from the university-approved package source and install Git, Nginx and Certbot (`sudo apt install nginx certbot python3-certbot-nginx`).
3. Clone the project into `/srv/uy1-faculty`, run `npm ci`, configure a root-owned environment file at `/etc/uy1-faculty.env` with mode `0600`, then run `npm run build`.
4. Set the public Supabase URL/anon key and canonical site URL in that environment file. Ensure Supabase network access is permitted from the VM and configure the project's Auth URL allow-list for the production domain.
5. Run the standalone Next output with systemd. Example unit at `/etc/systemd/system/uy1-faculty.service`:

   ```ini
   [Unit]
   Description=UY1 Faculty of Science website
   After=network.target

   [Service]
   Type=simple
   User=www-data
   Group=www-data
   WorkingDirectory=/srv/uy1-faculty
   EnvironmentFile=/etc/uy1-faculty.env
   Environment=NODE_ENV=production
   ExecStart=/usr/bin/node .next/standalone/server.js
   Restart=on-failure
   RestartSec=5
   NoNewPrivileges=true
   ProtectSystem=full
   ProtectHome=true
   PrivateTmp=true

   [Install]
   WantedBy=multi-user.target
   ```

   Confirm runtime ownership and that `public/` and `.next/static/` assets are present beside the standalone server or copied during deployment. Enable with `sudo systemctl daemon-reload && sudo systemctl enable --now uy1-faculty`.
6. Configure `/etc/nginx/sites-available/uy1-faculty`:

   ```nginx
   server {
       listen 80;
       server_name sciences.univ-yaounde1.cm;
       location / { proxy_pass http://127.0.0.1:3000; proxy_http_version 1.1; proxy_set_header Host $host; proxy_set_header X-Real-IP $remote_addr; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
   }
   ```

   Enable the site, test with `sudo nginx -t`, reload Nginx and verify DNS/network routing.
7. Issue a university-approved TLS certificate. Where public ACME is available, use `sudo certbot --nginx -d sciences.univ-yaounde1.cm`; otherwise install the institution's certificate and private key according to IT policy. Force HTTPS and verify renewal/expiry monitoring.
8. Validate the public pages, RLS access, admin sign-in, uploads and timetable lookup from a non-admin browser. Ensure direct access to draft content is denied.

### Updates and troubleshooting

Deploy updates during an approved maintenance window: pull the reviewed release, install locked dependencies, rebuild, copy the new standalone/static/public artifacts, then `sudo systemctl restart uy1-faculty`. Check `sudo systemctl status uy1-faculty`, `sudo journalctl -u uy1-faculty -n 100`, `/var/log/nginx/error.log`, DNS resolution, firewall access, system time and Supabase project status. Never paste secrets into logs or support tickets. Back up the database and document a tested restore process before launch.

The VM hosts the frontend only; Supabase provides database, Auth and Storage. This deployment does not require Vercel, Netlify or AWS.

The supplied University seal is installed as `public/uy1-seal.png` and used in the brand. The imagery on the homepage currently uses remote Unsplash demonstration photos; replace them with faculty-approved, locally stored photos before going live.
