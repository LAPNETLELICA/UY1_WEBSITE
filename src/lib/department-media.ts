export type DepartmentMedia = { coverImagePath: string; headImagePath?: string };
export type FacultyLeader = { role: string; name: string; imagePath: string; summary: string };
export type DepartmentFacility = { imagePath: string; alt: string };

const asset = (name: string) => `/images/faculty/${name}`;

const mediaBySlug: Record<string, DepartmentMedia> = {
  biochemistry: { coverImagePath: asset("5cf327f811d74be29b075eb21c38a5ff (Edited 4).png"), headImagePath: asset("HODBIOCHM.png") },
  "animal-biology-physiology": { coverImagePath: asset("5919450fabb14b379a92af9f8575e49f (Edited).png"), headImagePath: asset("HODBIOPHY.png") },
  "animal-biology-and-physiology": { coverImagePath: asset("5919450fabb14b379a92af9f8575e49f (Edited).png"), headImagePath: asset("HODBIOPHY.png") },
  "plant-biology-physiology": { coverImagePath: asset("e084937e92c34b46beba5a387bc16c18 (Edited).png"), headImagePath: asset("HODBIOPHY.png") },
  "plant-biology-and-physiology": { coverImagePath: asset("e084937e92c34b46beba5a387bc16c18 (Edited).png"), headImagePath: asset("HODBIOPHY.png") },
  "inorganic-chemistry": { coverImagePath: asset("5cf327f811d74be29b075eb21c38a5ff (Edited 3).png"), headImagePath: asset("HODICHM.png") },
  "organic-chemistry": { coverImagePath: asset("5cf327f811d74be29b075eb21c38a5ff (Edited 2).png") },
  "computer-science": { coverImagePath: asset("edb7fdd738804800b060c69e59d1b6d8.png"), headImagePath: asset("hodcom.png") },
  mathematics: { coverImagePath: asset("5919450fabb14b379a92af9f8575e49f (Edited 4).png"), headImagePath: asset("HODMATH.png") },
  physics: { coverImagePath: asset("5919450fabb14b379a92af9f8575e49f (Edited 5).png"), headImagePath: asset("HODPHY.png") },
  "earth-universe-sciences-geology": { coverImagePath: asset("8ce3ed7f2968499eaf7b365c61955c35 (Edited 5).png"), headImagePath: asset("HODRE.png") },
  microbiology: { coverImagePath: asset("e084937e92c34b46beba5a387bc16c18 (Edited 5).png") },
  "earth-sciences": { coverImagePath: asset("8ce3ed7f2968499eaf7b365c61955c35 (Edited 5).png"), headImagePath: asset("HODRE.png") },
  geology: { coverImagePath: asset("8ce3ed7f2968499eaf7b365c61955c35 (Edited 6).png") },
  "biological-sciences": { coverImagePath: asset("e084937e92c34b46beba5a387bc16c18 (Edited 2).png") },
  chemistry: { coverImagePath: asset("5cf327f811d74be29b075eb21c38a5ff (Edited 4).png") },
};

export function getDepartmentMedia(slug: string): DepartmentMedia | undefined { return mediaBySlug[slug]; }
export function getDepartmentCover(slug: string): string | undefined { return getDepartmentMedia(slug)?.coverImagePath; }
export function resolveDepartmentCover(imagePath: string | null | undefined, slug: string, genericFallback: string): string { return imagePath || getDepartmentCover(slug) || genericFallback; }
export function resolveDepartmentHeadImage(imagePath: string | null | undefined, slug: string): string | undefined { return imagePath || getDepartmentMedia(slug)?.headImagePath; }
export function shouldShowLeaderPortrait(role: string): boolean { return !/\b(dean|doyen)\b/i.test(role); }

export const facultyLeaders: FacultyLeader[] = [
  {
    role: "Rector · University of Yaoundé I",
    name: "Prof. Rémy Magloire Etoua",
    imagePath: asset("RECTEUR.png"),
    summary: "Leads the University of Yaoundé I and its academic, administrative and institutional development.",
  },
  {
    role: "Dean · Faculty of Science",
    name: "Prof. Owono Owono Luc Calvin",
    imagePath: asset("Dropped Image.png"),
    summary: "Leads and coordinates the Faculty of Science, its academic services and its departments.",
  },
];

