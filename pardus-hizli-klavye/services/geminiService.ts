
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TestConfig, TestResult } from '../types';

function getWordCount(length: TestConfig['length'], customLength: number): number {
    switch (length) {
        case 'short':
            return 30;
        case 'medium':
            return 60;
        case 'long':
            return 120;
        case 'custom':
            return customLength;
        default:
            return 60;
    }
}

export const generateTypingText = async (ai: GoogleGenAI, config: TestConfig): Promise<string> => {
    const wordCount = getWordCount(config.length, config.customLength);
    const prompt = `Aşağıdaki konu hakkında ${config.language} dilinde yaklaşık ${wordCount} kelimelik bir paragraf oluştur: "${config.topic}". Metin bir yazma testi için uygun olmalıdır. Markdown, listeler veya standart noktalama işaretleri dışındaki özel karakterler gibi karmaşık biçimlendirmeler içermemelidir. Sadece düz metin sağlayın. Metin içerisinde tırnak işareti kullanma.`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });
        return response.text.replace(/\s+/g, ' ').trim();
    } catch (error) {
        console.error("Gemini API hatası (generateTypingText):", error);
        throw new Error("Gemini API kullanılarak metin oluşturulamadı.");
    }
};

export const getTypingTips = async (ai: GoogleGenAI, result: TestResult): Promise<string> => {
    const errorEntries = Object.entries(result.errors)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([char, count]) => `'${char}' (${count} kez)`)
        .join(', ');

    const prompt = `
        Yazma hızımı geliştirmeye çalışan bir kullanıcıyım. İşte son yazma testimin sonuçları:
        - Dakikadaki Kelime Sayısı (DKS): ${result.wpm}
        - Doğruluk: ${result.accuracy}%
        - En sık yapılan hatalar (karakter ve sayısı): ${errorEntries || 'Yok'}
        - Konu şuydu: "${result.config.topic}"

        Bu verilere dayanarak, yazma hızımı ve doğruluğumu artırmak için bana 3-4 tane kısa, uygulanabilir ve teşvik edici ipucu ver. İpuçları markdown liste formatında olmalı. Bana doğrudan "sen" diye hitap et. İpuçları için dil ${result.config.language} olmalı.
    `;
    
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-04-17",
            contents: prompt,
        });
        return response.text;
    } catch (error)
    {
        console.error("Gemini API hatası (getTypingTips):", error);
        throw new Error("Gemini API kullanılarak yazma ipuçları alınamadı.");
    }
};