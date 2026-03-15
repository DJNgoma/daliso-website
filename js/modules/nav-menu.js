const NAV_ITEMS = [
  { label: 'Home', path: '' },
  { label: 'About', hash: '#about' },
  { label: 'Work', hash: '#work' },
  { label: 'Podcast', hash: '#podcast' },
  { label: 'Projects', path: 'projects/' },
  { label: 'Blog', path: 'blog/' },
];

export function renderNavMenu(basePath = '') {
  const menu = document.getElementById('nav-menu');
  if (!menu) return;

  menu.innerHTML = NAV_ITEMS.map((item) => {
    const href = 'path' in item
      ? `${basePath}${item.path}`
      : `${basePath}${item.hash}`;
    return `<li><a href="${href}">${item.label}</a></li>`;
  }).join('');
}