const facilitiesBySlug: Record<string, DepartmentFacility[]> = {
  biochemistry: [
    { imagePath: asset("5cf327f811d74be29b075eb21c38a5ff (Edited 4).png"), alt: "Biochemistry laboratory" },
    { imagePath: asset("5cf327f811d74be29b075eb21c38a5ff (Edited 3).png"), alt: "Scientific research equipment" },
  ],
  "animal-biology-physiology": [{ imagePath: asset("5919450fabb14b379a92af9f8575e49f (Edited).png"), alt: "Biology practical laboratory" }],
  "animal-biology-and-physiology": [{ imagePath: asset("5919450fabb14b379a92af9f8575e49f (Edited).png"), alt: "Biology practical laboratory" }],
  "plant-biology-physiology": [{ imagePath: asset("e084937e92c34b46beba5a387bc16c18 (Edited).png"), alt: "Plant biology practical laboratory" }],
  "plant-biology-and-physiology": [{ imagePath: asset("e084937e92c34b46beba5a387bc16c18 (Edited).png"), alt: "Plant biology practical laboratory" }],
  "inorganic-chemistry": [{ imagePath: asset("5cf327f811d74be29b075eb21c38a5ff (Edited 3).png"), alt: "Inorganic chemistry laboratory equipment" }],
  "organic-chemistry": [{ imagePath: asset("5cf327f811d74be29b075eb21c38a5ff (Edited 4).png"), alt: "Organic chemistry laboratory" }],
  "computer-science": [
    { imagePath: asset("edb7fdd738804800b060c69e59d1b6d8.png"), alt: "Computer Science technical laboratory" },
    { imagePath: asset("Dropped Image (2).png"), alt: "Computer laboratory" },
  ],
  mathematics: [{ imagePath: asset("5919450fabb14b379a92af9f8575e49f (Edited 4).png"), alt: "Mathematics teaching hall" }],
  physics: [
    { imagePath: asset("5919450fabb14b379a92af9f8575e49f (Edited 5).png"), alt: "Physics and technology laboratory" },
    { imagePath: asset("8ce3ed7f2968499eaf7b365c61955c35 (Edited).png"), alt: "Physics practical equipment" },
  ],
  "earth-universe-sciences-geology": [{ imagePath: asset("8ce3ed7f2968499eaf7b365c61955c35 (Edited 5).png"), alt: "Earth science technical laboratory" }],
  "earth-sciences": [{ imagePath: asset("8ce3ed7f2968499eaf7b365c61955c35 (Edited 5).png"), alt: "Earth science technical laboratory" }],
  geology: [{ imagePath: asset("8ce3ed7f2968499eaf7b365c61955c35 (Edited 6).png"), alt: "Geology technical laboratory" }],
  "biological-sciences": [{ imagePath: asset("e084937e92c34b46beba5a387bc16c18 (Edited 2).png"), alt: "Biological sciences laboratory" }],
  chemistry: [{ imagePath: asset("5cf327f811d74be29b075eb21c38a5ff (Edited 4).png"), alt: "Chemistry laboratory" }],
};

export function getDepartmentFacilities(slug: string): DepartmentFacility[] { return facilitiesBySlug[slug] ?? []; }

type FacultyGalleryImage = { id: string; title: string; description: string; image_path: string };
const galleryAsset = (id: string, title: string, description: string, filename: string): FacultyGalleryImage => ({ id, title, description, image_path: asset(filename) });

