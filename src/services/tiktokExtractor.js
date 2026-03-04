const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const { BrowserWindow } = require("electron");

function extractVideoId(url) {
  if (!url) return null;

  // dạng: /video/123456789
  const match = url.match(/video\/(\d+)/);
  if (match) return match[1];

  // fallback nếu là dạng query ?itemId=
  const queryMatch = url.match(/itemId=(\d+)/);
  if (queryMatch) return queryMatch[1];

  return null;
}

/** Kiểm tra có phải link sản phẩm TikTok không */
function isProductUrl(url) {
  if (!url) return false;
  return /tiktok\.com.*\/view\/product\/|\/product\//.test(url);
}

/** Trích xuất productId từ URL sản phẩm */
function extractProductId(url) {
  if (!url) return null;
  const match = url.match(/\/product\/(\d+)/);
  return match ? match[1] : null;
}

/** Trích xuất title và ảnh từ og_info trong query params của URL sản phẩm */
function parseOgInfoFromUrl(url) {
  try {
    const urlObj = new URL(url);
    const ogInfoParam = urlObj.searchParams.get("og_info");
    if (!ogInfoParam) return null;
    const ogInfo = JSON.parse(ogInfoParam);
    return ogInfo;
  } catch {
    return null;
  }
}

/**
 * Lấy mô tả sản phẩm từ meta[name="description"] trong HTML trang sản phẩm TikTok.
 */
async function fetchProductDescription(productUrl) {
  try {
    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36",
      "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    };

    const res = await axios.get(productUrl, {
      headers,
      timeout: 15000,
    });
    const $ = cheerio.load(res.data);

    const metaDesc =
      $('meta[name="description"]').attr("content") ||
      $('meta[name="Description"]').attr("content") ||
      "";

    console.log({ "111111111111111111111111111111111111111": metaDesc });
    return metaDesc.trim();
  } catch (error) {
    console.warn("Failed to fetch product description (meta):", error.message);
    return "";
  }
}

