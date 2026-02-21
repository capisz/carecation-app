export interface Provider {
  id: string;
  name: string;
  country: string;
  city: string;
  procedures: string[];
  languages: string[];
  accreditation: string[];
  priceRangeUSD: { min: number; max: number };
  rating: number;
  reviewCount: number;
  packageIncludes: string[];
  recoveryDays: number;
  images: string[];
  description: string;
}

export const PROCEDURE_CATEGORIES = [
  "Dental", 
  "Cosmetic", 
  "Orthopedic", 
  "Cardiology", 
  "Imaging & Diagnostics",
  "Eye Care",
  "Fertility",
  "Weight Loss Surgery"
] as const;
export type ProcedureCategory = (typeof PROCEDURE_CATEGORIES)[number];

export const COUNTRIES = ["Thailand", "Mexico", "Turkey"] as const;

// Broader destination list used in intake/travel planning.
export const INTAKE_DESTINATIONS = [
  "Thailand",
  "Mexico",
  "Turkey",
  "Spain",
  "Guatemala",
  "South Korea",
  "Vietnam",
  "Cuba",
  "Taiwan",
  "Sweden",
  "Norway",
  "Singapore",
  "Ireland",
  "Japan",
  "Netherlands",
] as const;

export const LANGUAGES = ["English", "Spanish", "Thai", "Turkish", "German", "French"] as const;

export const BUDGET_RANGES = [
  { label: "Under $2,000", min: 0, max: 2000 },
  { label: "$2,000 - $5,000", min: 2000, max: 5000 },
  { label: "$5,000 - $10,000", min: 5000, max: 10000 },
  { label: "$10,000+", min: 10000, max: 100000 },
] as const;

export const RECOVERY_COMFORT = ["low", "medium", "high"] as const;
export type RecoveryComfort = (typeof RECOVERY_COMFORT)[number];

