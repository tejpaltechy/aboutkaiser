import { lookupPages, readBlockConfig } from '../../scripts/scripts.js';
import { createArticleCard } from '../related-articles/related-articles.js';

export default async function decorate(block) {
  const config = readBlockConfig(block);

  block.textContent = '';
  const results = document.createElement('div');
  results.className = 'article-feed-results';

  const displayResults = async () => {
    results.textContent = '';
    const pages = await lookupPages(config);
    pages.forEach((page) => {
      results.append(createArticleCard(page, 'article-feed'));
    });
  };

  if (config.filters) {
    const div = document.createElement('div');
    div.className = 'article-feed-filters';

    const filters = config.filters.split(',').map((f) => f.trim().toLowerCase());
    if (filters.includes('topic')) {
      const topic = document.createElement('div');
      topic.innerHTML = `<p>Browse By:</p>
      <select>
        <option data-index="0" value="Mental health">Mental health</option>
        <option data-index="1" value="Mental health care">Mental health care</option>
        <option data-index="2" value="Mental health research">Mental health research</option>
        <option data-index="3" value="Reducing stigma">Reducing stigma</option>
        <option data-index="4" value="Self-care resources">Self-care resources</option>
        <option data-index="5" value="Supporting communities">Supporting communities</option>
        <option data-index="6" value="Youth mental health">Youth mental health</option>
      </select>`;
      const select = topic.querySelector('select');
      select.addEventListener('change', async () => {
        config.tags = select.value;
        displayResults();
      });
      div.append(topic);
    }

    if (filters.includes('location')) {
      const location = document.createElement('div');
      location.innerHTML = `<p>Browse By:</p>
      <select id="filter--location" name="filterKey" class="card--filter">
        <option data-index="0" value="">
            Location
        </option>
        <option data-index="1" value="Colorado">
            Colorado
        </option>
        <option data-index="2" value="Georgia">
            Georgia
        </option>
        <option data-index="3" value="Hawaii">
            Hawaii
        </option>
        <option data-index="4" value="Mid-Atlantic States">
            Mid-Atlantic States
        </option>
        <option data-index="5" value="Northern California" selected="">
            Northern California
        </option>
        <option data-index="6" value="Northwest">
            Northwest
        </option>
        <option data-index="7" value="Southern California">
            Southern California
        </option>
        <option data-index="8" value="Washington">
            Washington
        </option>
    </select>`;
      div.append(location);
    }
    block.append(div);
  }
  block.append(results);
  displayResults();
}
