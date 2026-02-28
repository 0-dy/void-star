import { NextResponse } from "next/server";

interface Quote {
    text: string;
    source: string;
    keywords: string[];
}

// Curated database of cinematic quotes categorized by genre and mood keywords
const QUOTE_DATABASE: Record<string, Quote[]> = {
    "느와르": [
        { text: `"니가 가라 호와이."`, source: "- 친구 (2001)", keywords: ["배신", "실망", "친구", "원망", "체념"] },
        { text: `"살려는 드릴게."`, source: "- 신세계 (2013)", keywords: ["위협", "복수", "자신감", "여유", "화남"] },
        { text: `"내가 빙다리 핫바지로 보이냐?"`, source: "- 타짜 (2006)", keywords: ["의심", "분노", "무시", "짜증", "억울", "화남"] },
        { text: `"야, 4885. 너지?"`, source: "- 추격자 (2008)", keywords: ["집착", "분노", "공포", "의심", "추적"] },
        { text: `"호의가 계속되면, 그게 권리인 줄 알아요."`, source: "- 부당거래 (2010)", keywords: ["실망", "배신", "짜증", "교훈", "답답", "호의", "권리"] },
        { text: `"누구냐 넌?"`, source: "- 올드보이 (2003)", keywords: ["혼란", "복수", "의문", "과거", "고독", "외로움", "누구"] },
        { text: `"지금까지 이런 맛은 없었다. 이것은 갈비인가 통닭인가."`, source: "- 극한직업 (2019)", keywords: ["성공", "기쁨", "유쾌", "반전", "황당", "맛", "배고픔"] },
        { text: `"꼭 그렇게 다 가져가야만 속이 후련했냐!"`, source: "- 해바라기 (2006)", keywords: ["억울", "분노", "슬픔", "절망", "상실", "후회", "화남"] },
        { text: `"어이가 없네?"`, source: "- 베테랑 (2015)", keywords: ["황당", "어이없음", "분노", "짜증", "어이"] },
        { text: `"거 장난이 너무 심한 거 아니오!"`, source: "- 신세계 (2013)", keywords: ["당황", "원망", "불만", "절망", "장난"] },
        { text: `"너나 잘하세요."`, source: "- 친절한 금자씨 (2005)", keywords: ["무시", "냉소", "분노", "짜증", "당당", "간섭"] },
        { text: `"나 이대 나온 여자야."`, source: "- 타짜 (2006)", keywords: ["자신감", "체면", "당당", "자존심", "자랑"] },
        { text: `"마이 뭇따 아이가, 고마 해라..."`, source: "- 친구 (2001)", keywords: ["포기", "체념", "고통", "끝", "아픔", "그만"] }
    ],
    "SF": [
        { text: `"우린 답을 찾을 거야, 늘 그랬듯이."`, source: "- 인터스텔라 (2014) (한국 극장가 대흥행작)", keywords: ["희망", "도전", "위기", "극복", "미래", "답", "해결"] },
        { text: `"내가 진짜 누군지 나도 모르겠어."`, source: "- 승리호 (2021)", keywords: ["정체성", "혼란", "방황", "외로움", "자아", "모르겠어"] },
        { text: `"시간은 흐르지 않아. 단지 우리가 그 사이를 걸어갈 뿐이지."`, source: "- 외계+인 1부 (2022)", keywords: ["시간", "깨달음", "철학", "운명", "과거", "미래"] },
        { text: `"과거 수리가 곧 미래입니다."`, source: "- 원더랜드 (2024)", keywords: ["후회", "과거", "재건", "상실", "희망", "미래", "수리"] },
        { text: `"인간은 결국 자신이 만든 피조물에게 지배당할 수밖에 없는가."`, source: "- 정이 (2023)", keywords: ["두려움", "후회", "운명", "기술", "절망"] },
        { text: `"모든 생명은 결국 한 곳으로 모이게 되어 있어."`, source: "- 설국열차 (2013)", keywords: ["운명", "순리", "철학", "죽음", "끝", "만남"] },
        { text: `"우주선은 떠났고, 우리는 남겨졌다."`, source: "- 승리호 (2021)", keywords: ["외로움", "고립", "절망", "포기", "상실", "남겨짐"] },
        { text: `"기억을 아무리 지워도 흉터는 남는 법이지."`, source: "- 마녀 (2018)", keywords: ["상처", "트라우마", "과거", "고통", "기억", "흉터"] },
        { text: `"너는 내가 만든 가장 완벽한 피조물이야."`, source: "- 서복 (2021)", keywords: ["자부심", "존재", "생명", "목적", "사랑", "완벽"] },
        { text: `"이제 곧 비가 그칠 거야... 영원히."`, source: "- 마녀(魔女) Part2. (2022)", keywords: ["끝", "종말", "차분함", "체념", "위안"] }
    ],
    "로맨스": [
        { text: `"사랑을 노력한다는 게 말이 돼?"`, source: "- 8월의 크리스마스 (1998)", keywords: ["사랑", "이별", "단념", "의문", "아픔", "노력"] },
        { text: `"어떻게 사랑이 변하니?"`, source: "- 봄날은 간다 (2001)", keywords: ["배신", "실망", "이별", "슬픔", "상실", "변함"] },
        { text: `"내 머릿속에 지우개가 있대."`, source: "- 내 머리 속의 지우개 (2004)", keywords: ["슬픔", "망각", "두려움", "사랑", "애틋", "기억"] },
        { text: `"우리가 세상을 바꿀 순 없겠지만, 세상이 우리를 바꾸게 내버려두진 않을 거야."`, source: "- 1987 (2017)", keywords: ["희망", "의지", "사랑", "다짐", "용기", "세상"] },
        { text: `"나한테 왜 그랬어? 말해봐요."`, source: "- 달콤한 인생 (2005)", keywords: ["서운함", "원망", "상실", "배신", "슬픔", "이유"] },
        { text: `"너의 췌장을 먹고 싶어."`, source: "- 너의 췌장을 먹고 싶어 (2017)", keywords: ["고백", "진심", "가까움", "이해", "애틋", "사랑해"] },
        { text: `"당신은 나를 더 좋은 사람이 되고 싶게 만들어요."`, source: "- 이보다 더 좋을 순 없다 (1997) (한국인 애착 명대사)", keywords: ["사랑", "행복", "동기", "성장", "설렘", "좋은", "기쁨"] },
        { text: `"나 다시 돌아갈래!"`, source: "- 박하사탕 (1999)", keywords: ["후회", "과거", "절망", "그리움", "슬픔", "돌아갈래"] },
        { text: `"사랑해. 네가 어떤 모습이든, 어떤 선택을 하든."`, source: "- 뷰티 인사이드 (2015)", keywords: ["이해", "수용", "사랑", "다정", "진심", "위로"] },
        { text: `"우리 진짜 사귀는 거 맞아요?"`, source: "- 헤어질 결심 (2022)", keywords: ["의심", "불안", "관계", "애틋", "확인", "진심"] },
        { text: `"비가 온다고 해서 꼭 우산을 써야 하는 건 아니잖아."`, source: "- 연애소설 (2002)", keywords: ["자유", "일탈", "낭만", "사랑", "청춘", "여유"] },
        { text: `"기억해, 내가 널 사랑했던 시간들을."`, source: "- 클래식 (2003)", keywords: ["추억", "그리움", "아련함", "눈물", "이별", "시간"] }
    ],
    "철학적": [
        { text: `"뭣이 중헌디, 뭣이 중허냐고!"`, source: "- 곡성 (2016)", keywords: ["답답", "분노", "방황", "가치", "우선순위", "짜증", "중요"] },
        { text: `"사람이 언제 제일 예쁜 줄 알아? 죽을 준비가 다 됐을 때야."`, source: "- 마더 (2009)", keywords: ["허상", "체념", "아름다움", "죽음", "깨달음", "마지막"] },
        { text: `"밥은 먹고 다니냐?"`, source: "- 살인의 추억 (2003)", keywords: ["안부", "쓸쓸함", "연민", "분노", "인간성", "밥", "걱정"] },
        { text: `"인생은 초콜릿 상자와 같은 거야. 네가 무엇을 고를지 아무도 모르잖니."`, source: "- 포레스트 검프 (1994) (클래식 명대사)", keywords: ["인생", "운명", "희망", "불확실성", "기대", "미래"] },
        { text: `"세상이 끝났다고 생각했을 때, 비로소 진짜 삶이 시작되었다."`, source: "- 설국열차 (2013)", keywords: ["시작", "희망", "재건", "생존", "변화", "끝"] },
        { text: `"선 넘는 사람들, 내가 제일 싫어하는데."`, source: "- 기생충 (2019)", keywords: ["불쾌", "예의", "경고", "짜증", "거리감", "선"] },
        { text: `"가장 완벽한 계획이 뭔지 알아? 무계획이야."`, source: "- 기생충 (2019)", keywords: ["체념", "우울", "현실", "포기", "인생", "계획", "실망"] },
        { text: `"알려줘야지, 우린 계속 싸우고 있다고."`, source: "- 암살 (2015)", keywords: ["의지", "희망", "인내", "다짐", "저항", "싸움"] },
        { text: `"운명은 시계탑의 추처럼 일정한 박자로 움직이지 않는다."`, source: "- 관상 (2013)", keywords: ["운명", "불안", "철학", "인생", "불확실", "미래"] },
        { text: `"이게 다 무슨 소용이야, 결국엔 다 흙으로 돌아갈 텐데."`, source: "- 사도 (2015)", keywords: ["허무", "슬픔", "인생", "우울", "죽음", "단념"] },
        { text: `"우리가 세상을 구하는 게 아니라, 세상이 우리를 구하는 거야."`, source: "- 신과함께 (2017)", keywords: ["구원", "희망", "인간", "철학", "위로", "세상"] }
    ]
};

