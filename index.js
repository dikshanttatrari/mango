const { message } = require("telegraf/filters")
const express = require('express');
const dotenv = require("dotenv");
const bot = require("./channels/telegram");
const client = require("./channels/whatsapp");
const { readMemory, saveMemory } = require("./skills/memory");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 7860;

const SYSTEM_PROMPT = `You are Mango, an autonomous AI assistant operating securely on a private Node.js environment. You interface with the user via Telegram and WhatsApp.

Your primary mission is to assist with system administration, software development, and workflow automation.

OPERATIONAL GUIDELINES:
1. Communication Style: Provide clear, concise, and highly relevant responses. Avoid conversational filler and verbosity. State facts, errors, and results directly.
2. System Safety (CRITICAL): You operate in a live hardware environment. You must strictly halt and request explicit user authorization before executing any potentially destructive actions (e.g., file deletion, formatting, or dropping databases).
3. Factual Accuracy: Prioritize absolute truth. If a script fails, a directory is empty, or a file is missing, report the exact system error. Never hallucinate data, assume system states, or fabricate success.
4. Memory Usage: ONLY use the save_memory tool for critical, long-term facts (like project requirements, tech stack details, or server specs). NEVER use the tool to save casual greetings, small talk, or temporary feelings.

AGENTIC EXECUTION PROTOCOL (ReAct Framework):
When assigned a task, you must operate autonomously using a Reason -> Act loop:
- Do not guess system configurations or file contents. 
- ALWAYS use your provided tools to dynamically investigate the real environment first.
- Iterate systematically: Execute a tool -> Analyze the factual output -> Determine the next logical step -> Execute the next tool.
- Repeat this loop silently until the objective is definitively achieved.

Upon finalizing a complex task, provide a single, direct sentence summarizing the exact actions taken and the verified outcome.`;


const fetchResponse = async (message) => {

    const currentMemory = readMemory();

    const dynamicPrompt = `${SYSTEM_PROMPT}

        === YOUR LONG-TERM MEMORY ===
    Here is what you currently know about the user and their projects:
    ${currentMemory}
    =============================
        `

    const mangoTools = [
        {
            type: 'function',
            function: {
                name: "save_memory",
                description: "Saves an important fact about the user or their coding projects to long-term memory.",
                parameters: {
                    type: 'object',
                    properties: {
                        fact: {
                            type: "string",
                            description: "The specific fact to remember, e.g., 'The backend runs on port 3000'",
                        }
                    },
                    required: ['fact']
                }
            }
        }
    ]

    const MAX_RETRIES = 3;

    const messageArray = [
        { role: "system", content: dynamicPrompt },
        { role: "user", content: message }
    ]
    let response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: messageArray,
            tools: mangoTools,
            tool_choice: "auto"
        })
    })

    const data = await response.json();
    if (data.error) {
        return data.error.message;
    }
    const aiMessage = data.choices[0].message;

    if (aiMessage.tool_calls) {
        messageArray.push(aiMessage)

        for (const toolCall of aiMessage.tool_calls) {
            if (toolCall.function.name === "save_memory") {
                const args = JSON.parse(toolCall.function.arguments);

                const result = saveMemory(args.fact);

                messageArray.push({
                    role: "tool",
                    tool_call_id: toolCall.id,
                    content: result
                });
            }
        }

        const finalResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messageArray
            })
        });

        let finalData = await finalResponse.json();
        return finalData.choices[0].message.content;


    }
    return aiMessage.content
}

bot.on(message('text'), async (ctx) => {
    ctx.sendChatAction("typing")
    const finalAnswer = await fetchResponse(ctx.message.text);
    await ctx.reply(finalAnswer);
});

bot.launch();

client.on("message_create", async (msg) => {
    if (msg.fromMe) return;

    const chat = await msg.getChat();
    await chat.sendStateTyping();

    const finalAnswer = await fetchResponse(msg.body);
    await msg.reply(finalAnswer);
});


app.get("/", (req, res) => {
    res.json("Hello from MANGO");
});

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}`);
});

