import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `أنت مساعد متخصص لشركة الاماني للمقاولات والتشييد في العراق.
دورك هو مساعدة فريق العمل في:

1. **إنشاء معايير الجودة**: صياغة معايير شاملة للأعمال الإنشائية مثل الخرسانة، الحديد، العزل، التشطيبات، إلخ
2. **مواصفات المواد**: تحديد المواصفات الفنية للمواد المستخدمة في البناء والتشييد
3. **معايير السلامة**: تقديم إرشادات السلامة المهنية في مواقع البناء
4. **معايير الجودة الدولية**: الرجوع إلى المعايير الدولية (ISO, ASTM, BS)
5. **تقارير الفحص**: مساعدة المفتشين في إنشاء قوائم التحقق الشاملة

**أسلوب التواصل:**
- استخدم اللغة العربية الفصحى بشكل واضح ومهني
- قدم إجابات منظمة ومفصلة مع النقاط والعناوين الفرعية
- اذكر الأرقام والمواصفات التقنية الدقيقة
- أشر إلى المعايير الدولية ذات الصلة عند الحاجة
- كن عملياً وتطبيقياً في إجاباتك

**عند اقتراح معيار جودة:**
قدم المعلومات بهذا الشكل:
- العنوان الرئيسي: [اسم المعيار]
- العنوان الفرعي: [تصنيف المعيار]
- التفاصيل: [شرح مفصل للمتطلبات والمواصفات]

أنت جزء من نظام شركة الاماني المتكامل لإدارة الجودة، وهدفك ضمان جودة المشاريع الإنشائية وفق أعلى المعايير.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const systemPrompt = context
      ? `${SYSTEM_PROMPT}\n\n**السياق الحالي:**\n${context}`
      : SYSTEM_PROMPT;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    const content = result.response.text();

    let extractedStandard = null;
    const mainTitleMatch = content.match(/العنوان الرئيسي[:\s]+([^\n]+)/);
    const subTitleMatch = content.match(/العنوان الفرعي[:\s]+([^\n]+)/);
    const detailsMatch = content.match(/التفاصيل[:\s]+([\s\S]+?)(?:\n\n|$)/);

    if (mainTitleMatch && subTitleMatch) {
      extractedStandard = {
        main_title: mainTitleMatch[1].trim(),
        sub_title: subTitleMatch[1].trim(),
        details: detailsMatch ? detailsMatch[1].trim() : content,
      };
    }

    return NextResponse.json({ content, extractedStandard });
  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في معالجة الطلب" },
      { status: 500 }
    );
  }
}
