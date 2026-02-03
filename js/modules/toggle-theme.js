// js/toggle-theme.js

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('theme-toggle');
  const logo = document.getElementById('site-logo');

  if (!toggleBtn || !logo) {
    console.error('Theme toggle button or logo image not found.');
    return;
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    logo.src = theme === 'dark' ? 'assets/images/logo_white-160.png' : 'assets/images/logo-160.png';
    localStorage.setItem('theme', theme);
  }

  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  toggleBtn.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });
});
