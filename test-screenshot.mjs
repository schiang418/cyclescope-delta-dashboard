import puppeteer from 'puppeteer';
import { writeFile } from 'fs/promises';

const testChart = {
  id: 16,
  name: 'CPCE_Put_Call',
  url: 'https://schrts.co/XdYdgKQG',
  description: 'Put/Call Ratio'
};

async function testScreenshot() {
  console.log('Testing chart screenshot capture...');
  console.log('Chart:', testChart.name);
  console.log('URL:', testChart.url);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Loading page...');
    await page.goto(testChart.url, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('Waiting for canvas...');
    await page.waitForSelector('canvas', { timeout: 15000 });
    
    console.log('Waiting for chart to render...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Extracting chart image...');
    const imageData = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return null;
      return canvas.toDataURL('image/png');
    });

    if (!imageData) {
      throw new Error('Failed to extract chart image');
    }

    const base64Data = imageData.replace(/^data:image\/png;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    const filename = `/tmp/test_${testChart.name}.png`;
    await writeFile(filename, imageBuffer);

    console.log(`✓ Success! Chart saved to: ${filename}`);
    console.log(`  File size: ${(imageBuffer.length / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.error('✗ Error:', error.message);
    throw error;
  } finally {
    await browser.close();
  }
}

testScreenshot()
  .then(() => {
    console.log('\nTest completed successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('\nTest failed:', err);
    process.exit(1);
  });

