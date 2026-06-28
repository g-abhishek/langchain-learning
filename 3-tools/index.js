import { tool } from "langchain";
import { ChatOpenAI } from "@langchain/openai";

const getWeather = tool((city) => {
    return `Its always sunny in ${city}`
}, { name: "getWeather", description: "Get the weather of the city"});

let model = new ChatOpenAI("gpt-4.1");
// bindTools() does not mutate model. It returns a new model/runnable with tools bound.
// IMP: bindTools() only lets the model request a tool call. It does not execute the tool for you.
let modelWithTools = model.bindTools([getWeather]); 

// you are telling the model: “Here are the tools available. If needed, choose one and tell me what arguments to use.”
// So the model responds with a tool_calls request:
// {
//     name: "getWeather",
//     args: { input: "mumbai" }
// }

const response = await modelWithTools.invoke("What is the weather of mumbai today?");
console.log(response);

// But JavaScript/LangChain does not automatically run getWeather at this level. 
// This low-level model API stops after the model says: “Call this tool.”

// The full flow is:
// 1. User asks question
// 2. Model decides tool is needed
// 3. Model returns tool call
// 4. Your code runs the tool
// 5. Your code sends tool result back to model
// 6. Model gives final answer
// createAgent() does those middle steps for you automatically.

// So:
//     model.bindTools(...)
// means: “Model may request tools.”

//     createAgent({ tools: [...] })
// means: “Run a loop where the model can request tools, execute them, then answer.”

// check 1-langchain-intro/index.js for a more advanced example with createAgent()








