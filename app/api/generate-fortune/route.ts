import { NextResponse } from 'next/server';

export const maxDuration = 10; // 10 seconds timeout for Vercel Hobby
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { name, gender, calendarType, birthYear, birthMonth, birthDay, birthTime } = await req.json();

        if (!birthYear || !birthMonth || !birthDay) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Determine Zodiac element strictly for prompt flavor
        const yearNum = parseInt(birthYear);
        const zodiacAnimals = ['원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양'];
        const zodiac = zodiacAnimals[yearNum % 12];

        // Construct Korean-style saju prompt
        const prompt = `
당신은 한국의 친근하면서도 통찰력 있는 사주/운세 전문가이자 영화 평론가입니다.
사용자의 사주 정보(가상)를 바탕으로, 지친 현대인에게 작은 위로와 희망이 되는 오늘의 운세 한마디를 해주고, 그 운세에 완벽하게 어울리는 감동적인 '영화 명대사' 하나를 추천해주세요. 명대사는 반드시 실존하는 유명한 영화의 구절이어야 합니다.

[사용자 정보]
- 이름(닉네임): ${name || '익명'}
- 생년월일: ${birthYear}년 ${birthMonth}월 ${birthDay}일 (${calendarType === 'solar' ? '양력' : '음력'})
- 태어난 시간: ${birthTime === 'unknown' ? '모름' : birthTime}
- 성별: ${gender === 'male' ? '남성' : '여성'}
- 띠: ${zodiac}띠

[응답 형식 (반드시 JSON 포맷으로 작성할 것)]
{
  "title": "금전운과 성취운이 깃든 하루입니다! ✨",
  "fortune": "${name || '익명'}님, 오늘은 당신의 끈기가 빛을 발하는 날입니다. (3~4문장의 따뜻하고 디테일한 운세 풀이 내용...)",
  "quoteText": "우리는 답을 찾을 것이다. 늘 그랬듯이.",
  "quoteMovie": "인터스텔라 (2014)"
}
`;

        // 1. Check if OpenAI API key exists
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({
                title: "API 키가 설정되지 않았습니다.",
                fortune: "서버에 OpenAI API 키가 없습니다. 로컬 환경에서 테스트 중이시라면 .env.local 파일에 OPENAI_API_KEY를 추가해주세요.",
                quoteText: "준비가 가장 완벽한 방패다.",
                quoteMovie: "시스템 메시지"
            }, { status: 200 });
        }

        // 2. Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.8,
                response_format: { type: "json_object" }
            }),
            signal: AbortSignal.timeout(9000) // 9 second fetch timeout
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("OpenAI API Error:", errorData);
            throw new Error("Failed to fetch from OpenAI");
        }

        const data = await response.json();
        const resultContent = data.choices[0].message.content;
        const parsedResult = JSON.parse(resultContent);

        return NextResponse.json(parsedResult);

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
