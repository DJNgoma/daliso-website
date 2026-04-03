import { buildBlog, scaffoldDraft } from "./blog-lib.mjs";

main();

async function main() {
  const [command, ...args] = process.argv.slice(2);

  try {
    if (command === "build") {
      const result = await buildBlog();
      console.log(
        `Built blog with ${result.posts.length} published post${result.posts.length === 1 ? "" : "s"}.`
      );
      console.log(`Index: ${result.paths.blogRoot}/index.html`);
      if (result.latestPost) {
        console.log(`Latest article: ${result.paths.blogRoot}/${result.latestPost.slug}/index.html`);
      }
      console.log(`Sitemap: ${result.paths.sitemapPath}`);
      return;
    }

    if (command === "new") {
      const { title } = parseCommandArgs(args);
      if (!title) {
        throw new Error('Missing --title. Example: npm run new:post -- --title "Post Title"');
      }

      const result = scaffoldDraft({ title });
      console.log(`Created draft: ${result.path}`);
      return;
    }

    throw new Error(
      'Unknown command. Use "build" or "new". Example: npm run new:post -- --title "Post Title"'
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function parseCommandArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    if (current === "--title") {
      parsed.title = args[index + 1];
      index += 1;
    }
  }

  return parsed;
}
