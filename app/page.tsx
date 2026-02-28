"use client";

import { useState, useRef } from "react";
import { toPng } from "html-to-image";

const GENRES = ["랜덤", "느와르", "SF", "로맨스", "철학"];

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
        backgroundColor: "#fdf8f0", // Match new warm background
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
    <main className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4 bg-[#fdf8f0]">
      {/* Background Ornaments */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* Main Glass Container */}
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-8 sm:p-12 flex flex-col items-center z-10 animate-fade-in-up border border-[#d4a373]/30">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#8b5a2b] to-[#c17f45] animate-float drop-shadow-sm">
            명대사 포춘쿠키
          </h1>
          <p className="text-[#6b4e31] text-lg break-keep font-medium">
            지금 당신의 기분에 따른 영화 명대사를 보여드려요.
          </p>
        </div>

        {/* Input Component */}
        <div className="w-full space-y-6">
          <div className="space-y-3">
            <label htmlFor="mood" className="text-sm font-bold text-[#5c4033] ml-1">
              오늘 기분은 어떠세요?
            </label>
            <textarea
              id="mood"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder="예: 큰 프로젝트를 막 끝내서 몸은 피곤하지만 마음은 아주 뿌듯해..."
              className="w-full h-32 bg-white/70 border border-[#d4a373]/50 rounded-2xl p-4 text-[#4a3627] placeholder-[#a68a6d] focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition-all resize-none shadow-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-[#5c4033] ml-1">
              원하는 장르 / 분위기 선택
            </label>
            <div className="flex flex-wrap gap-3">
              {GENRES.map((genre) => (
                <button
                  key={genre}
                  onClick={() => setSelectedGenre(genre)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${genre === "랜덤" ? "mr-4" : ""} ${selectedGenre === genre
                    ? "bg-gradient-to-r from-[#b57b42] to-[#d4a373] text-white shadow-md shadow-[#d4a373]/40 border border-[#8b5a2b]/20"
                    : "bg-white/60 text-[#8b5a2b] hover:bg-[#faedcd] border border-[#d4a373]/30 shadow-sm"
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
            className="w-full py-4 mt-6 bg-[#4a3627] text-[#fdf8f0] rounded-2xl font-black text-lg transition-all duration-300 hover:bg-[#342419] hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:bg-[#8b7355] flex items-center justify-center gap-2 border-b-4 border-[#2b1e15] active:border-b-0 active:translate-y-1"
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
              className="relative overflow-hidden rounded-2xl bg-[#fffefc] border-2 border-[#e6d5c3] p-8 sm:p-10 shadow-xl shadow-[#d4a373]/10"
            >
              {/* Subtle paper texture overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>

              <div className="relative z-10 break-keep text-center">
                <span className="text-4xl text-[#d4a373] opacity-30 absolute -top-4 -left-2 font-serif">"</span>
                <p className="text-2xl sm:text-3xl font-serif text-[#4a3627] leading-relaxed mb-8 relative z-10 px-4 mt-2 font-bold tracking-tight">
                  {quote.split('\n')[0]}
                </p>
                <span className="text-4xl text-[#d4a373] opacity-30 absolute bottom-6 right-0 font-serif">"</span>
                <p className="text-right text-[#8b5a2b] font-medium tracking-widest text-sm uppercase">
                  {quote.split('\n').length > 1 ? quote.split('\n')[1] : ""}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 px-2">
              <button
                onClick={handleDownloadImage}
                className="text-sm font-bold bg-white text-[#8b5a2b] px-5 py-2.5 rounded-full hover:bg-[#faedcd] transition-all border-2 border-[#d4a373]/30 shadow-sm hover:shadow-md"
              >
                이미지 저장하기
              </button>
              <a
                href="https://buymeacoffee.com/lemon1106"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-bold bg-[#ee9b00] text-white px-5 py-2.5 rounded-full shadow-md shadow-[#ee9b00]/30 hover:shadow-[#ee9b00]/50 transition-all hover:-translate-y-0.5"
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
