const puppeteer = require('puppeteer');

async function amazonScraper(url) {
  if (!url) {
    throw new Error('URL is required');
  }

  let browser;
  try {
    // Launch Puppeteer with necessary arguments
    browser = await puppeteer.launch({
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Ensures compatibility with cloud environments
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract data using Puppeteer
    const data = await page.evaluate(() => {
      const name = document.querySelector('#productTitle')?.innerText.trim() || 'No product title found';
      const price = document.querySelector('.a-price-whole')?.innerText.trim() || 'No price found';
      const image = document.querySelector('#landingImage')?.src || 'No image found';

      return { name, price, image };
    });

    return data;
  } catch (error) {
    throw new Error(`Failed to scrape Amazon data: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Export the scraper function
module.exports = amazonScraper;
