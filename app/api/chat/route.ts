import { ChatOpenAI } from "@langchain/openai";
import { createDataStreamResponse, LangChainAdapter, Message } from "ai";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
  }: {
    messages: Message[];
  } = await req.json();

  return createDataStreamResponse({
    execute: async (dataStream) => {
      const model = new ChatOpenAI({
        model: "gpt-4.1-nano",
        temperature: 0,
      });
      const weatherTool = tool(
        async ({ location }: { location: string }) => {
          /**
           * Get the current weather for a given location
           */
          // Simulate API call delay
          await new Promise((resolve) => setTimeout(resolve, 1000));

          // Return simulated weather data
          const weatherConditions = [
            "sunny",
            "cloudy",
            "rainy",
            "snowy",
            "partly cloudy",
          ];
          const randomCondition =
            weatherConditions[
              Math.floor(Math.random() * weatherConditions.length)
            ];
          const temperature = Math.floor(Math.random() * 40) + 40; // 40-80°F

          return JSON.stringify({
            location,
            temperature: `${temperature}°F`,
            condition: randomCondition,
            humidity: `${Math.floor(Math.random() * 40) + 30}%`,
            windSpeed: `${Math.floor(Math.random() * 20) + 5} mph`,
          });
        },
        {
          name: "get_weather",
          description: "Get the current weather for a given location",
          schema: z.object({
            location: z
              .string()
              .describe("The city and state, e.g. San Francisco, CA"),
          }),
        },
      );

      const agent = createReactAgent({
        llm: model,
        tools: [weatherTool],
      });
      const modelMessages = messages.map((message) =>
        message.role == "user"
          ? new HumanMessage(message.content)
          : new AIMessage(message.content),
      );

      // Now it's time to use!
      const agentStream = agent.streamEvents(
        { messages: modelMessages },
        { version: "v2", configurable: { thread_id: "42" } },
      );

      LangChainAdapter.mergeIntoDataStream(agentStream, { dataStream });
    },
  });
}
