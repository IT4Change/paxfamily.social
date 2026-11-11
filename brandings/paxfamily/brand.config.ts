// paxfamily: the brand of paxfamily.social — the network of the PAX Family, around the PAX World Peace
// Festival. The network's active brand (OCELOT_ACTIVE_BRANDING=paxfamily): its style follows the
// current pax.family website (light cream header, violet logo), and it carries the identity and links.
//
// Authored in TypeScript against @ocelot-social/branding: `defineBranding` type-checks these
// overrides against the branding schema; a wrong key or type FAILS the build. Only values that
// differ from the framework defaults are set (sparse override).
//
// Paths are ROOT-relative to this folder; the build namespaces them to /branding/paxfamily/….
// Colours and the Gantari font are CSS (assets/css/theme.css), the header navigation rules are in
// assets/css/branding.css — both listed under `assets.css`, applied at runtime.
//
// The site only publishes raster logos, so the logos here are PNG; vector originals from PAX would
// be sharper.
//
// NOT here: e-mails and support/organization links (SUPPORT_EMAIL / *_LINK) are ENV, see
// helmfile/environments/*.yaml.gotmpl.
import { defineBranding } from '@ocelot-social/branding'

export default defineBranding({
  about: {
    description:
      'paxfamily.social — the network of the PAX Family, around the PAX World Peace Festival.',
    license: {
      logosReusable: false,
      colorsReusable: false,
      note: 'PAX name, logos and colours belong to PAX Family gGmbH — ask before reuse.',
    },
  },
  metadata: {
    applicationName: 'PAX Family',
    applicationShortName: 'PAX Family',
    applicationDescription: 'PAX Family – das Netzwerk rund um das PAX Weltfriedensfestival',
    organizationName: 'PAX Family gGmbH',
    organizationJurisdiction: 'Germany',
  },
  donation: {
    progressBarColorType: 'uni',
  },
  logos: {
    // Violet dove and "PAX" on transparent, as in the header of pax.family — without the year
    // ("2026") the site prints above "PAX", so the logo does not age with every festival.
    headerPath: 'assets/logo-header.png',
    headerMobilePath: 'assets/logo-header.png',
    headerWidth: '60px',
    // The orange circle with "PAX Welt Friedens Festival", the main logo of pax.family.
    signupPath: 'assets/logo-circle.png',
    welcomePath: 'assets/logo-circle.png',
    logoutPath: 'assets/logo-circle.png',
    passwordResetPath: 'assets/logo-circle.png',
  },
  links: {
    // Pages pax.family has. Terms, code of conduct and data privacy stay the framework's until PAX
    // provides texts for the network: the ones on pax.family (/agb, /datenschutz) cover the festival
    // and the website, not this platform.
    pages: {
      organization: { externalLink: { url: 'https://pax.family/leitbild', target: '_blank' } },
      imprint: { externalLink: { url: 'https://pax.family/impressum', target: '_blank' } },
      faq: { externalLink: { url: 'https://pax.family/info', target: '_blank' } },
      support: { externalLink: { url: 'https://pax.family/kontakt', target: '_blank' } },
    },
    // No "donate": pax.family has no donation page any more (the former /unterstuetzung is gone),
    // and the framework default would send people to ocelot.social's.
    footerOrder: [
      'organization',
      'termsAndConditions',
      'codeOfConduct',
      'dataPrivacy',
      'faq',
      'support',
      'imprint',
    ],
  },
  assets: {
    css: ['assets/css/theme.css', 'assets/css/branding.css'],
    favicon: 'assets/favicon.ico',
    // The square raster icon: apple-touch-icon (iOS home screen) + PWA install icon.
    icon: 'assets/icon.png',
  },
})
