"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const GENRES = [
  "랜덤",
  "액션(Action)",
  "스릴러(Thriller)",
  "판타지(Fantasy)",
  "범죄(Crime)",
  "애니(Animation)",
  "로맨스(Romance)",
  "코미디(Comedy)"
];

function HomeContent() {
  const searchParams = useSearchParams();
  const genreFromUrl = searchParams.get("genre");

  const [mood, setMood] = useState("");
  const [selectedGenre, setSelectedGenre] = useState(
    genreFromUrl && GENRES.includes(genreFromUrl) ? genreFromUrl : GENRES[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [quote, setQuote] = useState("");
  const quoteCardRef = useRef<HTMLDivElement>(null);

  // If URL changes, update genre
  useEffect(() => {
    if (genreFromUrl && GENRES.includes(genreFromUrl)) {
      setSelectedGenre(genreFromUrl);
    }
  }, [genreFromUrl]);

  // Handle body scroll locking when modal is open
  useEffect(() => {
    if (quote) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [quote]);

  const handleGenerate = async () => {
    const trimmedMood = mood.trim();
    if (!trimmedMood) {
      alert("오늘의 기분이나 상황을 입력해주세요!");
      return;
    }

    // 단순 반복(ㅋㅋㅋ, ㅎㅎㅎ), 무의미한 자음/모음, 혹은 흔한 키보드 막치기(asdf, ㅁㄴㅇㄹ) 방지
    const gibberishPattern = /^(?:[ㄱ-ㅎㅏ-ㅣ]+|asdf.*|qwer.*|ㅁㄴㅇㄹ.*|(.)\1{2,})$/i;
    if (gibberishPattern.test(trimmedMood.replace(/\s/g, ''))) {
      alert("조금 더 구체적인 기분이나 상황의 단어를 적어주세요!");
      return;
    }

    setIsGenerating(true);
    setQuote("");

    try {
      const response = await fetch("/api/generate-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, genre: selectedGenre === "랜덤" ? "랜덤" : selectedGenre }),
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
      const { toPng } = await import("html-to-image");
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

  const handleShareImage = async () => {
    if (!quoteCardRef.current) return;

    try {
      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(quoteCardRef.current, {
        backgroundColor: "#fdf8f0",
        pixelRatio: 2,
      });

      if (!blob) throw new Error("Failed to generate image blob");

      const file = new File([blob], `my-mood-quote-${Date.now()}.png`, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "명대사 포춘쿠키",
            text: "오늘 내 기분에 딱 맞는 영화 명대사!",
          });
          return;
        } catch (shareError: any) {
          // Ignore AbortError (user cancelled share)
          if (shareError.name !== 'AbortError') {
            console.error("Native share failed, falling back to clipboard", shareError);
          } else {
            return;
          }
        }
      }

      // Fallback: Clipboard copy for Instagram/Kakao in-app browsers
      if (navigator.clipboard && window.ClipboardItem) {
        try {
          // Mobile Safari requires Promise resolution inside the write call
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          alert("이미지가 클립보드에 복사되었습니다! 인스타그램이나 카톡 붙여넣기로 공유해보세요. 📸");
        } catch (clipboardError) {
          console.error("Clipboard copy failed", clipboardError);
          alert("공유 및 복사에 실패했습니다. 옆의 '저장하기' 버튼을 이용해 주세요. 😢");
        }
      } else {
        alert("이 환경에서는 공유하기가 지원되지 않습니다. 옆의 '저장하기' 버튼을 이용해 주세요. 😢");
      }
    } catch (error) {
      console.error("Error generating image for share:", error);
      alert("이미지 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <main className="min-h-screen w-full relative overflow-hidden flex flex-col items-center justify-center p-4 bg-[#fdf8f0]">
      {/* Background Ornaments */}
      <div className="bg-blob blob-1"></div>
      <div className="bg-blob blob-2"></div>

      {/* Main Glass Container */}
      <div className="glass-panel w-full max-w-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-12 flex flex-col items-center z-10 animate-fade-in-up border border-[#d4a373]/30">
        {/* Hero Section */}
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#8b5a2b] to-[#c17f45] animate-float drop-shadow-sm">
            명대사 포춘쿠키
          </h1>
          <p className="text-[#6b4e31] text-sm sm:text-lg break-keep font-medium">
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
              className="w-full h-24 sm:h-32 bg-white/70 border border-[#d4a373]/50 rounded-2xl p-3 sm:p-4 text-sm sm:text-base text-[#4a3627] placeholder-[#a68a6d] focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition-all resize-none shadow-sm"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-[#5c4033] ml-1">
              원하는 장르 / 분위기 선택
            </label>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {GENRES.map((genre) => (
                <div key={genre} className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => setSelectedGenre(genre)}
                    className={`px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 ${selectedGenre === genre
                      ? "bg-gradient-to-r from-[#b57b42] to-[#d4a373] text-white shadow-md shadow-[#d4a373]/40 border border-[#8b5a2b]/20"
                      : "bg-white/60 text-[#8b5a2b] hover:bg-[#faedcd] border border-[#d4a373]/30 shadow-sm"
                      }`}
                  >
                    {genre}
                  </button>
                  {genre === "랜덤" && (
                    <span className="text-[#d4a373] font-bold text-base sm:text-lg select-none">/</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!mood.trim() || isGenerating}
            className="w-full py-3 sm:py-4 mt-4 sm:mt-6 bg-[#4a3627] text-[#fdf8f0] rounded-2xl font-black text-base sm:text-lg transition-all duration-300 hover:bg-[#342419] hover:shadow-xl hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:bg-[#8b7355] flex items-center justify-center gap-2 border-b-4 border-[#2b1e15] active:border-b-0 active:translate-y-1"
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

        {/* Result Component (Modal Popup) */}
        {quote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in-up">
            {/* Dark Overlay */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setQuote("")}
            ></div>

            {/* Modal Content */}
            <div className="relative w-full max-w-2xl bg-[#fdf8f0] rounded-3xl shadow-2xl overflow-hidden flex flex-col">

              {/* Close Button */}
              <button
                onClick={() => setQuote("")}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-white/50 text-[#8b5a2b] hover:bg-[#8b5a2b] hover:text-white rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Quote Card */}
              <div
                ref={quoteCardRef}
                className="relative overflow-hidden bg-[#fffefc] p-8 sm:p-12"
              >
                {/* Subtle paper texture overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>

                <div className="relative z-10 break-keep text-center">
                  <span className="text-3xl sm:text-4xl text-[#d4a373] opacity-30 absolute -top-4 -left-2 font-serif">"</span>
                  <p className="text-xl sm:text-3xl font-serif text-[#4a3627] leading-relaxed mb-6 sm:mb-8 relative z-10 px-2 sm:px-4 mt-2 font-bold tracking-tight">
                    {quote.split('\n')[0]}
                  </p>
                  <span className="text-3xl sm:text-4xl text-[#d4a373] opacity-30 absolute bottom-6 right-0 font-serif">"</span>
                  <p className="text-right text-[#8b5a2b] font-medium tracking-widest text-xs sm:text-sm uppercase mt-2">
                    {quote.split('\n').length > 1 ? quote.split('\n')[1] : ""}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-[#faedcd] border-t border-[#e6d5c3] p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleDownloadImage}
                    className="flex-1 sm:flex-none text-sm font-bold bg-white text-[#8b5a2b] px-4 py-3 rounded-xl hover:bg-[#fffefc] transition-all border border-[#d4a373]/30 shadow-sm hover:shadow-md"
                  >
                    저장하기
                  </button>
                  <button
                    onClick={handleShareImage}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1 text-sm font-bold bg-[#8b5a2b] text-white px-4 py-3 rounded-xl shadow-md shadow-[#8b5a2b]/30 hover:shadow-[#8b5a2b]/50 transition-all hover:-translate-y-0.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                    </svg>
                    공유하기
                  </button>
                </div>
                <a
                  href="https://buymeacoffee.com/lemon1106"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold bg-[#ee9b00] text-white px-5 py-3 rounded-xl shadow-md shadow-[#ee9b00]/30 hover:shadow-[#ee9b00]/50 transition-all hover:-translate-y-0.5"
                >
                  <span>☕</span> 커피 한 잔 후원
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quiz Banner */}
      <div className="w-full max-w-2xl mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
        <Link
          href="/quiz"
          className="group relative overflow-hidden bg-gradient-to-r from-[#8b5a2b] to-[#b07d4f] rounded-2xl p-6 flex items-center justify-between shadow-lg shadow-[#8b5a2b]/20 transition-transform hover:-translate-y-1 hover:shadow-xl"
        >
          {/* Decorative graphic hints */}
          <div className="absolute left-[-10%] bottom-[-50%] opacity-10 group-hover:scale-110 transition-transform duration-700">
            <span className="text-[150px] font-black pointer-events-none">?</span>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full backdrop-blur-sm">
              <span className="text-3xl">🎮</span>
            </div>
            <div className="text-left">
              <h3 className="text-white font-black text-xl mb-1 flex items-center gap-2">
                미니게임 : 영화 명대사 O/X 퀴즈 <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">NEW</span>
              </h3>
              <p className="text-[#fdf8f0]/90 text-sm font-medium">당신의 영화 지식을 테스트해보세요! (10연승 도전)</p>
            </div>
          </div>

          <div className="relative z-10 hidden sm:flex bg-white/20 hover:bg-white/30 transition-colors p-3 rounded-full backdrop-blur-sm shadow-inner group-hover:scale-110 duration-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full flex items-center justify-center bg-[#fdf8f0] text-[#8b5a2b] font-bold">로딩 중...</div>}>
      <HomeContent />
    </Suspense>
  );
}
