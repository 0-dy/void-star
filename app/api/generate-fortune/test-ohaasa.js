const cheerio = require('cheerio');

async function testFetch() {
    try {
        const response = await fetch('https://www.tv-asahi.co.jp/goodmorning/uranai/');
        const html = await response.text();
        const $ = cheerio.load(html);

        // Target: おひつじ座
        let result = {};

        $('div').each((i, el) => {
            const text = $(el).text().trim().replace(/\s+/g, ' ');
            if (text.includes('おひつじ座') && text.includes('ラッキーカラー')) {
                // This seems to be the fortune block
                // For example: "おひつじ座(3/21〜4/19) 金運に大きなチャンスが。... ラッキーカラー：黄色 幸運のカギ：ねこカフェ 今日の順位▲"
                if (!result.text) {
                    result.raw = text;
                }
            }
        });

        console.log("Raw matched string:", result.raw);

        // Let's iterate all list items that show rank if possible
        let ranks = [];
        $('.uranai_box').each((i, el) => {
            ranks.push($(el).text().trim().replace(/\s+/g, ' '));
        });

        // Actually, tv asahi ranks are often in <li> or specific wrappers 
        // Let's just grab the whole block containing the star sign

    } catch (e) {
        console.error(e);
    }
}
testFetch();
