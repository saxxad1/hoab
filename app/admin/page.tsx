"use client";

import { useState } from "react";
import { Activity, BadgeCheck, Bell, ChevronDown, FileText, LayoutDashboard, Menu, MoreHorizontal, Plus, Search, Settings, ShipWheel, Users, X } from "lucide-react";
import { boats } from "../data";

const applications = [
  { id: "HOAB-B2B-0048", agency: "North East Travel Co.", applicant: "Hasan Mahmud", date: "12 Aug 2026", status: "Under review" },
  { id: "HOAB-B2B-0047", agency: "Delta Routes", applicant: "Nusrat Jahan", date: "11 Aug 2026", status: "Submitted" },
  { id: "HOAB-B2B-0046", agency: "Blue Horizon Tours", applicant: "M. Rahman", date: "09 Aug 2026", status: "Info required" },
];

export default function AdminPage() {
  const [navOpen, setNavOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const action = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2200); };
  const nav = ["Dashboard", "Houseboats", "Boat categories", "Leadership", "B2B applications", "Authorised agents", "News & notices", "Events", "Resources", "Media library", "Admin users", "Audit logs", "Settings"];
  return (
    <main className="admin-shell">
      <aside className={`admin-sidebar ${navOpen ? "is-open" : ""}`}>
        <div className="admin-brand"><span>H<ShipWheel />AB</span><small>Management system</small></div>
        <button className="admin-sidebar__close" onClick={() => setNavOpen(false)}><X /></button>
        <nav>{nav.map((item, index) => <button className={index === 0 ? "is-active" : ""} key={item}>{index === 0 ? <LayoutDashboard /> : index === 1 ? <ShipWheel /> : index === 4 ? <FileText /> : index === 5 ? <BadgeCheck /> : index === 10 ? <Users /> : index === 12 ? <Settings /> : <span className="nav-dot" />}<span>{item}</span>{item === "B2B applications" && <em>12</em>}</button>)}</nav>
        <div className="admin-help"><strong>HOAB Admin</strong><p>Operational prototype</p><a href="/">View public site →</a></div>
      </aside>
      <section className="admin-main">
        <header className="admin-topbar"><button className="admin-menu" onClick={() => setNavOpen(true)}><Menu /></button><label><Search /><input placeholder="Search boats, agents, notices…" /></label><div><button className="icon-button"><Bell /><span /></button><button className="admin-user"><span>NA</span><span><strong>Nadia Akter</strong><small>Super Admin</small></span><ChevronDown /></button></div></header>
        <div className="admin-content">
          <div className="prototype-banner"><BadgeCheck /><span><strong>Management system prototype</strong>This view demonstrates the operating model. Production authentication and private document storage still require deployment configuration.</span><a href="/">Open website</a></div>
          <div className="admin-title"><div><p>Wednesday, 12 August 2026</p><h1>Good morning, Nadia.</h1><span>Here&apos;s what&apos;s happening across HOAB today.</span></div><button className="admin-primary" onClick={() => action("New houseboat form opened")}><Plus /> Add houseboat</button></div>
          <div className="admin-stats"><article><span className="stat-icon stat-icon--green"><ShipWheel /></span><div><small>Registered boats</small><strong>124</strong><em>+8 this quarter</em></div></article><article><span className="stat-icon stat-icon--olive"><BadgeCheck /></span><div><small>Active members</small><strong>87</strong><em>70.2% verified</em></div></article><article><span className="stat-icon stat-icon--gold"><FileText /></span><div><small>B2B applications</small><strong>12</strong><em>5 need review</em></div></article><article><span className="stat-icon stat-icon--sand"><Users /></span><div><small>Authorised agents</small><strong>36</strong><em>4 added this month</em></div></article></div>
          <div className="admin-grid">
            <section className="admin-panel admin-panel--wide"><div className="admin-panel__head"><div><h2>Recent B2B applications</h2><p>Prioritised by submission date</p></div><button>View all <span>→</span></button></div><div className="admin-table"><div className="admin-table__row admin-table__header"><span>Application</span><span>Applicant</span><span>Submitted</span><span>Status</span><span /></div>{applications.map((app) => <div className="admin-table__row" key={app.id}><span><strong>{app.agency}</strong><small>{app.id}</small></span><span>{app.applicant}</span><span>{app.date}</span><span><em className={`status status--${app.status.toLowerCase().replace(" ", "-")}`}>{app.status}</em></span><button><MoreHorizontal /></button></div>)}</div></section>
            <section className="admin-panel"><div className="admin-panel__head"><div><h2>Quick actions</h2><p>Common publishing tasks</p></div></div><div className="quick-actions"><button onClick={() => action("New notice editor opened")}><Plus /><span><strong>Publish a notice</strong><small>Official update or advisory</small></span></button><button onClick={() => action("Committee editor opened")}><Users /><span><strong>Add committee member</strong><small>Current term 2026–2028</small></span></button><button onClick={() => action("Media uploader opened")}><FileText /><span><strong>Upload a resource</strong><small>Policy, form or circular</small></span></button></div></section>
            <section className="admin-panel admin-panel--wide"><div className="admin-panel__head"><div><h2>Recently updated houseboats</h2><p>Active records in the public directory</p></div><button>Manage directory <span>→</span></button></div><div className="boat-admin-list">{boats.slice(0, 4).map((boat) => <div key={boat.id}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={boat.image} alt="" /><span><strong>{boat.name}</strong><small>{boat.membership} · {boat.owner}</small></span><em>Active</em><button><MoreHorizontal /></button></div>)}</div></section>
            <section className="admin-panel"><div className="admin-panel__head"><div><h2>Recent activity</h2><p>Across all modules</p></div></div><div className="activity-list"><div><Activity /><span><strong>Boat HOAB-082 verified</strong><small>By Nadia Akter · 18 min ago</small></span></div><div><FileText /><span><strong>Safety notice published</strong><small>By Rahim Uddin · 1 hr ago</small></span></div><div><Users /><span><strong>B2B agent approved</strong><small>By Nadia Akter · 3 hrs ago</small></span></div></div></section>
          </div>
        </div>
      </section>
      {notice && <div className="toast"><BadgeCheck /> {notice}</div>}
    </main>
  );
}
