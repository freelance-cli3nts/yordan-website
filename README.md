# Yordan Mihalev, costume designer

Portfolio site for Yordan Mihalev. Static [Astro](https://astro.build) site, deployed to GitHub Pages
by `.github/workflows/deploy.yml` on every push to `main`.

## Commands

| Command           | Action                                     |
| :---------------- | :----------------------------------------- |
| `npm ci`          | Install dependencies                       |
| `npm run dev`     | Dev server at `localhost:4321`             |
| `npm run build`   | Build to `./dist/` (not committed)         |
| `npm run preview` | Serve the build locally                    |

To test the GitHub Pages sub-path locally: `BASE_URL=/yordan-website/ npm run build && BASE_URL=/yordan-website/ npm run preview`.

## Structure

```text
src/
  data/projects.ts        all portfolio projects and the two columns
  assets/work/<slug>/     project photos (optimised at build, never link them directly)
  assets/                 hero poster and portrait
  components/             Hero (name + water reflection), Work (two card stacks), About, Contact
  pages/index.astro       home page
  pages/work/[slug].astro one page per project
  lib/url.ts              prefixes links with the deploy base path
public/                   files served as-is: hero videos, project videos, favicon
materials/incoming/       raw deliveries from the client (not published)
```

## Adding a project

1. Put the photos in `src/assets/work/<slug>/` (lowercase file extensions: `.jpg`, `.png`, `.webp`).
2. Videos go in `public/work/<slug>/`. Re-encode to H.264 first; HEVC files don't play in Firefox or
   most Chrome installs:
   `ffmpeg -i in.mov -c:v libx264 -crf 27 -preset slow -pix_fmt yuv420p -movflags +faststart -c:a aac -b:a 96k video.mp4`
3. Add an entry to `projects` in `src/data/projects.ts` with `column: 'film'` (left) or `'theatre'` (right).
   The film column shows placeholder cards until it has at least one project.

## Custom domain

1. In the repo settings, under Pages, enter the domain and follow GitHub's DNS instructions.
2. Under Settings → Secrets and variables → Actions → Variables, add `SITE_URL` (`https://<domain>/`) and `BASE_URL` (`/`).
3. Re-run the deploy workflow.

Open work is tracked in [BACKLOG.md](BACKLOG.md).
