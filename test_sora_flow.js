/**
 * Test script: Mở luồng Sora để render video
 * 
 * Script này sẽ:
 * 1. Khởi tạo Puppeteer browser sử dụng system Chrome
 * 2. Navigate đến sora.chatgpt.com
 * 3. Chờ user login thủ công (90 giây)
 * 4. Nhập prompt test vào giao diện Sora
 * 5. Submit tạo video
 * 6. Chờ video render xong (tối đa 10 phút)
 * 
 * Usage: node test_sora_flow.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs-extra');

const TEST_PROMPT = `A young Vietnamese woman named Thao is showcasing a trendy fashion product in a modern studio. She walks confidently with soft golden hour lighting. Camera follows her with a smooth tracking shot. Cinematic style, warm color palette, TikTok-ready vertical video.`;

const SORA_URL = 'https://sora.chatgpt.com';
const TEMP_DIR = path.join(__dirname, 'temp');
const USER_DATA_DIR = path.join(__dirname, 'temp', 'chrome-user-data');
const CHARACTER_ID = "vuluu2k.thao"

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg, type = 'info') {
  const time = new Date().toLocaleTimeString('vi-VN');
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️', step: '🔹' };
  console.log(`[${time}] ${icons[type] || '•'} ${msg}`);
}

async function testSoraFlow() {
  let browser = null;

  try {
    fs.ensureDirSync(TEMP_DIR);
    fs.ensureDirSync(USER_DATA_DIR);

    // ===== Step 1: Launch Browser =====
    log('Khởi tạo Puppeteer browser (sử dụng system Chrome)...', 'step');
    
    browser = await puppeteer.launch({
      headless: false,
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      userDataDir: USER_DATA_DIR,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
        '--window-size=1440,900',
      ],
      ignoreDefaultArgs: ['--enable-automation'],
      defaultViewport: null,
    });

    log('Browser đã khởi tạo thành công!', 'success');

    const page = await browser.newPage();
    
    // Anti-detection
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    // ===== Step 2: Navigate to Sora =====
    log('Navigating đến sora.chatgpt.com...', 'step');
    try {
      await page.goto(SORA_URL, { 
        waitUntil: 'domcontentloaded',
        timeout: 60000 
      });
    } catch (navErr) {
      log(`Navigation warning: ${navErr.message}`, 'warn');
      log('Trang có thể vẫn đang load, tiếp tục...', 'info');
    }
    // Wait additional time for dynamic content
    await sleep(5000);
    log('Đã mở trang Sora', 'success');

    // Screenshot initial state
    await page.screenshot({ path: path.join(TEMP_DIR, 'sora_initial.png'), fullPage: true });

    // ===== Step 3: Wait for login =====
    log('Kiểm tra trạng thái đăng nhập...', 'step');
    
    // Check current page URL to determine login state
    const currentUrl = page.url();
    log(`URL hiện tại: ${currentUrl}`, 'info');

    // Wait for the page to settle
    await sleep(3000);

    // Check if we need to login
    const pageState = await page.evaluate(() => {
      const body = document.body.innerText.substring(0, 500);
      // Check for login buttons via text content (has-text is Playwright-only, not valid in native DOM)
      const allBtns = Array.from(document.querySelectorAll('button, a'));
      const hasLoginBtn = allBtns.some(el => {
        const t = el.textContent.toLowerCase().trim();
        return t.includes('log in') || t.includes('sign up') || t.includes('sign in');
      });
      return {
        url: window.location.href,
        hasTextarea: !!document.querySelector('textarea'),
        hasContentEditable: !!document.querySelector('[contenteditable="true"]'),
        hasLoginBtn,
        bodyPreview: body.substring(0, 300),
      };
    });
    log(`Page state: ${JSON.stringify(pageState, null, 2)}`, 'info');

    const needsLogin = !pageState.hasTextarea && !pageState.hasContentEditable;
    
    if (needsLogin) {
      log('⏳ Cần đăng nhập! Bạn có 90 giây để đăng nhập thủ công trên browser window.', 'warn');
      log('👉 Hãy đăng nhập vào tài khoản ChatGPT/Sora', 'info');
      
      const loginTimeout = 90000;
      const loginStart = Date.now();
      let loggedIn = false;
      
      while (Date.now() - loginStart < loginTimeout) {
        try {
          const hasInput = await page.evaluate(() => {
            return !!(
              document.querySelector('textarea') || 
              document.querySelector('[contenteditable="true"]') ||
              document.querySelector('[data-testid="prompt-input"]') ||
              document.querySelector('.prompt-input')
            );
          });

          if (hasInput) {
            loggedIn = true;
            log('Đã phát hiện đăng nhập thành công!', 'success');
            break;
          }
        } catch (e) {
          // Page navigating
        }
        
        const elapsed = Math.round((Date.now() - loginStart) / 1000);
        if (elapsed % 15 === 0 && elapsed > 0) {
          log(`Đang chờ đăng nhập... (${elapsed}s / ${loginTimeout / 1000}s)`, 'info');
        }
        await sleep(3000);
      }

      if (!loggedIn) {
        log('Hết thời gian chờ đăng nhập, thử tiếp tục...', 'warn');
      }
    } else {
      log('Đã đăng nhập sẵn! (tìm thấy input area)', 'success');
    }

    await sleep(2000);
    await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_login.png'), fullPage: true });

    // ===== Step 4: Discover page elements =====
    log('Phân tích cấu trúc trang Sora...', 'step');
    
    const elements = await page.evaluate(() => {
      const results = {
        textareas: [],
        editables: [],
        buttons: [],
        inputs: [],
      };

      document.querySelectorAll('textarea').forEach(el => {
        results.textareas.push({
          id: el.id,
          name: el.name,
          placeholder: el.placeholder,
          className: el.className.substring(0, 50),
          ariaLabel: el.getAttribute('aria-label'),
        });
      });

      document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        results.editables.push({
          tag: el.tagName,
          className: el.className.substring(0, 50),
          role: el.getAttribute('role'),
          ariaLabel: el.getAttribute('aria-label'),
          text: el.textContent.substring(0, 50),
        });
      });

      document.querySelectorAll('button').forEach(el => {
        if (el.offsetParent !== null) { // Only visible buttons
          results.buttons.push({
            text: el.textContent.trim().substring(0, 50),
            ariaLabel: el.getAttribute('aria-label'),
            disabled: el.disabled,
            testId: el.getAttribute('data-testid'),
            className: el.className.substring(0, 50),
          });
        }
      });

      document.querySelectorAll('input').forEach(el => {
        results.inputs.push({
          type: el.type,
          name: el.name,
          placeholder: el.placeholder,
          id: el.id,
        });
      });

      return results;
    });

    log(`📋 Textareas: ${elements.textareas.length}`, 'info');
    elements.textareas.forEach((t, i) => log(`  [${i}] ${JSON.stringify(t)}`, 'info'));
    
    log(`📋 ContentEditable: ${elements.editables.length}`, 'info');
    elements.editables.forEach((e, i) => log(`  [${i}] ${JSON.stringify(e)}`, 'info'));
    
    log(`📋 Visible Buttons: ${elements.buttons.length}`, 'info');
    elements.buttons.forEach((b, i) => log(`  [${i}] ${JSON.stringify(b)}`, 'info'));

    log(`📋 Inputs: ${elements.inputs.length}`, 'info');
    elements.inputs.forEach((inp, i) => log(`  [${i}] ${JSON.stringify(inp)}`, 'info'));

    // ===== Step 5: Enter prompt =====
    log('Đang nhập prompt vào Sora...', 'step');
    log(`Prompt: "${TEST_PROMPT.substring(0, 80)}..."`, 'info');

    let promptEntered = false;

    // Strategy 1: textarea
    if (elements.textareas.length > 0) {
      const textarea = await page.$('textarea');
      if (textarea) {
        await textarea.click();
        await sleep(500);
        await textarea.type(TEST_PROMPT, { delay: 15 });
        promptEntered = true;
        log('Đã nhập prompt vào textarea', 'success');
      }
    }

    // Strategy 2: contenteditable
    if (!promptEntered && elements.editables.length > 0) {
      const editable = await page.$('[contenteditable="true"]');
      if (editable) {
        await editable.click();
        await sleep(500);
        await page.keyboard.type(TEST_PROMPT, { delay: 15 });
        promptEntered = true;
        log('Đã nhập prompt vào contenteditable', 'success');
      }
    }

    // Strategy 3: role="textbox"
    if (!promptEntered) {
      const textbox = await page.$('[role="textbox"]');
      if (textbox) {
        await textbox.click();
        await sleep(500);
        await page.keyboard.type(TEST_PROMPT, { delay: 15 });
        promptEntered = true;
        log('Đã nhập prompt vào role=textbox', 'success');
      }
    }

    if (!promptEntered) {
      log('Không tìm thấy ô nhập prompt! Chụp screenshot để debug.', 'error');
    }

    await sleep(1500);
    await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_prompt.png'), fullPage: true });

    // ===== Step 5b: Select Character (mention @vuluu2k.thao) =====
    if (promptEntered) {
      log(`Đang chọn nhân vật: @${CHARACTER_ID}...`, 'step');

      // Thêm khoảng trắng trước @ nếu cần
      await page.keyboard.type(' ', { delay: 50 });
      await sleep(300);

      // Gõ ký tự @ để trigger dropdown mention
      await page.keyboard.type('@', { delay: 50 });
      log('Đã gõ "@", chờ dropdown nhân vật xuất hiện...', 'info');
      await sleep(2000);

      // Chụp screenshot sau khi gõ @
      await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_at_sign.png'), fullPage: true });

      // Gõ tên nhân vật để search/filter trong dropdown
      await page.keyboard.type(CHARACTER_ID, { delay: 30 });
      log(`Đã gõ "${CHARACTER_ID}", chờ kết quả filter...`, 'info');
      await sleep(2000);

      // Chụp screenshot sau khi gõ tên nhân vật
      await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_character_name.png'), fullPage: true });

      // Thử tìm và click vào suggestion item trong dropdown
      let characterSelected = false;

      // Strategy 1: Tìm dropdown item chứa tên nhân vật
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
        }, CHARACTER_ID);
      } catch (e) {
        log(`Lỗi khi tìm suggestion: ${e.message}`, 'warn');
      }

      if (characterSelected) {
        log(`Đã chọn nhân vật @${CHARACTER_ID} từ dropdown!`, 'success');
      } else {
        // Fallback: nhấn Enter để chọn suggestion đầu tiên (nếu dropdown đã hiển thị)
        log('Không tìm thấy suggestion item, thử nhấn Enter để chọn...', 'warn');
        await page.keyboard.press('Enter');
        await sleep(1000);
        log('Đã nhấn Enter để chọn suggestion đầu tiên (nếu có)', 'info');
      }

      await sleep(1500);
      await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_character_select.png'), fullPage: true });
      log(`Hoàn tất bước chọn nhân vật @${CHARACTER_ID}`, 'success');
    }

    // ===== Step 6: Find and click Generate/Submit button =====
    log('Tìm nút Generate/Submit...', 'step');
    
    let submitted = false;

    // Try keyboard shortcut first (often Enter or Ctrl+Enter)
    // Look for submit-like buttons
    const submitBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      for (const btn of buttons) {
        const text = btn.textContent.toLowerCase().trim();
        const label = (btn.getAttribute('aria-label') || '').toLowerCase();
        const testId = btn.getAttribute('data-testid') || '';
        
        if (
          text.includes('generate') || text.includes('create') || 
          text.includes('submit') || text.includes('send') ||
          label.includes('generate') || label.includes('create') ||
          label.includes('send') || label.includes('submit') ||
          testId.includes('generate') || testId.includes('submit') ||
          testId.includes('send')
        ) {
          return {
            found: true,
            text: btn.textContent.trim().substring(0, 50),
            disabled: btn.disabled,
            selector: btn.id ? `#${btn.id}` : `button[data-testid="${testId}"]`
          };
        }
      }
      return { found: false };
    });

    if (submitBtn.found) {
      log(`Tìm thấy nút: "${submitBtn.text}" (disabled: ${submitBtn.disabled})`, 'info');
      
      if (!submitBtn.disabled) {
        // Try clicking it
        const buttonEl = await page.evaluateHandle(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          for (const btn of buttons) {
            const text = btn.textContent.toLowerCase().trim();
            const label = (btn.getAttribute('aria-label') || '').toLowerCase();
            if (
              text.includes('generate') || text.includes('create') || 
              text.includes('submit') || text.includes('send') ||
              label.includes('generate') || label.includes('create') ||
              label.includes('send')
            ) {
              return btn;
            }
          }
          return null;
        });

        if (buttonEl) {
          await buttonEl.click();
          submitted = true;
          log('Đã click nút Generate!', 'success');
        }
      }
    }

    // Alt: press Enter or Ctrl+Enter
    if (!submitted && promptEntered) {
      log('Trying Enter key to submit...', 'info');
      await page.keyboard.press('Enter');
      await sleep(2000);
      
      // Check if something changed
      await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_enter.png'), fullPage: true });
      log('Đã nhấn Enter, kiểm tra kết quả...', 'info');
    }

    // ===== Step 7: Wait and monitor =====
    log('', 'info');
    log('══════════════════════════════════════════', 'info');
    log('Browser vẫn đang mở.', 'success');
    log('- Bạn có thể thao tác thủ công trên browser', 'info');
    log('- Script sẽ tự chụp screenshot mỗi 30 giây', 'info');
    log('- Nhấn Ctrl+C để dừng script', 'info');
    log('══════════════════════════════════════════', 'info');

    // Monitor loop - take periodic screenshots and check for video
    let monitorCount = 0;
    while (true) {
      await sleep(30000);
      monitorCount++;
      
      try {
        // Check if browser/page is still alive
        const url = page.url();
        log(`[Monitor #${monitorCount}] URL: ${url}`, 'info');
        
        // Check for video element
        const videoCheck = await page.evaluate(() => {
          const video = document.querySelector('video');
          if (video) {
            const source = video.querySelector('source');
            return { 
              found: true, 
              src: video.src || (source ? source.src : ''),
            };
          }
          return { found: false };
        });

        if (videoCheck.found) {
          log(`🎬 VIDEO DETECTED! src: ${videoCheck.src}`, 'success');
          await page.screenshot({ path: path.join(TEMP_DIR, 'sora_video_found.png'), fullPage: true });
        }

        // Periodic screenshot
        await page.screenshot({ 
          path: path.join(TEMP_DIR, `sora_monitor_${monitorCount}.png`), 
          fullPage: false 
        });
      } catch (e) {
        log(`Monitor error: ${e.message}`, 'warn');
        break;
      }
    }

  } catch (error) {
    log(`Lỗi: ${error.message}`, 'error');
    console.error(error.stack);
    
    if (browser) {
      log('Browser vẫn mở để debug. Nhấn Ctrl+C để đóng.', 'warn');
      await new Promise(() => {});
    }
  }
}

// Run
log('══════════════════════════════════════════');
log('  TEST: Mở luồng Sora để render video');
log('══════════════════════════════════════════');
log('');

testSoraFlow();
