import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ExternalLink, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = {
  name: "",
  type: "restaurant",
  city: "",
  googlePlaceId: "",
  googleReviewUrl: "",
  personality: { special: "" },
  customers: { typical: [], mainReason: "", desiredFeeling: "" },
  love: { compliments: ["friendly staff"], staffNames: [], signatures: "" },
  brandVoice: { tone: "warm", language: "English" },
  branding: { logoDataUrl: "", primaryColor: "#2563eb" },
};

const steps = ["Basic Info", "Personality", "Customers", "What They Love", "Brand Voice", "Review Link", "Branding", "AI Preview"];
const customerOptions = ["families", "young professionals", "students", "elderly", "tourists", "locals", "corporate clients"];
const tones = [
  ["warm", "Warm and personal", "Feels like a friend recommending"],
  ["professional", "Professional and credible", "Formal, trustworthy, and clear"],
  ["casual", "Casual and fun", "Relaxed and conversational"],
  ["enthusiastic", "Enthusiastic and energetic", "Excited with positive energy"],
];

export default function Onboarding({ editMode = false }) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [prompt, setPrompt] = useState("");
  const [sampleReview, setSampleReview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (editMode && profile?.business) {
      const b = profile.business;
      setForm({
        name: b.name || "",
        type: b.type || "restaurant",
        city: b.city || "",
        googlePlaceId: b.googlePlaceId || "",
        googleReviewUrl: b.googleReviewUrl || "",
        personality: b.personality || { special: "" },
        customers: b.customers || { typical: [], mainReason: "", desiredFeeling: "" },
        love: b.love || { compliments: [], staffNames: [], signatures: "" },
        brandVoice: b.brandVoice || { tone: "warm", language: "English" },
        branding: b.branding || { logoDataUrl: "", primaryColor: "#2563eb" },
      });
    }
  }, [editMode, profile]);

  useEffect(() => {
    if (step !== 7) return;
    const timer = setTimeout(async () => {
      try {
        const data = await api("/api/business/prompt-preview", { method: "POST", body: JSON.stringify(form) });
        setPrompt(data.systemPrompt);
        setSampleReview(data.sampleReview);
      } catch (err) {
        setError(err.message);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [step, form]);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function update(path, value) {
    setForm((current) => {
      const next = structuredClone(current);
      const keys = path.split(".");
      let target = next;
      keys.slice(0, -1).forEach((key) => { target = target[key]; });
      target[keys.at(-1)] = value;
      return next;
    });
  }

  function addList(path, value) {
    const cleaned = value.trim();
    if (!cleaned) return;
    update(path, [...path.split(".").reduce((obj, key) => obj[key], form), cleaned]);
  }

  function removeList(path, item) {
    update(path, path.split(".").reduce((obj, key) => obj[key], form).filter((entry) => entry !== item));
  }

  async function handleLogo(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("branding.logoDataUrl", reader.result);
    reader.readAsDataURL(file);
  }

  async function submit() {
    setSaving(true);
    setError("");
    try {
      await api("/api/business/onboarding", {
        method: "POST",
        body: JSON.stringify({ ...form, customSystemPrompt: prompt })
      });
      await refreshProfile();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="wizard-page">
      <div className="wizard-header">
        <div>
          <p className="eyebrow">{editMode ? "Business settings" : "Onboarding wizard"}</p>
          <h1>{steps[step]}</h1>
        </div>
        <div className="step-counter">{step + 1} / {steps.length}</div>
      </div>
      <div className="progress"><span style={{ width: `${progress}%` }} /></div>
      <div className="wizard-card">
        {step === 0 && <BasicInfo form={form} update={update} />}
        {step === 1 && <Field label="What makes your business special?" as="textarea" value={form.personality.special} onChange={(v) => update("personality.special", v)} />}
        {step === 2 && <Customers form={form} update={update} />}
        {step === 3 && <Love form={form} addList={addList} removeList={removeList} update={update} />}
        {step === 4 && <Voice form={form} update={update} />}
        {step === 5 && <ReviewConfirm form={form} update={update} />}
        {step === 6 && <Branding form={form} update={update} handleLogo={handleLogo} />}
        {step === 7 && <Preview prompt={prompt} setPrompt={setPrompt} sampleReview={sampleReview} />}
        {error && <p className="error">{error}</p>}
      </div>
      <div className="wizard-actions">
        <button className="secondary-button" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}><ArrowLeft size={18} /> Back</button>
        {step < 7 ? (
          <button className="primary-button" onClick={() => setStep(step + 1)}>Next <ArrowRight size={18} /></button>
        ) : (
          <button className="primary-button" onClick={submit} disabled={saving}><Check size={18} /> {saving ? "Saving..." : "Finish setup"}</button>
        )}
      </div>
    </section>
  );
}

function Field({ label, value, onChange, as, ...props }) {
  const Tag = as === "textarea" ? "textarea" : "input";
  return <label className="field">{label}<Tag value={value} onChange={(e) => onChange(e.target.value)} {...props} /></label>;
}

function BasicInfo({ form, update }) {
  return (
    <div className="grid-two">
      <Field label="Business name" value={form.name} onChange={(v) => update("name", v)} />
      <label className="field">Business type<select value={form.type} onChange={(e) => update("type", e.target.value)}>
        {["restaurant", "clinic", "salon", "hotel", "shop", "cafe", "gym", "other"].map((item) => <option key={item}>{item}</option>)}
      </select></label>
      <Field label="City" value={form.city} onChange={(v) => update("city", v)} />
      <Field label="Google Place ID" value={form.googlePlaceId} onChange={(v) => update("googlePlaceId", v)} />
      <a className="helper-link" href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noreferrer"><ExternalLink size={16} /> How to find your Place ID</a>
      <Field label="Google Review direct URL" type="url" value={form.googleReviewUrl} onChange={(v) => update("googleReviewUrl", v)} />
    </div>
  );
}

function Customers({ form, update }) {
  function toggle(item) {
    const set = new Set(form.customers.typical);
    set.has(item) ? set.delete(item) : set.add(item);
    update("customers.typical", [...set]);
  }
  return (
    <div className="stack">
      <p className="label-text">Typical customers</p>
      <div className="chip-grid">{customerOptions.map((item) => <button key={item} className={`chip ${form.customers.typical.includes(item) ? "active" : ""}`} onClick={() => toggle(item)}>{item}</button>)}</div>
      <Field label="Main reason customers come to you" value={form.customers.mainReason} onChange={(v) => update("customers.mainReason", v)} />
      <Field label="Feeling customers should leave with" value={form.customers.desiredFeeling} onChange={(v) => update("customers.desiredFeeling", v)} />
    </div>
  );
}

function Love({ form, addList, removeList, update }) {
  const [compliment, setCompliment] = useState("");
  const [staff, setStaff] = useState("");
  return (
    <div className="stack">
      <ListEditor label="Common compliments" items={form.love.compliments} value={compliment} setValue={setCompliment} add={() => { addList("love.compliments", compliment); setCompliment(""); }} remove={(item) => removeList("love.compliments", item)} placeholder="friendly staff, fast service..." />
      <ListEditor label="Loved staff members" items={form.love.staffNames} value={staff} setValue={setStaff} add={() => { addList("love.staffNames", staff); setStaff(""); }} remove={(item) => removeList("love.staffNames", item)} placeholder="Aisha, Rahul..." />
      <Field label="Signature products, dishes, or services" value={form.love.signatures} onChange={(v) => update("love.signatures", v)} />
    </div>
  );
}

function ListEditor({ label, items, value, setValue, add, remove, placeholder }) {
  return (
    <div>
      <p className="label-text">{label}</p>
      <div className="inline-input"><input value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} /><button className="secondary-button" onClick={add}>Add</button></div>
      <div className="chip-grid">{items.map((item) => <button className="chip active" key={item} onClick={() => remove(item)}>{item} ×</button>)}</div>
    </div>
  );
}

function Voice({ form, update }) {
  return (
    <div className="stack">
      <div className="tone-grid">{tones.map(([id, title, desc]) => <button key={id} className={`tone ${form.brandVoice.tone === id ? "active" : ""}`} onClick={() => update("brandVoice.tone", id)}><strong>{title}</strong><span>{desc}</span></button>)}</div>
      <label className="field">Preferred review language<select value={form.brandVoice.language} onChange={(e) => update("brandVoice.language", e.target.value)}>
        {["English", "Hindi", "Hinglish", "Both English and Hindi mixed"].map((item) => <option key={item}>{item}</option>)}
      </select></label>
    </div>
  );
}

function ReviewConfirm({ form, update }) {
  return (
    <div className="stack">
      <p className="muted">Place ID: <strong>{form.googlePlaceId || "Not entered yet"}</strong></p>
      <a className="review-preview-link" href={form.googleReviewUrl || "#"} target="_blank" rel="noreferrer">{form.googleReviewUrl || "Add your Google review URL"}</a>
      <Field label="Correct review URL if needed" type="url" value={form.googleReviewUrl} onChange={(v) => update("googleReviewUrl", v)} />
    </div>
  );
}

function Branding({ form, update, handleLogo }) {
  return (
    <div className="grid-two">
      <label className="upload-box"><Upload size={24} /> Upload logo<input hidden type="file" accept="image/*" onChange={(e) => handleLogo(e.target.files?.[0])} /></label>
      {form.branding.logoDataUrl && <img className="logo-preview" src={form.branding.logoDataUrl} alt="Uploaded logo" />}
      <label className="field">Primary brand color<input type="color" value={form.branding.primaryColor} onChange={(e) => update("branding.primaryColor", e.target.value)} /></label>
    </div>
  );
}

function Preview({ prompt, setPrompt, sampleReview }) {
  return (
    <div className="stack">
      <label className="field">Generated system prompt<textarea value={prompt || "Generating prompt..."} onChange={(e) => setPrompt(e.target.value)} rows={14} /></label>
      <div className="sample-review"><p className="label-text">Sample 5-star review</p><p>{sampleReview || "Generating sample..."}</p></div>
    </div>
  );
}
