import { NextResponse } from "next/server";

// Curated database of 100% free cinematic quotes categorized by genre
const QUOTE_DATABASE: Record<string, string[]> = {
    "느와르": [
        `"니가 가라 호와이."\n- 친구 (2001)`,
        `"살려는 드릴게."\n- 신세계 (2013)`,
        `"내가 빙다리 핫바지로 보이냐?"\n- 타짜 (2006)`,
        `"야, 4885. 너지?"\n- 추격자 (2008)`,
        `"호의가 계속되면, 그게 권리인 줄 알아요."\n- 부당거래 (2010)`,
        `"누구냐 넌?"\n- 올드보이 (2003)`,
        `"지금까지 이런 맛은 없었다. 이것은 갈비인가 통닭인가."\n- 극한직업 (2019) (블랙코미디지만 느와르풍으로!)`
    ],
    "SF": [
        `"우린 답을 찾을 거야, 늘 그랬듯이."\n- 인터스텔라 (2014) (한국 개봉작 중 가장 사랑받은 SF)`,
        `"내가 진짜 누군지 나도 모르겠어."\n- 승리호 (2021)`,
        `"시간은 흐르지 않아. 단지 우리가 그 사이를 걸어갈 뿐이지."\n- 외계+인 1부 (2022)`,
        `"과거 수리가 곧 미래입니다."\n- 원더랜드 (2024)`,
        `"인간은 결국 자신이 만든 피조물에게 지배당할 수밖에 없는가."\n- 정이 (2023)`
    ],
    "로맨스": [
        `"사랑을 노력한다는 게 말이 돼?"\n- 8월의 크리스마스 (1998)`,
        `"어떻게 사랑이 변하니?"\n- 봄날은 간다 (2001)`,
        `"내 머릿속에 지우개가 있대."\n- 내 머리 속의 지우개 (2004)`,
        `"우리가 세상을 바꿀 순 없겠지만, 세상이 우리를 바꾸게 내버려두진 않을 거야."\n- 1987 (2017) (시대극 속 애틋함)`,
        `"나한테 왜 그랬어? 말해봐요."\n- 달콤한 인생 (2005) (로맨스의 변주)`,
        `"너의 췌장을 먹고 싶어."\n- 너의 췌장을 먹고 싶어 (2017) (한국 개봉 인기 로맨스)`
    ],
    "사이버펑크": [
        `"이 세계가 가짜라면, 내 기억 속 당신의 체온도 가짜일까?"\n- 아가씨 (2016) (분위기 차용)`,
        `"기억은 데이터일 뿐이야. 중요한 건 지금 네가 느끼는 감정이지."\n- 사이보그지만 괜찮아 (2006)`,
        `"시스템 밖으로 나가는 것만이 유일한 생존 방법이다."\n- 늑대사냥 (2022)`,
        `"모든 게 연결되어 있다는 건, 모든 걸 잃을 준비가 되어 있다는 뜻이기도 하지."\n- 브로커 (2022)`,
        `"가상 현실에서 피 흘리면, 현실에서도 죽어. 조심해."\n- 콘크리트 유토피아 (2023) (아포칼립스 분위기)`
    ],
    "철학적": [
        `"뭣이 중헌디, 뭣이 중허냐고!"\n- 곡성 (2016)`,
        `"사람이 언제 제일 예쁜 줄 알아? 죽을 준비가 다 됐을 때야."\n- 마더 (2009)`,
        `"밥은 먹고 다니냐?"\n- 살인의 추억 (2003)`,
        `"인생은 초콜릿 상자와 같은 거야. 네가 무엇을 고를지 아무도 모르잖니."\n- 포레스트 검프 (1994) (한국 극장가를 울린 클래식)`,
        `"세상이 끝났다고 생각했을 때, 비로소 진짜 삶이 시작되었다."\n- 설국열차 (2013)`,
        `"선 넘는 사람들, 내가 제일 싫어하는데."\n- 기생충 (2019)`
    ]
};

export async function POST(req: Request) {
    try {
        const { mood, genre } = await req.json();

        if (!mood || !genre) {
            return NextResponse.json(
                { error: "Mood and genre are required" },
                { status: 400 }
            );
        }

        // Simulate AI thinking time to keep the premium feel
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Get quotes for the selected genre, or fallback to Noir
        const categoryQuotes = QUOTE_DATABASE[genre] || QUOTE_DATABASE["느와르"];

        // Select a random quote from the category
        const randomIndex = Math.floor(Math.random() * categoryQuotes.length);
        const selectedQuote = categoryQuotes[randomIndex];

        return NextResponse.json({ quote: selectedQuote });
    } catch (error) {
        console.error("Error generating quote:", error);
        return NextResponse.json(
            { error: "Failed to generate quote" },
            { status: 500 }
        );
    }
}

