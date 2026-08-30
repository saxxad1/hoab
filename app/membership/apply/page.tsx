"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  Copy,
  CreditCard,
  FileCheck,
  FileText,
  HelpCircle,
  Info,
  ShieldCheck,
  Ship,
  Upload,
  User,
  Users,
} from "lucide-react";
import { Footer, Header } from "../../components/PublicSite";
import { createSupabaseBrowserClient } from "../../../lib/supabase/client";
import { PRIVATE_DOCUMENT_BUCKET } from "../../../lib/supabase/config";
import { AnimatePresence, motion } from "motion/react";

const steps = ["Information", "Documents", "Payment", "Review"];

const categoryFees = {
  Wooden: { name: "Wooden Houseboat (কাঠের হাউসবোট)", fee: 15000, desc: "ঐতিহ্যবাহী কাঠের তৈরি প্রিমিয়াম হাউসবোট" },
  Steel: { name: "Steel Houseboat (স্টিল হাউসবোট)", fee: 20000, desc: "আধুনিক স্টিল বডির মজবুত হাউসবোট" },
  AC: { name: "AC Houseboat (এসি হাউসবোট)", fee: 25000, desc: "পূর্ণাঙ্গ শীতাতপ নিয়ন্ত্রিত লাক্সারি হাউসবোট" },
} as const;

type CategoryKey = keyof typeof categoryFees;

