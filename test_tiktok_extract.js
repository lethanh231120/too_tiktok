/**
 * Test script: Lấy thông tin sản phẩm/video từ TikTok link
 * 
 * Script này sẽ:
 * 1. Nhận TikTok URL từ command line hoặc sử dụng URL mẫu
 * 2. Gọi TikTokExtractor để trích xuất thông tin
 * 3. Hiển thị kết quả: title, description, image, video ID
 * 
 * Usage: 
 *   node test_tiktok_extract.js
 *   node test_tiktok_extract.js "https://vt.tiktok.com/xxxxx"
 *   node test_tiktok_extract.js "https://www.tiktok.com/@user/video/1234567890"
 */

const tiktokExtractor = require('./src/services/tiktokExtractor');
const path = require('path');
const fs = require('fs-extra');

const TEMP_DIR = path.join(__dirname, 'temp');

function log(msg, type = 'info') {
    const time = new Date().toLocaleTimeString('vi-VN');
    const icons = { info: 'ℹ️', success: '✅', error: '❌', warn: '⚠️', step: '🔹', data: '📦' };
    console.log(`[${time}] ${icons[type] || '•'} ${msg}`);
}

// Danh sách URL mẫu để test
const SAMPLE_URLS = [
    // Video thường
    'https://vt.tiktok.com/ZS9ey9qA8vmk5-FYUIP',
    // Short URL (vt.tiktok.com)
    // 'https://vt.tiktok.com/ZSxxxxxxx/',
    // Short URL (vm.tiktok.com)
    // 'https://vm.tiktok.com/ZMxxxxxxx/',
];

async function testExtractSingle(url) {
    log(`\nĐang trích xuất thông tin từ: ${url}`, 'step');
    log('─'.repeat(60), 'info');

    try {
        const startTime = Date.now();
        const data = await tiktokExtractor.extractTikTokData(url);
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);

        log(`Thời gian xử lý: ${elapsed}s`, 'info');
        log('', 'info');
        log('📋 KẾT QUẢ TRÍCH XUẤT:', 'data');
        log(`   Video ID:    ${data.videoId || '(không có)'}`, 'info');
        log(`   URL gốc:     ${data.url || '(không có)'}`, 'info');
        log(`   Tiêu đề:     ${data.title || '(không có)'}`, 'info');
        log(`   Mô tả:       ${(data.description || '(không có)').substring(0, 200)}`, 'info');
        log(`   Ảnh:          ${data.imagePath || '(không tải được)'}`, 'info');
        log(`   Timestamp:    ${data.timestamp}`, 'info');

        // Kiểm tra file ảnh đã tải
        if (data.imagePath && await fs.pathExists(data.imagePath)) {
            const stats = await fs.stat(data.imagePath);
            log(`   Kích thước ảnh: ${(stats.size / 1024).toFixed(1)} KB`, 'success');
        }

        log('', 'info');
        log('Trích xuất thành công!', 'success');

        return { success: true, data };
    } catch (error) {
        log(`Lỗi: ${error.message}`, 'error');

        if (error.response) {
            log(`   HTTP Status: ${error.response.status}`, 'warn');
            log(`   Headers: ${JSON.stringify(error.response.headers).substring(0, 200)}`, 'warn');
        }

        return { success: false, error: error.message };
    }
}

async function testValidation() {
    log('\n══════════════════════════════════════════', 'info');
    log('  TEST: Kiểm tra URL validation', 'step');
    log('══════════════════════════════════════════\n', 'info');

    const testCases = [
        { url: 'https://www.tiktok.com/@user/video/1234567890', expected: true, desc: 'URL video chuẩn' },
        { url: 'https://vt.tiktok.com/ZSxxxxxx/', expected: true, desc: 'Short URL (vt)' },
        { url: 'https://vm.tiktok.com/ZMxxxxxx/', expected: true, desc: 'Short URL (vm)' },
        { url: 'https://m.tiktok.com/@user/video/123', expected: true, desc: 'Mobile URL' },
        { url: 'https://www.tiktok.com/@user/photo/123', expected: true, desc: 'Photo URL' },
        { url: 'https://www.youtube.com/watch?v=xxx', expected: false, desc: 'YouTube (invalid)' },
        { url: 'https://www.google.com', expected: false, desc: 'Google (invalid)' },
        { url: 'not-a-url', expected: false, desc: 'Không phải URL' },
    ];

    let passed = 0;
    let failed = 0;

    for (const tc of testCases) {
        const result = tiktokExtractor.isValidTikTokUrl(tc.url);
        const ok = result === tc.expected;

        if (ok) {
            passed++;
            log(`  ✅ ${tc.desc}: "${tc.url}" → ${result}`, 'success');
        } else {
            failed++;
            log(`  ❌ ${tc.desc}: "${tc.url}" → ${result} (expected: ${tc.expected})`, 'error');
        }
    }

    log('', 'info');
    log(`Kết quả: ${passed} passed, ${failed} failed / ${testCases.length} total`, passed === testCases.length ? 'success' : 'warn');
    return { passed, failed, total: testCases.length };
}

