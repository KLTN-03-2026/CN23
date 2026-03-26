'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Loader2 } from 'lucide-react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

const bookTableDeclaration: FunctionDeclaration = {
  name: "bookTable",
  description: "Đặt bàn bida cho khách hàng. Cần thu thập tên, số điện thoại, thời gian và loại bàn (Bàn Thường, Bàn VIP, Phòng Super VIP).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerName: { type: Type.STRING, description: "Tên khách hàng" },
      phone: { type: Type.STRING, description: "Số điện thoại liên hệ" },
      time: { type: Type.STRING, description: "Thời gian đặt bàn (VD: 19:30 ngày 04/03)" },
      tableType: { type: Type.STRING, description: "Loại bàn (Bàn Thường, Bàn VIP, Phòng Super VIP)" },
    },
    required: ["customerName", "phone", "time", "tableType"],
  },
};

const orderItemDeclaration: FunctionDeclaration = {
  name: "orderItem",
  description: "Gọi món (đồ ăn, thức uống) cho khách hàng đang chơi tại bàn. Cần thu thập tên bàn, tên món và số lượng.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      tableName: { type: Type.STRING, description: "Tên bàn (VD: Bàn 10, Bàn VIP 1)" },
      itemName: { type: Type.STRING, description: "Tên món ăn hoặc thức uống (VD: cà phê sữa đá, bò húc, mì xào)" },
      quantity: { type: Type.NUMBER, description: "Số lượng món" },
    },
    required: ["tableName", "itemName", "quantity"],
  },
};

