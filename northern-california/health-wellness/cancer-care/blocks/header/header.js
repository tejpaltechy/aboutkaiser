import { readBlockConfig, decorateIcons } from '../../scripts/scripts.js';

function onMediaChange() {
  const mq = window.matchMedia('(min-width: 900px)');
  const header = document.querySelector('header');
  const nav = header.querySelector('.nav');
  if (mq.matches) {
    header.classList.remove('collapsed');
    if (nav) nav.setAttribute('aria-expanded', true);
  } else if (!mq.matches) {
    header.classList.add('collapsed');
    if (nav) nav.setAttribute('aria-expanded', false);
  }
}

async function openLanguageDialog() {
  const dialog = document.createElement('aside');
  dialog.classList.add('language-picker-dialog');

  const resp = await fetch('/northern-california/language-picker.plain.html');
  const html = await resp.text();
  dialog.innerHTML = html;
  const close = document.createElement('div');
  close.classList.add('language-picker-close');
  close.innerHTML = '<div class="language-picker-close-icon"></div>';
  dialog.prepend(close);
  document.querySelector('header').append(dialog);
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

  // expanded or contracted menu
  onMediaChange();
  window.addEventListener('resize', onMediaChange);

  // fetch nav content
  const navPath = cfg.nav || '/nav';
  const resp = await fetch(`${navPath}.plain.html`);
  const html = await resp.text();

  // decorate nav DOM
  const nav = document.createElement('div');
  nav.classList.add('nav');
  nav.setAttribute('aria-role', 'navigation');
  const navSections = document.createElement('div');
  navSections.classList.add('nav-sections');
  nav.innerHTML = html;
  const sections = ['brand', 'search', 'title-bar', 'utility-links', 'primary-links'];
  nav.querySelectorAll(':scope > div').forEach((navSection, i) => {
    if (sections[i]) {
      // named sections
      navSection.classList.add(`nav-${sections[i]}`);
    } else {
      // all other sections
      navSections.append(navSection);
      navSection.classList.add('nav-section');
      const h2 = navSection.querySelector('h2');
      if (h2) {
        navSection.classList.add(`nav-${h2.id}`);
        h2.remove();
      }
    }
  });
  nav.append(navSections);

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    document.body.style.overflowY = expanded ? '' : 'hidden';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
    const section = nav.querySelector('.nav-sections');
    if (expanded) {
      section.innerHTML = '';
    } else {
      section.append(
        nav.querySelector('.nav-utility-links').cloneNode(true),
        nav.querySelector('.nav-primary-links').cloneNode(true),
      );
    }
  });
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  decorateIcons(nav);
  block.append(nav);

  // language picker
  const picker = block.querySelector('a[href*="language-picker"');
  if (picker) {
    picker.removeAttribute('href');
    picker.id = 'language-picker';
    picker.addEventListener('click', openLanguageDialog);
  }

  // sign on
  const signon = block.querySelector('a[href*="signon"');
  if (signon) signon.classList.add('btn', 'btn-signon');
}
