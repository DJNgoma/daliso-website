// js/toggle-theme.js

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  const logo = document.getElementById('site-logo');

  if (!toggleBtn || !logo) return;

  const basePath = logo.src.substring(0, logo.src.lastIndexOf('/') + 1);
  const logoLight = basePath + 'logo-160.png';
  const logoDark = basePath + 'logo_white-160.png';

  function getStored(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function setStored(key, value) {
    try { localStorage.setItem(key, value); } catch { /* private browsing */ }
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    logo.src = theme === 'dark' ? logoDark : logoLight;
    setStored('theme', theme);
  }

  const savedTheme = getStored('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
});
