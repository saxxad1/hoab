import type { PublicData } from "../app/data";

const boats: PublicData["boats"] = [
  { id: 1, slug: "haor-princess", name: "Haor Princess", membership: "HOAB-023", type: "Premium", status: "active", district: "Sylhet", operatingArea: "Tanguar Haor", capacity: 18, cabins: 6, airConditioned: true, image: "/images/hero-houseboat.jpg", gallery: [], owner: "Mahmudul Hasan", phone: "+880 1712 345 678", whatsapp: "+880 1712 345 678", email: "booking@haorprincess.example", website: "", facebookUrl: "", description: "A verified HOAB member operating responsible journeys across the haor.", verified: "2026-08-01", featured: true, amenities: ["Air conditioning", "Life jackets", "Dining deck", "Wi-Fi"] },
  { id: 2, slug: "green-paradise", name: "Green Paradise", membership: "HOAB-041", type: "Wooden", status: "active", district: "Sunamganj", operatingArea: "Tanguar Haor", capacity: 20, cabins: 8, airConditioned: false, image: "/images/boat-paradise.jpg", gallery: [], owner: "Sajid Ahmed", phone: "+880 1811 245 870", whatsapp: "+880 1811 245 870", email: "hello@greenparadise.example", website: "", facebookUrl: "", description: "A verified HOAB member operating responsible journeys across the haor.", verified: "2026-08-01", featured: true, amenities: ["Open deck", "Life jackets", "Private cabins", "Kitchen"] },
  { id: 3, slug: "nil-dorpon", name: "Nil Dorpôn", membership: "HOAB-058", type: "Steel", status: "active", district: "Habiganj", operatingArea: "Tanguar Haor", capacity: 14, cabins: 5, airConditioned: false, image: "/images/boat-shampan.jpg", gallery: [], owner: "Tanvir Hossain", phone: "+880 1914 861 224", whatsapp: "+880 1914 861 224", email: "reservations@nildorpon.example", website: "", facebookUrl: "", description: "A verified HOAB member operating responsible journeys across the haor.", verified: "2026-08-01", featured: true, amenities: ["Family rooms", "Solar power", "Safety kit", "Upper deck"] },
  { id: 4, slug: "shampan", name: "Shampan", membership: "HOAB-067", type: "Wooden", status: "active", district: "Sunamganj", operatingArea: "Tanguar Haor", capacity: 12, cabins: 4, airConditioned: false, image: "/images/boat-shampan.jpg", gallery: [], owner: "Abir Chowdhury", phone: "+880 1678 443 290", whatsapp: "", email: "sail@shampan.example", website: "", facebookUrl: "", description: "A verified HOAB member.", verified: "2026-08-01", featured: false, amenities: ["Sun deck", "Meals", "Life jackets", "Generator"] },
  { id: 5, slug: "jol-torongo", name: "Jol Torongo", membership: "HOAB-082", type: "Premium", status: "active", district: "Sylhet", operatingArea: "Tanguar Haor", capacity: 24, cabins: 9, airConditioned: true, image: "/images/hero-houseboat.jpg", gallery: [], owner: "Nafis Rahman", phone: "+880 1716 552 381", whatsapp: "", email: "journey@joltorongo.example", website: "", facebookUrl: "", description: "A verified HOAB member.", verified: "2026-08-01", featured: false, amenities: ["Air conditioning", "Dining room", "Wi-Fi", "Guide"] },
  { id: 6, slug: "haor-bilash", name: "Haor Bilash", membership: "HOAB-096", type: "Steel", status: "active", district: "Sunamganj", operatingArea: "Tanguar Haor", capacity: 16, cabins: 6, airConditioned: false, image: "/images/boat-paradise.jpg", gallery: [], owner: "Rezwan Kabir", phone: "+880 1890 711 432", whatsapp: "", email: "contact@haorbilash.example", website: "", facebookUrl: "", description: "A verified HOAB member.", verified: "2026-08-01", featured: false, amenities: ["Panoramic deck", "Life jackets", "Family cabins", "Meals"] },
];

