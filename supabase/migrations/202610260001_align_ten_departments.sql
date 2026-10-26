-- Align the public department directory with the Faculty of Science's ten departments.
-- Legacy combined records are retained (and set inactive) so existing linked content
-- remains intact and can be reassigned from the administration dashboard.

update public.departments
set is_active = false
where slug in ('biological-sciences', 'chemistry');

-- Preserve existing linked Earth Sciences content by renaming its record before
-- inserting the canonical list.
update public.departments
set name = 'Earth and Universe Sciences (Geology)',
    slug = 'earth-universe-sciences-geology',
    description = 'Understanding Earth, geological resources and the dynamic systems that shape our planet.',
    mission = 'Study Earth systems, geological resources and environmental change.',
    is_active = true,
    sort_order = 10,
    updated_at = now()
where slug = 'earth-sciences'
  and not exists (select 1 from public.departments where slug = 'earth-universe-sciences-geology');

insert into public.departments (name, slug, description, mission, is_active, sort_order)
values
  ('Computer Science', 'computer-science', 'Developing computational thinking, technology and digital innovation.', 'Develop computational thinking and digital innovation for society.', true, 1),
  ('Mathematics', 'mathematics', 'Advancing the language of patterns, logic and quantitative discovery.', 'Advance mathematical knowledge and its applications.', true, 2),
  ('Physics', 'physics', 'Investigating the principles that shape matter, energy and the universe.', 'Explore the principles governing matter, energy and the universe.', true, 3),
  ('Organic Chemistry', 'organic-chemistry', 'Exploring carbon-based compounds, synthesis and applications in health, materials and industry.', 'Advance teaching and research in organic chemistry and its practical applications.', true, 4),
  ('Inorganic Chemistry', 'inorganic-chemistry', 'Studying metals, minerals, materials and chemical processes for a changing world.', 'Develop knowledge of inorganic chemistry, materials and sustainable applications.', true, 5),
  ('Biochemistry', 'biochemistry', 'Connecting molecular science, health and biotechnology.', 'Investigate the chemical processes of living systems through teaching and research.', true, 6),
  ('Microbiology', 'microbiology', 'Investigating microorganisms, health, food systems and the environment.', 'Advance microbiological knowledge for health, industry and environmental stewardship.', true, 7),
  ('Animal Biology and Physiology', 'animal-biology-and-physiology', 'Exploring animal life, biodiversity and physiological systems.', 'Study animal organisms, their diversity, functions and interactions with the environment.', true, 8),
  ('Plant Biology and Physiology', 'plant-biology-and-physiology', 'Understanding plant life, biodiversity and the systems that sustain ecosystems.', 'Advance the study of plants, their physiology and their importance to ecosystems and society.', true, 9),
  ('Earth and Universe Sciences (Geology)', 'earth-universe-sciences-geology', 'Understanding Earth, geological resources and the dynamic systems that shape our planet.', 'Study Earth systems, geological resources and environmental change.', true, 10)
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description,
    mission = excluded.mission,
    is_active = true,
    sort_order = excluded.sort_order,
    updated_at = now();

-- The old slug is no longer part of the official directory if a parallel
-- canonical Earth and Universe Sciences record already existed.
update public.departments
set is_active = false
where slug = 'earth-sciences';
