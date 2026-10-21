import { useState, useEffect, useRef } from "react";
import KaniBookingConfigurator from "./KaniBookingConfigurator.jsx";

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

      {/* BOOKING CONFIGURATOR — integrated from the standalone booking app */}
      <section id="booking" style={{ padding: "48px 0 80px", position: "relative", zIndex: 1 }}>
        <KaniBookingConfigurator />
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