const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); // Import the cors package

const app = express();
const PORT = 3000;

// Enable CORS for all origins (you can restrict it later if needed)
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Serve static files like your HTML, CSS, and JS files (e.g., public folder)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'amazon.html')); // Ensure this path is correct
});

// Endpoint to handle scraping
app.post('/scrap', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // Extract data using Puppeteer
        const data = await page.evaluate(() => {
            const name = document.querySelector('#productTitle')?.innerText.trim() || 'No product title found';
            const price = document.querySelector('.a-price-whole')?.innerText.trim() || 'No price found';
            const image = document.querySelector('#landingImage')?.src || '';

            return { name, price, image };
        });

        await browser.close();
        res.json(data); // Send the scraped data back to the frontend
    } catch (error) {
        res.status(500).json({ error: 'Failed to scrape the data: ' + error.message });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
