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

function createMetadata(main, document) {
  const meta = {};

  const title = document.querySelector('title');
  if (title) {
    meta.Title = title.innerHTML.replace(/[\n\t]/gm, '');
  }

  const desc = document.querySelector('[property="description"]');
  if (desc) {
    meta.Description = desc.content;
  }

  const image = document.querySelector('[property="og:image"]');
  if (image && image.content) {
    const img = document.createElement('img');
    img.src = image.content;
    meta.Image = img;
  }

  const tags = document.querySelector('[property="article:tag"]');
  if (tags && tags.content) {
    meta.Tags = tags.content.split(',').map((tag) => tag.trim()).join(', ');
  }

  const block = WebImporter.Blocks.getMetadataBlock(document, meta);
  main.append(block);

  return meta;
}

function tablesToBlock(main, document) {
  main.querySelectorAll('table').forEach((table) => {
    const nbCols = table.querySelectorAll('th').length;
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.innerHTML = 'Table';
    if (nbCols > 1) {
      th.setAttribute('colspan', nbCols);
    }
    tr.append(th);
    thead.append(tr);
    table.prepend(thead);
  });
}

function createImagePreviewBlock(main, document) {
  main.querySelectorAll('mdo-preview-box').forEach((box) => {
    const data = [['Image Preview']];
    box.querySelectorAll('.item').forEach((item) => {
      item.querySelectorAll('.no-print, .preview-counter').forEach((el) => el.remove());

      const copyright = item.querySelector('.copyright');
      if (copyright) {
        const i = document.createElement('i');
        i.innerHTML = copyright.innerHTML;
        copyright.replaceWith(i);
      }
      data.push([item]);
    });

    const table = WebImporter.DOMUtils.createTable(data, document);
    box.replaceWith(table);
  });
}

export default {

  /**
   * Apply DOM operations to the provided document and return
   * the root element to be then transformed to Markdown.
   * @param {HTMLDocument} document The document
   * @returns {HTMLElement} The root element
   */
  // eslint-disable-next-line no-unused-vars
  transformDOM: ({ document, url }) => {
    const main = document.querySelector('.content');

    WebImporter.DOMUtils.remove(main, [
      '.mobile-menu',
      '.legal-copy', // disclaimer can be auto-blocked
    ]);

    tablesToBlock(main, document);

    createImagePreviewBlock(main, document);
    createMetadata(main, document);

    return main;
  },

  /**
   * Return a path that describes the document being transformed (file name, nesting...).
   * The path is then used to create the corresponding Word document.
   * @param {String} url The url of the document being transformed.
   * @param {HTMLDocument} document The document
   */
  // eslint-disable-next-line no-unused-vars
  generateDocumentPath: ({ document, url }) => new URL(url).pathname
    .replace(/\.xml$/, '')
    .replace(/\.html$/, '')
    .replace(/_-_/gm, '-')
    .replace(/_/gm, '-')
    .toLowerCase(),
};
