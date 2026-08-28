"use client";

import { useMemo, useState } from "react";
import { ArrowRight, BadgeCheck, CalendarDays, Check, Download, FileText, Globe2, Mail, MapPin, Phone, Search, ShieldCheck, ShipWheel, Users } from "lucide-react";
import type { Boat, PublicData } from "../data";
import { BoatCard, Footer, Header, VerifiedBadge, getWhatsAppUrl } from "./PublicSite";
import { Counter } from "./Motion";

export function AboutPage({ data, pageKey = "about" }: { data: PublicData; pageKey?: string }) {
  const page = data.pages.find((item) => item.pageKey === pageKey);
  const membership = pageKey === "membership";
  return (
    <main>
      <Header />
      <section className="page-hero">
        <div className="shell">
          <span className="section-kicker section-kicker--light">{membership ? "Membership" : "The association"}</span>
          <h1>{page?.title}</h1>
          <p>{membership ? "Join the organised voice of Bangladesh’s houseboat community." : "Working for a safer, organised and sustainable houseboat tourism industry."}</p>
        </div>
      </section>
      <section className="content-page">
        <div className="shell editorial-grid">
          <article className="editorial-main">
            <span className="section-kicker">{membership ? "Become a member" : "About HOAB"}</span>
            <h2>{membership ? "A recognised place in a growing industry." : "Uniting the people who move the haor forward."}</h2>
            <p>{page?.content}</p>
            <div className="content-pillars">
              <div>
                <ShieldCheck />
                <h3>{membership ? "Verified membership" : "Our vision"}</h3>
                <p>{membership ? "Complete documentation and operational verification." : "A trusted, responsible and globally recognised houseboat industry."}</p>
              </div>
              <div>
                <Users />
                <h3>{membership ? "Industry voice" : "Our mission"}</h3>
                <p>{membership ? "Representation through an organised national association." : "Represent owners, develop standards and strengthen cooperation."}</p>
              </div>
              <div>
                <ShipWheel />
                <h3>{membership ? "Member network" : "Our responsibility"}</h3>
                <p>{membership ? "Connect with owners, agents and public stakeholders." : "Protect Tanguar Haor while improving visitor confidence."}</p>
              </div>
            </div>
            {membership && (
              <a className="button button--gold" href="mailto:houseboatownersassociation70@gmail.com" style={{ marginTop: "24px" }}>
                Contact membership desk <ArrowRight size={16} />
              </a>
            )}
          </article>
          <aside className="editorial-aside">
            <div className="quote-card">
              <span>HOAB principle</span>
              <blockquote>“The voyage together. The heritage forever.”</blockquote>
            </div>
            <div className="fact-card">
              <strong><Counter value={data.stats.registeredBoats} /><sup>+</sup></strong>
              <span>verified public records</span>
            </div>
            <div className="fact-card">
              <strong>2026—2028</strong>
              <span>current leadership term</span>
            </div>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function LeadershipPage({ data }: { data: PublicData }) {
  const panels = [["executive", "Executive committee"], ["advisory", "Advisory panel"]] as const;
  return (
    <main>
      <Header />
      <section className="page-hero">
        <div className="shell">
          <span className="section-kicker section-kicker--light">Term 2026—2028</span>
          <h1>HOAB leadership</h1>
          <p>Meet the committee and advisors guiding the association’s work.</p>
        </div>
      </section>
      <section className="content-page">
        <div className="shell">
          {panels.map(([panel, label]) => (
            <div className="leadership-list" key={panel}>
              <div className="section-heading">
                <div>
                  <span className="section-kicker">Current term</span>
                  <h2>{label}</h2>
                </div>
              </div>
              <div className="leadership-card-grid">
                {data.leadership
                  .filter((item) => item.panel === panel)
                  .map((person) => (
                    <article key={person.id}>
                      <div className={`person__avatar person__avatar--line ${person.photo ? "has-photo" : ""}`}>
                        {person.photo ? <img src={person.photo} alt={person.name} /> : <span>{person.initials}</span>}
                      </div>
                      <div>
                        <h3>{person.name}</h3>
                        <strong>{person.role}</strong>
                        <p>{person.bio || person.organization}</p>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function B2BPage({ data }: { data: PublicData }) {
  return (
    <main>
      <Header />
      <section className="page-hero">
        <div className="shell">
          <span className="section-kicker section-kicker--light">Official partner network</span>
          <h1>Authorised B2B agents</h1>
          <p>A transparent bridge between legitimate travel agencies and HOAB-registered operators.</p>
        </div>
      </section>
      <section className="content-page">
        <div className="shell b2b-public-grid">
          <article>
            <span className="section-kicker">Why this program exists</span>
            <h2>A more professional way to work.</h2>
            <p>The program reduces unverified intermediaries and connects legitimate agencies with a trusted houseboat network.</p>
            <div className="requirement-list">
              <span><Check /> Valid trade license</span>
              <span><Check /> Trade association certificate</span>
              <span><Check /> NID of responsible person</span>
              <span><Check /> Current agency and contact information</span>
            </div>
            <div className="content-actions" style={{ marginTop: "24px" }}>
              <a className="button button--gold" href="/b2b/apply">Apply online <ArrowRight size={16} /></a>
              <a className="button button--outline" href="/verify-agent">Verify an agent</a>
            </div>
          </article>
          <aside>
            <span className="section-kicker">Current network</span>
            <strong><Counter value={data.stats.authorisedAgents} /></strong>
            <p>authorised agents listed in the official database</p>
            <a className="text-link" href="/b2b/agents">View agent directory <ArrowRight size={15} /></a>
          </aside>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function AgentsPage({ data, verifyOnly = false }: { data: PublicData; verifyOnly?: boolean }) {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState(false);
  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    return q
      ? data.agents.filter((agent) => `${agent.agentId} ${agent.agencyName}`.toLowerCase().includes(q))
      : verifyOnly
      ? []
      : data.agents;
  }, [data.agents, query, verifyOnly]);

  return (
    <main>
      <Header />
      <section className="page-hero">
        <div className="shell">
          <span className="section-kicker section-kicker--light">Official verification</span>
          <h1>{verifyOnly ? "Verify an agent" : "Authorised agent directory"}</h1>
          <p>Search by HOAB Agent ID or agency name.</p>
        </div>
      </section>
      <section className="content-page">
        <div className="shell">
          <form className="public-verify" onSubmit={(event) => { event.preventDefault(); setSearched(true); }}>
            <Search />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="HOAB-A-0023 or agency name" />
            <button className="button button--gold" type="submit">Verify</button>
          </form>
          {results.length ? (
            <div className="agent-grid">
              {results.map((agent) => (
                <article key={String(agent.id)}>
                  <div className="agent-mark"><BadgeCheck /></div>
                  <span className="verified-badge"><BadgeCheck size={14} /> Verified</span>
                  <h2>{String(agent.agencyName)}</h2>
                  <strong>{String(agent.agentId)}</strong>
                  <p><MapPin /> {String(agent.location)}</p>
                  <p><Phone /> {String(agent.phone)}</p>
                  <small>Authorised since {String(agent.validSince)}</small>
                </article>
              ))}
            </div>
          ) : (
            (searched || !verifyOnly) && (
              <div className="empty-state">
                <Search />
                <h2>Not found / not currently authorised</h2>
                <p>Check the ID or contact the HOAB secretariat.</p>
              </div>
            )
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function NewsPage({ data }: { data: PublicData }) {
  return (
    <main>
      <Header />
      <section className="page-hero">
        <div className="shell">
          <span className="section-kicker section-kicker--light">Official communications</span>
          <h1>News & notices</h1>
          <p>Association updates, safety notices, circulars, events and industry announcements.</p>
        </div>
      </section>
      <section className="content-page">
        <div className="shell news-list">
          {data.news.map((item) => (
            <article key={item.id} className={item.featuredImage ? "has-banner" : ""}>
              {item.featuredImage && (
                <a href={`/news/${item.slug}`} className="news-banner-thumb">
                  <img src={item.featuredImage} alt={item.title} />
                </a>
              )}
              <div className="news-content-block">
                <div>
                  <span className="news-badge">{item.category}</span>
                  <small><CalendarDays size={13} /> {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</small>
                </div>
                <h2><a href={`/news/${item.slug}`}>{item.title}</a></h2>
                {item.excerpt && <p>{item.excerpt}</p>}
                <a className="text-link" href={`/news/${item.slug}`}>Read full notice / update <ArrowRight size={15} /></a>
              </div>
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function NewsDetailPage({ item }: { item: PublicData["news"][number] }) {
  return (
    <main>
      <Header />
      <article className="article-page">
        <header>
          <div className="shell">
            <span className="section-kicker section-kicker--light">{item.category}</span>
            <h1>{item.title}</h1>
            <p><CalendarDays size={14} /> {new Date(item.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
          </div>
        </header>
        <div className="shell article-body">
          {item.featuredImage && (
            <div className="article-featured-image" style={{ marginBottom: "28px", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--line)" }}>
              <img src={item.featuredImage} alt={item.title} style={{ width: "100%", maxHeight: "500px", objectFit: "cover" }} />
            </div>
          )}
          {item.excerpt && <p className="article-lead">{item.excerpt}</p>}
          <div style={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}>{item.content}</div>
          {item.attachment && (
            <a className="button button--outline" href={item.attachment} target="_blank" rel="noopener noreferrer" style={{ marginTop: "24px" }}>
              <Download size={16} /> Download official circular / attachment
            </a>
          )}
          <a className="text-link" href="/news" style={{ marginTop: "28px" }}>← Back to all news & notices</a>
        </div>
      </article>
      <Footer />
    </main>
  );
}

export function EventsResourcesPage({ data, mode }: { data: PublicData; mode: "events" | "resources" }) {
  const rows =
    mode === "events"
      ? data.events.map((item) => ({
          id: item.id,
          label: item.status,
          title: item.name,
          description: item.description,
          date: item.eventDate,
          venue: item.venue,
          url: "",
        }))
      : data.resources.map((item) => ({
          id: item.id,
          label: item.category,
          title: item.title,
          description: item.description,
          date: "",
          venue: "",
          url: item.fileUrl || item.externalUrl || "#",
        }));

  return (
    <main>
      <Header />
      <section className="page-hero">
        <div className="shell">
          <span className="section-kicker section-kicker--light">HOAB public information</span>
          <h1>{mode === "events" ? "Events" : "Resources & downloads"}</h1>
          <p>{mode === "events" ? "Meetings, fairs and industry programs." : "Official forms, policies, guidelines and circulars."}</p>
        </div>
      </section>
      <section className="content-page">
        <div className="shell resource-grid">
          {rows.map((item) => (
            <article key={item.id}>
              <div className="resource-icon">{mode === "events" ? <CalendarDays /> : <FileText />}</div>
              <span>{item.label}</span>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              {mode === "events" ? (
                <>
                  <strong>{item.date}</strong>
                  <small><MapPin /> {item.venue}</small>
                </>
              ) : (
                <a className="text-link" href={item.url}>Open resource <ArrowRight size={15} /></a>
              )}
            </article>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function ContactPage({ data }: { data: PublicData }) {
  const [state, setState] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState("");
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("Sending…");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    const result = (await response.json()) as { message?: string; error?: string };
    setStatus(response.ok ? result.message || "Message received" : result.error || "Unable to send");
    if (response.ok) setState({ name: "", phone: "", email: "", subject: "", message: "" });
  };

  return (
    <main>
      <Header />
      <section className="page-hero">
        <div className="shell">
          <span className="section-kicker section-kicker--light">HOAB Secretariat</span>
          <h1>Contact HOAB</h1>
          <p>Official enquiries, membership assistance and industry communication.</p>
        </div>
      </section>
      <section className="content-page">
        <div className="shell contact-layout">
          <aside>
            <h2>We’re here to help.</h2>
            <p><MapPin />{data.settings.office_address}</p>
            <p><Phone />{data.settings.official_phone}</p>
            <p><Mail />{data.settings.official_email}</p>
            <small>Sunday–Thursday · 9:00 AM–5:00 PM</small>
          </aside>
          <form onSubmit={submit}>
            <div className="form-grid">
              <label>Name<input required value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} /></label>
              <label>Phone<input value={state.phone} onChange={(e) => setState({ ...state, phone: e.target.value })} /></label>
              <label>Email<input required type="email" value={state.email} onChange={(e) => setState({ ...state, email: e.target.value })} /></label>
              <label>Subject<input required value={state.subject} onChange={(e) => setState({ ...state, subject: e.target.value })} /></label>
              <label className="span-2">Message<textarea required value={state.message} onChange={(e) => setState({ ...state, message: e.target.value })} /></label>
            </div>
            {status && <p className="form-status">{status}</p>}
            <button className="button button--gold" type="submit">Send message <ArrowRight size={16} /></button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function FAQPage() {
  const faqs = [
    ["What is a HOAB-registered houseboat?", "A member operator whose record is active in the association registry."],
    ["How do I verify a boat?", "Search the directory by boat name, owner or membership number."],
    ["How can an agency apply?", "Complete the official B2B form and upload the required documents."],
    ["Does HOAB manage bookings?", "No. Booking and commercial arrangements are made directly with each operator."],
  ];

  return (
    <main>
      <Header />
      <section className="page-hero">
        <div className="shell">
          <span className="section-kicker section-kicker--light">Help centre</span>
          <h1>Frequently asked questions</h1>
        </div>
      </section>
      <section className="content-page">
        <div className="shell faq-list">
          {faqs.map(([q, a]) => (
            <details key={q}>
              <summary>{q}<span>+</span></summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}

export function BoatDetailPage({ boat, related }: { boat: Boat; related: Boat[] }) {
  const photos = Array.from(new Set([boat.image, ...boat.gallery].filter(Boolean)));
  const coverImage = photos[0] || "/images/hero-houseboat.jpg";
  const waUrl = getWhatsAppUrl(boat.whatsapp, boat.name);

  return (
    <main>
      <Header />
      <section className="boat-detail-hero">
        <img src={coverImage} alt={boat.name} />
        <div className="boat-detail-hero__overlay" />
        <div className="shell">
          <VerifiedBadge />
          <span>{boat.membership}</span>
          <h1>{boat.name}</h1>
          <p>{boat.type} · {boat.operatingArea}</p>
        </div>
      </section>
      <section className="content-page">
        <div className="shell boat-detail-layout">
          <article>
            <span className="section-kicker">Verified houseboat profile</span>
            <h2>Explore with confidence.</h2>
            <p>{boat.description}</p>
            <div className="boat-specs">
              <div>
                <Users />
                <span>Capacity<strong>{boat.capacity} guests</strong></span>
              </div>
              <div>
                <ShipWheel />
                <span>Cabins<strong>{boat.cabins} rooms {boat.acRooms > 0 ? `(${boat.acRooms} AC · ${boat.nonAcRooms} Non-AC)` : ""}</strong></span>
              </div>
              <div>
                <MapPin />
                <span>Operating area<strong>{boat.operatingArea}</strong></span>
              </div>
              <div>
                <ShieldCheck />
                <span>Washrooms<strong>{boat.attachedWashrooms > 0 || boat.commonWashrooms > 0 ? `${boat.attachedWashrooms} Attached · ${boat.commonWashrooms} Common` : "Active member"}</strong></span>
              </div>
              {boat.startingPrice > 0 && (
                <div style={{ gridColumn: "1 / -1", background: "#f8f5ee", padding: "16px 22px", borderRadius: "6px", border: "1px solid #ebdcb9", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#8c6000", textTransform: "uppercase" }}>Starting Package Rate</span>
                    <strong style={{ fontSize: "26px", color: "var(--green)", fontWeight: 800, display: "block" }}>৳{boat.startingPrice.toLocaleString("en-US")}</strong>
                  </div>
                  <span style={{ fontSize: "12px", color: "#666" }}>* Package rate may vary by season</span>
                </div>
              )}
            </div>
            <h3>Amenities</h3>
            <div className="amenity-row">
              {boat.amenities.map((item) => (
                <span key={item}><Check size={13} /> {item}</span>
              ))}
            </div>
          </article>
          <aside>
            <div className="verification-box">
              <BadgeCheck />
              <div>
                <strong>HOAB verified member</strong>
                <p>Last verified {boat.verified}</p>
              </div>
            </div>
            <h3>Owner / operator</h3>
            <strong>{boat.owner}</strong>
            {waUrl && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="button button--gold"
                style={{
                  background: "#25d366",
                  borderColor: "#25d366",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "14px",
                  padding: "12px 18px",
                  width: "100%",
                  justifyContent: "center",
                  minHeight: "46px",
                  marginTop: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <Phone size={17} /> WhatsApp Booking ({boat.whatsapp})
              </a>
            )}
            {boat.email && (
              <a href={`mailto:${boat.email}`} style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                <Mail size={15} /> {boat.email}
              </a>
            )}
            {(boat.facebookUrl || boat.website) && (
              <a href={boat.facebookUrl || boat.website} target="_blank" rel="noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                <Globe2 size={15} /> Facebook / Official Page
              </a>
            )}
            <p style={{ marginTop: "14px", fontSize: "12px", color: "var(--muted)", fontStyle: "italic" }}>Official bookings are arranged directly with the operator via WhatsApp.</p>
          </aside>
        </div>
        {photos.length > 1 && (
          <section className="shell boat-photo-gallery">
            <div className="section-heading">
              <div>
                <span className="section-kicker">Photo gallery</span>
                <h2>{boat.name}</h2>
              </div>
            </div>
            <div className="boat-photo-gallery__grid">
              {photos.map((photo, index) => (
                <a href={photo} target="_blank" rel="noreferrer" key={photo}>
                  <img src={photo} alt={`${boat.name} photo ${index + 1}`} />
                </a>
              ))}
            </div>
          </section>
        )}
        {related.length > 0 && (
          <div className="shell related-boats" style={{ marginTop: "60px" }}>
            <div className="section-heading">
              <h2>More registered houseboats</h2>
            </div>
            <div className="boat-grid">
              {related.slice(0, 3).map((item) => (
                <BoatCard key={item.id} boat={item} onView={() => location.assign(`/houseboats/${item.slug}`)} />
              ))}
            </div>
          </div>
        )}
      </section>
      <Footer />
    </main>
  );
}
