import type { ImageMetadata } from 'astro';

// Every image under src/assets/work/<slug>/ is picked up here and optimised at build.
const files = import.meta.glob<ImageMetadata>('../assets/work/*/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
});

function photos(slug: string, names: string[]): ImageMetadata[] {
  return names.map((name) => {
    const image = files[`../assets/work/${slug}/${name}`];
    if (!image) throw new Error(`Missing image: src/assets/work/${slug}/${name}`);
    return image;
  });
}

// Left column is film and commercial productions, right column is theatre and personal work.
export type Column = 'film' | 'theatre';

export interface Project {
  slug: string;
  title: string;
  column: Column;
  /** One line under the title on the card, e.g. "Play by Henrik Ibsen" or "Studio, 2025". */
  subtitle?: string;
  /** Credits shown on the project page, in this order. Leave out what isn't known. */
  credits: { label: string; value: string }[];
  summary?: string;
  cover: ImageMetadata;
  images: ImageMetadata[];
  /** Path under public/, e.g. "work/a-dolls-house/video.mp4" */
  video?: string;
}

export const columns: Record<Column, { title: string; description: string }> = {
  film: {
    title: 'Film & productions',
    description: 'Feature films, series and commercial productions.',
  },
  theatre: {
    title: 'Theatre & creative',
    description: 'Stage productions, sketches and studies.',
  },
};

// TODO(client): film projects, plus year, venue, director and a short text for each project.
export const projects: Project[] = [
  {
    slug: 'arms-and-the-man',
    title: 'Arms and the Man',
    column: 'theatre',
    subtitle: 'Play by George Bernard Shaw',
    credits: [],
    cover: photos('arms-and-the-man', ['1.jpg'])[0],
    images: photos(
      'arms-and-the-man',
      Array.from({ length: 22 }, (_, i) => `${i + 1}.jpg`),
    ),
  },
  {
    slug: 'a-dolls-house',
    title: "A Doll's House",
    column: 'theatre',
    subtitle: 'Play by Henrik Ibsen',
    credits: [],
    cover: photos('a-dolls-house', ['1.png'])[0],
    images: photos('a-dolls-house', [
      '1.png', '2.jpg', '3.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg', '10.jpg', '11.jpg',
      '12.jpg', '13.jpg', '14.jpg', '15.webp', '16.jpg', '8.webp', '9.webp',
    ]),
    video: 'work/a-dolls-house/video.mp4',
  },
  {
    slug: 'sketches-and-studies',
    title: 'Sketches and studies',
    column: 'theatre',
    subtitle: 'Costume sketches and material studies',
    credits: [],
    cover: photos('sketches-and-studies', ['1.jpg'])[0],
    images: photos('sketches-and-studies', [
      '1.jpg', '1.1.jpg', '2.jpg', '3.jpg', '3.1.jpg', '4.jpg', '5.jpg', '6.jpg', '7.jpg',
      '9.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg', '16.jpg',
    ]),
  },
];

export function projectsIn(column: Column): Project[] {
  return projects.filter((project) => project.column === column);
}