export const TRAVEL_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export const providers: Provider[] = [
  {
    id: "th-dental-1",
    name: "Bangkok Smile Dental Clinic",
    country: "Thailand",
    city: "Bangkok",
    procedures: ["Dental Implants", "Veneers", "Crowns", "Root Canal"],
    languages: ["English", "Thai"],
    accreditation: ["JCI", "ISO 9001"],
    priceRangeUSD: { min: 800, max: 3500 },
    rating: 4.8,
    reviewCount: 342,
    packageIncludes: ["Airport transfer", "Hotel booking assistance", "Post-op follow-up", "Digital X-rays"],
    recoveryDays: 3,
    images: ["/placeholder-provider.jpg"],
    description: "Award-winning dental clinic in the heart of Bangkok with over 15 years of experience serving international patients. State-of-the-art equipment and a multilingual team ensure comfortable, world-class dental care.",
  },
  {
    id: "th-dental-2",
    name: "Phuket Dental Studio",
    country: "Thailand",
    city: "Phuket",
    procedures: ["Dental Implants", "Teeth Whitening", "Veneers"],
    languages: ["English", "Thai", "German"],
    accreditation: ["JCI"],
    priceRangeUSD: { min: 600, max: 2800 },
    rating: 4.6,
    reviewCount: 198,
    packageIncludes: ["Beachside recovery villa", "Airport pickup", "Treatment coordinator", "Follow-up calls"],
    recoveryDays: 2,
    images: ["/placeholder-provider.jpg"],
    description: "Combine world-class dental care with a tropical recovery in Phuket. Our beachside clinic offers a relaxing environment with cutting-edge dental technology.",
  },
  {
    id: "th-cosm-1",
    name: "Yanhee Hospital",
    country: "Thailand",
    city: "Bangkok",
    procedures: ["Rhinoplasty", "Facelift", "Liposuction", "Breast Augmentation"],
    languages: ["English", "Thai"],
    accreditation: ["JCI", "Thailand Medical Tourism Association"],
    priceRangeUSD: { min: 3000, max: 12000 },
    rating: 4.7,
    reviewCount: 567,
    packageIncludes: ["Private suite", "24/7 nursing", "Airport VIP transfer", "Post-op garments", "All medications"],
    recoveryDays: 7,
    images: ["/placeholder-provider.jpg"],
    description: "One of Thailand's most renowned cosmetic surgery hospitals. Yanhee has performed over 100,000 procedures for patients from 130+ countries with consistently excellent outcomes.",
  },
  {
    id: "th-cosm-2",
    name: "Bumrungrad International",
    country: "Thailand",
    city: "Bangkok",
    procedures: ["Rhinoplasty", "Blepharoplasty", "Facelift"],
    languages: ["English", "Thai", "French"],
    accreditation: ["JCI", "AACI"],
    priceRangeUSD: { min: 4000, max: 15000 },
    rating: 4.9,
    reviewCount: 823,
    packageIncludes: ["VIP lounge", "Dedicated interpreter", "Private room", "Post-op follow-up", "Concierge service"],
    recoveryDays: 5,
    images: ["/placeholder-provider.jpg"],
    description: "Internationally acclaimed hospital serving 1.1 million patients annually from 190 countries. Premium facilities and world-leading surgeons.",
  },
  {
    id: "mx-dental-1",
    name: "Cancun Dental Specialists",
    country: "Mexico",
    city: "Cancun",
    procedures: ["Dental Implants", "All-on-4", "Veneers", "Crowns"],
    languages: ["English", "Spanish"],
    accreditation: ["ADA Certified", "Mexico Quality Certificate"],
    priceRangeUSD: { min: 700, max: 4000 },
    rating: 4.5,
    reviewCount: 256,
    packageIncludes: ["Hotel partner discounts", "Airport shuttle", "Bilingual coordinator", "Digital treatment plan"],
    recoveryDays: 3,
    images: ["/placeholder-provider.jpg"],
    description: "Located steps from the beach in Cancun's Hotel Zone, offering affordable dental care with US-standard equipment and materials. Perfect for combining treatment with a beach vacation.",
  },
  {
    id: "mx-dental-2",
    name: "Tijuana Dental Clinic",
    country: "Mexico",
    city: "Tijuana",
    procedures: ["Dental Implants", "Root Canal", "Crowns", "Bridges"],
    languages: ["English", "Spanish"],
    accreditation: ["ADA Certified"],
    priceRangeUSD: { min: 500, max: 3000 },
    rating: 4.4,
    reviewCount: 412,
    packageIncludes: ["Border crossing assistance", "Free parking", "Follow-up visits", "Panoramic X-ray"],
    recoveryDays: 2,
    images: ["/placeholder-provider.jpg"],
    description: "Just minutes from the US border, offering the convenience of high-quality dental care at a fraction of US prices. Ideal for patients from Southern California.",
  },
  {
    id: "mx-cosm-1",
    name: "Monterrey Cosmetic Center",
    country: "Mexico",
    city: "Monterrey",
    procedures: ["Liposuction", "Tummy Tuck", "Breast Augmentation", "BBL"],
    languages: ["English", "Spanish"],
    accreditation: ["Mexico Quality Certificate", "ISAPS Member"],
    priceRangeUSD: { min: 3500, max: 9000 },
    rating: 4.6,
    reviewCount: 189,
    packageIncludes: ["Recovery house", "Private nurse", "All medications", "Compression garments", "Airport transfer"],
    recoveryDays: 10,
    images: ["/placeholder-provider.jpg"],
    description: "Modern cosmetic surgery center in Mexico's industrial capital. Board-certified surgeons with training from top US and European institutions.",
  },
  {
    id: "mx-cosm-2",
    name: "Guadalajara Aesthetic Institute",
    country: "Mexico",
    city: "Guadalajara",
    procedures: ["Rhinoplasty", "Facelift", "Blepharoplasty"],
    languages: ["English", "Spanish"],
    accreditation: ["ISAPS Member"],
    priceRangeUSD: { min: 2800, max: 8000 },
    rating: 4.3,
    reviewCount: 134,
    packageIncludes: ["Hotel arrangement", "Post-op care package", "Bilingual staff", "Follow-up video calls"],
    recoveryDays: 7,
    images: ["/placeholder-provider.jpg"],
    description: "Boutique aesthetic institute specializing in facial procedures. Our intimate setting ensures personalized attention for every patient.",
  },
  {
    id: "tr-dental-1",
    name: "Istanbul Dental Care",
    country: "Turkey",
    city: "Istanbul",
    procedures: ["Dental Implants", "Veneers", "Hollywood Smile", "All-on-4"],
    languages: ["English", "Turkish", "German"],
    accreditation: ["JCI", "Turkish Dental Association"],
    priceRangeUSD: { min: 900, max: 4500 },
    rating: 4.7,
    reviewCount: 478,
    packageIncludes: ["5-star hotel", "VIP airport transfer", "City tour", "All dental materials", "Panoramic X-ray"],
    recoveryDays: 4,
    images: ["/placeholder-provider.jpg"],
    description: "Premier dental clinic in Istanbul's European side, offering all-inclusive dental tourism packages. Combine your treatment with exploring one of the world's most historic cities.",
  },
  {
    id: "tr-dental-2",
    name: "Antalya Smile Center",
    country: "Turkey",
    city: "Antalya",
    procedures: ["Veneers", "Teeth Whitening", "Crowns", "Dental Implants"],
    languages: ["English", "Turkish", "German"],
    accreditation: ["Turkish Dental Association", "ISO 9001"],
    priceRangeUSD: { min: 600, max: 3200 },
    rating: 4.5,
    reviewCount: 267,
    packageIncludes: ["Beachfront hotel", "Airport transfer", "Treatment coordinator", "Free consultation"],
    recoveryDays: 3,
    images: ["/placeholder-provider.jpg"],
    description: "Beautiful clinic on the Turkish Riviera. Recover in style with sea views and warm Mediterranean weather while getting top-tier dental care.",
  },
  {
    id: "tr-cosm-1",
    name: "Istanbul Aesthetics Hospital",
    country: "Turkey",
    city: "Istanbul",
    procedures: ["Rhinoplasty", "Hair Transplant", "Liposuction", "Facelift"],
    languages: ["English", "Turkish", "French"],
    accreditation: ["JCI", "ISAPS Member", "Turkish Ministry of Health"],
    priceRangeUSD: { min: 2500, max: 10000 },
    rating: 4.8,
    reviewCount: 692,
    packageIncludes: ["Luxury hotel", "VIP transfers", "Personal assistant", "All medications", "Compression garments"],
    recoveryDays: 7,
    images: ["/placeholder-provider.jpg"],
    description: "Turkey's leading cosmetic surgery hospital with over 50,000 international patients. Our surgeons are globally recognized with extensive media features.",
  },
  {
    id: "tr-cosm-2",
    name: "Ankara Medical Aesthetics",
    country: "Turkey",
    city: "Ankara",
    procedures: ["Hair Transplant", "Rhinoplasty", "Breast Augmentation"],
    languages: ["English", "Turkish"],
    accreditation: ["Turkish Ministry of Health"],
    priceRangeUSD: { min: 2000, max: 7500 },
    rating: 4.4,
    reviewCount: 156,
    packageIncludes: ["Hotel accommodation", "Airport transfer", "Interpreter", "Post-op kit"],
    recoveryDays: 5,
    images: ["/placeholder-provider.jpg"],
    description: "Located in Turkey's capital, offering quality cosmetic procedures at competitive prices. Experienced surgeons with a focus on natural-looking results.",
  },
  // Orthopedic providers
  {
    id: "th-ortho-1",
    name: "Bangkok Orthopedic Center",
    country: "Thailand",
    city: "Bangkok",
    procedures: ["Knee Replacement", "Hip Replacement", "Spinal Surgery"],
    languages: ["English", "Thai"],
    accreditation: ["JCI", "Thai Medical Council"],
    priceRangeUSD: { min: 8000, max: 18000 },
    rating: 4.7,
    reviewCount: 284,
    packageIncludes: ["Private room", "Physical therapy", "Post-op follow-up", "All medications", "Airport transfer"],
    recoveryDays: 14,
    images: ["/placeholder-provider.jpg"],
    description: "Specialized orthopedic hospital with state-of-the-art robotic surgery systems. Our team performs over 2,000 joint replacements annually with excellent outcomes.",
  },
  {
    id: "mx-ortho-1",
    name: "Monterrey Joint Institute",
    country: "Mexico",
    city: "Monterrey",
    procedures: ["Knee Replacement", "Hip Replacement", "Joint Reconstruction"],
    languages: ["English", "Spanish"],
    accreditation: ["Mexico Quality Certificate"],
    priceRangeUSD: { min: 7000, max: 15000 },
    rating: 4.5,
    reviewCount: 167,
    packageIncludes: ["Recovery facility", "Physical therapy", "All implants", "Post-op care"],
    recoveryDays: 12,
    images: ["/placeholder-provider.jpg"],
    description: "Leading orthopedic center in Northern Mexico. Board-certified surgeons trained at top US institutions.",
  },
  // Cardiology providers
  {
    id: "th-cardio-1",
    name: "Bangkok Heart Hospital",
    country: "Thailand",
    city: "Bangkok",
    procedures: ["Heart Bypass", "Valve Replacement", "Cardiac Catheterization"],
    languages: ["English", "Thai"],
    accreditation: ["JCI", "Thai Heart Association"],
    priceRangeUSD: { min: 15000, max: 35000 },
    rating: 4.9,
    reviewCount: 432,
    packageIncludes: ["ICU care", "All cardiac monitoring", "Medications", "Recovery suite", "Follow-up"],
    recoveryDays: 10,
    images: ["/placeholder-provider.jpg"],
    description: "Asia's premier cardiac care facility with over 30 years of excellence. Our cardiac surgeons are internationally recognized with fellowship training from leading institutions.",
  },
  // Imaging & Diagnostics
  {
    id: "th-imaging-1",
    name: "Bangkok Medical Imaging Center",
    country: "Thailand",
    city: "Bangkok",
    procedures: ["MRI Scan", "CT Scan", "PET Scan", "Full Body Screening"],
    languages: ["English", "Thai", "German"],
    accreditation: ["JCI", "ACR Accredited"],
    priceRangeUSD: { min: 400, max: 2000 },
    rating: 4.8,
    reviewCount: 567,
    packageIncludes: ["Digital reports", "Radiologist consultation", "CD of images", "English reports"],
    recoveryDays: 0,
    images: ["/placeholder-provider.jpg"],
    description: "State-of-the-art diagnostic imaging with latest generation equipment. Same-day results with expert radiologist interpretation.",
  },
  // Eye Care
  {
    id: "tr-eye-1",
    name: "Istanbul Vision Clinic",
    country: "Turkey",
    city: "Istanbul",
    procedures: ["LASIK", "Cataract Surgery", "Retinal Treatment"],
    languages: ["English", "Turkish", "German"],
    accreditation: ["Turkish Ophthalmology Association", "ISO 9001"],
    priceRangeUSD: { min: 1500, max: 4000 },
    rating: 4.7,
    reviewCount: 892,
    packageIncludes: ["All pre-op tests", "Post-op drops", "Follow-up visits", "Hotel package"],
    recoveryDays: 3,
    images: ["/placeholder-provider.jpg"],
    description: "Leading eye surgery center with over 50,000 successful procedures. Latest femtosecond laser technology for bladeless LASIK.",
  },
  {
    id: "mx-eye-1",
    name: "Cancun Eye Institute",
    country: "Mexico",
    city: "Cancun",
    procedures: ["LASIK", "Cataract Surgery"],
    languages: ["English", "Spanish"],
    accreditation: ["ADA Certified"],
    priceRangeUSD: { min: 1200, max: 3500 },
    rating: 4.6,
    reviewCount: 445,
    packageIncludes: ["Complete eye exam", "All medications", "Follow-up care", "Beach recovery"],
    recoveryDays: 2,
    images: ["/placeholder-provider.jpg"],
    description: "Modern eye surgery center in beautiful Cancun. Combine your vision correction with a tropical vacation.",
  },
  // Fertility
  {
    id: "th-fertility-1",
    name: "Bangkok IVF Center",
    country: "Thailand",
    city: "Bangkok",
    procedures: ["IVF", "Egg Freezing", "Fertility Assessment"],
    languages: ["English", "Thai"],
    accreditation: ["JCI", "RTAC Certified"],
    priceRangeUSD: { min: 5000, max: 15000 },
    rating: 4.8,
    reviewCount: 326,
    packageIncludes: ["All medications", "Monitoring", "Lab work", "Counseling", "Accommodation assistance"],
    recoveryDays: 5,
    images: ["/placeholder-provider.jpg"],
    description: "One of Asia's most successful fertility clinics with over 60% success rate. Compassionate care with cutting-edge reproductive technology.",
  },
  // Weight Loss Surgery
  {
    id: "mx-bariatric-1",
    name: "Tijuana Bariatric Center",
    country: "Mexico",
    city: "Tijuana",
    procedures: ["Gastric Bypass", "Gastric Sleeve", "Lap Band"],
    languages: ["English", "Spanish"],
    accreditation: ["ASMBS Member", "Mexico Quality Certificate"],
    priceRangeUSD: { min: 4500, max: 9000 },
    rating: 4.7,
    reviewCount: 534,
    packageIncludes: ["Recovery hotel", "Nutritionist", "All medications", "Post-op support group", "Airport transfer"],
    recoveryDays: 7,
    images: ["/placeholder-provider.jpg"],
    description: "Specialized bariatric surgery center with over 10,000 successful procedures. Comprehensive pre and post-op support for long-term success.",
  },
  {
    id: "tr-bariatric-1",
    name: "Istanbul Weight Loss Clinic",
    country: "Turkey",
    city: "Istanbul",
    procedures: ["Gastric Sleeve", "Gastric Bypass"],
    languages: ["English", "Turkish", "German"],
    accreditation: ["Turkish Ministry of Health", "IFSO Member"],
    priceRangeUSD: { min: 4000, max: 8500 },
    rating: 4.6,
    reviewCount: 412,
    packageIncludes: ["5-star hotel", "VIP transfer", "Nutritionist", "Vitamins", "Lifetime follow-up"],
    recoveryDays: 6,
    images: ["/placeholder-provider.jpg"],
    description: "Expert bariatric surgeons with international training. All-inclusive packages with comprehensive aftercare program.",
  },
];

