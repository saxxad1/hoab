import { getD1 } from ".";
import initialMigration from "../drizzle/0000_broad_gorgon.sql?raw";
import mediaMigration from "../drizzle/0001_skinny_true_believers.sql?raw";

const boatSeed = [
  ["HOAB-023", "haor-princess", "Haor Princess", "হাওর প্রিন্সেস", "Mahmudul Hasan", "+880 1712 345 678", "booking@haorprincess.example", "Premium", "Sylhet", 18, 6, "/images/hero-houseboat.jpg", "[\"Air conditioning\",\"Life jackets\",\"Dining deck\",\"Wi-Fi\"]", 1, 1],
  ["HOAB-041", "green-paradise", "Green Paradise", "গ্রিন প্যারাডাইস", "Sajid Ahmed", "+880 1811 245 870", "hello@greenparadise.example", "Wooden", "Sunamganj", 20, 8, "/images/boat-paradise.jpg", "[\"Open deck\",\"Life jackets\",\"Private cabins\",\"Kitchen\"]", 1, 2],
  ["HOAB-058", "nil-dorpon", "Nil Dorpôn", "নীল দর্পণ", "Tanvir Hossain", "+880 1914 861 224", "reservations@nildorpon.example", "Steel", "Habiganj", 14, 5, "/images/boat-shampan.jpg", "[\"Family rooms\",\"Solar power\",\"Safety kit\",\"Upper deck\"]", 1, 3],
  ["HOAB-067", "shampan", "Shampan", "সাম্পান", "Abir Chowdhury", "+880 1678 443 290", "sail@shampan.example", "Wooden", "Sunamganj", 12, 4, "/images/boat-shampan.jpg", "[\"Sun deck\",\"Meals\",\"Life jackets\",\"Generator\"]", 0, 4],
  ["HOAB-082", "jol-torongo", "Jol Torongo", "জল তরঙ্গ", "Nafis Rahman", "+880 1716 552 381", "journey@joltorongo.example", "Premium", "Sylhet", 24, 9, "/images/hero-houseboat.jpg", "[\"Air conditioning\",\"Dining room\",\"Wi-Fi\",\"Guide\"]", 0, 5],
  ["HOAB-096", "haor-bilash", "Haor Bilash", "হাওর বিলাস", "Rezwan Kabir", "+880 1890 711 432", "contact@haorbilash.example", "Steel", "Sunamganj", 16, 6, "/images/boat-paradise.jpg", "[\"Panoramic deck\",\"Life jackets\",\"Family cabins\",\"Meals\"]", 0, 6],
];

const leaders = [
  ["executive", "Kazi Mahbubul Alam", "কাজী মাহবুবুল আলম", "President", "সভাপতি", 1],
  ["executive", "Syed Moinul Haque", "সৈয়দ মঈনুল হক", "Senior Vice President", "সিনিয়র সহ-সভাপতি", 2],
  ["executive", "Mohammad Arif Uddin", "মোহাম্মদ আরিফ উদ্দিন", "General Secretary", "সাধারণ সম্পাদক", 3],
  ["executive", "Tanvir Ahmed", "তানভীর আহমেদ", "Treasurer", "কোষাধ্যক্ষ", 4],
  ["advisory", "Dr. A. K. Enamul Haque", "ড. এ. কে. এনামুল হক", "Tourism Advisor", "পর্যটন উপদেষ্টা", 1],
  ["advisory", "Brig. Gen. (Retd.) S. M. Nazmul Islam", "ব্রিগেডিয়ার জেনারেল (অব.) এস. এম. নাজমুল ইসলাম", "Safety Advisor", "নিরাপত্তা উপদেষ্টা", 2],
  ["advisory", "Farida Yasmin", "ফরিদা ইয়াসমিন", "Communications Advisor", "যোগাযোগ উপদেষ্টা", 3],
  ["advisory", "Md. Nurul Islam", "মো. নুরুল ইসলাম", "Industry Advisor", "শিল্প উপদেষ্টা", 4],
];

const postSeed = [
  ["monsoon-safety-protocol-2026", "Official Notice", "Monsoon safety protocol issued for all registered operators", "নিবন্ধিত অপারেটরদের জন্য বর্ষা নিরাপত্তা প্রটোকল", "Updated navigation, passenger-list and life-jacket guidance for the 2026 season.", "২০২৬ মৌসুমের জন্য নৌচালনা, যাত্রী তালিকা ও লাইফ জ্যাকেট সংক্রান্ত নির্দেশনা।", 1],
  ["new-houseboats-verified", "Member Announcement", "Eight new houseboats complete HOAB verification", "আটটি নতুন হাউসবোটের HOAB যাচাই সম্পন্ন", "The new members have completed documentation and operational review.", "নতুন সদস্যরা নথি ও পরিচালনাগত পর্যালোচনা সম্পন্ন করেছে।", 0],
  ["tourism-roundtable-september", "HOAB Event", "Houseboat tourism roundtable set for September", "সেপ্টেম্বরে হাউসবোট পর্যটন গোলটেবিল", "Owners, agents and local stakeholders will meet in Sunamganj.", "মালিক, এজেন্ট ও স্থানীয় অংশীজন সুনামগঞ্জে মিলিত হবেন।", 0],
];

