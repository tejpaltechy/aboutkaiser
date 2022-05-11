// eslint-disable-next-line import/no-cycle
import { sampleRUM } from './scripts.js';

// Core Web Vitals RUM collection
sampleRUM('cwv');

// add more delayed functionality here
function updateExternalLinks() {
  document.querySelectorAll('main a[href]').forEach((a) => {
    try {
      const { origin } = new URL(a.href, window.location.href);
      if (origin && origin !== window.location.origin) {
        a.setAttribute('rel', 'noopener');
        a.setAttribute('target', '_blank');
        if (!a.children.length) {
          a.innerHTML += ' <span class="icon icon-external-site"></span>';
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`Invalid link: ${a.href}`);
    }
  });
}

updateExternalLinks();

function loadScript(url, callback, type) {
  const $head = document.querySelector('head');
  const $script = document.createElement('script');
  $script.src = url;
  if (type) {
    $script.setAttribute('type', type);
  }
  $head.append($script);
  $script.onload = callback;
  return $script;
}

const splits = window.location.pathname.split('/');
const suffix = splits.join(':');
const pageName = `kporg:en${suffix}`;

window.digitalData = {
  page: {
    pageInfo: {
      pageName,
    },
    category: {
      primaryCategory: 'kporg',
      subCategory1: 'kporg:en',
      subCategory2: splits[1] ? `kporg:en:${splits[1]}` : '',
      subCategory3: splits[2] ? `kporg:en:${splits[1]}:${splits[2]}` : '',
      subCategory4: splits[3] ? `kporg:en:${splits[1]}:${splits[2]}:${splits[3]}` : '',
      subCategory5: splits[4] ? `kporg:en:${splits[1]}:${splits[2]}:${splits[3]}:${splits[4]}` : '',
    },
  },
  user: {
    profile: {
    },
    segment: {
    },
  },
  global: {
    feature_name: 'Health \x26 wellness',
    guid: '',
  },
};

if (window.location.hash) {
  window.digitalData.page.pageInfo.pageName = `${pageName}${window.location.hash}`;
}

loadScript('https://assets.adobedtm.com/launch-ENbd993aa07d4b4467b8a02336a9fe6f2c.min.js');
