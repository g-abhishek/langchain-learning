import { initChatModel } from "langchain"
import { ChatOpenAI } from "@langchain/openai"

// using langchain
const model = await initChatModel("gpt-4.1")

const response = await model.invoke("Can we learn AI Agent using JavaScript?")
// console.log(response.content);


// using langchain/openai
const model2 = new ChatOpenAI("gpt-4.1")
const response2 = await model2.invoke("Can we learn AI Agent using JavaScript?")
// console.log(response2.content);

// Stream response instead of waiting for the entire response
const streamResponse = await model.stream("Can we learn AI Agent using JavaScript?")
// for await (const chunk of streamResponse) {
//   process.stdout.write(chunk.content)
// }

// Batch processing of messages in parallel with concurrency limit
const bachResponse = await model.batch(
    [
        "Why do parrots have colorful feathers?",
        "How do airplanes fly?",
        "What is quantum computing?"
    ],
    { concurrency: 2 } // Limit to 2 parallel calls
)
for (const response of bachResponse) {
    console.log(response.content);
}