export async function seedDatabase() {
  const d1 = getD1();
  try {
    await d1.prepare("SELECT 1 FROM settings LIMIT 1").first();
  } catch {
    for (const migration of [initialMigration, mediaMigration]) {
      const statements = migration.split("--> statement-breakpoint").map((statement) => statement.trim()).filter(Boolean);
      if (statements.length) await d1.batch(statements.map((statement) => d1.prepare(statement)));
    }
  }
  const marker = await d1.prepare("SELECT value FROM settings WHERE key = 'seed_version'").first<{ value: string }>();
  if (marker?.value === "1") return;

  const statements: D1PreparedStatement[] = [];
  statements.push(d1.prepare("INSERT OR IGNORE INTO boat_categories (name_en,name_bn,display_order) VALUES ('Wooden','কাঠের',1),('Steel','স্টিল',2),('Premium','প্রিমিয়াম',3),('Other','অন্যান্য',4)"));
  for (const row of boatSeed) {
    statements.push(d1.prepare("INSERT OR IGNORE INTO houseboats (membership_number,slug,name_en,name_bn,owner_name,contact_number,email,category,district,capacity,cabins,cover_image,amenities,featured,display_order,status,published,last_verified_at,description_en,description_bn) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'active',1,'2026-08-01','A verified HOAB member operating responsible journeys across the haor.','হাওর অঞ্চলে দায়িত্বশীল ভ্রমণ পরিচালনাকারী একজন যাচাইকৃত HOAB সদস্য।')").bind(...row));
  }
  for (const row of leaders) {
    statements.push(d1.prepare("INSERT INTO leadership (panel,term,name_en,name_bn,designation_en,designation_bn,display_order) VALUES (?,'2026–2028',?,?,?,?,?)").bind(...row));
  }
  for (const row of postSeed) {
    statements.push(d1.prepare("INSERT OR IGNORE INTO posts (slug,type,category,title_en,title_bn,excerpt_en,excerpt_bn,content_en,content_bn,status,pinned) VALUES (?,'news',?,?,?,?,?,'Official HOAB communication. Further details can be updated from the management system.','অফিসিয়াল HOAB যোগাযোগ। বিস্তারিত ব্যবস্থাপনা সিস্টেম থেকে হালনাগাদ করা যাবে।','published',?)").bind(...row));
  }
  statements.push(d1.prepare("INSERT OR IGNORE INTO authorised_agents (agent_id,agency_name,contact_name,phone,email,location,status,valid_since,display_order) VALUES ('HOAB-A-0023','Delta Routes','Nusrat Jahan','+880 1711 222 333','hello@deltaroutes.example','Dhaka','authorised','2026-05-01',1)"));
  statements.push(d1.prepare("INSERT OR IGNORE INTO events (name_en,name_bn,event_date,start_time,venue,description_en,description_bn,status,published) VALUES ('HOAB Houseboat Tourism Roundtable','HOAB হাউসবোট পর্যটন গোলটেবিল','2026-09-18','10:00','Sunamganj District Shilpakala Academy','An industry dialogue on standards, safety and responsible growth.','মান, নিরাপত্তা ও দায়িত্বশীল প্রবৃদ্ধি নিয়ে শিল্প সংলাপ।','upcoming',1)"));
  statements.push(d1.prepare("INSERT OR IGNORE INTO resources (id,title_en,title_bn,category,description_en,description_bn,external_url,published,display_order) VALUES (1,'B2B Registration Requirements','B2B নিবন্ধনের প্রয়োজনীয়তা','Form','Required documents and application guidance.','প্রয়োজনীয় নথি ও আবেদন নির্দেশিকা।','/b2b/apply',1,1),(2,'Houseboat Safety Guidelines','হাউসবোট নিরাপত্তা নির্দেশিকা','Guideline','Core passenger and operator safety guidance.','যাত্রী ও অপারেটর নিরাপত্তার মূল নির্দেশনা।','',1,2)"));
  statements.push(d1.prepare("INSERT OR IGNORE INTO pages (page_key,title_en,title_bn,content_en,content_bn) VALUES ('about','About HOAB','HOAB সম্পর্কে','HOAB represents, supports and organises Bangladesh’s growing houseboat tourism community. The association promotes verified membership, operational standards, responsible tourism and stronger cooperation among owners, agents and public stakeholders.','HOAB বাংলাদেশের ক্রমবর্ধমান হাউসবোট পর্যটন সম্প্রদায়কে প্রতিনিধিত্ব, সহায়তা ও সংগঠিত করে। সংগঠনটি যাচাইকৃত সদস্যপদ, পরিচালনাগত মান, দায়িত্বশীল পর্যটন এবং মালিক, এজেন্ট ও সরকারি অংশীজনদের মধ্যে শক্তিশালী সহযোগিতা উন্নীত করে।'),('membership','Become a HOAB Member','HOAB সদস্য হোন','Eligible houseboat owners can contact the secretariat, prepare ownership and operational documents, complete verification and receive a unique membership number.','যোগ্য হাউসবোট মালিকরা সচিবালয়ের সাথে যোগাযোগ করে মালিকানা ও পরিচালনাগত নথি প্রস্তুত, যাচাই সম্পন্ন এবং একটি অনন্য সদস্য নম্বর পেতে পারেন।')"));
  statements.push(d1.prepare("INSERT OR REPLACE INTO settings (key,value,updated_at) VALUES ('site_name','Houseboat Owners Association of Bangladesh',CURRENT_TIMESTAMP),('official_email','info@hoab.org.bd',CURRENT_TIMESTAMP),('official_phone','+880 1700 123 456',CURRENT_TIMESTAMP),('office_address','HOAB Secretariat, Sunamganj, Bangladesh',CURRENT_TIMESTAMP),('seed_version','1',CURRENT_TIMESTAMP)"));
  await d1.batch(statements);
}
