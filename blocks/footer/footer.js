import { readBlockConfig } from '../../scripts/scripts.js';

function decorateFooter(footer, config) {
  const divClasses = Object.keys(config);
  divClasses.forEach((divClass, i) => {
    const div = footer.children[i];
    if (div) {
      const wrapClasses = config[divClass];
      div.classList.add(`footer-${divClass}`);
      const h3s = [...div.querySelectorAll('h3')];
      const uls = [...div.querySelectorAll('ul')];
      wrapClasses.forEach((wrapClass, j) => {
        const wrap = document.createElement('div');
        wrap.classList.add(`footer-${wrapClass}`);
        wrap.style.gridArea = wrapClass;
        div.insertBefore(wrap, h3s[j]);
        wrap.append(h3s[j]);
        wrap.append(uls[j]);
      });
    }
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The header block element
 */

export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  const footerPath = cfg.footer || '/footer';
  const resp = await fetch(`${footerPath}.plain.html`);
  const html = await resp.text();
  const footer = document.createElement('div');
  footer.innerHTML = html;
  decorateFooter(footer, {
    about: [],
    sitemap: ['story', 'total', 'community', 'who', 'related', 'connect'],
    legal: [],
  });

  block.append(footer);
}
