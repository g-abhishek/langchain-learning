import { createAgent, humanInTheLoopMiddleware, HumanMessage, tool } from "langchain"
import { MemorySaver, Command } from "@langchain/langgraph";
import z from "zod";

const readEmailTool = tool(({emailId}) => {
    return `Email content for ${emailId}`
}, { name: "readEmailTool", description: "Read email by emailId" });

const sendEmailTool = tool(({recipient, subject, body}) => {
    return `Email sent to ${recipient} with subject ${subject} and body ${body}`
}, 
{ 
    name: "sendEmailTool", 
    description: "Send email to recipient with subject and body",
    schema: z.object({
        recipient: z.string(),
        subject: z.string(),
        body: z.string(),
    })
});

// humanInTheLoopMiddleware() uses LangGraph interrupt(). 
// Interrupt means the agent pauses, waits for human approval, then later resumes. 
// For that to work, LangGraph must save the paused state somewhere. 
// That is why it requires a checkpointer.
/**
 *
Why it is needed:
    Model decides to call sendEmailTool
    humanInTheLoopMiddleware intercepts it
    agent pauses with interrupt
    MemorySaver stores paused state under thread_id
    you approve/reject/edit
    agent resumes from saved state
Without checkpointer, there is nowhere to store the paused execution state.
 * 
 */
const agent = createAgent({
    model: "gpt-5.5",
    tools: [readEmailTool, sendEmailTool],
    checkpointer: new MemorySaver(),
    middleware:[
        humanInTheLoopMiddleware({
            interruptOn: {
                sendEmailTool: {
                    allowedDecisions: ["approve", "reject", "edit"]
                },
                readEmailTool: false
            }
        })
    ]
})

const config = {
    configurable: { thread_id: "test-approve"}
}
let response = await agent.invoke({
    messages: new HumanMessage("Send an email to John Doe with subject 'Meeting Reminder' and body 'Don't forget about the meeting tomorrow at 3pm'")
}, config)
console.log("response>>>", response.__interrupt__)
console.log("response>>>", response.__interrupt__[0].value)

// Resume with approval decision
let result = await agent.invoke(
    new Command({
        // Decisions are provided as a list, one per action under review.
        // The order of decisions must match the order of actions
        // in the interrupt request.
        resume: {
            decisions: [{ type: "approve" }]
        }
    }), config // Same thread ID to resume the paused conversation
)
console.log("result>>>", result.messages)
console.log("result>>>", result.messages[result.messages.length - 1].content)

// REJECT CASE

const rejectConfig = {
    configurable: { thread_id: "test-reject"}
}
let response2 = await agent.invoke({
    messages: new HumanMessage("Send an email to John Doe with subject 'Meeting Reminder' and body 'Don't forget about the meeting tomorrow at 3pm'")
}, rejectConfig)
console.log("response2>>>", response2.__interrupt__)
console.log("response2>>>", response2.__interrupt__[0].value)

let result2 = await agent.invoke(
    new Command({
        resume: {
            decisions: [{type: 'reject'}]
        }
    }), 
    rejectConfig)
console.log("result2>>>", result2.messages)
console.log("result2>>>", result2.messages[result2.messages.length - 1].content)

// EDIT CASE

const editConfig = {
    configurable: { thread_id: "test-edi"}
}
let response3 = await agent.invoke({
    messages: new HumanMessage("Send an email to test@email.com with subject 'Meeting Reminder' and body 'Don't forget about the meeting tomorrow at 3pm'")
}, editConfig)
console.log("response3>>>", response3.__interrupt__)
console.log("response3>>>", response3.__interrupt__[0].value)

let result3 = await agent.invoke(
    new Command({
        resume: {
            decisions: [{
                type: 'edit',
                editedAction: {
                    name: "sendEmailTool",
                    args: {
                        recipient: "correct@email.com",
                        subject: "Meeting Reminder",
                        body: "Don't forget about the meeting tomorrow at 3pm"
                    }
                }
            }]
        }
    }), 
    editConfig)
console.log("result3>>>", result3.messages)
console.log("result3>>>", result3.messages[result3.messages.length - 1].content)