import { NextResponse } from "next/server";

// Curated database of 100% free cinematic quotes categorized by genre
const QUOTE_DATABASE: Record<string, string[]> = {
    "느와르": [
        `"진실은 항상 빗속에 묻혀있지. 우리가 할 수 있는 건 그저 우산을 접는 것뿐이야."\n- 잿빛 거리의 사냥개들 (1998)`,
        `"도시는 밤이 되면 모든 거짓말을 삼켜버린다. 그리고 아침이 오면 다시 뱉어내지."\n- 심야의 그림자 (2005)`,
        `"그녀의 향수 냄새는 화약 같았고, 미소는 이미 장전되어 있었다."\n- 붉은 입술과 리볼버 (2012)`,
        `"과거에서 도망치는 건 쉬워. 하지만 과거가 널 쫓아오는 속도는 항상 조금 더 빠르지."\n- 안개 낀 항구 (1987)`,
        `"정의? 이 도시에서 정의는 가장 비싼 사치품일 뿐이다."\n- 무너진 빌딩 숲 (2021)`
    ],
    "SF": [
        `"우리가 별을 바라보는 이유는, 언젠가 그곳으로 돌아가야 한다는 걸 본능적으로 알기 때문이다."\n- 오리온의 끝 (2150)`,
        `"기계에게 감정을 가르친 건 우리의 가장 위대한 성취이자, 돌이킬 수 없는 실수였다."\n- 신인류의 도래 (2088)`,
        `"시간은 흐르지 않는다. 그저 우리가 시간 사이를 위태롭게 걸어가고 있을 뿐."\n- 네모난 양자역학 (2033)`,
        `"우주의 침묵은 아무것도 없기 때문이 아니다. 우리를 지켜보고 숨죽이고 있을 뿐이다."\n- 보이드 (2201)`,
        `"은하계를 다 준다 해도, 내 고향 행성의 흙냄새와는 바꿀 수 없어."\n- 귀환자들 (2400)`
    ],
    "로맨스": [
        `"당신을 사랑하는 방법을 배우는 데 평생이 걸렸지만, 사랑에 빠지는 건 단 1초면 충분했어."\n- 파리의 첫눈 (2014)`,
        `"네가 없는 세상은 색채를 잃은 흑백 영화 같아. 넌 내 삶에 색을 입혀준 유일한 사람이야."\n- 빛바랜 캔버스 (2009)`,
        `"수천 개의 평행우주가 존재한다고 해도, 나는 모든 우주에서 널 찾아내 사랑할 거야."\n- 유니버스 오브 러브 (2025)`,
        `"우리의 만남은 우연이었지만, 내가 당신을 놓지 않은 건 선택이었습니다."\n- 역에서 시계톱니바퀴 치다 (2018)`,
        `"당신이 곁에 있다면, 세상의 끝에서 맞이하는 종말조차 나쁘지 않을 것 같아."\n- 마지막 석양 (2022)`
    ],
    "사이버펑크": [
        `"육체는 낡고 부서지지만, 데이터는 영원하지. 영혼을 백업할 준비는 끝났나?"\n- 네온 시티의 유령 (2055)`,
        `"이곳에 진짜 하늘은 없다. 단지 비싸게 팔리는 고해상도 홀로그램 창문만이 있을 뿐."\n- 메가코프의 개자식들 (2068)`,
        `"우리의 눈물조차 합성 수지로 만들어졌지만, 이 빌어먹을 고통만큼은 진짜야."\n- 크롬 하트 (2070)`,
        `"네 대뇌 피질을 해킹할 순 있어도, 네가 가진 자유의지의 잔해까지 지울 순 없겠지."\n- 넷러너의 최후 (2049)`,
        `"싸구려 임플란트로 무장한 그가 가진 유일한 사치품은, 시스템에 복종하지 않는 반항심이었다."\n- 하층구역의 반란 (2082)`
    ],
    "철학적": [
        `"우리가 찾으려던 답은 이미 시작할 때부터 가지고 있었던 질문 속에 숨어있었다."\n- 끝나지 않은 거울 (2001)`,
        `"삶이란 완성된 그림을 그리는 것이 아니라, 수많은 스케치 중에서 가장 마음에 드는 것을 고르는 과정이다."\n- 모래 위의 조각상 (2011)`,
        `"모든 걸 통제하려는 강박을 내려놓을 때, 비로소 진짜 통제력이 생긴다."\n- 파도의 법칙 (2019)`,
        `"인간은 불완전함이라는 조각들로 완성이란 모자이크를 만들어가는 존재다."\n- 조각난 가면 (1995)`,
        `"밤이 깊을수록 별이 선명해지듯, 절망의 끝에서 희망은 가장 밝게 빛난다."\n- 심오한 계곡 (2008)`
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

