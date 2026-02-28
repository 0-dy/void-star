import { NextResponse } from "next/server";

interface Quote {
    text: string;
    source: string;
    keywords: string[];
}

// Importing the same database basically (we copy it here for this route)
const QUOTE_DATABASE: Record<string, Quote[]> = {
    "액션(Action)": [
        { text: `"매너가 사람을 만든다."`, source: "- 킹스맨: 시크릿 에이전트 (2015)", keywords: ["매너", "예의", "분노", "멋짐", "신사", "액션"] },
        { text: `"아이 윌 비 백 (I'll be back)."`, source: "- 터미네이터 (1984)", keywords: ["의지", "복귀", "다짐", "재도전", "약속"] },
        { text: `"내가 누군지 알아야겠어."`, source: "- 본 아이덴티티 (2002)", keywords: ["정체성", "혼란", "추적", "목적", "자아"] },
        { text: `"살고 싶다면 나와 함께 가자."`, source: "- 터미네이터 2: 심판의 날 (1991)", keywords: ["구원", "도움", "생존", "위기", "절망", "탈출"] },
        { text: `"와칸다 포에버!"`, source: "- 블랙 팬서 (2018)", keywords: ["결의", "희망", "의지", "전투", "단합", "열정"] },
        { text: `"복수는 차갑게 식혀 먹어야 맛있는 음식과 같다."`, source: "- 킬 빌 (2003)", keywords: ["복수", "인내", "설움", "단호함", "차가움"] }
    ],
    "스릴러(Thriller)": [
        { text: `"야, 4885. 너지?"`, source: "- 추격자 (2008)", keywords: ["집착", "분노", "공포", "의심", "추적"] },
        { text: `"사람이 언제 제일 예쁜 줄 알아? 죽을 준비가 다 됐을 때야."`, source: "- 마더 (2009)", keywords: ["허상", "체념", "아름다움", "죽음", "깨달음", "마지막"] },
        { text: `"세상에서 가장 큰 속임수는 악마가 자신은 존재하지 않는다고 세상을 설득한 것이다."`, source: "- 유주얼 서스펙트 (1995)", keywords: ["거짓", "속임수", "반전", "충격", "악", "배신"] },
        { text: `"어떤 새는 새장에 가둘 수 없다. 그 깃털이 너무 아름답기 때문이다."`, source: "- 쇼생크 탈출 (1994)", keywords: ["자유", "희망", "구속", "아름다움", "탈출"] },
        { text: `"너나 잘하세요."`, source: "- 친절한 금자씨 (2005)", keywords: ["무시", "냉소", "분노", "짜증", "당당", "간섭"] },
        { text: `"가장 잔인한 괴물은 인간의 형태를 하고 있다."`, source: "- 고백 (2010)", keywords: ["인간성", "공포", "잔혹", "충격", "괴물"] }
    ],
    "판타지(Fantasy)": [
        { text: `"해리, 네가 누구인지 보여주는 건 너의 능력이 아니라 너의 선택이란다."`, source: "- 해리 포터와 비밀의 방 (2002)", keywords: ["선택", "정체성", "성장", "능력", "고민"] },
        { text: `"포스가 너와 함께 하기를."`, source: "- 스타워즈 (1977)", keywords: ["응원", "희망", "의지", "행운", "축복"] },
        { text: `"우리가 결정해야 할 것은 오직 우리에게 주어진 시간을 어떻게 쓸 것인가 뿐이다."`, source: "- 반지의 제왕: 반지 원정대 (2001)", keywords: ["시간", "인생", "선택", "운명", "결정"] },
        { text: `"마법은 항상 네 곁에 있어."`, source: "- 신비한 동물사전 (2016)", keywords: ["희망", "마음", "위로", "환상", "기적"] },
        { text: `"기억해, 네가 모은 것만이 네가 가져갈 수 있는 거야."`, source: "- 센과 치히로의 행방불명 (2001)", keywords: ["기억", "성장", "용기", "경험", "잃어버린"] },
        { text: `"눈에 보이지 않는다고 해서 없는 것은 아니야."`, source: "- 나니아 연대기 (2005)", keywords: ["믿음", "상상", "신뢰", "진실", "보이지않는"] }
    ],
    "범죄(Crime)": [
        { text: `"니가 가라 호와이."`, source: "- 친구 (2001)", keywords: ["배신", "실망", "친구", "원망", "체념", "단념"] },
        { text: `"살려는 드릴게."`, source: "- 신세계 (2013)", keywords: ["위협", "복수", "자신감", "여유", "화남"] },
        { text: `"호의가 계속되면, 그게 권리인 줄 알아요."`, source: "- 부당거래 (2010)", keywords: ["실망", "배신", "짜증", "교훈", "답답", "호의", "권리"] },
        { text: `"어이가 없네?"`, source: "- 베테랑 (2015)", keywords: ["황당", "어이없음", "분노", "짜증", "어이"] },
        { text: `"내가 거절할 수 없는 제안을 하겠다."`, source: "- 대부 (1972)", keywords: ["협상", "권력", "위협", "단호", "결단"] },
        { text: `"내가 빙다리 핫바지로 보이냐?"`, source: "- 타짜 (2006)", keywords: ["의심", "분노", "무시", "짜증", "억울", "화남"] }
    ],
    "애니(Animation)": [
        { text: `"오늘의 특별한 순간들은 내일의 기억들이야."`, source: "- 알라딘 (1992)", keywords: ["기억", "순간", "추억", "행복", "오늘"] },
        { text: `"너의 췌장을 먹고 싶어."`, source: "- 애니메이션: 너의 췌장을 먹고 싶어 (2018)", keywords: ["고백", "진심", "가까움", "이해", "애틋", "사랑해", "슬픔"] },
        { text: `"과거는 아플 수 있어. 하지만 넌 거기서 도망칠 수도 있고, 배울 수도 있지."`, source: "- 라이온 킹 (1994)", keywords: ["과거", "고통", "성장", "극복", "배움"] },
        { text: `"최고의 순간은 아직 오지 않았어."`, source: "- 토이 스토리 3 (2010)", keywords: ["희망", "미래", "위로", "기대", "기쁨"] },
        { text: `"보이지 않는다고 해서 믿지 못할 이유는 없지."`, source: "- 엘리멘탈 (2023)", keywords: ["용기", "편견", "이해", "서로", "다름", "믿음"] },
        { text: `"가끔은 마음이 가는 대로 해야 해, 결과를 생각하지 말고."`, source: "- 센과 치히로의 행방불명 (2001)", keywords: ["마음", "용기", "선택", "자유", "결정"] }
    ],
    "로맨스(Romance)": [
        { text: `"당신은 나를 더 좋은 사람이 되고 싶게 만들어요."`, source: "- 이보다 더 좋을 순 없다 (1997)", keywords: ["사랑", "행복", "동기", "성장", "설렘", "기쁨"] },
        { text: `"사랑을 노력한다는 게 말이 돼?"`, source: "- 8월의 크리스마스 (1998)", keywords: ["사랑", "이별", "단념", "의문", "아픔", "노력"] },
        { text: `"어떻게 사랑이 변하니?"`, source: "- 봄날은 간다 (2001)", keywords: ["배신", "실망", "이별", "슬픔", "상실", "변함"] },
        { text: `"사랑은 눈으로 보는 것이 아니라, 마음으로 보는 거야."`, source: "- 라 라 랜드 (2016)", keywords: ["사랑", "꿈", "낭만", "설렘", "마음"] },
        { text: `"당신을 만나기 전까지, 내 인생은 흑백이었어요."`, source: "- 로마의 휴일 (1953)", keywords: ["시작", "생기", "사랑", "운명", "행복"] },
        { text: `"우리 진짜 사귀는 거 맞아요?"`, source: "- 헤어질 결심 (2022)", keywords: ["의심", "불안", "관계", "애틋", "확인", "진심"] }
    ],
    "코미디(Comedy)": [
        { text: `"지금까지 이런 맛은 없었다. 이것은 갈비인가 통닭인가."`, source: "- 극한직업 (2019)", keywords: ["성공", "기쁨", "유쾌", "반전", "황당", "맛", "배고픔"] },
        { text: `"그게 바로 나야, 완벽하지 않은 나."`, source: "- 데드풀 (2016)", keywords: ["자신감", "당당", "유쾌", "긍정", "자아"] },
        { text: `"우리가 세상을 구하는 게 아니라, 세상이 우리를 구하는 거야."`, source: "- 신과함께 (2017)", keywords: ["구원", "희망", "인간", "위로", "유쾌", "세상"] },
        { text: `"난 괜찮아, 아주 멀쩡해!"`, source: "- 아가씨 (2016)", keywords: ["거짓말", "자존심", "당황", "괜찮은척", "멘탈"] },
        { text: `"너는 계획이 다 있구나!"`, source: "- 기생충 (2019)", keywords: ["감탄", "계획", "칭찬", "놀람", "준비", "유머"] },
        { text: `"인생은 초콜릿 상자와 같은 거야. 네가 무엇을 고를지 아무도 모르잖니."`, source: "- 포레스트 검프 (1994)", keywords: ["인생", "운명", "희망", "불확실성", "기대", "미래"] }
    ]
};

// Flatten to a single array for this API route
const ALL_QUOTES = Object.values(QUOTE_DATABASE).flat();

export async function GET() {
    try {
        const isCorrectChoice = Math.random() > 0.5;

        // Randomly Select a Quote
        const realQuote = ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];

        let displaySource = realQuote.source;
        let actualSource = undefined;

        if (!isCorrectChoice) {
            // Pick a WRONG source
            let fakeSourceData;
            do {
                fakeSourceData = ALL_QUOTES[Math.floor(Math.random() * ALL_QUOTES.length)];
            } while (fakeSourceData.source === realQuote.source);

            displaySource = fakeSourceData.source;
            actualSource = realQuote.source;
        }

        const cleanSource = displaySource.replace("- ", "").trim();
        const cleanActual = actualSource ? actualSource.replace("- ", "").trim() : undefined;

        // Add small deterministic delay for UI feel
        await new Promise((resolve) => setTimeout(resolve, 600));

        return NextResponse.json({
            quote: realQuote.text,
            source: cleanSource,
            isCorrect: isCorrectChoice,
            actualSource: cleanActual
        });

    } catch (error) {
        console.error("Quiz Error:", error);
        return NextResponse.json({ error: "Failed to load quiz" }, { status: 500 });
    }
}
