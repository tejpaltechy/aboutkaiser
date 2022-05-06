function addSectionsToH2(main) {
  main.querySelectorAll('.default-content-wrapper').forEach((dc) => {
    let section;
    [...dc.children].forEach((child) => {
      if (child.tagName === 'H2') {
        if (section) dc.append(section);
        section = document.createElement('section');
        section.append(child);
      } else if (section) {
        section.append(child);
      }
    });
    if (section) dc.append(section);
  });
}

export default function decorate(block) {
  const aside = document.createElement('aside');
  const select = document.createElement('select');
  document.querySelectorAll('h2').forEach((h2) => {
    const a = document.createElement('a');
    a.href = `#${h2.id}`;
    a.textContent = h2.textContent;
    aside.append(a);
    const option = document.createElement('option');
    option.value = h2.id;
    option.textContent = h2.textContent;
    select.append(option);
    select.addEventListener('change', () => {
      document.getElementById(select.value).scrollIntoView(true);
    });
  });
  block.append(aside, select);

  const main = document.querySelector('main');
  addSectionsToH2(main);

  const setSelected = (id) => {
    select.querySelectorAll('option').forEach((option) => {
      option.removeAttribute('selected');
      if (option.value === id) option.setAttribute('selected', '');
    });
    aside.querySelectorAll('a').forEach((a) => {
      a.classList.remove('selected');
      if (a.href.endsWith(id)) a.classList.add('selected');
    });
  };

  let ignoreIntersection = false;

  window.addEventListener('hashchange', () => {
    setSelected(window.location.hash.substring(1));
    ignoreIntersection = true;
  });

  const highlightObs = new IntersectionObserver((entries) => {
    if (ignoreIntersection === true) {
      ignoreIntersection = false;
      return;
    }
    let selected = false;
    entries.forEach((entry) => {
      if (!selected && entry.intersectionRatio > 0) {
        selected = true;
        const { id } = entry.target.querySelector('h2');
        setSelected(id);
      }
    });
  });

  main.querySelectorAll('section').forEach((section) => highlightObs.observe(section));
}
