import { initChatModel, SystemMessage, HumanMessage, AIMessage, ToolMessage } from "langchain"

const model = await initChatModel("gpt-4.1")

// Text prompt are simple one line strings.
const textPromptResponse = await model.invoke("Tell me something interesting about AI Agents")
console.log(textPromptResponse.content)

console.log("--------------------------------")
// Messages are more flexible. They can contain multiple parts:
// {
//     role: "user",
//     content: "Tell me something interesting about AI Agents"
// }

// We also have messages types like:
// "System Message" - Tells model how to behave and provide context for interaction
// "Human Message" - User's message to the model
// "AI Message" - Model's message to the user
// "Tool Message" - Represents a tool call and its result

const systemMessage = new SystemMessage("You are a helpful assistant that can answer questions and help with tasks.")
const humanMessage = new HumanMessage("How to write REST APIs?")

// here we are passing list of messages in the form of conversation history
const messagesToModel = [systemMessage, humanMessage]
const modelResponse = await model.invoke(messagesToModel)
console.log(modelResponse.content)

console.log("--------------------------------")

// more clean way to pass messages to the model and response will be much more practical
const modelResponse2 = await model.invoke([
    new SystemMessage('You are senior Javascript Developer with 10+ Years of experience. Always provide code examples with proper reasoning. Be concise but thorough in your explanations.'),
    new HumanMessage('How to write REST APIs?'),
])
console.log(modelResponse2.content)


console.log("--------------------------------")

// more clean way to pass messages to the model and response will be much more practical
const modelResponse3 = await model.invoke([
    new SystemMessage('You are a helpful assistant.'),
    new HumanMessage('Can you help me?'),
    new AIMessage('I would love to help you!'),
    // new HumanMessage('Great! what is 2+2?'),
])
console.log(modelResponse3.content)