export const UY1_IMAGE_GALLERY: FacultyGalleryImage[] = [
  galleryAsset("uy1-campus-gate", "University gateway", "A view of the University of Yaoundé I campus.", "4192ff7d4e9a442ab2de89125a75f87b.png"),
  galleryAsset("uy1-campus-life", "Campus life", "Students and visitors at the Faculty campus.", "5919450fabb14b379a92af9f8575e49f (Edited 2).png"),
  galleryAsset("uy1-teaching", "Teaching in action", "Learning and demonstration in a science classroom.", "5919450fabb14b379a92af9f8575e49f (Edited 3).png"),
  galleryAsset("uy1-lecture-theatre", "Lecture theatre", "A Faculty lecture in progress.", "5919450fabb14b379a92af9f8575e49f (Edited 4).png"),
  galleryAsset("uy1-robotics", "Technology laboratory", "Practical technology and engineering equipment.", "5919450fabb14b379a92af9f8575e49f (Edited 5).png"),
  galleryAsset("uy1-lab-team", "Laboratory learning", "Students working together in a practical laboratory.", "5919450fabb14b379a92af9f8575e49f (Edited).png"),
  galleryAsset("uy1-computer-lab", "Computer laboratory", "Digital learning facilities at UY1.", "5cf327f811d74be29b075eb21c38a5ff (Edited 2).png"),
  galleryAsset("uy1-research-lab", "Research laboratory", "Scientific instruments and laboratory work.", "5cf327f811d74be29b075eb21c38a5ff (Edited 3).png"),
  galleryAsset("uy1-science-lab", "Science laboratory", "Practical teaching and research facilities.", "5cf327f811d74be29b075eb21c38a5ff (Edited 4).png"),
  galleryAsset("uy1-student-auditorium", "Student community", "A Faculty gathering in the auditorium.", "5cf327f811d74be29b075eb21c38a5ff (Edited).png"),
  galleryAsset("uy1-demonstration", "Scientific demonstration", "A practical teaching moment.", "8ce3ed7f2968499eaf7b365c61955c35 (Edited 2).png"),
  galleryAsset("uy1-main-entrance", "University entrance", "An entrance to the UY1 campus.", "8ce3ed7f2968499eaf7b365c61955c35 (Edited 3).png"),
  galleryAsset("uy1-practical-class", "Practical class", "Hands-on learning in the laboratory.", "8ce3ed7f2968499eaf7b365c61955c35 (Edited 4).png"),
  galleryAsset("uy1-campus-building", "Faculty buildings", "Academic spaces at the Faculty.", "8ce3ed7f2968499eaf7b365c61955c35 (Edited 5).png"),
  galleryAsset("uy1-laboratory-work", "Laboratory work", "Scientific work at the Faculty of Science.", "8ce3ed7f2968499eaf7b365c61955c35 (Edited 6).png"),
  galleryAsset("uy1-laboratory-space", "Laboratory space", "A UY1 teaching laboratory.", "8ce3ed7f2968499eaf7b365c61955c35 (Edited).png"),
  galleryAsset("uy1-campus-view", "Campus view", "A wider view of university life.", "Dropped Image (2).png"),
  galleryAsset("uy1-lab-facility", "Laboratory facility", "A Faculty science workspace.", "Dropped Image.png"),
  galleryAsset("hod-biochemistry", "Biochemistry leadership", "Department of Biochemistry leadership.", "HODBIOCHM.png"),
  galleryAsset("hod-biology-physiology", "Biology and Physiology leadership", "Department leadership portrait.", "HODBIOPHY.png"),
  galleryAsset("hod-inorganic-chemistry", "Inorganic Chemistry leadership", "Department of Inorganic Chemistry leadership.", "HODICHM.png"),
  galleryAsset("hod-mathematics", "Mathematics leadership", "Department of Mathematics leadership.", "HODMATH.png"),
  galleryAsset("hod-physics", "Physics leadership", "Department of Physics leadership.", "HODPHY.png"),
  galleryAsset("hod-earth-universe", "Earth and Universe Science leadership", "Department leadership portrait.", "HODRE.png"),
  galleryAsset("uy1-rector", "University leadership", "University of Yaoundé I leadership.", "RECTEUR.png"),
  galleryAsset("uy1-academic-office", "Academic office", "Faculty academic life and administration.", "d00f550a623d409abae408a6041817a8(1) (Edited 2).png"),
  galleryAsset("uy1-laboratory-teaching", "Laboratory teaching", "Practical scientific learning.", "d00f550a623d409abae408a6041817a8(1) (Edited).png"),
  galleryAsset("uy1-student-computing", "Student computing", "Students using digital learning facilities.", "e084937e92c34b46beba5a387bc16c18 (Edited 2).png"),
  galleryAsset("uy1-lab-equipment", "Laboratory equipment", "Scientific equipment in use.", "e084937e92c34b46beba5a387bc16c18 (Edited 3).png"),
  galleryAsset("uy1-auditorium", "Faculty auditorium", "A shared academic gathering.", "e084937e92c34b46beba5a387bc16c18 (Edited 4).png"),
  galleryAsset("uy1-research-team", "Research team", "Faculty scientists and students.", "e084937e92c34b46beba5a387bc16c18 (Edited 5).png"),
  galleryAsset("uy1-campus-facility", "Campus facility", "Faculty infrastructure at UY1.", "e084937e92c34b46beba5a387bc16c18 (Edited 8).png"),
  galleryAsset("uy1-scientific-practice", "Scientific practice", "Laboratory learning at the Faculty.", "e084937e92c34b46beba5a387bc16c18 (Edited 9).png"),
  galleryAsset("uy1-faculty-building", "Faculty building", "Academic buildings on campus.", "e084937e92c34b46beba5a387bc16c18 (Edited).png"),
  galleryAsset("hod-computer-science", "Computer Science leadership", "Department of Computer Science leadership.", "hodcom.png"),
];
