import './main.js';

const attentionRank = {
  High: 0,
  Medium: 1,
  Watch: 2,
  Low: 3,
};

async function init() {
  const dataUrl = new URL('./projects-data.json', import.meta.url).href;
  const response = await fetch(dataUrl);
  const { generatedAt, projectCatalog, projectSections } = await response.json();

  const heroMetrics = document.getElementById('hero-metrics');
  const summaryGrid = document.getElementById('summary-grid');
  const catalogSections = document.getElementById('catalog-sections');

  const trackedProjects = projectCatalog.filter((project) => project.trackingState === 'tracked');
  const untrackedProjects = projectCatalog.filter((project) => project.trackingState === 'untracked');
  const publicRepos = projectCatalog.filter((project) => project.repo.kind === 'public');
  const highAttention = projectCatalog.filter((project) => project.attention === 'High');
  const totalCommits = projectCatalog.reduce((sum, project) => sum + (project.commitCount || 0), 0);

  renderHeroMetrics();
  renderSummaryCards();
  renderCatalogSections();

  function renderHeroMetrics() {
    const metrics = [
      { label: 'Projects in snapshot', value: projectCatalog.length },
      { label: 'Tracked by git', value: trackedProjects.length },
      { label: 'Public repos', value: publicRepos.length },
      { label: 'Known commits', value: totalCommits.toLocaleString() },
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
        tone: 'high',
        title: 'Projects not tracked by git',
        body: `${untrackedProjects.length} projects currently sit outside version control.`,
        items: untrackedProjects.map((project) => project.workspace),
      },
      {
        tone: 'high',
        title: 'High-attention projects',
        body: `${highAttention.length} projects need cleanup, version control, or clearer runtime wiring.`,
        items: highAttention.map((project) => project.workspace),
      },
      {
        tone: 'watch',
        title: 'Public repo footprint',
        body: `${publicRepos.length} projects currently expose a public repository link.`,
        items: publicRepos.map((project) => project.name),
      },
      {
        tone: 'low',
        title: 'Snapshot generated',
        body: formatDate(generatedAt),
        items: [
          `${trackedProjects.length} tracked projects`,
          `${untrackedProjects.length} untracked projects`,
          `${totalCommits.toLocaleString()} known commits across tracked histories`,
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
    const grouped = projectSections.map((section) => {
      const projects = projectCatalog
        .filter((project) => project.category === section.id)
        .sort((left, right) => {
          const attentionDiff = attentionRank[left.attention] - attentionRank[right.attention];
          if (attentionDiff !== 0) return attentionDiff;
          return left.name.localeCompare(right.name);
        });

      return { ...section, projects };
    });

    catalogSections.innerHTML = grouped
      .map(
        (section) => `
          <section class="catalog-group">
            <div class="catalog-group-header">
              <h3>${section.title}</h3>
              <p>${section.description}</p>
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
    const commitLabel =
      project.commitCount === null
        ? 'Not tracked'
        : `${project.commitCount.toLocaleString()} ${project.commitCount === 1 ? 'commit' : 'commits'}`;

    return `
      <article class="repo-card">
        <div class="repo-card-header">
          <div>
            <h4>${project.name}</h4>
            <p class="workspace-label">${project.workspace}</p>
          </div>
          <span class="tone-pill ${project.attention.toLowerCase()}">${project.attention}</span>
        </div>
        <p class="repo-summary">${project.summary}</p>
        <div class="meta-grid">
          <div class="meta-card">
            <strong>Last updated</strong>
            <time datetime="${project.lastUpdated}">${formatDate(project.lastUpdated)}</time>
          </div>
          <div class="meta-card">
            <strong>Commit count</strong>
            <span>${commitLabel}</span>
          </div>
        </div>
        <div class="details-list">
          <div class="detail-row">
            <strong>Web status</strong>
            <span>${project.webLabel}</span>
          </div>
          <div class="detail-row">
            <strong>Run</strong>
            <span>${escapeHtml(project.run)}</span>
          </div>
          <div class="detail-row">
            <strong>Tooling</strong>
            <span>${project.tooling}</span>
          </div>
          <div class="detail-row">
            <strong>Tracking</strong>
            <span>${project.tracking}</span>
          </div>
          <div class="detail-row">
            <strong>Attention</strong>
            <span>${project.attentionDetail}</span>
          </div>
        </div>
        <div class="repo-footer">
          ${renderRepoBadge(project.repo)}
        </div>
      </article>
    `;
  }
}

function renderRepoBadge(repo) {
  if (repo.kind === 'public' && repo.url) {
    return `<a class="repo-status public repo-link" href="${repo.url}" target="_blank" rel="noopener noreferrer">${repo.label}</a>`;
  }

  return `<span class="repo-status ${repo.kind}">${repo.label}</span>`;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

init();
