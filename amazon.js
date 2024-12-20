const puppeteer = require('puppeteer');
const axios = require('axios');  // For network access testing
const puppeteerExtra = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth'); // For anti-bot bypass

// Use stealth plugin with puppeteer-extra to avoid detection
puppeteerExtra.use(StealthPlugin());

async function amazonScraper(url) {
    if (!url) {
        throw new Error('URL is required');
    }

    let browser;

    // Function to test network access
    const testNetworkAccess = async (url) => {
        try {
            const response = await axios.get(url);
            console.log('Network Access Test Successful', response.status);
        } catch (error) {
            console.error('Network Access Test Failed:', error.message);
        }
    };

    try {
        // Test network access to Amazon before scraping
        await testNetworkAccess(url);

        // Launch Puppeteer with stealth plugin and necessary arguments
        browser = await puppeteerExtra.launch({
            headless: false,  // Temporarily run in non-headless mode for debugging
            executablePath: '/usr/bin/chromium',  // Path to Chromium in cloud environments (adjust as needed)
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();

        // Increase timeout for page load and ensure selectors are present
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); // Increased timeout to 60 seconds

        // Wait for necessary elements to appear
        await page.waitForSelector('#productTitle', { timeout: 60000 });  // Wait for the title element
        await page.waitForSelector('.a-price-whole', { timeout: 60000 });  // Wait for the price element
        await page.waitForSelector('#landingImage', { timeout: 60000 });  // Wait for the image element

        // Scraping data using Puppeteer
        const data = await page.evaluate(() => {
            const name = document.querySelector('#productTitle')?.innerText.trim() || 'No product title found';
            const price = document.querySelector('.a-price-whole')?.innerText.trim() || 'No price found';
            const image = document.querySelector('#landingImage')?.src || 'No image found';

            return { name, price, image };
        });

        console.log('Scraped Data:', data);  // Log the scraped data for debugging

        return data;
    } catch (error) {
        console.error('Error scraping Amazon:', error.message);
        return { name: 'No product title found', price: 'No price found', image: 'No image found' };
    } finally {
        if (browser) {
            await browser.close();  // Close the browser after scraping
        }
    }
}

// Export the scraper function
module.exports = amazonScraper;
