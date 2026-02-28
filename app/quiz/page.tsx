"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface QuizQuestion {
    quote: string;
    source: string;
    isCorrect: boolean;
    actualSource?: string;
}

export default function Quiz() {
    const [question, setQuestion] = useState<QuizQuestion | null>(null);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [showConfetti, setShowConfetti] = useState(false);

    const fetchQuestion = async () => {
        setLoading(true);
        setFeedback(null);
        setShowConfetti(false);
        try {
            const res = await fetch("/api/quiz-question");
            if (res.ok) {
                const data = await res.json();
                setQuestion(data);
            }
        } catch (error) {
            console.error("Failed to fetch quiz question", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestion();
    }, []);

    const handleAnswer = (userAnswer: boolean) => {
        if (!question || feedback) return;

        const isCorrect = userAnswer === question.isCorrect;

        if (isCorrect) {
            setScore(s => s + 10);
            setStreak(s => s + 1);
            setFeedback({ isCorrect: true, message: "정답입니다! 🎉" });

            if (streak + 1 >= 3) {
                // Fire custom CSS confetti on a streak of 3 or more
                setShowConfetti(true);
            }
        } else {
            setStreak(0);
            setFeedback({
                isCorrect: false,
                message: `땡! 틀렸습니다. (원작: ${question.actualSource || question.source})`
            });
        }

        setQuestionsAnswered(q => q + 1);

        // Load next question automatically after a delay
        setTimeout(() => {
            if (questionsAnswered + 1 >= 10) {
                setGameOver(true);
            } else {
                fetchQuestion();
            }
        }, 2000);
    };

    const restartQuiz = () => {
        setScore(0);
        setStreak(0);
        setQuestionsAnswered(0);
        setGameOver(false);
        setHasSubmitted(false);
        setNickname("");
        fetchQuestion();
    };

    const [nickname, setNickname] = useState("");
    const [leaderboardError, setLeaderboardError] = useState("");
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const submitScore = async () => {
        if (!nickname.trim()) {
            setLeaderboardError("닉네임을 입력해주세요.");
            return;
        }

        setSubmitting(true);
        setLeaderboardError("");

        try {
            const res = await fetch("/api/leaderboard", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nickname, score })
            });
            const data = await res.json();

            if (!res.ok) {
                setLeaderboardError(data.error || "등록에 실패했습니다.");
            } else {
                setHasSubmitted(true);
                setLeaderboard(data.leaderboard);
            }
        } catch (error) {
            setLeaderboardError("서버 오류가 발생했습니다.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4 bg-[#fdf8f0]">
            {/* Background Ornaments */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            {/* Main Glass Container */}
            <div className="glass-panel w-full max-w-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-12 flex flex-col items-center z-10 animate-fade-in-up border border-[#d4a373]/30">

                {/* Navigation back to home */}
                <div className="w-full flex justify-between items-center mb-6">
                    <Link href="/" className="text-[#8b5a2b] font-bold hover:text-[#d4a373] transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        홈으로
                    </Link>
                    <div className="flex bg-[#faedcd] border border-[#d4a373] px-4 py-1.5 rounded-full shadow-sm text-sm font-bold text-[#8b5a2b] gap-4">
                        <span>점수: {score}</span>
                        {streak > 1 && <span className="text-[#ee9b00] animate-pulse">🔥 {streak}연승!</span>}
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#8b5a2b] to-[#c17f45] drop-shadow-sm">
                        명대사 팩트체크 O/X
                    </h1>
                    <p className="text-[#6b4e31] text-sm font-medium">
                        이 대사는 과연 이 영화에 나왔을까요? ({questionsAnswered <= 10 ? questionsAnswered : 10}/10)
                    </p>
                </div>

                {gameOver ? (
                    <div className="w-full text-center py-6 animate-fade-in-up px-4 flex flex-col items-center">
                        <h2 className="text-4xl font-black text-[#5c4033] mb-4">게임 종료!</h2>
                        <p className="text-xl font-bold text-[#8b5a2b] mb-6">최종 점수: <span className="text-3xl text-[#ee9b00]">{score}</span>점</p>

                        {!hasSubmitted ? (
                            <div className="w-full max-w-sm bg-white/50 p-6 rounded-2xl border border-[#d4a373]/30 mb-8">
                                <h3 className="text-lg font-bold text-[#5c4033] mb-4 text-left">리더보드 등록</h3>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="닉네임 (최대 8자)"
                                        maxLength={8}
                                        className="flex-1 px-4 py-2 rounded-xl border-2 border-[#e6d5c3] focus:border-[#d4a373] focus:outline-none text-[#4a3627] font-bold"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                    />
                                    <button
                                        onClick={submitScore}
                                        disabled={submitting || nickname.length === 0}
                                        className="bg-[#d4a373] text-white px-4 py-2 rounded-xl font-bold hover:bg-[#c17f45] transition-colors disabled:opacity-50"
                                    >
                                        등록
                                    </button>
                                </div>
                                {leaderboardError && <p className="text-red-500 font-bold text-sm mt-3 text-left">{leaderboardError}</p>}
                                <p className="text-[#8b5a2b]/70 text-xs text-left mt-2">※ 비속어 또는 부적절한 닉네임은 등록이 제한됩니다.</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-sm bg-white p-6 rounded-2xl border-2 border-[#e6d5c3] shadow-md mb-8">
                                <div className="flex items-center justify-between mb-4 border-b border-[#e6d5c3] pb-2">
                                    <h3 className="text-xl font-black text-[#5c4033] flex items-center gap-2">👑 명예의 전당 Top 10</h3>
                                </div>
                                <ul className="space-y-3">
                                    {leaderboard.map((entry, idx) => (
                                        <li key={idx} className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-3">
                                                <span className={`font-black w-5 text-center ${idx === 0 ? 'text-yellow-500 text-lg' : idx === 1 ? 'text-gray-400 text-lg' : idx === 2 ? 'text-amber-600 text-lg' : 'text-[#8b5a2b]'}`}>
                                                    {idx + 1}
                                                </span>
                                                <span className={`font-bold ${entry.nickname === nickname ? 'text-[#c17f45]' : 'text-[#4a3627]'}`}>
                                                    {entry.nickname}
                                                </span>
                                            </div>
                                            <span className="font-bold text-[#8b5a2b] bg-[#fdf8f0] px-3 py-1 rounded-full border border-[#e6d5c3]">
                                                {entry.score}점
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={restartQuiz}
                            className="bg-[#4a3627] text-white px-8 py-3 rounded-xl font-bold text-lg hover:-translate-y-1 hover:shadow-lg transition-transform w-full max-w-sm"
                        >
                            다시 도전하기 🔄
                        </button>
                    </div>
                ) : (
                    <div className="w-full max-w-lg relative">
                        {/* Quiz Card */}
                        <div className={`relative overflow-hidden rounded-2xl bg-[#fffefc] border-2 border-[#e6d5c3] p-8 shadow-xl shadow-[#d4a373]/10 transition-transform duration-300 ${feedback ? (feedback.isCorrect ? "scale-[1.02] border-green-400" : "scale-[0.98] border-red-400") : ""}`}>
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>

                            {loading ? (
                                <div className="h-48 flex items-center justify-center">
                                    <span className="text-[#8b5a2b] font-bold animate-pulse text-xl">문제 불러오는 중... 🎬</span>
                                </div>
                            ) : question ? (
                                <div className="min-h-[12rem] flex flex-col justify-center items-center text-center relative z-10">
                                    <span className="text-4xl text-[#d4a373] opacity-30 absolute -top-2 left-0 font-serif">"</span>
                                    <p className="text-2xl font-bold text-[#4a3627] leading-relaxed mb-6 px-4 tracking-tight break-keep">
                                        {question.quote}
                                    </p>
                                    <span className="text-4xl text-[#d4a373] opacity-30 absolute bottom-12 right-0 font-serif">"</span>
                                    <div className="w-full border-t border-dashed border-[#d4a373]/30 pt-4 mt-2">
                                        <p className="text-lg font-bold text-[#8b5a2b]">
                                            영화 <span className="text-[#c17f45]">{question.source}</span> 의 대사가 맞을까요?
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-48 flex items-center justify-center">
                                    <span className="text-red-500 font-bold">오류가 발생했습니다.</span>
                                </div>
                            )}
                        </div>

                        {/* Answer Result Overlay */}
                        {feedback && (
                            <div className="absolute -top-4 w-full flex justify-center z-20 animate-fade-in-up">
                                <div className={`px-6 py-2 rounded-full font-bold text-white shadow-lg ${feedback.isCorrect ? "bg-green-500" : "bg-red-500"}`}>
                                    {feedback.message}
                                </div>
                            </div>
                        )}

                        {/* O / X Buttons */}
                        <div className="flex gap-4 mt-8 w-full justify-center">
                            <button
                                onClick={() => handleAnswer(true)}
                                disabled={loading || feedback !== null}
                                className="flex-1 max-w-[160px] aspect-square rounded-2xl bg-white border-4 border-[#8b5a2b]/20 shadow-md flex items-center justify-center text-5xl sm:text-7xl font-black text-green-500 transition-all hover:bg-green-50 hover:border-green-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                O
                            </button>
                            <button
                                onClick={() => handleAnswer(false)}
                                disabled={loading || feedback !== null}
                                className="flex-1 max-w-[160px] aspect-square rounded-2xl bg-white border-4 border-[#8b5a2b]/20 shadow-md flex items-center justify-center text-5xl sm:text-7xl font-black text-red-500 transition-all hover:bg-red-50 hover:border-red-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                            >
                                X
                            </button>
                        </div>

                    </div>
                )}
            </div>

            {/* Custom Simple Confetti Effect */}
            {showConfetti && (
                <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
                    {[...Array(30)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-3 h-3 rounded-sm animate-confetti"
                            style={{
                                backgroundColor: ['#d4a373', '#ee9b00', '#94d2bd', '#e9d8a6'][i % 4],
                                left: `${50 + (Math.random() - 0.5) * 50}%`,
                                top: '50%',
                                animationDuration: `${1 + Math.random()}s`,
                                animationDelay: `${Math.random() * 0.2}s`,
                                transform: `translate(${(Math.random() - 0.5) * 500}px, ${(Math.random() - 0.5) * 500}px) rotate(${Math.random() * 360}deg)`,
                                opacity: 0
                            }}
                        />
                    ))}
                </div>
            )}
        </main>
    );
}
