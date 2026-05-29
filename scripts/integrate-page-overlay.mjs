import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const variantByFile = {
  "website-design-management.html": "website-design",
  "website-ui-ux-modernization.html": "website-design",
  "website-content-updates.html": "website-design",
  "hosting-setup-optimization.html": "hosting",
  "domain-setup-digital-infrastructure.html": "domain-setup",
  "seo-starter-setup.html": "seo",
  "website-security-monitoring.html": "security-monitoring",
  "social-media-management.html": "social-media",
  "engagement-management.html": "social-media",
  "monthly-content-calendars.html": "social-media",
  "reels-tiktok-editing.html": "social-media",
  "analytics-performance-reporting.html": "social-media",
  "social-media-branding-assets.html": "social-media",
  "social-media-accelerator-bundle.html": "social-media",
  "logo-design-brand-identity.html": "logo-branding",
  "brand-style-guide-creation.html": "logo-branding",
  "brand-identity-bundle.html": "logo-branding",
  "business-cards-print-materials.html": "logo-branding",
  "digital-ads-promotional-graphics.html": "flier-design",
  "flier-graphic-design.html": "flier-design",
  "business-email-setup-management.html": "email-setup",
  "online-booking-system-setup.html": "booking-system",
  "booking-automation-bundle.html": "booking-system",
  "google-business-profile-setup.html": "google-business",
  "automation-setup-integrations.html": "automation",
  "digital-presence-full-business-launch.html": "digital-presence",
  "business-launch-bundle.html": "digital-presence",
  "digital-growth-bundle.html": "digital-presence",
  "cloud-services-migration.html": "data-backup",
  "data-migration-recovery.html": "data-backup",
  "camera-installation-security-setup.html": "camera-install",
  "network-engineering.html": "network-engineering",
  "wifi-optimization-coverage-expansion.html": "network-engineering",
  "content-creation-businesses.html": "content-creation",
  "it-security-services.html": "it-support",
  "remote-support-services.html": "it-support",
  "managed-it-support-troubleshooting.html": "it-support",
  "device-setup-phones-tablets-laptops.html": "it-support",
  "desktop-support.html": "it-support",
  "troubleshooting-tech-support.html": "it-support",
  "printer-peripheral-setup.html": "it-support",
  "it-essentials-bundle.html": "it-support",
  "small-business-it-support.html": "small-business-it",
  "home-office-tech-support.html": "home-office",
};

for (const [file, variant] of Object.entries(variantByFile)) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) {
    console.warn("missing", file);
    continue;
  }
  let c = fs.readFileSync(p, "utf8");
  if (c.includes("page-with-overlay")) {
    console.log("skip (done)", file);
    continue;
  }
  if (!c.includes('header class="svc-hero"')) {
    console.warn("skip (no hero)", file);
    continue;
  }
  if (!c.includes("page-overlay-background.css")) {
    c = c.replace("</head>", '<link rel="stylesheet" href="css/page-overlay-background.css"/>\n</head>');
  }
  const navHero = c.match(/<\/nav>\s*<header class="svc-hero">/);
  if (!navHero) {
    console.warn("skip (nav/hero pattern)", file);
    continue;
  }
  c = c.replace(
    /<\/nav>\s*<header class="svc-hero">/,
    `</nav>\n\n<div class="page-with-overlay">\n<div class="page-overlay-bg ${variant}" aria-hidden="true"></div>\n<header class="svc-hero">`
  );
  const scriptIdx = c.lastIndexOf("<script>");
  if (scriptIdx < 0) {
    console.warn("skip (no script)", file);
    continue;
  }
  const before = c.slice(0, scriptIdx);
  const after = c.slice(scriptIdx);
  const lastSec = before.lastIndexOf("</section>");
  if (lastSec < 0) {
    console.warn("skip (no section)", file);
    continue;
  }
  const insertAt = lastSec + "</section>".length;
  c = before.slice(0, insertAt) + "\n</div>\n\n" + before.slice(insertAt) + after;
  fs.writeFileSync(p, c);
  console.log("updated", file, variant);
}
