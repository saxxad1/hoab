export type Boat = {
  id: number;
  slug: string;
  name: string;
  membership: string;
  type: string;
  status: string;
  district: string;
  operatingArea: string;
  capacity: number;
  cabins: number;
  acRooms: number;
  nonAcRooms: number;
  attachedWashrooms: number;
  commonWashrooms: number;
  startingPrice: number;
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
  verified: string;
  featured: boolean;
  amenities: string[];
};

export type Leader = {
  id: number;
  panel: "executive" | "advisory";
  term: string;
  name: string;
  role: string;
  organization: string;
  bio: string;
  photo: string;
  initials: string;
};

export type NewsItem = {
  id: number;
  slug: string;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  attachment: string;
  pinned: boolean;
};

export type PublicData = {
  boats: Boat[];
  leadership: Leader[];
  news: NewsItem[];
  agents: Array<Record<string, unknown>>;
  events: Array<{ id: number; name: string; eventDate: string; startTime: string; endTime: string; venue: string; description: string; poster: string; registrationUrl: string; status: string }>;
  resources: Array<{ id: number; title: string; category: string; description: string; fileUrl: string; externalUrl: string; displayOrder: number }>;
  pages: Array<{ id: number; pageKey: string; title: string; content: string }>;
  settings: Record<string, string>;
  stats: { registeredBoats: number; activeMembers: number; authorisedAgents: number; operatingDistricts: number };
};