const systemInstruction = `Bạn là trợ lý ảo AI của Luxe Bida - Câu lạc bộ Billiards sang trọng bậc nhất.
Nhiệm vụ của bạn là tư vấn cho khách hàng về bảng giá, dịch vụ, hỗ trợ đặt bàn và gọi món.
Bảng giá:
- Bàn Thường: 80.000đ/giờ (Bàn Pool tiêu chuẩn, cơ cá nhân cơ bản, phục vụ nước suối miễn phí)
- Bàn VIP: 120.000đ/giờ (Bàn thi đấu quốc tế, khu vực riêng tư sofa lounge, cơ carbon cao cấp, nhân viên phục vụ riêng)
- Phòng Super VIP: 200.000đ/giờ (Phòng lạnh riêng biệt, hệ thống âm thanh TV riêng, tủ rượu vang & cigar, trợ lý AI phân tích trận đấu)

Thực đơn F&B cơ bản:
- Cà phê sữa đá: 35.000đ
- Bia Heineken: 40.000đ
- Mì xào bò: 55.000đ
- Nước suối: 15.000đ
- Bò húc (Redbull): 25.000đ
- Trà đào cam sả: 45.000đ

Khi khách hàng muốn đặt bàn, hãy hỏi đầy đủ thông tin: Tên, Số điện thoại, Thời gian, Loại bàn. Sau đó gọi hàm bookTable.
Khi khách hàng muốn gọi món (ví dụ: "cho tôi cà phê sữa đá bàn 10"), hãy xác định tên bàn, tên món và số lượng, sau đó gọi hàm orderItem.
Luôn trả lời lịch sự, chuyên nghiệp và ngắn gọn.`;

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string, parts?: any[] }[]>([
    { role: 'model', text: 'Xin chào! Tôi là trợ lý ảo của Luxe Bida. Tôi có thể giúp gì cho bạn hôm nay?', parts: [{ text: 'Xin chào! Tôi là trợ lý ảo của Luxe Bida. Tôi có thể giúp gì cho bạn hôm nay?' }] }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMessage = { role: 'user' as const, text, parts: [{ text }] };
    let currentMessages = [...messages, userMessage];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ 
        apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY
      });
      
      const cleanParts = (parts?: any[]) => {
        if (!parts) return undefined;
        return parts.map(p => {
          const cleanPart: any = {};
          if (p.text) cleanPart.text = p.text;
          if (p.functionCall) cleanPart.functionCall = { name: p.functionCall.name, args: p.functionCall.args };
          if (p.functionResponse) cleanPart.functionResponse = { name: p.functionResponse.name, response: p.functionResponse.response };
          return cleanPart;
        });
      };

      const apiMessages = currentMessages
        .filter((msg, index) => !(index === 0 && msg.role === 'model'))
        .map(msg => ({
        role: msg.role,
        parts: cleanParts(msg.parts) || [{ text: msg.text }]
      }));

      let response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: apiMessages,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [bookTableDeclaration, orderItemDeclaration] }],
        },
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];
        if (call.name === "bookTable") {
          const args = call.args as any;
          
          // Call our backend API to save the reservation
          const res = await fetch('/api/reservations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
          });
          
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            setMessages([...currentMessages, { role: 'model', text: `Xin lỗi, có lỗi xảy ra khi đặt bàn: ${errorData.error || 'Vui lòng thử lại sau.'}` }]);
            setIsLoading(false);
            return;
          }
          
          const reservationData = await res.json();

          // Instead of passing complex function objects back to the model,
          // we just append a simple text message indicating success.
          const successMessage = `Đã đặt bàn thành công! Mã đặt bàn của bạn là: ${reservationData.reservation?._id || '123'}. Bạn có cần hỗ trợ gì thêm không?`;
          
          setMessages([...currentMessages, { role: 'model', text: successMessage }]);
          setIsLoading(false);
          return;
        } else if (call.name === "orderItem") {
          const args = call.args as any;
          
          // Call our backend API to order item
          const res = await fetch('/api/pos/order-from-bot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(args),
          });
          
          const data = await res.json();
          
          if (!res.ok) {
            setMessages([...currentMessages, { role: 'model', text: `Xin lỗi, không thể gọi món: ${data.error || 'Vui lòng thử lại sau.'}` }]);
            setIsLoading(false);
            return;
          }
          
          const successMessage = `Dạ vâng, Luxe Bida đã ghi nhận yêu cầu của quý khách tại ${data.order.tableName}: **${data.order.quantity} ${data.order.itemName}** (${data.order.price.toLocaleString('vi-VN')}đ). Nhân viên sẽ mang đến ngay cho quý khách. Chúc quý khách có những đường cơ thật chuẩn xác!`;
          
          setMessages([...currentMessages, { role: 'model', text: successMessage }]);
          setIsLoading(false);
          return;
        }
      }

      if (response.text) {
        const modelParts = response.candidates?.[0]?.content?.parts || [{ text: response.text }];
        setMessages([...currentMessages, { role: 'model', text: response.text, parts: modelParts }]);
      } else {
        setMessages([...currentMessages, { role: 'model', text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.', parts: [{ text: 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.' }] }]);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: `Lỗi: ${error.message || 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.'}`, parts: [{ text: `Lỗi: ${error.message || 'Xin lỗi, tôi đang gặp sự cố kết nối. Vui lòng thử lại sau.'}` }] }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl border border-emerald-500/30 bg-zinc-950/95 shadow-[0_0_30px_rgba(52,211,153,0.15)] backdrop-blur-xl sm:w-[400px]">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-emerald-500/20 bg-zinc-900/50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500 bg-zinc-800 shadow-[0_0_10px_rgba(52,211,153,0.3)]">
                <Bot className="h-6 w-6 text-emerald-400" />
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-zinc-950 bg-emerald-500"></span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-100">Trợ lý ảo AI</h3>
                <p className="text-xs text-emerald-400">Trực tuyến</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.filter(msg => msg.text).map((msg, index) => (
              <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'model' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-emerald-500/50">
                    <Bot className="h-5 w-5 text-emerald-400" />
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2 text-sm ${
                  msg.role === 'user' 
                    ? 'bg-emerald-500 text-zinc-950 rounded-tr-sm' 
                    : 'bg-zinc-800 text-zinc-200 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-emerald-500/50">
                  <Bot className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-zinc-800 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '0.2s' }}></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 overflow-x-auto border-t border-emerald-500/20 bg-zinc-900/50 px-4 py-2 scrollbar-hide">
            <button 
              onClick={() => handleSend('Tôi muốn đặt bàn')}
              disabled={isLoading}
              className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
            >
              🎯 Đặt bàn
            </button>
            <button 
              onClick={() => handleSend('Xem bảng giá')}
              disabled={isLoading}
              className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
            >
              💰 Bảng giá
            </button>
            <button 
              onClick={() => handleSend('Xem menu đồ uống')}
              disabled={isLoading}
              className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
            >
              🍹 Xem menu
            </button>
            <button 
              onClick={() => handleSend('Địa chỉ quán ở đâu?')}
              disabled={isLoading}
              className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
            >
              📍 Địa chỉ
            </button>
          </div>

          {/* Input */}
          <div className="bg-zinc-900/50 p-4 pt-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                placeholder="Nhập tin nhắn..."
                className="w-full rounded-full border border-emerald-500/30 bg-zinc-950 py-2 pl-4 pr-12 text-sm text-zinc-200 placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <button 
                onClick={() => handleSend(input)}
                disabled={!input.trim() || isLoading}
                className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-zinc-950 shadow-[0_0_20px_rgba(52,211,153,0.5)] transition-transform hover:scale-110"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
