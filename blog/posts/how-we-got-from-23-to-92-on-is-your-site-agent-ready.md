---
title: "How We Got from 23 to 92 on Is Your Site Agent-Ready"
slug: "how-we-got-from-23-to-92-on-is-your-site-agent-ready"
description: "How daliso.com moved from 23 to 92 on isitagentready.com by adding truthful machine-readable surfaces rather than just chasing frontend performance."
author: "Daliso Ngoma"
date: "2026-04-22T03:03:17+02:00"
tags:
  - Agents
  - Web
  - Standards
  - Systems
  - Performance
origin: "human"
showOriginLabel: false
---

# How We Got from 23 to 92 on Is Your Site Agent-Ready

A few weeks ago I wrote about why this site tends to score well in PageSpeed Insights.

That post was about performance discipline: small static pages, minimal JavaScript, and very little third-party drag.

This post is about a different scoreboard.

[isitagentready.com](https://isitagentready.com) does not ask whether a site is fast for humans. It asks whether a software agent can figure out what the site is, what it exposes, and how to consume it.

The first time I ran it against [daliso.com](https://daliso.com), the result came back as `23`.

A few focused sessions later, the same check came back as `92`, Level 5: Agent-Native.

The score moved because I added truthful machine-readable surfaces, not because I optimized frontend performance. That distinction matters.

## Why 23 Was Not a Surprise

I was not especially surprised by the starting point. I had already seen the same pattern elsewhere: decent content hygiene, weak agent-discovery surfaces.

In my own work, more discovery is starting inside AI assistants rather than a classic search page. That changes the question from "can a human browse this?" to "can a program understand this without improvising?"

This site already had some of the older web basics in place. What it lacked was the newer layer: machine-readable entry points, discovery metadata, and an explicit policy about how AI systems may use the content.

## Two Scoreboards, Two Very Different Questions

PageSpeed asks whether a browser can render the page quickly and cleanly.

Agent-readiness asks whether a client landing on the domain can discover the site's content, policy, and interfaces without a human driving.

A site can be excellent at the first and mute on the second.

That is where this site started.

## What the 100s Were Quietly Covering Even at 23

The interesting thing about the 23 is that two of the four sub-scores were already at 100 from the start.

Discoverability: 100.
Content: 100.

Those were not the product of any recent agent-specific work. They came from earlier habits that were already useful for accessibility and SEO.

The site has a real `sitemap.xml`, generated from the blog pipeline rather than hand maintained. It has a canonical URL on every page. It has a valid `robots.txt`. It has a PWA manifest. It has structured data in the markup, not bolted on via a plugin. It has semantic HTML, skip links, labeled controls, alt text, and a document that reads sensibly in the absence of CSS.

The same authoring discipline that helps screen readers and search engines also helps agents.

The overall score of 23 was not because the site was invisible. It was because the machine-readable layer around the content was still thin.

## The Build That Moved the Number, 23 to 83

The jump from 23 to 83 was not a single trick. It came from adding a real set of agent-facing surfaces.

First, I added cleaner content representations:

- `llms.txt` and `llms-full.txt`
- Atom and JSON feeds for the blog
- `/api/projects.json` as a structured project ledger
- per-post `plaintext.txt` endpoints
- Markdown representations generated alongside the HTML

Second, I added discovery metadata so those surfaces were actually findable:

- a richer JSON-LD graph on the homepage
- `/.well-known/api-catalog`
- `/.well-known/agent-skills/index.json` and four concrete `SKILL.md` entries
- `/.well-known/mcp/server-card.json`
- `/.well-known/oauth-protected-resource`
- `Link` headers in `_headers` advertising the important endpoints

Third, I tightened the agent-facing affordances:

- named AI crawlers with explicit `Allow` rules in `robots.txt`
- WebMCP tools exposed on the homepage via `navigator.modelContext.provideContext()`

That was the substantive part of the work. It raised the discovery and API-facing surfaces of the site because agents now had structured places to start, not just HTML to scrape.

Just as important, each of those files points at something real. If an agent follows the catalog, link headers, or skills index, it reaches a valid resource rather than placeholder metadata.

## The One Line That Closed the Gap, 83 to 92

The sub-score that moved last was Bot Access Control, 50 to 100.

The change was one line in `robots.txt`:

```
Content-Signal: ai-train=yes, search=yes, ai-input=yes
```

That line, in the [Content Signals](https://contentsignals.org) proposal, says three things explicitly.

It says search engines are welcome to index the content. It says AI systems can use it as live input for answering a user's question, with attribution. It says AI systems are also welcome to train on this content.

For this site, that is the honest policy. It is a public portfolio and writing surface meant to be read, indexed, and cited.

That will not be the right policy for every domain. Some sites should absolutely choose more restrictive defaults. The point is not permissiveness for its own sake. The point is to publish the policy that matches the actual intent of the site.

Before this line existed, the site said nothing explicit about AI use. The checker treated that silence as an unresolved gap.

## The Remaining 8 Points, Honestly

The only sub-score still short is API, Auth, MCP and Skill Discovery, sitting at 5 of 6. The specific check that fails is OAuth or OIDC discovery metadata: the checker wants `/.well-known/openid-configuration` or `/.well-known/oauth-authorization-server`.

There isn't one.

This site has no login, no token issuer, no session state, no accounts, and no protected API. The Protected Resource document already says so. Publishing discovery metadata anyway would advertise endpoints and trust relationships that do not exist.

If this site later grows an authenticated surface, that metadata becomes worth adding. Until then, the missing file is the correct file to be missing.

Agent-readiness is a measurement, not a checklist to game. A truthful 92 with one standards-compliant gap is better than a 100 patched together with metadata that lies about what is there.

## How This Compares to the PageSpeed Write-Up

The previous post made a simple argument: performance wins often start with what you choose not to build.

PageSpeed rewards restraint. Less JavaScript, fewer third parties, smaller payloads, simpler DOM. You score well by doing less of the wrong things.

Agent-readiness rewards articulation. The site has to say what it is, in a form a machine can parse. Sitemaps. Structured data. Canonical URLs. Feeds. API catalogs. Skill indexes. Content preferences. Discovery documents where relevant. You score well by saying more of the right things, in the right format, but only when those things are true.

The two scoreboards are not in conflict. The restraint that keeps PageSpeed high, static pages, clean markup, no hydration, very little third-party noise, also makes the site easier for an agent to parse in the first place.

But they are not identical either. A site can score 100 on PageSpeed and still be invisible to agents, because rendering fast is not the same as being understood.

The effort curve is different, though. Most of the journey from 23 to 83 was substantive work: new files, new endpoints, and real structured metadata. Once that was in place, a single line in `robots.txt` closed the last visible gap and added nine points.

## What This Means for Everyone Else

If you are running a small site, especially a personal one, there are a few straightforward takeaways.

Most of the "baseline" work to become agent-ready is already done if you have been doing SEO and accessibility properly. You almost certainly have a sitemap. You almost certainly have a `robots.txt`. You probably have canonical URLs and some structured data. That is what kept [daliso.com](https://daliso.com)'s Discoverability and Content sub-scores at 100 even while the overall score was 23.

The next layer is not magical. It is mostly about publishing honest, structured surfaces: `llms.txt`, feeds, machine-readable ledgers, `/.well-known` discovery files, link headers, and an explicit policy instead of silence.

The harder rule is the more important one: do not publish metadata for systems you do not actually run. Discovery documents are promises. Broken promises are worse than missing ones.

## Final Thought

Going from 23 to 92 was not about gaming a checker. It was about making the site more legible without lying about its capabilities.

Most of the improvement came from publishing real machine-readable surfaces. The last jump came from stating the content policy plainly. The remaining gap is there because the site does not do auth, and saying otherwise would be false.

That is the lesson I trust here.

Build something small. Describe it clearly. Do not pretend.
