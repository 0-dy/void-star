import { NextResponse } from 'next/server';
import { FORTUNE_TEMPLATES, MOVIE_QUOTES } from './data';

// 10초 타임아웃 방지
export const maxDuration = 10;
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { name, gender, calendarType, birthYear, birthMonth, birthDay, birthTime } = await req.json();

        if (!birthYear || !birthMonth || !birthDay) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. 한국 시간(KST) 기준 오늘의 날짜 문자열 만들기 (예: 20241027)
        const now = new Date();
        const kstOffset = 9 * 60 * 60 * 1000;
        const kstDate = new Date(now.getTime() + kstOffset);
        const todayStr = `${kstDate.getUTCFullYear()}${kstDate.getUTCMonth() + 1}${kstDate.getUTCDate()}`;

        // 2. 사주 입력 정보 + 오늘 날짜를 조합하여 고유한 "시드(Seed)" 텍스트 생성
        // 이렇게 하면 하루 동안은 같은 사람이 계속 돌려도 동일한 결과가 나오고, 다음 날 자정이 지나면 바뀜!
        const seedString = `${name}-${birthYear}-${birthMonth}-${birthDay}-${gender}-${calendarType}-${birthTime}-${todayStr}`;

        // 3. 생성된 텍스트를 숫자로 변환하는 해시(Hash) 함수
        let hash = 0;
        for (let i = 0; i < seedString.length; i++) {
            hash = ((hash << 5) - hash) + seedString.charCodeAt(i);
            hash |= 0; // 32bit 정수화
        }

        // 무조건 양수가 되도록 처리
        const positiveHash = Math.abs(hash);

        // 4. 해시값을 길이로 나눈 나머지를 인덱스로 사용하여 랜덤 선택 효과 부여
        const fortuneIndex = positiveHash % FORTUNE_TEMPLATES.length;
        // 명대사는 해시값을 조금 변형하여 (비트 이동) 서로 독립적인 인덱스를 뽑도록 처리
        const quoteIndex = (positiveHash >> 2) % MOVIE_QUOTES.length;

        const selectedFortune = FORTUNE_TEMPLATES[fortuneIndex];
        const selectedQuote = MOVIE_QUOTES[quoteIndex];

        const result = {
            title: selectedFortune.title,
            fortune: selectedFortune.text.replace(/{name}/g, name || '익명'),
            quoteText: selectedQuote.text,
            quoteMovie: selectedQuote.movie
        };

        // 프리미엄 AI 감성을 유지하기 위해 실제 AI가 생각하는 것처럼 약 1.5초 지연 대기
        await new Promise(resolve => setTimeout(resolve, 1500));

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
