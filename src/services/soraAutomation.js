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
    const { characterId = 'vuluu2k.thao', resolution = '9:16', duration = '10s', videoCount = '1' } = options;
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

      // Navigate to drafts page to monitor video generation
      console.log('Navigating to drafts page...');
      await page.goto('https://sora.chatgpt.com/drafts', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 3000));

      // Wait for video to be generated on drafts page
      console.log('Waiting for video generation to complete on drafts page...');
      const videoResult = await this.waitForVideoOnDrafts(page);

      if (videoResult.success) {
        console.log('Video generated successfully!');
        return {
          success: true,
          videoUrl: videoResult.videoUrl || null,
          characterId,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          success: false,
          error: videoResult.error || 'Video generation failed',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      console.error('Error in Sora automation:', error);

      // If overload error, close browser and return friendly error
      if (error.message && error.message.includes('OVERLOAD')) {
        console.log('Sora is overloaded. Closing browser...');
        if (browser) {
          try { await browser.close(); } catch (e) { /* ignore */ }
        }
        return {
          success: false,
          error: 'Hệ thống tạo video đang quá tải. Vui lòng thử lại sau.',
          errorCode: 'OVERLOAD',
          timestamp: new Date().toISOString(),
        };
      }

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
      const fs = require('fs-extra');
      const path = require('path');
      const tempDir = path.join(__dirname, '../../../temp');
      await fs.ensureDir(tempDir);

      // Helper: dump all visible menu items for diagnostics
      const dumpMenuItems = async (label) => {
        const items = await page.evaluate(() => {
          const els = document.querySelectorAll('div[role="menuitem"], div[role="option"], div[role="radio"], div[role="menuitemradio"], [data-radix-collection-item], [data-state]');
          return Array.from(els).map(el => {
            const rect = el.getBoundingClientRect();
            return {
              tag: el.tagName,
              role: el.getAttribute('role'),
              text: el.textContent.trim().substring(0, 80),
              dataState: el.getAttribute('data-state'),
              visible: rect.width > 0 && rect.height > 0,
              w: Math.round(rect.width),
              h: Math.round(rect.height)
            };
          }).filter(i => i.visible && i.text.length > 0);
        });
        console.log(`--- ${label} (${items.length} items) ---`);
        items.forEach((item, i) => console.log(`  [${i}] ${item.tag} role=${item.role} state=${item.dataState} "${item.text}"`));
        console.log('---');
        return items;
      };

      // Helper: click a menu item by text, returns true if clicked
      const clickMenuItemByText = async (searchTexts, logLabel) => {
        console.log(`  Looking for: [${searchTexts.join(', ')}]`);
        const result = await page.evaluate((texts) => {
          // Search broadly in all interactive elements
          const allElements = document.querySelectorAll('div[role="menuitem"], div[role="option"], div[role="radio"], div[role="menuitemradio"], button, [data-radix-collection-item]');
          for (const el of allElements) {
            const elText = (el.textContent || '').trim().toLowerCase();
            if (!elText) continue;
            for (const t of texts) {
              const searchStr = t.toLowerCase();
              if (elText.includes(searchStr)) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  el.click();
                  return { clicked: true, matchedText: elText, searchedFor: t };
                }
              }
            }
          }
          return { clicked: false };
        }, searchTexts);

        if (result.clicked) {
          console.log(`  ✅ Clicked: "${result.matchedText}" (matched "${result.searchedFor}")`);
        } else {
          console.log(`  ❌ Not found`);
        }
        await new Promise(r => setTimeout(r, 1000));
        return result.clicked;
      };

      // Helper: click a RADIO sub-menu item by text (only targets menuitemradio elements)
      const clickRadioByText = async (searchTexts, logLabel) => {
        console.log(`  Looking for radio: [${searchTexts.join(', ')}]`);
        const result = await page.evaluate((texts) => {
          // ONLY target menuitemradio elements - these are the actual selectable sub-menu options
          const allElements = document.querySelectorAll('div[role="menuitemradio"]');
          for (const el of allElements) {
            const elText = (el.textContent || '').trim().toLowerCase();
            if (!elText) continue;
            for (const t of texts) {
              const searchStr = t.toLowerCase();
              if (elText === searchStr || elText.includes(searchStr)) {
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                  el.click();
                  return { clicked: true, matchedText: elText, searchedFor: t };
                }
              }
            }
          }
          return { clicked: false };
        }, searchTexts);

        if (result.clicked) {
          console.log(`  ✅ Radio clicked: "${result.matchedText}" (matched "${result.searchedFor}")`);
        } else {
          console.log(`  ❌ Radio not found`);
        }
        await new Promise(r => setTimeout(r, 1000));
        return result.clicked;
      };

      // ===== Step 1: Open the Settings popup =====
      console.log('Step 1: Opening settings menu...');
      const settingsButtons = await page.$$('button[aria-label="Settings"]');

      if (settingsButtons.length > 0) {
        const targetBtn = settingsButtons[settingsButtons.length - 1];
        await targetBtn.click();
        console.log(`Clicked Settings button (found ${settingsButtons.length}, clicked last).`);
        await new Promise(r => setTimeout(r, 1500));
      } else {
        console.warn('Could not find Settings button!');
        return;
      }

      // Dump what's visible in the settings popup
      await dumpMenuItems('Settings popup items');
      await page.screenshot({ path: path.join(tempDir, 'sora_settings_menu_open.png') });

      // ===== Step 2: Set Orientation =====
      const desiredOrientation = resolution === '16:9' ? 'landscape' : 'portrait';
      console.log(`Step 2: Setting orientation to ${desiredOrientation}...`);

      const clickedOrientationRow = await clickMenuItemByText(['orientation', 'hướng'], 'Orientation row');
      if (clickedOrientationRow) {
        await new Promise(r => setTimeout(r, 1000));
        // Dump sub-menu items
        await dumpMenuItems('Orientation sub-menu');
        await page.screenshot({ path: path.join(tempDir, 'sora_orientation_submenu.png') });

        // Select the desired orientation
        const orientationTexts = resolution === '16:9'
          ? ['landscape', 'ngang', '16:9']
          : ['portrait', 'dọc', '9:16'];
        await clickRadioByText(orientationTexts, 'Orientation value');

        await new Promise(r => setTimeout(r, 800));
      } else {
        console.warn('Could not find Orientation menu item.');
      }

      // ===== Step 3: Set Duration =====
      const durationValue = duration.replace('s', '');
      console.log(`Step 3: Setting duration to ${duration}...`);

      const clickedDurationRow = await clickMenuItemByText(['duration', 'thời lượng'], 'Duration row');
      if (clickedDurationRow) {
        await new Promise(r => setTimeout(r, 1000));
        await dumpMenuItems('Duration sub-menu');
        await page.screenshot({ path: path.join(tempDir, 'sora_duration_submenu.png') });

        await clickRadioByText([`${durationValue} seconds`, `${durationValue}s`, duration], 'Duration value');

        await new Promise(r => setTimeout(r, 800));
      } else {
        console.warn('Could not find Duration menu item.');
      }

      // ===== Step 4: Set Video count =====
      console.log(`Step 4: Setting video count to ${videoCount}...`);

      const clickedVideosRow = await clickMenuItemByText(['videos', 'số lượng'], 'Videos row');
      if (clickedVideosRow) {
        await new Promise(r => setTimeout(r, 1000));
        await dumpMenuItems('Videos sub-menu');
        await page.screenshot({ path: path.join(tempDir, 'sora_videos_submenu.png') });

        await clickRadioByText([`${videoCount} video`], 'Video count value');

        await new Promise(r => setTimeout(r, 800));
      } else {
        console.warn('Could not find Videos menu item.');
      }

      // Final screenshot
      await page.screenshot({ path: path.join(tempDir, 'sora_after_video_settings.png') });
      console.log('All video settings steps completed.');

      // Close settings menu by pressing Escape
      await page.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 1000));

    } catch (error) {
      console.error('Error applying video settings:', error);
    }
  }

  async submitVideoGeneration(page) {
    try {
      console.log('Finalizing page state before submit... ⏳');
      await new Promise(r => setTimeout(r, 500));

      const clickedCreate = await page.evaluate(() => {
        const createSpans = Array.from(document.querySelectorAll('span')).filter(s =>
          s.textContent && (s.textContent.toLowerCase() === 'create video' || s.textContent.toLowerCase() === 'tạo video')
        );
        for (const span of createSpans) {
          const btn = span.closest('button');
          if (btn) {
            btn.click();
            return true;
          }
        }

        // Fallback to sending Enter if focus is on composer
        const composer = document.querySelector('textarea, [contenteditable="true"], [role="textbox"]');
        if (composer) {
          composer.focus();
          return false;
        }
        return false;
      });

      if (clickedCreate) {
        console.log('Clicked "Create video" button.');
      } else {
        console.log('Could not find Create button, falling back to pressing Enter...');
        await page.keyboard.press('Enter');
        await new Promise(r => setTimeout(r, 500));
        await page.keyboard.press('Enter');
      }

      // Wait and check for overload error
      await new Promise(r => setTimeout(r, 3000));

      const overloadError = await page.evaluate(() => {
        const allText = document.body.innerText.toLowerCase();
        if (allText.includes('unable to generate') || allText.includes('heavy load') || allText.includes('try again later')) {
          return true;
        }
        // Also check toast/alert elements specifically
        const alerts = document.querySelectorAll('[role="alert"], [class*="toast"], [class*="error"], [class*="snackbar"]');
        for (const alert of alerts) {
          const text = (alert.textContent || '').toLowerCase();
          if (text.includes('unable') || text.includes('heavy load') || text.includes('try again')) {
            return true;
          }
        }
        return false;
      });

      if (overloadError) {
        throw new Error('OVERLOAD: Hệ thống tạo video đang quá tải. Vui lòng thử lại sau.');
      }
    } catch (error) {
      if (error.message.includes('OVERLOAD')) {
        throw error; // Re-throw overload error to be handled by caller
      }
      console.warn('Could not submit video generation:', error.message);
    }
  }

  async waitForVideoGeneration(page, timeout = 600000) {
    // Wait up to 10 minutes for video generation
    const startTime = Date.now();
    const maxWaitTime = timeout;

    while (Date.now() - startTime < maxWaitTime) {
      try {
        // Check for overload / error messages first
        const errorInfo = await page.evaluate(() => {
          const allText = document.body.innerText.toLowerCase();
          if (allText.includes('unable to generate') || allText.includes('heavy load') || allText.includes('try again later')) {
            return { isOverload: true };
          }
          const alerts = document.querySelectorAll('[role="alert"], [class*="toast"], [class*="error"]');
          for (const alert of alerts) {
            const text = (alert.textContent || '').toLowerCase();
            if (text.includes('unable') || text.includes('heavy load') || text.includes('try again')) {
              return { isOverload: true };
            }
          }
          return { isOverload: false };
        });

        if (errorInfo.isOverload) {
          throw new Error('OVERLOAD: Hệ thống tạo video đang quá tải. Vui lòng thử lại sau.');
        }

        // Look for video URL in the page
        const videoUrl = await page.evaluate(() => {
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

        // Check for other error messages
        const errorMessage = await page.$('.error-message, [role="alert"]');
        if (errorMessage) {
          const errorText = await page.evaluate(el => el.textContent, errorMessage);
          throw new Error(`Video generation failed: ${errorText}`);
        }

        await new Promise(r => setTimeout(r, 5000));
      } catch (error) {
        if (error.message.includes('OVERLOAD') || error.message.includes('Video generation failed')) {
          throw error;
        }
        // Continue waiting
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    throw new Error('Video generation timeout');
  }

  async waitForVideoOnDrafts(page, timeout = 600000) {
    const startTime = Date.now();
    const fs = require('fs-extra');
    const path = require('path');
    const tempDir = path.join(__dirname, '../../../temp');
    await fs.ensureDir(tempDir);

    console.log('Monitoring drafts page for completed videos...');

    // Phase 1: Wait until all videos are done generating
    while (Date.now() - startTime < timeout) {
      try {
        // Check for overload errors
        const hasOverload = await page.evaluate(() => {
          const text = document.body.innerText.toLowerCase();
          return text.includes('unable to generate') || text.includes('heavy load');
        });
        if (hasOverload) {
          throw new Error('OVERLOAD: Hệ thống tạo video đang quá tải. Vui lòng thử lại sau.');
        }

        // Check draft items status
        const draftStatus = await page.evaluate(() => {
          const videos = document.querySelectorAll('video');

          // Check for progress indicators (still generating)
          const loadingIndicators = document.querySelectorAll('[class*="loading"], [class*="spinner"], [class*="progress"], [role="progressbar"]');
          const processingText = document.body.innerText.toLowerCase();
          const isProcessing = processingText.includes('generating') || processingText.includes('processing') || processingText.includes('creating');

          // Count video links
          const allLinks = Array.from(document.querySelectorAll('a'));
          const draftLinks = allLinks.filter(a => {
            const href = a.getAttribute('href') || '';
            return href.includes('/v/') || href.includes('/video/');
          });

          return {
            videoCount: videos.length,
            draftLinksCount: draftLinks.length,
            isProcessing: isProcessing || loadingIndicators.length > 0,
            loadingCount: loadingIndicators.length,
          };
        });

        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`[${elapsed}s] Drafts: ${draftStatus.draftLinksCount} links, ${draftStatus.videoCount} videos, processing: ${draftStatus.isProcessing}`);

        // All videos are done when there are links and no processing
        if (draftStatus.draftLinksCount > 0 && !draftStatus.isProcessing) {
          console.log('All videos completed on drafts page! Posting them...');
          await page.screenshot({ path: path.join(tempDir, 'sora_drafts_completed.png') });

          // Click each draft video to post it
          const draftCount = draftStatus.draftLinksCount;
          for (let i = 0; i < draftCount; i++) {
            try {
              console.log(`Posting video ${i + 1}/${draftCount}...`);

              // Click the first available draft link (after posting, it disappears)
              const clicked = await page.evaluate(() => {
                const allLinks = Array.from(document.querySelectorAll('a'));
                const draftLinks = allLinks.filter(a => {
                  const href = a.getAttribute('href') || '';
                  return href.includes('/v/') || href.includes('/video/');
                });
                if (draftLinks.length > 0) {
                  draftLinks[0].click();
                  return true;
                }
                return false;
              });

              if (clicked) {
                await new Promise(r => setTimeout(r, 3000));
                await page.screenshot({ path: path.join(tempDir, `sora_post_video_${i + 1}.png`) });
                console.log(`Video ${i + 1} posted!`);

                // Go back to drafts for the next one
                if (i < draftCount - 1) {
                  await page.goto('https://sora.chatgpt.com/drafts', { waitUntil: 'networkidle2', timeout: 15000 });
                  await new Promise(r => setTimeout(r, 2000));
                }
              }
            } catch (postErr) {
              console.warn(`Error posting video ${i + 1}:`, postErr.message);
            }
          }

          break;
        }

        if (draftStatus.isProcessing) {
          console.log('Videos still generating... waiting...');
        }

        // Reload drafts page periodically to get fresh state
        if (elapsed > 0 && elapsed % 30 === 0) {
          console.log('Refreshing drafts page...');
          await page.reload({ waitUntil: 'networkidle2', timeout: 15000 });
          await new Promise(r => setTimeout(r, 2000));
        }

        await new Promise(r => setTimeout(r, 5000));
      } catch (error) {
        if (error.message.includes('OVERLOAD')) {
          throw error;
        }
        console.warn('Error checking drafts:', error.message);
        await new Promise(r => setTimeout(r, 5000));
      }
    }

    // Check if we timed out
    if (Date.now() - startTime >= timeout) {
      return {
        success: false,
        error: 'Video generation timeout after 10 minutes.',
      };
    }

    // Phase 2: Navigate to profile page to get video links
    console.log('Navigating to profile page to extract video links...');
    try {
      await page.goto('https://sora.chatgpt.com/profile', { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 3000));

      await page.screenshot({ path: path.join(tempDir, 'sora_profile_page.png') });

      // Extract video links from anchor tags
      const videoUrls = await page.evaluate(() => {
        const allLinks = Array.from(document.querySelectorAll('a'));
        const videoLinks = allLinks
          .map(a => {
            const href = a.getAttribute('href') || '';
            // Match video-specific links like /v/xxx or /video/xxx
            if (href.includes('/v/') || href.includes('/video/')) {
              // Build full URL if relative
              if (href.startsWith('/')) {
                return window.location.origin + href;
              }
              return href;
            }
            return null;
          })
          .filter(Boolean);

        // Remove duplicates
        return [...new Set(videoLinks)];
      });

      console.log(`Found ${videoUrls.length} video links on profile page:`, videoUrls);

      if (videoUrls.length > 0) {
        return {
          success: true,
          videoUrl: videoUrls, // Return as array
        };
      }

      // Fallback: no links found, return current page URL
      console.warn('No video links found on profile page, returning page URL');
      return {
        success: true,
        videoUrl: [page.url()],
      };
    } catch (error) {
      console.error('Error navigating to profile:', error.message);
      return {
        success: true,
        videoUrl: [],
      };
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}

module.exports = new SoraAutomation();
