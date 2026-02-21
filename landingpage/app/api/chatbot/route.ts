import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

/**
 * Recursively get all files in a directory
 */
function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;
    const files = fs.readdirSync(dirPath)

    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file))
        }
    })

    return arrayOfFiles
}

// GET method for connectivity verification
export async function GET() {
    return NextResponse.json({ status: "ok", message: "RugIntel Chatbot API is reachable via GET" })
}

export async function POST(request: NextRequest) {
    try {
        const { message } = await request.json()

        if (!message) {
            return NextResponse.json({ error: "Message is required" }, { status: 400 })
        }

        const apiKey = process.env.GEMINI_API_KEY

        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key not configured. Please add GEMINI_API_KEY to your .env file" },
                { status: 500 }
            )
        }

        // Define paths for documentation and scope
        const docsPath = path.join(process.cwd(), "chatbot", "docs")
        const scopePath = path.join(process.cwd(), "chatbot", "scope")

        let fullContext = ""

        // Load all .md files from scope first
        const scopeFiles = getAllFiles(scopePath).filter(f => f.endsWith('.md'))
        scopeFiles.forEach(file => {
            const content = fs.readFileSync(file, "utf-8")
            fullContext += `\n\n--- SCOPE: ${path.basename(file)} ---\n${content}`
        })

        // Load all .md files from docs
        const docFiles = getAllFiles(docsPath).filter(f => f.endsWith('.md'))
        docFiles.forEach(file => {
            const content = fs.readFileSync(file, "utf-8")
            fullContext += `\n\n--- DOCUMENTATION: ${path.basename(file)} ---\n${content}`
        })

        if (!fullContext) {
            console.warn("No context files found in chatbot/docs or chatbot/scope. Using default context.")
            fullContext = "RugIntel is a decentralized intelligence subnet on Bittensor for Solana rugpull prediction."
        }

        // Use the model defined in .env or fallback to flash
        const model = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-1.5-flash"

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: `You are the RugIntel Sentinel, an AI assistant specialized in the RugIntel Bittensor Subnet and Solana security.
                                    
IMPORTANT INSTRUCTIONS:
- Use the context provided below to answer questions accurately.
- Focus strictly on RugIntel, its 12 intelligence layers, the Bittensor integration, and how users can protect their assets.
- If the question is outside the context (e.g., general life advice, non-RugIntel coding, politics), politely indicate that you only assist with RugIntel inquiries and then provide a brief overview of "What is RugIntel".
- Be professional, authoritative yet helpful, and cybersecurity-oriented.
- Format responses in clear, readable markdown.
- Formatting: Use bold, italic, and bullet points as defined in the context.

CONTEXT (RugIntel Knowledge Base & Scope):
${fullContext}

---

USER QUESTION: ${message}

Please provide a helpful, accurate, and well-structured response based on the context above. If irrelevant, follow the fallback protocol to explain RugIntel.`,
                                },
                            ],
                        },
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 1024,
                    },
                }),
            }
        )

        if (!response.ok) {
            const errorData = await response.json()
            console.error("Gemini API error:", errorData)
            return NextResponse.json(
                { error: "Failed to get response from Gemini API", details: errorData },
                { status: response.status }
            )
        }

        const data = await response.json()

        const generatedText =
            data.candidates?.[0]?.content?.parts?.[0]?.text ??
            "I apologize, but I couldn't generate a response. Please try again."

        return NextResponse.json({ response: generatedText })
    } catch (error) {
        console.error("Error in chatbot API:", error)
        return NextResponse.json(
            {
                error: "Internal server error",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