/* Fixed travel & lodging placeholders used for estimated total trip cost */
export const TRAVEL_COST_PLACEHOLDER = { flights: 800, lodgingPerNight: 90, meals: 40 };

export function estimateTotalTripCost(provider: Provider): { min: number; max: number } {
  const { flights, lodgingPerNight, meals } = TRAVEL_COST_PLACEHOLDER;
  const stayDays = provider.recoveryDays + 4; // procedure + buffer
  const travelCost = flights + lodgingPerNight * stayDays + meals * stayDays;
  return {
    min: provider.priceRangeUSD.min + travelCost,
    max: provider.priceRangeUSD.max + travelCost,
  };
}

export function getProviderById(id: string): Provider | undefined {
  return providers.find((p) => p.id === id);
}

export function getProcedureCategory(procedure: string): ProcedureCategory {
  const dentalProcedures = ["Dental Implants", "Veneers", "Crowns", "Root Canal", "Teeth Whitening", "All-on-4", "Hollywood Smile", "Bridges"];
  const orthopedicProcedures = ["Knee Replacement", "Hip Replacement", "Spinal Surgery", "Joint Reconstruction"];
  const cardiologyProcedures = ["Heart Bypass", "Cardiac Catheterization", "Valve Replacement", "Angioplasty"];
  const imagingProcedures = ["MRI Scan", "CT Scan", "PET Scan", "Full Body Screening"];
  const eyeCareProcedures = ["LASIK", "Cataract Surgery", "Retinal Treatment", "Glaucoma Treatment"];
  const fertilityProcedures = ["IVF", "Egg Freezing", "Fertility Assessment", "Donor Programs"];
  const weightLossProcedures = ["Gastric Bypass", "Gastric Sleeve", "Lap Band", "Duodenal Switch"];
  
  if (dentalProcedures.includes(procedure)) return "Dental";
  if (orthopedicProcedures.includes(procedure)) return "Orthopedic";
  if (cardiologyProcedures.includes(procedure)) return "Cardiology";
  if (imagingProcedures.includes(procedure)) return "Imaging & Diagnostics";
  if (eyeCareProcedures.includes(procedure)) return "Eye Care";
  if (fertilityProcedures.includes(procedure)) return "Fertility";
  if (weightLossProcedures.includes(procedure)) return "Weight Loss Surgery";
  return "Cosmetic";
}

export function filterProviders(params: {
  procedure?: string;
  country?: string;
  budgetMin?: number;
  budgetMax?: number;
  language?: string;
  recoveryComfort?: RecoveryComfort;
}): Provider[] {
  let filtered = [...providers];

  if (params.procedure) {
    const category = params.procedure;
    filtered = filtered.filter((p) =>
      p.procedures.some((proc) => getProcedureCategory(proc) === category)
    );
  }

  if (params.country && params.country !== "Any") {
    filtered = filtered.filter((p) => p.country === params.country);
  }

  if (params.budgetMin !== undefined && params.budgetMax !== undefined) {
    filtered = filtered.filter(
      (p) => p.priceRangeUSD.min <= params.budgetMax! && p.priceRangeUSD.max >= params.budgetMin!
    );
  }

  if (params.language && params.language !== "Any") {
    filtered = filtered.filter((p) => p.languages.includes(params.language!));
  }

  if (params.recoveryComfort) {
    const maxDays = params.recoveryComfort === "low" ? 3 : params.recoveryComfort === "medium" ? 7 : 14;
    filtered = filtered.filter((p) => p.recoveryDays <= maxDays);
  }

  return filtered;
}
