const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

class SoraAutomation {
  constructor() {
    this.browser = null;
    this.soraUrl = 'https://sora.chatgpt.com';
    this.maxRetries = 3;
  }

  async initBrowser() {
    // If browser exists but is disconnected, clear it
    if (this.browser && !this.browser.isConnected()) {
      console.log('Previous browser instance was disconnected. Cleaning up...');
      this.browser = null;
    }

    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        userDataDir: path.join(os.tmpdir(), 'tiktok-sora-chrome-user-data'),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--window-size=1440,900',
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        defaultViewport: null,
      });

      // Listen for browser close/disconnect events
      this.browser.on('disconnected', () => {
        console.log('Browser was closed or disconnected.');
        this.browser = null;
      });
    }
    return this.browser;
  }

  async createVideoWithCharacter(imageData, prompt, options = {}) {
    const { characterId = 'vuluu2k.thao', resolution = '16:9', duration = '5s', videoCount = '1' } = options;
    let browser = null;
    try {
      browser = await this.initBrowser();
      const pages = await browser.pages();
      const page = pages.length > 0 ? pages[0] : await browser.newPage();

      // Set viewport
      await page.setViewport({ width: 1280, height: 720 });

      console.log('Navigating to Sora...');
      await page.goto(this.soraUrl, { waitUntil: 'networkidle2' });

      // Wait for page to load
      await new Promise(r => setTimeout(r, 3000));

      // Check if login is required
      let isLoggedIn = await this.checkLogin(page);
      if (!isLoggedIn) {
        console.log('Please login manually. Waiting for authentication... (Timeout: 5 minutes)');
        let waitCount = 0;
        const maxWait = 100; // 100 * 3s = 300s (5 minutes)

        while (!isLoggedIn && waitCount < maxWait) {
          await new Promise(r => setTimeout(r, 3000));
          isLoggedIn = await this.checkLogin(page);
          waitCount++;

          if (waitCount % 10 === 0) {
            console.log(`Still waiting for login... (${Math.floor(waitCount * 3)}s elapsed)`);
          }
        }

        if (!isLoggedIn) {
          throw new Error('Login timeout after 5 minutes.');
        } else {
          console.log('Login successful! Proceeding with automation...');
          await new Promise(r => setTimeout(r, 2000)); // Wait a bit after login completes
        }
      }

      // Upload image if provided
      if (imageData && fs.existsSync(imageData)) {
        console.log('Uploading image...');
        await this.uploadImage(page, imageData);
        await new Promise(r => setTimeout(r, 2000));
      }

      // Enter prompt
      console.log('Entering prompt...');
      await this.enterPrompt(page, prompt);
      await new Promise(r => setTimeout(r, 1000));

      // Select character
      console.log(`Selecting character: ${characterId}`);
      await this.selectCharacter(page, characterId);

      // Apply video settings: resolution, duration, videoCount
      console.log(`Setting options -> Resolution: ${resolution}, Duration: ${duration}, Count: ${videoCount}`);
      await this.applyVideoSettings(page, { resolution, duration, videoCount });

      console.log('Waiting a bit before submitting... ⏳');
      await new Promise(r => setTimeout(r, 4000));

      // Submit video generation
      console.log('Submitting video generation...');
      await this.submitVideoGeneration(page);

      // Wait for video to be generated
      console.log('Waiting for video generation to complete...');
      const videoUrl = await this.waitForVideoGeneration(page);

      console.log('Video generated successfully:', videoUrl);

      // Don't close browser - keep it open for user
      // await browser.close();

      return {
        success: true,
        videoUrl,
        characterId,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error in Sora automation:', error);
      throw error;
    }
  }

  async checkLogin(page) {
    try {
      // The most reliable way to check if logged in is to see if we can enter a prompt
      // or if we are on the main app page with its UI elements
      const isLoggedIn = await page.evaluate(() => {
        // Find text area or input field for prompt
        const textarea = document.querySelector('textarea');
        const editable = document.querySelector('[contenteditable="true"]');
        const textbox = document.querySelector('[role="textbox"]');

        // Also check if user profile picture or specific authenticated UI elements are present
        const avatar = document.querySelector('img[alt*="profile"], [data-testid="profile-button"]');

        // If any of these exist, we are likely logged in and ready
        if (textarea || editable || textbox || avatar) {
          return true;
        }

        // Check for common login indicators
        const loginBtn = document.querySelector('[data-testid="login-button"], button[id*="login"], a[href*="login"]');
        const welcomeText = Array.from(document.querySelectorAll('h1, h2')).some(el =>
          el.textContent.toLowerCase().includes('welcome') ||
          el.textContent.toLowerCase().includes('chào mừng')
        );

        if (loginBtn || welcomeText) {
          return false;
        }

        // If we can't find anything, be safe and assume not logged in to give user a chance to check
        return false;
      });

      return isLoggedIn;
    } catch (e) {
      console.warn('Error checking login status:', e.message);
      return false; // Safest default is to wait if we get an error evaluating
    }
  }

  async uploadImage(page, imagePath) {
    try {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(imagePath);
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (error) {
      console.warn('Could not upload image:', error.message);
    }
  }

  async enterPrompt(page, prompt) {
    let promptEntered = false;
    // Xóa bỏ các ký tự xuống dòng để tránh việc Puppeteer tự động bấm Enter giữa chừng
    const safePrompt = prompt.replace(/[\r\n]+/g, ' ').trim();

    try {
      // Find text area or input field for prompt
      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.click();
        await new Promise(r => setTimeout(r, 500));
        await textarea.type(safePrompt, { delay: 15 });
        promptEntered = true;
      }

      if (!promptEntered) {
        const editable = await page.$('[contenteditable="true"]');
        if (editable) {
          await editable.click();
          await new Promise(r => setTimeout(r, 500));
          await page.keyboard.type(safePrompt, { delay: 15 });
          promptEntered = true;
        }
      }

      if (!promptEntered) {
        const textbox = await page.$('[role="textbox"]');
        if (textbox) {
          await textbox.click();
          await new Promise(r => setTimeout(r, 500));
          await page.keyboard.type(safePrompt, { delay: 15 });
          promptEntered = true;
        }
      }

      this.lastPromptEntered = promptEntered;
    } catch (error) {
      console.warn('Could not enter prompt:', error.message);
    }
  }

  async selectCharacter(page, characterId) {
    if (!characterId) return;
    try {
      console.log(`Selecting character: @${characterId}...`);

      // Thêm khoảng trắng trước @ nếu cần
      await page.keyboard.type(' ', { delay: 50 });
      await new Promise(r => setTimeout(r, 300));

      // Gõ ký tự @ để trigger dropdown mention
      await page.keyboard.type('@', { delay: 50 });
      await new Promise(r => setTimeout(r, 2000));

      // Gõ tên nhân vật để search/filter trong dropdown
      await page.keyboard.type(characterId, { delay: 30 });
      await new Promise(r => setTimeout(r, 2000));

      // Thử tìm và click vào suggestion item trong dropdown
      let characterSelected = false;

      try {
        characterSelected = await page.evaluate((charId) => {
          // Tìm các dropdown/listbox/menu items
          const selectors = [
            '[role="listbox"] [role="option"]',
            '[role="menu"] [role="menuitem"]',
            '[data-testid*="mention"]',
            '[data-testid*="suggestion"]',
            '[class*="mention"] li',
            '[class*="suggestion"] li',
            '[class*="dropdown"] li',
            '[class*="autocomplete"] li',
            'ul[role="listbox"] li',
            '[class*="popup"] li',
            '[class*="popover"] li',
          ];

          for (const selector of selectors) {
            const items = document.querySelectorAll(selector);
            for (const item of items) {
              const text = item.textContent.toLowerCase();
              if (text.includes('create')) continue; // Bỏ qua nút Create
              if (text.includes(charId.toLowerCase()) || text.includes(charId.split('.').pop())) {
                item.click();
                return true;
              }
            }
          }

          // Fallback: tìm bất kỳ element nào chứa text nhân vật và có thể click
          const allElements = document.querySelectorAll('div, span, li, a, button, p');
          for (const el of allElements) {
            const text = el.textContent.trim().toLowerCase();
            if (text.includes('create')) continue; // Bỏ qua nút Create

            const rect = el.getBoundingClientRect();
            // Chỉ xét element nhỏ (suggestion item), không phải container lớn
            if (
              (text.includes(charId.toLowerCase()) || text.includes(charId.split('.').pop())) &&
              rect.height > 0 && rect.height < 100 &&
              rect.width > 0 && rect.width < 500
            ) {
              el.click();
              return true;
            }
          }

          return false;
        }, characterId);
      } catch (e) {
        console.warn(`Lỗi khi tìm suggestion: ${e.message}`);
      }

      if (!characterSelected) {
        // Fallback: nhấn Enter để chọn suggestion đầu tiên (nếu dropdown đã hiển thị)
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 1000));
      }

      await new Promise(r => setTimeout(r, 1500));
    } catch (error) {
      console.warn('Could not select character:', error.message);
    }
  }

  async applyVideoSettings(page, { resolution, duration, videoCount }) {
    try {
      console.log('Interacting with Sora UI for video settings...');

      await page.evaluate(async (settings) => {
        const { resolution, duration, videoCount } = settings;
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        // Helper block to find elements containing any of the text alternatives
        const clickOptionByText = async (texts) => {
          // Broad list of selectors where Sora might place buttons and labels
          const selectors = [
            'button',
            '[role="button"]',
            '[role="option"]',
            '[role="menuitem"]',
            '[role="tab"]',
            '[role="radio"]',
            'div[class*="item"]',
            'div[class*="option"]',
            'span',
            'li'
          ];

          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            for (const el of elements) {
              const elText = el.textContent.trim().toLowerCase();
              if (!elText) continue;

              // Exact match or contains for special formats
              const match = texts.some(t => {
                const searchStr = t.toLowerCase();
                // To avoid clicking "16" in "16:9" when looking for "1", we can check if it's the exact string
                // or contains it safely.
                return elText === searchStr || elText.includes(searchStr);
              });

              if (match) {
                // Click and yield to allow UI updates (e.g. dropdown opening/closing)
                el.click();
                await wait(800);
                return true;
              }
            }
          }
          return false;
        };

        // 1. Resolution
        const resTexts = resolution === '16:9' ? ['16:9', 'ngang', 'landscape', 'màn hình ngang'] : ['9:16', 'dọc', 'portrait', 'màn hình dọc'];
        await clickOptionByText(resTexts);

        // Try again in case the first click only opened a menu
        await clickOptionByText(resTexts);

        // 2. Duration
        const durTexts = [duration, `${duration}s`, duration.replace('s', ' giây')];
        await clickOptionByText(durTexts);
        await clickOptionByText(durTexts);

        // 3. Count
        const countTexts = [`${videoCount} variation`, `variations: ${videoCount}`, `số lượng: ${videoCount}`, `x${videoCount}`, `${videoCount} video`];
        await clickOptionByText(countTexts);
        await clickOptionByText(countTexts);

      }, { resolution, duration, videoCount });

      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.warn('Could not apply video settings:', error.message);
    }
  }

  async submitVideoGeneration(page) {
    try {
      console.log('Finalizing page state before submit... ⏳');
      await new Promise(r => setTimeout(r, 500));

      console.log('Pressing Enter twice to submit to Sora...');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 500)); // Đợi một nhịp
      await page.keyboard.press('Enter');

      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.warn('Could not submit video generation:', error.message);
    }
  }

  async waitForVideoGeneration(page, timeout = 600000) {
    // Wait up to 10 minutes for video generation
    const startTime = Date.now();
    const maxWaitTime = timeout;

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Look for video URL in the page
        const videoUrl = await page.evaluate(() => {
          // Check for video in various locations
          const videoElement = document.querySelector('video source');
          if (videoElement) {
            return videoElement.src;
          }

          const downloadLink = document.querySelector('a[download*="video"], a[href*="video"]');
          if (downloadLink) {
            return downloadLink.href;
          }

          return null;
        });

        if (videoUrl) {
          return videoUrl;
        }

        // Check for error message
        const errorMessage = await page.$('.error-message, [role="alert"]');
        if (errorMessage) {
          const errorText = await page.evaluate(el => el.textContent, errorMessage);
          throw new Error(`Video generation failed: ${errorText}`);
        }

        await new Promise(r => setTimeout(r, 5000));
      } catch (error) {
        if (error.message.includes('Video generation failed')) {
          throw error;
        }
        // Continue waiting
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    throw new Error('Video generation timeout');
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new SoraAutomation();
