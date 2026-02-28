"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";

const GENRES = ["느와르", "SF", "로맨스", "철학적"];

export default function Home() {
  const [mood, setMood] = useState("");
  const [selectedGenre, setSelectedGenre] = useState(GENRES[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quote, setQuote] = useState("");
  const quoteCardRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!mood.trim()) return;
    setIsGenerating(true);
    setQuote("");

    try {
      const response = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, genre: selectedGenre }),
      });

      const data = await response.json();

      if (response.ok && data.quote) {
        setQuote(data.quote);
      } else {
        alert("명언 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error connecting to API:", error);
      alert("명언 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async () => {
    if (!quoteCardRef.current) return;

    try {
      const dataUrl = await toPng(quoteCardRef.current, {
        backgroundColor: "#09090b", // Match background
        pixelRatio: 2, // Higher quality
      });

      const link = document.createElement("a");
      link.download = `my-mood-quote-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
      alert("이미지 저장에 실패했습니다.");
    }
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Ornaments */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* Main Glass Container */}
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 sm:p-12 flex flex-col items-center z-10 animate-fade-in-up">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400 animate-float">
            기분에 따른 영화 명대사
          </h1>
          <p className="text-gray-400 text-lg break-keep">
            지금 당신의 기분을 영화 같은 명대사로 바꿔보세요.
          </p>
        </div>

        {/* Input Component */}
        <div className="w-full space-y-6">
          <div className="space-y-3">
            <label htmlFor="mood" className="text-sm font-medium text-gray-300 ml-1">
              오늘 기분이 어떠신가요?
            </label>
            <textarea
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="예: 큰 프로젝트를 막 끝내서 몸은 피곤하지만 마음은 아주 뿌듯해..."
              className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300 ml-1">
              원하는 장르 / 분위기 선택
            </label>
            <div className="flex flex-wrap gap-3">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${selectedGenre === genre
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/25"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                    }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!mood.trim() || isGenerating}
            className="w-full py-4 mt-4 bg-white text-black rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-gray-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-white flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                명대사를 찾는 중...
              </>
            ) : (
              "명대사 보기"
            )}
          </button>
        </div>

        {/* Result Component (Initial Mockup) */}
        {quote && (
          <div className="mt-12 w-full animate-fade-in-up">
            <div
              ref={quoteCardRef}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black border border-white/10 p-8 shadow-2xl"
            >
              <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-purple-500/10 to-transparent blur-2xl"></div>
              <div className="relative z-10 break-keep">
                <p className="text-2xl sm:text-3xl font-serif italic text-white leading-relaxed mb-8">
                  {quote.split('\n')[0]}
                </p>
                <p className="text-right text-gray-400 font-medium tracking-wide">
                  {quote.split('\n').length > 1 ? quote.split('\n')[1] : ""}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 px-2">
              <button
                onClick={handleDownloadImage}
                className="text-sm font-medium bg-white/10 text-white px-4 py-2 rounded-full hover:bg-white/20 transition-all border border-white/10"
              >
                이미지 저장하기
              </button>
              <a
                href="https://buymeacoffee.com/lemon1106"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-2 rounded-full shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 transition-all hover:-translate-y-0.5"
              >
                <span>☕</span> 개발자에게 커피 한 잔
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
