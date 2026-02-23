const axios = require('axios');

async function run() {
  const url = 'https://vt.tiktok.com/ZS9ey9qA8vmk5-FYUIP';
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const finalUrl = response.request.res.responseUrl;
    console.log("Final URL:", finalUrl);
  } catch (e) {
    console.log(e);
  }
}
run();
