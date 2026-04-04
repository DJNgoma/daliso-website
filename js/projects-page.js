import './main.js?v=20260403-perf';

async function init() {
  const heroMetrics = document.getElementById('hero-metrics');
  const featuredGrid = document.getElementById('featured-grid');
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

    const { generatedAt, projectCatalog, projectSections } = await response.json();

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
    const recentProjects = [...projectCatalog]
      .sort(
        (left, right) =>
          new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime() ||
          left.title.localeCompare(right.title)
      )
      .slice(0, 4);

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
    renderFeaturedGrid();
    renderSummaryCards();
    renderCatalogSections();
    initFilterBar();

    function renderHeroMetrics() {
      const metrics = [
        { label: 'Featured projects', value: projectCatalog.length },
        { label: 'Categories', value: groupedSections.length },
        { label: 'Live links', value: liveLinks.length },
        { label: 'Last refresh', value: formatMetricDate(generatedAt) },
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

    function renderFeaturedGrid() {
      if (!featuredGrid) {
        return;
      }

      const featured = projectCatalog.filter((project) => project.featured === true);
      if (featured.length === 0) {
        featuredGrid.closest('section')?.remove();
        return;
      }

      featuredGrid.innerHTML = featured
        .map((project) => renderProjectCard(project, { featured: true }))
        .join('');
    }

    function renderSummaryCards() {
      const summaryCards = [
        {
          tone: 'live',
          title: 'Live on the web',
          body: `${liveProjects.length} featured projects currently point to public destinations.`,
        },
        {
          tone: 'builder',
          title: 'Products and commerce',
          body: `${productsAndCommerce.length} active builds span finance, retail tooling, product discovery, and operational workflows.`,
        },
        {
          tone: 'systems',
          title: 'Internal systems',
          body: `${internalSystems.length} portfolio entries support operators, routing, aliases, and repo hygiene behind the scenes.`,
        },
        {
          tone: 'sync',
          title: 'Portfolio curation',
          body: `Last refreshed ${formatDate(generatedAt)} for the public portfolio.`,
          items: [
            `${projectCatalog.length} projects featured in the public portfolio`,
            `${groupedSections.length} curated categories`,
            `${liveLinks.length} public links across selected work`,
          ],
        },
        {
          tone: 'watch',
          title: 'Recent movement',
          body: `${recentProjects.length} projects currently lead the portfolio by most recent public update.`,
          items: recentProjects.map(
            (project) => `${project.title} · ${formatMetricDate(project.lastUpdated)}`
          ),
        },
      ];

      summaryGrid.innerHTML = summaryCards
        .map(
          (card) => `
            <article class="summary-card">
              <span class="tone-pill ${card.tone}">${card.tone}</span>
              <h3>${card.title}</h3>
              <p>${card.body}</p>
              ${card.items ? `<ul>${card.items.map((item) => `<li>${item}</li>`).join('')}</ul>` : ''}
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

    function initFilterBar() {
      const filterPills = document.getElementById('filter-pills');
      if (!filterPills) return;

      const liveProjectIds = new Set(liveProjects.map((p) => p.id));
      const recentProjectIds = new Set(recentProjects.map((p) => p.id));

      const filterSets = {
        all: null,
        live: { mode: 'projects', ids: liveProjectIds },
        builder: { mode: 'category', category: 'products-commerce' },
        systems: { mode: 'category', category: 'internal-systems' },
        recent: { mode: 'projects', ids: recentProjectIds },
      };

      filterPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.filter-pill');
        if (!pill) return;

        const filterKey = pill.dataset.filter;

        filterPills.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('filter-pill--active'));
        pill.classList.add('filter-pill--active');

        if (filterKey === 'all' || !filterSets[filterKey]) {
          clearFilter();
        } else {
          applyFilter(filterSets[filterKey]);
        }

        catalogSections.closest('section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      function applyFilter(spec) {
        const groups = catalogSections.querySelectorAll('.catalog-group');

        groups.forEach((group) => {
          if (spec.mode === 'category') {
            group.classList.toggle('catalog-group--hidden', group.dataset.category !== spec.category);
            group.querySelectorAll('.repo-card').forEach((c) => c.classList.remove('repo-card--hidden'));
          } else {
            let visibleCount = 0;
            group.querySelectorAll('.repo-card').forEach((card) => {
              const projectId = card.dataset.project;
              const hidden = !spec.ids.has(projectId);
              card.classList.toggle('repo-card--hidden', hidden);
              if (!hidden) visibleCount++;
            });
            group.classList.toggle('catalog-group--hidden', visibleCount === 0);
          }
        });
      }

      function clearFilter() {
        catalogSections.querySelectorAll('.catalog-group').forEach((g) => g.classList.remove('catalog-group--hidden'));
        catalogSections.querySelectorAll('.repo-card').forEach((c) => c.classList.remove('repo-card--hidden'));
      }
    }

    function renderProjectCard(project, options = {}) {
      const categoryTitle = sectionTitleById.get(project.category) || project.category;
      const statusClass = statusToClassName(project.status);
      const links = getProjectLinks(project);
      const modifierClass = options.compact ? ' repo-card-compact' : options.featured ? ' repo-card-featured' : '';

      return `
        <article class="repo-card${modifierClass}" data-project="${escapeHtml(project.id)}">
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
    .map((link) => {
      if (link.kind === 'appstore') {
        return `
          <a
            class="repo-link repo-link-badge"
            href="${escapeHtml(link.url)}"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/assets/images/badge-app-store.svg" alt="${escapeHtml(link.label)}" height="40" />
          </a>
        `;
      }
      return `
        <a
          class="repo-link"
          href="${escapeHtml(link.url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          ${escapeHtml(link.label)}
        </a>
      `;
    })
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
        <p>The portfolio data could not be loaded in this browser. Try reloading the page or serving the site locally over HTTP.</p>
      </article>
    `;
  }

  if (catalogSections) {
    catalogSections.innerHTML = '';
  }
}

init();
