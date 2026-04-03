// js/theme.js

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');

  if (!toggleBtn) return;

  function getStored(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }

  function setStored(key, value) {
    try { localStorage.setItem(key, value); } catch { /* private browsing */ }
  }

  function updateToggleState(theme) {
    const isDark = theme === 'dark';
    const nextMode = isDark ? 'light' : 'dark';
    const label = `Switch to ${nextMode} mode`;

    toggleBtn.setAttribute('aria-pressed', String(isDark));
    toggleBtn.setAttribute('aria-label', label);
    toggleBtn.setAttribute('title', label);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateToggleState(theme);
  }

  const savedTheme = getStored('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme =
    document.documentElement.getAttribute('data-theme') ||
    savedTheme ||
    (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  toggleBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const nextTheme = current === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    setStored('theme', nextTheme);
  });
});
