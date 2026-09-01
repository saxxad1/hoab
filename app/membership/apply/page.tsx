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
  Wooden: { name: "Wooden Houseboat", fee: 15000, desc: "Traditional wooden hull craftsmanship" },
  Steel: { name: "Steel Houseboat", fee: 20000, desc: "Modern steel body construction" },
  AC: { name: "AC Houseboat", fee: 25000, desc: "Fully air-conditioned luxury vessel" },
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
      setError(`File size exceeds 12 MB limit: ${file.name}`);
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
            <span className="section-kicker">Application Received</span>
            <h1>Thank you, {form.ownerName || "Applicant"}.</h1>
            <p>
              Your membership registration application has been submitted for review.
              Please retain your reference number for future correspondence.
            </p>
            <div className="reference-number">
              <small>Application Reference</small>
              <strong>{submission.referenceNumber}</strong>
            </div>
            <div className="success-details">
              <span>
                Houseboat<strong>{form.boatName || "N/A"}</strong>
              </span>
              <span>
                Category & Fee<strong>{categoryFees[category].name} — BDT {categoryFees[category].fee.toLocaleString()}</strong>
              </span>
              <span>
                Review Period<strong>3–5 working days</strong>
              </span>
              <span>
                Confirmation<strong>{submission.email || form.ownerEmail}</strong>
              </span>
            </div>
            <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <a className="button button--dark" href="/">
                Return to Website <ArrowRight size={16} />
              </a>
              <button
                type="button"
                className="button button--gold"
                onClick={() => window.print()}
              >
                Print Receipt
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
      if (!form.ownerName.trim()) { setError("Owner's Name is required."); return; }
      if (!form.ownerNid.trim()) { setError("NID or Passport number is required."); return; }
      if (!form.ownerPhone.trim()) { setError("Contact phone number is required."); return; }
      if (!form.ownerEmail.trim()) { setError("Email address is required."); return; }
      if (!form.permanentAddress.trim()) { setError("Permanent address is required."); return; }
      if (!form.boatName.trim()) { setError("Houseboat name is required."); return; }
      if (!form.tradeLicenseNumber.trim()) { setError("Trade license number is required."); return; }
      setStep(1);
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    // Documents are optional. Applicants can continue with any certificates
    // they have available, or without uploading a document.
    if (step === 1) {
      setStep(2);
      window.scrollTo({ top: 200, behavior: "smooth" });
      return;
    }

    // Validation for Step 2 (Payment)
    if (step === 2) {
      if (!form.paymentReference.trim()) { setError("Transaction ID or deposit reference is required."); return; }
      if (!form.agreeTerms) { setError("Please accept the certification and rules declaration."); return; }
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
        throw new Error(result.error || "Unable to start application process.");
      }

      // Upload files via Supabase signed URLs
      const supabase = createSupabaseBrowserClient();
      for (const upload of result.uploads) {
        const file = files[upload.documentType];
        if (!file) throw new Error("A selected document is missing.");
        const { error: uploadError } = await supabase.storage
          .from(PRIVATE_DOCUMENT_BUCKET)
          .uploadToSignedUrl(upload.path, upload.token, file, { contentType: file.type });
        if (uploadError) {
          throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`);
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
        throw new Error(completed.error || "Unable to finalize application.");
      }

      setSubmission({
        referenceNumber: completed.referenceNumber,
        submittedAt: completed.submittedAt ?? "",
        email: completed.email ?? form.ownerEmail,
      });
      setSubmitted(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Submission failed. Please try again.");
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
            <p>Apply for verified association membership and national registry certification.</p>
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
            <h2>Membership Guide</h2>
            <p>
              Join the official network of verified houseboat operators for legal compliance, directory listing, and industry support.
            </p>

            <div className="apply-fee-summary-card">
              <h3>Registration Fees</h3>
              <ul>
                <li>
                  <span>Wooden Houseboat</span>
                  <strong>BDT 15,000</strong>
                </li>
                <li>
                  <span>Steel Houseboat</span>
                  <strong>BDT 20,000</strong>
                </li>
                <li>
                  <span>AC Houseboat</span>
                  <strong>BDT 25,000</strong>
                </li>
              </ul>
            </div>

            <div className="apply-requirements-box">
              <h4>Documents & Certificates:</h4>
              <ol>
                <li>Trade License Copy</li>
                <li>Owner&apos;s Photograph</li>
                <li>Owner&apos;s NID / Passport</li>
                <li>DG Shipping Certificate</li>
                <li>Survey Certificate</li>
                <li>Payment Deposit Slip</li>
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
                      ? "1. Information"
                      : idx === 1
                      ? "2. Documents"
                      : idx === 2
                      ? "3. Payment"
                      : "4. Review"}
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
                      <span>Select Membership Category</span>
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
                              Registration Fee: <strong>BDT {info.fee.toLocaleString()}</strong>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* OWNER INFORMATION */}
                    <div className="form-section-title" style={{ marginTop: "32px" }}>
                      <User size={20} />
                      <span>Owner Information</span>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        Applicant / Owner&apos;s Name *
                        <input
                          type="text"
                          required
                          value={form.ownerName}
                          onChange={(e) => set("ownerName", e.target.value)}
                        />
                      </label>

                      <label>
                        NID or Passport Number *
                        <input
                          type="text"
                          required
                          value={form.ownerNid}
                          onChange={(e) => set("ownerNid", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        Contact Phone Number *
                        <input
                          type="tel"
                          required
                          value={form.ownerPhone}
                          onChange={(e) => set("ownerPhone", e.target.value)}
                        />
                      </label>

                      <label>
                        Email Address *
                        <input
                          type="email"
                          required
                          value={form.ownerEmail}
                          onChange={(e) => set("ownerEmail", e.target.value)}
                        />
                      </label>
                    </div>

                    <label>
                      Permanent Address *
                      <textarea
                        required
                        rows={2}
                        value={form.permanentAddress}
                        onChange={(e) => set("permanentAddress", e.target.value)}
                      />
                    </label>

                    <div className="form-grid-2">
                      <label>
                        Father&apos;s Name
                        <input
                          type="text"
                          value={form.fatherName}
                          onChange={(e) => set("fatherName", e.target.value)}
                        />
                      </label>

                      <label>
                        Father&apos;s NID
                        <input
                          type="text"
                          value={form.fatherNid}
                          onChange={(e) => set("fatherNid", e.target.value)}
                        />
                      </label>
                    </div>

                    {/* BOAT INFORMATION */}
                    <div className="form-section-title" style={{ marginTop: "32px" }}>
                      <Ship size={20} />
                      <span>Boat Information</span>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        Houseboat Name *
                        <input
                          type="text"
                          required
                          value={form.boatName}
                          onChange={(e) => set("boatName", e.target.value)}
                        />
                      </label>

                      <label>
                        Trade License Number *
                        <input
                          type="text"
                          required
                          value={form.tradeLicenseNumber}
                          onChange={(e) => set("tradeLicenseNumber", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        DG Shipping Registration Number
                        <input
                          type="text"
                          value={form.dgShippingNumber}
                          onChange={(e) => set("dgShippingNumber", e.target.value)}
                        />
                      </label>

                      <label>
                        Office / Booking Address
                        <input
                          type="text"
                          value={form.officeAddress}
                          onChange={(e) => set("officeAddress", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="form-grid-3">
                      <label>
                        Length (ft)
                        <input
                          type="text"
                          value={form.length}
                          onChange={(e) => set("length", e.target.value)}
                        />
                      </label>
                      <label>
                        Width (ft)
                        <input
                          type="text"
                          value={form.width}
                          onChange={(e) => set("width", e.target.value)}
                        />
                      </label>
                      <label>
                        Height (ft)
                        <input
                          type="text"
                          value={form.height}
                          onChange={(e) => set("height", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="form-grid-3">
                      <label>
                        Total Cabins
                        <input
                          type="number"
                          min="0"
                          value={form.totalCabins}
                          onChange={(e) => set("totalCabins", e.target.value)}
                        />
                      </label>
                      <label>
                        Life Jackets Quantity
                        <input
                          type="number"
                          min="0"
                          value={form.lifeJacketCount}
                          onChange={(e) => set("lifeJacketCount", e.target.value)}
                        />
                      </label>
                      <label>
                        Life Buoys Quantity
                        <input
                          type="number"
                          min="0"
                          value={form.lifeBuoyCount}
                          onChange={(e) => set("lifeBuoyCount", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        Engine Specifications
                        <input
                          type="text"
                          value={form.engineDetails}
                          onChange={(e) => set("engineDetails", e.target.value)}
                        />
                      </label>

                      <label>
                        Fire Safety Equipment
                        <input
                          type="text"
                          value={form.fireSafetyEquipment}
                          onChange={(e) => set("fireSafetyEquipment", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        Facebook Page / Website
                        <input
                          type="text"
                          value={form.facebookPage}
                          onChange={(e) => set("facebookPage", e.target.value)}
                        />
                      </label>

                      <label>
                        Business Email
                        <input
                          type="email"
                          value={form.businessEmail}
                          onChange={(e) => set("businessEmail", e.target.value)}
                        />
                      </label>
                    </div>

                    {/* STAFF INFORMATION */}
                    <div className="form-section-title" style={{ marginTop: "32px" }}>
                      <Users size={20} />
                      <span>Staff Information</span>
                    </div>

                    <div className="form-grid-3">
                      <label>
                        Total Staff
                        <input
                          type="number"
                          min="0"
                          value={form.totalStaff}
                          onChange={(e) => set("totalStaff", e.target.value)}
                        />
                      </label>
                      <label>
                        Manager Name
                        <input
                          type="text"
                          value={form.managerName}
                          onChange={(e) => set("managerName", e.target.value)}
                        />
                      </label>
                      <label>
                        Manager Contact No
                        <input
                          type="tel"
                          value={form.managerPhone}
                          onChange={(e) => set("managerPhone", e.target.value)}
                        />
                      </label>
                    </div>

                    <div className="form-grid-2">
                      <label>
                        Sukani Name & Contact
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <input
                            type="text"
                            value={form.sukaniName}
                            onChange={(e) => set("sukaniName", e.target.value)}
                          />
                          <input
                            type="tel"
                            value={form.sukaniPhone}
                            onChange={(e) => set("sukaniPhone", e.target.value)}
                          />
                        </div>
                      </label>

                      <label>
                        Driver Name & Contact
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <input
                            type="text"
                            value={form.driverName}
                            onChange={(e) => set("driverName", e.target.value)}
                          />
                          <input
                            type="tel"
                            value={form.driverPhone}
                            onChange={(e) => set("driverPhone", e.target.value)}
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
                      <span>Documents & Certificates</span>
                    </div>
                    <p style={{ fontSize: "14px", color: "var(--olive)", marginBottom: "20px" }}>
                      Upload any certificates or documents you have available (JPG, PNG, or PDF up to 12 MB each).
                    </p>

                    <div className="documents-upload-grid">
                      {/* 1. Trade License */}
                      <div className="doc-upload-card">
                        <div className="doc-info">
                          <strong>1. Trade License Copy</strong>
                          <small>Updated trade license of the houseboat</small>
                        </div>
                        <label className="doc-file-btn">
                          <Upload size={16} />
                          <span>{files.trade_license ? files.trade_license.name : "Choose File"}</span>
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
                          <strong>2. Owner&apos;s Photograph</strong>
                          <small>Recent passport-size color photograph</small>
                        </div>
                        <label className="doc-file-btn">
                          <Upload size={16} />
                          <span>{files.owner_photo ? files.owner_photo.name : "Choose Image"}</span>
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
                          <strong>3. Owner&apos;s NID / Passport Copy</strong>
                          <small>Clear front and back copy of National ID or Passport</small>
                        </div>
                        <label className="doc-file-btn">
                          <Upload size={16} />
                          <span>{files.owner_nid ? files.owner_nid.name : "Choose File"}</span>
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
                          <strong>4. DG Shipping Registration Certificate</strong>
                          <small>Official registration certificate issued by Department of Shipping</small>
                        </div>
                        <label className="doc-file-btn">
                          <Upload size={16} />
                          <span>{files.dg_shipping ? files.dg_shipping.name : "Choose File"}</span>
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
                          <strong>5. Survey Certificate</strong>
                          <small>Valid vessel fitness and survey certificate</small>
                        </div>
                        <label className="doc-file-btn">
                          <Upload size={16} />
                          <span>{files.survey_certificate ? files.survey_certificate.name : "Choose File"}</span>
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
                      <span>Official Bank Account & Fee Payment</span>
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
                          <span>Account Name</span>
                          <strong>JOLPODDO HOUSEBOAT</strong>
                        </div>

                        <div className="bank-item">
                          <span>Account Number</span>
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
                          <span>Routing Number</span>
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
                          <span>Registration Fee</span>
                          <strong className="fee-highlight">
                            BDT {categoryFees[category].fee.toLocaleString()} ({categoryFees[category].name})
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="payment-instructions-alert">
                      <Info size={20} />
                      <div>
                        <strong>Payment Instructions:</strong>
                        <p>
                          Transfer BDT {categoryFees[category].fee.toLocaleString()} to the account above via Bank Deposit, NPSB, BEFTN, or Online Banking. Upload your transaction receipt below.
                        </p>
                      </div>
                    </div>

                    {/* Deposit Slip Upload */}
                    <div className="doc-upload-card" style={{ marginTop: "20px" }}>
                      <div className="doc-info">
                        <strong>Deposit Slip / Payment Screenshot</strong>
                        <small>Bank deposit slip, fund transfer receipt, or online banking confirmation</small>
                      </div>
                      <label className="doc-file-btn">
                        <Upload size={16} />
                        <span>{files.payment_slip ? files.payment_slip.name : "Choose Receipt"}</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={(e) => handleFileChange("payment_slip", e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>

                    <div className="form-grid-2" style={{ marginTop: "16px" }}>
                      <label>
                        Transaction ID / Deposit Reference *
                        <input
                          type="text"
                          required
                          value={form.paymentReference}
                          onChange={(e) => set("paymentReference", e.target.value)}
                        />
                      </label>

                      <label>
                        Payment Date *
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
                        <strong>Declaration:</strong> I hereby certify that the information provided in this form is complete, true, and correct. I agree to abide by the rules and regulations of the Houseboat Owner&apos;s Association of Bangladesh (HOAB).
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
                      <span>Review Application Summary</span>
                    </div>

                    <div className="review-summary-box">
                      <div className="summary-section">
                        <h4>1. Houseboat & Category</h4>
                        <div className="summary-grid">
                          <div>Houseboat Name: <strong>{form.boatName}</strong></div>
                          <div>Category: <strong>{categoryFees[category].name}</strong></div>
                          <div>Trade License: <strong>{form.tradeLicenseNumber}</strong></div>
                          <div>DG Shipping Reg: <strong>{form.dgShippingNumber || "N/A"}</strong></div>
                          <div>Total Cabins: <strong>{form.totalCabins || "N/A"}</strong></div>
                          <div>Life Jackets / Buoys: <strong>{form.lifeJacketCount || 0} / {form.lifeBuoyCount || 0}</strong></div>
                        </div>
                      </div>

                      <div className="summary-section">
                        <h4>2. Owner Information</h4>
                        <div className="summary-grid">
                          <div>Owner Name: <strong>{form.ownerName}</strong></div>
                          <div>Phone: <strong>{form.ownerPhone}</strong></div>
                          <div>Email: <strong>{form.ownerEmail}</strong></div>
                          <div>NID / Passport: <strong>{form.ownerNid}</strong></div>
                          <div>Permanent Address: <strong>{form.permanentAddress}</strong></div>
                        </div>
                      </div>

                      <div className="summary-section">
                        <h4>3. Payment & Attachments</h4>
                        <div className="summary-grid">
                          <div>Registration Fee: <strong className="fee-highlight">BDT {categoryFees[category].fee.toLocaleString()}</strong></div>
                          <div>Transaction Reference: <strong>{form.paymentReference}</strong></div>
                          <div>Payment Date: <strong>{form.paymentDate}</strong></div>
                          <div>Documents: <strong>{Object.values(files).filter(Boolean).length} files attached</strong></div>
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
                    <ArrowLeft size={16} /> Previous Step
                  </button>
                )}

                <button
                  type="submit"
                  className="button button--gold"
                  disabled={submitting}
                  style={{ marginLeft: "auto" }}
                >
                  {submitting
                    ? "Submitting Application…"
                    : step === 3
                    ? "Complete Submission"
                    : "Next Step"}
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
