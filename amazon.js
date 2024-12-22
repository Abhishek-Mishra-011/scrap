const puppeteer = require('puppeteer');

async function amazonScraper(url) {
    if (!url) {
        console.error('Error: URL is required');
        return { success: false, error: 'URL is required' };
    }

    let browser;
    try {
        console.log('Launching Puppeteer...');
        browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'], // Ensures compatibility with cloud environments
        });

        const page = await browser.newPage();
        console.log(`Navigating to URL: ${url}`);
        await page.goto(url, { waitUntil: 'networkidle2' });

        console.log('Extracting data...');
        const data = await page.evaluate(() => {
            const name = document.querySelector('#productTitle')?.innerText.trim() || 'No product title found';
            const price = document.querySelector('.a-price-whole')?.innerText.trim() || 'No price found';
            const image = document.querySelector('#landingImage')?.src || 'No image found';

            return { name, price, image };
        });

        console.log('Data extraction successful:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Error during scraping:', error.message);
        return { success: false, error: `Failed to scrape Amazon data: ${error.message}` };
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
}

// Export the scraper function
module.exports = amazonScraper;
