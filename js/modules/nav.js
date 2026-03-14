document.addEventListener('DOMContentLoaded', function () {
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-menu');
  if (!hamburger || !navMenu) return;

  const navLinks = navMenu.querySelectorAll('a');

  function openMenu() {
    navMenu.classList.add('show');
    hamburger.setAttribute('aria-expanded', 'true');
    navLinks[0]?.focus();
  }

  function closeMenu() {
    navMenu.classList.remove('show');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'nav-menu');

  hamburger.addEventListener('click', function () {
    const isOpen = navMenu.classList.contains('show');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu on link click (mobile UX)
  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navMenu.classList.contains('show')) {
      closeMenu();
      hamburger.focus();
    }
  });

  // Trap focus within menu when open
  navMenu.addEventListener('keydown', function (e) {
    if (e.key !== 'Tab' || !navMenu.classList.contains('show')) return;

    const firstLink = navLinks[0];
    const lastLink = navLinks[navLinks.length - 1];

    if (e.shiftKey && document.activeElement === firstLink) {
      e.preventDefault();
      lastLink.focus();
    } else if (!e.shiftKey && document.activeElement === lastLink) {
      e.preventDefault();
      firstLink.focus();
    }
  });
});
