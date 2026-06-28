import { createAgent, providerStrategy, toolStrategy } from "langchain"
import z from "zod"

const castSchema = z.object({
    name: z.string(),
    role: z.string(),
})
const movieSchema = z.object({
    title: z.string(),
    description: z.string(),
    director: z.string(),
    year: z.number(),
    genre: z.array(z.string()),
    rating: z.number(),
    cast: z.array(castSchema),
})



const agent = createAgent({
    model: "gpt-4.1",
    // responseFormat: movieSchema,
    // use a provider strategy if supported by the model
    responseFormat: providerStrategy(movieSchema),
    // or enforce a tool strategy
    // responseFormat: toolStrategy(movieSchema)
})

// If the provider natively supports structured output for your model choice, 
// it is functionally equivalent to write 
// responseFormat: contactInfoSchema instead of responseFormat: providerStrategy(contactInfoSchema).

// In either case, if structured output is not supported, the agent will fall back to a tool calling strategy.

// For models that don’t support native structured output, 
// LangChain uses tool calling to achieve the same result. 
// This works with all models that support tool calling (most modern models).
// responseFormat: toolStrategy(movieSchema)


const response = await agent.invoke({messages: "Provide details about movie Inception"})
console.log(response.structuredResponse)
// Result ===
// {
//     title: 'Inception',
//     description: 'A skilled thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a CEO.',
//     director: 'Christopher Nolan',
//     year: 2010,
//     genre: [ 'Action', 'Adventure', 'Sci-Fi', 'Thriller' ],
//     rating: 8.8
// }