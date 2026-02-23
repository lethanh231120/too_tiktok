const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');

class SoraAutomation {
  constructor() {
    this.browser = null;
    this.soraUrl = 'https://sora.chatgpt.com';
    this.maxRetries = 3;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: false,
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        userDataDir: path.join(__dirname, '../../temp/chrome-user-data'),
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--window-size=1440,900',
        ],
        ignoreDefaultArgs: ['--enable-automation'],
        defaultViewport: null,
      });
    }
    return this.browser;
  }

  async createVideoWithCharacter(imageData, prompt, characterId = 'vuluu2k.thao') {
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
      await page.waitForTimeout(3000);

      // Check if login is required
      const isLoggedIn = await this.checkLogin(page);
      if (!isLoggedIn) {
        console.log('Please login manually. Waiting for authentication...');
        await page.waitForTimeout(30000); // Wait 30 seconds for user to login
      }

      // Upload image if provided
      if (imageData && fs.existsSync(imageData)) {
        console.log('Uploading image...');
        await this.uploadImage(page, imageData);
        await page.waitForTimeout(2000);
      }

      // Enter prompt
      console.log('Entering prompt...');
      await this.enterPrompt(page, prompt);
      await page.waitForTimeout(1000);

      // Select character
      console.log(`Selecting character: ${characterId}`);
      await this.selectCharacter(page, characterId);

      console.log('Waiting a bit before submitting... ⏳');
      await page.waitForTimeout(4000);

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
      // Look for login button or check if authenticated
      const loginButton = await page.$('[data-testid="login-button"]');
      return !loginButton;
    } catch {
      return true; // Assume logged in if we can't find login button
    }
  }

  async uploadImage(page, imagePath) {
    try {
      const fileInput = await page.$('input[type="file"]');
      if (fileInput) {
        await fileInput.uploadFile(imagePath);
        await page.waitForTimeout(2000);
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

  async submitVideoGeneration(page) {
    try {
      console.log('Finalizing page state before submit... ⏳');
      await new Promise(r => setTimeout(r, 2000));

      console.log('Pressing Enter twice to submit to Sora...');
      await page.keyboard.press('Enter');
      await new Promise(r => setTimeout(r, 1000)); // Đợi một nhịp
      await page.keyboard.press('Enter');

      await new Promise(r => setTimeout(r, 2000));
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

        await page.waitForTimeout(5000);
      } catch (error) {
        if (error.message.includes('Video generation failed')) {
          throw error;
        }
        // Continue waiting
        await page.waitForTimeout(5000);
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
