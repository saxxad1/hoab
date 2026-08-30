import { ArrowRight, BadgeCheck, Building2, CheckCircle2, FileCheck, FileText, HelpCircle, ShieldCheck, Ship, Users } from "lucide-react";
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
            <span className="section-kicker section-kicker--light">Official HOAB Membership</span>
            <h1>হাউসবোট ওনার্স অ্যাসোসিয়েশন মেম্বারশিপ</h1>
            <p>
              বাংলাদেশের পর্যটন শিল্পের অন্যতম সম্ভাবনাময় নৌ-পর্যটন খাতে আপনার হাউসবোটকে জাতীয়ভাবে নিবন্ধিত ও স্বীকৃত করুন।
            </p>
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <a className="button button--gold" href="/membership/apply">
                সদস্য হতে আবেদন করুন <ArrowRight size={16} />
              </a>
              <a className="button button--outline-light" href="#fees-and-requirements">
                ফি ও শর্তাবলী দেখুন
              </a>
            </div>
          </div>
          <div className="apply-hero__seal">
            <ShieldCheck size={36} />
            <span>
              Official<br />Registry
            </span>
          </div>
        </div>
      </section>

      {/* Membership Benefits */}
      <section className="membership-benefits-section" id="fees-and-requirements">
        <div className="shell">
          <div className="section-header text-center" style={{ maxWidth: "700px", margin: "0 auto 40px" }}>
            <span className="section-kicker">কেন HOAB সদস্য হবেন?</span>
            <h2>সদস্যপদের সুযোগ-সুবিধা ও সুরক্ষা</h2>
            <p>HOAB-এর সদস্যপদ শুধু একটি সনদ নয়, এটি আপনার নৌ-পর্যটন ব্যবসার বিশ্বাসযোগ্যতা ও নিরাপত্তা নিশ্চিত করে।</p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon"><BadgeCheck /></div>
              <h3>সরকারি ও আইনি স্বীকৃতি</h3>
              <p>নৌ-পরিবহন অধিদপ্তর (DG Shipping), বিআইডব্লিউটিএ এবং স্থানীয় প্রশাসনের সাথে সমন্বিত বৈধ পরিচালনা সুবিধা।</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon"><Ship /></div>
              <h3>অফিসিয়াল পোর্টালে অন্তর্ভুক্তি</h3>
              <p>HOAB-এর কেন্দ্রীয় ভেরিফায়েড ডিরেক্টরিতে আপনার হাউসবোটের প্রোফাইল ও বুকিং কন্টাক্ট সরাসরি পর্যটকদের জন্য দৃশ্যমান হবে।</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon"><Users /></div>
              <h3>বিটুবি (B2B) নেটওয়ার্ক সুবিধা</h3>
              <p>HOAB অনুমোদিত শত শত শীর্ষ ট্রাভেল এজেন্সি ও ট্যুর অপারেটরদের সাথে সরাসরি ব্যবসায়িক অংশীদারিত্বের সুযোগ।</p>
            </div>
          </div>

          {/* Registration Fees Section */}
          <div className="membership-fees-wrapper">
            <div className="section-header text-center" style={{ marginBottom: "32px" }}>
              <span className="section-kicker">রেজিস্ট্রেশন ফি কাঠামো</span>
              <h2>হাউসবোটের ধরন অনুযায়ী এককালীন ফি</h2>
            </div>

            <div className="fee-cards-grid">
              <div className="fee-card">
                <span className="fee-badge">ক্যাটাগরি ১</span>
                <h3>Wooden Houseboat</h3>
                <p className="fee-sub">ঐতিহ্যবাহী কাঠের তৈরি হাউসবোট</p>
                <div className="fee-amount">
                  <span className="currency">৳</span>
                  <strong>১৫,০০০</strong>
                  <span className="duration">/ এককালীন</span>
                </div>
                <ul className="fee-features">
                  <li><CheckCircle2 size={16} /> অফিসিয়াল HOAB মেম্বারশিপ নম্বর</li>
                  <li><CheckCircle2 size={16} /> কেন্দ্রীয় ওয়েবসাইটে প্রোফাইল লিস্টিং</li>
                  <li><CheckCircle2 size={16} /> B2B এজেন্ট নেটওয়ার্ক কানেক্টিভিটি</li>
                  <li><CheckCircle2 size={16} /> জরুরি উদ্ধার ও মনিটরিং সাপোর্ট</li>
                </ul>
                <a className="button button--dark full-width" href="/membership/apply">
                  আবেদন করুন <ArrowRight size={16} />
                </a>
              </div>

              <div className="fee-card fee-card--featured">
                <span className="fee-badge">ক্যাটাগরি ২</span>
                <h3>Steel Houseboat</h3>
                <p className="fee-sub">আধুনিক স্টিল বডির হাউসবোট</p>
                <div className="fee-amount">
                  <span className="currency">৳</span>
                  <strong>২০,০০০</strong>
                  <span className="duration">/ এককালীন</span>
                </div>
                <ul className="fee-features">
                  <li><CheckCircle2 size={16} /> অফিসিয়াল HOAB মেম্বারশিপ নম্বর</li>
                  <li><CheckCircle2 size={16} /> কেন্দ্রীয় ওয়েবসাইটে প্রোফাইল লিস্টিং</li>
                  <li><CheckCircle2 size={16} /> B2B এজেন্ট নেটওয়ার্ক কানেক্টিভিটি</li>
                  <li><CheckCircle2 size={16} /> জরুরি উদ্ধার ও মনিটরিং সাপোর্ট</li>
                </ul>
                <a className="button button--gold full-width" href="/membership/apply">
                  আবেদন করুন <ArrowRight size={16} />
                </a>
              </div>

              <div className="fee-card">
                <span className="fee-badge">ক্যাটাগরি ৩</span>
                <h3>AC Houseboat</h3>
                <p className="fee-sub">শীতাতপ নিয়ন্ত্রিত লাক্সারি হাউসবোট</p>
                <div className="fee-amount">
                  <span className="currency">৳</span>
                  <strong>২৫,০০০</strong>
                  <span className="duration">/ এককালীন</span>
                </div>
                <ul className="fee-features">
                  <li><CheckCircle2 size={16} /> অফিসিয়াল HOAB মেম্বারশিপ নম্বর</li>
                  <li><CheckCircle2 size={16} /> কেন্দ্রীয় ওয়েবসাইটে প্রিমিয়াম লিস্টিং</li>
                  <li><CheckCircle2 size={16} /> B2B এজেন্ট নেটওয়ার্ক কানেক্টিভিটি</li>
                  <li><CheckCircle2 size={16} /> জরুরি উদ্ধার ও মনিটরিং সাপোর্ট</li>
                </ul>
                <a className="button button--dark full-width" href="/membership/apply">
                  আবেদন করুন <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>

          {/* Official Bank Account Information */}
          <div className="membership-bank-card">
            <div className="bank-card-inner">
              <div className="bank-card-title">
                <Building2 size={32} />
                <div>
                  <h3>অফিসিয়াল ব্যাংক অ্যাকাউন্ট ডিটেইলস</h3>
                  <p>রেজিস্ট্রেশন ফি নিম্নোক্ত অ্যাকাউন্টে জমা দিয়ে জমার রশিদ আপলোড করতে হবে:</p>
                </div>
              </div>

              <div className="bank-details-grid">
                <div>
                  <span>Bank Name:</span>
                  <strong>Mutual Trust Bank PLC</strong>
                </div>
                <div>
                  <span>Branch Name:</span>
                  <strong>Sunamganj Sub-Branch (0751)</strong>
                </div>
                <div>
                  <span>Account Name:</span>
                  <strong>JOLPODDO HOUSEBOAT</strong>
                </div>
                <div>
                  <span>Account Number:</span>
                  <strong className="copyable-number">1301000465529</strong>
                </div>
                <div>
                  <span>Routing Number:</span>
                  <strong className="copyable-number">145901198</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Checklist & CTA */}
          <div className="apply-cta-banner">
            <div>
              <h3>আবেদনের জন্য প্রয়োজনীয় কাগজপত্র:</h3>
              <p>১. ট্রেড লাইসেন্স, ২. মালিকের ছবি, ৩. মালিকের এনআইডি, ৪. ডিজি শিপিং সনদ, ৫. সার্ভে সনদ, ৬. ব্যাংক জমার স্লিপ।</p>
            </div>
            <a className="button button--gold" href="/membership/apply">
              অনলাইনে আবেদন শুরু করুন <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
