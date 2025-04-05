let scrollIndex = 0;

function scrollCarousel(direction) {
  const track = document.querySelector('.carousel-track');
  const scrollAmount = 240;
  track.scrollBy({
    left: direction * scrollAmount,
    behavior: 'smooth'
  });
}

setInterval(() => scrollCarousel(1), 5000);