document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  if (!animatedElements.length) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const supportsIntersectionObserver = 'IntersectionObserver' in window;

  if (prefersReducedMotion || !supportsIntersectionObserver) {
    animatedElements.forEach(el => {
      el.classList.add('visible');
    });
    return;
  }

  const revealOffset = 200;
  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0, rootMargin: `0px 0px ${revealOffset}px 0px` }
  );

  animatedElements.forEach(el => {
    // Only hide elements after the observer is active so content stays readable if JS fails.
    const rect = el.getBoundingClientRect();
    const isNearViewport = rect.top <= window.innerHeight + revealOffset;

    el.classList.add('visible');

    if (isNearViewport) {
      return;
    }

    el.classList.remove('visible');
    el.classList.add('scroll-reveal');
    observer.observe(el);
  });
});
