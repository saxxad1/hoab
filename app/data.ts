export type Boat = {
  id: number;
  name: string;
  nameBn: string;
  membership: string;
  type: "Premium" | "Wooden" | "Steel";
  district: string;
  capacity: number;
  cabins: number;
  image: string;
  owner: string;
  phone: string;
  email: string;
  verified: string;
  amenities: string[];
};

export const boats: Boat[] = [
  {
    id: 1,
    name: "Haor Princess",
    nameBn: "হাওর প্রিন্সেস",
    membership: "HOAB-023",
    type: "Premium",
    district: "Sylhet",
    capacity: 18,
    cabins: 6,
    image: "/images/hero-houseboat.jpg",
    owner: "Mahmudul Hasan",
    phone: "+880 1712 345 678",
    email: "booking@haorprincess.example",
    verified: "12 June 2026",
    amenities: ["Air conditioning", "Life jackets", "Dining deck", "Wi-Fi"],
  },
  {
    id: 2,
    name: "Green Paradise",
    nameBn: "গ্রিন প্যারাডাইস",
    membership: "HOAB-041",
    type: "Wooden",
    district: "Sunamganj",
    capacity: 20,
    cabins: 8,
    image: "/images/boat-paradise.jpg",
    owner: "Sajid Ahmed",
    phone: "+880 1811 245 870",
    email: "hello@greenparadise.example",
    verified: "28 May 2026",
    amenities: ["Open deck", "Life jackets", "Private cabins", "Kitchen"],
  },
  {
    id: 3,
    name: "Nil Dorpôn",
    nameBn: "নীল দর্পণ",
    membership: "HOAB-058",
    type: "Steel",
    district: "Habiganj",
    capacity: 14,
    cabins: 5,
    image: "/images/boat-shampan.jpg",
    owner: "Tanvir Hossain",
    phone: "+880 1914 861 224",
    email: "reservations@nildorpon.example",
    verified: "04 July 2026",
    amenities: ["Family rooms", "Solar power", "Safety kit", "Upper deck"],
  },
  {
    id: 4,
    name: "Shampan",
    nameBn: "সাম্পান",
    membership: "HOAB-067",
    type: "Wooden",
    district: "Sunamganj",
    capacity: 12,
    cabins: 4,
    image: "/images/boat-shampan.jpg",
    owner: "Abir Chowdhury",
    phone: "+880 1678 443 290",
    email: "sail@shampan.example",
    verified: "19 June 2026",
    amenities: ["Sun deck", "Meals", "Life jackets", "Generator"],
  },
  {
    id: 5,
    name: "Jol Torongo",
    nameBn: "জল তরঙ্গ",
    membership: "HOAB-082",
    type: "Premium",
    district: "Sylhet",
    capacity: 24,
    cabins: 9,
    image: "/images/hero-houseboat.jpg",
    owner: "Nafis Rahman",
    phone: "+880 1716 552 381",
    email: "journey@joltorongo.example",
    verified: "01 August 2026",
    amenities: ["Air conditioning", "Dining room", "Wi-Fi", "Guide"],
  },
  {
    id: 6,
    name: "Haor Bilash",
    nameBn: "হাওর বিলাস",
    membership: "HOAB-096",
    type: "Steel",
    district: "Sunamganj",
    capacity: 16,
    cabins: 6,
    image: "/images/boat-paradise.jpg",
    owner: "Rezwan Kabir",
    phone: "+880 1890 711 432",
    email: "contact@haorbilash.example",
    verified: "22 July 2026",
    amenities: ["Panoramic deck", "Life jackets", "Family cabins", "Meals"],
  },
];

export const committee = [
  { name: "Kazi Mahbubul Alam", role: "President", initials: "KA", color: "#d6c3a0" },
  { name: "Syed Moinul Haque", role: "Senior Vice President", initials: "SH", color: "#bec7aa" },
  { name: "Mohammad Arif Uddin", role: "General Secretary", initials: "MA", color: "#d0b7a7" },
  { name: "Tanvir Ahmed", role: "Treasurer", initials: "TA", color: "#aabdb5" },
];

export const advisors = [
  { name: "Dr. A. K. Enamul Haque", role: "Tourism Advisor", initials: "AH" },
  { name: "Brig. Gen. (Retd.) S. M. Nazmul Islam", role: "Safety Advisor", initials: "NI" },
  { name: "Farida Yasmin", role: "Communications Advisor", initials: "FY" },
  { name: "Md. Nurul Islam", role: "Industry Advisor", initials: "MI" },
];

export const news = [
  {
    category: "Official Notice",
    date: "10 Aug 2026",
    title: "Monsoon safety protocol issued for all registered operators",
    excerpt: "Updated navigation, passenger-list and life-jacket guidance for the 2026 season.",
  },
  {
    category: "Member Announcement",
    date: "28 Jul 2026",
    title: "Eight new houseboats complete HOAB verification",
    excerpt: "The new members have completed documentation and operational review.",
  },
  {
    category: "HOAB Event",
    date: "14 Jul 2026",
    title: "Houseboat tourism roundtable set for September",
    excerpt: "Owners, agents and local stakeholders will meet in Sunamganj.",
  },
];
