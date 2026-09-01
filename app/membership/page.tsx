import { ArrowRight, BadgeCheck, Building2, CheckCircle2, ShieldCheck, Ship, Users } from "lucide-react";
import { Footer, Header } from "../components/PublicSite";
import { getPublicData } from "../../db/public-data";

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const data = await getPublicData();

  return (
    <main>
      <Header />

      {/* Hero Section */}
      <section className="apply-hero">
        <div className="shell apply-hero__inner">
          <div>
            <span className="section-kicker section-kicker--light">Official HOAB Registry</span>
            <h1>Houseboat Owner Membership</h1>
            <p>
              Join the official association representing registered and verified houseboat operators across Bangladesh.
            </p>
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a className="button button--gold" href="/membership/apply">
                Apply for Membership <ArrowRight size={16} />
              </a>
              <a className="button button--outline-light" href="#fees-and-requirements">
                View Fees & Requirements
              </a>
            </div>
          </div>
          <div className="apply-hero__seal">
            <ShieldCheck size={36} />
            <span>
              Verified<br />Registry
            </span>
          </div>
        </div>
      </section>

      {/* Membership Benefits */}
      <section className="membership-benefits-section" id="fees-and-requirements">
        <div className="shell">
          <div className="section-header text-center" style={{ maxWidth: "680px", margin: "0 auto 44px" }}>
            <span className="section-kicker">Why Join HOAB</span>
            <h2>Membership Privileges & Protection</h2>
            <p>Official recognition, compliance assurance, and access to Bangladesh&apos;s largest tourism network.</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon"><BadgeCheck size={28} /></div>
              <h3>Statutory Recognition</h3>
              <p>Direct alignment with the Department of Shipping (DG Shipping), BIWTA, and local administration.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon"><Ship size={28} /></div>
              <h3>Central Registry Listing</h3>
              <p>Official listing on the verified HOAB public portal for travelers and corporate tour organizers.</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon"><Users size={28} /></div>
              <h3>B2B Partner Network</h3>
              <p>Direct business connectivity with verified travel agencies, tour operators, and corporate partners.</p>
            </div>
          </div>

          {/* Registration Fees Section */}
          <div className="membership-fees-wrapper">
            <div className="section-header text-center" style={{ marginBottom: "36px" }}>
              <span className="section-kicker">Fee Structure</span>
              <h2>One-Time Registration Fees</h2>
            </div>

            <div className="fee-cards-grid">
              <div className="fee-card">
                <span className="fee-badge">Category 1</span>
                <h3>Wooden Houseboat</h3>
                <p className="fee-sub">Traditional wooden body houseboats</p>
                <div className="fee-amount">
                  <span className="currency">BDT</span>
                  <strong>15,000</strong>
                  <span className="duration">/ one-time</span>
                </div>
                <ul className="fee-features">
                  <li><CheckCircle2 size={16} /> Official HOAB Membership Number</li>
                  <li><CheckCircle2 size={16} /> Verified Central Directory Listing</li>
                  <li><CheckCircle2 size={16} /> B2B Agent Network Access</li>
                  <li><CheckCircle2 size={16} /> Emergency Coordination & Advisory</li>
                </ul>
                <a className="button button--dark full-width" href="/membership/apply">
                  Apply Now <ArrowRight size={16} />
                </a>
              </div>

              <div className="fee-card fee-card--featured">
                <span className="fee-badge">Category 2</span>
                <h3>Steel Houseboat</h3>
                <p className="fee-sub">Modern steel hull houseboats</p>
                <div className="fee-amount">
                  <span className="currency">BDT</span>
                  <strong>20,000</strong>
                  <span className="duration">/ one-time</span>
                </div>
                <ul className="fee-features">
                  <li><CheckCircle2 size={16} /> Official HOAB Membership Number</li>
                  <li><CheckCircle2 size={16} /> Verified Central Directory Listing</li>
                  <li><CheckCircle2 size={16} /> B2B Agent Network Access</li>
                  <li><CheckCircle2 size={16} /> Emergency Coordination & Advisory</li>
                </ul>
                <a className="button button--gold full-width" href="/membership/apply">
                  Apply Now <ArrowRight size={16} />
                </a>
              </div>

              <div className="fee-card">
                <span className="fee-badge">Category 3</span>
                <h3>AC Houseboat</h3>
                <p className="fee-sub">Fully air-conditioned luxury houseboats</p>
                <div className="fee-amount">
                  <span className="currency">BDT</span>
                  <strong>25,000</strong>
                  <span className="duration">/ one-time</span>
                </div>
                <ul className="fee-features">
                  <li><CheckCircle2 size={16} /> Official HOAB Membership Number</li>
                  <li><CheckCircle2 size={16} /> Verified Central Directory Listing</li>
                  <li><CheckCircle2 size={16} /> B2B Agent Network Access</li>
                  <li><CheckCircle2 size={16} /> Emergency Coordination & Advisory</li>
                </ul>
                <a className="button button--dark full-width" href="/membership/apply">
                  Apply Now <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Documents Checklist & CTA */}
          <div className="apply-cta-banner">
            <div>
              <h3>Documents for Online Application</h3>
              <p>Upload any available Trade License, Owner&apos;s Photo, Owner&apos;s NID/Passport, DG Shipping Certificate, Survey Certificate, and Bank Deposit Slip.</p>
            </div>
            <a className="button button--gold" href="/membership/apply">
              Start Online Application <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
