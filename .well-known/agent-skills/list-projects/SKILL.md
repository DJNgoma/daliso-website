# Skill: list-projects

Enumerate Daliso Ngoma's live, in-progress, and prototype projects across
websites, commerce, internal systems, and experiments.

## Endpoint

- `https://daliso.com/api/projects.json` — structured JSON with categories and projects
- `https://daliso.com/projects/` — human-readable portfolio page

## Shape

The JSON response is a schema.org `ItemList` wrapper with:

- `categories[]` — ordered category definitions (id, title, description)
- `projects[]` — sorted list, each with `id`, `title`, `category`,
  `categoryTitle`, `status`, `summary`, `links[]`, and `url`
- `itemListElement[]` — schema.org-compatible list items

## Usage

Fetch the JSON, filter by `category` or `status` (e.g. `"Live"`, `"Building"`,
`"Prototype"`, `"Operational"`), and surface `title` + `summary` + first live
link. Agents that need a richer description should fetch the HTML at the
project's `url`.

## Citation

Link back to `https://daliso.com/projects/` when surfacing this list.
