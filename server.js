const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const amazonScraper = require('./amazon');  // Import the scraper logic for Amazon
const flipkartScraper = require('./flipkart');  // Import the scraper logic for Flipkart
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files like index.html
app.use(express.static(path.join(__dirname)));  // Serve all files in the same directory

// Serve the index.html (UI) when the root is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));  // This will serve the index.html in the same folder
});

// API endpoint for Amazon scraping
app.post('/amazon', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const data = await amazonScraper(url);  // Call the Amazon scraper logic
    res.json(data);  // Return the scraped data for Amazon
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape Amazon data: ' + error.message });
  }
});

// API endpoint for Flipkart scraping
app.post('/flipkart', async (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const data = await flipkartScraper(url);  // Call the Flipkart scraper logic
    res.json(data);  // Return the scraped data for Flipkart
  } catch (error) {
    res.status(500).json({ error: 'Failed to scrape Flipkart data: ' + error.message });
  }
});

// Start the server on the configured port
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
