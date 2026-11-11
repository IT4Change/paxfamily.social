// pax-classic: the look of the FIRST pax.family website (violet header, white dove) — style only.
//
// This brand carries the `theme` and `logos` buckets and nothing else: no network name, description,
// organisation or links (`about` below only describes the brand itself in the admin's brand list).
// Compose it with the identity of the network's main brand instead of activating it on its own, e.g.
// as brandingComposition
//   {"theme": "pax-classic", "logos": "pax-classic"}
// over activeBranding "paxfamily". Activated alone, every other bucket falls back to the ocelot.social
// framework defaults.
//
// Paths are ROOT-relative to this folder; the build namespaces them to /branding/pax-classic/….
// Colours and the Gantari font are CSS (assets/css/theme.css), the light header navigation for the
// violet header is in assets/css/branding.css.
//
// PAX name, logos and colours belong to PAX Family gGmbH — ask before reusing them elsewhere.
import { defineBranding } from '@ocelot-social/branding'

export default defineBranding({
  // Only the brand's self-description, for the admin's brand list — not the network's identity.
  about: {
    description: 'pax-classic — the style of the first pax.family website (theme + logos only).',
    license: {
      logosReusable: false,
      colorsReusable: false,
      note: 'PAX name, logos and colours belong to PAX Family gGmbH — ask before reuse.',
    },
  },
  donation: {
    progressBarColorType: 'uni',
  },
  logos: {
    // White dove and "PAX" on transparent — made for the violet header. Cropped from the old
    // pax.family text logo, without the "Welt Friedens Festival" lines, illegible at this size.
    headerPath: 'assets/logo-header.png',
    headerMobilePath: 'assets/logo-header.png',
    headerWidth: '60px',
    // The orange circle with "PAX Welt Friedens Festival".
    signupPath: 'assets/logo-circle.png',
    welcomePath: 'assets/logo-circle.png',
    logoutPath: 'assets/logo-circle.png',
    passwordResetPath: 'assets/logo-circle.png',
  },
  assets: {
    css: ['assets/css/theme.css', 'assets/css/branding.css'],
    favicon: 'assets/favicon.ico',
    // The square raster icon: apple-touch-icon (iOS home screen) + PWA install icon.
    icon: 'assets/icon.png',
  },
})
