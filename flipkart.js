const puppeteer = require('puppeteer');

async function flipkartScraper(url) {
  if (!url) {
    throw new Error('URL is required');
  }

  let browser;
  try {
    // Launch Puppeteer with necessary arguments
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'], // Ensure compatibility with cloud environments
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Extract data using Puppeteer
    const data = await page.evaluate(() => {
      const price = document.querySelector('.Nx9bqj.CxhGGd')?.innerText || 'No price found';
      const name = document.querySelector('.VU-ZEz')?.innerText || 'No product name found';
      const image = document.querySelector('._4WELSP._6lpKCl img')?.src || 'No image found';

      return { price, name, image };
    });

    return data;
  } catch (error) {
    throw new Error(`Failed to scrape Flipkart data: ${error.message}`);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Export the scraper function
module.exports = flipkartScraper;
