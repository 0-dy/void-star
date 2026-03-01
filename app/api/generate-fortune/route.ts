import { NextResponse } from 'next/server';
import { FORTUNE_TEMPLATES, MOVIE_QUOTES } from './data';
import * as cheerio from 'cheerio';

// 10초 타임아웃 방지
export const maxDuration = 10;
export const dynamic = 'force-dynamic';

// Ohaasa Zodiac mapping from standard Korean zodiac signs to tv-asahi IDs
// Ohaasa Zodiac mapping from standard Korean zodiac signs to Japanese names
const JA_ZODIAC: Record<string, string> = {
    '양자리': 'おひつじ座',
    '황소자리': 'おうし座',
    '쌍둥이자리': 'ふたご座',
    '게자리': 'かに座',
    '사자자리': 'しし座',
    '처녀자리': 'おとめ座',
    '천칭자리': 'てんびん座',
    '전갈자리': 'さそり座',
    '사수자리': 'いて座',
    '염소자리': 'やぎ座',
    '물병자리': 'みずがめ座',
    '물고기자리': 'うお座'
};

async function fetchOhaasaFortune(zodiac: string) {
    try {
        const response = await fetch('https://www.tv-asahi.co.jp/goodmorning/uranai/', {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) throw new Error('Failed to fetch Ohaasa');

        const html = await response.text();
        const $ = cheerio.load(html);

        const jaName = JA_ZODIAC[zodiac] || 'おひつじ座';
        let fullBlock = '';

        // Scan divs for the matching Japanese string containing the fortune data
        $('div').each((i, el) => {
            const text = $(el).text().trim().replace(/\s+/g, ' ');
            if (text.includes(jaName) && text.includes('ラッキーカラー')) {
                // Save the text block if it is valid
                if (!fullBlock || text.length > fullBlock.length) {
                    fullBlock = text;
                }
            }
        });

        if (fullBlock) {
            // Find all instances where a new Zodiac sign starts with its date bounds: e.g. おひつじ座(3/21〜4/19)
            const regex = /(おひつじ座|おうし座|ふたご座|かに座|しし座|おとめ座|てんびん座|さそり座|いて座|やぎ座|みずがめ座|うお座)\([0-9]+\/[0-9]+〜[0-9]+\/[0-9]+\)/g;
            const matches = [...fullBlock.matchAll(regex)];

            let isolatedText = '';
            for (let i = 0; i < matches.length; i++) {
                if (matches[i][1] === jaName) {
                    const startIndex = matches[i].index;
                    const endIndex = (i + 1 < matches.length) ? matches[i + 1].index : fullBlock.length;
                    isolatedText = fullBlock.substring(startIndex, endIndex);
                    break;
                }
            }

            if (isolatedText) {
                // Clear any trailing Japanese rank debris left over from splitting
                const cleanedText = isolatedText
                    .replace(/今日の順位▲/g, '')
                    .replace(/今日の順位▼/g, '')
                    .replace(/今日の順位/g, '')
                    .trim();

                // Translate the static headers for the user
                let formattedStr = cleanedText
                    .replace(jaName, `[${zodiac}]`)
                    .replace(/\([0-9/〜]+\)/, '') // Remove the Japanese date range (e.g. 3/21〜4/19)
                    .replace('ラッキーカラー：', '\n🎨 행운의 색상: ')
                    .replace('幸運のカギ：', '\n🔑 행운의 열쇠: ');

                return {
                    source: '오하아사 (TV Asahi)',
                    text: formattedStr.trim()
                };
            }
        }

        // Picked up fallback if the precise string slicing fails
        return {
            source: '오하아사 (TV Asahi)',
            text: `(현재 오하아사 방송 점검 중입니다 - ${zodiac})`
        };

    } catch (e) {
        return null;
    }
}

function getZodiacSign(month: number, day: number): string {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return '양자리';
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return '황소자리';
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return '쌍둥이자리';
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return '게자리';
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return '사자자리';
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return '처녀자리';
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return '천칭자리';
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return '전갈자리';
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return '사수자리';
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return '염소자리';
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return '물병자리';
    return '물고기자리'; // Feb 19 - Mar 20
}

export async function POST(req: Request) {
    try {
        const { name, gender, calendarType, birthYear, birthMonth, birthDay, birthTime } = await req.json();

        if (!birthYear || !birthMonth || !birthDay) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const monthNum = parseInt(birthMonth);
        const dayNum = parseInt(birthDay);
        const userZodiac = getZodiacSign(monthNum, dayNum);

        // Fetch Ohaasa
        const ohaasaResult = await fetchOhaasaFortune(userZodiac);

        // 1. 한국 시간(KST) 기준 오늘의 날짜 문자열 만들기 (예: 20241027)
        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstDate = new Date(now.getTime() + kstOffset);
        const todayStr = `${kstDate.getUTCFullYear()}${kstDate.getUTCMonth() + 1}${kstDate.getUTCDate()}`;

        // 2. 사주 입력 정보 + 오늘 날짜를 조합하여 고유한 "시드(Seed)" 텍스트 생성
        const seedString = `${name}-${birthYear}-${birthMonth}-${birthDay}-${gender}-${calendarType}-${birthTime}-${todayStr}`;

        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
            hash |= 0;
        }

        const positiveHash = Math.abs(hash);

        const fortuneIndex = positiveHash % FORTUNE_TEMPLATES.length;
        const quoteIndex = (positiveHash >> 2) % MOVIE_QUOTES.length;

        const selectedFortune = FORTUNE_TEMPLATES[fortuneIndex];
        const selectedQuote = MOVIE_QUOTES[quoteIndex];

        const result = {
            title: selectedFortune.title,
            fortune: selectedFortune.text.replace(/{name}/g, name || '익명'),
            ohaasa: ohaasaResult ? ohaasaResult.text : '오늘은 맑고 평온한 하루가 예상됩니다. (출처: TV Asahi Ohaasa)',
            zodiac: userZodiac,
            quoteText: selectedQuote.text,
            quoteMovie: selectedQuote.movie
        };

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error generating fortune:', error);
        return NextResponse.json(
            {
                title: "오류가 발생했습니다 ㅠㅠ",
                fortune: "운세를 불러오는 과정에서 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
                quoteText: "실패란 넘어지는 것이 아니라 넘어진 자리에 머무는 것이다.",
                quoteMovie: "오류 메시지"
            },
            { status: 500 }
        );
    }
}
