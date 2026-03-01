async function testTranslate(text) {
    try {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ja&tl=ko&dt=t&q=${encodeURIComponent(text)}`;
        const response = await fetch(url);
        const data = await response.json();
        const translatedText = data[0].map(item => item[0]).join('');
        console.log("Original:", text);
        console.log("Translated:", translatedText);
    } catch (e) {
        console.error("Translation error:", e);
    }
}

testTranslate("人の発言を深読みしてしまいがち。あれこれ疑ってもキリがありません。フラットな心で詮索しない付き合いを。");
