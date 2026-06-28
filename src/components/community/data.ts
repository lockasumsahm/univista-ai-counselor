export interface SuccessStory {
  id: string;
  name: string;
  country: string;
  avatar: string;
  acceptedTo: string[];
  major: string;
  stats: Record<string, string>;
  story: string;
  tips: string[];
  yearAdmitted: number;
}

export interface Mentor {
  id: string;
  name: string;
  university: string;
  graduatedYear: number;
  currentRole: string;
  expertise: string[];
  bio: string;
  available: boolean;
  avatar?: string;
  rating?: number;
  mentees?: number;
}

export interface ForumTopic {
  id: string;
  title: string;
  author: string;
  replies: number;
  views: number;
  lastActive: string;
  tags: string[];
  pinned?: boolean;
}

export const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: "1", name: "Sarah Chen", country: "China", avatar: "",
    acceptedTo: ["MIT", "Stanford", "Caltech"],
    major: "Computer Science & AI",
    stats: { "GPA": "3.97/4.0", "SAT": "1560", "Awards": "ISEF Finalist" },
    story: "Growing up in Shenzhen, I was fascinated by how technology could solve real-world problems. I started coding at 12 and built my first AI project at 15. My journey to MIT wasn't just about grades — it was about showing genuine passion through research and community projects.",
    tips: ["Start research early — even simple projects count", "Show genuine intellectual curiosity in your essays", "Build something tangible that demonstrates your skills", "Connect with professors for recommendation letters"],
    yearAdmitted: 2024,
  },
  {
    id: "2", name: "Ahmed Al-Rashidi", country: "Saudi Arabia", avatar: "",
    acceptedTo: ["Oxford", "Imperial College", "UCL"],
    major: "Medicine",
    stats: { "GPA": "98%", "IELTS": "8.5", "BMAT": "Top 10%" },
    story: "From Riyadh to Oxford — my medical school journey was shaped by volunteer work in underserved communities and a deep desire to improve healthcare access in the Middle East.",
    tips: ["Medical school interviews are crucial — practice extensively", "Show genuine empathy and communication skills", "Volunteer in clinical settings early", "Research the specific programme thoroughly"],
    yearAdmitted: 2023,
  },
  {
    id: "3", name: "Priya Sharma", country: "India", avatar: "",
    acceptedTo: ["Harvard", "Yale", "Princeton"],
    major: "Economics & Public Policy",
    stats: { "GPA": "3.95/4.0", "SAT": "1550", "Awards": "National Debate Champion" },
    story: "As a first-generation college student from Jaipur, I never imagined attending an Ivy League school. My passion for policy reform and debate experience opened doors I never knew existed.",
    tips: ["First-gen status can be a strength — own your story", "Demonstrate leadership through meaningful impact", "Apply for scholarships early and broadly", "Connect with alumni from your region"],
    yearAdmitted: 2024,
  },
  {
    id: "4", name: "Marcus Johnson", country: "United States", avatar: "",
    acceptedTo: ["Columbia", "NYU", "Georgetown"],
    major: "International Relations",
    stats: { "GPA": "3.88/4.0", "SAT": "1490", "Awards": "Model UN Best Delegate" },
    story: "Growing up in a military family, I lived in 5 countries by age 16. This global perspective became the foundation of my application narrative and my passion for diplomacy.",
    tips: ["Use your unique background as a narrative thread", "Supplement scores with extraordinary extracurriculars", "Quality over quantity in activities list", "Tailor each application to the specific school"],
    yearAdmitted: 2023,
  },
  {
    id: "5", name: "Elena Volkov", country: "Russia", avatar: "",
    acceptedTo: ["ETH Zurich", "TU Munich", "Delft University"],
    major: "Mechanical Engineering",
    stats: { "GPA": "4.8/5.0", "IELTS": "7.5", "Awards": "Physics Olympiad Silver" },
    story: "From Moscow to Zurich — I chose European engineering schools for their world-class research facilities and tuition-free education. My Olympiad experience and robotics club leadership made all the difference.",
    tips: ["European universities value academic excellence highly", "Olympiad participation significantly boosts applications", "Learn the basics of the local language", "Apply to multiple countries to increase chances"],
    yearAdmitted: 2024,
  },
];

