"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  Compass,
  FileCheck2,
  Globe2,
  LifeBuoy,
  Mail,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  ShipWheel,
  SlidersHorizontal,
  Sparkles,
  Users,
  Waves,
  X,
} from "lucide-react";
import type { Boat, PublicData } from "../data";

type Language = "bn" | "en";

const copy = {
  en: {
    eyebrow: "Tanguar Haor · Bangladesh",
    title: "The voyage together.\nThe heritage forever.",
    subtitle:
      "The official platform of the Houseboat Owners Association of Bangladesh—uniting verified operators and advancing safer, sustainable tourism.",
    explore: "Explore registered houseboats",
    about: "Discover HOAB",
    searchTitle: "Find a registered houseboat",
    searchPlaceholder: "Search name, owner or member ID",
    search: "Search houseboats",
    featured: "Featured houseboats",
    viewAll: "View all houseboats",
  },
  bn: {
    eyebrow: "টাঙ্গুয়ার হাওর · বাংলাদেশ",
    title: "একসাথে যাত্রা।\nঐতিহ্য চিরন্তন।",
    subtitle:
      "হাউসবোট ওনার্স অ্যাসোসিয়েশন অব বাংলাদেশের অফিসিয়াল প্ল্যাটফর্ম—যাচাইকৃত অপারেটরদের একত্রিত করে নিরাপদ ও টেকসই পর্যটন গড়ে তুলছে।",
    explore: "নিবন্ধিত হাউসবোট দেখুন",
    about: "HOAB সম্পর্কে জানুন",
    searchTitle: "নিবন্ধিত হাউসবোট খুঁজুন",
    searchPlaceholder: "নাম, মালিক বা সদস্য নম্বর",
    search: "হাউসবোট খুঁজুন",
    featured: "নির্বাচিত হাউসবোট",
    viewAll: "সব হাউসবোট দেখুন",
  },
};

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`brand ${inverse ? "brand--inverse" : ""}`} href="/" aria-label="HOAB home">
      <span className="brand__word">
        H<span className="brand__wheel"><ShipWheel aria-hidden="true" /></span>AB
      </span>
      <span className="brand__full">Houseboat Owners Association</span>
      <span className="brand__country">Bangladesh</span>
    </a>
  );
}

export function Header({ language, onLanguage }: { language: Language; onLanguage: (language: Language) => void }) {
  const [open, setOpen] = useState(false);
  const links = [
    ["About HOAB", "/#about"],
    ["Houseboats", "/houseboats"],
    ["Leadership", "/#leadership"],
    ["B2B Agents", "/#b2b"],
    ["News & Notices", "/#news"],
    ["Contact", "/#contact"],
  ];

  return (
    <>
      <div className="notice-bar">
        <div className="shell notice-bar__inner">
          <span><span className="notice-bar__pulse" /> Official notice: Monsoon safety protocol 2026 is now available.</span>
          <div className="notice-bar__actions">
            <a href="/admin">Member portal</a>
            <span aria-hidden="true">|</span>
            <button className={language === "en" ? "is-active" : ""} onClick={() => onLanguage("en")}>EN</button>
            <span>/</span>
            <button className={language === "bn" ? "is-active" : ""} onClick={() => onLanguage("bn")}>বাংলা</button>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Primary navigation">
            {links.map(([label, href]) => <a href={href} key={label}>{label}</a>)}
          </nav>
          <a className="button button--dark header-cta" href="/houseboats">Find a boat <ArrowRight size={15} /></a>
          <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
            {open ? <X /> : <Menu />}
          </button>
        </div>
        {open && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {links.map(([label, href]) => <a href={href} key={label} onClick={() => setOpen(false)}>{label}<ArrowRight size={16} /></a>)}
            <a className="button button--gold" href="/houseboats">Find a registered houseboat</a>
          </nav>
        )}
      </header>
    </>
  );
}

export function VerifiedBadge() {
  return <span className="verified-badge"><BadgeCheck size={14} /> HOAB registered</span>;
}

