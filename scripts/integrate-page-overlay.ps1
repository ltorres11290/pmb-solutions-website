# One-off: add PageOverlayBackground markup + stylesheet to service HTML (root only).
$root = Split-Path -Parent $PSScriptRoot

$variantByFile = [ordered]@{
  "website-design-management.html" = "website-design"
  "website-ui-ux-modernization.html" = "website-design"
  "website-content-updates.html" = "website-design"
  "hosting-setup-optimization.html" = "hosting"
  "domain-setup-digital-infrastructure.html" = "domain-setup"
  "seo-starter-setup.html" = "seo"
  "website-security-monitoring.html" = "security-monitoring"
  "social-media-management.html" = "social-media"
  "engagement-management.html" = "social-media"
  "monthly-content-calendars.html" = "social-media"
  "reels-tiktok-editing.html" = "social-media"
  "analytics-performance-reporting.html" = "social-media"
  "social-media-branding-assets.html" = "social-media"
  "social-media-accelerator-bundle.html" = "social-media"
  "logo-design-brand-identity.html" = "logo-branding"
  "brand-style-guide-creation.html" = "logo-branding"
  "brand-identity-bundle.html" = "logo-branding"
  "business-cards-print-materials.html" = "logo-branding"
  "digital-ads-promotional-graphics.html" = "flier-design"
  "flier-graphic-design.html" = "flier-design"
  "business-email-setup-management.html" = "email-setup"
  "online-booking-system-setup.html" = "booking-system"
  "booking-automation-bundle.html" = "booking-system"
  "google-business-profile-setup.html" = "google-business"
  "automation-setup-integrations.html" = "automation"
  "digital-presence-full-business-launch.html" = "digital-presence"
  "business-launch-bundle.html" = "digital-presence"
  "digital-growth-bundle.html" = "digital-presence"
  "cloud-services-migration.html" = "data-backup"
  "data-migration-recovery.html" = "data-backup"
  "camera-installation-security-setup.html" = "camera-install"
  "network-engineering.html" = "network-engineering"
  "wifi-optimization-coverage-expansion.html" = "network-engineering"
  "content-creation-businesses.html" = "content-creation"
  "it-security-services.html" = "it-support"
  "remote-support-services.html" = "it-support"
  "managed-it-support-troubleshooting.html" = "it-support"
  "device-setup-phones-tablets-laptops.html" = "it-support"
  "desktop-support.html" = "it-support"
  "troubleshooting-tech-support.html" = "it-support"
  "printer-peripheral-setup.html" = "it-support"
  "it-essentials-bundle.html" = "it-support"
  "small-business-it-support.html" = "small-business-it"
  "home-office-tech-support.html" = "home-office"
}

$skipNames = @(
  "index.html", "privacy-policy.html"
)

foreach ($entry in $variantByFile.GetEnumerator()) {
  $name = $entry.Key
  $variant = $entry.Value
  $path = Join-Path $root $name
  if (-not (Test-Path $path)) { Write-Warning "Missing: $name"; continue }

  $c = [IO.File]::ReadAllText($path)
  if ($c -notmatch "header class=`"svc-hero`"") { Write-Warning "Skip (no svc-hero): $name"; continue }
  if ($c -match "page-with-overlay") { Write-Host "Already integrated: $name"; continue }

  if ($c -notmatch "page-overlay-background\.css") {
    if ($c -match "(?m)^(\s*)</head>\s*$") {
      $link = '$1<link rel="stylesheet" href="css/page-overlay-background.css"/>'
      $c = $c -replace "(?m)^(\s*)</head>\s*$", "`$1<link rel=`"stylesheet`" href=`"css/page-overlay-background.css`"/>`n`$1</head>"
    } else {
      $c = $c -replace "</head>", "<link rel=`"stylesheet`" href=`"css/page-overlay-background.css`"/>`n</head>"
    }
  }

  $inject = "</nav>`n`n<div class=`"page-with-overlay`">`n<div class=`"page-overlay-bg $variant`" aria-hidden=`"true`"></div>`n<header class=`"svc-hero`">"
  if ($c -match "</nav>\s*<header class=`"svc-hero`">") {
    $c = $c -replace "</nav>\s*<header class=`"svc-hero`">", $inject
  } else {
    Write-Warning "Nav/header pattern not found: $name"
    continue
  }

  $scriptIdx = $c.LastIndexOf("<script>")
  if ($scriptIdx -lt 0) { Write-Warning "No script: $name"; continue }
  $before = $c.Substring(0, $scriptIdx)
  $after = $c.Substring($scriptIdx)
  $lastSec = $before.LastIndexOf("</section>")
  if ($lastSec -lt 0) { Write-Warning "No </section>: $name"; continue }
  $insertAt = $lastSec + "</section>".Length
  $c = $before.Substring(0, $insertAt) + "`n</div>`n`n" + $before.Substring($insertAt) + $after

  [IO.File]::WriteAllText($path, $c)
  Write-Host "Updated: $name ($variant)"
}

Write-Host "Done."
