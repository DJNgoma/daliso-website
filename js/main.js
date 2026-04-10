import { renderNavMenu } from './modules/nav-menu.js?v=20260410-cachefix';
import './modules/nav.js?v=20260410-cachefix';
import './modules/theme.js?v=20260410-cachefix';
import './modules/scroll.js?v=20260410-cachefix';

renderNavMenu();

if (document.querySelector('.featured-carousel')) {
  import('./modules/carousel-scroll.js?v=20260410-cachefix');
}
