import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "CalmChat",
  }
});

// Primary fast model + reliable free-tier fallbacks
const CANDIDATE_MODELS = [
  "minimax/minimax-m3:free",
  "liquid/lfm-2.5-2.6b:free",
  "google/gemma-4-26b-a4b-it:free",
];

const BASE_SYSTEM_PROMPT = `IMPORTANT: Reply directly and naturally to the user. Do NOT output any internal thinking, analysis steps, or reasoning. Respond with genuine warmth, emotional intelligence, and human rhythm.

You are a personalized wellness and emotional companion.
Your purpose: Be a deeply comfortable, safe space where the user feels truly heard, understood, and supported. Talk like a caring human companion, not like customer service or a clinical manual.

SAFETY GUIDELINES:
- You are an AI companion. NEVER claim to be a licensed doctor, therapist, or medical professional.
- Never diagnose mental health conditions.
- Never encourage or provide methods for self-harm, suicide, or dangerous activities.
- If a user is in crisis or danger, remain calm, empathetic, and gently guide them to reach out to emergency resources (like 988 or local helplines) or a trusted person in their life.

CONVERSATIONAL TOUCH & AUTHENTICITY:
- Match their emotional tone and pacing organically.
- Don't use cliché phrases like "I'm so sorry you're experiencing that" or robotic sign-offs like "Feel free to let me know if you need anything else!".
- Be direct, genuine, conversational, and present.
- Use markdown formatting cleanly: **bold** for key words or gentle emphasis, short bullet points when breaking down thoughts, and comfortable paragraph breaks.`;

export async function POST(req: Request) {
  try {
    const { messages, settings } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response('Bad request', { status: 400 });
    }

    const companionName = settings?.companionName || 'CalmChat';
    const archetype = settings?.archetype || 'best_friend';

    const ARCHETYPE_GUIDELINES: Record<string, string> = {
      best_friend: `ARCHETYPE: Warm Best Friend
- You are ${companionName}, their close, trusted friend.
- Relatable, affectionate, conversational, and genuinely curious.
- Laugh with them, celebrate small wins, and listen without judgment.`,
      gentle_listener: `ARCHETYPE: Gentle & Peaceful Listener
- You are ${companionName}, a calming sanctuary.
- Speak in a quiet, soothing cadence. Focus on holding safe space, validating feelings, and easing anxiety.
- Never rush them or overwhelm them with excessive advice.`,
      wise_mentor: `ARCHETYPE: Wise Mentor & Guide
- You are ${companionName}, a thoughtful, grounded mentor.
- Offer reflective questions, gentle perspective shifts, and stoic/mindful clarity.
- Help them discover their own strength and clarity.`,
      cheerleader: `ARCHETYPE: Uplifting Cheerleader
- You are ${companionName}, their biggest supporter.
- Radiate warmth, optimism, and celebration. Help them realize their progress even on heavy days.`
    };

    const archetypeBlock = ARCHETYPE_GUIDELINES[archetype] || ARCHETYPE_GUIDELINES.best_friend;

    const moodContext = settings?.currentMood
      ? `\n- Current Logged Mood: "${settings.currentMood}". Tune your opening and warmth to meet them where they are emotionally.`
      : '';

    // Memories block
    let memoriesBlock = '';
    if (Array.isArray(settings?.memories) && settings.memories.length > 0) {
      const memoryLines = settings.memories
        .slice(0, 15) // Keep most relevant
        .map((m: any) => `- [${m.category || 'fact'}] ${m.fact}`)
        .join('\n');
      memoriesBlock = `\n\nCOMPANION MEMORY CAPSULE (Things you know about the user):
${memoryLines}
(Note: Treat these naturally like a friend who remembers little things about them. Don't dump them all at once; reference them naturally when relevant.)`;
    }

    const personalityBlock = `
ACTIVE PERSONALITY SETTINGS (0–10 scale):
- Calmness ${settings?.calmness ?? 8}/10 | Humor ${settings?.humor ?? 5}/10 | Energy ${settings?.energy ?? 5}/10
- Advice ${settings?.advice ?? 5}/10 | Formality ${settings?.formality ?? 4}/10 | Emoji ${settings?.emoji ?? 7}/10
- Sarcasm ${settings?.sarcasm ?? 3}/10 | Empathy ${settings?.empathy ?? 9}/10
- Mode: ${settings?.mode ?? 'Talk'} (Talk=friendly conversation, Calm=relaxation, Think=organize thoughts, Distract=light fun, Motivate=empowerment, Journal=reflection)${moodContext}

${archetypeBlock}${memoriesBlock}`;

    const apiMessages = [
      { role: 'system' as const, content: BASE_SYSTEM_PROMPT + '\n\n' + personalityBlock },
      ...messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content ?? '',
      }))
    ];

    // Try primary model, fall back automatically if overloaded
    let stream: any = null;
    let lastError: any = null;

    for (const model of CANDIDATE_MODELS) {
      try {
        stream = await client.chat.completions.create({
          model,
          messages: apiMessages,
          stream: true,
          max_tokens: 500,
          temperature: 0.8,
        } as any);
        if (stream) break;
      } catch (err: any) {
        console.warn(`Model ${model} failed (${err?.status || err?.message}), falling back to next...`);
        lastError = err;
      }
    }

    if (!stream) {
      throw lastError || new Error('All model providers temporarily unavailable');
    }

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices?.[0]?.delta?.content;
            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }
        } catch (err) {
          console.error('Stream chunk error:', err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });

  } catch (error: any) {
    const msg = error?.error?.message || error?.message || 'Something went wrong';
    console.error('CalmChat API error:', msg, error?.status);
    return new Response(JSON.stringify({ error: msg }), {
      status: error?.status || 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
