import { eq } from "drizzle-orm";
import { getDb } from ".";
import {
  authorisedAgents,
  boatCategories,
  events,
  houseboats,
  leadership,
  pages,
  posts,
  resources,
  settings,
} from "./schema";

export async function seedDatabase() {
  const db = getDb();

  await db.transaction(async (tx) => {
    const [marker] = await tx.select().from(settings).where(eq(settings.key, "seed_version")).limit(1);
    if (marker?.value === "1") return;

    await tx.insert(boatCategories).values([
      { nameEn: "Wooden", displayOrder: 1 },
      { nameEn: "Steel", displayOrder: 2 },
      { nameEn: "Premium", displayOrder: 3 },
      { nameEn: "Other", displayOrder: 4 },
    ]);

    await tx.insert(houseboats).values([
      { membershipNumber: "HOAB-023", slug: "haor-princess", nameEn: "Haor Princess", ownerName: "Mahmudul Hasan", contactNumber: "+880 1712 345 678", email: "booking@haorprincess.example", category: "Premium", district: "Sylhet", capacity: 18, cabins: 6, coverImage: "/images/hero-houseboat.jpg", amenities: "[\"Air conditioning\",\"Life jackets\",\"Dining deck\",\"Wi-Fi\"]", featured: true, displayOrder: 1, lastVerifiedAt: "2026-08-01", descriptionEn: "A verified HOAB member operating responsible journeys across the haor." },
      { membershipNumber: "HOAB-041", slug: "green-paradise", nameEn: "Green Paradise", ownerName: "Sajid Ahmed", contactNumber: "+880 1811 245 870", email: "hello@greenparadise.example", category: "Wooden", district: "Sunamganj", capacity: 20, cabins: 8, coverImage: "/images/boat-paradise.jpg", amenities: "[\"Open deck\",\"Life jackets\",\"Private cabins\",\"Kitchen\"]", featured: true, displayOrder: 2, lastVerifiedAt: "2026-08-01", descriptionEn: "A verified HOAB member operating responsible journeys across the haor." },
      { membershipNumber: "HOAB-058", slug: "nil-dorpon", nameEn: "Nil Dorpôn", ownerName: "Tanvir Hossain", contactNumber: "+880 1914 861 224", email: "reservations@nildorpon.example", category: "Steel", district: "Habiganj", capacity: 14, cabins: 5, coverImage: "/images/boat-shampan.jpg", amenities: "[\"Family rooms\",\"Solar power\",\"Safety kit\",\"Upper deck\"]", featured: true, displayOrder: 3, lastVerifiedAt: "2026-08-01", descriptionEn: "A verified HOAB member operating responsible journeys across the haor." },
      { membershipNumber: "HOAB-067", slug: "shampan", nameEn: "Shampan", ownerName: "Abir Chowdhury", contactNumber: "+880 1678 443 290", email: "sail@shampan.example", category: "Wooden", district: "Sunamganj", capacity: 12, cabins: 4, coverImage: "/images/boat-shampan.jpg", amenities: "[\"Sun deck\",\"Meals\",\"Life jackets\",\"Generator\"]", displayOrder: 4, lastVerifiedAt: "2026-08-01" },
      { membershipNumber: "HOAB-082", slug: "jol-torongo", nameEn: "Jol Torongo", ownerName: "Nafis Rahman", contactNumber: "+880 1716 552 381", email: "journey@joltorongo.example", category: "Premium", district: "Sylhet", capacity: 24, cabins: 9, coverImage: "/images/hero-houseboat.jpg", amenities: "[\"Air conditioning\",\"Dining room\",\"Wi-Fi\",\"Guide\"]", displayOrder: 5, lastVerifiedAt: "2026-08-01" },
      { membershipNumber: "HOAB-096", slug: "haor-bilash", nameEn: "Haor Bilash", ownerName: "Rezwan Kabir", contactNumber: "+880 1890 711 432", email: "contact@haorbilash.example", category: "Steel", district: "Sunamganj", capacity: 16, cabins: 6, coverImage: "/images/boat-paradise.jpg", amenities: "[\"Panoramic deck\",\"Life jackets\",\"Family cabins\",\"Meals\"]", displayOrder: 6, lastVerifiedAt: "2026-08-01" },
    ]);

    await tx.insert(leadership).values([
      { panel: "executive", nameEn: "Kazi Mahbubul Alam", designationEn: "President", displayOrder: 1 },
      { panel: "executive", nameEn: "Syed Moinul Haque", designationEn: "Senior Vice President", displayOrder: 2 },
      { panel: "executive", nameEn: "Mohammad Arif Uddin", designationEn: "General Secretary", displayOrder: 3 },
      { panel: "executive", nameEn: "Tanvir Ahmed", designationEn: "Treasurer", displayOrder: 4 },
      { panel: "advisory", nameEn: "Dr. A. K. Enamul Haque", designationEn: "Tourism Advisor", displayOrder: 1 },
      { panel: "advisory", nameEn: "Brig. Gen. (Retd.) S. M. Nazmul Islam", designationEn: "Safety Advisor", displayOrder: 2 },
      { panel: "advisory", nameEn: "Farida Yasmin", designationEn: "Communications Advisor", displayOrder: 3 },
      { panel: "advisory", nameEn: "Md. Nurul Islam", designationEn: "Industry Advisor", displayOrder: 4 },
    ]);

    await tx.insert(posts).values([
      { slug: "monsoon-safety-protocol-2026", category: "Official Notice", titleEn: "Monsoon safety protocol issued for all registered operators", excerptEn: "Updated navigation, passenger-list and life-jacket guidance for the 2026 season.", contentEn: "Official HOAB communication. Further details can be updated from the management system.", pinned: true },
      { slug: "new-houseboats-verified", category: "Member Announcement", titleEn: "Eight new houseboats complete HOAB verification", excerptEn: "The new members have completed documentation and operational review.", contentEn: "Official HOAB communication. Further details can be updated from the management system." },
      { slug: "tourism-roundtable-september", category: "HOAB Event", titleEn: "Houseboat tourism roundtable set for September", excerptEn: "Owners, agents and local stakeholders will meet in Sunamganj.", contentEn: "Official HOAB communication. Further details can be updated from the management system." },
    ]);

    await tx.insert(authorisedAgents).values({ agentId: "HOAB-A-0023", agencyName: "Delta Routes", contactName: "Nusrat Jahan", phone: "+880 1711 222 333", email: "hello@deltaroutes.example", location: "Dhaka", validSince: "2026-05-01", displayOrder: 1 });
    await tx.insert(events).values({ nameEn: "HOAB Houseboat Tourism Roundtable", eventDate: "2026-09-18", startTime: "10:00", venue: "Sunamganj District Shilpakala Academy", descriptionEn: "An industry dialogue on standards, safety and responsible growth." });
    await tx.insert(resources).values([
      { titleEn: "B2B Registration Requirements", category: "Form", descriptionEn: "Required documents and application guidance.", externalUrl: "/b2b/apply", displayOrder: 1 },
      { titleEn: "Houseboat Safety Guidelines", category: "Guideline", descriptionEn: "Core passenger and operator safety guidance.", displayOrder: 2 },
    ]);
    await tx.insert(pages).values([
      { pageKey: "about", titleEn: "About HOAB", contentEn: "HOAB represents, supports and organises Bangladesh’s growing houseboat tourism community. The association promotes verified membership, operational standards, responsible tourism and stronger cooperation among owners, agents and public stakeholders." },
      { pageKey: "membership", titleEn: "Become a HOAB Member", contentEn: "Eligible houseboat owners can contact the secretariat, prepare ownership and operational documents, complete verification and receive a unique membership number." },
    ]);
    await tx.insert(settings).values([
      { key: "site_name", value: "Houseboat Owners Association of Bangladesh" },
      { key: "official_email", value: "houseboatownersassociation70@gmail.com" },
      { key: "official_phone", value: "+880 1700 123 456" },
      { key: "office_address", value: "HOAB Secretariat, Sunamganj, Bangladesh" },
      { key: "seed_version", value: "1" },
    ]);
  });
}
