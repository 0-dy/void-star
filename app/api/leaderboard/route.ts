import { NextResponse } from "next/server";

export interface LeaderboardEntry {
    nickname: string;
    score: number;
    timestamp: number;
}

// In-memory array for simplicity. Note: This clears on Vercel serverless cold starts.
// For a production persistent leaderboard, replace with a database like Vercel KV or Supabase.
let LEADERBOARD: LeaderboardEntry[] = [];

// A basic list of Korean profanities/slang and explicit terms to filter out.
// Add more to this list as needed.
const BAD_WORDS = [
    "시발", "씨발", "개새끼", "병신", "지랄", "좆", "썅", "미친", "애미", "느금마",
    "염병", "창녀", "새끼", "섹스", "보지", "자지", "빨통", "딸딸이", "강간", "매춘"
];

function containsProfanity(text: string): boolean {
    const lowerText = text.toLowerCase();
    // Check if any bad word is a substring of the input text
    return BAD_WORDS.some(word => lowerText.includes(word));
}

export async function GET() {
    return NextResponse.json({ leaderboard: LEADERBOARD });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { nickname, score } = body;

        if (!nickname || typeof nickname !== "string" || nickname.trim() === "") {
            return NextResponse.json({ error: "닉네임을 입력해주세요." }, { status: 400 });
        }

        if (nickname.length > 8) {
            return NextResponse.json({ error: "닉네임은 최대 8자까지 가능합니다." }, { status: 400 });
        }

        if (containsProfanity(nickname)) {
            return NextResponse.json(
                { error: "사용할 수 없는 단어가 포함되어 있습니다. 건전한 닉네임을 사용해주세요." },
                { status: 400 }
            );
        }

        if (typeof score !== "number" || score < 0) {
            return NextResponse.json({ error: "유효하지 않은 점수입니다." }, { status: 400 });
        }

        const newEntry: LeaderboardEntry = {
            nickname: nickname.trim(),
            score,
            timestamp: Date.now()
        };

        // Add to leaderboard, sort globally by score descending, and keep only Top 10
        LEADERBOARD.push(newEntry);
        LEADERBOARD.sort((a, b) => b.score - a.score);
        LEADERBOARD = LEADERBOARD.slice(0, 10);

        return NextResponse.json({ success: true, leaderboard: LEADERBOARD });
    } catch (error) {
        console.error("Leaderboard POST error:", error);
        return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
    }
}
