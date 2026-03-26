import { GoogleGenAI } from '@google/genai';

// Khởi tạo AI với đúng cái Key bạn vừa tạo
const ai = new GoogleGenAI({ apiKey: 'AIzaSyCDyJAJk-umddaMpNNk61ItmEfH-QaP6MU' });

async function test() {
  try {
    console.log("⏳ Đang kết nối với Google Gemini...");
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Xin chào, bạn có nghe rõ không?',
    });
    
    console.log('✅ THÀNH CÔNG! AI trả lời:', response.text);
  } catch (error) {
    console.error('❌ LỖI RỒI:', error.message);
  }
}

test();