export function BoatCard({ boat, onView }: { boat: Boat; onView: (boat: Boat) => void }) {
  return (
    <article className="boat-card">
      <div className="boat-card__image-wrap">
        <img className="boat-card__image" src={boat.image} alt={`${boat.name} houseboat`} />
        <VerifiedBadge />
        <span className="boat-card__id">{boat.membership}</span>
      </div>
      <div className="boat-card__content">
        <div className="boat-card__topline"><span>{boat.type}</span><span><MapPin size={13} /> {boat.district}</span></div>
        <h3>{boat.name}</h3>
        <p className="boat-card__bn">{boat.nameBn}</p>
        <div className="boat-card__facts">
          <span><Users size={15} /> {boat.capacity} guests</span>
          <span><BedDouble size={15} /> {boat.cabins} cabins</span>
        </div>
        <a className="text-link" href={`/houseboats/${boat.slug}`} onClick={(event) => { event.preventDefault(); onView(boat); }}>View verified profile <ArrowRight size={15} /></a>
      </div>
    </article>
  );
}

export function BoatModal({ boat, onClose }: { boat: Boat | null; onClose: () => void }) {
  useEffect(() => {
    if (!boat) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [boat, onClose]);

  if (!boat) return null;
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section className="boat-modal" role="dialog" aria-modal="true" aria-labelledby="boat-modal-title">
        <button className="modal-close" onClick={onClose} aria-label="Close"><X /></button>
        <div className="boat-modal__hero">
          <img src={boat.image} alt={`${boat.name} on Tanguar Haor`} />
          <div><VerifiedBadge /><p>{boat.membership}</p></div>
        </div>
        <div className="boat-modal__content">
          <p className="section-kicker">Verified houseboat profile</p>
          <h2 id="boat-modal-title">{boat.name}</h2>
          <p className="boat-modal__bn">{boat.nameBn}</p>
          <div className="profile-grid">
            <div><span>Owner / operator</span><strong>{boat.owner}</strong></div>
            <div><span>Operating area</span><strong>{boat.district}</strong></div>
            <div><span>Boat type</span><strong>{boat.type}</strong></div>
            <div><span>Capacity</span><strong>{boat.capacity} guests · {boat.cabins} cabins</strong></div>
          </div>
          <div className="verification-box">
            <ShieldCheck />
            <div><strong>Active HOAB membership</strong><p>Last verified {boat.verified}</p></div>
          </div>
          <div className="amenity-row">{boat.amenities.map((amenity) => <span key={amenity}><Check size={13} /> {amenity}</span>)}</div>
          <div className="modal-actions">
            <a className="button button--dark" href={`tel:${boat.phone.replace(/\s/g, "")}`}><Phone size={16} /> Call operator</a>
            <a className="button button--outline" href={`mailto:${boat.email}`}><Mail size={16} /> Email</a>
          </div>
          <p className="disclaimer">Booking and commercial arrangements are made directly with the respective houseboat operator.</p>
        </div>
      </section>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="shell footer__grid">
        <div className="footer__brand"><Logo inverse /><p>Uniting houseboat owners to protect the wetland, strengthen standards and grow responsible tourism.</p></div>
        <div><h3>Explore</h3><a href="/about">About HOAB</a><a href="/houseboats">Registered houseboats</a><a href="/#leadership">Leadership</a><a href="/#news">News & notices</a></div>
        <div><h3>Programs</h3><a href="/b2b/apply">B2B registration</a><a href="/verify-agent">Verify an agent</a><a href="/membership">Become a member</a><a href="/resources">Resources</a></div>
        <div><h3>Contact us</h3><p>HOAB Secretariat<br />House 12, Road 6, Banidhara<br />Sunamganj, Bangladesh</p><a href="tel:+8801700123456"><Phone size={14} /> +880 1700 123 456</a><a href="mailto:info@hoab.org.bd"><Mail size={14} /> info@hoab.org.bd</a></div>
      </div>
      <div className="shell footer__bottom"><span>© 2026 Houseboat Owners Association of Bangladesh</span><span><a href="/privacy-policy">Privacy</a><a href="/terms">Terms</a></span></div>
    </footer>
  );
}

