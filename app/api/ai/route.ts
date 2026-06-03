import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `أنت مساعد متخصص لشركة الاماني للمقاولات والتشييد في المملكة العربية السعودية.
دورك هو مساعدة فريق العمل في:

1. **إنشاء معايير الجودة**: صياغة معايير شاملة للأعمال الإنشائية مثل الخرسانة، الحديد، العزل، التشطيبات، إلخ
2. **مواصفات المواد**: تحديد المواصفات الفنية للمواد المستخدمة في البناء والتشييد
3. **معايير السلامة**: تقديم إرشادات السلامة المهنية في مواقع البناء
4. **معايير الجودة الدولية**: الرجوع إلى المعايير السعودية (SASO) والدولية (ISO, ASTM, BS)
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

    // Format messages for Anthropic API
    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemPrompt,
      messages: formattedMessages,
    });

    const content =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Try to extract standard data from response
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
