import { lookupPages, createOptimizedPicture } from '../../scripts/scripts.js';

export function createArticleCard(article, prefix) {
  const toDate = (serial) => {
    const utcDays = Math.floor(serial - 25569) + 0.8;
    const utcValue = utcDays * 86400;
    return new Date(utcValue * 1000);
  };

  const formatDate = (date) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const date = article.date ? formatDate(toDate(article.date)) : '';
  const [title] = article.title.split('|');

  const card = document.createElement('div');
  card.className = `${prefix}-card`;
  card.innerHTML = `
    <p class="${prefix}-card-date">${date}</p>
    <h4>${title}</h4>
    <p class="${prefix}-card-description">${article.description}</p>`;
  const a = document.createElement('a');
  a.href = article.path;
  a.append(createOptimizedPicture(article.image, article.title, false, [{ width: 400 }]));
  card.prepend(a);
  return (card);
}

export default async function decorate(block) {
  const pathnames = [...block.querySelectorAll('a')].map((a) => new URL(a.href).pathname);
  const pages = await lookupPages(pathnames);
  block.textContent = '';
  pages.forEach((page) => {
    block.append(createArticleCard(page, 'related-articles'));
  });
}