function SearchPanel({ boats, onResult }: { boats: Boat[]; onResult: (results: Boat[]) => void }) {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("All districts");
  const [type, setType] = useState("All types");
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = query.toLowerCase().trim();
    const results = boats.filter((boat) => {
      const text = `${boat.name} ${boat.nameBn} ${boat.owner} ${boat.membership}`.toLowerCase();
      return (!normalized || text.includes(normalized)) && (district === "All districts" || boat.district === district) && (type === "All types" || boat.type === type);
    });
    onResult(results);
  };

  return (
    <form className="search-panel" onSubmit={submit}>
      <div className="search-panel__heading"><div><span className="section-kicker section-kicker--light">Official member directory</span><h2>Find a registered houseboat</h2></div><ShieldCheck size={36} /></div>
      <div className="search-panel__fields">
        <label className="search-field"><Search size={18} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, owner or membership ID" aria-label="Search houseboats" /></label>
        <label className="select-field"><span className="sr-only">District</span><select value={district} onChange={(e) => setDistrict(e.target.value)}><option>All districts</option><option>Sunamganj</option><option>Sylhet</option><option>Habiganj</option></select><ChevronDown size={16} /></label>
        <label className="select-field"><span className="sr-only">Type</span><select value={type} onChange={(e) => setType(e.target.value)}><option>All types</option><option>Premium</option><option>Wooden</option><option>Steel</option></select><ChevronDown size={16} /></label>
        <button className="button button--gold" type="submit">Search directory <ArrowRight size={16} /></button>
      </div>
      <p>Every public profile is reviewed by HOAB. Active members only.</p>
    </form>
  );
}

