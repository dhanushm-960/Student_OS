export const DEGREES = ["B.Tech", "BS"] as const;

export const MAJORS = [
  "Digital Transformation",
  "Life Science",
  "Energy Science",
  "E-mobility"
] as const;

export const MINORS = [
  "AI",
  "Data Science",
  "IoT",
  "Cybersecurity & Blockchain"
] as const;

export const CAREER_GOALS_BY_MINOR: Record<string, string[]> = {
  "AI": [
    "AI/ML Engineer",
    "Software Engineer",
    "Data Scientist",
    "Research Engineer",
    "Product Engineer (AI)"
  ],
  "Data Science": [
    "Data Analyst",
    "Data Scientist",
    "Data Engineer",
    "Business Analyst",
    "Software Engineer"
  ],
  "IoT": [
    "IoT Engineer",
    "Embedded Systems Engineer",
    "Software Engineer",
    "Hardware/Firmware Engineer",
    "Systems Engineer"
  ],
  "Cybersecurity & Blockchain": [
    "Cybersecurity Analyst",
    "Security Engineer",
    "Blockchain Developer",
    "Software Engineer",
    "Cloud Security Engineer"
  ]
};
