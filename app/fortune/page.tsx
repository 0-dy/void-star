"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const ZODIAC_TIMES = [
    { label: "모름", value: "unknown" },
    { label: "子(자) 23:30 ~ 01:29", value: "ja" },
    { label: "丑(축) 01:30 ~ 03:29", value: "chuk" },
    { label: "寅(인) 03:30 ~ 05:29", value: "in" },
    { label: "卯(묘) 05:30 ~ 07:29", value: "myo" },
    { label: "辰(진) 07:30 ~ 09:29", value: "jin" },
    { label: "巳(사) 09:30 ~ 11:29", value: "sa" },
    { label: "午(오) 11:30 ~ 13:29", value: "o" },
    { label: "未(미) 13:30 ~ 15:29", value: "mi" },
    { label: "申(신) 15:30 ~ 17:29", value: "shin" },
    { label: "酉(유) 17:30 ~ 19:29", value: "yu" },
    { label: "戌(술) 19:30 ~ 21:29", value: "sul" },
    { label: "亥(해) 21:30 ~ 23:29", value: "hae" }
];

export default function FortunePage() {
    const [name, setName] = useState("");
    const [gender, setGender] = useState<"male" | "female">("male");
    const [calendarType, setCalendarType] = useState<"solar" | "lunar">("solar");
    const [birthYear, setBirthYear] = useState("");
    const [birthMonth, setBirthMonth] = useState("");
    const [birthDay, setBirthDay] = useState("");
    const [birthTime, setBirthTime] = useState("unknown");

    const [isGenerating, setIsGenerating] = useState(false);
    const [fortuneResult, setFortuneResult] = useState<any>(null);
    const resultCardRef = useRef<HTMLDivElement>(null);

    const handleDownloadImage = async () => {
        if (!resultCardRef.current) return;

        try {
            const { toPng } = await import("html-to-image");
            const dataUrl = await toPng(resultCardRef.current, {
                backgroundColor: "#fffefc", // The color of the card
                pixelRatio: 2,
            });

            const link = document.createElement("a");
            link.download = `my-fortune-${Date.now()}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error("Error generating image:", error);
            alert("이미지 저장에 실패했습니다.");
        }
    };

    const handleShareImage = async () => {
        if (!resultCardRef.current) return;

        try {
            const { toBlob } = await import("html-to-image");
            const blob = await toBlob(resultCardRef.current, {
                backgroundColor: "#fffefc",
                pixelRatio: 2,
            });

            if (!blob) throw new Error("Failed to generate image blob");

            const isKakao = /KAKAOTALK/i.test(navigator.userAgent);
            const isOtherIab = /Instagram|FBAV|Line/i.test(navigator.userAgent);
            const isIab = isKakao || isOtherIab;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

            const shareText = `[나의 운세와 명대사]\n"${fortuneResult?.quoteText}"\n${fortuneResult?.quoteMovie}\n👉 https://xn--hz2b60w.site/fortune`;

            if (isMobile && !isIab && navigator.canShare) {
                const file = new File([blob], `my-fortune-${Date.now()}.png`, { type: "image/png" });
                if (navigator.canShare({ files: [file] })) {
                    try {
                        await navigator.share({
                            files: [file],
                            title: "오늘 나의 운세와 명대사",
                            text: shareText,
                        });
                        return;
                    } catch (shareError: any) {
                        if (shareError.name !== 'AbortError') console.error("Native file share failed", shareError);
                        else return;
                    }
                }
            }

            if (isKakao && navigator.share) {
                try {
                    await navigator.share({
                        title: "오늘 나의 운세와 명대사",
                        text: shareText,
                        url: window.location.href,
                    });
                    return;
                } catch (shareError: any) {
                    if (shareError.name !== 'AbortError') console.error("Kakao native text share failed", shareError);
                    else return;
                }
            }

            if (navigator.clipboard) {
                if (window.ClipboardItem) {
                    try {
                        const item = new ClipboardItem({ "image/png": blob });
                        await navigator.clipboard.write([item]);
                        alert("운세 결과 이미지가 클립보드에 복사되었습니다!\n원하는 곳에 붙여넣기 하여 공유해보세요. 📸");
                    } catch (clipboardError) {
                        console.error("Clipboard image copy failed, trying text", clipboardError);
                        try {
                            await navigator.clipboard.writeText(shareText);
                            alert("이미지 복사에 실패하여 텍스트가 대신 복사되었습니다! 📝");
                        } catch (e) {
                            alert("이 환경에서는 공유하기가 지원되지 않습니다. 화면을 캡처해 주세요. 😢");
                        }
                    }
                } else {
                    try {
                        await navigator.clipboard.writeText(shareText);
                        alert("이미지 복사가 지원되지 않아 텍스트가 대신 복사되었습니다! 📝");
                    } catch (e) {
                        alert("이 환경에서는 공유하기가 지원되지 않습니다. 화면을 캡처해 주세요. 😢");
                    }
                }
            } else {
                alert("이 환경에서는 공유하기가 지원되지 않습니다. 화면을 캡처해 주세요. 😢");
            }
        } catch (error) {
            console.error("Error generating image for share:", error);
            alert("이미지 처리 중 오류가 발생했습니다.");
        }
    };

    useEffect(() => {
        // Load saved demographics
        const saved = localStorage.getItem('fortune_demographics');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.name) setName(parsed.name);
                if (parsed.gender) setGender(parsed.gender);
                if (parsed.calendarType) setCalendarType(parsed.calendarType);
                if (parsed.birthYear) setBirthYear(parsed.birthYear);
                if (parsed.birthMonth) setBirthMonth(parsed.birthMonth);
                if (parsed.birthDay) setBirthDay(parsed.birthDay);
                if (parsed.birthTime) setBirthTime(parsed.birthTime);
            } catch (e) {
                console.error("Failed to load saved demographics");
            }
        }
    }, []);

    const handleGenerate = async () => {
        if (!name.trim()) return alert("이름을 입력해주세요!");
        if (!birthYear || !birthMonth || !birthDay) return alert("생년월일을 모두 입력해주세요!");

        const yearNum = parseInt(birthYear);
        const monthNum = parseInt(birthMonth);
        const dayNum = parseInt(birthDay);

        // Date validation logic
        if (yearNum < 1900 || yearNum > new Date().getFullYear()) {
            return alert("올바른 태어난 연도(4자리)를 입력해주세요.");
        }
        if (monthNum < 1 || monthNum > 12) {
            return alert("올바른 태어난 월(1~12)을 입력해주세요.");
        }

        // Days in month logic
        const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
        if (dayNum < 1 || dayNum > daysInMonth) {
            return alert(`${monthNum}월의 올바른 태어난 일(1~${daysInMonth})을 입력해주세요.`);
        }

        // Save for next time
        localStorage.setItem('fortune_demographics', JSON.stringify({
            name, gender, calendarType, birthYear, birthMonth, birthDay, birthTime
        }));

        setIsGenerating(true);
        setFortuneResult(null);

        try {
            const response = await fetch('/api/generate-fortune', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name, gender, calendarType, birthYear, birthMonth, birthDay, birthTime
                })
            });

            const data = await response.json();

            if (response.ok) {
                setFortuneResult(data);
            } else {
                alert("운세 생성에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("Error fetching fortune:", error);
            alert("운세 서버와 연결할 수 없습니다.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <main className="min-h-screen w-full relative overflow-y-auto pb-20 p-4 bg-[#fdf8f0]">
            {/* Background Ornaments */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2"></div>

            <div className="max-w-2xl mx-auto pt-6 sm:pt-10 flex flex-col items-center">
                {/* Header */}
                <div className="w-full flex items-center justify-between mb-8 z-10 px-2 sm:px-0">
                    <Link href="/" className="text-[#8b5a2b] hover:text-[#4a3627] font-bold flex items-center gap-2 group transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        메인으로
                    </Link>
                    <div className="bg-[#fffefc] px-4 py-1.5 rounded-full border border-[#e6d5c3] shadow-sm">
                        <span className="text-sm font-bold text-[#8b5a2b] tracking-widest flex items-center gap-1.5">
                            <span className="shrink-0 text-base">🔮</span> 오늘의 운세
                        </span>
                    </div>
                    <div className="w-[84px]"></div>
                </div>

                {/* Title */}
                <div className="text-center mb-8 z-10">
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 text-[#4a3627]">
                        오늘 나의 운세와 명대사
                    </h1>
                    <p className="text-[#6b4e31] font-medium text-sm sm:text-base">
                        사주 정보를 입력하고 나만의 맞춤 위로를 받아보세요.
                    </p>
                </div>

                {/* Content Section (Swap based on result) */}
                {!fortuneResult ? (
                    <div className="glass-panel w-full rounded-3xl p-6 sm:p-10 mb-8 z-10 border border-[#d4a373]/30 shadow-xl shadow-[#d4a373]/10 animate-fade-in-up">
                        <div className="space-y-6">

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-[#5c4033] mb-2 ml-1">이름 (또는 닉네임)</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="예: 지호"
                                    className="w-full bg-white/70 border border-[#d4a373]/50 rounded-2xl px-4 py-3 sm:py-3.5 text-[#4a3627] placeholder-[#a68a6d] focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition-all shadow-sm"
                                />
                            </div>

                            {/* Demographics Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-[#5c4033] mb-2 ml-1">성별</label>
                                    <div className="flex bg-white/50 p-1 rounded-2xl border border-[#d4a373]/30">
                                        <button
                                            onClick={() => setGender('male')}
                                            className={`flex-1 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all ${gender === 'male' ? 'bg-[#8b5a2b] text-white shadow-md' : 'text-[#8b5a2b] hover:bg-white/50'}`}
                                        >
                                            남성
                                        </button>
                                        <button
                                            onClick={() => setGender('female')}
                                            className={`flex-1 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all ${gender === 'female' ? 'bg-[#8b5a2b] text-white shadow-md' : 'text-[#8b5a2b] hover:bg-white/50'}`}
                                        >
                                            여성
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-[#5c4033] mb-2 ml-1">양력 / 음력</label>
                                    <div className="flex bg-white/50 p-1 rounded-2xl border border-[#d4a373]/30">
                                        <button
                                            onClick={() => setCalendarType('solar')}
                                            className={`flex-1 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all ${calendarType === 'solar' ? 'bg-[#8b5a2b] text-white shadow-md' : 'text-[#8b5a2b] hover:bg-white/50'}`}
                                        >
                                            양력
                                        </button>
                                        <button
                                            onClick={() => setCalendarType('lunar')}
                                            className={`flex-1 py-2 sm:py-2.5 rounded-xl text-sm font-bold transition-all ${calendarType === 'lunar' ? 'bg-[#8b5a2b] text-white shadow-md' : 'text-[#8b5a2b] hover:bg-white/50'}`}
                                        >
                                            음력
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-bold text-[#5c4033] mb-2 ml-1">생년월일</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={birthYear}
                                            onChange={(e) => setBirthYear(e.target.value.slice(0, 4))} /* Limit to 4 digits visually */
                                            placeholder="YYYY"
                                            className="w-full bg-white/70 border border-[#d4a373]/50 rounded-2xl pl-4 pr-8 py-3 sm:py-3.5 text-[#4a3627] text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition-all shadow-sm"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b5a2b] text-sm font-bold">년</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={birthMonth}
                                            onChange={(e) => setBirthMonth(e.target.value.slice(0, 2))}
                                            placeholder="MM"
                                            className="w-full bg-white/70 border border-[#d4a373]/50 rounded-2xl pl-4 pr-8 py-3 sm:py-3.5 text-[#4a3627] text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition-all shadow-sm"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b5a2b] text-sm font-bold">월</span>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={birthDay}
                                            onChange={(e) => setBirthDay(e.target.value.slice(0, 2))}
                                            placeholder="DD"
                                            className="w-full bg-white/70 border border-[#d4a373]/50 rounded-2xl pl-4 pr-8 py-3 sm:py-3.5 text-[#4a3627] text-center font-medium focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition-all shadow-sm"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8b5a2b] text-sm font-bold">일</span>
                                    </div>
                                </div>
                            </div>

                            {/* Time of Birth */}
                            <div>
                                <label className="block text-sm font-bold text-[#5c4033] mb-2 ml-1">태어난 시간 (선택사항)</label>
                                <div className="relative">
                                    <select
                                        value={birthTime}
                                        onChange={(e) => setBirthTime(e.target.value)}
                                        className="w-full bg-white/70 border border-[#d4a373]/50 rounded-2xl pl-4 pr-10 py-3 sm:py-3.5 text-[#4a3627] appearance-none focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition-all shadow-sm font-medium"
                                    >
                                        {ZODIAC_TIMES.map(t => (
                                            <option key={t.value} value={t.value}>{t.label}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b5a2b]">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating || !name.trim() || !birthYear || !birthMonth || !birthDay}
                            className="w-full py-4 mt-8 bg-gradient-to-r from-[#8b5a2b] to-[#b07d4f] text-[#fdf8f0] rounded-2xl font-black text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#8b5a2b]/30 hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                        >
                            {isGenerating ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    별자리 분석 중...
                                </>
                            ) : (
                                "내 사주로 운세 뽑기 🥠"
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="w-full animate-fade-in-up">
                        <div ref={resultCardRef} className="relative overflow-hidden rounded-3xl bg-[#fffefc] border-2 border-[#e6d5c3] shadow-xl shadow-[#d4a373]/10">
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'20\\' height=\\'20\\' viewBox=\\'0 0 20 20\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'%23000000\\' fill-opacity=\\'1\\' fill-rule=\\'evenodd\\'%3E%3Ccircle cx=\\'3\\' cy=\\'3\\' r=\\'3\\'/%3E%3Ccircle cx=\\'13\\' cy=\\'13\\' r=\\'3\\'/%3E%3C/g%3E%3C/svg%3E')" }}></div>

                            <div className="p-8 sm:p-12 relative z-10">
                                <div className="text-center mb-6">
                                    <span className="inline-block bg-[#fdf8f0] text-[#8b5a2b] font-bold px-4 py-1.5 rounded-full text-sm border border-[#e6d5c3] mb-4 shadow-sm">
                                        ✨ {name} 님의 오늘
                                    </span>
                                    <h3 className="text-2xl font-black text-[#4a3627] mb-4 leading-tight">
                                        {fortuneResult.title.includes('(') ? (
                                            <>
                                                {fortuneResult.title.split('(')[0].trim()}
                                                <span className="block text-lg font-bold text-[#8b5a2b] mt-2">
                                                    ({fortuneResult.title.split('(')[1]}
                                                </span>
                                            </>
                                        ) : (
                                            fortuneResult.title
                                        )}
                                    </h3>
                                    <p className="text-[#6b4e31] leading-relaxed break-keep font-medium whitespace-pre-wrap">
                                        {fortuneResult.fortune}
                                    </p>

                                    {fortuneResult.ohaasa && (
                                        <div className="mt-10 mb-2">
                                            <div className="flex items-center justify-center gap-3 mb-5">
                                                <div className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-[#d4a373]/60"></div>
                                                <span className="text-xs sm:text-sm font-bold text-[#b5835a] tracking-wider flex items-center gap-1.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                    [오하아사 톡] {fortuneResult.zodiac}의 오늘
                                                </span>
                                                <div className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-[#d4a373]/60"></div>
                                            </div>
                                            <div className="bg-[#fffdfa] border border-[#e6d5c3]/70 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
                                                <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#fdf8f0] rounded-full opacity-60"></div>
                                                <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#fdf8f0] rounded-full opacity-60"></div>
                                                <p className="text-[#7a5c40] text-sm sm:text-base leading-loose break-keep whitespace-pre-wrap font-medium relative z-10 text-center">
                                                    {fortuneResult.ohaasa}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full h-px bg-gradient-to-r from-transparent via-[#d4a373]/50 to-transparent my-8"></div>

                                <div className="text-center break-keep">
                                    <p className="text-xl sm:text-2xl font-serif text-[#4a3627] leading-relaxed mb-6 font-bold tracking-tight">
                                        "{fortuneResult.quoteText}"
                                    </p>
                                    <p className="text-[#8b5a2b] font-medium tracking-widest text-xs sm:text-sm uppercase">
                                        - {fortuneResult.quoteMovie}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#faedcd] border-t border-[#e6d5c3] p-4 sm:p-6 flex flex-col sm:flex-row justify-center items-center gap-3 relative z-10" data-html2canvas-ignore="true">
                                <button
                                    onClick={() => setFortuneResult(null)}
                                    className="w-full sm:w-auto font-bold bg-white text-[#8b5a2b] px-6 py-3 rounded-xl border border-[#d4a373]/30 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                                >
                                    다시 뽑기
                                </button>
                                <button
                                    onClick={handleDownloadImage}
                                    className="w-full sm:w-auto font-bold flex items-center justify-center gap-2 bg-[#d4a373] text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:bg-[#c99a6c] transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    저장하기
                                </button>
                                <button
                                    onClick={handleShareImage}
                                    className="w-full sm:w-auto font-bold flex items-center justify-center gap-2 bg-[#8b5a2b] text-white px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:bg-[#7a4f26] transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                                    </svg>
                                    공유하기
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
