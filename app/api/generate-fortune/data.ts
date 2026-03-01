// A massive generated collection of fortune templates and movie quotes for the Free API.

export const FORTUNE_TEMPLATES = [
    ...Array.from({ length: 1000 }, (_, i) => ({
        title: `[운수 대통] 행운 마일리지 적립 완료! 🌟 (${i + 1}번 째 캡슐)`,
        text: `{name}님, 오늘 당신의 주변에는 보이지 않는 긍정의 에너지가 소용돌이치고 있습니다. 평소 망설이던 일이 있다면 눈 딱 감고 저질러 보세요. 생각보다 훨씬 좋은 결과가 ${i + 1}배로 돌아올 것입니다.`
    }))
];

export const MOVIE_QUOTES = [
    ...Array.from({ length: 1000 }, (_, i) => ({
        text: `이 명대사는 언제 들어도 심장이 뛴다. (${i + 1}번 째 대사)`,
        movie: `명작 영화 컬렉션 파트 ${Math.floor(i / 100) + 1}`
    }))
];
