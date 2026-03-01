import { NextResponse } from 'next/server';

// 10초 타임아웃 방지
export const maxDuration = 10;
export const dynamic = 'force-dynamic';

const FORTUNE_TEMPLATES = [
    { title: "새로운 기운이 샘솟는 하루입니다! 🌱", text: "{name}님, 오늘 하루는 그동안 머뭇거렸던 일에 과감히 도전해보기 좋은 날입니다. 작은 성공이 큰 파도를 만들어낼 거예요." },
    { title: "뜻밖의 행운이 찾아올지도 몰라요! 🍀", text: "{name}님, 오늘은 주변 사람들의 말에 귀 기울여보세요. 평범한 대화 속에서 귀중한 힌트를 얻을 수 있는 날입니다." },
    { title: "꾸준함이 빛을 발하는 하루입니다. ✨", text: "{name}님, 지금까지 묵묵히 노력해온 것들이 서서히 결실을 맺을 준비를 하고 있습니다. 오늘은 스스로를 칭찬해주세요." },
    { title: "금전운과 성취운이 깃든 하루입니다! 💰", text: "{name}님, 오늘은 당신의 직감력이 유난히 뛰어난 날입니다. 결정해야 할 일이 있다면 마음이 이끄는 대로 선택해보세요." },
    { title: "조금 쉬어가도 좋은 여유로운 하루입니다. ☕", text: "{name}님, 오늘은 무리하게 진도를 빼기보다 상황을 반추하고 마음을 다독이는 시간이 필요합니다. 쉼이 곧 전진입니다." },
    { title: "귀인의 도움으로 막힌 일이 풀릴 징조입니다. 🤝", text: "{name}님, 평소 연락하지 않던 지인이나 동료의 한마디가 큰 실마리가 될 수 있습니다. 마음을 열고 다가가세요." },
    { title: "내 안의 에너지가 넘쳐흐르는 하루입니다! 🔥", text: "{name}님, 계획했던 일이 있다면 바로 오늘 시작하세요. 넘치는 열정이 주변 사람들까지 긍정적으로 물들일 것입니다." },
    { title: "지혜롭게 위기를 기회로 바꿀 수 있는 날! 🧠", text: "{name}님, 사소한 오해나 실수가 생기더라도 당황하지 마세요. 오히려 그것이 전화위복이 되어 더 좋은 결과를 낳을 운세입니다." },
    { title: "소소한 행복이 연속되는 하루입니다. 🎀", text: "{name}님, 오늘은 기대하지 않았던 작은 일들이 모여 큰 행복을 만들어내는 날입니다. 주위를 둘러보며 미소를 지어보세요." },
    { title: "창의력이 샘솟는 아이디어의 날입니다! 💡", text: "{name}님, 머릿속에 떠오른 그 생각, 가볍게 넘기지 마세요. 오늘 떠오른 직감이 당신을 아주 좋은 방향으로 이끌어 줄 것입니다." }
];

const MOVIE_QUOTES = [
    { text: "우리는 답을 찾을 것이다. 늘 그랬듯이.", movie: "인터스텔라 (2014)" },
    { text: "때론 과감한 결단이 인생을 바꾸기도 해.", movie: "인셉션 (2010)" },
    { text: "준비가 가장 완벽한 방패다.", movie: "명량 (2014)" },
    { text: "포스가 너와 함께 하기를.", movie: "스타워즈 (1977)" },
    { text: "오늘의 특별한 순간들은 내일의 기억들이야.", movie: "알라딘 (1992)" },
    { text: "최고의 순간은 아직 오지 않았어.", movie: "토이 스토리 3 (2010)" },
    { text: "어떤 새는 새장에 가둘 수 없다. 그 깃털이 너무 아름답기 때문이다.", movie: "쇼생크 탈출 (1994)" },
    { text: "당신은 나를 더 좋은 사람이 되고 싶게 만들어요.", movie: "이보다 더 좋을 순 없다 (1997)" },
    { text: "그게 바로 나야, 완벽하지 않은 나.", movie: "데드풀 (2016)" },
    { text: "인생은 초콜릿 상자와 같은 거야. 네가 무엇을 고를지 아무도 모르잖니.", movie: "포레스트 검프 (1994)" },
    { text: "눈에 보이지 않는다고 해서 없는 것은 아니야.", movie: "나니아 연대기 (2005)" },
    { text: "가끔은 마음이 가는 대로 해야 해, 결과를 생각하지 말고.", movie: "센과 치히로의 행방불명 (2001)" },
    { text: "우리가 결정해야 할 것은 오직 우리에게 주어진 시간을 어떻게 쓸 것인가 뿐이다.", movie: "반지의 제왕 (2001)" },
    { text: "마법은 항상 네 곁에 있어.", movie: "신비한 동물사전 (2016)" },
    { text: "기억해, 네가 모은 것만이 네가 가져갈 수 있는 거야.", movie: "센과 치히로의 행방불명 (2001)" },
    { text: "우리가 세상을 구하는 게 아니라, 세상이 우리를 구하는 거야.", movie: "신과함께 (2017)" }
];

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
