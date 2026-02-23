/**
 * Test script: Kiểm tra Gemini API - Tạo caption & video prompt
 * 
 * Script này sẽ:
 * 1. Kết nối Gemini API với API key từ .env
 * 2. Test generateCaption: Tạo caption TikTok từ nội dung
 * 3. Test generateVideoPrompt: Tạo prompt cho Sora AI
 * 4. Test với dữ liệu TikTok product thực tế (mô phỏng)
 * 
 * Usage: node test_gemini.js
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs-extra');

const TEMP_DIR = path.join(__dirname, 'temp');
const CHARACTER_ID = "vuluu2k.thao";

function log(msg, type = 'info') {
  const time = new Date().toLocaleTimeString('vi-VN');
  const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️', step: '🔹', data: '📦' };
  console.log(`[${time}] ${icons[type] || '•'} ${msg}`);
}

// Dữ liệu mẫu mô phỏng kết quả từ TikTok extractor
const SAMPLE_TIKTOK_DATA = [
  {
    name: 'Sản phẩm thời trang',
    content: 'Áo khoác bomber unisex phong cách Hàn Quốc, chất vải dày dặn, form rộng, phù hợp mùa thu đông. Giá chỉ 299K. Free ship toàn quốc.',
  },
  {
    name: 'Mỹ phẩm skincare',
    content: 'Serum Vitamin C 20% làm sáng da, mờ thâm, chống oxy hóa. Chiết xuất thiên nhiên, phù hợp mọi loại da. Best seller tháng này với hơn 50K đã bán.',
  },
  {
    name: 'Đồ gia dụng',
    content: 'Máy xay sinh tố cầm tay mini 6 lưỡi dao, pin sạc USB, xay được đá. Tiện lợi mang đi gym, công sở. Giá sale 50% chỉ còn 189K.',
  },
];

async function testGeminiConnection() {
  log('\n══════════════════════════════════════════', 'info');
  log('  TEST 1: Kiểm tra kết nối Gemini API', 'step');
  log('══════════════════════════════════════════\n', 'info');

  try {
    // Check env
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      log('GEMINI_API_KEY chưa được set trong .env!', 'error');
      return false;
    }
    log(`API Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 4)}`, 'info');

    // Try loading service
    const geminiService = require('./src/services/geminiService');
    log('GeminiService đã khởi tạo thành công!', 'success');
    log(`Model: ${geminiService.modelName}`, 'info');
    return true;
  } catch (error) {
    log(`Lỗi kết nối: ${error.message}`, 'error');
    return false;
  }
}

async function testGenerateCaption() {
  log('\n══════════════════════════════════════════', 'info');
  log('  TEST 2: Tạo TikTok Caption (generateCaption)', 'step');
  log('══════════════════════════════════════════\n', 'info');

  const geminiService = require('./src/services/geminiService');
  const results = [];

  for (const sample of SAMPLE_TIKTOK_DATA) {
    log(`📝 Nội dung: "${sample.name}"`, 'step');
    log(`   Input: ${sample.content.substring(0, 80)}...`, 'info');

    try {
      const startTime = Date.now();
      const caption = await geminiService.generateCaption(sample.content);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

      log(`   ⏱ Thời gian: ${elapsed}s`, 'info');
      log(`   📱 Caption: ${caption}`, 'success');
      log(`   📏 Độ dài: ${caption.length} ký tự`, 'info');
      log('', 'info');

      results.push({
        name: sample.name,
        content: sample.content,
        caption,
        elapsed: parseFloat(elapsed),
        success: true,
      });
    } catch (error) {
      log(`   Lỗi: ${error.message}`, 'error');
      results.push({
        name: sample.name,
        content: sample.content,
        error: error.message,
        success: false,
      });
    }
  }

  const successCount = results.filter(r => r.success).length;
  log(`Kết quả Caption: ${successCount}/${results.length} thành công`, successCount === results.length ? 'success' : 'warn');
  return results;
}

async function testGenerateVideoPrompt() {
  log('\n══════════════════════════════════════════', 'info');
  log('  TEST 3: Tạo Sora Video Prompt (generateVideoPrompt)', 'step');
  log('══════════════════════════════════════════\n', 'info');

  const geminiService = require('./src/services/geminiService');
  const results = [];

  // Chỉ test 1 sample cho video prompt (tốn thời gian hơn)
  const sample = SAMPLE_TIKTOK_DATA[0];

  log(`🎬 Nội dung: "${sample.name}"`, 'step');
  log(`   Input: ${sample.content.substring(0, 80)}...`, 'info');

  try {
    const startTime = Date.now();
    const videoPrompt = await geminiService.generateVideoPrompt(sample.content);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    log(`   ⏱ Thời gian: ${elapsed}s`, 'info');
    log(`   🎥 Video Prompt:`, 'success');
    // In prompt theo từng dòng cho dễ đọc
    videoPrompt.split('\n').forEach(line => {
      if (line.trim()) log(`      ${line}`, 'info');
    });
    log(`   📏 Độ dài prompt: ${videoPrompt.length} ký tự`, 'info');
    log('', 'info');

    results.push({
      name: sample.name,
      content: sample.content,
      videoPrompt,
      elapsed: parseFloat(elapsed),
      success: true,
    });
  } catch (error) {
    log(`   Lỗi: ${error.message}`, 'error');
    results.push({
      name: sample.name,
      content: sample.content,
      error: error.message,
      success: false,
    });
  }

  const successCount = results.filter(r => r.success).length;
  log(`Kết quả Video Prompt: ${successCount}/${results.length} thành công`, successCount === results.length ? 'success' : 'warn');
  return results;
}

async function testGenerateWithCharacter() {
  log('\n══════════════════════════════════════════', 'info');
  log(`  TEST 4: Tạo prompt có nhân vật @${CHARACTER_ID}`, 'step');
  log('══════════════════════════════════════════\n', 'info');

  const geminiService = require('./src/services/geminiService');
  
  const sample = SAMPLE_TIKTOK_DATA[0];
  // Thêm yêu cầu nhân vật vào content
  const contentWithCharacter = `${sample.content}\n\nNhân vật chính: @${CHARACTER_ID} - Một cô gái Việt Nam trẻ trung, năng động, phong cách thời trang hiện đại.`;

  log(`🎭 Nội dung có nhân vật: @${CHARACTER_ID}`, 'step');
  log(`   Input: ${contentWithCharacter.substring(0, 100)}...`, 'info');

  try {
    const startTime = Date.now();
    const videoPrompt = await geminiService.generateVideoPrompt(contentWithCharacter);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

    log(`   ⏱ Thời gian: ${elapsed}s`, 'info');
    log(`   🎥 Video Prompt (with character):`, 'success');
    videoPrompt.split('\n').forEach(line => {
      if (line.trim()) log(`      ${line}`, 'info');
    });

    // Kiểm tra xem prompt có mention nhân vật không
    const hasCharacterRef = videoPrompt.toLowerCase().includes('thao') || 
                            videoPrompt.toLowerCase().includes(CHARACTER_ID) ||
                            videoPrompt.toLowerCase().includes('vietnamese woman') ||
                            videoPrompt.toLowerCase().includes('young woman');
    
    if (hasCharacterRef) {
      log(`   ✅ Prompt có đề cập đến nhân vật!`, 'success');
    } else {
      log(`   ⚠️ Prompt không mention rõ nhân vật`, 'warn');
    }

    log('', 'info');
    return { success: true, videoPrompt, hasCharacterRef, elapsed: parseFloat(elapsed) };
  } catch (error) {
    log(`   Lỗi: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

async function main() {
  log('══════════════════════════════════════════');
  log('  TEST: Gemini API - Caption & Video Prompt');
  log('══════════════════════════════════════════');
  log('');

  fs.ensureDirSync(TEMP_DIR);

  // Test 1: Connection
  const connected = await testGeminiConnection();
  if (!connected) {
    log('\nKhông thể kết nối Gemini API. Dừng test.', 'error');
    process.exit(1);
  }

  // Test 2: Caption
  const captionResults = await testGenerateCaption();

  // Test 3: Video Prompt
  const videoPromptResults = await testGenerateVideoPrompt();

  // Test 4: With Character
  const characterResult = await testGenerateWithCharacter();

  // ===== Tổng kết =====
  log('\n══════════════════════════════════════════', 'info');
  log('  📊 TỔNG KẾT', 'step');
  log('══════════════════════════════════════════\n', 'info');

  const captionSuccess = captionResults.filter(r => r.success).length;
  const videoSuccess = videoPromptResults.filter(r => r.success).length;
  
  log(`Kết nối Gemini:      ${connected ? '✅' : '❌'}`, connected ? 'success' : 'error');
  log(`Generate Caption:    ${captionSuccess}/${captionResults.length} thành công`, captionSuccess === captionResults.length ? 'success' : 'warn');
  log(`Generate Video:      ${videoSuccess}/${videoPromptResults.length} thành công`, videoSuccess === videoPromptResults.length ? 'success' : 'warn');
  log(`Character Prompt:    ${characterResult.success ? '✅' : '❌'} (character ref: ${characterResult.hasCharacterRef ? '✅' : '⚠️'})`, characterResult.success ? 'success' : 'error');

  // Lưu kết quả
  const allResults = {
    timestamp: new Date().toISOString(),
    connection: connected,
    captions: captionResults,
    videoPrompts: videoPromptResults,
    characterPrompt: characterResult,
  };

  const outputPath = path.join(TEMP_DIR, 'gemini_test_results.json');
  await fs.writeJSON(outputPath, allResults, { spaces: 2 });
  log(`\nKết quả đã lưu tại: ${outputPath}`, 'info');

  log('\n══════════════════════════════════════════', 'info');
  log('  Hoàn tất test Gemini!', 'success');
  log('══════════════════════════════════════════\n', 'info');
}

main().catch(err => {
  log(`Fatal error: ${err.message}`, 'error');
  console.error(err.stack);
  process.exit(1);
});
