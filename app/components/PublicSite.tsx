"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  FileCheck2,
  Globe2,
  LifeBuoy,
  Mail,
  MapPin,
  Menu,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  ShipWheel,
  Shuffle,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Users,
  Waves,
  X,
} from "lucide-react";
import type { Boat, PublicData } from "../data";

const copy = {
  eyebrow: "Tanguar Haor · Bangladesh",
  title: "UNITED FOR\nRESPONSIBLE\nHOUSEBOAT TOURISM.",
  subtitle:
    "Creating a trusted ecosystem where houseboat owners can grow, travelers can explore with confidence, and Tanguar Haor can thrive responsibly.",
  explore: "Explore registered houseboats",
  about: "Discover HOAB",
  featured: "Featured houseboats",
  viewAll: "View all houseboats",
};

export function Logo({ inverse = false }: { inverse?: boolean }) {
  return (
    <a className={`brand ${inverse ? "brand--inverse" : ""}`} href="/" aria-label="Houseboat Owner's Association Bangladesh home">
      <img
        className="brand__image"
        src="/brand/hoab-logo.png"
        alt="Houseboat Owner's Association Bangladesh"
        width="1396"
        height="606"
      />
    </a>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    ["About HOAB", "/#about"],
    ["Houseboats", "/houseboats"],
    ["Leadership", "/#leadership"],
    ["B2B Agents", "/#b2b"],
    ["News & Notices", "/#news"],
    ["Contact", "/#contact"],
  ];

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <div className="notice-bar">
        <div className="shell notice-bar__inner">
          <span><span className="notice-bar__pulse" /> Official notice: Monsoon safety protocol 2026 is now available.</span>
          <div className="notice-bar__actions">
            <a href="/admin">Member portal</a>
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
          <button
            className="menu-button"
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        {open && (
          <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">
            {links.map(([label, href]) => <a href={href} key={label} onClick={() => setOpen(false)}>{label}<ArrowRight size={16} /></a>)}
            <a className="button button--gold" href="/houseboats" onClick={() => setOpen(false)}>Find a registered houseboat</a>
          </nav>
        )}
      </header>
    </>
  );
}

export function VerifiedBadge() {
  return <span className="verified-badge"><BadgeCheck size={14} /> HOAB registered</span>;
}

export function getWhatsAppUrl(rawNumber: string, boatName?: string): string {
  if (!rawNumber) return "";
  const first = rawNumber.split(",")[0].trim();
  let digits = first.replace(/[^0-9]/g, "");
  if (!digits) return "";
  if (digits.startsWith("0")) {
    digits = "88" + digits;
  } else if (digits.length === 10 && digits.startsWith("1")) {
    digits = "880" + digits;
  }
  if (digits.length < 11) return "";

  const text = boatName
    ? encodeURIComponent(`Hello! I saw your houseboat "${boatName}" on the official HOAB website and would like to inquire about booking & availability.`)
    : encodeURIComponent("Hello! I would like to inquire about houseboat booking via HOAB.");

  return `https://wa.me/${digits}?text=${text}`;
}

