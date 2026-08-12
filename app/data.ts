export type Boat = {
  id: number;
  slug: string;
  name: string;
  nameBn: string;
  membership: string;
  type: string;
  status: string;
  district: string;
  operatingArea: string;
  capacity: number;
  cabins: number;
  airConditioned: boolean;
  image: string;
  gallery: string[];
  owner: string;
  phone: string;
  whatsapp: string;
  email: string;
  website: string;
  facebookUrl: string;
  description: string;
  descriptionBn: string;
  verified: string;
  featured: boolean;
  amenities: string[];
};

export type Leader = {
  id: number;
  panel: "executive" | "advisory";
  term: string;
  name: string;
  nameBn: string;
  role: string;
  roleBn: string;
  organization: string;
  bio: string;
  bioBn: string;
  photo: string;
  initials: string;
};

export type NewsItem = {
  id: number;
  slug: string;
  category: string;
  date: string;
  title: string;
  titleBn: string;
  excerpt: string;
  excerptBn: string;
  content: string;
  contentBn: string;
  featuredImage: string;
  attachment: string;
  pinned: boolean;
};

export type PublicData = {
  boats: Boat[];
  leadership: Leader[];
  news: NewsItem[];
  agents: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  resources: Array<Record<string, unknown>>;
  pages: Array<Record<string, unknown>>;
  settings: Record<string, string>;
  stats: { registeredBoats: number; activeMembers: number; authorisedAgents: number; operatingDistricts: number };
};
