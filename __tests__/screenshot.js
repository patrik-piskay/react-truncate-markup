const fs = require('fs');
const { startServer } = require('polyserve');
const puppeteer = require('puppeteer');
const ScreenshotTester = require('puppeteer-screenshot-tester');

const screenshotDiff = async (page, name) => {
  const tester = await ScreenshotTester();

  return tester(page, name, {
    path: `${__dirname}/screenshots/${name}.png`,
  });
};

describe('Screenshot tests', () => {
  let server;
  let serverUrl;
  let browser;
  let page;

  beforeAll(async () => {
    server = await startServer({
      root: `${__dirname}/app/public`,
      port: 4000,
    });

    serverUrl = server.address();
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(async () => {
    browser = await puppeteer.launch({
      args: ['--no-sandbox'],
    });
    page = await browser.newPage();
    page.setViewport({ width: 800, height: 600 });
  });

  afterEach(() => browser.close());

  fs.readdirSync(`${__dirname}/app/src/pages`).forEach((file) => {
    const [name] = file.split('.js');

    it(`Screen: ${name}`, async () => {
      await page.goto(`http://${serverUrl.address}:${serverUrl.port}/${name}`);

      expect(await screenshotDiff(page, name)).toBe(true);
    });
  });

  it(`Screen: resize - resized`, async () => {
    page.setViewport({ width: 600, height: 600 });
    await page.goto(`http://${serverUrl.address}:${serverUrl.port}/resize`);

    expect(await screenshotDiff(page, 'resize-resized')).toBe(true);
  });
});
