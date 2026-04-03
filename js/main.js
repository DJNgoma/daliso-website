import { renderNavMenu } from './modules/nav-menu.js?v=20260403-perf';
import './modules/nav.js?v=20260403-perf';
import './modules/theme.js?v=20260403-perf';
import './modules/scroll.js?v=20260403-perf';

renderNavMenu();

if (document.querySelector('.featured-carousel')) {
  import('./modules/carousel-scroll.js?v=20260403-perf');
}
