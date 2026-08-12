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
      { nameEn: "Wooden", nameBn: "কাঠের", displayOrder: 1 },
      { nameEn: "Steel", nameBn: "স্টিল", displayOrder: 2 },
      { nameEn: "Premium", nameBn: "প্রিমিয়াম", displayOrder: 3 },
      { nameEn: "Other", nameBn: "অন্যান্য", displayOrder: 4 },
    ]);

    await tx.insert(houseboats).values([
      { membershipNumber: "HOAB-023", slug: "haor-princess", nameEn: "Haor Princess", nameBn: "হাওর প্রিন্সেস", ownerName: "Mahmudul Hasan", contactNumber: "+880 1712 345 678", email: "booking@haorprincess.example", category: "Premium", district: "Sylhet", capacity: 18, cabins: 6, coverImage: "/images/hero-houseboat.jpg", amenities: "[\"Air conditioning\",\"Life jackets\",\"Dining deck\",\"Wi-Fi\"]", featured: true, displayOrder: 1, lastVerifiedAt: "2026-08-01", descriptionEn: "A verified HOAB member operating responsible journeys across the haor.", descriptionBn: "হাওর অঞ্চলে দায়িত্বশীল ভ্রমণ পরিচালনাকারী একজন যাচাইকৃত HOAB সদস্য।" },
      { membershipNumber: "HOAB-041", slug: "green-paradise", nameEn: "Green Paradise", nameBn: "গ্রিন প্যারাডাইস", ownerName: "Sajid Ahmed", contactNumber: "+880 1811 245 870", email: "hello@greenparadise.example", category: "Wooden", district: "Sunamganj", capacity: 20, cabins: 8, coverImage: "/images/boat-paradise.jpg", amenities: "[\"Open deck\",\"Life jackets\",\"Private cabins\",\"Kitchen\"]", featured: true, displayOrder: 2, lastVerifiedAt: "2026-08-01", descriptionEn: "A verified HOAB member operating responsible journeys across the haor.", descriptionBn: "হাওর অঞ্চলে দায়িত্বশীল ভ্রমণ পরিচালনাকারী একজন যাচাইকৃত HOAB সদস্য।" },
      { membershipNumber: "HOAB-058", slug: "nil-dorpon", nameEn: "Nil Dorpôn", nameBn: "নীল দর্পণ", ownerName: "Tanvir Hossain", contactNumber: "+880 1914 861 224", email: "reservations@nildorpon.example", category: "Steel", district: "Habiganj", capacity: 14, cabins: 5, coverImage: "/images/boat-shampan.jpg", amenities: "[\"Family rooms\",\"Solar power\",\"Safety kit\",\"Upper deck\"]", featured: true, displayOrder: 3, lastVerifiedAt: "2026-08-01", descriptionEn: "A verified HOAB member operating responsible journeys across the haor.", descriptionBn: "হাওর অঞ্চলে দায়িত্বশীল ভ্রমণ পরিচালনাকারী একজন যাচাইকৃত HOAB সদস্য।" },
      { membershipNumber: "HOAB-067", slug: "shampan", nameEn: "Shampan", nameBn: "সাম্পান", ownerName: "Abir Chowdhury", contactNumber: "+880 1678 443 290", email: "sail@shampan.example", category: "Wooden", district: "Sunamganj", capacity: 12, cabins: 4, coverImage: "/images/boat-shampan.jpg", amenities: "[\"Sun deck\",\"Meals\",\"Life jackets\",\"Generator\"]", displayOrder: 4, lastVerifiedAt: "2026-08-01" },
      { membershipNumber: "HOAB-082", slug: "jol-torongo", nameEn: "Jol Torongo", nameBn: "জল তরঙ্গ", ownerName: "Nafis Rahman", contactNumber: "+880 1716 552 381", email: "journey@joltorongo.example", category: "Premium", district: "Sylhet", capacity: 24, cabins: 9, coverImage: "/images/hero-houseboat.jpg", amenities: "[\"Air conditioning\",\"Dining room\",\"Wi-Fi\",\"Guide\"]", displayOrder: 5, lastVerifiedAt: "2026-08-01" },
      { membershipNumber: "HOAB-096", slug: "haor-bilash", nameEn: "Haor Bilash", nameBn: "হাওর বিলাস", ownerName: "Rezwan Kabir", contactNumber: "+880 1890 711 432", email: "contact@haorbilash.example", category: "Steel", district: "Sunamganj", capacity: 16, cabins: 6, coverImage: "/images/boat-paradise.jpg", amenities: "[\"Panoramic deck\",\"Life jackets\",\"Family cabins\",\"Meals\"]", displayOrder: 6, lastVerifiedAt: "2026-08-01" },
    ]);

    await tx.insert(leadership).values([
      { panel: "executive", nameEn: "Kazi Mahbubul Alam", nameBn: "কাজী মাহবুবুল আলম", designationEn: "President", designationBn: "সভাপতি", displayOrder: 1 },
      { panel: "executive", nameEn: "Syed Moinul Haque", nameBn: "সৈয়দ মঈনুল হক", designationEn: "Senior Vice President", designationBn: "সিনিয়র সহ-সভাপতি", displayOrder: 2 },
      { panel: "executive", nameEn: "Mohammad Arif Uddin", nameBn: "মোহাম্মদ আরিফ উদ্দিন", designationEn: "General Secretary", designationBn: "সাধারণ সম্পাদক", displayOrder: 3 },
      { panel: "executive", nameEn: "Tanvir Ahmed", nameBn: "তানভীর আহমেদ", designationEn: "Treasurer", designationBn: "কোষাধ্যক্ষ", displayOrder: 4 },
      { panel: "advisory", nameEn: "Dr. A. K. Enamul Haque", nameBn: "ড. এ. কে. এনামুল হক", designationEn: "Tourism Advisor", designationBn: "পর্যটন উপদেষ্টা", displayOrder: 1 },
      { panel: "advisory", nameEn: "Brig. Gen. (Retd.) S. M. Nazmul Islam", nameBn: "ব্রিগেডিয়ার জেনারেল (অব.) এস. এম. নাজমুল ইসলাম", designationEn: "Safety Advisor", designationBn: "নিরাপত্তা উপদেষ্টা", displayOrder: 2 },
      { panel: "advisory", nameEn: "Farida Yasmin", nameBn: "ফরিদা ইয়াসমিন", designationEn: "Communications Advisor", designationBn: "যোগাযোগ উপদেষ্টা", displayOrder: 3 },
      { panel: "advisory", nameEn: "Md. Nurul Islam", nameBn: "মো. নুরুল ইসলাম", designationEn: "Industry Advisor", designationBn: "শিল্প উপদেষ্টা", displayOrder: 4 },
    ]);

    await tx.insert(posts).values([
      { slug: "monsoon-safety-protocol-2026", category: "Official Notice", titleEn: "Monsoon safety protocol issued for all registered operators", titleBn: "নিবন্ধিত অপারেটরদের জন্য বর্ষা নিরাপত্তা প্রটোকল", excerptEn: "Updated navigation, passenger-list and life-jacket guidance for the 2026 season.", excerptBn: "২০২৬ মৌসুমের জন্য নৌচালনা, যাত্রী তালিকা ও লাইফ জ্যাকেট সংক্রান্ত নির্দেশনা।", contentEn: "Official HOAB communication. Further details can be updated from the management system.", contentBn: "অফিসিয়াল HOAB যোগাযোগ। বিস্তারিত ব্যবস্থাপনা সিস্টেম থেকে হালনাগাদ করা যাবে।", pinned: true },
      { slug: "new-houseboats-verified", category: "Member Announcement", titleEn: "Eight new houseboats complete HOAB verification", titleBn: "আটটি নতুন হাউসবোটের HOAB যাচাই সম্পন্ন", excerptEn: "The new members have completed documentation and operational review.", excerptBn: "নতুন সদস্যরা নথি ও পরিচালনাগত পর্যালোচনা সম্পন্ন করেছে।", contentEn: "Official HOAB communication. Further details can be updated from the management system.", contentBn: "অফিসিয়াল HOAB যোগাযোগ। বিস্তারিত ব্যবস্থাপনা সিস্টেম থেকে হালনাগাদ করা যাবে।" },
      { slug: "tourism-roundtable-september", category: "HOAB Event", titleEn: "Houseboat tourism roundtable set for September", titleBn: "সেপ্টেম্বরে হাউসবোট পর্যটন গোলটেবিল", excerptEn: "Owners, agents and local stakeholders will meet in Sunamganj.", excerptBn: "মালিক, এজেন্ট ও স্থানীয় অংশীজন সুনামগঞ্জে মিলিত হবেন।", contentEn: "Official HOAB communication. Further details can be updated from the management system.", contentBn: "অফিসিয়াল HOAB যোগাযোগ। বিস্তারিত ব্যবস্থাপনা সিস্টেম থেকে হালনাগাদ করা যাবে।" },
    ]);

    await tx.insert(authorisedAgents).values({ agentId: "HOAB-A-0023", agencyName: "Delta Routes", contactName: "Nusrat Jahan", phone: "+880 1711 222 333", email: "hello@deltaroutes.example", location: "Dhaka", validSince: "2026-05-01", displayOrder: 1 });
    await tx.insert(events).values({ nameEn: "HOAB Houseboat Tourism Roundtable", nameBn: "HOAB হাউসবোট পর্যটন গোলটেবিল", eventDate: "2026-09-18", startTime: "10:00", venue: "Sunamganj District Shilpakala Academy", descriptionEn: "An industry dialogue on standards, safety and responsible growth.", descriptionBn: "মান, নিরাপত্তা ও দায়িত্বশীল প্রবৃদ্ধি নিয়ে শিল্প সংলাপ।" });
    await tx.insert(resources).values([
      { titleEn: "B2B Registration Requirements", titleBn: "B2B নিবন্ধনের প্রয়োজনীয়তা", category: "Form", descriptionEn: "Required documents and application guidance.", descriptionBn: "প্রয়োজনীয় নথি ও আবেদন নির্দেশিকা।", externalUrl: "/b2b/apply", displayOrder: 1 },
      { titleEn: "Houseboat Safety Guidelines", titleBn: "হাউসবোট নিরাপত্তা নির্দেশিকা", category: "Guideline", descriptionEn: "Core passenger and operator safety guidance.", descriptionBn: "যাত্রী ও অপারেটর নিরাপত্তার মূল নির্দেশনা।", displayOrder: 2 },
    ]);
    await tx.insert(pages).values([
      { pageKey: "about", titleEn: "About HOAB", titleBn: "HOAB সম্পর্কে", contentEn: "HOAB represents, supports and organises Bangladesh’s growing houseboat tourism community. The association promotes verified membership, operational standards, responsible tourism and stronger cooperation among owners, agents and public stakeholders.", contentBn: "HOAB বাংলাদেশের ক্রমবর্ধমান হাউসবোট পর্যটন সম্প্রদায়কে প্রতিনিধিত্ব, সহায়তা ও সংগঠিত করে। সংগঠনটি যাচাইকৃত সদস্যপদ, পরিচালনাগত মান, দায়িত্বশীল পর্যটন এবং মালিক, এজেন্ট ও সরকারি অংশীজনদের মধ্যে শক্তিশালী সহযোগিতা উন্নীত করে।" },
      { pageKey: "membership", titleEn: "Become a HOAB Member", titleBn: "HOAB সদস্য হোন", contentEn: "Eligible houseboat owners can contact the secretariat, prepare ownership and operational documents, complete verification and receive a unique membership number.", contentBn: "যোগ্য হাউসবোট মালিকরা সচিবালয়ের সাথে যোগাযোগ করে মালিকানা ও পরিচালনাগত নথি প্রস্তুত, যাচাই সম্পন্ন এবং একটি অনন্য সদস্য নম্বর পেতে পারেন।" },
    ]);
    await tx.insert(settings).values([
      { key: "site_name", value: "Houseboat Owners Association of Bangladesh" },
      { key: "official_email", value: "info@hoab.org.bd" },
      { key: "official_phone", value: "+880 1700 123 456" },
      { key: "office_address", value: "HOAB Secretariat, Sunamganj, Bangladesh" },
      { key: "seed_version", value: "1" },
    ]);
  });
}
