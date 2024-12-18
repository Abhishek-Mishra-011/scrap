const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import CORS middleware
const path = require('path');

const app = express();
const PORT = 4000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'flipkart.html'));
});

// Endpoint to handle scraping
app.post('/scrap', async (req, res) => {  // Changed to /scrap
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract data using Puppeteer
        const data = await page.evaluate(() => {
            const price = document.querySelector('.Nx9bqj.CxhGGd') ? document.querySelector('.Nx9bqj.CxhGGd').innerText : 'No price found';
            const name = document.querySelector('.VU-ZEz') ? document.querySelector('.VU-ZEz').innerText : 'No product name found';
            const image = document.querySelector('._4WELSP._6lpKCl img') ? document.querySelector('._4WELSP._6lpKCl img').src : '';

            return { price, name, image };
        });

        await browser.close();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to scrape the data: ' + error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
