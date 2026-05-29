import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const CSS_HREF = "css/pmb-enterprise-architecture.css";

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Site contact phone — keep display and tel: in sync across generated pages
const PHONE_DISPLAY = "(917) 499-4911";
const PHONE_TEL_HREF = "tel:+19174994911";
const PHONE_FAB = `<a href="${PHONE_TEL_HREF}" class="mobile-call-fab" aria-label="Call PMB-Solutions at ${PHONE_DISPLAY}"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></a>`;

const REVEAL_JS = `<script>
const nav=document.getElementById('navbar');
addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>60));
document.querySelectorAll('.reveal').forEach(el=>{
  const io=new IntersectionObserver((ents)=>{ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:0.12});
  io.observe(el);
});
</script>`;

const HEAD_COMMON = (title) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="icon" href="favicon.ico" sizes="48x48 32x32 16x16" type="image/x-icon"/>
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png"/>
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png"/>
<link rel="icon" type="image/svg+xml" href="favicon.svg" sizes="any"/>
<link rel="icon" type="image/svg+xml" href="favicon-dark.svg" sizes="any" media="(prefers-color-scheme: dark)"/>
<link rel="apple-touch-icon" href="apple-touch-icon.png" sizes="180x180"/>
<link rel="manifest" href="site.webmanifest"/>
<meta name="theme-color" content="#00b4ff"/>
<title>${title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${CSS_HREF}"/>`;

const NAV = `<nav id="navbar">
  <a href="index.html" class="nav-logo">
    <img class="nav-logo-img" src="pmb_solutions_logo.svg" alt="PMB-Solutions" width="260" height="97" decoding="async"/>
  </a>
  <ul class="nav-links">
    <li class="nav-dropdown-wrap">
      <a href="index.html#services-overview" class="nav-dropdown-trigger">Services</a>
      <ul class="nav-dropdown-menu" role="menu" aria-label="Service categories">
        <li role="none"><a role="menuitem" href="category-it-support-technical-services.html">IT Support &amp; Technical Services</a></li>
        <li role="none"><a role="menuitem" href="category-website-design-digital-presence.html">Website Design &amp; Digital Presence</a></li>
        <li role="none"><a role="menuitem" href="category-branding-graphic-design.html">Branding &amp; Graphic Design</a></li>
        <li role="none"><a role="menuitem" href="category-social-media-content-management.html">Social Media &amp; Content Management</a></li>
        <li role="none"><a role="menuitem" href="category-business-setup-digital-infrastructure.html">Business Setup &amp; Digital Infrastructure</a></li>
        <li role="none"><a role="menuitem" href="category-premium-bundles-packages.html">Premium Bundles &amp; Packages</a></li>
        <li class="nav-dropdown-sep" role="presentation" aria-hidden="true"></li>
      </ul>
    </li>
    <li><a href="index.html#why">Why Us</a></li>
    <li><a href="index.html#about">About</a></li>
    <li><a href="index.html#faq">FAQ</a></li>
    <li><a href="index.html#contact">Contact</a></li>
  </ul>
</nav>`;

/** @param {{n:number;layers:string}} p */
function pageBgCss(p) {
  const a = `pmbBg${p.n}A`;
  const b = `pmbBg${p.n}B`;
  return `<style>
.pmb-bg--${p.n} .svc-page-bg__layer--a{${p.layers.split("||")[0]}}
.pmb-bg--${p.n} .svc-page-bg__layer--b{${p.layers.split("||")[1]}}
@keyframes ${a}{${p.layers.split("||")[2]}}
@keyframes ${b}{${p.layers.split("||")[3]}}
.pmb-bg--${p.n} .svc-page-bg__layer--a{animation:${a} 28s ease-in-out infinite}
.pmb-bg--${p.n} .svc-page-bg__layer--b{animation:${b} 22s ease-in-out infinite}
</style>`;
}

const BG_PRESETS = [
  `background:radial-gradient(circle at 25% 35%,rgba(0,180,255,.12),transparent 45%),repeating-linear-gradient(-12deg,transparent 0 64px,rgba(0,229,200,.03) 64px 65px);||background:radial-gradient(ellipse 80% 50% at 70% 70%,rgba(0,229,200,.08),transparent 55%);mix-blend-mode:screen;opacity:.32;||0%,100%{transform:translate3d(0,0,0)}50%{transform:translate3d(2%,-2%,0)}||0%,100%{transform:translate(0,0)}50%{transform:translate(-3%,2%)}`,
  `background:linear-gradient(90deg,rgba(0,180,255,.05) 0%,transparent 40%),repeating-linear-gradient(0deg,transparent 0 22px,rgba(255,255,255,.02) 22px 23px);||background:conic-gradient(from 90deg at 60% 40%,rgba(0,229,200,.07),transparent 50%);mix-blend-mode:overlay;opacity:.34;||0%,100%{transform:translate3d(0,0,0) rotate(0)}50%{transform:translate3d(-1.5%,2%,0) rotate(2deg)}||0%,100%{opacity:.28}50%{opacity:.48}`,
  `background:radial-gradient(circle at 75% 25%,rgba(0,229,200,.11),transparent 42%),linear-gradient(165deg,rgba(0,180,255,.04),transparent 50%);||background:repeating-linear-gradient(45deg,transparent 0 40px,rgba(0,180,255,.025) 40px 41px);opacity:.3;||0%,100%{transform:scale(1)}50%{transform:scale(1.04) translate(1%,1%)}||0%,100%{transform:rotate(0)}50%{transform:rotate(-3deg)}`,
  `background:radial-gradient(ellipse 100% 60% at 50% -5%,rgba(0,180,255,.1),transparent 55%),linear-gradient(180deg,transparent 60%,rgba(0,229,200,.05));||background:repeating-radial-gradient(circle at 50% 50%,transparent 0 36px,rgba(0,180,255,.03) 36px 37px);opacity:.28;||0%,100%{transform:translateY(0)}50%{transform:translateY(-2%)}||0%,100%{transform:translateX(0)}50%{transform:translateX(40px)}`,
];

function pickBg(i) {
  const n = (i % BG_PRESETS.length) + 1;
  return { n, layers: BG_PRESETS[i % BG_PRESETS.length] };
}

function formatH1(title) {
  const w = String(title).trim().split(/\s+/);
  if (w.length <= 1) return `<em>${title}</em>`;
  const mid = Math.ceil(w.length / 2);
  return `${w.slice(0, mid).join(" ")} <em>${w.slice(mid).join(" ")}</em>`;
}

function servicePage(i, title, bookingSlug, lead, included, who, problems, ctaTitle, ctaLead) {
  const bg = pickBg(i);
  const book = `https://booking-placeholder.com/${bookingSlug}`;
  const h1Safe = formatH1(title);

  const li = (arr) => arr.map((t) => `          <li>${t}</li>`).join("\n");
  return (
    HEAD_COMMON(`${title} — PMB-Solutions`) +
    pageBgCss(bg) +
    `</head>
<body>
<div class="svc-page-bg pmb-bg--${bg.n}" aria-hidden="true"><div class="svc-page-bg__layer svc-page-bg__layer--a"></div><div class="svc-page-bg__layer svc-page-bg__layer--b"></div></div>
${NAV}
<header class="svc-hero"><div class="svc-hero-inner section-inner--narrow">
  <p class="section-tag">Service</p>
  <h1>${h1Safe}</h1>
  <p class="svc-hero-lead">${lead}</p>
  <div class="svc-hero-btns">
    <a class="btn-primary" href="${book}" target="_blank" rel="noopener noreferrer">Book Now</a>
    <a class="btn-ghost" href="index.html#services-overview">All categories</a>
  </div>
</div></header>
<main id="svc-detail">
  <section class="section"><div class="section-inner section-inner--narrow">
    <p class="section-tag reveal">Deliverables</p>
    <h2 class="section-title reveal">What&apos;s <em>included</em></h2>
    <div class="detail-panel reveal"><ul class="detail-list">\n${li(included)}\n    </ul></div>
  </div></section>
  <section class="section"><div class="section-inner section-inner--narrow">
    <p class="section-tag reveal">Audience</p>
    <h2 class="section-title reveal">Who this is <em>for</em></h2>
    <div class="detail-panel reveal"><ul class="detail-list">\n${li(who)}\n    </ul></div>
  </div></section>
  <section class="section"><div class="section-inner section-inner--narrow">
    <p class="section-tag reveal">Outcomes</p>
    <h2 class="section-title reveal">Common problems <em>solved</em></h2>
    <div class="detail-panel reveal"><ul class="detail-list">\n${li(problems)}\n    </ul></div>
  </div></section>
  <section class="section"><div class="section-inner section-inner--narrow">
    <p class="section-tag reveal">Pricing</p>
    <h2 class="section-title reveal">Investment <em>placeholder</em></h2>
    <div class="detail-panel reveal"><p>Scope and pricing are confirmed before work begins. Replace the Book Now URL with your live booking link when ready.</p></div>
  </div></section>
</main>
<section class="cta-final" aria-labelledby="cta1"><div class="cta-final-inner reveal">
  <h2 id="cta1">${ctaTitle}</h2>
  <p>${ctaLead}</p>
  <a class="btn-primary" href="${book}" target="_blank" rel="noopener noreferrer">Book Now</a>
</div></section>
${REVEAL_JS}
${PHONE_FAB}
</body></html>`
  );
}

function defaultServiceContent(title) {
  return {
    lead: `${title} from PMB-Solutions keeps your technology aligned with how you work—clear scope, practical execution, and documentation you can reuse.`,
    included: [
      `Discovery and success criteria tailored to ${title.toLowerCase()}`,
      "Implementation or configuration with rollback-friendly sequencing",
      "Verification checklist and handoff notes for your team",
      "Follow-up window for small adjustments after go-live",
    ],
    who: [
      "Small businesses that want enterprise discipline without enterprise overhead",
      "Owners coordinating vendors, staff, and customer-facing channels",
      "Teams that value calm communication and predictable timelines",
    ],
    problems: [
      "Tooling that works on demo day but drifts under real weekly load",
      "Vendors pointing at each other when DNS, email, or SSL misalign",
      "No single owner for updates, renewals, or access reviews",
      "Documentation living in chat threads instead of one source of truth",
    ],
    ctaTitle: "Move forward with confidence",
    ctaLead: "Book a session—we will confirm outcomes, risks, and the next best step.",
  };
}

function bundlePage(i, title, slug, included, perfectFor, valueBreakdown, whySave) {
  const bg = pickBg(i + 10);
  const book = `https://booking-placeholder.com/${slug}`;
  const parts = title.split(" ");
  const emWord = parts.pop();
  const h1 = `${parts.join(" ")} <em>${emWord}</em>`;
  const li = (arr) => arr.map((t) => `          <li>${t}</li>`).join("\n");
  return (
    HEAD_COMMON(`${title} — PMB-Solutions`) +
    pageBgCss(bg) +
    `</head>
<body>
<div class="svc-page-bg pmb-bg--${bg.n}" aria-hidden="true"><div class="svc-page-bg__layer svc-page-bg__layer--a"></div><div class="svc-page-bg__layer svc-page-bg__layer--b"></div></div>
${NAV}
<header class="svc-hero"><div class="svc-hero-inner section-inner--narrow">
  <p class="section-tag">Bundle</p>
  <h1>${h1}</h1>
  <p class="svc-hero-lead">A curated package that bundles the highest-leverage work—so you launch or grow with fewer decisions, fewer invoices, and clearer outcomes.</p>
  <div class="svc-hero-btns">
    <a class="btn-primary" href="${book}" target="_blank" rel="noopener noreferrer">Book Now</a>
    <a class="btn-ghost" href="category-premium-bundles-packages.html">All bundles</a>
  </div>
</div></header>
<main id="svc-detail">
  <section class="section"><div class="section-inner section-inner--narrow">
    <p class="section-tag reveal">Deliverables</p>
    <h2 class="section-title reveal">What&apos;s <em>included</em></h2>
    <div class="detail-panel reveal"><ul class="detail-list">\n${li(included)}\n    </ul></div>
  </div></section>
  <section class="section"><div class="section-inner section-inner--narrow">
    <p class="section-tag reveal">Fit</p>
    <h2 class="section-title reveal">Perfect <em>for</em></h2>
    <div class="detail-panel reveal"><ul class="detail-list">\n${li(perfectFor)}\n    </ul></div>
  </div></section>
  <section class="section"><div class="section-inner section-inner--narrow">
    <p class="section-tag reveal">Value</p>
    <h2 class="section-title reveal">Value <em>breakdown</em></h2>
    <div class="detail-panel reveal"><ul class="detail-list">\n${li(valueBreakdown)}\n    </ul></div>
  </div></section>
  <section class="section"><div class="section-inner section-inner--narrow">
    <p class="section-tag reveal">Economics</p>
    <h2 class="section-title reveal">Why this bundle <em>saves money</em></h2>
    <div class="detail-panel reveal"><ul class="detail-list">\n${li(whySave)}\n    </ul></div>
  </div></section>
</main>
<section class="cta-final"><div class="cta-final-inner reveal">
  <h2>Ready to consolidate your spend?</h2>
  <p>Book now—we will validate prerequisites and schedule the bundle in sensible phases.</p>
  <a class="btn-primary" href="${book}" target="_blank" rel="noopener noreferrer">Book Now</a>
</div></section>
${REVEAL_JS}
${PHONE_FAB}
</body></html>`
  );
}

function categoryPage(cat, idx) {
  const bg = pickBg(idx + 20);
  const cards = cat.services
    .map(
      (s, j) => `
      <a href="${s.file}" class="svc-card reveal" aria-labelledby="cs-${idx}-${j}">
        <div class="svc-icon-wrap" aria-hidden="true">${s.iconSvg}</div>
        <h3 id="cs-${idx}-${j}">${s.title}</h3>
        <p>${s.desc}</p>
        <span class="svc-link">Learn more →</span>
      </a>`
    )
    .join("");
  return (
    HEAD_COMMON(`${cat.title} — PMB-Solutions`) +
    pageBgCss(bg) +
    `</head>
<body>
<div class="svc-page-bg pmb-bg--${bg.n}" aria-hidden="true"><div class="svc-page-bg__layer svc-page-bg__layer--a"></div><div class="svc-page-bg__layer svc-page-bg__layer--b"></div></div>
${NAV}
<header class="svc-hero"><div class="svc-hero-inner section-inner--narrow">
  <p class="section-tag">Category</p>
  <h1>${cat.h1}</h1>
  <p class="svc-hero-lead">${cat.lead}</p>
  <div class="svc-hero-btns">
    <a class="btn-ghost" href="index.html#services-overview">Back to overview</a>
    <a class="btn-ghost" href="index.html#services">Full catalog</a>
  </div>
</div></header>
<main id="category-body">
  <section class="section"><div class="section-inner">
    <p class="section-tag reveal">Catalog</p>
    <h2 class="section-title reveal">Services in this <em>category</em></h2>
    <div id="category-services" class="services-grid--catalog">\n${cards}\n    </div>
  </div></section>
</main>
${REVEAL_JS}
${PHONE_FAB}
</body></html>`
  );
}

const ICON = {
  wrench: (id) => `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="8" y1="8" x2="40" y2="40"><stop stop-color="#00b4ff"/><stop offset="1" stop-color="#00e5c8"/></linearGradient></defs><path d="M14 34l20-20M22 14l12 12-4 4M18 30l-4 4" stroke="url(#${id})" stroke-width="2" stroke-linecap="round"/><circle cx="16" cy="32" r="3" stroke="url(#${id})" stroke-width="1.75"/></svg>`,
  globe: (id) => `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="4" y1="40" x2="44" y2="8"><stop stop-color="#00e5c8"/><stop offset="1" stop-color="#00b4ff"/></linearGradient></defs><circle cx="24" cy="24" r="12" stroke="url(#${id})" stroke-width="1.75"/><ellipse cx="24" cy="24" rx="12" ry="4.5" stroke="url(#${id})" stroke-width="1.5"/><path d="M12 24h24M24 12v24" stroke="url(#${id})" stroke-width="1.25" opacity=".5"/></svg>`,
  palette: (id) => `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="10" y1="38" x2="38" y2="10"><stop stop-color="#00b4ff"/><stop offset="1" stop-color="#00e5c8"/></linearGradient></defs><path d="M12 28c0-8 6.5-16 14-16 5 0 9 2.5 11 6" stroke="url(#${id})" stroke-width="1.75" stroke-linecap="round"/><circle cx="18" cy="26" r="2.5" fill="url(#${id})"/><circle cx="24" cy="22" r="2.5" fill="url(#${id})" opacity=".85"/><circle cx="30" cy="24" r="2.5" fill="url(#${id})" opacity=".7"/><circle cx="28" cy="31" r="2.5" fill="url(#${id})" opacity=".55"/></svg>`,
  share: (id) => `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="8" y1="8" x2="40" y2="40"><stop stop-color="#00b4ff"/><stop offset="1" stop-color="#00e5c8"/></linearGradient></defs><circle cx="16" cy="20" r="4" stroke="url(#${id})" stroke-width="1.75"/><circle cx="32" cy="14" r="3.5" stroke="url(#${id})" stroke-width="1.75"/><circle cx="28" cy="34" r="3.5" stroke="url(#${id})" stroke-width="1.75"/><path d="M19.5 22l9-4M27 16l3 12M30 28l-8 5" stroke="url(#${id})" stroke-width="1.5" stroke-linecap="round" opacity=".75"/></svg>`,
  stack: (id) => `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="8" y1="40" x2="40" y2="8"><stop stop-color="#00e5c8"/><stop offset="1" stop-color="#00b4ff"/></linearGradient></defs><rect x="10" y="28" width="28" height="10" rx="2" stroke="url(#${id})" stroke-width="1.75"/><rect x="14" y="18" width="20" height="8" rx="2" stroke="url(#${id})" stroke-width="1.75" opacity=".85"/><rect x="18" y="10" width="12" height="6" rx="1.5" stroke="url(#${id})" stroke-width="1.75" opacity=".7"/></svg>`,
  gift: (id) => `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="${id}" x1="6" y1="12" x2="42" y2="36"><stop stop-color="#00b4ff"/><stop offset="1" stop-color="#00e5c8"/></linearGradient></defs><rect x="8" y="20" width="32" height="22" rx="3" stroke="url(#${id})" stroke-width="2"/><path d="M24 20V42M8 26h32" stroke="url(#${id})" stroke-width="1.75"/><path d="M18 20c0-4 3-8 6-8s6 4 6 8M24 12v8" stroke="url(#${id})" stroke-width="1.5" stroke-linecap="round"/></svg>`,
};

const categories = [
  {
    file: "category-it-support-technical-services.html",
    title: "IT Support & Technical Services",
    h1: `IT Support &amp; <em>Technical Services</em>`,
    lead: "Keep devices, networks, and peripherals dependable—whether you need proactive care, rapid fixes, or a clean handoff after upgrades.",
    services: [
      { title: "Managed IT Support & Troubleshooting", file: "managed-it-support-troubleshooting.html", desc: "Ongoing triage, ticketing discipline, and root-cause fixes for day-to-day IT friction.", iconSvg: ICON.wrench("gIt0") },
      { title: "Device Setup (Phones, Tablets, Laptops)", file: "device-setup-phones-tablets-laptops.html", desc: "Enrollment, updates, accounts, and security baselines for the devices your people carry.", iconSvg: ICON.stack("gIt1") },
      { title: "WiFi Optimization & Coverage Expansion", file: "wifi-optimization-coverage-expansion.html", desc: "Heatmaps, channel plans, and access point placement for stable wireless where it matters.", iconSvg: ICON.globe("gIt2") },
      { title: "Data Backup & Recovery", file: "data-migration-recovery.html", desc: "Policies, restores, and recovery paths when storage fails or files go missing.", iconSvg: ICON.stack("gIt3") },
      { title: "Remote Support Services", file: "remote-support-services.html", desc: "Secure remote sessions for fast fixes without waiting for an on-site window.", iconSvg: ICON.wrench("gIt4") },
      { title: "Printer & Peripheral Setup", file: "printer-peripheral-setup.html", desc: "Drivers, queues, scan-to-folder, and shared devices that behave for the whole office.", iconSvg: ICON.stack("gIt5") },
      { title: "Camera Installation & Network Setup", file: "camera-installation-security-setup.html", desc: "IP cameras, recorders, VLAN placement, and remote viewing done with security in mind.", iconSvg: ICON.wrench("gIt6") },
      { title: "Network Engineering & Infrastructure", file: "network-engineering.html", desc: "Routing, switching, segmentation, and documentation for growing teams.", iconSvg: ICON.globe("gIt7") },
    ],
  },
  {
    file: "category-website-design-digital-presence.html",
    title: "Website Design & Digital Presence",
    h1: `Website Design &amp; <em>Digital Presence</em>`,
    lead: "From DNS to design—make your public-facing stack fast, findable, and easy to maintain.",
    services: [
      { title: "Website Design & Management", file: "website-design-management.html", desc: "Builds, refreshes, and steady updates aligned to campaigns and seasons.", iconSvg: ICON.globe("gW0") },
      { title: "Website UI/UX Modernization", file: "website-ui-ux-modernization.html", desc: "Navigation, accessibility, and conversion tuning without a risky rebuild.", iconSvg: ICON.globe("gW1") },
      { title: "Domain Setup & DNS Configuration", file: "domain-setup-digital-infrastructure.html", desc: "Registrar hygiene, records, SSL alignment, and vendor-ready documentation.", iconSvg: ICON.globe("gW2") },
      { title: "Hosting Setup & Optimization", file: "hosting-setup-optimization.html", desc: "Stack selection, caching, TLS, and performance baselines for reliable uptime.", iconSvg: ICON.stack("gW3") },
      { title: "SEO Starter Setup", file: "seo-starter-setup.html", desc: "Titles, meta, sitemaps, analytics hooks, and foundational on-page structure.", iconSvg: ICON.globe("gW4") },
      { title: "Website Content Updates", file: "website-content-updates.html", desc: "Copy, imagery, hours, and promos published on a predictable cadence.", iconSvg: ICON.globe("gW5") },
      { title: "Website Security & Monitoring", file: "website-security-monitoring.html", desc: "Hardening, updates, uptime checks, and alerts before visitors notice issues.", iconSvg: ICON.wrench("gW6") },
    ],
  },
  {
    file: "category-branding-graphic-design.html",
    title: "Branding & Graphic Design",
    h1: `Branding &amp; <em>Graphic Design</em>`,
    lead: "Cohesive visuals across print and digital—built to vendor specs and brand rules you can reuse.",
    services: [
      { title: "Logo Design & Brand Identity", file: "logo-design-brand-identity.html", desc: "Marks, palettes, type, and export packs that scale from favicon to signage.", iconSvg: ICON.palette("gB0") },
      { title: "Brand Style Guide Creation", file: "brand-style-guide-creation.html", desc: "Single source of truth for color, type, spacing, and voice-and-tone guardrails.", iconSvg: ICON.palette("gB1") },
      { title: "Social Media Branding Assets", file: "social-media-branding-assets.html", desc: "Covers, highlights, templates, and safe zones tuned per platform.", iconSvg: ICON.share("gB2") },
      { title: "Flier & Graphic Design", file: "flier-graphic-design.html", desc: "Print-ready layouts with bleed, hierarchy, and export profiles printers accept.", iconSvg: ICON.palette("gB3") },
      { title: "Business Cards & Print Materials", file: "business-cards-print-materials.html", desc: "Cards, menus, and stationery with consistent paper and finish guidance.", iconSvg: ICON.stack("gB4") },
      { title: "Digital Ads & Promotional Graphics", file: "digital-ads-promotional-graphics.html", desc: "Campaign-ready sizes, motion notes, and CTA-forward compositions.", iconSvg: ICON.palette("gB5") },
    ],
  },
  {
    file: "category-social-media-content-management.html",
    title: "Social Media & Content Management",
    h1: `Social Media &amp; <em>Content Management</em>`,
    lead: "Publishing rhythm, creative support, and reporting—so your channels work while you run the business.",
    services: [
      { title: "Social Media Management (Monthly)", file: "social-media-management.html", desc: "Calendars, captions, community touchpoints, and monthly performance snapshots.", iconSvg: ICON.share("gS0") },
      { title: "Content Creation for Businesses", file: "content-creation-businesses.html", desc: "Scripts, shot plans, and packages aligned to promos and pillars.", iconSvg: ICON.share("gS1") },
      { title: "Reels / Short-Form Video Editing", file: "reels-tiktok-editing.html", desc: "Professional short-form video editing for Instagram, Facebook, TikTok, and other platforms.", iconSvg: ICON.share("gS2") },
      { title: "Monthly Content Calendars", file: "monthly-content-calendars.html", desc: "Channel mix, themes, and CTA mapping one month at a time.", iconSvg: ICON.stack("gS3") },
      { title: "Engagement Management", file: "engagement-management.html", desc: "Replies, DMs triage, and escalation paths that protect brand tone.", iconSvg: ICON.share("gS4") },
      { title: "Analytics & Performance Reporting", file: "analytics-performance-reporting.html", desc: "Readable dashboards with next-step recommendations—not vanity metrics alone.", iconSvg: ICON.globe("gS5") },
    ],
  },
  {
    file: "category-business-setup-digital-infrastructure.html",
    title: "Business Setup & Digital Infrastructure",
    h1: `Business Setup &amp; <em>Digital Infrastructure</em>`,
    lead: "Email, bookings, profiles, and automation—wired with deliverability and clarity first.",
    services: [
      { title: "Business Email Setup & Management", file: "business-email-setup-management.html", desc: "Workspace tenants, aliases, authentication, and tidy admin habits.", iconSvg: ICON.stack("gX0") },
      { title: "Online Booking System Setup", file: "online-booking-system-setup.html", desc: "Services, buffers, reminders, and payments without double-book chaos.", iconSvg: ICON.stack("gX1") },
      { title: "Google Business Profile Setup", file: "google-business-profile-setup.html", desc: "Verification, categories, posts, and photo guidance for local discovery.", iconSvg: ICON.globe("gX2") },
      { title: "Digital Presence Setup (Full Business Launch)", file: "digital-presence-full-business-launch.html", desc: "Coordinated go-live across site, email, listings, and core profiles.", iconSvg: ICON.globe("gX3") },
      { title: "Automation Setup & Integrations", file: "automation-setup-integrations.html", desc: "Zaps, webhooks, CRM hooks, and guardrails so automations stay observable.", iconSvg: ICON.wrench("gX4") },
      { title: "Cloud Services & Migration", file: "cloud-services-migration.html", desc: "Mailbox and file moves with cutover plans and rollback options.", iconSvg: ICON.stack("gX5") },
    ],
  },
  {
    file: "category-premium-bundles-packages.html",
    title: "Premium Bundles & Packages",
    h1: `Premium Bundles &amp; <em>Packages</em>`,
    lead: "Save time and budget with curated bundles—each designed around a clear outcome and sequenced delivery.",
    services: [
      { title: "Business Launch Bundle", file: "business-launch-bundle.html", desc: "Identity, site starter, email, and profiles for a credible opening week.", iconSvg: ICON.gift("gP0") },
      { title: "Digital Growth Bundle", file: "digital-growth-bundle.html", desc: "SEO starter, content cadence, and conversion tuning in one track.", iconSvg: ICON.gift("gP1") },
      { title: "IT Essentials Bundle", file: "it-essentials-bundle.html", desc: "Devices, backup, Wi-Fi, and remote support baselines for lean teams.", iconSvg: ICON.gift("gP2") },
      { title: "Brand Identity Bundle", file: "brand-identity-bundle.html", desc: "Logo, style guide, and core social skins launched together.", iconSvg: ICON.gift("gP3") },
      { title: "Social Media Accelerator Bundle", file: "social-media-accelerator-bundle.html", desc: "Management, reels editing, and calendars for a 90-day sprint.", iconSvg: ICON.gift("gP4") },
      { title: "Booking & Automation Bundle", file: "booking-automation-bundle.html", desc: "Scheduling, reminders, and integrations that reduce manual follow-up.", iconSvg: ICON.gift("gP5") },
    ],
  },
];

const forceWrite = (rel, html) => {
  fs.writeFileSync(path.join(ROOT, rel), html, "utf8");
};

const bundleFiles = new Set([
  "business-launch-bundle.html",
  "digital-growth-bundle.html",
  "it-essentials-bundle.html",
  "brand-identity-bundle.html",
  "social-media-accelerator-bundle.html",
  "booking-automation-bundle.html",
]);

let si = 0;
for (let ci = 0; ci < categories.length - 1; ci++) {
  const cat = categories[ci];
  for (const s of cat.services) {
    if (bundleFiles.has(s.file)) continue;
    const fp = path.join(ROOT, s.file);
    if (fs.existsSync(fp)) continue;
    const c = defaultServiceContent(s.title);
    const slug = s.file.replace(/\.html$/i, "");
    const html = servicePage(si++, s.title, slug, c.lead, c.included, c.who, c.problems, c.ctaTitle, c.ctaLead);
    forceWrite(s.file, html);
  }
}

categories.forEach((cat, idx) => {
  forceWrite(cat.file, categoryPage(cat, idx));
});

const bundles = [
  {
    file: "business-launch-bundle.html",
    slug: "business-launch-bundle",
    title: "Business Launch Bundle",
    included: [
      "Brand discovery plus logo directions and primary mark delivery",
      "Starter website or landing with DNS, SSL, and analytics hooks",
      "Business email setup with signatures and basic security alignment",
      "Google Business Profile shell with categories and verification guidance",
    ],
    perfectFor: ["First-time founders", "Franchisees opening a new territory", "Partners splitting creative vs technical work"],
    valueBreakdown: [
      "Design + DNS + email sequenced to avoid rework",
      "Shared project tracker and milestone checkpoints",
      "Export packs you can hand to vendors and staff",
    ],
    whySave: [
      "Bundled sequencing reduces change orders between web and print",
      "One accountable operator lowers coordination tax",
      "Launch checklist prevents expensive last-minute fixes",
    ],
  },
  {
    file: "digital-growth-bundle.html",
    slug: "digital-growth-bundle",
    title: "Digital Growth Bundle",
    included: ["SEO starter setup with sitemap and baseline tracking", "Monthly content calendar plus two short-form edits", "UI/UX tune-up focused on top conversion paths", "Light analytics report with prioritized next steps"],
    perfectFor: ["Sites with traffic but flat leads", "Seasonal businesses ramping campaigns", "Teams without a dedicated growth hire"],
    valueBreakdown: ["Creative + technical work in one sprint window", "Shared measurement definitions before content ships", "Edits sized for practical review cycles"],
    whySave: ["Avoids paying twice when SEO and UX fixes collide", "Reduces idle weeks between agency handoffs", "Bundles reporting so decisions come faster"],
  },
  {
    file: "it-essentials-bundle.html",
    slug: "it-essentials-bundle",
    title: "IT Essentials Bundle",
    included: ["Device setup for up to five workstations", "WiFi optimization pass with written recommendations", "Backup policy template plus one restore drill", "Remote support block for post-go-live questions"],
    perfectFor: ["New offices", "Teams leaving a MSP transition", "Hybrid crews needing a stable baseline"],
    valueBreakdown: ["Hardware and network reviewed together", "Documentation you can reuse for onboarding", "Support hours bundled for predictable cost"],
    whySave: ["Fewer emergency calls when Wi-Fi and backups are validated together", "Shared baseline lowers per-incident triage time", "Bundled hours cost less than ad-hoc break-fix"],
  },
  {
    file: "brand-identity-bundle.html",
    slug: "brand-identity-bundle",
    title: "Brand Identity Bundle",
    included: ["Logo system with lockups and one-color treatments", "Mini style guide with palette, type, and spacing rules", "Social profile skins and cover templates", "Print-ready business card file set"],
    perfectFor: ["Rebrands", "Partners launching a sub-brand", "Teams aligning web and print after drift"],
    valueBreakdown: ["Design decisions sequenced before expensive print runs", "Exports grouped for web, print, and social", "Revision rounds scoped up front"],
    whySave: ["Prevents reprinting when social and card blues diverge", "Reduces designer context switching fees", "Single guideline PDF cuts internal review loops"],
  },
  {
    file: "social-media-accelerator-bundle.html",
    slug: "social-media-accelerator-bundle",
    title: "Social Media Accelerator Bundle",
    included: ["Quarterly strategy snapshot and channel priorities", "Monthly management with engagement coverage", "Reels / short-form video editing batch each month", "Analytics snapshot tied to business goals"],
    perfectFor: ["Brands entering short-form seriously", "Operators who can film but not edit", "Local businesses with seasonal promos"],
    valueBreakdown: ["Creative and community handled in one rhythm", "Batch editing lowers per-clip cost", "Reporting included so boosts are informed"],
    whySave: ["Avoids paying separate editors and schedulers without a plan", "Shared calendar reduces duplicate posts", "Bundled analytics prevents blind boosting"],
  },
  {
    file: "booking-automation-bundle.html",
    slug: "booking-automation-bundle",
    title: "Booking & Automation Bundle",
    included: ["Online booking system configured with reminders", "Two automation flows with logging and error alerts", "CRM or spreadsheet handoff documented", "Admin training for day-two edits"],
    perfectFor: ["Salons and clinics", "Consultancies taking deposits", "Teams drowning in manual follow-ups"],
    valueBreakdown: ["Scheduling + automation architected together", "Test cases for edge bookings included", "Monitoring notes so failures are visible"],
    whySave: ["Fewer no-shows when reminders and CRM align", "Automation without observability causes expensive fires—bundled guardrails", "Single rollout window reduces staff retraining"],
  },
];

bundles.forEach((b, i) => {
  forceWrite(b.file, bundlePage(i, b.title, b.slug, b.included, b.perfectFor, b.valueBreakdown, b.whySave));
});

console.log("Wrote category pages:", categories.length);
console.log("Wrote bundle pages:", bundles.length);
