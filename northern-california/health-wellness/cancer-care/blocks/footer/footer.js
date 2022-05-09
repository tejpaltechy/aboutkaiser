import { readBlockConfig, decorateIcons, decorateLanguage } from '../../scripts/scripts.js';

function closeMenu(el) {
  el.setAttribute('aria-expanded', false);
}

function openMenu(el) {
  el.setAttribute('aria-expanded', true);
}

function toggleMenu(e) {
  const button = e.target.closest('[role=button]');
  const expanded = button.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    closeMenu(button);
  } else {
    openMenu(button);
  }
}

function onMediaChange() {
  const mq = window.matchMedia('(min-width: 600px)');
  if (mq.matches) {
    document.querySelectorAll('.footer-links-item-title').forEach((heading) => {
      heading.removeAttribute('tabindex');
      // window.removeEventListener('keydown', this.toggleOnKey);
      // window.removeEventListener('keydown', this.toggleOnKey);
      heading.setAttribute('aria-expanded', true);
      heading.removeEventListener('click', toggleMenu);
    });
  } else {
    document.querySelectorAll('.footer-links-item-title').forEach((heading) => {
      heading.setAttribute('tabindex', 0);
      // heading.addEventListener('focus', () => {
      //   window.addEventListener('keydown', this.toggleOnKey);
      // });
      // heading.addEventListener('blur', () => {
      //   window.removeEventListener('keydown', this.toggleOnKey);
      // });
      heading.setAttribute('aria-expanded', false);
      heading.addEventListener('click', toggleMenu);
    });
  }
}

function decorateLinks(section) {
  const headings = section.querySelectorAll('h2');
  const expanded = window.matchMedia('(min-width: 600px)');
  headings.forEach((heading) => {
    const item = document.createElement('div');
    item.classList.add('footer-links-item');
    const linksWrapper = heading.nextElementSibling;
    heading.classList.add('footer-links-item-title');
    if (heading.id !== 'language') {
      heading.setAttribute('role', 'button');
      heading.setAttribute('aria-expanded', expanded.matches);
      heading.setAttribute('aria-controls', `${heading.id}-menu`);
      linksWrapper.classList.add('footer-links-item-links');
      linksWrapper.setAttribute('id', `${heading.id}-menu`);
      if (!expanded.matches) { // not expanded
        heading.setAttribute('tabindex', 0);
        heading.addEventListener('click', toggleMenu);
      }
    }
    item.append(heading, linksWrapper);
    section.append(item);
  });
  window.addEventListener('resize', onMediaChange);
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
  const sections = ['links', 'social', 'list', 'copyright'];
  footer.querySelectorAll(':scope > div').forEach((section, i) => {
    section.classList.add(`footer-${sections[i]}`);
  });

  const links = footer.querySelector('.footer-links');
  if (links) decorateLinks(links);

  const language = footer.querySelector('a[href*="#language-picker"]')?.parentNode;
  if (language) decorateLanguage(language);

  await decorateIcons(footer);
  block.append(footer);
}
