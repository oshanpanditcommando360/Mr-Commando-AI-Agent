import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { agentTools } from "@/lib/agent/tools";
import { SYSTEM_PROMPT, MODEL_NAME } from "@/lib/agent/config";
import { handleFunctionCall } from "@/lib/agent/handlers";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    // Create chat with function calling
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        tools: [{ functionDeclarations: agentTools }],
      },
    });

    // Send user message
    let response = await chat.sendMessage({ message });

    // Handle function calls in a loop
    let maxIterations = 10;
    let iterations = 0;

    while (iterations < maxIterations) {
      const functionCalls = response.functionCalls;

      if (!functionCalls || functionCalls.length === 0) {
        break;
      }

      // Execute all function calls and build function response parts
      const functionResponseParts = await Promise.all(
        functionCalls.map(async (call) => {
          const functionName = call.name || "unknown";
          const functionResult = await handleFunctionCall(
            functionName,
            (call.args as Record<string, unknown>) || {}
          );
          return {
            functionResponse: {
              name: functionName,
              response: { result: functionResult },
            },
          };
        })
      );

      // Send function results back to the model as parts
      response = await chat.sendMessage({
        message: functionResponseParts,
      });

      iterations++;
    }

    const text = response.text || "I couldn't generate a response. Please try again.";

    return NextResponse.json({
      response: text,
      sessionId: sessionId || crypto.randomUUID(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to process chat message: ${errorMessage}` },
      { status: 500 }
    );
  }
}
