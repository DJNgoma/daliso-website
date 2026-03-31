import { renderNavMenu } from './modules/nav-menu.js?v=20260331';
import './modules/nav.js?v=20260331';
import './modules/theme.js?v=20260331';
import './modules/scroll.js?v=20260331';

renderNavMenu();

if (document.querySelector('.featured-carousel')) {
  import('./modules/carousel-scroll.js?v=20260331');
}
