const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs-extra');
const path = require('path');

class TikTokExtractor {
  constructor() {
    this.tempDir = path.join(__dirname, '../../temp');
    fs.ensureDirSync(this.tempDir);
  }

  async extractTikTokData(tiktokUrl) {
    try {
      // Validate TikTok URL
      if (!this.isValidTikTokUrl(tiktokUrl)) {
        throw new Error('Invalid TikTok URL format');
      }

      // For shortened URLs, we need to expand them first
      let expandedUrl = tiktokUrl;
      if (tiktokUrl.includes('vt.tiktok.com') || tiktokUrl.includes('vm.tiktok.com')) {
        try {
          expandedUrl = await this.expandShortUrl(tiktokUrl);
        } catch (e) {
          console.warn('Could not expand URL, using original:', e.message);
          expandedUrl = tiktokUrl;
        }
      }

      console.log('Expanded URL:', expandedUrl);

      // Extract video ID from URL
      const videoId = this.extractVideoId(expandedUrl);

      if (!videoId) {
        throw new Error('Could not extract video ID from URL: ' + expandedUrl);
      }

      console.log('Video ID:', videoId);

      // Fetch page content with proper headers
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      };

      console.log('Fetching TikTok data from:', expandedUrl);
      const response = await axios.get(expandedUrl, {
        headers,
        maxRedirects: 5,
        timeout: 10000,
      });

      console.log('response data:::::::::::::::', response.data);


      const $ = cheerio.load(response.data);

      const images = $('.slick-slide img').map((i, el) => $(el).attr('src')).get();


      // Extract title/description from HTML
      let description = $('meta[name="description"]').attr('content') || '';
      let ogImage = $('meta[property="og:image"]').attr('content');
      let ogTitle = $('meta[property="og:title"]').attr('content') || '';

      // Fallback: Check if URL has og_info (TikTok often puts product info here during redirects)
      try {
        const urlObj = new URL(expandedUrl);
        const ogInfoParam = urlObj.searchParams.get('og_info');
        if (ogInfoParam) {
          const ogInfo = JSON.parse(ogInfoParam);
          if (!ogTitle && ogInfo.title) ogTitle = ogInfo.title;
          if (ogInfo.image) {
            ogImage = ogInfo.image;
            // Add ogInfo.image to images list if it's not already there
            if (!images.includes(ogInfo.image)) {
              images.push(ogInfo.image);
            }
          }
        }
      } catch (e) {
        console.warn('Could not parse og_info from URL query params:', e.message);
      }



      // Fallback: If no images found but we have an ogImage, use it
      if (images.length === 0 && ogImage) {
        images.push(ogImage);
      }

      // Download image (still needed for uploading to Sora later)
      let imagePath = null;
      if (ogImage) {
        imagePath = await this.downloadImage(ogImage, videoId);
      }

      return {
        videoId,
        url: expandedUrl,
        title: ogTitle,
        description,
        imagePath,
        images,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error extracting TikTok data:', error);
      throw error;
    }
  }

  async expandShortUrl(shortUrl) {
    try {
      const response = await axios.get(shortUrl, {
        maxRedirects: 10,
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });
      // Try multiple ways to get the final URL after redirects
      const finalUrl = response.request.res.responseUrl
        || response.request._redirectable && response.request._redirectable._currentUrl
        || shortUrl;
      console.log('Redirect resolved to:', finalUrl);
      return finalUrl;
    } catch (error) {
      // Even on error, axios may have followed some redirects
      if (error.request) {
        const redirectedUrl = (error.request.res && error.request.res.responseUrl)
          || (error.request._redirectable && error.request._redirectable._currentUrl);
        if (redirectedUrl) {
          console.log('Got URL from redirect (despite error):', redirectedUrl);
          return redirectedUrl;
        }
      }
      console.warn('Could not expand URL:', error.message);
      return shortUrl;
    }
  }

  isValidTikTokUrl(url) {
    // Accept regular URLs, shortened URLs, and mobile URLs
    const tiktokRegex = /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com)/;
    return tiktokRegex.test(url);
  }

  extractVideoId(url) {
    // Strip query string and hash for cleaner matching
    const cleanUrl = url.split('?')[0].split('#')[0].replace(/\/+$/, '');

    // Try to extract from /video/{id} pattern
    let match = cleanUrl.match(/\/video\/(\d+)/);
    if (match) return match[1];

    // Try to extract from /photo/{id} pattern
    match = cleanUrl.match(/\/photo\/(\d+)/);
    if (match) return match[1];

    // Try to extract from product/shop URLs
    match = cleanUrl.match(/\/product\/(\d+)/);
    if (match) return match[1];

    // For shortened URLs (vt.tiktok.com/XXX), extract the code
    match = cleanUrl.match(/tiktok\.com\/([a-zA-Z0-9_-]{6,})/);
    if (match) return match[1];

    // Last resort: get the last path segment
    match = cleanUrl.match(/\/([a-zA-Z0-9_-]{6,})$/);
    return match ? match[1] : null;
  }

  async downloadImage(imageUrl, videoId) {
    try {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });

      const imagePath = path.join(this.tempDir, `tiktok_${videoId}.jpg`);
      await fs.writeFile(imagePath, response.data);
      return imagePath;
    } catch (error) {
      console.error('Error downloading image:', error);
      return null;
    }
  }
}

module.exports = new TikTokExtractor();
