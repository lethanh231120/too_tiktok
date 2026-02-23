const path = require('path');
const fs = require('fs-extra');
const tiktokExtractor = require('./src/services/tiktokExtractor');
const soraAutomation = require('./src/services/soraAutomation');

async function runEndToEnd() {
    try {
        const url = 'https://vt.tiktok.com/ZS9ey9qA8vmk5-FYUIP';
        console.log('1. Extracting from TikTok...');
        const tiktokData = await tiktokExtractor.extractTikTokData(url);
        console.log('Extracted Data:', tiktokData);

        if (!tiktokData.imagePath) {
            console.log('No image found to upload to Sora! Aborting.');
            return;
        }

        console.log('2. Proceeding to Sora automation with image:', tiktokData.imagePath);

        // We will generate a quick prompt based on the title
        const prompt = `A cinematic TikTok style video showcasing this product: ${tiktokData.title}. Studio lighting, smooth camera track, vertical format.`;

        console.log('Prompt:', prompt);

        // Launch Sora automation
        await soraAutomation.createVideoWithCharacter(tiktokData.imagePath, prompt, 'vuluu2k.thao');

    } catch (error) {
        console.error('Error during end-to-end test:', error);
    }
}

runEndToEnd();
