import satori from "satori";
import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";

/**
 * Generate a branded 1200x630 OG image for a blog post.
 * Two-column layout: title + tags on the left, hero photo on the right.
 * Falls back gracefully — callers should catch errors.
 */
export async function generateOgImage(post, outputPath, fontsDir) {
  const spaceGrotesk = readFileSync(join(fontsDir, "space-grotesk-700.ttf"));
  const inter = readFileSync(join(fontsDir, "inter-400.ttf"));

  const assetsDir = dirname(fontsDir);
  const avatarBytes = readFileSync(join(assetsDir, "images", "hero-640.jpg"));
  const avatarDataUri = `data:image/jpeg;base64,${avatarBytes.toString("base64")}`;

  const titleSize = post.title.length < 40 ? 48 : post.title.length < 70 ? 40 : 34;
  const tags = (post.tags || []).slice(0, 4);

  const markup = {
    type: "div",
    props: {
      style: {
        display: "flex",
        width: "100%",
        height: "100%",
        backgroundColor: "#121212",
        fontFamily: "Inter",
      },
      children: [
        // Left column: accent bar, title, tags, domain
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              flex: 1,
              padding: "56px 48px 56px 56px",
            },
            children: [
              // Top: accent bar + title
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column" },
                  children: [
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "64px",
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
                          fontSize: titleSize,
                          fontFamily: "Space Grotesk",
                          fontWeight: 700,
                          color: "#ffffff",
                          lineHeight: 1.2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 4,
                          WebkitBoxOrient: "vertical",
                        },
                        children: post.title,
                      },
                    },
                  ],
                },
              },
              // Bottom: tags + divider + domain
              {
                type: "div",
                props: {
                  style: { display: "flex", flexDirection: "column" },
                  children: [
                    // Tags row
                    ...(tags.length > 0
                      ? [
                          {
                            type: "div",
                            props: {
                              style: {
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "8px",
                                marginBottom: "20px",
                              },
                              children: tags.map((tag) => ({
                                type: "div",
                                props: {
                                  style: {
                                    fontSize: 17,
                                    color: "#66ccff",
                                    border: "1px solid #66ccff",
                                    borderRadius: "14px",
                                    padding: "3px 12px",
                                  },
                                  children: tag,
                                },
                              })),
                            },
                          },
                        ]
                      : []),
                    // Divider
                    {
                      type: "div",
                      props: {
                        style: {
                          width: "100%",
                          height: "1px",
                          backgroundColor: "#333333",
                          marginBottom: "14px",
                        },
                      },
                    },
                    // Domain + reading time
                    {
                      type: "div",
                      props: {
                        style: {
                          display: "flex",
                          alignItems: "center",
                          fontSize: 20,
                          color: "#888888",
                        },
                        children: [
                          { type: "span", props: { children: "daliso.com" } },
                          ...(post.readingTime
                            ? [
                                {
                                  type: "span",
                                  props: {
                                    style: { margin: "0 10px" },
                                    children: "·",
                                  },
                                },
                                {
                                  type: "span",
                                  props: { children: post.readingTime },
                                },
                              ]
                            : []),
                        ],
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
        // Right column: hero photo
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "340px",
              padding: "56px 56px 56px 0",
            },
            children: [
              {
                type: "img",
                props: {
                  src: avatarDataUri,
                  width: 280,
                  height: 280,
                  style: {
                    borderRadius: "24px",
                    objectFit: "cover",
                    border: "3px solid #222222",
                  },
                },
              },
            ],
          },
        },
      ],
    },
  };

  const svg = await satori(markup, {
    width: 1200,
    height: 630,
    fonts: [
      { name: "Space Grotesk", data: spaceGrotesk, weight: 700, style: "normal" },
      { name: "Inter", data: inter, weight: 400, style: "normal" },
    ],
  });

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
}
