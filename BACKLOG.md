# Backlog

## Waiting on the client

- [ ] **Film projects** for the left column: titles, studio or production company, year, role, photos.
      Until then the film column shows three placeholder cards.
- [ ] **Bio text** for the About section (current text is a placeholder, see `src/components/About.astro`).
- [ ] **Project details** for the theatre work: venue, director, year, a short text per project
      (`credits` and `summary` in `src/data/projects.ts`).
- [ ] **New SwissTransfer deliveries** in `materials/incoming/` (four zips, June 2026): which project each
      belongs to. One contains "sketch for 1.jpg" / "sketch for 2.jpg", so it suits a sketch next to finished costume layout.
- [ ] Feedback on the redesign: dark look, water reflection on the name, card stacks.

## Waiting on us

- [ ] **Custom domain**: set it in Pages settings and add the `SITE_URL` / `BASE_URL` repository variables (see README).
- [ ] Check the EmailJS template still reads well: the form now sends `subject` = "Message from the website"
      and `project_type` = "Not specified".
- [ ] Bulgarian version? Both typefaces include Cyrillic.
- [ ] Share preview image (`og:image`) uses the hero poster; swap in a stronger costume photo once chosen.

## Done (redesign, October 2026)

- Dark, black-and-white design; the costumes provide all the colour. Unbounded + Manrope, self-hosted.
- Hero: full-width name with a rippling water reflection (still for reduced-motion users), video below with a pause button.
- Portfolio: film (left) and theatre (right) as card stacks; cards slide off toward the side you click;
  each project has its own page with a gallery and full-size viewer; page transitions slide toward the column's side.
- Fixed images not loading under the GitHub Pages sub-path.
- Re-encoded hero videos from HEVC to H.264 (they didn't play in Firefox or many Chrome installs), 6.6 MB + 8.6 MB → 1.1 MB each.
- Photos are now resized and converted to WebP at build. The build is 27 MB, down from 70 MB, and `dist/` is no longer committed.
- Removed template leftovers: Julia Bennett résumé, Testimonials, Tailwind, GSAP, the duplicate EmailJS script.
