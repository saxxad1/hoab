"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Building2, Check, FileText, ShieldCheck, Upload } from "lucide-react";
import { Footer, Header } from "../../components/PublicSite";

const steps = ["Agency", "Contact", "Documents", "Review"];

export default function B2BApplicationPage() {
  const [language, setLanguage] = useState<"en" | "bn">("en");
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ agency: "", type: "Travel Agency", license: "", year: "", name: "", designation: "", mobile: "", email: "", address: "", district: "" });
  const set = (field: keyof typeof form, value: string) => setForm((current) => ({ ...current, [field]: value }));

  if (submitted) {
    return <main><Header language={language} onLanguage={setLanguage} /><section className="success-page"><div className="success-card"><div className="success-icon"><Check /></div><span className="section-kicker">Application received</span><h1>Thank you, {form.name || "applicant"}.</h1><p>Your application has been recorded for review. Keep this reference number for future correspondence.</p><div className="reference-number"><small>Application reference</small><strong>HOAB-B2B-2026-0048</strong></div><div className="success-details"><span>Agency<strong>{form.agency || "Your agency"}</strong></span><span>Review time<strong>5–7 working days</strong></span><span>Confirmation<strong>{form.email || "Email provided"}</strong></span></div><a className="button button--dark" href="/">Return to HOAB home <ArrowRight size={16} /></a></div></section><Footer /></main>;
  }

  const next = (event: React.FormEvent) => {
    event.preventDefault();
    if (step === 3) setSubmitted(true);
    else setStep((current) => current + 1);
  };

  return (
    <main>
      <Header language={language} onLanguage={setLanguage} />
      <section className="apply-hero"><div className="shell apply-hero__inner"><div><span className="section-kicker section-kicker--light">HOAB partner network</span><h1>Authorised B2B agent application</h1><p>Submit your agency information and documents through the official HOAB channel.</p></div><div className="apply-hero__seal"><ShieldCheck /><span>Secure<br />review process</span></div></div></section>
      <section className="application-section"><div className="shell application-layout">
        <aside className="application-intro"><div className="b2b-icon b2b-icon--light"><Building2 /></div><h2>A clearer route to trusted partnerships.</h2><p>Approved agencies are listed in HOAB&apos;s public directory and connected to a verified houseboat network.</p><ul><li><Check /> Official recognition</li><li><Check /> Verified operator network</li><li><Check /> Structured business rules</li><li><Check /> Tourism-event opportunities</li></ul><div className="help-box"><strong>Need help?</strong><span>b2b@hoab.org.bd</span><span>+880 1700 123 456</span></div></aside>
        <div className="application-card">
          <div className="stepper">{steps.map((label, index) => <div className={`${index === step ? "is-current" : ""} ${index < step ? "is-done" : ""}`} key={label}><span>{index < step ? <Check size={14} /> : index + 1}</span><small>{label}</small></div>)}</div>
          <form onSubmit={next}>
            {step === 0 && <fieldset><legend>Agency information</legend><p className="form-lead">Tell us about the business applying to join the HOAB partner network.</p><div className="form-grid"><label className="span-2">Agency name<input required value={form.agency} onChange={(e) => set("agency", e.target.value)} placeholder="Registered agency name" /></label><label>Agency type<select value={form.type} onChange={(e) => set("type", e.target.value)}><option>Travel Agency</option><option>Tour Operator</option><option>Corporate Travel</option><option>Online Travel Agency</option></select></label><label>Year established<input required value={form.year} onChange={(e) => set("year", e.target.value)} placeholder="e.g. 2018" inputMode="numeric" /></label><label className="span-2">Trade license number<input required value={form.license} onChange={(e) => set("license", e.target.value)} placeholder="License number" /></label></div></fieldset>}
            {step === 1 && <fieldset><legend>Contact & office</legend><p className="form-lead">This person will be the primary point of contact during the review.</p><div className="form-grid"><label>Full name<input required value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Responsible person" /></label><label>Designation<input required value={form.designation} onChange={(e) => set("designation", e.target.value)} placeholder="e.g. Managing Director" /></label><label>Mobile number<input required value={form.mobile} onChange={(e) => set("mobile", e.target.value)} placeholder="+880 1XXX XXXXXX" /></label><label>Email address<input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@agency.com" /></label><label className="span-2">Office address<textarea required value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="Full business address" /></label><label>District<input required value={form.district} onChange={(e) => set("district", e.target.value)} placeholder="District" /></label></div></fieldset>}
            {step === 2 && <fieldset><legend>Supporting documents</legend><p className="form-lead">Upload clear PDF, JPG or PNG files. Private documents are visible only to authorised reviewers.</p><div className="upload-grid"><label className="upload-card"><Upload /><strong>Trade license</strong><span>PDF, JPG or PNG · max 8 MB</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" /></label><label className="upload-card"><Upload /><strong>Association certificate</strong><span>PDF, JPG or PNG · max 8 MB</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" /></label><label className="upload-card"><Upload /><strong>Responsible person NID</strong><span>Front and back in one file</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" /></label><label className="upload-card upload-card--optional"><FileText /><strong>Additional document</strong><span>Optional supporting file</span><input type="file" accept=".pdf,.jpg,.jpeg,.png" /></label></div></fieldset>}
            {step === 3 && <fieldset><legend>Review application</legend><p className="form-lead">Confirm your details before sending the application to HOAB.</p><div className="review-list"><div><span>Agency</span><strong>{form.agency || "Not provided"}</strong><small>{form.type} · Established {form.year || "—"}</small></div><div><span>Trade license</span><strong>{form.license || "Not provided"}</strong></div><div><span>Contact</span><strong>{form.name || "Not provided"}</strong><small>{form.designation} · {form.mobile}</small></div><div><span>Email</span><strong>{form.email || "Not provided"}</strong></div></div><label className="declaration"><input required type="checkbox" /><span>I confirm that all submitted information is accurate.</span></label><label className="declaration"><input required type="checkbox" /><span>I agree to HOAB&apos;s B2B terms and policies.</span></label></fieldset>}
            <div className="form-actions">{step > 0 ? <button type="button" className="button button--outline" onClick={() => setStep((current) => current - 1)}><ArrowLeft size={16} /> Back</button> : <a className="button button--outline" href="/"><ArrowLeft size={16} /> Exit</a>}<button className="button button--gold" type="submit">{step === 3 ? "Submit application" : "Save & continue"} <ArrowRight size={16} /></button></div>
          </form>
        </div>
      </div></section>
      <Footer />
    </main>
  );
}
