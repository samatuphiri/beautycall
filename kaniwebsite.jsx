import { useState, useEffect, useRef } from "react";

const services = {
  individual: [
    "Deep Tissue", "Swedish", "Aromatherapy", "Manual Lymphatic Drainage",
    "Thai", "Hot/Cold Stone", "Pre/Post Natal", "Reflexology",
    "Geriatric", "Back, Neck & Shoulders", "Leg Work", "Sports Massage",
    "Royalty Massage", "Couples Massage"
  ],
  group: [
    "Family Wellness Experience", "Kids Massage", "Bridal Party Recovery",
    "Birthday Wellness Events", "Group Relaxation Sessions"
  ],
  corporate: [
    "Corporate Wellness Days", "Sports Event Recovery", "Ongoing Wellness Programs"
  ]
};

const durations = ["60 min", "90 min", "120 min"];
const addons = ["Facial Massage", "Head Massage", "Body Exfoliation", "Body Wrap + Exfoliation", "Foot Soak & Scrub"];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const TIMES = ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00", "19:30"];

function useFadeIn(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

function FadeSection({ children, className = "", delay = 0 }) {
  const [ref, visible] = useFadeIn();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.8s ease ${delay}s, transform 0.8s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function KaniLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [selectedService, setSelectedService] = useState(1);
  const [selectedDuration, setSelectedDuration] = useState(1);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedDate, setSelectedDate] = useState(18);
  const [selectedTime, setSelectedTime] = useState(4);
  const [calMonth, setCalMonth] = useState(4); // May = 4
  const [calYear, setCalYear] = useState(2026);
  const [address, setAddress] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleAddon = (i) =>
    setSelectedAddons((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const handleWhatsApp = () => {
    const svc = services.individual[selectedService];
    const dur = durations[selectedDuration];
    const addonList = selectedAddons.map((i) => addons[i]).join(", ") || "None";
    const msg = encodeURIComponent(
      `Hello Kani!\n\nI'd like to book a session:\n\nAddress: ${address || "[To be confirmed]"}\nCategory: ${["Individual & Couples", "Group & Events", "Corporate Wellness"][activeCategory]}\nService: ${svc}\nDuration: ${dur}\nAdd-ons: ${addonList}\nDate: ${selectedDate} May 2026 at ${TIMES[selectedTime]}\n\nThank you!`
    );
    window.open(`https://wa.me/27624771887?text=${msg}`, "_blank");
  };

  const daysInMonth = getDaysInMonth(calYear, calMonth);
  const firstDay = getFirstDay(calYear, calMonth);
  const monthName = new Date(calYear, calMonth).toLocaleString("default", { month: "long" });

  const categoryServices = activeCategory === 0 ? services.individual : activeCategory === 1 ? services.group : services.corporate;

  return (
    <div style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", background: "#0a1128", color: "#f5ebe8", minHeight: "100vh", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0a1128; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a1128; }
        ::-webkit-scrollbar-thumb { background: #d4a5a2; border-radius: 2px; }
        .sans { font-family: 'DM Sans', sans-serif; }
        .btn-primary {
          background: #d4a5a2;
          color: #0a1128;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 11px;
          transition: all 0.3s ease;
        }
        .btn-primary:hover { background: #e8c4c2; transform: translateY(-2px); box-shadow: 0 12px 40px rgba(212,165,162,0.3); }
        .btn-ghost {
          background: transparent;
          color: #f5ebe8;
          border: 1px solid rgba(245,235,232,0.2);
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: all 0.3s ease;
        }
        .btn-ghost:hover { border-color: rgba(245,235,232,0.5); background: rgba(245,235,232,0.05); }
        .card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          backdrop-filter: blur(20px);
        }
        .card-hover { transition: all 0.4s ease; cursor: pointer; }
        .card-hover:hover { background: rgba(255,255,255,0.07); border-color: rgba(212,165,162,0.3); transform: translateY(-4px); }
        .selected-card { border-color: #d4a5a2 !important; background: rgba(212,165,162,0.1) !important; }
        .tag { font-family: 'DM Sans', sans-serif; font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #d4a5a2; }
        .divider { border: none; border-top: 1px solid rgba(255,255,255,0.08); }
        input { background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); color: #f5ebe8; font-family: 'DM Sans', sans-serif; outline: none; transition: border-color 0.3s; }
        input:focus { border-color: #d4a5a2; }
        input::placeholder { color: rgba(245,235,232,0.35); }
        .noise { position: fixed; inset: 0; pointer-events: none; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E"); background-repeat: repeat; z-index: 9999; }
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .hero-grid { grid-template-columns: 1fr !important; }
          .booking-grid { grid-template-columns: 1fr !important; }
          .cat-grid { grid-template-columns: 1fr !important; }
          .svc-grid { grid-template-columns: 1fr 1fr !important; }
          .cal-time-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* Noise overlay */}
      <div className="noise" />

      {/* Background glows */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-20%", left: "-10%", width: 600, height: 600, background: "radial-gradient(circle, rgba(193,143,140,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "-10%", width: 500, height: 500, background: "radial-gradient(circle, rgba(237,194,192,0.08) 0%, transparent 70%)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 400, background: "radial-gradient(ellipse, rgba(10,17,40,0) 0%, rgba(10,17,40,0.8) 100%)" }} />
      </div>

      {/* NAV */}
      <nav style={{
        position: "fixed", top: 0, width: "100%", zIndex: 100,
        padding: "0 48px",
        height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        background: scrolled ? "rgba(10,17,40,0.85)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition: "all 0.5s ease",
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 300, letterSpacing: "0.4em" }}>KANI</div>
          <div className="tag" style={{ fontSize: 9, marginTop: 2 }}>Mobile Massage Therapy</div>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <a href="#services" className="sans hide-mobile" style={{ color: "rgba(245,235,232,0.5)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", transition: "color 0.3s" }}
            onMouseEnter={e => e.target.style.color = "#f5ebe8"} onMouseLeave={e => e.target.style.color = "rgba(245,235,232,0.5)"}>
            Services
          </a>
          <a href="#booking" className="sans hide-mobile" style={{ color: "rgba(245,235,232,0.5)", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", textDecoration: "none", transition: "color 0.3s", marginRight: 12 }}
            onMouseEnter={e => e.target.style.color = "#f5ebe8"} onMouseLeave={e => e.target.style.color = "rgba(245,235,232,0.5)"}>
            Book
          </a>
          <button className="btn-primary" style={{ padding: "10px 24px", borderRadius: 100 }}
            onClick={() => document.getElementById("booking").scrollIntoView({ behavior: "smooth" })}>
            Reserve
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: "100vh", display: "flex", alignItems: "center", padding: "120px 48px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }} className="hero-grid">
          <div>
            <FadeSection delay={0}>
              <div className="tag" style={{ marginBottom: 28 }}>Luxury Wellness · Cape Town</div>
              <h1 style={{ fontSize: "clamp(56px, 7vw, 96px)", fontWeight: 300, lineHeight: 0.9, letterSpacing: "-0.01em", marginBottom: 32 }}>
                Recovery.<br />
                <span style={{ fontStyle: "italic", color: "#d4a5a2" }}>Ritual.</span><br />
                Renewal.
              </h1>
            </FadeSection>
            <FadeSection delay={0.15}>
              <p className="sans" style={{ fontSize: 15, color: "rgba(245,235,232,0.6)", lineHeight: 1.8, maxWidth: 420, marginBottom: 40 }}>
                Kani transforms your home, hotel, or workspace into a private sanctuary. Premium mobile massage therapy — delivered to you throughout Cape Town.
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button className="btn-primary" style={{ padding: "14px 32px", borderRadius: 100 }}
                  onClick={() => document.getElementById("booking").scrollIntoView({ behavior: "smooth" })}>
                  Book Your Experience
                </button>
                <button className="btn-ghost" style={{ padding: "14px 32px", borderRadius: 100 }}
                  onClick={() => document.getElementById("services").scrollIntoView({ behavior: "smooth" })}>
                  Explore Services
                </button>
              </div>
            </FadeSection>
            <FadeSection delay={0.3}>
              <div style={{ marginTop: 56, display: "flex", gap: 48 }}>
                {[["14+", "Treatments"], ["3", "Categories"], ["Cape Town", "Coverage"]].map(([n, l]) => (
                  <div key={l}>
                    <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: "-0.02em" }}>{n}</div>
                    <div className="tag" style={{ marginTop: 4 }}>{l}</div>
                  </div>
                ))}
              </div>
            </FadeSection>
          </div>

          <FadeSection delay={0.1}>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", inset: -24, background: "radial-gradient(ellipse, rgba(212,165,162,0.2) 0%, transparent 70%)", borderRadius: "50%" }} />
              <div style={{ borderRadius: 40, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)", position: "relative" }}>
                <img
                  src="https://images.unsplash.com/photo-1519823551278-64ac92734fb1?q=80&w=1200&auto=format&fit=crop"
                  alt="Luxury massage"
                  style={{ width: "100%", height: 640, objectFit: "cover", display: "block", transition: "transform 0.8s ease" }}
                  onMouseEnter={e => e.target.style.transform = "scale(1.04)"}
                  onMouseLeave={e => e.target.style.transform = "scale(1)"}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,17,40,0.7) 0%, transparent 60%)" }} />
                <div style={{ position: "absolute", bottom: 28, left: 28, right: 28, borderRadius: 24, padding: "20px 24px", backdropFilter: "blur(20px)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div className="tag" style={{ marginBottom: 6 }}>Signature Experience</div>
                      <div style={{ fontSize: 18, fontWeight: 300 }}>Royalty Massage — 4 hands</div>
                    </div>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#d4a5a2", color: "#0a1128", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✦</div>
                  </div>
                </div>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ padding: "80px 48px 100px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <FadeSection>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div className="tag" style={{ marginBottom: 16 }}>Curated Experiences</div>
              <h2 style={{ fontSize: "clamp(36px, 4.5vw, 60px)", fontWeight: 300, marginBottom: 20 }}>Luxury Massage Services</h2>
              <p className="sans" style={{ color: "rgba(245,235,232,0.55)", maxWidth: 520, margin: "0 auto", lineHeight: 1.8, fontSize: 15 }}>
                Every session is designed around restoration, comfort, and elevated care — delivered directly to you in Cape Town.
              </p>
            </div>
          </FadeSection>

          {/* Category Tabs */}
          <FadeSection delay={0.1}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 48, flexWrap: "wrap" }}>
              {["Individual & Couples", "Group & Events", "Corporate Wellness"].map((cat, i) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(i)}
                  className="sans"
                  style={{
                    padding: "10px 24px", borderRadius: 100, fontSize: 12, letterSpacing: "0.1em",
                    textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s",
                    background: activeCategory === i ? "#d4a5a2" : "rgba(255,255,255,0.05)",
                    color: activeCategory === i ? "#0a1128" : "rgba(245,235,232,0.6)",
                    border: activeCategory === i ? "1px solid #d4a5a2" : "1px solid rgba(255,255,255,0.1)",
                    fontWeight: 500,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </FadeSection>

          {/* Service Grid */}
          <FadeSection delay={0.2}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }} className="svc-grid">
              {categoryServices.map((svc, i) => (
                <div
                  key={svc}
                  className="card card-hover"
                  style={{ borderRadius: 20, padding: "20px 20px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
                >
                  <span style={{ fontSize: 15, fontWeight: 300 }}>{svc}</span>
                  <span style={{ color: "#d4a5a2", marginLeft: 8 }}>+</span>
                </div>
              ))}
            </div>
          </FadeSection>

          {/* Durations + Addons */}
          <FadeSection delay={0.3}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 24 }} className="cat-grid">
              <div className="card" style={{ borderRadius: 24, padding: 28 }}>
                <div className="tag" style={{ marginBottom: 16 }}>Session Durations</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {["30 min", "45 min", "60 min", "90 min", "120 min"].map((d, i) => (
                    <span key={d} className="sans" style={{
                      padding: "8px 18px", borderRadius: 100, fontSize: 12,
                      background: d === "90 min" ? "#d4a5a2" : "rgba(255,255,255,0.07)",
                      color: d === "90 min" ? "#0a1128" : "rgba(245,235,232,0.7)",
                      border: d === "90 min" ? "none" : "1px solid rgba(255,255,255,0.1)",
                    }}>
                      {d}{d === "90 min" ? " ★" : ""}
                    </span>
                  ))}
                </div>
              </div>
              <div className="card" style={{ borderRadius: 24, padding: 28 }}>
                <div className="tag" style={{ marginBottom: 16 }}>Enhancement Add-ons</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {addons.map((a) => (
                    <span key={a} className="sans" style={{ padding: "8px 18px", borderRadius: 100, fontSize: 12, background: "rgba(255,255,255,0.07)", color: "rgba(245,235,232,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* BOOKING */}
      <section id="booking" style={{ padding: "80px 48px 120px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <FadeSection>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div className="tag" style={{ marginBottom: 16 }}>Reserve Your Session</div>
              <h2 style={{ fontSize: "clamp(36px, 4.5vw, 60px)", fontWeight: 300 }}>Book Your Experience</h2>
            </div>
          </FadeSection>

          <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }} className="booking-grid">
            {/* Steps sidebar */}
            <FadeSection>
              <div className="card" style={{ borderRadius: 28, padding: 28, position: "sticky", top: 88 }}>
                {["Location", "Category", "Treatment", "Date & Time"].map((step, i) => (
                  <div key={step} style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: i < 3 ? 28 : 0 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: i === 0 ? "#d4a5a2" : "rgba(255,255,255,0.06)",
                      color: i === 0 ? "#0a1128" : "rgba(245,235,232,0.5)",
                      fontSize: 13, fontFamily: "'DM Sans', sans-serif",
                    }}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="tag" style={{ fontSize: 9, marginBottom: 3 }}>Step {i + 1}</div>
                      <div style={{ fontSize: 14, fontWeight: 300 }}>{step}</div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeSection>

            {/* Main booking card */}
            <FadeSection delay={0.1}>
              <div className="card" style={{ borderRadius: 36, padding: "48px 48px" }}>

                {/* Step 1 */}
                <div style={{ marginBottom: 56 }}>
                  <div className="tag" style={{ marginBottom: 8 }}>Step 01</div>
                  <h3 style={{ fontSize: 28, fontWeight: 300, marginBottom: 24 }}>Where should we come to you?</h3>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      placeholder="Enter your address or hotel location"
                      style={{ flex: 1, minWidth: 240, padding: "14px 20px", borderRadius: 16, fontSize: 14 }}
                    />
                    <button className="btn-primary" style={{ padding: "14px 24px", borderRadius: 16 }}>Check Area</button>
                  </div>
                  <div className="sans" style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", borderRadius: 100, padding: "8px 16px", fontSize: 12, color: "rgba(245,235,232,0.7)" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                    Cape Town — full coverage available
                  </div>
                </div>

                <hr className="divider" style={{ marginBottom: 56 }} />

                {/* Step 2 */}
                <div style={{ marginBottom: 56 }}>
                  <div className="tag" style={{ marginBottom: 8 }}>Step 02</div>
                  <h3 style={{ fontSize: 28, fontWeight: 300, marginBottom: 28 }}>Choose your experience category</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }} className="cat-grid">
                    {[
                      { label: "Individual & Couples", desc: "Personal recovery and intimate wellness.", num: "01" },
                      { label: "Group & Events", desc: "Celebrations and collective restoration.", num: "02" },
                      { label: "Corporate Wellness", desc: "Team activations and ongoing programs.", num: "03" },
                    ].map((cat, i) => (
                      <div
                        key={cat.label}
                        className={`card card-hover ${activeCategory === i ? "selected-card" : ""}`}
                        style={{ borderRadius: 24, padding: 24, cursor: "pointer" }}
                        onClick={() => { setActiveCategory(i); setSelectedService(0); }}
                      >
                        <div style={{ fontSize: 36, fontWeight: 300, marginBottom: 16, opacity: 0.4 }}>{cat.num}</div>
                        <div style={{ fontSize: 16, marginBottom: 8 }}>{cat.label}</div>
                        <div className="sans" style={{ fontSize: 12, color: "rgba(245,235,232,0.5)", lineHeight: 1.6 }}>{cat.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <hr className="divider" style={{ marginBottom: 56 }} />

                {/* Step 3 */}
                <div style={{ marginBottom: 56 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div className="tag" style={{ marginBottom: 8 }}>Step 03</div>
                      <h3 style={{ fontSize: 28, fontWeight: 300 }}>Select your treatment</h3>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {durations.map((d, i) => (
                        <button key={d} onClick={() => setSelectedDuration(i)} className="sans" style={{
                          padding: "8px 18px", borderRadius: 100, fontSize: 11, letterSpacing: "0.1em",
                          textTransform: "uppercase", cursor: "pointer", transition: "all 0.3s",
                          background: selectedDuration === i ? "#d4a5a2" : "rgba(255,255,255,0.06)",
                          color: selectedDuration === i ? "#0a1128" : "rgba(245,235,232,0.6)",
                          border: selectedDuration === i ? "none" : "1px solid rgba(255,255,255,0.1)",
                          fontWeight: 500,
                        }}>
                          {d}{i === 1 ? " ★" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10 }}>
                    {categoryServices.map((svc, i) => (
                      <div
                        key={svc}
                        className={`card card-hover ${selectedService === i ? "selected-card" : ""}`}
                        style={{ borderRadius: 18, padding: "16px 18px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                        onClick={() => setSelectedService(i)}
                      >
                        <span style={{ fontSize: 14 }}>{svc}</span>
                        {selectedService === i && <span style={{ color: "#d4a5a2", fontSize: 16 }}>✓</span>}
                      </div>
                    ))}
                  </div>

                  {/* Addons */}
                  <div className="card" style={{ borderRadius: 24, padding: 24, marginTop: 20 }}>
                    <div className="tag" style={{ marginBottom: 16 }}>Optional Enhancements <span style={{ color: "rgba(245,235,232,0.4)", textTransform: "none", letterSpacing: 0, fontFamily: "'DM Sans', sans-serif" }}>— 30 or 45 min add-ons</span></div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {addons.map((a, i) => (
                        <button key={a} onClick={() => toggleAddon(i)} className="sans" style={{
                          padding: "9px 18px", borderRadius: 100, fontSize: 12, cursor: "pointer", transition: "all 0.3s",
                          background: selectedAddons.includes(i) ? "rgba(212,165,162,0.15)" : "rgba(255,255,255,0.05)",
                          color: selectedAddons.includes(i) ? "#d4a5a2" : "rgba(245,235,232,0.6)",
                          border: selectedAddons.includes(i) ? "1px solid rgba(212,165,162,0.4)" : "1px solid rgba(255,255,255,0.1)",
                          fontWeight: 400,
                        }}>
                          {selectedAddons.includes(i) ? "✓ " : ""}{a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <hr className="divider" style={{ marginBottom: 56 }} />

                {/* Step 4 */}
                <div>
                  <div className="tag" style={{ marginBottom: 8 }}>Step 04</div>
                  <h3 style={{ fontSize: 28, fontWeight: 300, marginBottom: 28 }}>Choose your preferred time</h3>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="cal-time-grid">
                    {/* Calendar */}
                    <div className="card" style={{ borderRadius: 24, padding: 24 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                        <div style={{ fontSize: 16 }}>{monthName} {calYear}</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          {["←", "→"].map((arrow, i) => (
                            <button key={arrow} onClick={() => {
                              let m = calMonth + (i === 0 ? -1 : 1);
                              let y = calYear;
                              if (m < 0) { m = 11; y--; }
                              if (m > 11) { m = 0; y++; }
                              setCalMonth(m); setCalYear(y); setSelectedDate(1);
                            }} style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", color: "#f5ebe8", cursor: "pointer", fontSize: 13 }}>
                              {arrow}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center", marginBottom: 8 }}>
                        {DAYS.map(d => <div key={d} className="sans" style={{ fontSize: 11, color: "rgba(245,235,232,0.35)", padding: "4px 0" }}>{d}</div>)}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
                        {Array(firstDay).fill(null).map((_, i) => <div key={"e" + i} />)}
                        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                          <button key={d} onClick={() => setSelectedDate(d)} className="sans" style={{
                            aspectRatio: "1", borderRadius: 10, fontSize: 12, cursor: "pointer", transition: "all 0.2s",
                            background: selectedDate === d ? "#d4a5a2" : "rgba(255,255,255,0.04)",
                            color: selectedDate === d ? "#0a1128" : "rgba(245,235,232,0.7)",
                            border: selectedDate === d ? "none" : "1px solid rgba(255,255,255,0.06)",
                            fontWeight: selectedDate === d ? 500 : 400,
                          }}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Time slots */}
                    <div className="card" style={{ borderRadius: 24, padding: 24 }}>
                      <div style={{ fontSize: 14, marginBottom: 16, opacity: 0.6 }} className="sans">Available Times</div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
                        {TIMES.map((t, i) => (
                          <button key={t} onClick={() => setSelectedTime(i)} className="sans" style={{
                            padding: "13px", borderRadius: 14, fontSize: 13, cursor: "pointer", transition: "all 0.2s",
                            background: selectedTime === i ? "#d4a5a2" : "rgba(255,255,255,0.05)",
                            color: selectedTime === i ? "#0a1128" : "rgba(245,235,232,0.7)",
                            border: selectedTime === i ? "none" : "1px solid rgba(255,255,255,0.08)",
                            fontWeight: selectedTime === i ? 500 : 400,
                          }}>
                            {t}
                          </button>
                        ))}
                      </div>
                      {/* Summary */}
                      <div style={{ borderRadius: 18, padding: 20, background: "rgba(212,165,162,0.1)", border: "1px solid rgba(212,165,162,0.2)" }}>
                        <div className="tag" style={{ marginBottom: 8 }}>Your Selection</div>
                        <div style={{ fontSize: 17, marginBottom: 4 }}>{categoryServices[selectedService]} — {durations[selectedDuration]}</div>
                        <div className="sans" style={{ fontSize: 12, color: "rgba(245,235,232,0.55)" }}>
                          {selectedDate} {monthName} {calYear} at {TIMES[selectedTime]}
                        </div>
                        {selectedAddons.length > 0 && (
                          <div className="sans" style={{ fontSize: 11, color: "#d4a5a2", marginTop: 6 }}>
                            + {selectedAddons.map(i => addons[i]).join(", ")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleWhatsApp}
                    className="btn-primary"
                    style={{ width: "100%", padding: "20px", borderRadius: 20, marginTop: 20, fontSize: 13, letterSpacing: "0.2em", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    Continue to WhatsApp Booking
                  </button>
                </div>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: "60px 48px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 32 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 300, letterSpacing: "0.4em", marginBottom: 8 }}>KANI</div>
            <p className="sans" style={{ color: "rgba(245,235,232,0.45)", fontSize: 13, maxWidth: 360, lineHeight: 1.7 }}>
              Luxury mobile massage therapy for recovery, calm, and elevated wellness — throughout Cape Town.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
            <button className="btn-primary" style={{ padding: "12px 28px", borderRadius: 100 }}
              onClick={() => document.getElementById("booking").scrollIntoView({ behavior: "smooth" })}>
              Book Your Experience
            </button>
            <div className="sans" style={{ color: "rgba(245,235,232,0.4)", fontSize: 12 }}>WhatsApp: +27 62 477 1887</div>
          </div>
        </div>
      </footer>
    </div>
  );
}