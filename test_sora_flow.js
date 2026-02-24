/**
 * Test script: Mở luồng Sora để render video sử dụng SoraAutomation service
 * 
 * Script này sẽ:
 * 1. Khởi tạo SoraAutomation service
 * 2. Navigate đến sora.chatgpt.com
 * 3. Chờ video render xong
 * 
 * Usage: node test_sora_flow.js
 */

const soraAutomation = require('./src/services/soraAutomation');
const path = require('path');
const fs = require('fs-extra');

const TEST_PROMPT = `A young Vietnamese woman named Thao is showcasing a trendy fashion product in a modern studio. She walks confidently with soft golden hour lighting. Camera follows her with a smooth tracking shot. Cinematic style, warm color palette, TikTok-ready vertical video.`;

const TEMP_DIR = path.join(__dirname, 'temp');
const CHARACTER_ID = "vuluu2k.thao";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg, type = 'info') {
  const time = new Date().toLocaleTimeString('vi-VN');
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️', step: '🔹' };
  console.log(`[${time}] ${icons[type] || '•'} ${msg}`);
}

async function testSoraFlow() {
  try {
    fs.ensureDirSync(TEMP_DIR);

    log('Khởi tạo SoraAutomation browser...', 'step');
    const browser = await soraAutomation.initBrowser();
    log('Browser đã khởi tạo thành công!', 'success');

    const pages = await browser.pages();
    const page = pages.length > 0 ? pages[0] : await browser.newPage();

    // Anti-detection (keep from original test)
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });

    log('Bắt đầu quy trình tạo video với SoraAutomation...', 'step');

    // Sử dụng hàm createVideoWithCharacter của service nhưng chia nhỏ để test
    log('Navigating đến sora.chatgpt.com...', 'step');
    await page.goto(soraAutomation.soraUrl, { waitUntil: 'networkidle2' });
    await sleep(3000);

    // Chụp screenshot initial state
    await page.screenshot({ path: path.join(TEMP_DIR, 'sora_initial.png'), fullPage: true });

    // Kiểm tra đăng nhập
    log('Kiểm tra trạng thái đăng nhập...', 'step');
    const isLoggedIn = await soraAutomation.checkLogin(page);
    if (!isLoggedIn) {
      log('⏳ Cần đăng nhập! Hãy đăng nhập thủ công trên browser.', 'warn');
      // Chờ cho đến khi thấy textarea hoặc prompt input
      let loggedIn = false;
      for (let i = 0; i < 30; i++) { // Chờ tối đa 90s
        if (await soraAutomation.checkLogin(page)) {
          loggedIn = true;
          log('Đã phát hiện đăng nhập thành công!', 'success');
          break;
        }
        await sleep(3000);
      }
      if (!loggedIn) log('Hết thời gian chờ đăng nhập, thử tiếp tục...', 'warn');
    } else {
      log('Đã đăng nhập sẵn!', 'success');
    }

    await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_login.png'), fullPage: true });

    // Nhập prompt
    log('Đang nhập prompt...', 'step');
    await soraAutomation.enterPrompt(page, TEST_PROMPT);
    await sleep(1000);
    log('Đã nhập prompt xong', 'success');
    await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_prompt.png'), fullPage: true });

    // Chọn nhân vật
    log(`Đang chọn nhân vật: @${CHARACTER_ID}...`, 'step');
    await soraAutomation.selectCharacter(page, CHARACTER_ID);
    log('Đã xử lý bước chọn nhân vật', 'success');
    await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_character_select.png'), fullPage: true });

    // Apply video settings
    log('Đang cấu hình Video Settings: 9:16, 10s, 1 video...', 'step');
    await soraAutomation.applyVideoSettings(page, { resolution: '9:16', duration: '10s', videoCount: '1' });
    log('Đã áp dụng Video Settings', 'success');
    await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_video_settings.png'), fullPage: true });

    // Submit
    log('Submitting video generation...', 'step');
    await soraAutomation.submitVideoGeneration(page);
    log('Đã click/submit tạo video!', 'success');
    await page.screenshot({ path: path.join(TEMP_DIR, 'sora_after_submit.png'), fullPage: true });

    // Navigate to drafts to monitor
    log('Navigating to drafts page...', 'step');
    await page.goto('https://sora.chatgpt.com/drafts', { waitUntil: 'networkidle2', timeout: 30000 });
    await sleep(3000);
    log(`Now on: ${page.url()}`, 'success');
    await page.screenshot({ path: path.join(TEMP_DIR, 'sora_drafts_page.png'), fullPage: true });

    // Wait for videos to complete, post them, then get links from profile
    log('Waiting for video generation to complete on drafts...', 'step');
    const videoResult = await soraAutomation.waitForVideoOnDrafts(page);

    if (videoResult.success) {
      log('🎬 Video generation completed!', 'success');
      const urls = Array.isArray(videoResult.videoUrl) ? videoResult.videoUrl : [videoResult.videoUrl];
      urls.forEach((url, i) => log(`  Video ${i + 1}: ${url}`, 'success'));
      await page.screenshot({ path: path.join(TEMP_DIR, 'sora_final_result.png'), fullPage: true });
    } else {
      log(`Video generation failed: ${videoResult.error}`, 'error');
    }

  } catch (error) {
    log(`Lỗi: ${error.message}`, 'error');
    console.error(error.stack);
  }
}

// Run
log('══════════════════════════════════════════');
log('  TEST: Sora Flow sử dụng SoraAutomation');
log('══════════════════════════════════════════');
log('');

testSoraFlow();
