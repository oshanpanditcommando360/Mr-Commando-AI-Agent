import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { agentTools, SYSTEM_PROMPT } from "@/lib/agent/tools";
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

    const genAI = new GoogleGenerativeAI(apiKey);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: SYSTEM_PROMPT,
      tools: [{ functionDeclarations: agentTools }],
    });

    const chat = model.startChat({
      history: [],
    });

    // Send the user message
    let result = await chat.sendMessage(message);
    let response = result.response;

    // Handle function calls in a loop
    let maxIterations = 10;
    let iterations = 0;

    while (iterations < maxIterations) {
      const functionCalls = response.functionCalls();

      if (!functionCalls || functionCalls.length === 0) {
        break;
      }

      // Execute all function calls
      const functionResponses = await Promise.all(
        functionCalls.map(async (call) => {
          const functionResult = await handleFunctionCall(
            call.name,
            call.args as Record<string, unknown>
          );
          return {
            functionResponse: {
              name: call.name,
              response: { result: functionResult },
            },
          };
        })
      );

      // Send function results back to the model
      result = await chat.sendMessage(functionResponses);
      response = result.response;
      iterations++;
    }

    const text = response.text();

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
