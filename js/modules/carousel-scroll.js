document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.featured-carousel');
  if (!carousel) return;

  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-label', 'Featured projects');
  carousel.tabIndex = 0;

  carousel.style.overflowX = 'auto';
  carousel.style.scrollSnapType = 'x mandatory';
  carousel.style.scrollBehavior = 'smooth';

  carousel.querySelectorAll('.featured-item').forEach(item => {
    item.style.scrollSnapAlign = 'start';
    item.style.minWidth = '260px';
    item.style.flex = '0 0 auto';
  });

  // Keyboard navigation
  carousel.addEventListener('keydown', (e) => {
    const scrollAmount = 280;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      carousel.scrollLeft += scrollAmount;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      carousel.scrollLeft -= scrollAmount;
    }
  });

  // Mouse dragging
  let isDown = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.classList.add('dragging');
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
  });

  carousel.addEventListener('mouseleave', () => {
    isDown = false;
    carousel.classList.remove('dragging');
  });

  carousel.addEventListener('mouseup', () => {
    isDown = false;
    carousel.classList.remove('dragging');
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5;
    carousel.scrollLeft = scrollLeft - walk;
  });
});
