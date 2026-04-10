import { renderNavMenu } from './modules/nav-menu.js?v=20260410-navfix';
import './modules/nav.js?v=20260410-navfix';
import './modules/theme.js?v=20260410-navfix';
import './modules/scroll.js?v=20260410-navfix';

renderNavMenu();

if (document.querySelector('.featured-carousel')) {
  import('./modules/carousel-scroll.js?v=20260410-navfix');
}
