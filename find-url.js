const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0');
    try {
        await page.goto('https://www.moj.go.jp/isa/applications/procedures/nyuukokukanri07_00009.html', { waitUntil: 'domcontentloaded', timeout: 15000 });
        const data = await page.evaluate(() => {
            const trs = Array.from(document.querySelectorAll('tr'));
            return trs.map(tr => {
                const aPdf = Array.from(tr.querySelectorAll('a[href$=".pdf"]'));
                if (aPdf.length > 0) return tr.innerText.replace(/\s+/g, ' ') + " -> PDF: " + aPdf[0].href;
                return null;
            }).filter(Boolean);
        });
        console.log(data.join('\n'));
    } catch (e) {
        console.log("Error:", e);
    }
    await browser.close();
})();
