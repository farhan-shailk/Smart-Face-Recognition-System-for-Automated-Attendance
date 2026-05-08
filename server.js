const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 8787;
const ROOT_DIR = path.resolve(__dirname);
const OPENAI_API_BASE = "https://api.openai.com/v1";
const MAX_BODY_BYTES = 1024 * 1024;

const MIME_TYPES = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".txt": "text/plain; charset=utf-8",
    ".xml": "application/xml; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".ico": "image/x-icon",
    ".map": "application/json; charset=utf-8",
    ".pdf": "application/pdf"
};

const API_CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
};

function sendJson(res, status, payload, extraHeaders = {}) {
    const body = JSON.stringify(payload);
    res.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
        "Content-Length": Buffer.byteLength(body),
        ...extraHeaders
    });
    res.end(body);
}

function isPathInsideRoot(targetPath) {
    const normalizedRoot = `${ROOT_DIR}${path.sep}`.toLowerCase();
    const normalizedTarget = targetPath.toLowerCase();
    return normalizedTarget === ROOT_DIR.toLowerCase() || normalizedTarget.startsWith(normalizedRoot);
}

async function readRequestBody(req, maxBytes = MAX_BODY_BYTES) {
    const chunks = [];
    let total = 0;

    for await (const chunk of req) {
        total += chunk.length;
        if (total > maxBytes) {
            const error = new Error("Request body too large.");
            error.statusCode = 413;
            throw error;
        }
        chunks.push(chunk);
    }

    return Buffer.concat(chunks).toString("utf8");
}

function safePayload(data) {
    return data && typeof data === "object" ? data : {};
}

function extractErrorMessage(payload, fallback = "Request failed.") {
    const data = safePayload(payload);
    if (data.error && typeof data.error === "object") {
        if (typeof data.error.message === "string" && data.error.message.trim()) return data.error.message.trim();
        if (typeof data.error.code === "string" && data.error.code.trim()) return data.error.code.trim();
    }
    if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
    return fallback;
}

function extractResponsesText(payload) {
    const data = safePayload(payload);
    if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text.trim();

    if (Array.isArray(data.output)) {
        const textParts = [];
        data.output.forEach((item) => {
            if (!item || typeof item !== "object" || !Array.isArray(item.content)) return;
            item.content.forEach((part) => {
                if (part && typeof part === "object" && typeof part.text === "string") {
                    textParts.push(part.text);
                }
            });
        });
        const merged = textParts.join("\n").trim();
        if (merged) return merged;
    }

    return "";
}

function extractChatCompletionText(payload) {
    const data = safePayload(payload);
    if (!Array.isArray(data.choices) || !data.choices.length) return "";
    const message = data.choices[0] && data.choices[0].message;
    if (!message) return "";
    if (typeof message.content === "string") return message.content.trim();
    if (Array.isArray(message.content)) {
        return message.content
            .map((part) => (part && typeof part.text === "string" ? part.text : ""))
            .join("\n")
            .trim();
    }
    return "";
}

async function callOpenAI({ apiKey, model, systemPrompt, userPrompt }) {
    const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
    };

    const responsesBody = {
        model,
        input: [
            {
                role: "system",
                content: [{ type: "input_text", text: systemPrompt }]
            },
            {
                role: "user",
                content: [{ type: "input_text", text: userPrompt }]
            }
        ],
        max_output_tokens: 900,
        temperature: 0.2
    };

    const responsesRes = await fetch(`${OPENAI_API_BASE}/responses`, {
        method: "POST",
        headers,
        body: JSON.stringify(responsesBody)
    });
    const responsesPayload = await responsesRes.json().catch(() => ({}));

    if (responsesRes.ok) {
        const outputText = extractResponsesText(responsesPayload);
        if (outputText) return outputText;
        throw new Error("OpenAI returned an empty analysis.");
    }

    const firstError = extractErrorMessage(
        responsesPayload,
        `OpenAI request failed (${responsesRes.status}).`
    );

    const chatBody = {
        model,
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        max_tokens: 900,
        temperature: 0.2
    };

    const chatRes = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
        method: "POST",
        headers,
        body: JSON.stringify(chatBody)
    });
    const chatPayload = await chatRes.json().catch(() => ({}));
    if (!chatRes.ok) {
        const secondError = extractErrorMessage(chatPayload, `Fallback request failed (${chatRes.status}).`);
        throw new Error(`${firstError} ${secondError}`.trim());
    }

    const chatText = extractChatCompletionText(chatPayload);
    if (!chatText) throw new Error("OpenAI returned an empty fallback response.");
    return chatText;
}

