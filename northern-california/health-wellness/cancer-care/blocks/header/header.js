import { readBlockConfig, decorateIcons, decorateLanguage } from '../../scripts/scripts.js';

function closeMenu(el) {
  el.setAttribute('aria-expanded', false);
}

function openMenu(el) {
  el.setAttribute('aria-expanded', true);
}

function toggleMenu(e) {
  const btn = e.target.closest('[role="button"]');
  const expanded = btn.getAttribute('aria-expanded') === 'true';
  if (expanded) {
    closeMenu(btn);
  } else {
    openMenu(btn);
  }
}

function onMediaChange() {
  const mq = window.matchMedia('(min-width: 900px)');
  if (mq.matches) {
    document.querySelector('header .nav').setAttribute('aria-expanded', true);
    document.body.style.overflowY = '';
  } else {
    document.querySelector('header .nav').setAttribute('aria-expanded', false);
  }
}

/**
 * collapses all open nav sections
 * @param {Element} sections The container element
 */
function collapseAllNavSections(sections) {
  sections.querySelectorAll('.nav-section').forEach((section) => {
    section.setAttribute('aria-expanded', 'false');
  });
}

function decorateRegion(section) {
  // build button
  const selected = section.querySelector('li strong');
  const btn = document.createElement('a');
  btn.classList.add('nav-region-btn');
  btn.innerHTML = `<span>${selected.textContent}</span>
    <div class="icon icon-arrow"></div>`;
  btn.id = 'region-button';
  btn.setAttribute('aria-expanded', false);
  btn.setAttribute('aria-haspopup', true);
  btn.setAttribute('aria-label', 'Change region');
  btn.setAttribute('role', 'button');
  btn.setAttribute('tabindex', 0);
  btn.addEventListener('click', toggleMenu);
  // decorate options
  const options = section.querySelector('ul');
  options.classList.add('nav-region-options');
  options.setAttribute('aria-labelledby', 'region-button');
  options.setAttribute('role', 'menu');
  options.querySelectorAll('a').forEach((a) => {
    const { pathname: optionPath } = new URL(a.href);
    const { pathname: windowPath } = new URL(window.location.href);
    const windowPathArr = windowPath.split('/');
    windowPathArr[1] = optionPath.replace(/\//g, '');
    a.href = windowPathArr.join('/');
  });

  section.prepend(btn);
  selected.parentNode.remove();
}

/* search functionality */
function closeSearch() {
  const search = document.querySelector('.nav-search-menu');
  if (search) search.remove();
}

function clearInput() {
  const input = document.querySelector('.nav-search-menu input');
  if (input) input.value = '';
}

function openSearch(e) {
  const value = e.target.value.trim() || document.querySelector('.nav-search-menu input').value.trim();
  if (value !== '') {
    const { origin, pathname } = new URL(window.location.href);
    const region = pathname.split('/').filter((p) => p !== '').pop();
    window.open(`${origin}/${region}/pages/search?query=${encodeURIComponent(value)}&category=All`);
  }
}

function displayClear(e) {
  const clear = document.querySelector('.nav-search-menu .icon.icon-clear');
  if (e.target.value.trim().length > 0) {
    clear.classList.add('show');
  } else {
    clear.classList.remove('show');
  }
}

function buildSearchMenu() {
  const menu = document.createElement('section');
  menu.classList.add('nav-search-menu');
  // decorate close btn
  const close = document.createElement('div');
  close.classList.add('nav-search-close');
  close.innerHTML = '<span class="icon icon-close"></span>';
  close.addEventListener('click', closeSearch);
  // decorate wrapper
  const wrapper = document.createElement('div');
  wrapper.classList.add('nav-search-input');
  wrapper.innerHTML = `<span class="icon icon-search"></span>
    <span class="icon icon-clear"></span>`;
  const clear = wrapper.querySelector('.icon.icon-clear');
  clear.addEventListener('click', clearInput);
  // decorate input
  const input = document.createElement('input');
  input.setAttribute('type', 'text');
  input.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') openSearch(e);
  });
  input.addEventListener('input', displayClear);
  wrapper.append(input);
  // decorate submit btn
  const search = document.createElement('button');
  search.innerHTML = '<span class="icon icon-search"></span> Search';
  search.addEventListener('click', openSearch);

  menu.append(close, wrapper, search);
  decorateIcons(menu);
  document.querySelector('header .nav').append(menu);
}

function decorateSearch(section) {
  const btn = section.querySelector('p');
  btn.id = 'search';
  btn.addEventListener('click', buildSearchMenu);
}

/**
 * decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const cfg = readBlockConfig(block);
  block.textContent = '';

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
  const sections = ['brand', 'search', 'language', 'region', 'signin', 'links'];
  nav.querySelectorAll(':scope > div').forEach((navSection, i) => {
    if (sections[i]) {
      // first section is the brand section
      navSection.classList.add(`nav-${sections[i]}`);
    } else {
      // all other sections
      navSections.append(navSection);
      navSection.classList.add('nav-section');
      const h2 = navSection.querySelector('h2');
      if (h2) {
        h2.addEventListener('click', () => {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          collapseAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        });
      }
    }
  });
  navSections.append(
    nav.querySelector('.nav-links').cloneNode(true),
    nav.querySelector('.nav-signin').cloneNode(true),
    nav.querySelector('.nav-language').cloneNode(true),
    nav.querySelector('.nav-region').cloneNode(true),
  );
  nav.append(navSections);

  const search = nav.querySelector('.nav-search');
  if (search) decorateSearch(search);

  const regions = nav.querySelectorAll('.nav-region');
  regions.forEach((region) => decorateRegion(region));

  const languages = nav.querySelectorAll('.nav-language');
  languages.forEach((language) => decorateLanguage(language));

  // hamburger for mobile
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = '<div class="nav-hamburger-icon"></div>';
  hamburger.addEventListener('click', () => {
    const expanded = nav.getAttribute('aria-expanded') === 'true';
    document.body.style.overflowY = expanded ? '' : 'hidden';
    nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  });
  nav.prepend(hamburger);
  nav.setAttribute('aria-expanded', 'false');
  decorateIcons(nav);
  block.append(nav);

  onMediaChange();
  window.addEventListener('resize', onMediaChange);
}
