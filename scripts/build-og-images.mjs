import satori from "satori";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const fontsDir = join(root, "assets", "fonts");
const imagesDir = join(root, "assets", "images");
const sharedOgImageFilenames = ["og-image.png", "og-image-v2.png"];

const spaceGrotesk = readFileSync(join(fontsDir, "space-grotesk-700.ttf"));
const inter = readFileSync(join(fontsDir, "inter-400.ttf"));

// Pre-convert hero to PNG buffer so satori embeds it reliably.
const heroPng = await sharp(join(imagesDir, "hero-640.jpg"))
  .resize(560, 560, { fit: "cover" })
  .png()
  .toBuffer();
const heroDataUri = `data:image/png;base64,${heroPng.toString("base64")}`;

function card({ eyebrow, title, description }) {
  return {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#0b1220",
        fontFamily: "Inter",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              padding: "64px 56px",
            },
            children: [
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "72px",
                          height: "4px",
                          backgroundColor: "#0077ff",
                          borderRadius: "2px",
                          marginBottom: "28px",
                        },
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 22,
                          color: "#66ccff",
                          fontFamily: "Inter",
                          marginBottom: "14px",
                          letterSpacing: "0.5px",
                        },
                        children: eyebrow,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 60,
                          fontFamily: "Space Grotesk",
                          fontWeight: 700,
                          color: "#ffffff",
                          lineHeight: 1.1,
                          marginBottom: "20px",
                        },
                        children: title,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 26,
                          color: "#c9d4e5",
                          lineHeight: 1.35,
                          maxWidth: "600px",
                        },
                        children: description,
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    alignItems: "center",
                    fontSize: 22,
                    color: "#66ccff",
                    fontWeight: 700,
                  },
                  children: "daliso.com",
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "440px",
              padding: "56px 56px 56px 0",
            },
            children: [
              {
                type: "img",
                props: {
                  src: heroDataUri,
                  width: 360,
                  height: 360,
                  style: {
                    borderRadius: "28px",
                    objectFit: "cover",
                    border: "3px solid #1f2a3d",
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };
}

async function render(markup, outPath) {
  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Space Grotesk", data: spaceGrotesk, weight: 700, style: "normal" },
      { name: "Inter", data: inter, weight: 400, style: "normal" },
    ],
  });
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  console.log("wrote", outPath);
}

for (const filename of sharedOgImageFilenames) {
  await render(
    card({
      eyebrow: "Founder, African Technopreneurs",
      title: "Daliso Ngoma",
      description: "Immersive tech, commerce, media, and software products across Africa.",
    }),
    join(imagesDir, filename),
  );
}

await render(
  card({
    eyebrow: "Selected work",
    title: "Projects",
    description: "Ventures and products by Daliso Ngoma across immersive tech, commerce, and media.",
  }),
  join(imagesDir, "og-projects.png"),
);
