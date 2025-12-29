import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import damBg from "../assets/images/dam-bg.jpg";
import Header from "../components/Header";
/* --- custom SVG icons --- */
const DamIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor"
       strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 18h52" />
    <path d="M10 18v30M54 18v30" />
    <path d="M18 48V30a6 6 0 0 1 12 0v18" />
    <path d="M26 48" />
    <path d="M34 48V30a6 6 0 0 1 12 0v18" />
    <path d="M10 48h44" />
  </svg>
);

const WavesIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor"
       strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 36c6-6 12 6 18 0s12 6 18 0 12 6 16 0" />
    <path d="M6 46c6-6 12 6 18 0s12 6 18 0 12 6 16 0" />
  </svg>
);

const ChartIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor"
       strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10 52h44" />
    <polyline points="12,44 26,30 36,36 50,24" />
    <circle cx="26" cy="30" r="2.5" fill="currentColor" stroke="none" />
    <circle cx="36" cy="36" r="2.5" fill="currentColor" stroke="none" />
    <circle cx="50" cy="24" r="2.5" fill="currentColor" stroke="none" />
  </svg>
);

const AlertIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor"
       strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 54h52L32 10 6 54z" />
    <path d="M32 26v14" />
    <circle cx="32" cy="46" r="2.5" fill="currentColor" stroke="none" />
  </svg>
);

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <Header />
      {/* Hero Section */}
      <section className="home-hero" style={{ backgroundImage: `url(${damBg})` }}>
        <div className="home-hero__overlay">
          <h1 className="home-title">AAPADAMITRA</h1>
          <h2>RIVER WATER MANAGEMENT AND LIFE SAFETY SYSTEM</h2>
          {/* Button links to Water Levels Page */}
          <button
            className="cta"
            onClick={() => navigate("/water-levels")}
          >
            VIEW DAMS
          </button>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="home-cards">
        <article className="card" onClick={() => navigate("/water-levels")}>
          <DamIcon className="icon teal" />
          <h3>Water Levels</h3>
          <p>Real-time data on reservoir and river levels</p>
        </article>

        <article className="card" onClick={() => navigate("/water-flow")}>
          <WavesIcon className="icon teal" />
          <h3>Flow</h3>
          <p>Flow rates of water through the dam structures</p>
        </article>

        <article className="card" onClick={() => navigate("/water-usage")}>
          <ChartIcon className="icon orange" />
          <h3>Water Usage</h3>
          <p>Information about water release &amp; consumption</p>
        </article>

        <article className="card" onClick={() => navigate("/alerts")}>
          <AlertIcon className="icon orange" />
          <h3>Alerts</h3>
          <p>Stay informed with warnings and notifications</p>
        </article>
      </section>
    </div>
  );
}
