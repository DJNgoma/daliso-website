import './main.js';

async function init() {
  const heroMetrics = document.getElementById('hero-metrics');
  const summaryGrid = document.getElementById('summary-grid');
  const catalogSections = document.getElementById('catalog-sections');
  try {
    const moduleUrl = new URL(import.meta.url);
    const cacheKey = moduleUrl.searchParams.get('v') || String(Date.now());
    const dataUrl = new URL('./projects-data.json', moduleUrl);
    dataUrl.searchParams.set('v', cacheKey);

    const response = await fetch(dataUrl.href, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Projects data request failed with status ${response.status}`);
    }

    const { generatedAt, projectCatalog, projectSections, source } = await response.json();

    const groupedSections = projectSections
      .map((section) => ({
        ...section,
        projects: projectCatalog
          .filter((project) => project.category === section.id)
          .sort((left, right) => getProjectOrder(left) - getProjectOrder(right) || left.title.localeCompare(right.title)),
      }))
      .filter((section) => section.projects.length > 0);
    const sectionTitleById = new Map(projectSections.map((section) => [section.id, section.title]));
    const liveLinks = [];
    const liveProjects = [];
    const productsAndCommerce = projectCatalog.filter((project) => project.category === 'products-commerce');
    const internalSystems = projectCatalog.filter((project) => project.category === 'internal-systems');

    projectCatalog.forEach((project) => {
      const links = getProjectLinks(project);
      const hasLiveLink = links.some((link) => link.kind === 'live');

      if (hasLiveLink) {
        liveProjects.push(project);
      }

      links.forEach((link) => {
        if (link.kind === 'live') {
          liveLinks.push(link);
        }
      });
    });

    renderHeroMetrics();
    renderSummaryCards();
    renderCatalogSections();

    function renderHeroMetrics() {
      const metrics = [
        { label: 'Featured projects', value: projectCatalog.length },
        { label: 'Categories', value: groupedSections.length },
        { label: 'Live links', value: liveLinks.length },
        { label: 'Last sync', value: formatMetricDate(generatedAt) },
      ];

      heroMetrics.innerHTML = metrics
        .map(
          (metric) => `
            <article class="metric-card">
              <strong>${metric.value}</strong>
              <span>${metric.label}</span>
            </article>
          `
        )
        .join('');
    }

    function renderSummaryCards() {
      const summaryCards = [
        {
          tone: 'live',
          title: 'Live on the web',
          body: `${liveProjects.length} featured projects currently point to public destinations.`,
          items: liveProjects.map((project) => project.title),
        },
        {
          tone: 'builder',
          title: 'Products and commerce',
          body: `${productsAndCommerce.length} active builds span finance, retail tooling, product discovery, and operational workflows.`,
          items: productsAndCommerce.map((project) => project.title),
        },
        {
          tone: 'systems',
          title: 'Internal systems',
          body: `${internalSystems.length} portfolio entries support operators, routing, aliases, and repo hygiene behind the scenes.`,
          items: internalSystems.map((project) => project.title),
        },
        {
          tone: 'sync',
          title: 'Curated from Developer',
          body: `Last synced ${formatDate(generatedAt)} from the current ${escapeHtml(getSourceLabel(source))}.`,
          items: [
            `${projectCatalog.length} portfolio projects selected from the live workspace`,
            `${groupedSections.length} curated categories`,
            `${liveLinks.length} public links configured in the checked-in manifest`,
          ],
        },
      ];

      summaryGrid.innerHTML = summaryCards
        .map(
          (card) => `
            <article class="summary-card">
              <span class="tone-pill ${card.tone}">${card.tone}</span>
              <h3>${card.title}</h3>
              <p>${card.body}</p>
              <ul>${card.items.map((item) => `<li>${item}</li>`).join('')}</ul>
            </article>
          `
        )
        .join('');
    }

    function renderCatalogSections() {
      catalogSections.innerHTML = groupedSections
        .map(
          (section) => `
            <section class="catalog-group" data-category="${escapeHtml(section.id)}">
              <div class="catalog-group-header">
                <h3>${escapeHtml(section.title)}</h3>
                <p>${escapeHtml(section.description)}</p>
              </div>
              <div class="repo-grid">
                ${section.projects.map(renderProjectCard).join('')}
              </div>
            </section>
          `
        )
        .join('');
    }

    function renderProjectCard(project) {
      const categoryTitle = sectionTitleById.get(project.category) || project.category;
      const statusClass = statusToClassName(project.status);
      const links = getProjectLinks(project);

      return `
        <article class="repo-card" data-project="${escapeHtml(project.id)}">
          <div class="repo-card-header">
            <div>
              <h4>${escapeHtml(project.title)}</h4>
            </div>
            <span class="tone-pill ${statusClass}">${escapeHtml(project.status)}</span>
          </div>
          <p class="repo-summary">${escapeHtml(project.summary)}</p>
          <div class="meta-grid">
            <div class="meta-card">
              <strong>Category</strong>
              <span>${escapeHtml(categoryTitle)}</span>
            </div>
            <div class="meta-card">
              <strong>Last updated</strong>
              <time datetime="${escapeHtml(project.lastUpdated)}">${formatDate(project.lastUpdated)}</time>
            </div>
          </div>
          ${links.length ? `<div class="repo-footer">${renderProjectLinks(links)}</div>` : ''}
        </article>
      `;
    }
  } catch (error) {
    console.error('Failed to render projects page', error);
    renderFailureState(heroMetrics, summaryGrid, catalogSections);
  }
}

function renderProjectLinks(links) {
  return links
    .map(
      (link) => `
        <a
          class="repo-link"
          href="${escapeHtml(link.url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${escapeHtml(link.label)}
        </a>
      `
    )
    .join('');
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function formatMetricDate(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
  }).format(date);
}

function statusToClassName(status) {
  return String(status).trim().toLowerCase().replace(/\s+/g, '-');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getProjectLinks(project) {
  return Array.isArray(project.links) ? project.links : [];
}

function getProjectOrder(project) {
  return typeof project.order === 'number' ? project.order : 0;
}

function getSourceLabel(source) {
  return source && source.label ? source.label : 'workspace';
}

function renderFailureState(heroMetrics, summaryGrid, catalogSections) {
  if (heroMetrics) {
    heroMetrics.innerHTML = `
      <article class="metric-card">
        <strong>Unavailable</strong>
        <span>Projects data could not be loaded</span>
      </article>
    `;
  }

  if (summaryGrid) {
    summaryGrid.innerHTML = `
      <article class="summary-card">
        <span class="tone-pill high">error</span>
        <h3>Projects page unavailable</h3>
        <p>The synced portfolio data could not be loaded in this browser. Try reloading the page or serving the site locally over HTTP.</p>
      </article>
    `;
  }

  if (catalogSections) {
    catalogSections.innerHTML = '';
  }
}

init();
