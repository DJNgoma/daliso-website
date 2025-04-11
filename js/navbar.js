// js/navbar.js

document.addEventListener('DOMContentLoaded', function () {
  const toggleButton = document.getElementById('hamburger-toggle');
  const navMenu = document.getElementById('nav-menu');

  toggleButton.addEventListener('click', function () {
    navMenu.classList.toggle('show');
  });

  // Optional: Close menu on link click (mobile UX)
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('show');
    });
  });
});