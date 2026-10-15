import { auth } from "@/auth";
import { openAICompatMultimodalChat } from "@/lib/ai/openaiCompat";
import { z } from "zod";

const requestSchema = z.object({
  imageBase64: z.string().min(1),
  imageMimeType: z.string().optional().default("image/jpeg"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid request format", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const systemPrompt = `You are a professional nutrition estimation AI. Analyze the food image provided and estimate the individual food items present. Return JSON strictly matching this schema:
{
  "detectedItems": [
    {
      "name": "Food item name",
      "portionG": 150,
      "calories": 320,
      "proteinG": 24,
      "carbsG": 30,
      "fatG": 12
    }
  ],
  "disclaimer": "Nutrition values are estimated from the image. Review before logging."
}`;

  const userPrompt = "Analyze this meal photo and estimate the breakdown of food items, portions, calories, and macros in JSON format.";

  const aiResult = await openAICompatMultimodalChat({
    systemPrompt,
    userPrompt,
    imageBase64: parsed.data.imageBase64.replace(/^data:image\/\w+;base64,/, ""),
    imageMimeType: parsed.data.imageMimeType,
  });

  if (!aiResult.ok) {
    return Response.json(
      {
        ok: false,
        error: aiResult.error || "AI Vision analysis unavailable (GEMINI_API_KEY not configured). Please configure the GEMINI_API_KEY environment variable.",
      },
      { status: 503 }
    );
  }

  try {
    const data = JSON.parse(aiResult.content);
    return Response.json({
      ok: true,
      aiActive: true,
      detectedItems: data.detectedItems || [],
      disclaimer: data.disclaimer || "Nutrition values are estimated from the image. Review before logging.",
    });
  } catch {
    return Response.json(
      {
        ok: false,
        error: "Failed to parse AI response. Please try uploading the image again.",
      },
      { status: 502 }
    );
  }
}
