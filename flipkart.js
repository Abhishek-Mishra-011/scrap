const puppeteer = require('puppeteer');

async function flipkartScraper(url) {
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
            const name = document.querySelector('._35KyD6')?.innerText.trim() || 'No product title found';
            const price = document.querySelector('._30jeq3')?.innerText.trim() || 'No price found';
            const image = document.querySelector('._396cs4')?.src || 'No image found';

            return { name, price, image };
        });

        console.log('Data extraction successful:', data);
        return { success: true, data }; // Wrap the data in a 'data' object
    } catch (error) {
        console.error('Error during scraping:', error.message);
        return { success: false, error: `Failed to scrape Flipkart data: ${error.message}` };
    } finally {
        if (browser) {
            console.log('Closing browser...');
            await browser.close();
        }
    }
}

module.exports = flipkartScraper;
