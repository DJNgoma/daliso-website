import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const imagesRoot = path.join(repoRoot, "assets", "images");

export async function buildHomepageAssets() {
  await Promise.all([
    sharp(path.join(imagesRoot, "logo-160.png"))
      .resize(120, 120, { fit: "contain" })
      .webp({ quality: 82, alphaQuality: 90 })
      .toFile(path.join(imagesRoot, "logo-120.webp")),
    sharp(path.join(imagesRoot, "hero-320.jpg"))
      .webp({ quality: 72 })
      .toFile(path.join(imagesRoot, "hero-320.webp")),
    sharp(path.join(imagesRoot, "hero-640.jpg"))
      .webp({ quality: 72 })
      .toFile(path.join(imagesRoot, "hero-640.webp")),
  ]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  await buildHomepageAssets();
}