async function handleOpenAIProxy(req, res) {
    if (req.method === "OPTIONS") {
        res.writeHead(204, API_CORS_HEADERS);
        res.end();
        return;
    }

    if (req.method !== "POST") {
        sendJson(
            res,
            405,
            { error: { message: "Method not allowed." } },
            { ...API_CORS_HEADERS, Allow: "POST, OPTIONS" }
        );
        return;
    }

    try {
        const raw = await readRequestBody(req);
        let payload;
        try {
            payload = raw ? JSON.parse(raw) : {};
        } catch (error) {
            sendJson(res, 400, { error: { message: "Invalid JSON body." } }, API_CORS_HEADERS);
            return;
        }

        const model = typeof payload.model === "string" && payload.model.trim()
            ? payload.model.trim()
            : "gpt-4o-mini";
        const userPrompt = typeof payload.prompt === "string" ? payload.prompt.trim() : "";
        const systemPrompt = typeof payload.systemPrompt === "string" && payload.systemPrompt.trim()
            ? payload.systemPrompt.trim()
            : "You are a helpful assistant.";

        const explicitKey = typeof payload.apiKey === "string" ? payload.apiKey.trim() : "";
        const apiKey = (process.env.OPENAI_API_KEY || "").trim() || explicitKey;

        if (!apiKey) {
            sendJson(
                res,
                400,
                { error: { message: "Missing OpenAI API key. Set OPENAI_API_KEY on server or pass apiKey in request." } },
                API_CORS_HEADERS
            );
            return;
        }

        if (!userPrompt) {
            sendJson(res, 400, { error: { message: "Missing prompt." } }, API_CORS_HEADERS);
            return;
        }

        const outputText = await callOpenAI({
            apiKey,
            model,
            systemPrompt,
            userPrompt
        });

        sendJson(res, 200, { output_text: outputText }, API_CORS_HEADERS);
    } catch (error) {
        const statusCode = Number(error && error.statusCode) || 500;
        sendJson(
            res,
            statusCode,
            { error: { message: error && error.message ? error.message : "Internal server error." } },
            API_CORS_HEADERS
        );
    }
}

async function serveStatic(req, res, pathname) {
    const safePathname = pathname === "/" ? "/index.html" : pathname;
    const resolvedPath = path.resolve(ROOT_DIR, `.${safePathname}`);

    if (!isPathInsideRoot(resolvedPath)) {
        res.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Forbidden");
        return;
    }

    let finalPath = resolvedPath;
    try {
        const stat = fs.statSync(finalPath);
        if (stat.isDirectory()) {
            finalPath = path.join(finalPath, "index.html");
        }
    } catch (error) {
        // continue to file read below
    }

    try {
        const content = await fs.promises.readFile(finalPath);
        const ext = path.extname(finalPath).toLowerCase();
        const type = MIME_TYPES[ext] || "application/octet-stream";
        res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
        res.end(content);
    } catch (error) {
        if (error && error.code === "ENOENT") {
            const notFoundPath = path.resolve(ROOT_DIR, "404.html");
            try {
                const notFoundHtml = await fs.promises.readFile(notFoundPath);
                res.writeHead(404, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-cache" });
                res.end(notFoundHtml);
                return;
            } catch (fallbackError) {
                res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
                res.end("Not found");
                return;
            }
        }

        res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
        res.end("Internal server error");
    }
}

const server = http.createServer(async (req, res) => {
    const method = req.method || "GET";
    const parsed = new URL(req.url || "/", `http://${req.headers.host || `${HOST}:${PORT}`}`);
    const pathname = parsed.pathname;

    if (pathname === "/api/openai/analyze") {
        await handleOpenAIProxy(req, res);
        return;
    }

    if (method !== "GET" && method !== "HEAD") {
        res.writeHead(405, { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD" });
        res.end("Method not allowed");
        return;
    }

    await serveStatic(req, res, pathname);
});

server.listen(PORT, HOST, () => {
    console.log(`[folio] Server running at http://${HOST}:${PORT}`);
    if (!process.env.OPENAI_API_KEY) {
        console.log("[folio] OPENAI_API_KEY is not set on server. Browser apiKey field will be used.");
    } else {
        console.log("[folio] OPENAI_API_KEY loaded from environment.");
    }
});