export function BoatCard({ boat, onView }: { boat: Boat; onView: (boat: Boat) => void }) {
  const allPhotos = useMemo(() => {
    const list = [boat.image, ...(boat.gallery || [])].filter(Boolean);
    const unique = Array.from(new Set(list));
    return unique.length > 0 ? unique : ["/images/hero-houseboat.jpg"];
  }, [boat.image, boat.gallery]);

  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const waUrl = getWhatsAppUrl(boat.whatsapp, boat.name);

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActivePhotoIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActivePhotoIdx((prev) => (prev + 1) % allPhotos.length);
  };

  return (
    <article className="boat-card">
      <div className="boat-card__image-wrap">
        <img
          className="boat-card__image"
          src={allPhotos[activePhotoIdx] || allPhotos[0]}
          alt={`${boat.name} houseboat photo ${activePhotoIdx + 1}`}
          onClick={() => onView(boat)}
          style={{ cursor: "pointer" }}
        />
        <VerifiedBadge />
        <span className="boat-card__id">{boat.membership}</span>

        {allPhotos.length > 1 && (
          <>
            <button
              type="button"
              className="card-slider-arrow card-slider-arrow--prev"
              onClick={prevPhoto}
              aria-label="Previous photo"
              title="Previous photo"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="card-slider-arrow card-slider-arrow--next"
              onClick={nextPhoto}
              aria-label="Next photo"
              title="Next photo"
            >
              <ChevronRight size={16} />
            </button>
            <span className="card-slider-counter">
              {activePhotoIdx + 1} / {allPhotos.length}
            </span>
          </>
        )}
      </div>

      <div className="boat-card__content">
        <div className="boat-card__topline">
          <span>{boat.type}</span>
          <span><MapPin size={13} /> {boat.district}</span>
        </div>
        <h3 onClick={() => onView(boat)} style={{ cursor: "pointer" }}>{boat.name}</h3>

        <div className="card-spec-tags">
          <span className="spec-tag spec-tag--capacity"><Users size={12} /> {boat.capacity} guests</span>
          <span className="spec-tag" style={{ background: "#f5f5f0", color: "#444" }}><BedDouble size={12} /> {boat.cabins} cabins</span>
          {boat.acRooms > 0 && <span className="spec-tag spec-tag--ac"><Snowflake size={12} /> {boat.acRooms} AC</span>}
          {boat.attachedWashrooms > 0 && <span className="spec-tag spec-tag--bath"><Bath size={12} /> {boat.attachedWashrooms} Attached</span>}
        </div>

        <div className="boat-card__footer">
          <div className="boat-card__price-box">
            {boat.startingPrice > 0 ? (
              <>
                <span className="price-box__label">Starting from</span>
                <strong className="price-box__amount">৳{boat.startingPrice.toLocaleString("en-US")}</strong>
              </>
            ) : (
              <>
                <span className="price-box__label">Package Rate</span>
                <strong className="price-box__amount" style={{ fontSize: "14px", color: "#666" }}>Contact for Price</strong>
              </>
            )}
          </div>

          <div className="boat-card__actions-group">
            <a className="boat-card__details-btn" href={`/houseboats/${boat.slug}`} onClick={(event) => { event.preventDefault(); onView(boat); }}>
              Details <ArrowRight size={13} />
            </a>
            {waUrl && (
              <a className="boat-card__wa-btn" href={waUrl} target="_blank" rel="noreferrer" title="Direct WhatsApp booking enquiry">
                <Phone size={12} /> WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function BoatModal({ boat, onClose }: { boat: Boat | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!boat) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => dialogRef.current?.focus());
    const close = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", close);
      document.body.style.overflow = "";
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [boat, onClose]);

  const allPhotos = useMemo(() => {
    if (!boat) return [];
    const list = [boat.image, ...(boat.gallery || [])].filter(Boolean);
    const unique = Array.from(new Set(list));
    return unique.length > 0 ? unique : ["/images/hero-houseboat.jpg"];
  }, [boat]);

  const [activeIdx, setActiveIdx] = useState(0);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setActiveIdx(0);
  }, [boat?.id]);

  useEffect(() => {
    thumbRefs.current[activeIdx]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [activeIdx]);

  if (!boat) return null;
  const currentPhoto = allPhotos[activeIdx] || allPhotos[0] || "/images/hero-houseboat.jpg";
  const waUrl = getWhatsAppUrl(boat.whatsapp, boat.name);

  const prevPhoto = () => {
    setActiveIdx((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const nextPhoto = () => {
    setActiveIdx((prev) => (prev + 1) % allPhotos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 45) {
      prevPhoto();
    } else if (diff < -45) {
      nextPhoto();
    }
    touchStartX.current = null;
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.currentTarget === event.target && onClose()}>
      <section ref={dialogRef} className="boat-modal" role="dialog" aria-modal="true" aria-labelledby="boat-modal-title" tabIndex={-1}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close houseboat details"><X /></button>

        {/* Left Side / Photo Viewer Section */}
        <div className="boat-modal__media">
          <div
            className="boat-modal__hero"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <img src={currentPhoto} alt={`${boat.name} houseboat photo ${activeIdx + 1}`} />
            <div>
              <VerifiedBadge />
              <p>{boat.membership}</p>
            </div>

            {allPhotos.length > 1 && (
              <>
                <button
                  type="button"
                  className="modal-slider-arrow modal-slider-arrow--prev"
                  onClick={prevPhoto}
                  aria-label="Previous photo"
                  title="Previous photo"
                >
                  <ChevronLeft size={22} />
                </button>
                <button
                  type="button"
                  className="modal-slider-arrow modal-slider-arrow--next"
                  onClick={nextPhoto}
                  aria-label="Next photo"
                  title="Next photo"
                >
                  <ChevronRight size={22} />
                </button>
                <span className="modal-slider-counter">
                  📷 {activeIdx + 1} / {allPhotos.length}
                </span>
              </>
            )}
          </div>

          {/* Interactive In-Modal Thumbnails */}
          {allPhotos.length > 1 && (
            <div className="boat-modal__thumbnails" aria-label="Houseboat photo thumbnails">
              {allPhotos.map((img, index) => (
                <button
                  type="button"
                  key={`${img}-${index}`}
                  ref={(el) => { thumbRefs.current[index] = el; }}
                  className={`modal-thumb-btn ${index === activeIdx ? "is-active" : ""}`}
                  onClick={() => setActiveIdx(index)}
                  title={`View photo ${index + 1}`}
                >
                  <img src={img} alt={`${boat.name} thumbnail ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side / Content Section */}
        <div className="boat-modal__content">
          <p className="section-kicker">Verified houseboat profile</p>
          <h2 id="boat-modal-title">{boat.name}</h2>
          <div className="profile-grid">
            <div><span>Owner / operator</span><strong>{boat.owner}</strong></div>
            <div><span>Operating area</span><strong>{boat.district}</strong></div>
            <div><span>Boat type</span><strong>{boat.type}</strong></div>
            <div><span>Capacity & Cabins</span><strong>{boat.capacity} guests · {boat.cabins} rooms</strong></div>
            {(boat.acRooms > 0 || boat.nonAcRooms > 0) && (
              <div><span>Room breakdown</span><strong>{boat.acRooms} AC · {boat.nonAcRooms} Non-AC</strong></div>
            )}
            {(boat.attachedWashrooms > 0 || boat.commonWashrooms > 0) && (
              <div><span>Washrooms</span><strong>{boat.attachedWashrooms} Attached · {boat.commonWashrooms} Common</strong></div>
            )}
            {boat.startingPrice > 0 && (
              <div style={{ gridColumn: "1 / -1", background: "#fdf8ee", padding: "14px 20px", borderRadius: "6px", border: "1px solid #f4dec0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#8c6000", textTransform: "uppercase", letterSpacing: "0.06em", display: "block" }}>Starting Package Rate</span>
                  <strong style={{ fontSize: "24px", fontWeight: 800, color: "var(--green)" }}>৳{boat.startingPrice.toLocaleString("en-US")}</strong>
                </div>
                <span style={{ fontSize: "12px", color: "#777" }}>* Price may vary based on group size & season</span>
              </div>
            )}
          </div>
          <div className="verification-box">
            <ShieldCheck />
            <div><strong>Active HOAB membership</strong><p>Last verified {boat.verified}</p></div>
          </div>
          <div className="amenity-row">{boat.amenities.map((amenity) => <span key={amenity}><Check size={13} /> {amenity}</span>)}</div>

          <div className="modal-actions" style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "18px" }}>
            {waUrl ? (
              <a className="button button--gold" href={waUrl} target="_blank" rel="noreferrer" style={{ background: "#25d366", borderColor: "#25d366", color: "white", fontWeight: 700, fontSize: "14px", padding: "11px 20px" }}>
                <Phone size={17} /> WhatsApp Booking ({boat.whatsapp})
              </a>
            ) : (
              <button className="button button--outline" disabled>No booking contact</button>
            )}
            {boat.email && <a className="button button--outline" href={`mailto:${boat.email}`}><Mail size={16} /> Email</a>}
            {(boat.facebookUrl || boat.website) && (
              <a className="button button--outline" href={boat.facebookUrl || boat.website} target="_blank" rel="noreferrer">
                <Globe2 size={16} /> Facebook / Website
              </a>
            )}
          </div>
          <p className="disclaimer">Official booking and commercial arrangements are made directly with the respective verified operator via WhatsApp.</p>
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
      const text = `${boat.name} ${boat.owner} ${boat.membership}`.toLowerCase();
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

function LeadershipMarquee({ people, light = false }: { people: PublicData["leadership"]; light?: boolean }) {
  if (!people.length) return null;

  let baseList = [...people];
  while (baseList.length < 8) {
    baseList = [...baseList, ...people];
  }
  const displayList = [...baseList, ...baseList];
  const duration = Math.max(baseList.length * 3.5, 20);

  return (
    <div
      className="leadership-marquee"
      tabIndex={0}
      role="region"
      aria-label="Leadership members"
      style={{
        width: "100%",
        overflow: "hidden",
        position: "relative",
        maskImage: "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)",
        padding: "4px 0",
      }}
    >
      <div
        className="leadership-marquee__track"
        style={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
          alignItems: "flex-start",
          gap: "16px",
          width: "max-content",
          animation: `marquee-scroll ${duration}s linear infinite`,
          willChange: "transform",
        }}
      >
        {displayList.map((person, index) => (
          <article
            className={`person ${light ? "person--light" : ""}`}
            key={`${person.id || person.name}-${index}`}
            style={{
              flex: "0 0 115px",
              width: "115px",
              minWidth: "115px",
              maxWidth: "115px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              boxSizing: "border-box",
            }}
          >
            <div className={`person__avatar ${light ? "person__avatar--line" : ""} ${person.photo ? "has-photo" : ""}`}>
              {person.photo ? <img src={person.photo} alt={person.name} /> : <span>{person.initials}</span>}
            </div>
            <strong style={{ display: "block", fontSize: "13px", lineHeight: "1.4", wordBreak: "break-word", width: "100%" }}>
              {person.name}
            </strong>
            <span style={{ display: "block", marginTop: "3px", fontSize: "12px", lineHeight: "1.4", wordBreak: "break-word", width: "100%" }}>
              {person.role}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}

function shuffleBoats(array: Boat[]): Boat[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function HomePage({ data }: { data: PublicData }) {
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);
  const [searchResults, setSearchResults] = useState<Boat[] | null>(null);
  const boats = data.boats;
  const committee = data.leadership.filter((person) => person.panel === "executive");
  const advisors = data.leadership.filter((person) => person.panel === "advisory");
  const news = data.news.slice(0, 3);
  const [featuredBoats, setFeaturedBoats] = useState<Boat[]>(() => boats.slice(0, 3));

  useEffect(() => {
    setFeaturedBoats(shuffleBoats(boats).slice(0, 3));
  }, [boats]);

  const heroImages = useMemo(() => {
    try {
      const raw = data.settings?.hero_images;
      if (!raw) return ["/images/hero-houseboat.jpg"];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0
        ? parsed.filter((item): item is string => typeof item === "string" && Boolean(item))
        : ["/images/hero-houseboat.jpg"];
    } catch {
      return ["/images/hero-houseboat.jpg"];
    }
  }, [data.settings?.hero_images]);

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const showResults = (results: Boat[]) => {
    setSearchResults(results);
    window.setTimeout(() => document.querySelector("#search-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  return (
    <main>
      <Header />
      <section className="hero">
        <div className="hero__slides" aria-hidden="true">
          {heroImages.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className={`hero__slide ${index === activeSlide ? "is-active" : ""}`}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
        </div>
        <div className="hero__overlay" aria-hidden="true" />
        <div className="shell hero__content">
          <div className="hero__badge"><span /><span>{copy.eyebrow}</span></div>
          <h1>{copy.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
          <p>{copy.subtitle}</p>
          <div className="hero__actions">
            <a className="button button--gold" href="/houseboats">{copy.explore} <ArrowRight size={17} /></a>
            <a className="button button--glass" href="#about">{copy.about}</a>
          </div>
          <div className="hero__seal"><ShipWheel /><span>Official<br />HOAB platform</span></div>
        </div>
        {heroImages.length > 1 && (
          <div className="hero__dots" role="tablist" aria-label="Hero slider pagination">
            {heroImages.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`hero__dot ${index === activeSlide ? "is-active" : ""}`}
                onClick={() => setActiveSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
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
          <div className="section-heading"><div><span className="section-kicker">Explore with confidence</span><h2>{copy.featured}</h2></div><a className="text-link" href="/houseboats">{copy.viewAll} <ArrowRight size={15} /></a></div>
          <div className="boat-grid">{featuredBoats.map((boat) => <BoatCard boat={boat} onView={setSelectedBoat} key={boat.id} />)}</div>
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
            <div className="committee-panel"><div className="panel-title"><h3>Executive committee</h3><ShipWheel /></div><LeadershipMarquee people={committee} /></div>
            <div className="advisory-panel"><div className="panel-title"><h3>Advisory panel</h3><Sparkles /></div><LeadershipMarquee people={advisors} light /></div>
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
          <div className="news-grid">{news.map((item, index) => <article className="news-card" key={item.title}><div className="news-card__number">0{index + 1}</div><div className="news-card__meta"><span>{item.category}</span><span><CalendarDays size={13} /> {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></div><h3>{item.title}</h3><p>{item.excerpt}</p><a className="text-link" href={`/news/${item.slug}`}>Read update <ArrowRight size={15} /></a></article>)}</div>
        </div>
      </section>

      <section className="visit-strip">
        <div className="shell visit-strip__inner"><div><Compass /><span><small>Planning a Tanguar Haor journey?</small><strong>Start with a verified operator.</strong></span></div><a className="button button--dark" href="/houseboats">Browse the directory <ArrowRight size={16} /></a></div>
      </section>
      <Footer />
      <BoatModal boat={selectedBoat} onClose={() => setSelectedBoat(null)} />
    </main>
  );
}

export function DirectoryPage({ boats }: { boats: Boat[] }) {
  const [shuffledList, setShuffledList] = useState<Boat[]>(boats);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All types");
  const [district, setDistrict] = useState("All districts");
  const [capacityRange, setCapacityRange] = useState<"all" | "1-15" | "16-25" | "26-35" | "36+">("all");
  const [minGuests, setMinGuests] = useState(0);
  const [acOption, setAcOption] = useState<"all" | "ac" | "non-ac">("all");
  const [washroomOption, setWashroomOption] = useState<"all" | "attached" | "common">("all");
  const [priceRange, setPriceRange] = useState<"all" | "under-6k" | "6k-10k" | "10k+">("all");
  const [sort, setSort] = useState("Random / Fair Rotation");
  const [page, setPage] = useState(1);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null);

  useEffect(() => {
    setShuffledList(shuffleBoats(boats));
  }, [boats]);

  const handleReshuffle = () => {
    setShuffledList(shuffleBoats(boats));
    setSort("Random / Fair Rotation");
    setPage(1);
  };

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    const sourceList = sort === "Random / Fair Rotation" ? shuffledList : boats;
    const result = sourceList.filter((boat) => {
      // Query search
      if (normalized) {
        const text = `${boat.name} ${boat.owner} ${boat.membership} ${boat.district} ${boat.type} ${boat.description || ""}`.toLowerCase();
        if (!text.includes(normalized)) return false;
      }
      // Boat Type
      if (type !== "All types" && boat.type !== type) return false;
      // District
      if (district !== "All districts" && boat.district !== district) return false;
      // Min Guests
      if (minGuests > 0 && (boat.capacity || 0) < minGuests) return false;
      // Capacity Range
      if (capacityRange === "1-15" && (boat.capacity || 0) > 15) return false;
      if (capacityRange === "16-25" && ((boat.capacity || 0) < 16 || (boat.capacity || 0) > 25)) return false;
      if (capacityRange === "26-35" && ((boat.capacity || 0) < 26 || (boat.capacity || 0) > 35)) return false;
      if (capacityRange === "36+" && (boat.capacity || 0) < 36) return false;
      // AC Option
      if (acOption === "ac" && !(boat.acRooms > 0 || boat.airConditioned)) return false;
      if (acOption === "non-ac" && !(boat.nonAcRooms > 0 || (!boat.airConditioned && boat.acRooms === 0))) return false;
      // Washroom Option
      if (washroomOption === "attached" && !(boat.attachedWashrooms > 0)) return false;
      if (washroomOption === "common" && !(boat.commonWashrooms > 0)) return false;
      // Price Range
      if (priceRange === "under-6k" && (boat.startingPrice <= 0 || boat.startingPrice > 6000)) return false;
      if (priceRange === "6k-10k" && (boat.startingPrice < 6000 || boat.startingPrice > 10000)) return false;
      if (priceRange === "10k+" && (boat.startingPrice < 10000)) return false;

      return true;
    });

    if (sort === "Random / Fair Rotation") {
      return result;
    }

    return [...result].sort((a, b) => {
      if (sort === "Price: Low to High") {
        const priceA = a.startingPrice > 0 ? a.startingPrice : 999999;
        const priceB = b.startingPrice > 0 ? b.startingPrice : 999999;
        return priceA - priceB;
      }
      if (sort === "Price: High to Low") {
        return (b.startingPrice || 0) - (a.startingPrice || 0);
      }
      if (sort === "Capacity: Highest First") {
        return (b.capacity || 0) - (a.capacity || 0);
      }
      if (sort === "Name Z–A") {
        return b.name.localeCompare(a.name);
      }
      if (sort === "Member ID") {
        return a.membership.localeCompare(b.membership);
      }
      return a.name.localeCompare(b.name);
    });
  }, [boats, shuffledList, query, type, district, minGuests, capacityRange, acOption, washroomOption, priceRange, sort]);

  const activeChips = useMemo(() => {
    const chips: Array<{ label: string; clear: () => void }> = [];
    if (query.trim()) {
      chips.push({ label: `"${query.trim()}"`, clear: () => setQuery("") });
    }
    if (minGuests > 0) {
      chips.push({ label: `👥 ${minGuests}+ Guests`, clear: () => setMinGuests(0) });
    } else if (capacityRange !== "all") {
      const capLabel = capacityRange === "1-15" ? "Up to 15 Guests" : capacityRange === "16-25" ? "16–25 Guests" : capacityRange === "26-35" ? "26–35 Guests" : "36+ Guests";
      chips.push({ label: `👥 ${capLabel}`, clear: () => setCapacityRange("all") });
    }
    if (acOption === "ac") {
      chips.push({ label: "❄️ AC Cabins", clear: () => setAcOption("all") });
    } else if (acOption === "non-ac") {
      chips.push({ label: "🌿 Non-AC", clear: () => setAcOption("all") });
    }
    if (washroomOption === "attached") {
      chips.push({ label: "🚿 Attached Bath", clear: () => setWashroomOption("all") });
    } else if (washroomOption === "common") {
      chips.push({ label: "🚪 Common Bath", clear: () => setWashroomOption("all") });
    }
    if (priceRange === "under-6k") {
      chips.push({ label: "💰 Under ৳6,000", clear: () => setPriceRange("all") });
    } else if (priceRange === "6k-10k") {
      chips.push({ label: "💰 ৳6k – ৳10k", clear: () => setPriceRange("all") });
    } else if (priceRange === "10k+") {
      chips.push({ label: "💰 ৳10,000+", clear: () => setPriceRange("all") });
    }
    if (type !== "All types") {
      chips.push({ label: `Type: ${type}`, clear: () => setType("All types") });
    }
    if (district !== "All districts") {
      chips.push({ label: `Location: ${district}`, clear: () => setDistrict("All districts") });
    }
    return chips;
  }, [query, minGuests, capacityRange, acOption, washroomOption, priceRange, type, district]);

  const resetAll = () => {
    setShuffledList(shuffleBoats(boats));
    setQuery("");
    setType("All types");
    setDistrict("All districts");
    setCapacityRange("all");
    setMinGuests(0);
    setAcOption("all");
    setWashroomOption("all");
    setPriceRange("all");
    setSort("Random / Fair Rotation");
    setPage(1);
  };

  return (
    <main>
      <Header />
      <section className="page-hero">
        <div className="shell">
          <span className="section-kicker section-kicker--light">Official HOAB registry</span>
          <h1>Registered houseboats</h1>
          <p>Search current active members by boat, owner, group capacity, AC/washroom setup, or location.</p>
          <div className="page-hero__trust"><BadgeCheck /> Records reviewed by the HOAB secretariat</div>
        </div>
      </section>

      <section className="directory-page">
        <div className="shell">
          <div className="directory-toolbar">
            <label className="directory-searchbox">
              <Search />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search boat name, owner or HOAB member ID…"
                aria-label="Search registered houseboats"
              />
              <kbd>/</kbd>
            </label>
            <button
              className="filter-label"
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              aria-expanded={mobileFilterOpen}
              aria-controls="directory-filters"
            >
              <SlidersHorizontal size={16} /> Filters {activeChips.length > 0 && `(${activeChips.length})`}
            </button>
          </div>

          <div className="directory-layout">
            <aside id="directory-filters" className={`directory-filters ${mobileFilterOpen ? "is-mobile-open" : ""}`} aria-label="Houseboat filters">
              <div className="directory-filters-head">
                <h2>Refine Directory</h2>
                {activeChips.length > 0 && (
                  <button className="filter-reset-btn" type="button" onClick={resetAll} title="Clear all applied filters">
                    <RotateCcw size={13} /> Reset
                  </button>
                )}
              </div>

              {/* 👥 GUEST CAPACITY (ধারণ ক্ষমতা) */}
              <div className="filter-group">
                <div className="filter-group-title">
                  <span>👥 Guest Capacity</span>
                  {minGuests > 0 && <small style={{ color: "var(--green)", fontWeight: 700 }}>{minGuests}+ People</small>}
                </div>
                <div className="filter-pill-grid">
                  {[
                    { key: "all", label: "All" },
                    { key: "1-15", label: "Up to 15" },
                    { key: "16-25", label: "16–25" },
                    { key: "26-35", label: "26–35" },
                    { key: "36+", label: "36+ Guests" }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      className={`filter-pill ${capacityRange === item.key && minGuests === 0 ? "is-active" : ""}`}
                      onClick={() => {
                        setCapacityRange(item.key as typeof capacityRange);
                        setMinGuests(0);
                        setPage(1);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div style={{ marginTop: "10px" }}>
                  <small style={{ display: "block", color: "#666", fontSize: "11px", marginBottom: "4px" }}>Or minimum required capacity:</small>
                  <div style={{ display: "flex", gap: "5px" }}>
                    {[15, 20, 25, 30].map((num) => (
                      <button
                        type="button"
                        key={num}
                        style={{
                          flex: 1,
                          padding: "4px 0",
                          borderRadius: "3px",
                          border: minGuests === num ? "1px solid var(--green)" : "1px solid #dce1dc",
                          background: minGuests === num ? "var(--green)" : "white",
                          color: minGuests === num ? "white" : "#444",
                          fontSize: "11px",
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                        onClick={() => {
                          setMinGuests(minGuests === num ? 0 : num);
                          setCapacityRange("all");
                          setPage(1);
                        }}
                      >
                        {num}+
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* ❄️ AC & CABINS */}
              <div className="filter-group">
                <div className="filter-group-title">
                  <span>❄️ Cabin & AC Type</span>
                </div>
                <div className="filter-pill-grid">
                  {[
                    { key: "all", label: "All Cabins" },
                    { key: "ac", label: "❄️ AC Available" },
                    { key: "non-ac", label: "🌿 Non-AC" }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      className={`filter-pill ${acOption === item.key ? "is-active" : ""}`}
                      onClick={() => {
                        setAcOption(item.key as typeof acOption);
                        setPage(1);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 🚿 WASHROOMS */}
              <div className="filter-group">
                <div className="filter-group-title">
                  <span>🚿 Washroom Type</span>
                </div>
                <div className="filter-pill-grid">
                  {[
                    { key: "all", label: "All" },
                    { key: "attached", label: "🚿 Attached Bath" },
                    { key: "common", label: "🚪 Common Bath" }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      className={`filter-pill ${washroomOption === item.key ? "is-active" : ""}`}
                      onClick={() => {
                        setWashroomOption(item.key as typeof washroomOption);
                        setPage(1);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 💰 STARTING PRICE */}
              <div className="filter-group">
                <div className="filter-group-title">
                  <span>💰 Starting Price</span>
                </div>
                <div className="filter-pill-grid">
                  {[
                    { key: "all", label: "All Prices" },
                    { key: "under-6k", label: "Under ৳6,000" },
                    { key: "6k-10k", label: "৳6,000–৳10,000" },
                    { key: "10k+", label: "৳10,000+" }
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      className={`filter-pill ${priceRange === item.key ? "is-active" : ""}`}
                      onClick={() => {
                        setPriceRange(item.key as typeof priceRange);
                        setPage(1);
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 🛥️ BOAT TYPE */}
              <div className="filter-group">
                <label>
                  <span>Boat Type</span>
                  <select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
                    <option>All types</option>
                    <option>Premium</option>
                    <option>Wooden</option>
                    <option>Steel</option>
                  </select>
                </label>
              </div>

              {/* 📍 DISTRICT */}
              <div className="filter-group">
                <label>
                  <span>Operating District</span>
                  <select value={district} onChange={(e) => { setDistrict(e.target.value); setPage(1); }}>
                    <option>All districts</option>
                    <option>Sunamganj</option>
                    <option>Sylhet</option>
                    <option>Habiganj</option>
                  </select>
                </label>
              </div>

              <div className="active-only">
                <span><Check /> Verified Members</span>
                <small>Official HOAB directory registry</small>
              </div>

              {activeChips.length > 0 && (
                <button
                  type="button"
                  style={{
                    width: "100%",
                    padding: "8px 0",
                    marginTop: "8px",
                    border: "1px solid #dce0dd",
                    borderRadius: "4px",
                    background: "white",
                    color: "#555",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                  onClick={resetAll}
                >
                  <RotateCcw size={13} /> Reset all filters
                </button>
              )}
            </aside>

            <div className="directory-results">
              {/* Active Filter Chips Bar */}
              {activeChips.length > 0 && (
                <div className="active-chips-bar">
                  <span className="active-chips-label">Active filters:</span>
                  {activeChips.map((chip) => (
                    <span className="filter-chip" key={chip.label}>
                      {chip.label}
                      <button type="button" onClick={chip.clear} aria-label={`Remove filter ${chip.label}`}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                  <button type="button" className="filter-chip-clear-all" onClick={resetAll}>
                    Clear all
                  </button>
                </div>
              )}

              <div className="directory-results__head">
                <p>
                  <strong>{filtered.length}</strong> active {filtered.length === 1 ? "houseboat" : "houseboats"} found
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                  <label>
                    Sort by
                    <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
                      <option value="Random / Fair Rotation">🎲 Random / Fair Rotation (Default)</option>
                      <option value="Price: Low to High">Price: Low to High</option>
                      <option value="Price: High to Low">Price: High to Low</option>
                      <option value="Capacity: Highest First">Capacity: Highest First</option>
                      <option value="Name A–Z">Name A–Z</option>
                      <option value="Name Z–A">Name Z–A</option>
                      <option value="Member ID">Member ID</option>
                    </select>
                  </label>
                  <button
                    type="button"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      padding: "5px 10px",
                      background: "white",
                      border: "1px solid #d9dfdb",
                      borderRadius: "4px",
                      color: "var(--green)",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                    onClick={handleReshuffle}
                    title="Reshuffle order randomly for fairness among members"
                  >
                    <Shuffle size={13} /> Reshuffle
                  </button>
                </div>
              </div>

              {filtered.length ? (
                <>
                  <div className="boat-grid boat-grid--directory">
                    {filtered.slice((page - 1) * 24, page * 24).map((boat) => (
                      <BoatCard key={boat.id} boat={boat} onView={setSelectedBoat} />
                    ))}
                  </div>
                  {filtered.length > 24 && (
                    <nav className="pagination" aria-label="Directory pages">
                      {Array.from({ length: Math.ceil(filtered.length / 24) }, (_, index) => index + 1).map((number) => (
                        <button
                          className={number === page ? "is-active" : ""}
                          key={number}
                          onClick={() => setPage(number)}
                        >
                          {number}
                        </button>
                      ))}
                    </nav>
                  )}
                </>
              ) : (
                <div className="empty-state">
                  <Search />
                  <h2>No houseboats match your criteria.</h2>
                  <p>Try adjusting or clearing some filters to see more results.</p>
                  <button className="button button--outline" type="button" onClick={resetAll} style={{ marginTop: "12px" }}>
                    <RotateCcw size={14} /> Clear all filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <BoatModal boat={selectedBoat} onClose={() => setSelectedBoat(null)} />
    </main>
  );
}
