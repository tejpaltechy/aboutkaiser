/* eslint-disable no-console */
/* eslint-disable no-await-in-loop */
import puppeteer from 'puppeteer';
import fs from 'fs-extra';
import fetch from 'node-fetch';

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index += 1) {
    // eslint-disable-next-line no-await-in-loop
    await callback(array[index], index, array);
  }
}

async function getURLs() {
  const res = await fetch('https://main--healthy-kp--hlxsites.hlx.page/_drafts/import/structure-pages-urls.json?limit=1100');
  const json = await res.json();
  return json.data.map(({ URL }) => URL);
}

async function getHTML(url) {
  const browser = await puppeteer.launch({
    userDataDir: './.userData',
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(60000);
  await page.goto(url);
  await page.waitForSelector('.legal-copy');
  const html = await page.evaluate(() => document.documentElement.innerHTML);
  await page.close();
  await browser.close();
  return html;
}

async function run() {
  const urls = await getURLs();

  await asyncForEach(urls, async (url, index) => {
    // if (index < 100) return;
    let ok = false;
    let retry = 0;
    do {
      retry += 1;
      try {
        console.log(`${index} - Processing ${url}`);
        const html = await getHTML(url);
        const u = new URL(url);
        const filename = u.pathname.substring(u.pathname.lastIndexOf('/') + 1).replace('.xml', '.html');
        await fs.writeFile(`./.remote/${filename}`, html);
        retry = 0;
        ok = true;
      } catch (e) {
        console.error(`Error processing ${url}`, e);
      }
    } while (!ok && retry < 3);
  });
}
run();
