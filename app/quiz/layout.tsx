import { Metadata } from "next";

export const metadata: Metadata = {
    title: "영화 명대사 O/X 팩트체크 퀴즈 | 명대사 포춘쿠키",
    description: "당신의 영화 지식을 테스트해보세요! 유명한 명대사들이 진짜 그 영화에 나왔을까요? 10연승에 도전해 보세요.",
    openGraph: {
        title: "영화 명대사 O/X 팩트체크 퀴즈",
        description: "오늘 내 기분에 딱 맞는 영화 명대사는? 영화 명대사 퀴즈도 함께 즐겨보세요!",
        url: "https://xn--hz2b60w.site/quiz",
    },
};

export default function QuizLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