const leadership: PublicData["leadership"] = [
  { id: 1, panel: "executive", term: "2026–2028", name: "Kazi Mahbubul Alam", role: "President", organization: "HOAB", bio: "", photo: "", initials: "KM" },
  { id: 2, panel: "executive", term: "2026–2028", name: "Syed Moinul Haque", role: "Senior Vice President", organization: "HOAB", bio: "", photo: "", initials: "SM" },
  { id: 3, panel: "executive", term: "2026–2028", name: "Mohammad Arif Uddin", role: "General Secretary", organization: "HOAB", bio: "", photo: "", initials: "MA" },
  { id: 4, panel: "executive", term: "2026–2028", name: "Tanvir Ahmed", role: "Treasurer", organization: "HOAB", bio: "", photo: "", initials: "TA" },
  { id: 5, panel: "advisory", term: "2026–2028", name: "Dr. A. K. Enamul Haque", role: "Tourism Advisor", organization: "", bio: "", photo: "", initials: "DA" },
  { id: 6, panel: "advisory", term: "2026–2028", name: "S. M. Nazmul Islam", role: "Safety Advisor", organization: "", bio: "", photo: "", initials: "SM" },
  { id: 7, panel: "advisory", term: "2026–2028", name: "Farida Yasmin", role: "Communications Advisor", organization: "", bio: "", photo: "", initials: "FY" },
  { id: 8, panel: "advisory", term: "2026–2028", name: "Md. Nurul Islam", role: "Industry Advisor", organization: "", bio: "", photo: "", initials: "MN" },
];

const news: PublicData["news"] = [
  { id: 1, slug: "monsoon-safety-protocol-2026", category: "Official Notice", date: "2026-08-01T10:00:00.000Z", title: "Monsoon safety protocol issued for all registered operators", excerpt: "Updated navigation, passenger-list and life-jacket guidance for the 2026 season.", content: "Official HOAB communication. Further details can be updated from the management system.", featuredImage: "/images/tanguar-haor.jpg", attachment: "", pinned: true },
  { id: 2, slug: "new-houseboats-verified", category: "Member Announcement", date: "2026-07-20T10:00:00.000Z", title: "Eight new houseboats complete HOAB verification", excerpt: "The new members have completed documentation and operational review.", content: "Official HOAB communication.", featuredImage: "/images/boat-paradise.jpg", attachment: "", pinned: false },
  { id: 3, slug: "tourism-roundtable-september", category: "HOAB Event", date: "2026-07-12T10:00:00.000Z", title: "Houseboat tourism roundtable set for September", excerpt: "Owners, agents and local stakeholders will meet in Sunamganj.", content: "Official HOAB communication.", featuredImage: "/images/hero-houseboat.jpg", attachment: "", pinned: false },
];

export function getDemoPublicData(): PublicData {
  return {
    boats,
    leadership,
    news,
    agents: [{ id: 1, agentId: "HOAB-A-0023", agencyName: "Delta Routes", contactName: "Nusrat Jahan", phone: "+880 1711 222 333", email: "hello@deltaroutes.example", website: "", location: "Dhaka", logo: "", status: "authorised", validSince: "2026-05-01", expiresAt: "" }],
    events: [{ id: 1, name: "HOAB Houseboat Tourism Roundtable", eventDate: "2026-09-18", startTime: "10:00", endTime: "", venue: "Sunamganj District Shilpakala Academy", description: "An industry dialogue on standards, safety and responsible growth.", poster: "", registrationUrl: "", status: "upcoming" }],
    resources: [{ id: 1, title: "B2B Registration Requirements", category: "Form", description: "Required documents and application guidance.", fileUrl: "", externalUrl: "/b2b/apply", displayOrder: 1 }, { id: 2, title: "Houseboat Safety Guidelines", category: "Guideline", description: "Core passenger and operator safety guidance.", fileUrl: "", externalUrl: "", displayOrder: 2 }],
    pages: [{ id: 1, pageKey: "about", title: "About HOAB", content: "HOAB represents, supports and organises Bangladesh’s growing houseboat tourism community." }, { id: 2, pageKey: "membership", title: "Become a HOAB Member", content: "Eligible houseboat owners can complete verification and receive a unique membership number." }],
    settings: { site_name: "Houseboat Owners Association of Bangladesh", official_email: "info@hoab.org.bd", official_phone: "+880 1700 123 456", office_address: "HOAB Secretariat, Sunamganj, Bangladesh" },
    stats: { registeredBoats: boats.length, activeMembers: boats.length, authorisedAgents: 1, operatingDistricts: 3 },
  };
}
