// js/carousel.js

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.querySelector('.featured-carousel');

  if (!carousel) return;

  // Enable horizontal scroll with touch & mouse
  carousel.style.overflowX = 'auto';
  carousel.style.scrollSnapType = 'x mandatory';
  carousel.style.scrollBehavior = 'smooth';

  carousel.querySelectorAll('.featured-item').forEach(item => {
    item.style.scrollSnapAlign = 'start';
    item.style.minWidth = '260px';
    item.style.flex = '0 0 auto';
  });

  // Optional: Allow mouse dragging
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