export const MENTORS: Mentor[] = 
[
  {
    "id": "m1",
    "name": "Aisha Khan",
    "university": "University of Oxford",
    "graduatedYear": 2020,
    "currentRole": "Strategy Consultant at McKinsey & Company",
    "expertise": [
      "Business",
      "UK Universities",
      "Scholarships",
      "Essays"
    ],
    "bio": "First-generation Pakistani-American, I navigated Oxford as a Rhodes Scholar. I love helping students craft compelling narratives.",
    "available": true,
    "rating": 4.8,
    "mentees": 78
  },
  {
    "id": "m2",
    "name": "Chen Wei",
    "university": "Tsinghua University",
    "graduatedYear": 2019,
    "currentRole": "Software Engineer at Google",
    "expertise": [
      "STEM",
      "Computer Science",
      "Research Experience",
      "Interviews"
    ],
    "bio": "Graduating top of my class at Tsinghua, I'm passionate about algorithms and helping others break into tech. Happy to share my interview tips!",
    "available": true,
    "rating": 4.9,
    "mentees": 102
  },
  {
    "id": "m3",
    "name": "Maria Rodriguez",
    "university": "Stanford University",
    "graduatedYear": 2021,
    "currentRole": "Resident Physician at UCSF Medical Center",
    "expertise": [
      "Medicine",
      "Pre-Med",
      "Essays",
      "Research Experience"
    ],
    "bio": "As a proud Latina from East LA, I know the challenges of applying to medical school. Let's work together to make your dream a reality.",
    "available": false,
    "rating": 4.7,
    "mentees": 65
  },
  {
    "id": "m4",
    "name": "Kwame Nkrumah",
    "university": "University of Cambridge",
    "graduatedYear": 2022,
    "currentRole": "Data Scientist at Amazon",
    "expertise": [
      "STEM",
      "European Universities",
      "Scholarships",
      "Engineering"
    ],
    "bio": "From Accra to Cambridge, I secured multiple scholarships to fund my studies. I'm excited to guide you through the process.",
    "available": true,
    "rating": 4.6,
    "mentees": 81
  },
  {
    "id": "m5",
    "name": "Sophie Dubois",
    "university": "ETH Zurich",
    "graduatedYear": 2020,
    "currentRole": "Aerospace Engineer at Airbus",
    "expertise": [
      "STEM",
      "Engineering",
      "European Universities",
      "Interviews"
    ],
    "bio": "I love the challenge of complex systems and helping aspiring engineers find their path. My time at ETH was transformative.",
    "available": true,
    "rating": 4.8,
    "mentees": 92
  },
  {
    "id": "m6",
    "name": "Rohan Patel",
    "university": "Indian Institute of Technology Bombay",
    "graduatedYear": 2018,
    "currentRole": "Product Manager at Microsoft",
    "expertise": [
      "STEM",
      "Business",
      "Computer Science",
      "Interviews"
    ],
    "bio": "IIT Bombay prepped me for a fast-paced tech career. I'm keen to share insights on product management and navigating highly competitive programs.",
    "available": true,
    "rating": 4.9,
    "mentees": 115
  },
  {
    "id": "m7",
    "name": "Sarah Miller",
    "university": "Harvard University",
    "graduatedYear": 2023,
    "currentRole": "Investment Banking Analyst at Goldman Sachs",
    "expertise": [
      "Business",
      "Liberal Arts",
      "Essays",
      "Financial Aid"
    ],
    "bio": "Liberal Arts at Harvard gave me a broad foundation. I believe in holistic applications and helping students find their voice.",
    "available": true,
    "rating": 4.7,
    "mentees": 58
  },
  {
    "id": "m8",
    "name": "Diego Garcia",
    "university": "University of Buenos Aires",
    "graduatedYear": 2021,
    "currentRole": "UX Designer at Globant",
    "expertise": [
      "Art & Design",
      "Computer Science",
      "Research Experience",
      "Interviews"
    ],
    "bio": "Bridging art and technology, I've found my niche in UX. Happy to help you build a strong portfolio and ace those design interviews.",
    "available": false,
    "rating": 4.5,
    "mentees": 48
  },
  {
    "id": "m9",
    "name": "Chloe Wong",
    "university": "National University of Singapore (NUS)",
    "graduatedYear": 2020,
    "currentRole": "Biomedical Engineer at Medtronic",
    "expertise": [
      "STEM",
      "Medicine",
      "Engineering",
      "Research Experience"
    ],
    "bio": "From Singapore to building life-saving devices, my journey was fueled by curiosity. Let's explore your passion in biomedical sciences.",
    "available": true,
    "rating": 4.7,
    "mentees": 88
  },
  {
    "id": "m10",
    "name": "David Kim",
    "university": "Seoul National University",
    "graduatedYear": 2019,
    "currentRole": "Data Scientist at Coupang",
    "expertise": [
      "STEM",
      "Computer Science",
      "Interviews",
      "Scholarships"
    ],
    "bio": "SNU provided a rigorous foundation for a career in AI. I enjoy helping students prepare for technical interviews and find funding.",
    "available": true,
    "rating": 4.8,
    "mentees": 95
  },
  {
    "id": "m11",
    "name": "Oliver White",
    "university": "London School of Economics (LSE)",
    "graduatedYear": 2022,
    "currentRole": "Policy Advisor at UK Government",
    "expertise": [
      "Business",
      "UK Universities",
      "Essays",
      "Liberal Arts"
    ],
    "bio": "LSE shaped my understanding of global policy. I can guide you in writing persuasive essays and navigating LSE's unique programs.",
    "available": true,
    "rating": 4.6,
    "mentees": 72
  },
  {
    "id": "m12",
    "name": "Fatima Zahra",
    "university": "King Abdullah University of Science and Technology (KAUST)",
    "graduatedYear": 2023,
    "currentRole": "Research Scientist at Aramco",
    "expertise": [
      "STEM",
      "Research Experience",
      "Scholarships",
      "Engineering"
    ],
    "bio": "KAUST was an incredible research hub. I'm keen to help students secure research opportunities and competitive scholarships in the Middle East.",
    "available": true,
    "rating": 4.9,
    "mentees": 55
  },
  {
    "id": "m13",
    "name": "Liam Murphy",
    "university": "University College Dublin",
    "graduatedYear": 2020,
    "currentRole": "Software Engineer at Stripe",
    "expertise": [
      "STEM",
      "Computer Science",
      "European Universities",
      "Interviews"
    ],
    "bio": "UCD gave me a great start in tech. I'm happy to share my interview experiences and tips for getting into European tech hubs.",
    "available": false,
    "rating": 4.5,
    "mentees": 68
  },
  {
    "id": "m14",
    "name": "Yuki Tanaka",
    "university": "University of Tokyo",
    "graduatedYear": 2021,
    "currentRole": "Environmental Consultant at PwC",
    "expertise": [
      "Business",
      "STEM",
      "Essays",
      "Research Experience"
    ],
    "bio": "Combining my passion for environmental science with business, I found my niche. Let's discuss interdisciplinary approaches to your career.",
    "available": true,
    "rating": 4.7,
    "mentees": 70
  },
  {
    "id": "m15",
    "name": "Gabriel Santos",
    "university": "University of S\u00e3o Paulo",
    "graduatedYear": 2019,
    "currentRole": "Civil Engineer at Odebrecht",
    "expertise": [
      "STEM",
      "Engineering",
      "Research Experience",
      "Interviews"
    ],
    "bio": "From major infrastructure projects in Brazil to solving complex engineering challenges, I love what I do. I can demystify the engineering career path.",
    "available": true,
    "rating": 4.6,
    "mentees": 85
  },
  {
    "id": "m16",
    "name": "Nia Jones",
    "university": "Duke University",
    "graduatedYear": 2024,
    "currentRole": "Analyst at Deloitte",
    "expertise": [
      "Business",
      "Scholarships",
      "Essays",
      "Liberal Arts"
    ],
    "bio": "A proud first-gen student from North Carolina, I navigated Duke with financial aid and scholarships. Let me help you find resources.",
    "available": true,
    "rating": 4.8,
    "mentees": 45
  },
  {
    "id": "m17",
    "name": "Omar Hassan",
    "university": "American University of Beirut (AUB)",
    "graduatedYear": 2020,
    "currentRole": "Junior Doctor at AUB Medical Center",
    "expertise": [
      "Medicine",
      "Pre-Med",
      "Research Experience",
      "Interviews"
    ],
    "bio": "Studying Medicine at AUB was a challenging yet rewarding experience. I'm here to support aspiring doctors through their journey.",
    "available": true,
    "rating": 4.7,
    "mentees": 75
  },
  {
    "id": "m18",
    "name": "Isabella Russo",
    "university": "Bocconi University",
    "graduatedYear": 2022,
    "currentRole": "Marketing Specialist at Ferrari",
    "expertise": [
      "Business",
      "European Universities",
      "Essays",
      "Liberal Arts"
    ],
    "bio": "Bocconi's international focus prepared me for a global career. Happy to share my tips on applying to European business schools.",
    "available": false,
    "rating": 4.5,
    "mentees": 52
  },
  {
    "id": "m19",
    "name": "Jamie Lee",
    "university": "University of Toronto",
    "graduatedYear": 2021,
    "currentRole": "Software Developer at Shopify",
    "expertise": [
      "STEM",
      "Computer Science",
      "Scholarships",
      "Interviews"
    ],
    "bio": "From Toronto to a thriving startup, my journey focused on continuous learning. Let's optimize your application for tech roles.",
    "available": true,
    "rating": 4.8,
    "mentees": 98
  },
  {
    "id": "m20",
    "name": "Priya Sharma",
    "university": "University of Delhi",
    "graduatedYear": 2020,
    "currentRole": "Journalist at The Times of India",
    "expertise": [
      "Liberal Arts",
      "Essays",
      "Research Experience",
      "Interviews"
    ],
    "bio": "My degree in Journalism was invaluable. I can help you hone your writing and communication skills for various fields.",
    "available": true,
    "rating": 4.6,
    "mentees": 70
  },
  {
    "id": "m21",
    "name": "Benjamin Chen",
    "university": "UC Berkeley",
    "graduatedYear": 2023,
    "currentRole": "Quantitative Analyst at Citadel",
    "expertise": [
      "STEM",
      "Business",
      "Computer Science",
      "Interviews"
    ],
    "bio": "Berkeley's rigorous environment prepared me for the world of finance and tech. I'm ready to help you crack those quant interviews.",
    "available": true,
    "rating": 4.9,
    "mentees": 62
  },
  {
    "id": "m22",
    "name": "Zara Ali",
    "university": "University of Cape Town",
    "graduatedYear": 2021,
    "currentRole": "Public Health Researcher at WHO",
    "expertise": [
      "Medicine",
      "Research Experience",
      "Scholarships",
      "Essays"
    ],
    "bio": "Inspired by my community in South Africa, I pursued public health. I can guide you on impactful research and essay writing.",
    "available": true,
    "rating": 4.7,
    "mentees": 77
  },
  {
    "id": "m23",
    "name": "Tomislav Novak",
    "university": "University of Zagreb",
    "graduatedYear": 2019,
    "currentRole": "AI Engineer at Google DeepMind",
    "expertise": [
      "STEM",
      "Computer Science",
      "European Universities",
      "Interviews"
    ],
    "bio": "From Croatia to cutting-edge AI research, my journey was academically intense. I can help with advanced technical interview prep.",
    "available": true,
    "rating": 4.9,
    "mentees": 110
  },
  {
    "id": "m24",
    "name": "Sofia Mendes",
    "university": "University of Lisbon",
    "graduatedYear": 2022,
    "currentRole": "Architect at Foster + Partners",
    "expertise": [
      "Art & Design",
      "Engineering",
      "European Universities",
      "Essays"
    ],
    "bio": "My architecture degree from Lisbon opened doors to global projects. Let's discuss portfolio building and crafting your unique story.",
    "available": false,
    "rating": 4.6,
    "mentees": 50
  },
  {
    "id": "m25",
    "name": "Kenji Nakamura",
    "university": "Kyoto University",
    "graduatedYear": 2020,
    "currentRole": "Robotics Engineer at SoftBank",
    "expertise": [
      "STEM",
      "Engineering",
      "Research Experience",
      "Interviews"
    ],
    "bio": "Kyoto's blend of tradition and innovation spurred my interest in robotics. I can help you with technical skills and interview strategies.",
    "available": true,
    "rating": 4.8,
    "mentees": 90
  },
  {
    "id": "m26",
    "name": "Amelia Brooks",
    "university": "New York University (NYU)",
    "graduatedYear": 2024,
    "currentRole": "Brand Strategist at Ogilvy",
    "expertise": [
      "Business",
      "Liberal Arts",
      "Essays",
      "Financial Aid"
    ],
    "bio": "Navigating NYU's diverse programs and securing financial aid was a journey. I love helping students find their best fit.",
    "available": true,
    "rating": 4.7,
    "mentees": 40
  },
  {
    "id": "m27",
    "name": "Adnan Salim",
    "university": "National University of Sciences & Technology (NUST), Pakistan",
    "graduatedYear": 2018,
    "currentRole": "CTO at Tech Startup",
    "expertise": [
      "STEM",
      "Computer Science",
      "Engineering",
      "Interviews"
    ],
    "bio": "From NUST to leading a tech startup, my career has been about innovation. I can provide insights into entrepreneurship and tech leadership.",
    "available": true,
    "rating": 4.9,
    "mentees": 118
  },
  {
    "id": "m28",
    "name": "Elena Petrova",
    "university": "Saint Petersburg State University",
    "graduatedYear": 2020,
    "currentRole": "Linguist at CERN",
    "expertise": [
      "Liberal Arts",
      "European Universities",
      "Scholarships",
      "Research Experience"
    ],
    "bio": "My path to CERN with a humanities background was unexpected but rewarding. I can help you find unique intersections for your studies.",
    "available": false,
    "rating": 4.5,
    "mentees": 60
  },
  {
    "id": "m29",
    "name": "Chris O'Connell",
    "university": "Trinity College Dublin",
    "graduatedYear": 2023,
    "currentRole": "Physicist at Intel",
    "expertise": [
      "STEM",
      "Engineering",
      "European Universities",
      "Interviews"
    ],
    "bio": "Physics at Trinity prepared me for high-tech manufacturing. I enjoy mentoring students interested in applied sciences.",
    "available": true,
    "rating": 4.7,
    "mentees": 55
  },
  {
    "id": "m30",
    "name": "Linnea Svensson",
    "university": "Karolinska Institute",
    "graduatedYear": 2021,
    "currentRole": "Medical Researcher at AstraZeneca",
    "expertise": [
      "Medicine",
      "Research Experience",
      "European Universities",
      "Scholarships"
    ],
    "bio": "From Sweden's leading medical university, I've pursued a career in drug discovery. Let's discuss research grants and medical school applications.",
    "available": true,
    "rating": 4.8,
    "mentees": 80
  },
  {
    "id": "m31",
    "name": "Juan Pablo Sanchez",
    "university": "Tecnol\u00f3gico de Monterrey (ITESM)",
    "graduatedYear": 2019,
    "currentRole": "Operations Manager at Nestl\u00e9",
    "expertise": [
      "Business",
      "Engineering",
      "Essays",
      "Interviews"
    ],
    "bio": "ITESM's practical approach was key to my career. I love helping students develop strong leadership and problem-solving skills.",
    "available": true,
    "rating": 4.6,
    "mentees": 87
  },
  {
    "id": "m32",
    "name": "Grace Chen",
    "university": "Fudan University",
    "graduatedYear": 2022,
    "currentRole": "Financial Analyst at JP Morgan",
    "expertise": [
      "Business",
      "Scholarships",
      "Essays",
      "Interviews"
    ],
    "bio": "Fudan provided a strong foundation in finance. I'm keen to share insights on navigating highly competitive internships and careers.",
    "available": false,
    "rating": 4.7,
    "mentees": 60
  },
  {
    "id": "m33",
    "name": "Jamal Abdi",
    "university": "University of Nairobi",
    "graduatedYear": 2020,
    "currentRole": "Environmental Scientist at UNEP",
    "expertise": [
      "STEM",
      "Research Experience",
      "Scholarships",
      "Essays"
    ],
    "bio": "My passion for environmental policy started in Kenya. I can assist with research proposals and applications for international organizations.",
    "available": true,
    "rating": 4.8,
    "mentees": 73
  },
  {
    "id": "m34",
    "name": "Chloe Davies",
    "university": "University of Edinburgh",
    "graduatedYear": 2024,
    "currentRole": "Biotech Scientist at Pfizer",
    "expertise": [
      "STEM",
      "Medicine",
      "UK Universities",
      "Research Experience"
    ],
    "bio": "Edinburgh's vibrant research environment shaped my love for biotechnology. I'm keen to help you discover your path in biotech.",
    "available": true,
    "rating": 4.7,
    "mentees": 38
  },
  {
    "id": "m35",
    "name": "Antonio Rossi",
    "university": "Polytechnic University of Milan",
    "graduatedYear": 2021,
    "currentRole": "Automotive Designer at Lamborghini",
    "expertise": [
      "Art & Design",
      "Engineering",
      "European Universities",
      "Interviews"
    ],
    "bio": "From sketching cars in my youth to designing for Lamborghini, my journey was fueled by passion. Let's refine your portfolio and interview skills.",
    "available": true,
    "rating": 4.9,
    "mentees": 95
  },
  {
    "id": "m36",
    "name": "Kimberly Park",
    "university": "Yonsei University",
    "graduatedYear": 2019,
    "currentRole": "Marketing Manager at LG Electronics",
    "expertise": [
      "Business",
      "Scholarships",
      "Essays",
      "Interviews"
    ],
    "bio": "Yonsei's global focus prepared me for a marketing career. I can help craft compelling applications and interview stories.",
    "available": true,
    "rating": 4.6,
    "mentees": 82
  },
  {
    "id": "m37",
    "name": "Arjun Singh",
    "university": "IIT Delhi",
    "graduatedYear": 2020,
    "currentRole": "Machine Learning Engineer at NVIDIA",
    "expertise": [
      "STEM",
      "Computer Science",
      "Engineering",
      "Research Experience"
    ],
    "bio": "From the competitive halls of IIT Delhi to innovating at NVIDIA, I understand the drive it takes. Happy to share my ML insights.",
    "available": true,
    "rating": 4.9,
    "mentees": 105
  },
  {
    "id": "m38",
    "name": "Sarah Goldberg",
    "university": "University of Michigan - Ann Arbor",
    "graduatedYear": 2023,
    "currentRole": "Management Consultant at Bain & Company",
    "expertise": [
      "Business",
      "Liberal Arts",
      "Essays",
      "Interviews"
    ],
    "bio": "My liberal arts background at Michigan proved invaluable for consulting. I'm keen to help you ace case interviews.",
    "available": true,
    "rating": 4.7,
    "mentees": 57
  },
  {
    "id": "m39",
    "name": "Mustafa Al-Sayed",
    "university": "American University in Cairo (AUC)",
    "graduatedYear": 2021,
    "currentRole": "Software Engineer at Swvl",
    "expertise": [
      "STEM",
      "Computer Science",
      "Scholarships",
      "Interviews"
    ],
    "bio": "AUC's vibrant environment gave me a solid tech foundation. I'm eager to help you navigate tech careers in the Middle East and beyond.",
    "available": false,
    "rating": 4.5,
    "mentees": 63
  },
  {
    "id": "m40",
    "name": "Eva Popova",
    "university": "Moscow State University",
    "graduatedYear": 2019,
    "currentRole": "Neuroscientist at Max Planck Institute",
    "expertise": [
      "STEM",
      "Medicine",
      "Research Experience",
      "European Universities"
    ],
    "bio": "From Moscow to pioneering brain research in Germany, my journey was research-focused. I can offer advice on Ph.D. applications.",
    "available": true,
    "rating": 4.8,
    "mentees": 88
  },
  {
    "id": "m41",
    "name": "Sean Kelly",
    "university": "National University of Ireland Galway",
    "graduatedYear": 2020,
    "currentRole": "Civil Engineer at Arup",
    "expertise": [
      "STEM",
      "Engineering",
      "European Universities",
      "Interviews"
    ],
    "bio": "Galway's engineering program was top-notch. I'm happy to guide you through civil engineering careers and job applications.",
    "available": true,
    "rating": 4.6,
    "mentees": 76
  },
  {
    "id": "m42",
    "name": "Hiroshi Sato",
    "university": "Osaka University",
    "graduatedYear": 2022,
    "currentRole": "Pharmacist at Takeda Pharmaceutical",
    "expertise": [
      "Medicine",
      "Pre-Med",
      "Research Experience",
      "Scholarships"
    ],
    "bio": "My pharmacy degree from Osaka prepared me for drug development. I can help students pursuing pharmaceutical sciences.",
    "available": true,
    "rating": 4.7,
    "mentees": 69
  },
  {
    "id": "m43",
    "name": "Camila Vargas",
    "university": "Pontifical Catholic University of Chile",
    "graduatedYear": 2021,
    "currentRole": "Economist at World Bank",
    "expertise": [
      "Business",
      "Liberal Arts",
      "Scholarships",
      "Essays"
    ],
    "bio": "From Chile to the World Bank, my economics degree fueled my passion for development. Let's craft your impactful essays.",
    "available": true,
    "rating": 4.8,
    "mentees": 80
  },
  {
    "id": "m44",
    "name": "Marcus Johnson",
    "university": "University of Texas at Austin",
    "graduatedYear": 2023,
    "currentRole": "Software Engineer at Meta",
    "expertise": [
      "STEM",
      "Computer Science",
      "Interviews",
      "Financial Aid"
    ],
    "bio": "As a first-gen student, I learned to navigate university with scholarships. Happy to share my journey to Big Tech.",
    "available": true,
    "rating": 4.9,
    "mentees": 59
  },
  {
    "id": "m45",
    "name": "Nafisa Ahmed",
    "university": "University of Dhaka",
    "graduatedYear": 2020,
    "currentRole": "International Development Consultant at UNDP",
    "expertise": [
      "Liberal Arts",
      "Essays",
      "Research Experience",
      "Scholarships"
    ],
    "bio": "My humanities studies from Dhaka led me to global development. I can help you find purpose in academia and beyond.",
    "available": false,
    "rating": 4.5,
    "mentees": 65
  },
  {
    "id": "m46",
    "name": "Hans M\u00fcller",
    "university": "Technical University of Munich (TUM)",
    "graduatedYear": 2018,
    "currentRole": "Lead Engineer at BMW",
    "expertise": [
      "STEM",
      "Engineering",
      "European Universities",
      "Interviews"
    ],
    "bio": "TUM's engineering program was world-class. I'm keen to share my experience in automotive and guide your engineering career.",
    "available": true,
    "rating": 4.9,
    "mentees": 112
  },
  {
    "id": "m47",
    "name": "Ananya Gupta",
    "university": "BITS Pilani",
    "graduatedYear": 2021,
    "currentRole": "Product Designer at Adobe",
    "expertise": [
      "Art & Design",
      "Computer Science",
      "Interviews",
      "Essays"
    ],
    "bio": "Bridging design and tech, my journey has been creative and challenging. Let's refine your portfolio and interview strategy.",
    "available": true,
    "rating": 4.7,
    "mentees": 78
  },
  {
    "id": "m48",
    "name": "Chen Lu",
    "university": "Peking University",
    "graduatedYear": 2020,
    "currentRole": "Legal Counsel at Tencent",
    "expertise": [
      "Law School",
      "Business",
      "Essays",
      "Interviews"
    ],
    "bio": "Law at Peking University shaped my career in corporate law. I can guide you through the complexities of law school applications.",
    "available": true,
    "rating": 4.8,
    "mentees": 90
  },
  {
    "id": "m49",
    "name": "Maria Elena Perez",
    "university": "National Autonomous University of Mexico (UNAM)",
    "graduatedYear": 2022,
    "currentRole": "Pediatrician at Hospital Infantil de Mexico",
    "expertise": [
      "Medicine",
      "Pre-Med",
      "Research Experience",
      "Scholarships"
    ],
    "bio": "UNAM provided an incredible medical education. I am passionate about mentoring future doctors, especially those from Latin America.",
    "available": true,
    "rating": 4.7,
    "mentees": 71
  },
  {
    "id": "m50",
    "name": "Ben Carter",
    "university": "McGill University",
    "graduatedYear": 2024,
    "currentRole": "Junior Economist at Bank of Canada",
    "expertise": [
      "Business",
      "Liberal Arts",
      "Scholarships",
      "Essays"
    ],
    "bio": "From Montreal, I focused on economics and policy. I can help you articulate your interests in competitive fields.",
    "available": true,
    "rating": 4.6,
    "mentees": 42
  },
  {
    "id": "m51",
    "name": "Chloe Lim",
    "university": "Monash University",
    "graduatedYear": 2021,
    "currentRole": "Data Analyst at Commonwealth Bank",
    "expertise": [
      "STEM",
      "Business",
      "Computer Science",
      "Interviews"
    ],
    "bio": "My degree from Monash led me to a career in data. I can share insights on analytics and FinTech in Australia.",
    "available": false,
    "rating": 4.5,
    "mentees": 67
  },
  {
    "id": "m52",
    "name": "Ahmed El-Sayed",
    "university": "Cairo University",
    "graduatedYear": 2019,
    "currentRole": "Civil Engineer at Consolidated Contractors Company (CCC)",
    "expertise": [
      "Engineering",
      "Scholarships",
      "Research Experience",
      "Interviews"
    ],
    "bio": "From Egypt to major infrastructure projects, my engineering journey has been diverse. Let's discuss global construction careers.",
    "available": true,
    "rating": 4.6,
    "mentees": 83
  },
  {
    "id": "m53",
    "name": "Maya Singh",
    "university": "University of Sydney",
    "graduatedYear": 2023,
    "currentRole": "Journalist at Australian Broadcasting Corporation (ABC)",
    "expertise": [
      "Liberal Arts",
      "Essays",
      "Research Experience",
      "Interviews"
    ],
    "bio": "My communications degree from Sydney was a launchpad. I can help you craft compelling stories and interview confidently.",
    "available": true,
    "rating": 4.7,
    "mentees": 53
  },
  {
    "id": "m54",
    "name": "Siddharth Kumar",
    "university": "University of Waterloo",
    "graduatedYear": 2020,
    "currentRole": "AI Research Scientist at Google Brain",
    "expertise": [
      "STEM",
      "Computer Science",
      "Research Experience",
      "Interviews"
    ],
    "bio": "Waterloo's co-op program gave me an edge in AI research. I'm passionate about algorithms and helping others break into cutting-edge tech.",
    "available": true,
    "rating": 4.9,
    "mentees": 108
  },
  {
    "id": "m55",
    "name": "Elena Popovic",
    "university": "University of Belgrade",
    "graduatedYear": 2021,
    "currentRole": "Graphic Designer at Booking.com",
    "expertise": [
      "Art & Design",
      "European Universities",
      "Essays",
      "Interviews"
    ],
    "bio": "From Belgrade's creative scene to designing for a global platform, my journey was visually driven. Let's refine your portfolio.",
    "available": false,
    "rating": 4.5,
    "mentees": 58
  },
  {
    "id": "m56",
    "name": "Michael O'Malley",
    "university": "Royal College of Surgeons in Ireland (RCSI)",
    "graduatedYear": 2022,
    "currentRole": "Junior Doctor at Mater Hospital",
    "expertise": [
      "Medicine",
      "Pre-Med",
      "European Universities",
      "Interviews"
    ],
    "bio": "RCSI offered an incredible medical education. I'm eager to share insights on patient care and preparing for medical school interviews.",
    "available": true,
    "rating": 4.7,
    "mentees": 74
  },
  {
    "id": "m57",
    "name": "Isabelle Laurent",
    "university": "Sciences Po",
    "graduatedYear": 2023,
    "currentRole": "Policy Analyst at European Parliament",
    "expertise": [
      "Liberal Arts",
      "European Universities",
      "Scholarships",
      "Essays"
    ],
    "bio": "Sciences Po provided a unique global perspective. I can help you structure impactful essays for international relations programs.",
    "available": true,
    "rating": 4.8,
    "mentees": 60
  },
  {
    "id": "m58",
    "name": "Carlos Rivera",
    "university": "University of Havana",
    "graduatedYear": 2020,
    "currentRole": "Biotech Scientist at Regeneron Pharmaceuticals",
    "expertise": [
      "STEM",
      "Medicine",
      "Research Experience",
      "Scholarships"
    ],
    "bio": "From Cuba to leading biotech, my passion for science knows no borders. Let's explore how to get your research noticed.",
    "available": true,
    "rating": 4.9,
    "mentees": 93
  },
  {
    "id": "m59",
    "name": "Olivia Smith",
    "university": "University of British Columbia (UBC)",
    "graduatedYear": 2024,
    "currentRole": "Environmental Consultant at Golder Associates",
    "expertise": [
      "STEM",
      "Research Experience",
      "Scholarships",
      "Essays"
    ],
    "bio": "UBC's focus on sustainability shaped my career. I can guide you through environmental science programs and scholarship applications.",
    "available": true,
    "rating": 4.7,
    "mentees": 47
  },
  {
    "id": "m60",
    "name": "Akiko Koyama",
    "university": "Keio University",
    "graduatedYear": 2018,
    "currentRole": "Investment Banker at Nomura Holdings",
    "expertise": [
      "Business",
      "Financial Aid",
      "Interviews",
      "Essays"
    ],
    "bio": "Keio prepared me for the demanding world of finance. I'm expert at preparing for behavioral and technical finance interviews.",
    "available": true,
    "rating": 4.8,
    "mentees": 110
  },
  {
    "id": "m61",
    "name": "Daniel Levy",
    "university": "Hebrew University of Jerusalem",
    "graduatedYear": 2022,
    "currentRole": "Cybersecurity Analyst at Check Point Software",
    "expertise": [
      "STEM",
      "Computer Science",
      "Research Experience",
      "Interviews"
    ],
    "bio": "From Israel's vibrant tech scene, I specialized in cybersecurity. I can share unique insights into this field's opportunities.",
    "available": false,
    "rating": 4.6,
    "mentees": 62
  },
  {
    "id": "m62",
    "name": "Sophia M\u00fcller",
    "university": "Heidelberg University",
    "graduatedYear": 2020,
    "currentRole": "Medical Doctor at Charit\u00e9 \u2013 Universit\u00e4tsmedizin Berlin",
    "expertise": [
      "Medicine",
      "Pre-Med",
      "European Universities",
      "Interviews"
    ],
    "bio": "Heidelberg's historic medical school was a privilege. I'm here to support your journey to becoming a compassionate doctor.",
    "available": true,
    "rating": 4.8,
    "mentees": 90
  },
  {
    "id": "m63",
    "name": "Rajesh Prasad",
    "university": "National University of Singapore (NUS)",
    "graduatedYear": 2019,
    "currentRole": "Full Stack Developer at Grab",
    "expertise": [
      "STEM",
      "Computer Science",
      "Engineering",
      "Interviews"
    ],
    "bio": "NUS's strong tech ecosystem prepared me for startup life. I can help with coding challenges and startup interview prep.",
    "available": true,
    "rating": 4.9,
    "mentees": 115
  },
  {
    "id": "m64",
    "name": "Emily Watson",
    "university": "University of Manchester",
    "graduatedYear": 2023,
    "currentRole": "Aerospace Engineer at BAE Systems",
    "expertise": [
      "STEM",
      "Engineering",
      "UK Universities",
      "Research Experience"
    ],
    "bio": "My Manchester engineering degree led me to defense tech. I'm happy to discuss specialized engineering paths and internships.",
    "available": true,
    "rating": 4.7,
    "mentees": 50
  },
  {
    "id": "m65",
    "name": "Thandiwe Ncube",
    "university": "University of Witwatersrand",
    "graduatedYear": 2021,
    "currentRole": "Geologist at Anglo American",
    "expertise": [
      "STEM",
      "Research Experience",
      "Scholarships",
      "Essays"
    ],
    "bio": "From Johannesburg, my passion for earth sciences led me to mining. I can help you with geological studies and field research applications.",
    "available": true,
    "rating": 4.6,
    "mentees": 70
  },
  {
    "id": "m66",
    "name": "Lucas Pereira",
    "university": "University of Campinas (UNICAMP)",
    "graduatedYear": 2020,
    "currentRole": "Biomedical Scientist at Hospital S\u00edrio-Liban\u00eas",
    "expertise": [
      "Medicine",
      "Research Experience",
      "Scholarships",
      "Essays"
    ],
    "bio": "UNICAMP\u2019s research culture was impactful for my biomedical career. I can assist with scientific writing and grant applications.",
    "available": true,
    "rating": 4.7,
    "mentees": 85
  },
  {
    "id": "m67",
    "name": "Samantha Clark",
    "university": "University of Washington",
    "graduatedYear": 2024,
    "currentRole": "Associate Product Marketing Manager at Microsoft",
    "expertise": [
      "Business",
      "Computer Science",
      "Interviews",
      "Essays"
    ],
    "bio": "UW provided a strong tech and business background. I'm thrilled to help students bridge these fields for marketing roles.",
    "available": true,
    "rating": 4.8,
    "mentees": 35
  },
  {
    "id": "m68",
    "name": "Zainab Hassan",
    "university": "King Fahd University of Petroleum and Minerals (KFUPM)",
    "graduatedYear": 2019,
    "currentRole": "Petroleum Engineer at Saudi Aramco",
    "expertise": [
      "STEM",
      "Engineering",
      "Research Experience",
      "Scholarships"
    ],
    "bio": "KFUPM shaped my career in energy. I provide guidance on petroleum engineering careers and research opportunities in the GCC.",
    "available": false,
    "rating": 4.5,
    "mentees": 68
  },
  {
    "id": "m69",
    "name": "Maxime Leroy",
    "university": "\u00c9cole Polytechnique",
    "graduatedYear": 2022,
    "currentRole": "Quant Developer at Soci\u00e9t\u00e9 G\u00e9n\u00e9rale",
    "expertise": [
      "STEM",
      "Business",
      "European Universities",
      "Interviews"
    ],
    "bio": "Polytechnique's rigorous math and engineering prepared me for quantitative finance. I can help with complex problem-solving.",
    "available": true,
    "rating": 4.9,
    "mentees": 80
  },
  {
    "id": "m70",
    "name": "Chlo\u00e9 Fontaine",
    "university": "Sorbonne University",
    "graduatedYear": 2021,
    "currentRole": "Art Historian at Louvre Museum",
    "expertise": [
      "Art & Design",
      "Liberal Arts",
      "European Universities",
      "Research Experience"
    ],
    "bio": "My love for art history flourished at the Sorbonne. I guide students passionate about humanities and cultural preservation.",
    "available": true,
    "rating": 4.7,
    "mentees": 72
  },
  {
    "id": "m71",
    "name": "Kaito Suzuki",
    "university": "Waseda University",
    "graduatedYear": 2023,
    "currentRole": "Management Consultant at Accenture",
    "expertise": [
      "Business",
      "Scholarships",
      "Essays",
      "Interviews"
    ],
    "bio": "Waseda's diverse student body gave me varied perspectives. I can help perfect your consulting case interview skills.",
    "available": true,
    "rating": 4.8,
    "mentees": 55
  },
  {
    "id": "m72",
    "name": "Ananya Mukherjee",
    "university": "University of Calcutta",
    "graduatedYear": 2020,
    "currentRole": "Sociologist at Centre for Policy Research",
    "expertise": [
      "Liberal Arts",
      "Research Experience",
      "Essays",
      "Scholarships"
    ],
    "bio": "My sociology degree from Calcutta fueled my passion for social justice. Let's craft compelling research proposals.",
    "available": true,
    "rating": 4.6,
    "mentees": 75
  },
  {
    "id": "m73",
    "name": "Ben Taylor",
    "university": "Imperial College London",
    "graduatedYear": 2022,
    "currentRole": "Renewable Energy Engineer at \u00d8rsted",
    "expertise": [
      "STEM",
      "Engineering",
      "UK Universities",
      "Research Experience"
    ],
    "bio": "Imperial set me on a path to sustainable energy. I can advise on environmental engineering and impactful research.",
    "available": true,
    "rating": 4.9,
    "mentees": 88
  },
  {
    "id": "m74",
    "name": "Jasmine Chen",
    "university": "University of Melbourne",
    "graduatedYear": 2021,
    "currentRole": "Physiotherapist at Melbourne Private Hospital",
    "expertise": [
      "Medicine",
      "Pre-Med",
      "Research Experience",
      "Essays"
    ],
    "bio": "My physiotherapy journey at Melbourne was hands-on and inspiring. I can guide you through health science applications.",
    "available": true,
    "rating": 4.7,
    "mentees": 66
  },
  {
    "id": "m75",
    "name": "Mateusz Kowalski",
    "university": "University of Warsaw",
    "graduatedYear": 2019,
    "currentRole": "Economist at European Central Bank",
    "expertise": [
      "Business",
      "European Universities",
      "Scholarships",
      "Essays"
    ],
    "bio": "From Warsaw to central banking, I navigated complex economic theories. I can support your applications to prestigious economics programs.",
    "available": true,
    "rating": 4.8,
    "mentees": 97
  },
  {
    "id": "m76",
    "name": "Nadia Hassan",
    "university": "University of the Witwatersrand",
    "graduatedYear": 2020,
    "currentRole": "Barrister at Constitution Hill",
    "expertise": [
      "Law School",
      "Liberal Arts",
      "Scholarships",
      "Interviews"
    ],
    "bio": "Law at Wits ignited my passion for justice. I'm keen to guide aspiring lawyers, especially those interested in human rights.",
    "available": false,
    "rating": 4.6,
    "mentees": 70
  },
  {
    "id": "m77",
    "name": "Chris Anderson",
    "university": "Technical University of Denmark (DTU)",
    "graduatedYear": 2022,
    "currentRole": "Wind Energy Engineer at Siemens Gamesa",
    "expertise": [
      "STEM",
      "Engineering",
      "European Universities",
      "Research Experience"
    ],
    "bio": "DTU's focus on sustainable engineering was perfect for me. I can advise on renewable energy careers and grad school options.",
    "available": true,
    "rating": 4.8,
    "mentees": 78
  },
  {
    "id": "m78",
    "name": "Aya Nakamura",
    "university": "Tohoku University",
    "graduatedYear": 2021,
    "currentRole": "Materials Scientist at Nissan",
    "expertise": [
      "STEM",
      "Engineering",
      "Research Experience",
      "Interviews"
    ],
    "bio": "Tohoku's materials science program was cutting-edge. I love helping aspiring engineers find their specialty.",
    "available": true,
    "rating": 4.7,
    "mentees": 81
  },
  {
    "id": "m79",
    "name": "Fernando Chavez",
    "university": "University of Chile",
    "graduatedYear": 2018,
    "currentRole": "Chief Medical Officer at Startup Health",
    "expertise": [
      "Medicine",
      "Pre-Med",
      "Business",
      "Essays"
    ],
    "bio": "From Chile to health tech, I bridged medicine and entrepreneurship. I can guide pre-meds interested in innovation.",
    "available": true,
    "rating": 4.9,
    "mentees": 120
  },
  {
    "id": "m80",
    "name": "Lily Green",
    "university": "Brown University",
    "graduatedYear": 2023,
    "currentRole": "Public Relations Specialist at Edelman",
    "expertise": [
      "Liberal Arts",
      "Essays",
      "Financial Aid",
      "Interviews"
    ],
    "bio": "Brown's open curriculum fostered my diverse interests. I help students articulate their story for competitive programs.",
    "available": true,
    "rating": 4.7,
    "mentees": 48
  },
  {
    "id": "m81",
    "name": "Mohammed Khan",
    "university": "KFUPM",
    "graduatedYear": 2020,
    "currentRole": "Data Scientist at STC",
    "expertise": [
      "STEM",
      "Computer Science",
      "Scholarships",
      "Research Experience"
    ],
    "bio": "KFUPM provided a solid foundation for data science in the Middle East. I'm happy to guide students through data careers.",
    "available": true,
    "rating": 4.8,
    "mentees": 92
  },
  {
    "id": "m82",
    "name": "Ingrid Olsen",
    "university": "University of Oslo",
    "graduatedYear": 2024,
    "currentRole": "Marine Biologist at Institute of Marine Research",
    "expertise": [
      "STEM",
      "Research Experience",
      "European Universities",
      "Essays"
    ],
    "bio": "My work at Oslo focused on ocean conservation. I can help aspiring scientists craft compelling research proposals.",
    "available": true,
    "rating": 4.6,
    "mentees": 30
  },
  {
    "id": "m83",
    "name": "Wei Lim",
    "university": "Nanyang Technological University (NTU)",
    "graduatedYear": 2021,
    "currentRole": "AI Hardware Engineer at NVIDIA",
    "expertise": [
      "STEM",
      "Engineering",
      "Computer Science",
      "Research Experience"
    ],
    "bio": "NTU's advanced engineering programs prepared me for AI hardware innovation. I can share insights into this cutting-edge field.",
    "available": false,
    "rating": 4.9,
    "mentees": 100
  },
  {
    "id": "m84",
    "name": "Chloe Zhao",
    "university": "University of St Andrews",
    "graduatedYear": 2023,
    "currentRole": "Policy Advisor at Scottish Government",
    "expertise": [
      "Liberal Arts",
      "UK Universities",
      "Scholarships",
      "Essays"
    ],
    "bio": "St Andrews' intimate environment fostered deep research. I'm keen to advise on academic excellence and securing grants.",
    "available": true,
    "rating": 4.7,
    "mentees": 52
  },
  {
    "id": "m85",
    "name": "Ricardo Mendez",
    "university": "Universidad Nacional Aut\u00f3noma de M\u00e9xico (UNAM)",
    "graduatedYear": 2020,
    "currentRole": "Architectural Designer at Sordo Madaleno Arquitectos",
    "expertise": [
      "Art & Design",
      "Engineering",
      "Essays",
      "Interviews"
    ],
    "bio": "UNAM's rich design history fuelled my architectural career. I can help you build an impressive portfolio.",
    "available": true,
    "rating": 4.6,
    "mentees": 77
  },
  {
    "id": "m86",
    "name": "Sophie Martin",
    "university": "University of California, Los Angeles (UCLA)",
    "graduatedYear": 2024,
    "currentRole": "Film Producer Assistant at Netflix",
    "expertise": [
      "Art & Design",
      "Liberal Arts",
      "Essays",
      "Interviews"
    ],
    "bio": "UCLA's film program opened doors to Hollywood. I'm excited to help aspiring filmmakers prepare their portfolios and pitches.",
    "available": true,
    "rating": 4.7,
    "mentees": 39
  },
  {
    "id": "m87",
    "name": "Hamza Chaudhry",
    "university": "King George's Medical University, India",
    "graduatedYear": 2019,
    "currentRole": "Surgeon at All India Institute of Medical Sciences (AIIMS)",
    "expertise": [
      "Medicine",
      "Pre-Med",
      "Research Experience",
      "Interviews"
    ],
    "bio": "From Lucknow to one of India's top medical centers, my journey has been focused on surgical excellence. I can guide aspiring surgeons.",
    "available": true,
    "rating": 4.9,
    "mentees": 118
  },
  {
    "id": "m88",
    "name": "Elsa Johansson",
    "university": "Lund University",
    "graduatedYear": 2022,
    "currentRole": "Biotech Consultant at McKinsey & Company",
    "expertise": [
      "STEM",
      "Business",
      "European Universities",
      "Interviews"
    ],
    "bio": "Lund's interdisciplinary focus prepared me for biotech consulting. I help students combine science with business strategy.",
    "available": false,
    "rating": 4.7,
    "mentees": 64
  },
  {
    "id": "m89",
    "name": "Samuel Abiy",
    "university": "University of Addis Ababa",
    "graduatedYear": 2020,
    "currentRole": "Public Health Specialist at UNICEF",
    "expertise": [
      "Medicine",
      "Liberal Arts",
      "Research Experience",
      "Scholarships"
    ],
    "bio": "My Ethiopian roots inspired my public health career. I can guide you in making a global impact through health policy.",
    "available": true,
    "rating": 4.8,
    "mentees": 85
  },
  {
    "id": "m90",
    "name": "Ryoichi Kobayashi",
    "university": "University of Tsukuba",
    "graduatedYear": 2023,
    "currentRole": "Computer Scientist at Hitachi",
    "expertise": [
      "STEM",
      "Computer Science",
      "Research Experience",
      "Interviews"
    ],
    "bio": "Tsukuba's strong research focus in AI was impactful. I provide guidance on machine learning and software development careers.",
    "available": true,
    "rating": 4.7,
    "mentees": 69
  },
  {
    "id": "m91",
    "name": "Isabel Guzman",
    "university": "University of Havana",
    "graduatedYear": 2021,
    "currentRole": "Biomedical Engineer at Johnson & Johnson",
    "expertise": [
      "STEM",
      "Engineering",
      "Medicine",
      "Essays"
    ],
    "bio": "From Cuba to medical device innovation, my journey has been about impact. I can help aspiring engineers passionate about healthcare.",
    "available": false,
    "rating": 4.6,
    "mentees": 70
  },
  {
    "id": "m92",
    "name": "David Schwartz",
    "university": "Carnegie Mellon University (CMU)",
    "graduatedYear": 2024,
    "currentRole": "AI Engineer at Apple",
    "expertise": [
      "STEM",
      "Computer Science",
      "Research Experience",
      "Interviews"
    ],
    "bio": "CMU was intense but prepared me for AI's cutting edge. I can help with technical interviews and research statement crafting.",
    "available": true,
    "rating": 5.0,
    "mentees": 45
  },
  {
    "id": "m93",
    "name": "Fatima Zahra",
    "university": "Al-Azhar University",
    "graduatedYear": 2020,
    "currentRole": "Infectious Disease Specialist at Ministry of Health, Egypt",
    "expertise": [
      "Medicine",
      "Pre-Med",
      "Research Experience",
      "Scholarships"
    ],
    "bio": "Al-Azhar's medical program was deeply rooted in community. I'm keen to guide future doctors focused on public health.",
    "available": true,
    "rating": 4.7,
    "mentees": 80
  },
  {
    "id": "m94",
    "name": "Niklas Ericsson",
    "university": "KTH Royal Institute of Technology",
    "graduatedYear": 2019,
    "currentRole": "Software Architect at Spotify",
    "expertise": [
      "STEM",
      "Computer Science",
      "European Universities",
      "Interviews"
    ],
    "bio": "KTH gave me a strong foundation in scalable systems. I love helping students optimize their coding and system design skills.",
    "available": true,
    "rating": 4.9,
    "mentees": 110
  },
  {
    "id": "m95",
    "name": "Grace Tan",
    "university": "University of Hong Kong (HKU)",
    "graduatedYear": 2021,
    "currentRole": "Financial Analyst at HSBC",
    "expertise": [
      "Business",
      "Scholarships",
      "Essays",
      "Interviews"
    ],
    "bio": "HKU's global financial hub prepared me for a fast-paced career. I offer insights on finance internships and networking.",
    "available": true,
    "rating": 4.7,
    "mentees": 75
  },
  {
    "id": "m96",
    "name": "Ahmed Rashid",
    "university": "King Saud University",
    "graduatedYear": 2022,
    "currentRole": "Biomedical Engineer at Philips Healthcare",
    "expertise": [
      "STEM",
      "Engineering",
      "Medicine",
      "Research Experience"
    ],
    "bio": "My engineering degree from KSU led me to medical device innovation. I can guide aspiring engineers in healthcare tech.",
    "available": false,
    "rating": 4.6,
    "mentees": 60
  },
  {
    "id": "m97",
    "name": "Maria Hernandez",
    "university": "University of Salamanca",
    "graduatedYear": 2020,
    "currentRole": "Translator at United Nations",
    "expertise": [
      "Liberal Arts",
      "European Universities",
      "Scholarships",
      "Essays"
    ],
    "bio": "From Spain to global communication at the UN, my humanities degree was key. I help students craft compelling narratives.",
    "available": true,
    "rating": 4.7,
    "mentees": 82
  },
  {
    "id": "m98",
    "name": "Leo Chung",
    "university": "KAIST (Korea Advanced Institute of Science and Technology)",
    "graduatedYear": 2023,
    "currentRole": "Robotics Researcher at Samsung",
    "expertise": [
      "STEM",
      "Engineering",
      "Computer Science",
      "Research Experience"
    ],
    "bio": "KAIST's intensive research focus shaped my robotics career. I'm excited to share insights into research and academia paths.",
    "available": true,
    "rating": 4.9,
    "mentees": 50
  },
  {
    "id": "m99",
    "name": "Zoe Thompson",
    "university": "Queen's University Belfast",
    "graduatedYear": 2024,
    "currentRole": "Software Engineer at Liberty IT",
    "expertise": [
      "STEM",
      "Computer Science",
      "UK Universities",
      "Interviews"
    ],
    "bio": "Queen's equipped me for a dynamic software career. I love helping students prepare for technical interviews and internships.",
    "available": true,
    "rating": 4.7,
    "mentees": 32
  },
  {
    "id": "m100",
    "name": "Aniket Sharma",
    "university": "BITS Pilani",
    "graduatedYear": 2018,
    "currentRole": "Senior Engineer at Flipkart",
    "expertise": [
      "STEM",
      "Engineering",
      "Computer Science",
      "Interviews"
    ],
    "bio": "BITS Pilani challenged me to excel in engineering. I'm keen to share my experience in e-commerce tech and career growth.",
    "available": true,
    "rating": 4.8,
    "mentees": 110
  }
];

