const cheerio = require('cheerio');

async function testFetch() {
    try {
        const response = await fetch('https://www.tv-asahi.co.jp/goodmorning/uranai/');
        const html = await response.text();
        const $ = cheerio.load(html);

        const jaName = 'さそり座'; // Scorpio
        let extractedText = '';

        $('div').each((i, el) => {
            const text = $(el).text().trim().replace(/\s+/g, ' ');
            if (text.includes(jaName) && text.includes('ラッキーカラー')) {
                if (!extractedText || text.length < extractedText.length) { // Try to get the smallest containing block
                    extractedText = text;
                }
            }
        });

        console.log("Full block length:", extractedText.length);

        // Let's try to slice out just the target Zodiac.
        // It starts with `jaName(` e.g., さそり座(10/24〜11/22)
        // And ends before the next Zodiac pattern, or end of string.

        const zodiacPattern = new RegExp(`${jaName}\\([0-9]+\\/[0-9]+〜[0-9]+\\/[0-9]+\\)(.*?)(?:[おかふしてさいやみう][ひうたにいとんそげずお][つつご座んりぎが][じご座座座座座座め][座座\\s]|$)`);

        // Wait, instead of complex lookahead, let's just split by all known zodiac patterns with dates:
        // /([おかふしてさいやみう][ひうたにいとんそげずお][つつご座んりぎが][じご座座座座座座め][座座]?\([0-9]+\/[0-9]+〜[0-9]+\/[0-9]+\))/
        const splitRegex = /(おひつじ座|おうし座|ふたご座|かに座|しし座|おとめ座|てんびん座|さそり座|いて座|やぎ座|みずがめ座|うお座)\([0-9]+\/[0-9]+〜[0-9]+\/[0-9]+\)/g;

        // Let's use matchAll to find the boundaries
        const matches = [...extractedText.matchAll(/(おひつじ座|おうし座|ふたご座|かに座|しし座|おとめ座|てんびん座|さそり座|いて座|やぎ座|みずがめ座|うお座)\([0-9]+\/[0-9]+〜[0-9]+\/[0-9]+\)/g)];

        let targetText = '';
        for (let i = 0; i < matches.length; i++) {
            if (matches[i][1] === jaName) {
                const startIndex = matches[i].index;
                const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : extractedText.length;
                targetText = extractedText.substring(startIndex, endIndex);
                break;
            }
        }

        if (targetText) {
            console.log("SUCCESSFULLY EXTRACTED:", targetText);
        } else {
            console.log("Failed to match substring.");
        }

    } catch (e) {
        console.error(e);
    }
}
testFetch();
