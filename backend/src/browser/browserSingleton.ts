import puppeteer, { Browser } from 'puppeteer';

let browser: Browser | null = null;

async function createBrowser(): Promise<Browser> {
  const runningInDocker = process.env.RUNNING_IN_DOCKER === 'true';
  const headless = runningInDocker || process.env.HEADLESS === 'true';
  return puppeteer.launch({
    pipe: true, // https://stackoverflow.com/a/54924487/13785011
    ...(runningInDocker ? {args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']} : {}),
    ...(headless ? {} : {
      headless: false,
      slowMo: 10,
      defaultViewport: null,
    }),
  });
}

export default {
  async get(): Promise<Browser> {
    if (!browser) {
      browser = await createBrowser();
    }
    return browser;
  },

  async close(): Promise<void> {
    await browser?.close();
    browser = null;
  },
};
