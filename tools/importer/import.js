/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
/* eslint-disable no-console, class-methods-use-this */
/* globals WebImporter */

function createMetadata(document) {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[name="description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const author = document.querySelector('[name="author"]');
  if (author) {
    meta.Author = author.content;
  }

  const pubDate = document.querySelector('.eyebrow');
  if (pubDate) {
    meta['Publication Date'] = pubDate.textContent;
    pubDate.remove();
  }

  const tags = document.querySelector('.c21-tags');
  if (tags) {
    meta.Tags = [...tags.querySelectorAll('a')].map((a) => a.textContent).join(', ');
    tags.remove();
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  document.body.append(block);

  return meta;
}

const makeGlobal = (href) => new URL(href, 'https://about.kaiserpermanente.org/').href;

const createRelated = (document) => {
  const related = document.querySelector('.related-cards__wrap');
  if (related) {
    const data = [['Related Articles']];
    const text = [...related.querySelectorAll('a.related-cards__card')].map((a) => `<p><a href="${makeGlobal(a.href)}">${makeGlobal(a.href)}</a></p>`).join('\n');
    data.push([text]);

    const table = WebImporter.DOMUtils.createTable(data, document);
    related.replaceWith(table);
  }
};

const createHeroImage = (document) => {
  const hero = document.querySelector('.c27-article-page-hero__media-item');
  if (hero) {
    const url = hero.style.backgroundImage.split('(')[1].replace(')', '');
    const caption = document.querySelector('.c27-article-page-hero__caption');
    const captionText = caption ? caption.textContent : '';
    hero.parentElement.parentElement.innerHTML = `<img src="${url}"><p><em>${captionText}</em></p>`;
  }
};

export default {

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  // eslint-disable-next-line no-unused-vars
  transformDOM: ({ document, url }) => {
    // simply return the body, no transformation (yet)
    const remove = document.querySelectorAll('.header, .footer, .breadcrumb, .social-share, .c27-article-page-hero__text');
    if (remove) {
      remove.forEach((element) => { element.remove(); });
    }

    createHeroImage(document);

    createMetadata(document);
    createRelated(document);

    return document.body;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  // eslint-disable-next-line no-unused-vars
  generateDocumentPath: ({ document, url }) => new URL(url).pathname.replace(/\/$/, ''),
};
