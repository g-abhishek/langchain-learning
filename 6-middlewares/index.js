import { createAgent, summarizationMiddleware, providerStrategy, tool } from "langchain"
import { MemorySaver } from "@langchain/langgraph"
import z from "zod"

const agent = createAgent({
    model: "gpt-4.1",
    responseFormat: providerStrategy(z.object({
        answer: z.string(),
    })),
    checkpointer: new MemorySaver(),
    middleware: [
        summarizationMiddleware({
            model: "gpt-4.1",
            trigger: { messages: 6 },
            keep: {messages: 2}
        })
    ]
})

let questions = [
    "What is 2 + 2?",
    "What is 3 + 3?",
    "What is 4 + 4?",
    "What is 5 + 5?",
    "What is 6 + 6?",
    "What is 7 + 7?",
    "What is 8 + 8?",
    "What is 9 + 9?",
    "What is 10 + 10?",
]

const config = {
    configurable: { thread_id: "test-thread-1"}
}

// for (const question of questions) {
//     const response = await agent.invoke({ messages:question }, config)
//     console.log("Answer >>>", response.structuredResponse);
//     console.log("Messages count >>>", response.messages?.length)

//     console.log(
//         response.messages.map((m, i) => ({
//           i,
//           type: m.type,
//           content: String(m.content),
//         }))
//       );
// }

// Flow note:
// - Messages grow as human/AI pairs: 2, 4, 6...
// - When trigger.messages is reached, old messages are summarized.
// - keep.messages keeps recent previous messages, then the current human/AI turn is added.
// - So keep: { messages: 2 } can result in 4 messages: summary + kept context + current turn.


// TOKEN TRIGGERS

const getWeather = tool(({ city }) => {
    return `Its always sunny in ${city}`
}, { name: "getWeather", description: "Get the weather of the city", schema: z.object({ city: z.string() }) });


const agent2 = createAgent({
    model: "gpt-5.5",
    responseFormat: providerStrategy(z.object({
        answer: z.string(),
    })),
    checkpointer: new MemorySaver(),
    middleware: [
        summarizationMiddleware({
            model: "gpt-5.5",
            // Default token counting is approximate: Math.ceil(totalCharacters / 4).
            // It counts message content, AI tool-call JSON, and tool message IDs.
            // trigger.tokens starts summarization once the estimated count reaches this value.
            trigger: { tokens: 100 },
            // keep.tokens preserves the newest messages that fit this estimated token budget.
            // Older messages are replaced by one summary message.
            keep: { tokens: 50 }
        })
    ],
    tools: [getWeather]
})

let cities = ["mumbai", "delhi", "bangalore", "chennai", "hyderabad", "pune", "kolkata"]

const config2 = {
    configurable: { thread_id: "test-thread-2"}
}

// MemorySaver + token summarization flow:
// - MemorySaver stores the final agent state for each thread_id.
// - Reusing "test-thread-2" makes each city continue the same conversation.
// - Before each model call, summarizationMiddleware checks the loaded messages.
// - If estimated tokens >= trigger.tokens, older messages are summarized.
// - The summarized state is then saved back by MemorySaver for the next city.
for (const city of cities) {
    const response = await agent2.invoke({ messages: `What is the weather of ${city} today?` }, config2)
    console.log("Answer >>>", response.structuredResponse);
    console.log("Messages count >>>", response.messages?.length)

    console.log(
        response.messages.map((m, i) => ({
          i,
          type: m.type,
          content: String(m.content),
        }))
      );
}