async function testVideoIdExtraction() {
    log('\n══════════════════════════════════════════', 'info');
    log('  TEST: Kiểm tra Video ID extraction', 'step');
    log('══════════════════════════════════════════\n', 'info');

    const testCases = [
        { url: 'https://www.tiktok.com/@user/video/7456789012345678901', expected: '7456789012345678901', desc: 'Standard video URL' },
        { url: 'https://www.tiktok.com/@user/photo/7456789012345678902', expected: '7456789012345678902', desc: 'Photo URL' },
        { url: 'https://www.tiktok.com/@user/video/7456789012345678901?is_from_webapp=1', expected: '7456789012345678901', desc: 'URL có query params' },
        { url: 'https://www.tiktok.com/product/7456789012345678903', expected: '7456789012345678903', desc: 'Product URL' },
    ];

    let passed = 0;
    let failed = 0;

    for (const tc of testCases) {
        const result = tiktokExtractor.extractVideoId(tc.url);
        const ok = result === tc.expected;

        if (ok) {
            passed++;
            log(`  ✅ ${tc.desc}: → "${result}"`, 'success');
        } else {
            failed++;
            log(`  ❌ ${tc.desc}: → "${result}" (expected: "${tc.expected}")`, 'error');
        }
    }

    log('', 'info');
    log(`Kết quả: ${passed} passed, ${failed} failed / ${testCases.length} total`, passed === testCases.length ? 'success' : 'warn');
    return { passed, failed, total: testCases.length };
}

async function main() {
    log('══════════════════════════════════════════');
    log('  TEST: Trích xuất thông tin từ TikTok');
    log('══════════════════════════════════════════');
    log('');

    fs.ensureDirSync(TEMP_DIR);

    // Lấy URL từ command line argument
    const inputUrl = process.argv[2];

    // ===== Test 1: URL Validation =====
    const validationResult = await testValidation();

    // ===== Test 2: Video ID Extraction =====
    const videoIdResult = await testVideoIdExtraction();

    // ===== Test 3: Trích xuất thực tế =====
    log('\n══════════════════════════════════════════', 'info');
    log('  TEST: Trích xuất thông tin thực tế', 'step');
    log('══════════════════════════════════════════\n', 'info');

    const urlsToTest = inputUrl ? [inputUrl] : SAMPLE_URLS;

    if (urlsToTest.length === 0) {
        log('Không có URL để test. Dùng: node test_tiktok_extract.js "https://vt.tiktok.com/xxx"', 'warn');
    }

    const results = [];
    for (const url of urlsToTest) {
        const result = await testExtractSingle(url);
        results.push({ url, ...result });
        log('', 'info');
    }

    // ===== Tổng kết =====
    log('\n══════════════════════════════════════════', 'info');
    log('  📊 TỔNG KẾT', 'step');
    log('══════════════════════════════════════════\n', 'info');

    log(`URL Validation:     ${validationResult.passed}/${validationResult.total} passed`, validationResult.failed === 0 ? 'success' : 'warn');
    log(`Video ID Extract:   ${videoIdResult.passed}/${videoIdResult.total} passed`, videoIdResult.failed === 0 ? 'success' : 'warn');

    if (results.length > 0) {
        const successCount = results.filter(r => r.success).length;
        log(`Data Extraction:    ${successCount}/${results.length} thành công`, successCount === results.length ? 'success' : 'warn');

        // Lưu kết quả ra file JSON
        const outputPath = path.join(TEMP_DIR, 'tiktok_extract_results.json');
        await fs.writeJSON(outputPath, results, { spaces: 2 });
        log(`\nKết quả đã lưu tại: ${outputPath}`, 'info');
    }

    log('\n══════════════════════════════════════════', 'info');
    log('  Hoàn tất tất cả test!', 'success');
    log('══════════════════════════════════════════\n', 'info');
}

main().catch(err => {
    log(`Fatal error: ${err.message}`, 'error');
    console.error(err.stack);
    process.exit(1);
});