export async function POST(req: Request) {
    try {
        const { mood = "", genre } = await req.json();

        if (!genre) {
            return NextResponse.json(
                { error: "Genre is required" },
                { status: 400 }
            );
        }

        // Simulate AI thinking time to keep the premium feel
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Get quotes for the selected genre
        const categoryQuotes = QUOTE_DATABASE[genre] || QUOTE_DATABASE["느와르"];

        // 1. Analyze mood and weight related quotes
        // Find quotes whose keywords overlap with the user's mood string
        let matchingQuotes = categoryQuotes.filter(quote =>
            quote.keywords.some(keyword => mood.includes(keyword))
        );

        // 2. If no keywords match, fallback to choosing from the whole genre array
        if (matchingQuotes.length === 0) {
            matchingQuotes = categoryQuotes;
        }

        // Select a random quote from the filtered or fallback list
        const randomIndex = Math.floor(Math.random() * matchingQuotes.length);
        const selectedQuoteData = matchingQuotes[randomIndex];

        // Format quote string for frontend backwards compatibility
        const formattedQuote = `${selectedQuoteData.text}\n${selectedQuoteData.source}`;

        return NextResponse.json({ quote: formattedQuote });
    } catch (error) {
        console.error("Error generating quote:", error);
        return NextResponse.json(
            { error: "Failed to generate quote" },
            { status: 500 }
        );
    }
}

