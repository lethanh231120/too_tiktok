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
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      });
    }
    return this.browser;
  }

  async createVideoWithCharacter(imageData, prompt, characterId = 'vuluu2k.thao') {
    let browser = null;
    try {
      browser = await this.initBrowser();
      const page = await browser.newPage();

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
      await page.waitForTimeout(1000);

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
    try {
      // Find text area or input field for prompt
      const promptField = await page.$('textarea[placeholder*="prompt"], input[placeholder*="prompt"]');
      if (promptField) {
        await promptField.click();
        await page.keyboard.type(prompt, { delay: 20 });
      } else {
        // Alternative: look for contenteditable element
        const editableDiv = await page.$('[contenteditable="true"]');
        if (editableDiv) {
          await editableDiv.click();
          await page.keyboard.type(prompt, { delay: 20 });
        }
      }
    } catch (error) {
      console.warn('Could not enter prompt:', error.message);
    }
  }

  async selectCharacter(page, characterId) {
    try {
      // Look for character selection dropdown or button
      const characterSelector = await page.$('[data-testid="character-selector"]');
      if (characterSelector) {
        await characterSelector.click();
        await page.waitForTimeout(1000);

        // Find and click the specific character
        const characterOption = await page.$(
          `[data-character-id="${characterId}"], [title*="${characterId}"]`
        );
        if (characterOption) {
          await characterOption.click();
        }
      } else {
        // Alternative: search for character by name
        const searchInput = await page.$('input[placeholder*="character"], input[placeholder*="actor"]');
        if (searchInput) {
          await searchInput.click();
          await searchInput.type(characterId);
          await page.waitForTimeout(1000);
          
          // Click first result
          const firstResult = await page.$('.character-option, .actor-option, [role="option"]');
          if (firstResult) {
            await firstResult.click();
          }
        }
      }
    } catch (error) {
      console.warn('Could not select character:', error.message);
    }
  }

  async submitVideoGeneration(page) {
    try {
      // Find and click generate/submit button
      const generateButton = await page.$(
        'button[type="submit"], button:has-text("Generate"), button:has-text("Create"), button[data-testid="generate-button"]'
      );
      if (generateButton) {
        await generateButton.click();
      }
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
