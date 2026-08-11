export type CareerField = { title: string; keywords: string[]; items: string[] };

export const FIELD_MAP: CareerField[] = [
  { title: "Software & Engineering", keywords: ["software", "developer", "javascript", "python", "java", "react", "node", "backend", "frontend", "full stack", "programmer", "api", "database", "sql", "devops", "مطور", "برمجة"], items: ["Software Engineer", "Backend Developer", "Full Stack Developer"] },
  { title: "Data & Analytics", keywords: ["data", "analyst", "analytics", "machine learning", "power bi", "tableau", "statistics", "sql", "excel", "dashboard", "بيانات", "تحليل"], items: ["Data Analyst", "Business Intelligence Analyst", "Data Scientist"] },
  { title: "Accounting & Finance", keywords: ["accounting", "accountant", "finance", "financial", "audit", "tax", "sap fico", "bookkeep", "payable", "receivable", "cpa", "محاسب", "مالية"], items: ["Accountant", "Financial Analyst", "Finance Officer"] },
  { title: "Sales & Business Development", keywords: ["sales", "business development", "account manager", "client", "revenue", "crm", "quota", "b2b", "مبيعات", "تطوير أعمال"], items: ["Sales Executive", "Account Manager", "Business Development Manager"] },
  { title: "Marketing & Digital", keywords: ["marketing", "seo", "social media", "content", "brand", "campaign", "digital marketing", "advertis", "تسويق", "محتوى"], items: ["Marketing Specialist", "Digital Marketing Executive", "Social Media Manager"] },
  { title: "Human Resources", keywords: ["human resources", "recruit", "talent", "hr ", "payroll", "onboarding", "employee relations", "موارد بشرية", "توظيف"], items: ["HR Specialist", "Recruiter", "HR Coordinator"] },
  { title: "Healthcare & Medical", keywords: ["nurse", "nursing", "medical", "clinical", "patient", "hospital", "pharmac", "doctor", "physician", "health", "تمريض", "طبي", "صحة"], items: ["Registered Nurse", "Clinical Coordinator", "Medical Officer"] },
  { title: "Civil & Construction", keywords: ["civil", "construction", "site engineer", "structural", "autocad", "quantity survey", "architect", "hse", "مدني", "إنشاءات"], items: ["Civil Engineer", "Site Engineer", "Project Engineer"] },
  { title: "Mechanical & Electrical", keywords: ["mechanical", "electrical", "maintenance", "hvac", "plc", "automation", "technician", "manufacturing", "ميكانيكا", "كهرباء"], items: ["Mechanical Engineer", "Electrical Engineer", "Maintenance Engineer"] },
  { title: "IT & Support", keywords: ["it support", "network", "system admin", "helpdesk", "cisco", "windows server", "cyber", "security", "infrastructure", "دعم فني", "شبكات"], items: ["IT Support Specialist", "Network Administrator", "Systems Administrator"] },
  { title: "Customer Service", keywords: ["customer service", "call center", "support agent", "client service", "guest", "reception", "خدمة عملاء"], items: ["Customer Service Representative", "Call Center Agent", "Client Support Specialist"] },
  { title: "Teaching & Education", keywords: ["teacher", "teaching", "lecturer", "tutor", "curriculum", "classroom", "school", "pedagog", "academic coordinator", "معلم", "تدريس", "مدرسة"], items: ["Teacher", "Training Specialist", "Academic Coordinator"] },
  { title: "Operations Management", keywords: ["operations", "process improvement", "lean", "six sigma", "productivity", "kaizen", "عمليات", "تحسين"], items: ["Operations Lead", "Process Improvement Specialist", "Operations Coordinator"] },
  { title: "Logistics & Supply Chain", keywords: ["logistics", "supply chain", "warehouse", "procurement", "inventory", "shipping", "freight", "import", "export", "لوجستيات", "مشتريات", "مستودع"], items: ["Logistics Coordinator", "Supply Chain Analyst", "Warehouse Supervisor"] },
  { title: "Project Management", keywords: ["project manager", "pmp", "primavera", "ms project", "stakeholder", "scope", "milestone", "مشاريع"], items: ["Project Manager", "Project Coordinator", "PMO Analyst"] },
];

export const INDUSTRY_SCOPES: Record<string, string[]> = {
  "technology-data": ["Software & Engineering", "Data & Analytics", "IT & Support"],
  "business-operations": ["Accounting & Finance", "Sales & Business Development", "Operations Management", "Logistics & Supply Chain", "Project Management"],
  "people-service": ["Human Resources", "Healthcare & Medical", "Customer Service", "Teaching & Education"],
  "engineering-construction": ["Civil & Construction", "Mechanical & Electrical"],
};

export function demoLists(cvText: string, industryScope = "all"): CareerField[] {
  const text = String(cvText || "").toLowerCase();
  if (text.length < 25) return [];
  const fields = INDUSTRY_SCOPES[industryScope] ? FIELD_MAP.filter((field) => INDUSTRY_SCOPES[industryScope].includes(field.title)) : FIELD_MAP;
  const scored = fields.map((field) => ({ field, score: field.keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0) })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score);
  if (!scored.length) return [];
  const highestScore = scored[0].score;
  return scored.filter(({ score }, index) => index === 0 || (score >= 2 && score >= highestScore * 0.6)).slice(0, 3).map(({ field }) => field);
}
