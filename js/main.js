import { renderNavMenu } from './modules/nav-menu.js';
import './modules/nav.js';
import './modules/theme.js';
import './modules/scroll.js';

const basePath = document.querySelector('meta[name="base-path"]')?.content || '';
renderNavMenu(basePath);

if (document.querySelector('.featured-carousel')) {
  import('./modules/carousel-scroll.js');
}
