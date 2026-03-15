const NAV_ITEMS = [
  { label: 'About', hash: '#about' },
  { label: 'Work', hash: '#work' },
  { label: 'Projects', path: 'projects/' },
  { label: 'Podcast', hash: '#podcast' },
  { label: 'Blog', path: 'blog/' },
];

export function renderNavMenu(basePath = '') {
  const menu = document.getElementById('nav-menu');
  if (!menu) return;

  menu.innerHTML = NAV_ITEMS.map((item) => {
    const href = item.path
      ? `${basePath}${item.path}`
      : `${basePath}${item.hash}`;
    return `<li><a href="${href}">${item.label}</a></li>`;
  }).join('');
}
