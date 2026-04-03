const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0');
    try {
        await page.goto('https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00009.html', { waitUntil: 'domcontentloaded', timeout: 30000 });
        const html = await page.content();
        fs.writeFileSync('/tmp/isa.html', html);
        console.log("HTML saved");
    } catch (e) {
        console.log(e);
    }
    await browser.close();
})();