class TikTokExtractor {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), "tiktok-gen-video");
    fs.ensureDirSync(this.tempDir);
  }

  // async extractTikTokData(tiktokUrl) {
  //   try {
  //     // // Validate TikTok URL
  //     if (!this.isValidTikTokUrl(tiktokUrl)) {
  //       throw new Error("Invalid TikTok URL format");
  //     }

  //     // For shortened URLs, we need to expand them first
  //     let expandedUrl = tiktokUrl;
  //     if (
  //       tiktokUrl.includes("vt.tiktok.com") ||
  //       tiktokUrl.includes("vm.tiktok.com")
  //     ) {
  //       try {
  //         expandedUrl = await this.expandShortUrl(tiktokUrl);
  //       } catch (e) {
  //         console.warn("Could not expand URL, using original:", e.message);
  //         expandedUrl = tiktokUrl;
  //       }
  //     }

  //     console.log("Expanded URL:", expandedUrl);

  //     // Extract video ID from URL
  //     const videoId = this.extractVideoId(expandedUrl);

  //     if (!videoId) {
  //       throw new Error("Could not extract video ID from URL: " + expandedUrl);
  //     }

  //     console.log("Video ID:", videoId);

  //     // Fetch page content with proper headers
  //     const headers = {
  //       "User-Agent":
  //         "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  //       "Accept-Language": "en-US,en;q=0.9",
  //     };

  //     console.log("Fetching TikTok data from:", expandedUrl);
  //     const response = await axios.get(expandedUrl, {
  //       headers,
  //       maxRedirects: 5,
  //       timeout: 10000,
  //     });

  //     console.log("response data:::::::::::::::", response.data);

  //     const $ = cheerio.load(response.data);
  //     console.log({ $ });

  //     const images = $(".slick-slide img")
  //       .map((i, el) => $(el).attr("src"))
  //       .get();

  //     // Extract title/description from HTML
  //     let description = $('meta[name="description"]').attr("content") || "";
  //     let ogImage = $('meta[property="og:image"]').attr("content");
  //     let ogTitle = $('meta[property="og:title"]').attr("content") || "";

  //     console.log({ images, description, ogImage, ogTitle });
  //     // Fallback: Check if URL has og_info (TikTok often puts product info here during redirects)
  //     try {
  //       const urlObj = new URL(expandedUrl);
  //       const ogInfoParam = urlObj.searchParams.get("og_info");
  //       if (ogInfoParam) {
  //         const ogInfo = JSON.parse(ogInfoParam);
  //         if (!ogTitle && ogInfo.title) ogTitle = ogInfo.title;
  //         if (ogInfo.image) {
  //           ogImage = ogInfo.image;
  //           // Add ogInfo.image to images list if it's not already there
  //           if (!images.includes(ogInfo.image)) {
  //             images.push(ogInfo.image);
  //           }
  //         }
  //       }
  //     } catch (e) {
  //       console.warn(
  //         "Could not parse og_info from URL query params:",
  //         e.message,
  //       );
  //     }

  //     // Fallback: If no images found but we have an ogImage, use it
  //     if (images.length === 0 && ogImage) {
  //       images.push(ogImage);
  //     }

  //     // Download image (still needed for uploading to Sora later)
  //     let imagePath = null;
  //     if (ogImage) {
  //       imagePath = await this.downloadImage(ogImage, videoId);
  //     }

  //     return {
  //       videoId,
  //       url: expandedUrl,
  //       title: ogTitle,
  //       description,
  //       imagePath,
  //       images,
  //       timestamp: new Date().toISOString(),
  //     };
  //   } catch (error) {
  //     console.error("Error extracting TikTok data:", error);
  //     throw error;
  //   }
  // }

  /**
   * Trích xuất dữ liệu sản phẩm từ link TikTok product (og_info trong URL).
   * Format: https://www.tiktok.com/view/product/1732724849962681651?...&og_info={"title":"...","image":"https://..."}
   */
  async extractProductData(tiktokUrl) {
    const productId = extractProductId(tiktokUrl);
    const ogInfo = parseOgInfoFromUrl(tiktokUrl);

    console.log("ogInfo:::::::::::::::", ogInfo);
    if (!ogInfo || !ogInfo.image) {
      throw new Error(
        "Không tìm thấy thông tin ảnh trong link. Link sản phẩm cần có tham số og_info với title và image.",
      );
    }

    const title = ogInfo.title || "Sản phẩm TikTok";

    // Thử lấy mô tả chi tiết từ HTML. Nếu fail thì fallback về title.
    let description = "";
    console.log("description:::::::::::::::", description);
    const htmlDescription = await fetchProductDescription(tiktokUrl);
    console.log("htmlDescription:::::::::::::::", htmlDescription);
    if (htmlDescription && htmlDescription.trim()) {
      console.log("htmlDescription:::::::::::::::", htmlDescription.trim());
      description = htmlDescription.trim();
    }
    const imageUrl = ogInfo.image.replace(/\\\//g, "/");

    const imagePath = await this.downloadImage(
      imageUrl,
      productId || "product",
    );

    return {
      videoId: productId,
      url: tiktokUrl,
      title,
      description,
      imagePath,
      images: [imageUrl],
      timestamp: new Date().toISOString(),
      source: "product",
    };
  }

  async extractTikTokData(tiktokUrl) {
    // Link sản phẩm: lấy từ og_info trong URL, không cần gọi API
    if (isProductUrl(tiktokUrl)) {
      return this.extractProductData(tiktokUrl);
    }
  }

  async expandShortUrl(shortUrl) {
    try {
      const response = await axios.get(shortUrl, {
        maxRedirects: 10,
        timeout: 10000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      // Try multiple ways to get the final URL after redirects
      const finalUrl =
        response.request.res.responseUrl ||
        (response.request._redirectable &&
          response.request._redirectable._currentUrl) ||
        shortUrl;
      console.log("Redirect resolved to:", finalUrl);
      return finalUrl;
    } catch (error) {
      // Even on error, axios may have followed some redirects
      if (error.request) {
        const redirectedUrl =
          (error.request.res && error.request.res.responseUrl) ||
          (error.request._redirectable &&
            error.request._redirectable._currentUrl);
        if (redirectedUrl) {
          console.log("Got URL from redirect (despite error):", redirectedUrl);
          return redirectedUrl;
        }
      }
      console.warn("Could not expand URL:", error.message);
      return shortUrl;
    }
  }

  isValidTikTokUrl(url) {
    // Accept regular URLs, shortened URLs, and mobile URLs
    const tiktokRegex =
      /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com)/;
    return tiktokRegex.test(url);
  }

  extractVideoId(url) {
    // Strip query string and hash for cleaner matching
    const cleanUrl = url.split("?")[0].split("#")[0].replace(/\/+$/, "");

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
        responseType: "arraybuffer",
      });

      const imagePath = path.join(this.tempDir, `tiktok_${videoId}.jpg`);
      await fs.writeFile(imagePath, response.data);
      return imagePath;
    } catch (error) {
      console.error("Error downloading image:", error);
      return null;
    }
  }
}

module.exports = new TikTokExtractor();
