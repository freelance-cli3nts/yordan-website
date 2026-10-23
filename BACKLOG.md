# Backlog

## Waiting on the client

- [ ] **Film projects** for the left column: titles, studio or production company, year, role, photos.
      Until then the film column shows three placeholder cards.
- [ ] **Bio text** for the About section (current text is a placeholder, see `src/components/About.astro`).
- [ ] **Project details** for the theatre work: venue, director, year, a short text per project
      (`credits` and `summary` in `src/data/projects.ts`).
- [ ] **New SwissTransfer deliveries** in `materials/incoming/` (four zips, June 2026): which project each
      belongs to. One contains "sketch for 1.jpg" / "sketch for 2.jpg", so it suits a sketch next to finished costume layout.
- [ ] Feedback on round 2 (below): ripple water, nav beside the N, page-turn decks, phone slider.

## Waiting on us

- [ ] **Custom domain**: set it in Pages settings and add the `SITE_URL` / `BASE_URL` repository variables (see README).
- [ ] Check the EmailJS template still reads well: the form now sends `subject` = "Message from the website"
      and `project_type` = "Not specified".
- [ ] Bulgarian version? Both typefaces include Cyrillic.
- [ ] Share preview image (`og:image`) uses the hero poster; swap in a stronger costume photo once chosen.

## Done (feedback round 3, October 2026)

- Only the landing and the video scroll freely. Work, About and Contact are one screen each;
  Work and About stay pinned and the next screen slides up over them (sticky, `.screen` in
  global.css). The nav targets are in-flow markers in index.astro.
- The ripple now covers the whole name, not only the reflection (canvas over the name; the real
  heading stays, transparent, for screen readers and search).
- Tagline in the signal red. Video button: round, in the middle, with water rings inside;
  top right on phones.
- Contact form: placeholders instead of the intro line (message placeholder lightly edited for
  grammar). On phones the form is tighter and the nav bar hides while typing, so the button stays
  above the keyboard; Android also resizes the page for the keyboard (`interactive-widget`).

## Done (feedback round 2, October 2026)

- Water: the name's reflection is now a WebGL ripple simulation (after jquery.ripples, no jQuery),
  driven by the pointer over the name or reflection. Reflection squashed to 45% height.
  Falls back to the still CSS reflection without WebGL or with reduced motion.
- Nav: desktop, a vertical list right-aligned beside "Yordan", from the top of the N to its middle
  (scrolls away with the name); phones, a bar fixed at the bottom centre.
- Work: both decks the same size (4:5), meeting in the middle a narrow gap apart; cards sit exactly
  on top of each other so a deck reads as one card. Pages turn on the outer edge (film left,
  theatre right); one big button centred underneath, looping; phones keep the column tabs and get
  a slider that turns pages both ways.
- About: bigger portrait on the left; on phones the title comes above it.
- Contact: no title, full-width form, email / phone / Instagram in one row with white icons.

## Done (redesign, October 2026)

- Dark, black-and-white design; the costumes provide all the colour. Unbounded + Manrope, self-hosted.
- Hero: full-width name with a rippling water reflection (still for reduced-motion users), video below with a pause button.
- Portfolio: film (left) and theatre (right) as card stacks; cards slide off toward the side you click;
  each project has its own page with a gallery and full-size viewer; page transitions slide toward the column's side.
- Fixed images not loading under the GitHub Pages sub-path.
- Re-encoded hero videos from HEVC to H.264 (they didn't play in Firefox or many Chrome installs), 6.6 MB + 8.6 MB → 1.1 MB each.
- Photos are now resized and converted to WebP at build. The build is 27 MB, down from 70 MB, and `dist/` is no longer committed.
- Removed template leftovers: Julia Bennett résumé, Testimonials, Tailwind, GSAP, the duplicate EmailJS script.
