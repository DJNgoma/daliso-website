const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/#about' },
  { label: 'Work', href: '/#work' },
  { label: 'Podcast', href: '/#podcast' },
  { label: 'Projects', href: '/projects/' },
  { label: 'Blog', href: '/blog/' },
];

export function renderNavMenu() {
  const menu = document.getElementById('nav-menu');
  if (!menu) return;

  menu.innerHTML = NAV_ITEMS.map((item) =>
    `<li><a href="${item.href}">${item.label}</a></li>`
  ).join('');
}