export const FORUM_TOPICS: ForumTopic[] = [
  { id: "1", title: "How important are SAT scores for Ivy League in 2024?", author: "future_engineer_23", replies: 47, views: 1250, lastActive: "2 hours ago", tags: ["SAT/ACT", "Ivy League", "Test Optional"], pinned: true },
  { id: "2", title: "Best summer programs for pre-med students?", author: "aspiring_doc", replies: 32, views: 890, lastActive: "5 hours ago", tags: ["Medicine", "Summer Programs", "Research"] },
  { id: "3", title: "International students: How to explain financial need?", author: "intl_applicant_2025", replies: 28, views: 756, lastActive: "1 day ago", tags: ["Financial Aid", "International", "CSS Profile"] },
  { id: "4", title: "ED vs EA: What's the strategy for 2024-25?", author: "college_strategy", replies: 65, views: 2100, lastActive: "3 hours ago", tags: ["Strategy", "Early Decision", "Early Action"], pinned: true },
  { id: "5", title: "How to write a compelling 'Why Us' essay?", author: "essay_master", replies: 41, views: 1680, lastActive: "6 hours ago", tags: ["Essays", "Tips", "Supplements"] },
  { id: "6", title: "Scholarships for students from developing countries?", author: "scholarship_hunter", replies: 56, views: 3200, lastActive: "1 hour ago", tags: ["Scholarships", "International", "Financial Aid"] },
];
