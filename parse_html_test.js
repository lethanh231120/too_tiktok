const fs = require('fs');

const content = fs.readFileSync('temp/test_output_puppeteer.html', 'utf8');

// Try to find any JSON like object containing "description"
const matches = content.match(/"description":"([^"]*)"/g);
if (matches) {
    console.log("Found description matches:", matches);
} else {
    console.log("No description matches found in HTML.");
}
