// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var dns = require('dns');
var { nanoid } = require('nanoid');

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 }));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// URL Shortener Microservice
let urlDatabase = [];
let urlCounter = 1;

// Middleware to parse POST requests
app.use(bodyParser.urlencoded({ extended: false }));

// POST /api/shorturl
app.post("/api/shorturl", function (req, res) {
  const originalUrl = req.body.url;

  // Validate the URL format
  const urlRegex = /^(http:\/\/|https:\/\/)(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/;
  if (!urlRegex.test(originalUrl)) {
    return res.json({ error: 'invalid url' });
  }

  // Verify the URL using dns.lookup
  const urlObject = new URL(originalUrl);
  dns.lookup(urlObject.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    // Generate a short URL
    const shortUrl = urlCounter++;
    urlDatabase.push({ originalUrl, shortUrl });

    // Return the JSON response
    res.json({ original_url: originalUrl, short_url: shortUrl });
  });
});

// GET /api/shorturl/<short_url>
app.get("/api/shorturl/:short_url", function (req, res) {
  const shortUrl = req.params.short_url;
  const urlEntry = urlDatabase.find((entry) => entry.shortUrl == shortUrl);

  if (urlEntry) {
    res.redirect(urlEntry.originalUrl);
  } else {
    res.json({ error: 'invalid url' });
  }
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