export default function MemberApplicationPage() {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copiedField, setCopiedField] = useState("");
  const [submission, setSubmission] = useState({ referenceNumber: "", submittedAt: "", email: "" });

  const [category, setCategory] = useState<CategoryKey>("Wooden");

  // Form State
  const [form, setForm] = useState({
    // Owner
    ownerName: "",
    ownerNid: "",
    ownerPhone: "",
    ownerEmail: "",
    permanentAddress: "",
    fatherName: "",
    fatherNid: "",
    // Boat
    boatName: "",
    tradeLicenseNumber: "",
    dgShippingNumber: "",
    officeAddress: "",
    length: "",
    width: "",
    height: "",
    totalCabins: "",
    lifeJacketCount: "",
    lifeBuoyCount: "",
    engineDetails: "",
    firstAidBox: true,
    fireSafetyEquipment: "",
    facebookPage: "",
    businessEmail: "",
    // Staff
    totalStaff: "",
    managerName: "",
    managerPhone: "",
    sukaniName: "",
    sukaniPhone: "",
    driverName: "",
    driverPhone: "",
    // Payment
    paymentMethod: "Bank Deposit",
    paymentReference: "",
    paymentDate: new Date().toISOString().slice(0, 10),
    agreeTerms: false,
  });

  // Uploaded Files State
  const [files, setFiles] = useState<Record<string, File | null>>({
    trade_license: null,
    owner_photo: null,
    owner_nid: null,
    dg_shipping: null,
    survey_certificate: null,
    payment_slip: null,
  });

  const set = (field: keyof typeof form, value: unknown) =>
    setForm((current) => ({ ...current, [field]: value }));

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2500);
  };

  const handleFileChange = (docType: string, file: File | null) => {
    if (file && file.size > 12 * 1024 * 1024) {
      setError(`ফাইল সাইজ ১২ মেগাবাইটের বেশি হতে পারবে না: ${file.name}`);
      return;
    }
    setError("");
    setFiles((prev) => ({ ...prev, [docType]: file }));
  };

  if (submitted) {
    return (
      <main>
        <Header />
        <section className="success-page">
          <div className="success-card">
            <div className="success-icon">
              <Check />
            </div>
            <span className="section-kicker">সদস্য আবেদন সফল হয়েছে</span>
            <h1>ধন্যবাদ, {form.ownerName || "হাউসবোট মালিক"}!</h1>
            <p>
              আপনার মেম্বারশিপ রেজিস্ট্রেশন আবেদনটি যাচাইকরণের জন্য HOAB অ্যাডমিন প্যানেলে সফলভাবে জমা হয়েছে।
              ভবিষ্যত যোগাযোগের জন্য এই রেফারেন্স নম্বরটি সংরক্ষণ করুন।
            </p>
            <div className="reference-number">
              <small>মেম্বারশিপ ট্র্যাকিং রেফারেন্স</small>
              <strong>{submission.referenceNumber}</strong>
            </div>
            <div className="success-details">
              <span>
                হাউসবোটের নাম<strong>{form.boatName || "N/A"}</strong>
              </span>
              <span>
                ক্যাটাগরি ও ফি<strong>{categoryFees[category].name} — ৳{categoryFees[category].fee.toLocaleString()}</strong>
              </span>
              <span>
                যাচাইকরণ সময়<strong>৩–৫ কার্যদিবস</strong>
              </span>
              <span>
                নিশ্চিতকরণ ইমেইল<strong>{submission.email || form.ownerEmail}</strong>
              </span>
            </div>
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a className="button button--dark" href="/">
                ওয়েবসাইটে ফিরে যান <ArrowRight size={16} />
              </a>
              <button
                type="button"
                className="button button--gold"
                onClick={() => window.print()}
              >
                আবেদনের রিসিট প্রিন্ট করুন
              </button>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  const next = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    // Validation for Step 0 (Information)
    if (step === 0) {
      if (!form.ownerName.trim()) { setError("মালিকের নাম (Owner Name) পূরণ করা আবশ্যক।"); return; }
      if (!form.ownerNid.trim()) { setError("মালিকের এনআইডি/পাসপোর্ট নম্বর প্রদান করুন।"); return; }
      if (!form.ownerPhone.trim()) { setError("মালিকের মোবাইল নম্বর প্রদান করুন।"); return; }
      if (!form.ownerEmail.trim()) { setError("মালিকের ইমেইল ঠিকানা প্রদান করুন।"); return; }
      if (!form.permanentAddress.trim()) { setError("মালিকের স্থায়ী ঠিকানা প্রদান করুন।"); return; }
      if (!form.boatName.trim()) { setError("হাউসবোটের নাম (Boat Name) প্রদান করুন।"); return; }
      if (!form.tradeLicenseNumber.trim()) { setError("ট্রেড লাইসেন্স নম্বর প্রদান করুন।"); return; }
      setStep(1);
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    // Validation for Step 1 (Documents)
    if (step === 1) {
      if (!files.trade_license) { setError("ট্রেড লাইসেন্স কপি আপলোড করা বাধ্যতামূলক।"); return; }
      if (!files.owner_photo) { setError("মালিকের ছবি আপলোড করা বাধ্যতামূলক।"); return; }
      if (!files.owner_nid) { setError("মালিকের এনআইডি কার্ড বা পাসপোর্ট কপি আপলোড করা বাধ্যতামূলক।"); return; }
      if (!files.dg_shipping) { setError("ডিজি শিপিং রেজিস্ট্রেশন সনদ আপলোড করা বাধ্যতামূলক।"); return; }
      if (!files.survey_certificate) { setError("সার্ভে সনদ আপলোড করা বাধ্যতামূলক।"); return; }
      setStep(2);
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    // Validation for Step 2 (Payment)
    if (step === 2) {
      if (!files.payment_slip) { setError("ব্যাংক জমার স্লিপ বা স্ক্রিনশট আপলোড করা বাধ্যতামূলক।"); return; }
      if (!form.paymentReference.trim()) { setError("ট্রানজেকশন আইডি বা জমার রেফারেন্স নম্বর প্রদান করুন।"); return; }
      if (!form.agreeTerms) { setError("অ্যাসোসিয়েশনের নিয়মাবলি মেনে নেওয়ার ঘোষণাপত্রে টিক চিহ্ন দিন।"); return; }
      setStep(3);
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    // Submission at Step 3 (Review & Final Submit)
    try {
      setSubmitting(true);
      const fields = {
        membershipType: category,
        feeAmount: categoryFees[category].fee,
        ownerName: form.ownerName,
        ownerNid: form.ownerNid,
        ownerPhone: form.ownerPhone,
        ownerEmail: form.ownerEmail,
        permanentAddress: form.permanentAddress,
        fatherName: form.fatherName,
        fatherNid: form.fatherNid,
        boatName: form.boatName,
        tradeLicenseNumber: form.tradeLicenseNumber,
        dgShippingNumber: form.dgShippingNumber,
        officeAddress: form.officeAddress,
        length: form.length,
        width: form.width,
        height: form.height,
        totalCabins: Number(form.totalCabins) || 0,
        lifeJacketCount: Number(form.lifeJacketCount) || 0,
        lifeBuoyCount: Number(form.lifeBuoyCount) || 0,
        engineDetails: form.engineDetails,
        firstAidBox: form.firstAidBox,
        fireSafetyEquipment: form.fireSafetyEquipment,
        facebookPage: form.facebookPage,
        businessEmail: form.businessEmail,
        totalStaff: Number(form.totalStaff) || 0,
        managerName: form.managerName,
        managerPhone: form.managerPhone,
        sukaniName: form.sukaniName,
        sukaniPhone: form.sukaniPhone,
        driverName: form.driverName,
        driverPhone: form.driverPhone,
        paymentMethod: form.paymentMethod,
        paymentReference: form.paymentReference,
        paymentDate: form.paymentDate,
      };

      const documents = Object.entries(files).flatMap(([documentType, file]) =>
        file ? [{ documentType, name: file.name, contentType: file.type || "application/octet-stream", size: file.size }] : []
      );

      const response = await fetch("/api/membership/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, documents }),
      });

      const result = (await response.json()) as {
        referenceNumber?: string;
        submissionToken?: string;
        uploads?: Array<{ documentType: string; path: string; token: string }>;
        email?: string;
        error?: string;
      };

      if (!response.ok || !result.referenceNumber || !result.submissionToken || !result.uploads) {
        throw new Error(result.error || "আবেদন প্রসেস করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।");
      }

      // Upload each file via signed URL to Supabase Storage
      const supabase = createSupabaseBrowserClient();
      for (const upload of result.uploads) {
        const file = files[upload.documentType];
        if (!file) throw new Error("একটি আবশ্যক ডকুমেন্ট ফাইল মিসিং হয়েছে।");
        const { error: uploadError } = await supabase.storage
          .from(PRIVATE_DOCUMENT_BUCKET)
          .uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type });
        if (uploadError) {
          throw new Error(`ডকুমেন্ট আপলোড ব্যর্থ হয়েছে (${file.name}): ${uploadError.message}`);
        }
      }

      // Complete submission
      const completeResponse = await fetch("/api/membership/applications/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber: result.referenceNumber,
          submissionToken: result.submissionToken,
        }),
      });

      const completed = (await completeResponse.json()) as {
        referenceNumber?: string;
        submittedAt?: string;
        email?: string;
        error?: string;
      };

      if (!completeResponse.ok || !completed.referenceNumber) {
        throw new Error(completed.error || "আবেদন সম্পন্ন করা সম্ভব হয়নি।");
      }

      setSubmission({
        referenceNumber: completed.referenceNumber,
        submittedAt: completed.submittedAt ?? "",
        email: completed.email ?? form.ownerEmail,
      });
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "আবেদন সাবমিট করতে সমস্যা হয়েছে।");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <Header />
      <section className="apply-hero">
        <div className="shell apply-hero__inner">
          <div>
            <span className="section-kicker section-kicker--light">Official HOAB Registry</span>
            <h1>Houseboat Owner Membership Application</h1>
            <p>হাউসবোট ওনার্স অ্যাসোসিয়েশন অব বাংলাদেশ (HOAB)-এর অফিসিয়াল মেম্বারশিপের জন্য অনলাইনে আবেদন করুন।</p>
          </div>
          <div className="apply-hero__seal">
            <ShieldCheck size={36} />
            <span>
              Verified<br />Membership
            </span>
          </div>
        </div>
      </section>

      <section className="application-section">
        <div className="shell application-layout">
          {/* Left Sidebar Info */}
          <aside className="application-intro">
            <div className="b2b-icon b2b-icon--light">
              <Ship size={32} />
            </div>
            <h2>মেম্বারশিপ সুবিধা ও নির্দেশনা</h2>
            <p>
              HOAB-এর সদস্যপদ গ্রহণের মাধ্যমে আপনার হাউসবোটকে সরকারি অনুমোদন, ডিজি শিপিং প্রটোকল এবং জাতীয় পর্যটন প্ল্যাটফর্মে তালিকাভুক্ত করুন।
            </p>

            <div className="apply-fee-summary-card">
              <h3>রেজিস্ট্রেশন ফি তালিকা</h3>
              <ul>
                <li>
                  <span>কাঠের হাউসবোট (Wooden):</span>
                  <strong>৳১৫,০০০</strong>
                </li>
                <li>
                  <span>স্টিল হাউসবোট (Steel):</span>
                  <strong>৳২০,০০০</strong>
                </li>
                <li>
                  <span>এসি হাউসবোট (AC):</span>
                  <strong>৳২৫,০০০</strong>
                </li>
              </ul>
            </div>

            <div className="apply-requirements-box">
              <h4>প্রয়োজনীয় কাগজপত্র (JPG, PNG, PDF):</h4>
              <ol>
                <li>ট্রেড লাইসেন্স কপি</li>
                <li>মালিকের পাসপোর্ট সাইজ ছবি</li>
                <li>মালিকের জাতীয় পরিচয়পত্র (NID)</li>
                <li>ডিজি শিপিং রেজিস্ট্রেশন সনদ</li>
                <li>সার্ভে সনদ</li>
                <li>ব্যাংক জমার স্লিপ বা স্ক্রিনশট</li>
              </ol>
            </div>
          </aside>

          {/* Main Application Card */}
          <div className="application-card">
            {/* Step Indicators */}
            <div className="step-progress" role="tablist" aria-label="Membership form steps">
              {steps.map((label, idx) => (
                <div
                  key={label}
                  className={`step-item ${idx === step ? "is-active" : idx < step ? "is-complete" : ""}`}
                >
                  <span className="step-number">{idx < step ? "✓" : idx + 1}</span>
                  <span className="step-label">
                    {idx === 0
                      ? "১. তথ্যাবলী"
                      : idx === 1
                      ? "২. ডকুমেন্টস"
                      : idx === 2
                      ? "৩. ব্যাংক পেমেন্ট"
                      : "৪. চূড়ান্ত যাচাই"}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <div
                className="form-error-banner"
                style={{
                  background: "#fff5f5",
                  border: "1px solid #fab1a0",
                  color: "#d63031",
                  padding: "14px 18px",
                  borderRadius: "6px",
                  margin: "20px 0",
                  fontSize: "14px",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <Info size={20} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={next}>
              <AnimatePresence mode="wait">
                {/* STEP 0: Information */}
                {step === 0 && (
                  <motion.div
                    key="step-0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="form-section-title">
                      <Ship size={20} />
                      <span>মেম্বারশিপ ক্যাটাগরি নির্বাচন করুন</span>
                    </div>

                    <div className="category-select-grid">
                      {(Object.keys(categoryFees) as CategoryKey[]).map((catKey) => {
                        const info = categoryFees[catKey];
                        const isSelected = category === catKey;
                        return (
                          <div
                            key={catKey}
                            className={`category-option-card ${isSelected ? "is-selected" : ""}`}
                            onClick={() => setCategory(catKey)}
                          >
                            <div className="cat-header">
                              <span className="cat-radio">{isSelected ? "●" : "○"}</span>
                              <strong>{info.name}</strong>
                            </div>
                            <p>{info.desc}</p>
                            <div className="cat-fee">
                              রেজিস্ট্রেশন ফি: <strong>৳{info.fee.toLocaleString()} BDT</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* OWNER INFORMATION */}
                    <div className="form-section-title" style={{ marginTop: "32px" }}>
                      <User size={20} />
                      <span>মালিকের তথ্যাবলী (Owner's Information)</span>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        আবেদনকারী / মালিকের নাম *
                        <input
                          type="text"
                          required
                          value={form.ownerName}
                          onChange={(e) => set("ownerName", e.target.value)}
                          placeholder="e.g. মো: রফিকুল ইসলাম"
                        />
                      </label>

                      <label>
                        এনআইডি বা পাসপোর্ট নম্বর *
                        <input
                          type="text"
                          required
                          value={form.ownerNid}
                          onChange={(e) => set("ownerNid", e.target.value)}
                          placeholder="e.g. 19851234567890"
                        />
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        মোবাইল নম্বর *
                        <input
                          type="tel"
                          required
                          value={form.ownerPhone}
                          onChange={(e) => set("ownerPhone", e.target.value)}
                          placeholder="e.g. 01712345678"
                        />
                      </label>

                      <label>
                        ইমেইল ঠিকানা *
                        <input
                          type="email"
                          required
                          value={form.ownerEmail}
                          onChange={(e) => set("ownerEmail", e.target.value)}
                          placeholder="e.g. owner@example.com"
                        />
                      </label>
                    </div>

                    <label>
                      স্থায়ী ঠিকানা *
                      <textarea
                        required
                        rows={2}
                        value={form.permanentAddress}
                        onChange={(e) => set("permanentAddress", e.target.value)}
                        placeholder="গ্রাম/রোড, ডাকঘর, উপজেলা, জেলা"
                      />
                    </label>

                    <div className="form-grid-2">
                      <label>
                        পিতার নাম (Father's Name)
                        <input
                          type="text"
                          value={form.fatherName}
                          onChange={(e) => set("fatherName", e.target.value)}
                          placeholder="পিতার পূর্ণ নাম"
                        />
                      </label>

                      <label>
                        পিতার এনআইডি (Father's NID)
                        <input
                          type="text"
                          value={form.fatherNid}
                          onChange={(e) => set("fatherNid", e.target.value)}
                          placeholder="পিতার এনআইডি নম্বর"
                        />
                      </label>
                    </div>

                    {/* BOAT INFORMATION */}
                    <div className="form-section-title" style={{ marginTop: "32px" }}>
                      <Ship size={20} />
                      <span>হাউসবোটের তথ্যাবলী (Boat Information)</span>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        হাউসবোটের নাম (Boat Name) *
                        <input
                          type="text"
                          required
                          value={form.boatName}
                          onChange={(e) => set("boatName", e.target.value)}
                          placeholder="e.g. জলপদ্ম হাউসবোট / Jolpoddo"
                        />
                      </label>

                      <label>
                        ট্রেড লাইসেন্স নম্বর *
                        <input
                          type="text"
                          required
                          value={form.tradeLicenseNumber}
                          onChange={(e) => set("tradeLicenseNumber", e.target.value)}
                          placeholder="e.g. TRAD/SUN/2026/0124"
                        />
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        ডিজি শিপিং রেজিস্ট্রেশন নম্বর
                        <input
                          type="text"
                          value={form.dgShippingNumber}
                          onChange={(e) => set("dgShippingNumber", e.target.value)}
                          placeholder="ডিজি শিপিং সনদ নম্বর"
                        />
                      </label>

                      <label>
                        অফিসের ঠিকানা (Office Address)
                        <input
                          type="text"
                          value={form.officeAddress}
                          onChange={(e) => set("officeAddress", e.target.value)}
                          placeholder="অফিস বা বুকিং পয়েন্টের ঠিকানা"
                        />
                      </label>
                    </div>

                    <div className="form-grid-3">
                      <label>
                        দৈর্ঘ্য (Length - ফুট)
                        <input
                          type="text"
                          value={form.length}
                          onChange={(e) => set("length", e.target.value)}
                          placeholder="e.g. 75 ft"
                        />
                      </label>
                      <label>
                        প্রস্থ (Width - ফুট)
                        <input
                          type="text"
                          value={form.width}
                          onChange={(e) => set("width", e.target.value)}
                          placeholder="e.g. 18 ft"
                        />
                      </label>
                      <label>
                        উচ্চতা (Height - ফুট)
                        <input
                          type="text"
                          value={form.height}
                          onChange={(e) => set("height", e.target.value)}
                          placeholder="e.g. 12 ft"
                        />
                      </label>
                    </div>

                    <div className="form-grid-3">
                      <label>
                        মোট কেবিন সংখ্যা
                        <input
                          type="number"
                          min="0"
                          value={form.totalCabins}
                          onChange={(e) => set("totalCabins", e.target.value)}
                          placeholder="e.g. 6"
                        />
                      </label>
                      <label>
                        লাইফ জ্যাকেট সংখ্যা
                        <input
                          type="number"
                          min="0"
                          value={form.lifeJacketCount}
                          onChange={(e) => set("lifeJacketCount", e.target.value)}
                          placeholder="e.g. 35"
                        />
                      </label>
                      <label>
                        লাইফ বয়া সংখ্যা
                        <input
                          type="number"
                          min="0"
                          value={form.lifeBuoyCount}
                          onChange={(e) => set("lifeBuoyCount", e.target.value)}
                          placeholder="e.g. 8"
                        />
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        ইঞ্জিনের বিবরণ (Engine Details)
                        <input
                          type="text"
                          value={form.engineDetails}
                          onChange={(e) => set("engineDetails", e.target.value)}
                          placeholder="e.g. 6 Cylinder Marine Diesel 120HP"
                        />
                      </label>

                      <label>
                        অগ্নিনির্বাপক ব্যবস্থা (Fire Safety)
                        <input
                          type="text"
                          value={form.fireSafetyEquipment}
                          onChange={(e) => set("fireSafetyEquipment", e.target.value)}
                          placeholder="e.g. 4 Fire Extinguishers & Sand Buckets"
                        />
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        ফেসবুক পেজের নাম / লিংক
                        <input
                          type="text"
                          value={form.facebookPage}
                          onChange={(e) => set("facebookPage", e.target.value)}
                          placeholder="e.g. facebook.com/jolpoddohouseboat"
                        />
                      </label>

                      <label>
                        ব্যবসায়িক ইমেইল
                        <input
                          type="email"
                          value={form.businessEmail}
                          onChange={(e) => set("businessEmail", e.target.value)}
                          placeholder="e.g. booking@jolpoddo.com"
                        />
                      </label>
                    </div>

                    {/* STAFF INFORMATION */}
                    <div className="form-section-title" style={{ marginTop: "32px" }}>
                      <Users size={20} />
                      <span>স্টাফ তথ্যাবলী (Staff Information)</span>
                    </div>

                    <div className="form-grid-3">
                      <label>
                        মোট স্টাফ সংখ্যা
                        <input
                          type="number"
                          min="0"
                          value={form.totalStaff}
                          onChange={(e) => set("totalStaff", e.target.value)}
                          placeholder="e.g. 5"
                        />
                      </label>
                      <label>
                        ম্যানেজারের নাম
                        <input
                          type="text"
                          value={form.managerName}
                          onChange={(e) => set("managerName", e.target.value)}
                          placeholder="ম্যানেজারের নাম"
                        />
                      </label>
                      <label>
                        ম্যানেজারের মোবাইল নম্বর
                        <input
                          type="tel"
                          value={form.managerPhone}
                          onChange={(e) => set("managerPhone", e.target.value)}
                          placeholder="017xxxxxxxx"
                        />
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        সুকানির নাম ও মোবাইল নম্বর
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <input
                            type="text"
                            value={form.sukaniName}
                            onChange={(e) => set("sukaniName", e.target.value)}
                            placeholder="সুকানির নাম"
                          />
                          <input
                            type="tel"
                            value={form.sukaniPhone}
                            onChange={(e) => set("sukaniPhone", e.target.value)}
                            placeholder="মোবাইল নম্বর"
                          />
                        </div>
                      </label>

                      <label>
                        ড্রাইভারের নাম ও মোবাইল নম্বর
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <input
                            type="text"
                            value={form.driverName}
                            onChange={(e) => set("driverName", e.target.value)}
                            placeholder="ড্রাইভারের নাম"
                          />
                          <input
                            type="tel"
                            value={form.driverPhone}
                            onChange={(e) => set("driverPhone", e.target.value)}
                            placeholder="মোবাইল নম্বর"
                          />
                        </div>
                      </label>
                    </div>
                  </motion.div>
                )}

                {/* STEP 1: Documents Upload */}
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="form-section-title">
                      <FileCheck size={20} />
                      <span>প্রয়োজনীয় কাগজপত্র ও সার্টিফিকেট আপলোড</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--olive)", marginBottom: "20px" }}>
                      অনুগ্রহ করে স্পষ্ট ছবি অথবা PDF ফাইল আপলোড করুন (সর্বোচ্চ ১২ মেগাবাইট প্রতি ফাইল)।
                    </p>

                    <div className="documents-upload-grid">
                      {/* 1. Trade License */}
                      <div className="doc-upload-card">
                        <div className="doc-info">
                          <strong>১. ট্রেড লাইসেন্স কপি *</strong>
                          <small>হাউসবোটের হালনাগাদ ট্রেড লাইসেন্স</small>
                        </div>
                        <label className="doc-file-btn">
                          <Upload size={16} />
                          <span>{files.trade_license ? files.trade_license.name : "ফাইল নির্বাচন করুন"}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileChange("trade_license", e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>

                      {/* 2. Owner Photo */}
                      <div className="doc-upload-card">
                        <div className="doc-info">
                          <strong>২. মালিকের পাসপোর্ট সাইজ ছবি *</strong>
                          <small>আবেদনকারী মালিকের সাম্প্রতিক রঙিন ছবি</small>
                        </div>
                        <label className="doc-file-btn">
                          <Upload size={16} />
                          <span>{files.owner_photo ? files.owner_photo.name : "ছবি নির্বাচন করুন"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange("owner_photo", e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>

                      {/* 3. Owner NID */}
                      <div className="doc-upload-card">
                        <div className="doc-info">
                          <strong>৩. মালিকের এনআইডি / পাসপোর্ট কপি *</strong>
                          <small>জাতীয় পরিচয়পত্রের উভয় পাশের স্পষ্ট কপি</small>
                        </div>
                        <label className="doc-file-btn">
                          <Upload size={16} />
                          <span>{files.owner_nid ? files.owner_nid.name : "ফাইল নির্বাচন করুন"}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileChange("owner_nid", e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>

                      {/* 4. DG Shipping Registration */}
                      <div className="doc-upload-card">
                        <div className="doc-info">
                          <strong>৪. ডিজি শিপিং রেজিস্ট্রেশন সনদ *</strong>
                          <small>Department of Shipping কর্তৃক রেজিস্ট্রেশন সার্টিফিকেট</small>
                        </div>
                        <label className="doc-file-btn">
                          <Upload size={16} />
                          <span>{files.dg_shipping ? files.dg_shipping.name : "ফাইল নির্বাচন করুন"}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileChange("dg_shipping", e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>

                      {/* 5. Survey Certificate */}
                      <div className="doc-upload-card">
                        <div className="doc-info">
                          <strong>৫. সার্ভে সনদ (Survey Certificate) *</strong>
                          <small>হাউসবোটের হালনাগাদ ফিটনেস ও সার্ভে সনদ</small>
                        </div>
                        <label className="doc-file-btn">
                          <Upload size={16} />
                          <span>{files.survey_certificate ? files.survey_certificate.name : "ফাইল নির্বাচন করুন"}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => handleFileChange("survey_certificate", e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Bank Payment */}
                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="form-section-title">
                      <CreditCard size={20} />
                      <span>অফিসিয়াল ব্যাংক অ্যাকাউন্ট ও ফি পরিশোধ</span>
                    </div>

                    {/* Official Bank Account Box */}
                    <div className="official-bank-box">
                      <div className="bank-header">
                        <Building2 size={24} />
                        <div>
                          <strong>Mutual Trust Bank PLC</strong>
                          <small>Sunamganj Sub-Branch (0751)</small>
                        </div>
                      </div>

                      <div className="bank-grid">
                        <div className="bank-item">
                          <span>Account Name (হিসাবের নাম):</span>
                          <strong>JOLPODDO HOUSEBOAT</strong>
                        </div>

                        <div className="bank-item">
                          <span>Account Number (হিসাব নম্বর):</span>
                          <div className="copy-row">
                            <strong>1301000465529</strong>
                            <button
                              type="button"
                              className="copy-btn"
                              onClick={() => copyToClipboard("1301000465529", "acc")}
                            >
                              <Copy size={14} />
                              {copiedField === "acc" ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>

                        <div className="bank-item">
                          <span>Routing Number (রাউটিং নম্বর):</span>
                          <div className="copy-row">
                            <strong>145901198</strong>
                            <button
                              type="button"
                              className="copy-btn"
                              onClick={() => copyToClipboard("145901198", "route")}
                            >
                              <Copy size={14} />
                              {copiedField === "route" ? "Copied!" : "Copy"}
                            </button>
                          </div>
                        </div>

                        <div className="bank-item">
                          <span>প্রদেয় ফি (Registration Fee):</span>
                          <strong className="fee-highlight">
                            ৳{categoryFees[category].fee.toLocaleString()} BDT ({categoryFees[category].name})
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="payment-instructions-alert">
                      <Info size={20} />
                      <div>
                        <strong>টাকা পাঠানোর নিয়ম:</strong>
                        <p>
                          উপরের ব্যাংক অ্যাকাউন্টে আপনার ক্যাটাগরি অনুযায়ী মোট ৳{categoryFees[category].fee.toLocaleString()} টাকা ব্যাংক ডিপোজিট, এনপিএসবি (NPSB), বিইএফটিএন (BEFTN) বা অনলাইন ব্যাংকিংয়ের মাধ্যমে জমা দিন এবং জমার রশিদ বা স্ক্রিনশট নিচে আপলোড করুন।
                        </p>
                      </div>
                    </div>

                    {/* Deposit Slip Upload */}
                    <div className="doc-upload-card" style={{ marginTop: "20px" }}>
                      <div className="doc-info">
                        <strong>টাকা জমার স্লিপ বা স্ক্রিনশট আপলোড *</strong>
                        <small>ব্যাংক ডিপোজিট স্লিপ, ফান্ড ট্রান্সফার রিসিট বা মোবাইল ব্যাংকিং ট্রানজেকশন স্ক্রিনশট</small>
                      </div>
                      <label className="doc-file-btn">
                        <Upload size={16} />
                        <span>{files.payment_slip ? files.payment_slip.name : "রশিদ / স্ক্রিনশট আপলোড করুন"}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          required
                          onChange={(e) => handleFileChange("payment_slip", e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>

                    <div className="form-grid-2" style={{ marginTop: "16px" }}>
                      <label>
                        ট্রানজেকশন আইডি / জমার রেফারেন্স নম্বর *
                        <input
                          type="text"
                          required
                          value={form.paymentReference}
                          onChange={(e) => set("paymentReference", e.target.value)}
                          placeholder="e.g. TXN987654321 / ডিপোজিট স্লিপ নং"
                        />
                      </label>

                      <label>
                        টাকা জমার তারিখ *
                        <input
                          type="date"
                          required
                          value={form.paymentDate}
                          onChange={(e) => set("paymentDate", e.target.value)}
                        />
                      </label>
                    </div>

                    {/* Legal Declaration Checkbox */}
                    <label className="declaration-checkbox-row">
                      <input
                        type="checkbox"
                        checked={form.agreeTerms}
                        onChange={(e) => set("agreeTerms", e.target.checked)}
                      />
                      <span>
                        <strong>ঘোষণাপত্র:</strong> আমি নিশ্চয়তা প্রদান করছি যে এই ফরমে প্রদত্ত সকল তথ্য আমার জ্ঞান ও বিশ্বাসমতে সত্য এবং সঠিক। আমি হাউস বোট ওনার্স অ্যাসোসিয়েশন অব বাংলাদেশ (HOAB)-এর নিয়মাবলী ও আচরণবিধি মেনে চলতে বাধ্য থাকিব।
                      </span>
                    </label>
                  </motion.div>
                )}

                {/* STEP 3: Review & Submit */}
                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    <div className="form-section-title">
                      <BadgeCheck size={20} />
                      <span>আবেদনের চূড়ান্ত সারসংক্ষেপ যাচাই করুন</span>
                    </div>

                    <div className="review-summary-box">
                      <div className="summary-section">
                        <h4>১. হাউসবোট ও ক্যাটাগরি</h4>
                        <div className="summary-grid">
                          <div>হাউসবোটের নাম: <strong>{form.boatName}</strong></div>
                          <div>ক্যাটাগরি: <strong>{categoryFees[category].name}</strong></div>
                          <div>ট্রেড লাইসেন্স নং: <strong>{form.tradeLicenseNumber}</strong></div>
                          <div>ডিজি শিপিং নং: <strong>{form.dgShippingNumber || "N/A"}</strong></div>
                          <div>কেবিন সংখ্যা: <strong>{form.totalCabins || "N/A"}</strong></div>
                          <div>লাইফ জ্যাকেট / বয়া: <strong>{form.lifeJacketCount || 0} / {form.lifeBuoyCount || 0} টি</strong></div>
                        </div>
                      </div>

                      <div className="summary-section">
                        <h4>২. মালিকের তথ্য</h4>
                        <div className="summary-grid">
                          <div>মালিকের নাম: <strong>{form.ownerName}</strong></div>
                          <div>মোবাইল নম্বর: <strong>{form.ownerPhone}</strong></div>
                          <div>ইমেইল: <strong>{form.ownerEmail}</strong></div>
                          <div>এনআইডি/পাসপোর্ট: <strong>{form.ownerNid}</strong></div>
                          <div>স্থায়ী ঠিকানা: <strong>{form.permanentAddress}</strong></div>
                        </div>
                      </div>

                      <div className="summary-section">
                        <h4>৩. পেমেন্ট ও সংযুক্তিসমূহ</h4>
                        <div className="summary-grid">
                          <div>রেজিস্ট্রেশন ফি: <strong className="fee-highlight">৳{categoryFees[category].fee.toLocaleString()} BDT</strong></div>
                          <div>ট্রানজেকশন রেফারেন্স: <strong>{form.paymentReference}</strong></div>
                          <div>জমার তারিখ: <strong>{form.paymentDate}</strong></div>
                          <div>ডকুমেন্টস: <strong>{Object.values(files).filter(Boolean).length} টি ফাইল সংযুক্ত</strong></div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Navigation Buttons */}
              <div className="form-action-row">
                {step > 0 && (
                  <button
                    type="button"
                    className="button button--outline"
                    onClick={() => {
                      setError("");
                      setStep((prev) => prev - 1);
                      window.scrollTo({ top: 200, behavior: "smooth" });
                    }}
                    disabled={submitting}
                  >
                    <ArrowLeft size={16} /> পূর্ববর্তী ধাপ
                  </button>
                )}

                <button
                  type="submit"
                  className="button button--gold"
                  disabled={submitting}
                  style={{ marginLeft: "auto" }}
                >
                  {submitting
                    ? "আবেদন সাবমিট হচ্ছে…"
                    : step === 3
                    ? "আবেদন সম্পন্ন করুন"
                    : "পরবর্তী ধাপ"}
                  {!submitting && <ArrowRight size={16} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
