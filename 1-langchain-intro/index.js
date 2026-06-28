import { createAgent, tool } from "langchain";

const getWeather = tool(
  (city) => {
    return `Its always sunny in ${city}`
  },
  {
  name: "getWeather",
  description: "Get the weather of the city",
})

const agent = createAgent({
  model: "gpt-5.5",
  tools: [getWeather],
});

const response = await agent.invoke({ messages: "What is the weather of mumbai today " })
console.log(response.messages[2].content);