export default function HomePage({ data }: { data: PublicData }) {
  const [language, setLanguage] = useState<Language>("en");
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [searchResults, setSearchResults] = useState<Boat[] | null>(null);
  const [toast, setToast] = useState("");
  const t = copy[language];
  const boats = data.boats;
  const committee = data.leadership.filter((person) => person.panel === "executive").slice(0, 4);
  const advisors = data.leadership.filter((person) => person.panel === "advisory").slice(0, 4);
  const news = data.news.slice(0, 3);

  useEffect(() => {
    const saved = window.localStorage.getItem("hoab-language") as Language | null;
    if (saved === "bn" || saved === "en") setLanguage(saved);
  }, []);

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    window.localStorage.setItem("hoab-language", next);
    setToast(next === "bn" ? "বাংলা ভাষা নির্বাচন করা হয়েছে" : "English selected");
    window.setTimeout(() => setToast(""), 2200);
  };

  const showResults = (results: Boat[]) => {
    setSearchResults(results);
    window.setTimeout(() => document.querySelector("#search-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <main>
      <Header language={language} onLanguage={changeLanguage} />
      <section className="hero">
        <div className="hero__photo" aria-hidden="true" />
        <div className="hero__overlay" aria-hidden="true" />
        <div className="shell hero__content">
          <div className="hero__badge"><span /><span>{t.eyebrow}</span></div>
          <h1>{t.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
          <p>{t.subtitle}</p>
          <div className="hero__actions">
            <a className="button button--gold" href="/houseboats">{t.explore} <ArrowRight size={17} /></a>
            <a className="button button--glass" href="#about">{t.about}</a>
          </div>
          <div className="hero__seal"><ShipWheel /><span>Official<br />HOAB platform</span></div>
        </div>
        <div className="hero__foot">
          <div className="shell hero__foot-inner"><span><BadgeCheck /> Verified operators</span><span><LifeBuoy /> Safer standards</span><span><Waves /> Sustainable tourism</span></div>
        </div>
      </section>

      <section className="intro-section" id="about">
        <div className="shell intro-grid">
          <div className="ornament"><ShipWheel /><span>Est. for the haor</span></div>
          <div className="intro-copy"><span className="section-kicker">About the association</span><h2>An organised voice for Bangladesh&apos;s houseboat community.</h2><p>HOAB represents owners, supports operational standards and helps visitors identify legitimate operators. We bring members, travel partners and public stakeholders into one trusted ecosystem.</p><a className="text-link" href="/about">Read our story <ArrowRight size={15} /></a></div>
          <div className="stat-grid">
            <div><strong>{data.stats.registeredBoats}<sup>+</sup></strong><span>Registered boats</span></div>
            <div><strong>{data.stats.activeMembers}<sup>+</sup></strong><span>Active members</span></div>
            <div><strong>{data.stats.operatingDistricts}</strong><span>Operating districts</span></div>
            <div><strong>{data.stats.authorisedAgents}<sup>+</sup></strong><span>Authorised agents</span></div>
          </div>
        </div>
      </section>

      <section className="directory-search"><div className="shell"><SearchPanel boats={boats} onResult={showResults} /></div></section>

      {searchResults && (
        <section className="search-results-section" id="search-results">
          <div className="shell">
            <div className="section-heading"><div><span className="section-kicker">Search results</span><h2>{searchResults.length ? `${searchResults.length} verified ${searchResults.length === 1 ? "houseboat" : "houseboats"}` : "No registered houseboat found"}</h2></div><button className="text-link" onClick={() => setSearchResults(null)}>Clear results <X size={15} /></button></div>
            {searchResults.length ? <div className="boat-grid">{searchResults.map((boat) => <BoatCard boat={boat} onView={setSelectedBoat} key={boat.id} />)}</div> : <div className="empty-state"><Search /><p>Check the spelling, try another filter, or contact the HOAB secretariat.</p><a className="button button--outline" href="#contact">Contact HOAB</a></div>}
          </div>
        </section>
      )}

      <section className="featured-section" id="houseboats">
        <div className="shell">
          <div className="section-heading"><div><span className="section-kicker">Explore with confidence</span><h2>{t.featured}</h2></div><a className="text-link" href="/houseboats">{t.viewAll} <ArrowRight size={15} /></a></div>
          <div className="boat-grid">{boats.slice(0, 3).map((boat) => <BoatCard boat={boat} onView={setSelectedBoat} key={boat.id} />)}</div>
        </div>
      </section>

      <section className="trust-section">
        <div className="shell trust-grid">
          <div className="trust-image"><div className="trust-image__label"><span>Our promise</span><strong>Protecting the haor,<br />strengthening the journey.</strong></div></div>
          <div className="trust-copy"><span className="section-kicker">Why HOAB registration matters</span><h2>Clear information.<br />Responsible operators.</h2><p>Registration makes it easier to know who you are speaking with before you travel.</p><div className="trust-list">
            <div><BadgeCheck /><span><strong>Verified membership</strong><small>Active operators reviewed against association records.</small></span></div>
            <div><FileCheck2 /><span><strong>Transparent information</strong><small>Published membership, owner and contact details.</small></span></div>
            <div><ShieldCheck /><span><strong>Shared safety standards</strong><small>Clear operational guidance across the network.</small></span></div>
            <div><Globe2 /><span><strong>Responsible tourism</strong><small>A community protecting Tanguar Haor&apos;s future.</small></span></div>
          </div></div>
        </div>
      </section>

      <section className="leadership-section" id="leadership">
        <div className="shell">
          <div className="section-heading"><div><span className="section-kicker">Leadership · 2026—2028</span><h2>Experience at the helm.</h2></div><a className="text-link" href="/leadership">Meet the full leadership <ArrowRight size={15} /></a></div>
          <div className="leadership-panels">
            <div className="committee-panel"><div className="panel-title"><h3>Executive committee</h3><ShipWheel /></div><div className="people-grid">{committee.map((person) => <article className="person" key={person.name}><div className="person__avatar"><span>{person.initials}</span></div><strong>{language === "bn" && person.nameBn ? person.nameBn : person.name}</strong><span>{language === "bn" && person.roleBn ? person.roleBn : person.role}</span></article>)}</div></div>
            <div className="advisory-panel"><div className="panel-title"><h3>Advisory panel</h3><Sparkles /></div><div className="people-grid">{advisors.map((person) => <article className="person person--light" key={person.name}><div className="person__avatar person__avatar--line"><span>{person.initials}</span></div><strong>{language === "bn" && person.nameBn ? person.nameBn : person.name}</strong><span>{language === "bn" && person.roleBn ? person.roleBn : person.role}</span></article>)}</div></div>
          </div>
        </div>
      </section>

      <section className="b2b-section" id="b2b">
        <div className="shell b2b-card">
          <div className="b2b-icon"><Building2 /></div>
          <div><span className="section-kicker section-kicker--light">Trade partner program</span><h2>Become a HOAB authorised B2B agent.</h2><p>Connect your agency with a verified network and a clearer, more professional way to work.</p></div>
          <div className="b2b-actions"><a className="button button--gold" href="/b2b/apply">Apply online <ArrowRight size={16} /></a><a className="button button--glass" href="/b2b">View requirements</a></div>
        </div>
      </section>

      <section className="news-section" id="news">
        <div className="shell">
          <div className="section-heading"><div><span className="section-kicker">From the secretariat</span><h2>Latest news & notices</h2></div><a className="text-link" href="/news">View newsroom <ArrowRight size={15} /></a></div>
          <div className="news-grid">{news.map((item, index) => <article className="news-card" key={item.title}><div className="news-card__number">0{index + 1}</div><div className="news-card__meta"><span>{item.category}</span><span><CalendarDays size={13} /> {new Date(item.date).toLocaleDateString(language === "bn" ? "bn-BD" : "en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></div><h3>{language === "bn" && item.titleBn ? item.titleBn : item.title}</h3><p>{language === "bn" && item.excerptBn ? item.excerptBn : item.excerpt}</p><a className="text-link" href={`/news/${item.slug}`}>Read update <ArrowRight size={15} /></a></article>)}</div>
        </div>
      </section>

      <section className="visit-strip">
        <div className="shell visit-strip__inner"><div><Compass /><span><small>Planning a Tanguar Haor journey?</small><strong>Start with a verified operator.</strong></span></div><a className="button button--dark" href="/houseboats">Browse the directory <ArrowRight size={16} /></a></div>
      </section>
      <Footer />
      <BoatModal boat={selectedBoat} onClose={() => setSelectedBoat(null)} />
      {toast && <div className="toast"><Check size={16} /> {toast}</div>}
    </main>
  );
}

export function DirectoryPage({ boats }: { boats: Boat[] }) {
  const [language, setLanguage] = useState<Language>("en");
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All types");
  const [district, setDistrict] = useState("All districts");
  const [sort, setSort] = useState("Name A–Z");
  const [page, setPage] = useState(1);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const result = boats.filter((boat) => (`${boat.name} ${boat.nameBn} ${boat.owner} ${boat.membership}`.toLowerCase().includes(normalized)) && (type === "All types" || boat.type === type) && (district === "All districts" || boat.district === district));
    return [...result].sort((a, b) => sort === "Name Z–A" ? b.name.localeCompare(a.name) : sort === "Member ID" ? a.membership.localeCompare(b.membership) : a.name.localeCompare(b.name));
  }, [boats, query, type, district, sort]);

  return (
    <main>
      <Header language={language} onLanguage={setLanguage} />
      <section className="page-hero"><div className="shell"><span className="section-kicker section-kicker--light">Official HOAB registry</span><h1>Registered houseboats</h1><p>Search current active members by boat, owner, location or membership number.</p><div className="page-hero__trust"><BadgeCheck /> Records reviewed by the HOAB secretariat</div></div></section>
      <section className="directory-page"><div className="shell"><div className="directory-toolbar"><label className="directory-searchbox"><Search /><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Search name, owner or HOAB member ID" /><kbd>/</kbd></label><button className="filter-label" type="button"><SlidersHorizontal /> Filters</button></div><div className="directory-layout"><aside className="directory-filters"><h2>Refine directory</h2><label>Boat type<select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}><option>All types</option><option>Premium</option><option>Wooden</option><option>Steel</option></select></label><label>Operating district<select value={district} onChange={(e) => { setDistrict(e.target.value); setPage(1); }}><option>All districts</option><option>Sunamganj</option><option>Sylhet</option><option>Habiganj</option></select></label><div className="active-only"><span><Check /> Active members</span><small>Public directory policy</small></div><button className="text-link" onClick={() => { setQuery(""); setType("All types"); setDistrict("All districts"); setPage(1); }}>Reset filters</button></aside><div className="directory-results"><div className="directory-results__head"><p><strong>{filtered.length}</strong> active members found</p><label>Sort by <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}><option>Name A–Z</option><option>Name Z–A</option><option>Member ID</option></select></label></div>{filtered.length ? <><div className="boat-grid boat-grid--directory">{filtered.slice((page-1)*24,page*24).map((boat) => <BoatCard key={boat.id} boat={boat} onView={setSelectedBoat} />)}</div>{filtered.length>24&&<nav className="pagination" aria-label="Directory pages">{Array.from({length:Math.ceil(filtered.length/24)},(_,index)=>index+1).map((number)=><button className={number===page?"is-active":""} key={number} onClick={()=>setPage(number)}>{number}</button>)}</nav>}</> : <div className="empty-state"><Search /><h2>No registered houseboat found.</h2><p>Check your spelling or try another filter.</p></div>}</div></div></div></section>
      <Footer />
      <BoatModal boat={selectedBoat} onClose={() => setSelectedBoat(null)} />
    </main>
  );
}
