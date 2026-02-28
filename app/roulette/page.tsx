"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const GENRES = [
    "액션(Action)",
    "스릴러(Thriller)",
    "판타지(Fantasy)",
    "범죄(Crime)",
    "애니(Animation)",
    "로맨스(Romance)",
    "코미디(Comedy)"
];

const COLORS = [
    "#d4a373", // Beige/Wood Base
    "#e3b587",
    "#f1c79a",
    "#c18f5e",
    "#cfa77a",
    "#e7c297",
    "#b07d4f"
];

export default function Roulette() {
    const [isSpinning, setIsSpinning] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    const [rotation, setRotation] = useState(0);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const router = useRouter();

    // Draw the Roulette Wheel
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) - 10;
        const numSegments = GENRES.length;
        const segmentAngle = (2 * Math.PI) / numSegments;

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < numSegments; i++) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, i * segmentAngle, (i + 1) * segmentAngle);
            ctx.closePath();

            // Fill alternating colors for the fortune cookie vibe
            ctx.fillStyle = COLORS[i % COLORS.length];
            ctx.fill();

            // Draw border
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#8b5a2b";
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            // Rotate to center of segment and adjust reading angle
            ctx.rotate(i * segmentAngle + segmentAngle / 2);
            ctx.textAlign = "right";
            ctx.fillStyle = "#4a3627";
            ctx.font = "bold 16px 'Geist', 'Geist Sans', sans-serif";
            // Only keep the Korean text to fit better
            const textArray = GENRES[i].split("(");
            const text = textArray[0];

            ctx.fillText(text, radius - 20, 5);
            ctx.restore();
        }
    }, []);

    const spinWheel = () => {
        if (isSpinning) return;

        setIsSpinning(true);
        setResult(null);

        // Random spin between 5 to 10 full rotations + extra random angle
        const extraSpins = Math.floor(Math.random() * 5) + 5;
        const extraDegrees = Math.floor(Math.random() * 360);
        const totalRotationDegrees = extraSpins * 360 + extraDegrees;

        // Add to current rotation so it spins smoothly from its current position
        const newRotation = rotation + totalRotationDegrees;
        setRotation(newRotation);

        // Calculate winning segment
        setTimeout(() => {
            // The pointer is at the top (270 degrees or -90 degrees in canvas coords, but normally 270 in standard circle representation)
            // Visual rotation works backwards relative to canvas drawing.
            // Easiest reliable way: calculate the finalized angle normalized
            const normalizedRotation = newRotation % 360;

            // 0 degrees is the right side. Our pointer is at the right (0 degrees) for simpler math, let's say.
            // Wait, let's put pointer at the top (270deg).
            // Let's just calculate which slice is at 270 degrees.

            // Let's put the pointer at 0 degrees (Right side) to make math trivial since arc starts at 0.
            const sliceAngle = 360 / GENRES.length;

            // Which slice index is at the pointer?
            // Since wheel rotates clockwise, the slice that hits the right pointer moves backward relative to 0.
            const offsetRotation = 360 - normalizedRotation;
            const index = Math.floor(offsetRotation / sliceAngle) % GENRES.length;

            setResult(GENRES[index]);
            setIsSpinning(false);
        }, 4000); // Wait for CSS transition (4s) to finish
    };

    const handleUseGenre = () => {
        if (result) {
            // Navigate to home and we could pass standard local storage or query param
            // For simplicity, just route home with a query param that page.tsx could read
            router.push(`/?genre=${encodeURIComponent(result)}`);
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
                <div className="w-full flex justify-start mb-6">
                    <Link href="/" className="text-[#8b5a2b] font-bold hover:text-[#d4a373] transition-colors flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        홈으로 돌아가기
                    </Link>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#8b5a2b] to-[#c17f45] drop-shadow-sm">
                        포춘쿠키 룰렛
                    </h1>
                    <p className="text-[#6b4e31] text-sm sm:text-lg break-keep font-medium">
                        오늘 나의 운명적인 영화 장르는? 빙글빙글 룰렛을 돌려보세요!
                    </p>
                </div>

                {/* Roulette Layout */}
                <div className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center">
                    {/* Pointer (Right Side) */}
                    <div className="absolute right-[-15px] sm:right-[-20px] top-1/2 -translate-y-1/2 z-20 w-0 h-0 
              border-t-[15px] border-t-transparent 
              border-b-[15px] border-b-transparent 
              border-r-[25px] border-r-[#8b5a2b] drop-shadow-md">
                    </div>

                    {/* The Wheel */}
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={400}
                        className="w-full h-full rounded-full border-4 border-[#8b5a2b] shadow-xl shadow-[#d4a373]/30 transition-transform"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transitionDuration: isSpinning ? "4s" : "0s",
                            transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)" // easeOutQuart-like smooth deceleration
                        }}
                    />

                    {/* Center Button */}
                    <button
                        onClick={spinWheel}
                        disabled={isSpinning}
                        className="absolute z-10 w-20 h-20 sm:w-24 sm:h-24 bg-[#fffefc] rounded-full shadow-lg border-4 border-[#8b5a2b] text-[#8b5a2b] font-black text-lg sm:text-xl transition-transform hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer disabled:opacity-80 disabled:hover:scale-100"
                    >
                        START
                    </button>
                </div>

                {/* Result Area */}
                <div className="mt-12 h-24 flex flex-col items-center justify-center">
                    {result ? (
                        <div className="animate-fade-in-up text-center w-full">
                            <p className="text-[#5c4033] font-medium mb-3">축하합니다! 오늘의 추천 장르는...</p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <span className="text-3xl font-extrabold text-[#8b5a2b] bg-[#faedcd] px-6 py-2 rounded-xl border-2 border-[#d4a373]">
                                    {result}
                                </span>
                                <button
                                    onClick={handleUseGenre}
                                    className="bg-[#ee9b00] text-white px-6 py-3 rounded-xl font-bold hover:-translate-y-1 hover:shadow-lg shadow-md transition-all sm:ml-4"
                                >
                                    이 장르로 명대사 뽑기 ✨
                                </button>
                            </div>
                        </div>
                    ) : isSpinning ? (
                        <p className="text-[#8b5a2b] font-bold text-xl animate-pulse">
                            운명의 포춘쿠키가 돌아가는 중... 🍪
                        </p>
                    ) : (
                        <p className="text-[#a68a6d] font-medium text-sm">
                            가운데 START 버튼을 눌러주세요
                        </p>
                    )}
                </div>

            </div>
        </main>
    );
}
