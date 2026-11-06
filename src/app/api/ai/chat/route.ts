import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      provider, 
      model = 'gpt-4o-mini', 
      prompt, 
      context = '', 
      apiKey = '', 
      accessToken = '' 
    } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Thiếu nội dung câu hỏi (prompt)' }, { status: 400 });
    }

    const systemInstruction = `Bạn là Trợ lý Học Tập ViTudy chuyên nghiệp, thông minh, ngắn gọn và chính xác. 
Nhiệm vụ của bạn là giải thích kiến thức, tóm tắt, giải bài tập và làm rõ ngữ cảnh từ tài liệu người học cung cấp.
Nếu có ngữ cảnh (Context), hãy ưu tiên bám sát dữ liệu trong ngữ cảnh đó để giải thích.`;

    // 1. CHATGPT PLUS/TEAM CODEX BACKEND ROUTING (codex_cli_rs)
    if (provider === 'oauth_chatgpt') {
      const token = accessToken || apiKey;
      if (!token) {
        return NextResponse.json({ 
          error: 'Chưa có Token đăng nhập ChatGPT OAuth. Vui lòng hoàn tất uỷ quyền trong menu AI.' 
        }, { status: 401 });
      }

      try {
        const codexRes = await fetch('https://chatgpt.com/backend-api/codex/responses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'originator': 'codex_cli_rs',
            'User-Agent': 'codex-cli/0.1.0 (Windows; x86_64)'
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: context ? `NGỮ CẢNH TÀI LIỆU:\n${context}\n\nCÂU HỎI:\n${prompt}` : prompt }
            ]
          })
        });

        if (!codexRes.ok) {
          const errText = await codexRes.text();
          return NextResponse.json({
            error: `ChatGPT Codex Gateway báo lỗi (${codexRes.status}): ${errText.slice(0, 200)}`
          }, { status: codexRes.status });
        }

        const codexData = await codexRes.json();
        const reply = codexData.choices?.[0]?.message?.content || codexData.reply || JSON.stringify(codexData);
        return NextResponse.json({ reply, provider: 'oauth_chatgpt' });
      } catch (err: any) {
        return NextResponse.json({ 
          error: `Không thể kết nối đến ChatGPT Codex Gateway: ${err.message}` 
        }, { status: 502 });
      }
    }

    // 2. BYOK GOOGLE GEMINI
    if (provider === 'byok_gemini') {
      if (!apiKey) {
        return NextResponse.json({ error: 'Chưa nhập Google Gemini API Key' }, { status: 401 });
      }

      const geminiModel = model.includes('gemini') ? model : 'gemini-1.5-flash';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`;

      const geminiRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${context ? `NGỮ CẢNH:\n${context}\n\n` : ''}CÂU HỎI:\n${prompt}` }]
            }
          ]
        })
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        return NextResponse.json({ error: `Gemini API lỗi (${geminiRes.status}): ${errText.slice(0, 200)}` }, { status: geminiRes.status });
      }

      const data = await geminiRes.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có phản hồi từ Gemini.';
      return NextResponse.json({ reply, provider: 'byok_gemini' });
    }

    // 3. BYOK OPENAI HOẶC SYSTEM MANAGED
    const targetKey = provider === 'byok_openai' ? apiKey : process.env.OPENAI_API_KEY;

    if (!targetKey) {
      // Fallback mô phỏng thông minh nếu server chưa gắn OPENAI_API_KEY ở môi trường dev
      const simulatedReply = `[ViTudy AI Assistant - Phản hồi thử nghiệm]
Dựa trên tài liệu bạn cung cấp:
${context ? `"${context.slice(0, 150)}..."` : 'Chủ đề: ' + prompt}

Giải đáp:
1. Trọng tâm cốt lõi: Vấn đề được nêu là một khái niệm cơ bản nhưng rất quan trọng trong chương trình học.
2. Vận dụng: Khi làm bài tập hoặc ôn thi trắc nghiệm, hãy chú ý đến các điều kiện biên và công thức liên quan.
(Để gọi trực tiếp mô hình GPT-4o thật, hãy dán API Key OpenAI cá nhân hoặc uỷ quyền ChatGPT Plus trong menu góc phải).`;

      return NextResponse.json({ 
        reply: simulatedReply, 
        provider: provider || 'system',
        isSimulation: true
      });
    }

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${targetKey}`
      },
      body: JSON.stringify({
        model: model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemInstruction },
          { role: 'user', content: context ? `NGỮ CẢNH:\n${context}\n\nCÂU HỎI:\n${prompt}` : prompt }
        ],
        temperature: 0.7
      })
    });

    if (!openAiRes.ok) {
      const errText = await openAiRes.text();
      return NextResponse.json({ error: `OpenAI API lỗi (${openAiRes.status}): ${errText.slice(0, 200)}` }, { status: openAiRes.status });
    }

    const openAiData = await openAiRes.json();
    const reply = openAiData.choices?.[0]?.message?.content || 'Không có nội dung trả về từ OpenAI.';
    return NextResponse.json({ reply, provider: provider || 'system' });

  } catch (error: any) {
    return NextResponse.json({ error: `Lỗi hệ thống AI Gateway: ${error.message}` }, { status: 500 });
  }
}
