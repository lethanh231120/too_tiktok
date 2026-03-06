const { BrowserWindow, session } = require("electron");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

// Desktop Chrome UA — TikTok ít block hơn mobile UA
const DESKTOP_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) " +
  "AppleWebKit/537.36 (KHTML, like Gecko) " +
  "Chrome/120.0.0.0 Safari/537.36";

class TikTokExtractor {
  constructor() {
    this.tempDir = path.join(os.tmpdir(), "tiktok-gen-video");
    fs.ensureDirSync(this.tempDir);
  }

  wait(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  async loadWithBrowser(url) {
    return new Promise((resolve, reject) => {
      let win = null;
      let settled = false;
      let checkInterval = null;

      const finish = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clearInterval(checkInterval);
        try {
          if (win && !win.isDestroyed()) win.destroy();
        } catch (_) {}
        resolve(result);
      };

      const fail = (err) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        clearInterval(checkInterval);
        try {
          if (win && !win.isDestroyed()) win.destroy();
        } catch (_) {}
        reject(err);
      };

      const timer = setTimeout(
        () => fail(new Error("Browser timeout 30s")),
        30000,
      );

      // Dùng session riêng để có thể set cookies, headers
      const ses = session.fromPartition("persist:tiktok-extractor");

      // Set headers giống browser thật
      ses.webRequest.onBeforeSendHeaders((details, callback) => {
        const headers = {
          ...details.requestHeaders,
          "User-Agent": DESKTOP_UA,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "sec-ch-ua":
            '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Upgrade-Insecure-Requests": "1",
        };
        callback({ requestHeaders: headers });
      });

      win = new BrowserWindow({
        show: false,
        width: 1280,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          javascript: true,
          images: false,
          session: ses,
          // Tắt các flag lộ automation
          webSecurity: true,
        },
      });

      // Xóa dấu hiệu automation
      win.webContents.on("dom-ready", async () => {
        try {
          await win.webContents.executeJavaScript(`
            // Xóa webdriver flag
            Object.defineProperty(navigator, 'webdriver', { get: () => false });
          `);
        } catch (_) {}
      });

      // Poll liên tục để check khi nào có data thật (không phải security page)
      win.webContents.on("did-finish-load", async () => {
        console.log("[extractor] Page loaded, waiting 4s for SPA render...");
        await new Promise((r) => setTimeout(r, 4000));

        let attempts = 0;
        const maxAttempts = 40; // tối đa 20s (500ms x 40)

        checkInterval = setInterval(async () => {
          if (settled || !win || win.isDestroyed()) {
            clearInterval(checkInterval);
            return;
          }

          attempts++;

          try {
            const result = await win.webContents.executeJavaScript(`
              (() => {
                const title = document.title || '';
                const isSecurityPage = title.toLowerCase().includes('security')
                                    || title.toLowerCase().includes('verify')
                                    || title.toLowerCase().includes('captcha')
                                    || title.toLowerCase().includes('robot')
                                    || document.body?.innerText?.toLowerCase().includes('security check');

                if (isSecurityPage) {
                  return { blocked: true, title };
                }

                const metaDesc = document.querySelector('meta[name="description"]')?.content
                  || document.querySelector('meta[property="og:description"]')?.content || '';

                const ogTitle = document.querySelector('meta[property="og:title"]')?.content
                  || document.title || '';

                let description = metaDesc;

                if (!description) {
                  const h3s = Array.from(document.querySelectorAll('h3'));
                  const moTaH3 = h3s.find(h => (h.textContent || '').trim().includes('Mô tả'));
                  if (moTaH3) {
                    try {
                      const clickable = moTaH3.closest('button') || moTaH3.closest('[role="button"]') || moTaH3.parentElement;
                      if (clickable) clickable.click();
                    } catch (_) {}
                    const parent = moTaH3.closest('div');
                    if (parent) {
                      const divs = parent.querySelectorAll('div');
                      const lines = Array.from(divs).map(d => d.textContent.trim()).filter(Boolean);
                      const joined = lines.join('\\n');
                      if (joined.length > 20) description = joined;
                    }
                  }
                }

                if (!description) {
                  const scripts = Array.from(document.querySelectorAll('script[type="application/json"]'));
                  for (const s of scripts) {
                    try {
                      const j = JSON.parse(s.textContent || '{}');
                      const d = j?.props?.pageProps?.product?.description
                        || j?.product?.description
                        || j?.itemInfo?.itemStruct?.desc;
                      if (d && typeof d === 'string' && d.length > 10) { description = d; break; }
                    } catch (_) {}
                  }
                }

                const hasRealData = description.length > 10 || ogTitle.length > 5;

                return {
                  blocked: false,
                  hasRealData,
                  title: ogTitle,
                  description,
                  image: document.querySelector('meta[property="og:image"]')?.content || '',
                  url: document.querySelector('link[rel="canonical"]')?.href || window.location.href,
                  images: Array.from(
                    document.querySelectorAll('[class*="swiper"] img, [class*="product"] img, [class*="carousel"] img')
                  ).map(img => img.src || img.dataset?.src || '').filter(s => s.startsWith('http')),
                };
              })()
            `);

            if (result.blocked) {
              console.log(
                `[extractor] Security page detected (attempt ${attempts}): ${result.title}`,
              );
              if (attempts >= maxAttempts) {
                fail(
                  new Error(
                    "Bị TikTok Security Check block — thử lại sau hoặc dùng link khác",
                  ),
                );
              }
              return;
            }

            if (result.hasRealData) {
              console.log(
                "[extractor] Got real data!",
                result.description?.substring(0, 60),
              );
              clearInterval(checkInterval);
              finish(result);
              return;
            }

            // Chưa có data, chờ thêm
            console.log(`[extractor] Waiting for data... attempt ${attempts}`);
            if (attempts >= maxAttempts) {
              // Hết thời gian nhưng vẫn lấy whatever có
              console.warn(
                "[extractor] Timeout waiting for data, returning partial result",
              );
              clearInterval(checkInterval);
              finish(result);
            }
          } catch (e) {
            if (attempts >= maxAttempts) fail(e);
          }
        }, 500);
      });

      win.webContents.on("did-fail-load", (_, code, desc) => {
        // Ignore aborted loads (code -3), chỉ fail nếu lỗi thật
        if (code !== -3) {
          fail(new Error(`Page load failed: ${desc} (${code})`));
        }
      });

      console.log("[extractor] Loading:", url);
      win.loadURL(url).catch(fail);
    });
  }

  async extractTikTokData(tiktokUrl) {
    try {
      // Expand short URL
      let expandedUrl = tiktokUrl;
      if (
        tiktokUrl.includes("vt.tiktok.com") ||
        tiktokUrl.includes("vm.tiktok.com")
      ) {
        try {
          expandedUrl = await this.expandShortUrl(tiktokUrl);
        } catch (e) {
          console.warn("[extractor] expandShortUrl failed:", e.message);
        }
      }
      console.log("[extractor] Expanded URL:", expandedUrl);

      const videoId = this.extractVideoId(expandedUrl);
      console.log("[extractor] ID:", videoId);

      // Dùng link đầy đủ (có og_info) để TikTok render đúng trang sản phẩm
      const loadUrl = expandedUrl;

      // Parse og_info từ URL
      let ogInfoData = {};
      try {
        const u = new URL(expandedUrl);
        const ogRaw = u.searchParams.get("og_info");
        if (ogRaw) {
          const og = JSON.parse(decodeURIComponent(ogRaw));
          ogInfoData = {
            title: og.title || "",
            image: (og.image || "").replace(/\\+\//g, "/"),
          };
        }
      } catch (e) {}

      // Link sản phẩm có og_info: KHÔNG load browser (tránh TikTok Security block)
      // Dùng luôn title + image từ og_info, description dựng từ title
      if (ogInfoData.title && ogInfoData.image) {
        const title = ogInfoData.title;
        const description = `Mua ${ogInfoData.title} trên TikTok Shop. Săn giá siêu hời, freeship đơn đủ điều kiện.`;
        const image = ogInfoData.image;
        const images = [image];
        let imagePath = null;
        if (image) {
          imagePath = await this.downloadImage(image, videoId);
        }
        return {
          videoId,
          url: loadUrl,
          title,
          description,
          images,
          imagePath,
          timestamp: new Date().toISOString(),
        };
      }

      // Link shop PDP (không có og_info): Chỉ thử axios (không mở browser → tránh Security Check)
      if (this.isShopPdpUrl(expandedUrl)) {
        console.log("111111111111111111111");
        const meta = await this.fetchMetaAxios(loadUrl);
        console.log({ "22222222222222222222222": meta });
        const title =
          (meta && meta.title) ||
          this.extractSlugFromShopUrl(loadUrl) ||
          "Sản phẩm TikTok";
        const description =
          (meta && meta.description) ||
          `Mua ${title} trên TikTok Shop. Săn giá siêu hời, freeship đơn đủ điều kiện.`;
        const image = (meta && meta.image) || "";
        const images = image ? [image] : [];
        let imagePath = null;
        if (image) imagePath = await this.downloadImage(image, videoId);

        console.log("33333333333333333333333", image, title, description);
        return {
          videoId,
          url: loadUrl,
          title,
          description,
          images,
          imagePath,
          timestamp: new Date().toISOString(),
        };
      }

      // Link view/product/ID không có og_info: không mở browser (tránh Security Check)
      if (/\/view\/product\/\d+/.test(expandedUrl)) {
        console.log("44444444444444444444444");
        const title = "Sản phẩm TikTok";
        const description = `Sản phẩm TikTok Shop. Mua sắm giá tốt, freeship đơn đủ điều kiện.`;
        return {
          videoId,
          url: loadUrl,
          title,
          description,
          images: [],
          imagePath: null,
          timestamp: new Date().toISOString(),
        };
      }

      // Link video: load browser (có thể bị block)
      let browserData = {};
      try {
        browserData = await this.loadWithBrowser(loadUrl);
      } catch (e) {
        console.error("[extractor] Browser error:", e.message);
      }

      console.log({ "11111111111111111111111111111111111111": browserData });
      const title = browserData.title || ogInfoData.title || "";
      const description =
        (browserData.description && browserData.description.trim()) ||
        (ogInfoData.title
          ? `Mua ${ogInfoData.title} trên TikTok Shop. Săn giá siêu hời.`
          : "");
      const image = browserData.image || ogInfoData.image || "";

      let images = browserData.images || [];
      if (images.length === 0 && image) images = [image];
      if (images.length === 0 && ogInfoData.image) images = [ogInfoData.image];

      let imagePath = null;
      if (images.length > 0) {
        imagePath = await this.downloadImage(images[0], videoId);
      }

      return {
        videoId,
        url: browserData.url || loadUrl,
        title,
        description,
        images,
        imagePath,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[extractor] Error:", error);
      throw error;
    }
  }

  async expandShortUrl(shortUrl) {
    try {
      const res = await axios.get(shortUrl, {
        maxRedirects: 10,
        timeout: 10000,
        headers: { "User-Agent": DESKTOP_UA },
      });
      return (
        res.request.res?.responseUrl ||
        res.request._redirectable?._currentUrl ||
        shortUrl
      );
    } catch (err) {
      return (
        err.request?.res?.responseUrl ||
        err.request?._redirectable?._currentUrl ||
        shortUrl
      );
    }
  }

  isValidTikTokUrl(url) {
    return /^https?:\/\/(www\.)?(tiktok\.com|vt\.tiktok\.com|vm\.tiktok\.com|m\.tiktok\.com)/.test(
      url,
    );
  }

  extractVideoId(url) {
    const clean = url.split("?")[0].split("#")[0].replace(/\/+$/, "");
    return (
      clean.match(/\/video\/(\d+)/)?.[1] ||
      clean.match(/\/photo\/(\d+)/)?.[1] ||
      clean.match(/\/product\/(\d+)/)?.[1] ||
      clean.match(/\/pdp\/[^/]+\/(\d+)/)?.[1] ||
      clean.match(/\/shop\/[^/]+\/pdp\/[^/]+\/(\d+)/)?.[1] ||
      clean.match(/tiktok\.com\/([a-zA-Z0-9_-]{6,})/)?.[1] ||
      clean.match(/\/([a-zA-Z0-9_-]{6,})$/)?.[1] ||
      null
    );
  }

  /** Link shop PDP: /shop/vn/pdp/slug/productId */
  isShopPdpUrl(url) {
    return /tiktok\.com\/shop\/[^/]+\/pdp\//.test(url || "");
  }

  /** Lấy slug từ URL shop PDP → chuyển thành title (dấu - → space) */
  extractSlugFromShopUrl(url) {
    const m = (url || "").match(/\/pdp\/([^/]+)\/\d+/);
    if (!m) return "";
    return m[1].replace(/-/g, " ").trim();
  }

  /**
   * Lấy data sản phẩm TikTok Shop bằng Playwright + network interception.
   * Bắt toàn bộ JSON API response khi trang load, parse product data từ đó.
   */
  async fetchMetaAxios(pageUrl) {
    let browser;
    try {
      browser = await chromium.launch({
        executablePath: PUPPETEER_CHROMIUM,
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox", "--window-size=1280,800"],
      });

      const context = await browser.newContext({
        userAgent: DESKTOP_UA,
        viewport: { width: 1280, height: 800 },
        locale: "vi-VN",
        extraHTTPHeaders: {
          "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
          "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"macOS"',
        },
      });

      // Bắt network response trước khi goto
      let capturedProduct = null;
      const capturedResponses = [];

      page.on("response", async (response) => {
        const url = response.url();
        // Bắt tất cả JSON response có thể chứa product data
        const isJsonApi =
          (url.includes("/api/") || url.includes("/v1/") || url.includes("/product") || url.includes("/item")) &&
          !url.includes(".js") && !url.includes(".css");

        if (!isJsonApi) return;

        try {
          const ct = response.headers()["content-type"] || "";
          if (!ct.includes("json")) return;
          const json = await response.json();
          console.log("[intercept] API hit:", url.substring(0, 100));
          capturedResponses.push({ url, json });

          // Thử parse product từ nhiều schema khác nhau
          const p =
            json?.data?.product ||
            json?.data?.item ||
            json?.data?.itemInfo ||
            json?.result?.product ||
            json?.product ||
            json?.item ||
            json?.props?.pageProps?.product ||
            json?.props?.pageProps?.itemInfo?.itemStruct;

          if (p && (p.title || p.name || p.item_name)) {
            capturedProduct = {
              title: p.title || p.name || p.item_name || "",
              description: p.description || p.desc || p.item_description || "",
              image:
                (Array.isArray(p.images) ? p.images[0] : "") ||
                p.cover_image_url || p.main_image || p.cover || "",
            };
            console.log("[intercept] Product captured:", capturedProduct.title?.substring(0, 60));
          }
        } catch (_) {}
      });

      console.log("[intercept] Navigating:", pageUrl);
      try {
        await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      } catch (_) {}

      // Chờ tối đa 15s để API responses về
      for (let i = 0; i < 30; i++) {
        await new Promise((r) => setTimeout(r, 500));
        if (capturedProduct) break;
      }

      // Nếu network intercept không ra data, thử đọc thẳng từ DOM
      if (!capturedProduct) {
        console.log("[intercept] No API data, trying DOM...");
        capturedProduct = await page.evaluate(() => {
          // 1. __NEXT_DATA__
          try {
            const nd = document.getElementById("__NEXT_DATA__");
            if (nd) {
              const j = JSON.parse(nd.textContent || "{}");
              const p =
                j?.props?.pageProps?.product ||
                j?.props?.pageProps?.itemInfo?.itemStruct ||
                j?.props?.pageProps?.dehydratedState?.queries?.[0]?.state?.data?.product;
              if (p && (p.title || p.name)) {
                return {
                  title: p.title || p.name || "",
                  description: p.description || p.desc || "",
                  image: (Array.isArray(p.images) ? p.images[0] : "") || p.cover || "",
                };
              }
            }
          } catch (_) {}

          // 2. Meta tags (nếu TikTok render được)
          const title =
            document.querySelector('meta[property="og:title"]')?.content ||
            document.title || "";
          const description =
            document.querySelector('meta[name="description"]')?.content ||
            document.querySelector('meta[property="og:description"]')?.content || "";
          const image =
            document.querySelector('meta[property="og:image"]')?.content || "";

          if (title.length > 5 || description.length > 5) {
            return { title, description, image };
          }

          // 3. script[type="application/json"]
          for (const s of document.querySelectorAll('script[type="application/json"]')) {
            try {
              const j = JSON.parse(s.textContent || "{}");
              const t = j?.props?.pageProps?.product?.title || j?.product?.title || j?.title;
              const d = j?.props?.pageProps?.product?.description || j?.product?.description || j?.description;
              const img = j?.props?.pageProps?.product?.images?.[0] || "";
              if (t) return { title: t, description: d || "", image: img };
            } catch (_) {}
          }

          return null;
        });
      }

      // Log tất cả API đã bắt được nếu vẫn fail (để debug)
      if (!capturedProduct) {
        console.warn("[intercept] Still no data. API responses caught:");
        capturedResponses.slice(0, 5).forEach((r) =>
          console.warn(" -", r.url.substring(0, 120)),
        );
      }

      await browser.close();
      browser = null;

      if (!capturedProduct || (!capturedProduct.title && !capturedProduct.description)) {
        return null;
      }

      return {
        title: (capturedProduct.title || "").trim(),
        description: (capturedProduct.description || "").trim(),
        image: (capturedProduct.image || "").trim(),
      };
    } catch (e) {
      console.error("[intercept] fetchMetaAxios error:", e.message);
      return null;
    } finally {
      if (browser) {
        try { await browser.close(); } catch (_) {}
      }
    }
  }

  async fetchMetaFromHtml(url) {
    return new Promise((resolve) => {
      let win = null;
      let settled = false;

      const finish = (result) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        try {
          if (win && !win.isDestroyed()) win.destroy();
        } catch (_) {}
        resolve(result);
      };

      // Timeout 20s, trả về null nếu fail
      const timer = setTimeout(() => finish(null), 20000);

      const ses = session.fromPartition("persist:tiktok-extractor");

      ses.webRequest.onBeforeSendHeaders((details, callback) => {
        callback({
          requestHeaders: {
            ...details.requestHeaders,
            "User-Agent": DESKTOP_UA,
            Accept:
              "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
            "sec-ch-ua":
              '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"macOS"',
          },
        });
      });

      win = new BrowserWindow({
        show: false,
        width: 1280,
        height: 800,
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
          javascript: true,
          images: false,
          session: ses,
        },
      });

      // Xóa webdriver flag trước khi TikTok JS chạy
      win.webContents.on("dom-ready", async () => {
        try {
          await win.webContents.executeJavaScript(
            `Object.defineProperty(navigator, 'webdriver', { get: () => false });`,
          );
        } catch (_) {}
      });

      // Poll mỗi 500ms sau khi load xong
      // Meta tags xuất hiện ngay khi React Helmet chạy (~1-3s)
      win.webContents.on("did-finish-load", async () => {
        console.log("[extractor] fetchMeta: page loaded, polling...");
        let attempts = 0;

        const interval = setInterval(async () => {
          if (settled || !win || win.isDestroyed()) {
            clearInterval(interval);
            return;
          }
          attempts++;

          try {
            const result = await win.webContents.executeJavaScript(`
              (() => {
                const title = document.title || '';
                // Nếu vẫn còn Security Check page thì chờ tiếp
                if (title.toLowerCase().includes('security') || title.toLowerCase().includes('captcha')) {
                  return { blocked: true };
                }

                const description = document.querySelector('meta[name="description"]')?.content
                  || document.querySelector('meta[property="og:description"]')?.content || '';
                const ogTitle = document.querySelector('meta[property="og:title"]')?.content
                  || document.title || '';
                const image = document.querySelector('meta[property="og:image"]')?.content || '';
                const canonUrl = document.querySelector('link[rel="canonical"]')?.href || window.location.href;

                // Có data thật khi description hoặc title xuất hiện
                const hasData = description.length > 5 || (ogTitle.length > 5 && !ogTitle.toLowerCase().includes('security'));
                return { blocked: false, hasData, title: ogTitle, description, image, url: canonUrl };
              })()
            `);

            if (result.blocked) {
              console.log(
                `[extractor] fetchMeta: still blocked attempt ${attempts}`,
              );
              if (attempts >= 20) {
                clearInterval(interval);
                finish(null);
              }
              return;
            }

            if (result.hasData || attempts >= 20) {
              clearInterval(interval);
              console.log("[extractor] fetchMeta result:", {
                title: result.title?.substring(0, 50),
                description: result.description?.substring(0, 80),
              });
              finish(result.hasData ? result : null);
            }
          } catch (e) {
            if (attempts >= 20) {
              clearInterval(interval);
              finish(null);
            }
          }
        }, 500);
      });

      win.webContents.on("did-fail-load", (_, code) => {
        if (code !== -3) finish(null);
      });

      console.log("[extractor] fetchMeta browser loading:", url);
      win.loadURL(url).catch(() => finish(null));
    });
  }

  async downloadImage(imageUrl, videoId) {
    try {
      const res = await axios.get(imageUrl, {
        responseType: "arraybuffer",
        timeout: 10000,
      });
      const imagePath = path.join(this.tempDir, `tiktok_${videoId}.jpg`);
      await fs.writeFile(imagePath, res.data);
      console.log("[extractor] Image saved:", imagePath);
      return imagePath;
    } catch (e) {
      console.error("[extractor] downloadImage failed:", e.message);
      return null;
    }
  }
}

module.exports = new TikTokExtractor();
