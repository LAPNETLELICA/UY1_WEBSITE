# Faculty Image Distribution Design

## Purpose

Place the supplied UY1 photographs throughout the Faculty of Science website so that department pages feel specific to UY1 while preserving the current purple, cream, gold and white visual system. No department, programme, speciality, administrator, or existing content record will be deleted or renamed.

## Asset strategy

The archive images will be copied into `public/images/faculty/` with readable, stable filenames. The website will reference local paths such as `/images/faculty/computer-science-it.png`; no passwords, private data, or Supabase records are included in the assets.

Local image mappings are fallbacks only. A department image selected later in the administration dashboard (`image_path` or `head_image_path`) continues to take precedence.

## Portrait assignments

| Image | Department leadership placement |
| --- | --- |
| `HODBIOCHM.png` | Biochemistry |
| `HODBIOPHY.png` | Biology and Physiology leadership content; it does not delete or merge Animal Biology and Physiology or Plant Biology and Physiology |
| `HODICHM.png` | Inorganic Chemistry |
| `hodcom.png` | Computer Science |
| `HODMATH.png` | Mathematics |
| `HODPHY.png` | Physics |
| `HODRE.png` | Earth and Universe Science |
| `RECTEUR.png` | Faculty / University leadership only, never a department head |

Portraits are not used as full-page backgrounds. The department page leadership card gives the portrait a fixed visual area and a wider text column for the person’s name, office title, and multi-paragraph description. On small screens it stacks image before text without clipping either content.

## Department and faculty visual placement

- `edb7fdd738804800b060c69e59d1b6d8.png` is the principal Computer Science / IT department image. It is used as that department’s banner/card fallback and must not be reused as a generic faculty image.
- The computer-lab, robotics, programming and network-room images reinforce Computer Science and can appear in its gallery or promotional cards.
- Chemistry practical, laboratory, glassware, and research-team images reinforce Biochemistry, Inorganic Chemistry, and Organic Chemistry.
- Lecture theatre and classroom images support teaching, programmes, timetables, and faculty-wide learning sections.
- Campus gate, buildings, auditorium, and community images support the Faculty, About, Departments index, and contact-page backgrounds or banners.
- Only wide landscape images are used as CSS backgrounds. They receive the site’s existing dark-purple gradient overlay so text remains readable and their colour treatment feels consistent with the rest of the website.
- Portrait, square, and tall images use content-card or gallery placement with `object-fit: cover`; they are never stretched to fill a banner.

## Rendering rules

1. Department detail page: dashboard-selected image first; otherwise use the matching local departmental fallback.
2. Department head card: dashboard-selected portrait first; otherwise use the matching local portrait fallback when there is a known mapping.
3. The department page shows the leadership card whenever a department has a head name or a mapped portrait, leaving room for title and biography even when the dashboard has not yet provided all optional text.
4. The public department index uses local image fallbacks for each department card, preserving existing dynamic Supabase content.
5. Images include meaningful alt text; decorative CSS backgrounds do not duplicate text information.

## Safety and scope

- Keep every current department, including Geology, Animal Biology and Physiology, and Plant Biology and Physiology.
- Do not modify authentication, URLs, invitation flows, or administrator records.
- Do not overwrite any Supabase media or existing dashboard-selected images.
- Keep the responsive layout and ensure portrait biographies remain readable on phone, tablet, and desktop widths.

## Verification

- Check each mapped department URL renders its correct UY1 image when its database image fields are empty.
- Check a dashboard-selected image overrides the local fallback.
- Check Computer Science renders `edb7fdd738804800b060c69e59d1b6d8.png`.
- Check HOD cards display a portrait, title, and long biography without overlap at desktop and mobile widths.
- Check text remains legible above all background images.
