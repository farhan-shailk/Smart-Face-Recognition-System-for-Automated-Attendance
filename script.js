const STORE_KEY = "folio_builder_state_v1";
const SLOT_KEY = "folio_builder_slots_v1";
const TEMPLATE_PRESETS = ["professional", "modern", "academic"];
const SLOT_IDS = ["slot1", "slot2", "slot3"];
const COPILOT_MODELS = ["gpt-4.1-mini", "gpt-4.1", "gpt-4o-mini", "gpt-4o"];

const BASE_STATE = {
    mode: null,
    ui: {
        atsMode: false,
        templatePreset: "professional",
        jdText: "",
        activeSlot: "slot1",
        aiRole: "",
        aiModel: "gpt-4.1-mini"
    },
    cv: {
        name: "",
        title: "",
        email: "",
        phone: "",
        website: "",
        location: "",
        linkedin: "",
        summary: "",
        education: [{ degree: "", institution: "", location: "", year: "", score: "", details: "" }],
        experience: [{ title: "", org: "", location: "", period: "", desc: "" }],
        projects: [{ name: "", tech: "", period: "", highlights: "", link: "" }],
        publications: [{ title: "", venue: "", year: "", authors: "" }],
        skills: [{ cat: "", items: "" }],
        languages: [{ lang: "", level: "" }],
        awards: [{ title: "", year: "", org: "" }]
    },
    resume: {
        name: "",
        email: "",
        phone: "",
        website: "",
        location: "",
        linkedin: "",
        summary: "",
        experience: [{ title: "", company: "", location: "", period: "", bullets: "" }],
        projects: [{ name: "", tech: "", period: "", highlights: "", link: "" }],
        education: [{ degree: "", school: "", location: "", year: "", score: "" }],
        skills: "",
        certifications: [{ name: "", org: "", year: "", url: "", offline: "" }]
    }
};

const DEFAULT_ENTRY = {
    cv: {
        education: { degree: "", institution: "", location: "", year: "", score: "", details: "" },
        experience: { title: "", org: "", location: "", period: "", desc: "" },
        projects: { name: "", tech: "", period: "", highlights: "", link: "" },
        publications: { title: "", venue: "", year: "", authors: "" },
        skills: { cat: "", items: "" },
        languages: { lang: "", level: "" },
        awards: { title: "", year: "", org: "" }
    },
    resume: {
        experience: { title: "", company: "", location: "", period: "", bullets: "" },
        projects: { name: "", tech: "", period: "", highlights: "", link: "" },
        education: { degree: "", school: "", location: "", year: "", score: "" },
        certifications: { name: "", org: "", year: "", url: "", offline: "" }
    }
};

const I = {
    back: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    print: `<svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="2.5" y="5" width="8" height="5.5" rx="1" stroke="currentColor" stroke-width="1"/><rect x="4" y="2.5" width="5" height="3" rx=".5" stroke="currentColor" stroke-width="1"/><rect x="4.5" y="7" width="4" height="2.5" rx=".3" fill="currentColor" opacity=".18"/><circle cx="10" cy="6.5" r=".6" fill="currentColor"/></svg>`,
    plus: `<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M5.5 2V9M2 5.5H9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
    trash: `<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 3H9M3.5 3V2.5H7.5V3M4 3L4.5 9.5H6.5L7 3" stroke="currentColor" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    arrow: `<svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 7L7 3M7 3H4M7 3V6" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    swap: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8.5 2.5L10.5 4.5L8.5 6.5M3.5 9.5L1.5 7.5L3.5 5.5M10.5 4.5H1.5M10.5 7.5H1.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    d1: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="8" y="4" width="24" height="32" rx="3" stroke="currentColor" stroke-width="1.3" opacity=".7"/><path d="M14 14H26M14 19H26M14 24H21" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".38"/></svg>`,
    d2: `<svg width="40" height="40" viewBox="0 0 40 40" fill="none"><rect x="6" y="9" width="20" height="25" rx="2.5" stroke="currentColor" stroke-width="1.3" opacity=".7"/><rect x="14" y="5" width="20" height="25" rx="2.5" stroke="currentColor" stroke-width="1.3" opacity=".28"/><path d="M10 17H22M10 21H22M10 25H17" stroke="currentColor" stroke-width="1" stroke-linecap="round" opacity=".38"/></svg>`,
    grip: `<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="3" cy="3" r="1" fill="currentColor"/><circle cx="9" cy="3" r="1" fill="currentColor"/><circle cx="3" cy="6" r="1" fill="currentColor"/><circle cx="9" cy="6" r="1" fill="currentColor"/><circle cx="3" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="9" r="1" fill="currentColor"/></svg>`,
    x: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`
};

const S = clone(BASE_STATE);
const app = document.getElementById("app");
let saveTimer = null;
const UI = { mobilePane: "form", aiPopupOpen: false, aiTab: "copilot" };
let printRestorePane = null;
let a4HeightPxCache = null;
let SLOT_DATA = null;
const AI_KEY_SESSION = "folio_builder_openai_key_v1";
const OPENAI_PROXY_PATH = "/api/openai/analyze";
const OPENAI_PROXY_LOCAL_PORT = "8787";
const AI_REMOTE = {
    apiKey: "",
    loading: false,
    error: "",
    note: "",
    result: null
};
const DRAG_STATE = { mode: "", key: "", from: -1 };

const importInput = document.createElement("input");
importInput.type = "file";
importInput.accept = "application/json,.json";
importInput.style.display = "none";
document.body.appendChild(importInput);

try {
    AI_REMOTE.apiKey = sessionStorage.getItem(AI_KEY_SESSION) || "";
} catch (error) {
    AI_REMOTE.apiKey = "";
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function esc(value) {
    if (!value) return "";
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function contactCellMarkup(rawValue) {
    const value = text(rawValue).trim();
    if (!value) return "";

    const isUrl =
        /^https?:\/\//i.test(value) ||
        /^www\./i.test(value) ||
        /linkedin\.com/i.test(value);

    if (isUrl) {
        const href = /^https?:\/\//i.test(value) ? value : `https://${value}`;
        return `<a class="doc-c doc-c-link" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(value)}</a>`;
    }

    return `<span class="doc-c">${esc(value)}</span>`;
}

function contactMarkup(contactList) {
    const list = (Array.isArray(contactList) ? contactList : []).filter(Boolean);
    if (!list.length) return "";

    const rows = [];
    for (let i = 0; i < list.length; i += 2) {
        rows.push(list.slice(i, i + 2));
    }

    return `<div class="doc-contacts">${rows.map((row) => `<div class="doc-contacts-row">${row.map((c) => contactCellMarkup(c)).join("")}</div>`).join("")}</div>`;
}

function text(value) {
    return typeof value === "string" ? value : "";
}

function commaSeparated(value) {
    return text(value)
        .split(/[,\n]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .join(", ");
}

function dragHandle(mode, key, index) {
    return `<span class="drag-handle" title="Drag to reorder" draggable="true" ondragstart="dragStartItem('${mode}','${key}',${index},event)" ondragend="dragEndItem()">${I.grip}</span>`;
}

function externalLinkMarkup(rawUrl, label) {
    const raw = text(rawUrl).trim();
    if (!raw) return "";
    const href = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    return `<a href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(label || raw)}</a>`;
}

function normalizeTemplatePreset(value) {
    return TEMPLATE_PRESETS.includes(value) ? value : "professional";
}

function normalizeAIModel(value) {
    const cleaned = text(value).trim();
    return cleaned || "gpt-4.1-mini";
}

function copilotModelOptionsMarkup() {
    const current = normalizeAIModel(S.ui.aiModel);
    const hasCurrent = COPILOT_MODELS.includes(current);
    const list = hasCurrent ? COPILOT_MODELS : [...COPILOT_MODELS, current];

    return list.map((model) => {
        const selected = model === current ? "selected" : "";
        const label = COPILOT_MODELS.includes(model) ? model : `Custom (${model})`;
        return `<option value="${esc(model)}" ${selected}>${esc(label)}</option>`;
    }).join("");
}

function normalizeSlotId(value) {
    return SLOT_IDS.includes(value) ? value : "slot1";
}

function tokenize(textValue) {
    return textValue
        .toLowerCase()
        .replace(/[^a-z0-9+#./-]+/g, " ")
        .split(/\s+/)
        .filter(Boolean);
}

function applyState(newState) {
    const next = clone(BASE_STATE);

    if (newState && (newState.mode === null || newState.mode === "cv" || newState.mode === "resume")) {
        next.mode = newState.mode;
    }

    if (newState && newState.ui && typeof newState.ui === "object") {
        next.ui.atsMode = Boolean(newState.ui.atsMode);
        next.ui.templatePreset = normalizeTemplatePreset(text(newState.ui.templatePreset));
        next.ui.jdText = text(newState.ui.jdText);
        next.ui.activeSlot = normalizeSlotId(text(newState.ui.activeSlot));
        next.ui.aiRole = text(newState.ui.aiRole);
        next.ui.aiModel = normalizeAIModel(text(newState.ui.aiModel));
    }

    if (newState && newState.cv && typeof newState.cv === "object") {
        const raw = newState.cv;
        next.cv.name = text(raw.name);
        next.cv.title = text(raw.title);
        next.cv.email = text(raw.email);
        next.cv.phone = text(raw.phone);
        next.cv.website = text(raw.website);
        next.cv.location = text(raw.location);
        next.cv.linkedin = text(raw.linkedin);
        next.cv.summary = text(raw.summary);

        next.cv.education = normalizeArray(raw.education, DEFAULT_ENTRY.cv.education);
        next.cv.experience = normalizeArray(raw.experience, DEFAULT_ENTRY.cv.experience);
        next.cv.projects = normalizeProjects(raw.projects, DEFAULT_ENTRY.cv.projects);
        next.cv.publications = normalizeArray(raw.publications, DEFAULT_ENTRY.cv.publications);
        next.cv.skills = normalizeArray(raw.skills, DEFAULT_ENTRY.cv.skills);
        next.cv.languages = normalizeArray(raw.languages, DEFAULT_ENTRY.cv.languages);
        next.cv.awards = normalizeArray(raw.awards, DEFAULT_ENTRY.cv.awards);
    }

    if (newState && newState.resume && typeof newState.resume === "object") {
        const raw = newState.resume;
        next.resume.name = text(raw.name);
        next.resume.email = text(raw.email);
        next.resume.phone = text(raw.phone);
        next.resume.website = text(raw.website);
        next.resume.location = text(raw.location);
        next.resume.linkedin = text(raw.linkedin);
        next.resume.summary = text(raw.summary);
        next.resume.skills = text(raw.skills);

        next.resume.experience = normalizeArray(raw.experience, DEFAULT_ENTRY.resume.experience);
        next.resume.projects = normalizeProjects(raw.projects, DEFAULT_ENTRY.resume.projects);
        next.resume.education = normalizeArray(raw.education, DEFAULT_ENTRY.resume.education);
        next.resume.certifications = normalizeCertifications(raw.certifications, DEFAULT_ENTRY.resume.certifications);
    }

    Object.keys(S).forEach((key) => delete S[key]);
    Object.assign(S, next);
}

function normalizeArray(rawList, entryTemplate) {
    const templateKeys = Object.keys(entryTemplate);
    const source = Array.isArray(rawList) ? rawList : [];
    const cleaned = source
        .filter((item) => item && typeof item === "object")
        .map((item) => {
            const out = {};
            templateKeys.forEach((key) => {
                out[key] = text(item[key]);
            });
            return out;
        });

    return cleaned.length ? cleaned : [clone(entryTemplate)];
}

function normalizeProjects(rawList, entryTemplate) {
    const source = Array.isArray(rawList) ? rawList : [];
    const cleaned = normalizeArray(rawList, entryTemplate);
    return cleaned.map((entry, index) => {
        const raw = source[index] && typeof source[index] === "object" ? source[index] : {};
        const highlights = text(entry.highlights) || text(raw.desc);
        const link = text(entry.link) || text(raw.url) || text(raw.github) || text(raw.projectLink) || text(raw.project_url);
        return {
            ...entry,
            highlights,
            link
        };
    });
}

function normalizeCertifications(rawList, entryTemplate) {
    const source = Array.isArray(rawList) ? rawList : [];
    const cleaned = normalizeArray(rawList, entryTemplate);
    return cleaned.map((entry, index) => {
        const raw = source[index] && typeof source[index] === "object" ? source[index] : {};
        const url = text(entry.url) || text(raw.link) || text(raw.credentialUrl) || text(raw.credential_url);
        const rawOffline = text(entry.offline).trim().toLowerCase();
        const offline = (
            rawOffline === "yes"
            || rawOffline === "true"
            || rawOffline === "1"
            || rawOffline === "on"
            || raw.offline === true
            || raw.isOffline === true
            || raw.emailBased === true
            || raw.email_based === true
        ) ? "yes" : "";
        return {
            ...entry,
            url,
            offline
        };
    });
}

function defaultSlotData() {
    const slots = {};
    SLOT_IDS.forEach((slotId) => {
        slots[slotId] = { savedAt: null, data: null };
    });
    return { slots };
}

function normalizeSlotEntry(entry) {
    if (!entry || typeof entry !== "object") {
        return { savedAt: null, data: null };
    }
    return {
        savedAt: typeof entry.savedAt === "string" ? entry.savedAt : null,
        data: entry.data && typeof entry.data === "object" ? entry.data : null
    };
}

function loadSlotData() {
    const base = defaultSlotData();
    try {
        const raw = localStorage.getItem(SLOT_KEY);
        if (!raw) {
            SLOT_DATA = base;
            return;
        }
        const parsed = JSON.parse(raw);
        const source = parsed && parsed.slots && typeof parsed.slots === "object"
            ? parsed.slots
            : parsed;

        SLOT_IDS.forEach((slotId) => {
            base.slots[slotId] = normalizeSlotEntry(source && source[slotId]);
        });
        SLOT_DATA = base;
    } catch (error) {
        SLOT_DATA = base;
    }
}

function persistSlotData() {
    if (!SLOT_DATA) loadSlotData();
    try {
        localStorage.setItem(SLOT_KEY, JSON.stringify(SLOT_DATA));
    } catch (error) {
        setSaveStatus("Slot save failed", true);
    }
}

function slotLabel(slotId) {
    const index = SLOT_IDS.indexOf(normalizeSlotId(slotId));
    return `Slot ${index + 1}`;
}

function formatSlotTimestamp(value) {
    if (!value) return "Empty";
    const dateValue = new Date(value);
    if (Number.isNaN(dateValue.getTime())) return "Saved";
    return dateValue.toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function scheduleSave() {
    clearTimeout(saveTimer);
    setSaveStatus("Saving...");
    saveTimer = setTimeout(() => {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(S));
            setSaveStatus("Saved");
        } catch (error) {
            setSaveStatus("Save failed", true);
        }
    }, 240);
}

function loadSavedState() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
            applyState(parsed);
        }
    } catch (error) {
        applyState(BASE_STATE);
    }
}

function setSaveStatus(textValue, isError = false) {
    const node = document.getElementById("saveStatus");
    if (!node) return;
    node.textContent = textValue;
    node.classList.toggle("err", Boolean(isError));
    node.classList.toggle("live", textValue === "Saving...");
}

function completionPercent() {
    if (!S.mode) return 0;
    const root = S.mode === "cv" ? S.cv : S.resume;
    let filled = 0;
    let total = 0;

    function count(value) {
        total += 1;
        if (String(value || "").trim()) filled += 1;
    }

    if (S.mode === "cv") {
        [
            root.name,
            root.title,
            root.email,
            root.phone,
            root.website,
            root.location,
            root.linkedin,
            root.summary
        ].forEach(count);

        root.education.forEach((x) => [x.degree, x.institution, x.location, x.year, x.score, x.details].forEach(count));
        root.experience.forEach((x) => [x.title, x.org, x.location, x.period, x.desc].forEach(count));
        root.projects.forEach((x) => [x.name, x.tech, x.period, x.highlights].forEach(count));
        root.publications.forEach((x) => [x.title, x.venue, x.year, x.authors].forEach(count));
        root.skills.forEach((x) => [x.cat, x.items].forEach(count));
        root.languages.forEach((x) => [x.lang, x.level].forEach(count));
        root.awards.forEach((x) => [x.title, x.year, x.org].forEach(count));
    } else {
        [root.name, root.email, root.phone, root.website, root.location, root.linkedin, root.summary, root.skills].forEach(count);
        root.experience.forEach((x) => [x.title, x.company, x.location, x.period, x.bullets].forEach(count));
        root.projects.forEach((x) => [x.name, x.tech, x.period, x.highlights].forEach(count));
        root.education.forEach((x) => [x.degree, x.school, x.location, x.year, x.score].forEach(count));
        root.certifications.forEach((x) => [x.name, x.org, x.year].forEach(count));
    }

    if (!total) return 0;
    return Math.max(0, Math.min(100, Math.round((filled / total) * 100)));
}

function refreshMeta() {
    const pct = completionPercent();
    const completion = document.getElementById("completionStatus");
    if (completion) completion.textContent = `${pct}% complete`;
    const meter = document.querySelector(".chrome-meter > span");
    if (meter) meter.style.width = `${pct}%`;
}

function getA4HeightPx() {
    if (a4HeightPxCache) return a4HeightPxCache;
    const probe = document.createElement("div");
    probe.style.height = "297mm";
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    document.body.appendChild(probe);
    a4HeightPxCache = probe.getBoundingClientRect().height;
    probe.remove();
    return a4HeightPxCache;
}

function updatePageStatus() {
    const badge = document.getElementById("pageStatus");
    const sheet = document.getElementById("pp");
    if (!badge || !sheet) return;

    const pageHeightPx = getA4HeightPx();
    const pageCount = Math.max(1, Math.ceil(sheet.scrollHeight / pageHeightPx));
    badge.textContent = pageCount === 1 ? "1 page" : `${pageCount} pages`;
    badge.classList.toggle("warn", pageCount > 1);
}

function collectStrings(value, output) {
    if (typeof value === "string") {
        output.push(value);
        return;
    }
    if (Array.isArray(value)) {
        value.forEach((item) => collectStrings(item, output));
        return;
    }
    if (value && typeof value === "object") {
        Object.values(value).forEach((item) => collectStrings(item, output));
    }
}

function currentProfileText() {
    if (!S.mode) return "";
    const root = S.mode === "cv" ? S.cv : S.resume;
    const values = [];
    collectStrings(root, values);
    return tokenize(values.join(" ")).join(" ");
}

function extractJDKeywords(rawText, limit = 24) {
    const stopWords = new Set([
        "the", "and", "for", "you", "with", "that", "this", "from", "your", "are", "our", "will", "can", "not",
        "all", "any", "but", "per", "job", "role", "team", "work", "who", "what", "how", "have", "has", "had",
        "they", "their", "them", "its", "using", "use", "used", "into", "than", "then", "also", "high", "able",
        "ability", "strong", "good", "best", "nice", "must", "required", "requirement", "preferred", "plus", "etc"
    ]);

    const counts = {};
    tokenize(rawText).forEach((word) => {
        if (word.length < 3 || stopWords.has(word)) return;
        counts[word] = (counts[word] || 0) + 1;
    });

    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word]) => word);
}

function analyzeJDMatch() {
    const jdText = text(S.ui.jdText).trim();
    if (!jdText) return null;

    const keywords = extractJDKeywords(jdText);
    if (!keywords.length) {
        return { score: 0, total: 0, matched: [], missing: [] };
    }

    const corpus = ` ${currentProfileText()} `;
    const matched = keywords.filter((keyword) => corpus.includes(` ${keyword} `));
    const missing = keywords.filter((keyword) => !corpus.includes(` ${keyword} `));
    const score = Math.round((matched.length / keywords.length) * 100);

    return { score, total: keywords.length, matched, missing };
}

function jdStatusMarkup(result) {
    if (!result) {
        return `<div class="jd-empty">Paste a job description to analyze keyword match.</div>`;
    }

    const missing = result.missing.slice(0, 12);
    return `
<div class="jd-meter"><span style="width:${result.score}%"></span></div>
<div class="jd-meta">
    <strong>${result.score}% match</strong>
    <span>${result.matched.length}/${result.total} keywords found</span>
</div>
${missing.length
            ? `<div class="jd-missing">${missing.map((word) => `<span class="jd-chip">${esc(word)}</span>`).join("")}</div>`
            : `<div class="jd-ok">Great coverage. No high-signal keyword gaps detected.</div>`}
`;
}

function updateJDMatchUI() {
    const node = document.getElementById("jdStatus");
    if (!node) return;
    node.innerHTML = jdStatusMarkup(analyzeJDMatch());
}

function setJDText(value) {
    S.ui.jdText = value;
    updateJDMatchUI();
    updateAIAnalyzerUI();
    updateShareLinkUI();
    scheduleSave();
}

const AI_ACTION_VERBS = new Set([
    "achieved", "automated", "built", "created", "delivered", "designed", "developed", "drove",
    "executed", "improved", "implemented", "increased", "launched", "led", "managed", "optimized",
    "owned", "reduced", "scaled", "streamlined"
]);

const AI_WEAK_WORDS = new Set([
    "responsible", "helped", "worked", "tasked", "various", "several", "some", "many", "good",
    "hardworking", "passionate", "detail", "familiar", "exposure", "knowledge"
]);

const AI_STOP_WORDS = new Set([
    "about", "after", "again", "also", "among", "been", "before", "between", "could", "from",
    "into", "over", "than", "that", "their", "there", "these", "they", "through", "under", "very",
    "what", "when", "where", "which", "with", "would", "your", "have", "will", "were", "this",
    "using", "used", "across", "including", "while", "within"
]);

function clampScore(value) {
    return Math.max(0, Math.min(100, Math.round(value)));
}

function parseSkillItems(rawText) {
    return text(rawText)
        .split(/\n+/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function splitSentences(rawText) {
    return text(rawText)
        .split(/[.!?]+/)
        .map((part) => part.trim())
        .filter(Boolean);
}

function normalizeLine(rawText) {
    return text(rawText).replace(/^[-*]\s*/, "").replace(/\s+/g, " ").trim();
}

function topRepeatedTokens(tokens, minimumCount = 4, limit = 3) {
    const counts = {};
    tokens.forEach((token) => {
        if (token.length < 4 || AI_STOP_WORDS.has(token)) return;
        counts[token] = (counts[token] || 0) + 1;
    });

    return Object.entries(counts)
        .filter(([, count]) => count >= minimumCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([word, count]) => ({ word, count }));
}

function buildAIProfile() {
    if (!S.mode) return null;

    if (S.mode === "resume") {
        const d = S.resume;
        const experience = d.experience.filter((entry) =>
            text(entry.title).trim() || text(entry.company).trim() || text(entry.location).trim() || text(entry.bullets).trim());
        const projects = d.projects.filter((entry) =>
            text(entry.name).trim() || text(entry.tech).trim() || text(entry.period).trim() || text(entry.highlights).trim() || text(entry.link).trim());
        const bulletLines = [
            ...experience.flatMap((entry) => lines(entry.bullets)),
            ...projects.flatMap((entry) => lines(entry.highlights))
        ];
        const skills = parseSkillItems(d.skills);

        return {
            mode: "resume",
            summary: text(d.summary).trim(),
            skillItems: skills,
            bulletLines,
            primaryTitle: text(S.ui.aiRole).trim() || text(experience[0] && experience[0].title).trim() || "",
            contacts: {
                email: Boolean(text(d.email).trim()),
                phone: Boolean(text(d.phone).trim()),
                link: Boolean(text(d.website).trim() || text(d.linkedin).trim())
            },
            experienceCount: experience.length + projects.length,
            educationCount: d.education.filter((entry) => text(entry.degree).trim() || text(entry.school).trim() || text(entry.location).trim() || text(entry.score).trim()).length
        };
    }

    const d = S.cv;
    const experience = d.experience.filter((entry) =>
        text(entry.title).trim() || text(entry.org).trim() || text(entry.location).trim() || text(entry.desc).trim());
    const projects = d.projects.filter((entry) =>
        text(entry.name).trim() || text(entry.tech).trim() || text(entry.period).trim() || text(entry.highlights).trim() || text(entry.link).trim());
    const bulletLines = [
        ...experience.flatMap((entry) => {
        const fromDesc = lines(entry.desc);
        if (fromDesc.length) return fromDesc;
        return [normalizeLine(`${text(entry.title)} ${text(entry.org)} ${text(entry.location)}`)].filter(Boolean);
        }),
        ...projects.flatMap((entry) => {
            const fromDesc = lines(entry.highlights);
            if (fromDesc.length) return fromDesc;
            return [normalizeLine(`${text(entry.name)} ${text(entry.tech)} ${text(entry.link)}`)].filter(Boolean);
        })
    ];
    const skills = d.skills.flatMap((entry) => parseSkillItems(entry.items));

    return {
        mode: "cv",
        summary: text(d.summary).trim(),
        skillItems: skills,
        bulletLines,
        primaryTitle: text(S.ui.aiRole).trim() || text(d.title).trim() || text(experience[0] && experience[0].title).trim() || "",
        contacts: {
            email: Boolean(text(d.email).trim()),
            phone: Boolean(text(d.phone).trim()),
            link: Boolean(text(d.website).trim() || text(d.linkedin).trim())
        },
        experienceCount: experience.length + projects.length,
        educationCount: d.education.filter((entry) => text(entry.degree).trim() || text(entry.institution).trim() || text(entry.location).trim() || text(entry.score).trim()).length
    };
}

function buildAISummaryRewrite(profile, missingKeywords) {
    const role = profile.primaryTitle || (profile.mode === "cv" ? "research professional" : "professional");
    const topSkills = profile.skillItems.slice(0, 3);
    const skillPart = topSkills.length
        ? `in ${topSkills.join(", ")}`
        : "in delivery, execution, and continuous improvement";
    const keywordPart = missingKeywords.slice(0, 2);

    const closing = keywordPart.length
        ? ` Focused on ${keywordPart.join(" and ")} to align with target roles.`
        : "";

    return `Results-driven ${role} with proven experience ${skillPart}. Delivers measurable outcomes by leading cross-functional initiatives, improving process reliability, and raising execution quality.${closing}`;
}

function buildAIBulletRewrite(rawLine, profile) {
    const line = normalizeLine(rawLine)
        .replace(/^(responsible for|worked on|helped with|assisted with|involved in)\s+/i, "")
        .replace(/[.]+$/, "");

    const topSkill = profile.skillItems[0] || "data-driven execution";
    if (!line) {
        return `Led a high-impact initiative, improving [target metric] by [X%] through ${topSkill} and cross-functional collaboration.`;
    }

    const startsWithAction = AI_ACTION_VERBS.has(tokenize(line)[0] || "");
    if (startsWithAction) {
        return `${line}, improving [target metric] by [X%] through ${topSkill}.`;
    }

    return `Led ${line.toLowerCase()}, improving [target metric] by [X%] through ${topSkill} and stronger stakeholder alignment.`;
}

function aiScoreLabel(score) {
    if (score >= 90) return "Excellent";
    if (score >= 78) return "Strong";
    if (score >= 62) return "Good";
    return "Needs Work";
}

function analyzeAIResume() {
    const profile = buildAIProfile();
    if (!profile) return null;

    const summaryWords = tokenize(profile.summary);
    const summarySentences = splitSentences(profile.summary);
    const summaryWordCount = summaryWords.length;
    const averageSentenceLength = summaryWordCount / Math.max(1, summarySentences.length);

    const metricRegex = /(\d+%|\d+\+|\$ ?\d|\brs\.? ?\d|\b\d{2,}\b|\brevenue\b|\bcost\b|\busers?\b|\bgrowth\b|\bconversion\b|\blatency\b|\broi\b|\bctr\b|\bsla\b)/i;
    const actionCount = profile.bulletLines.filter((line) => AI_ACTION_VERBS.has(tokenize(line)[0] || "")).length;
    const metricCount = profile.bulletLines.filter((line) => metricRegex.test(line)).length;

    const combinedTokens = tokenize(`${profile.summary} ${profile.bulletLines.join(" ")}`);
    const weakWordCount = combinedTokens.filter((word) => AI_WEAK_WORDS.has(word)).length;
    const repeatedWords = topRepeatedTokens(combinedTokens);

    const jdKeywords = extractJDKeywords(text(S.ui.jdText), 16);
    const roleKeywords = tokenize(text(S.ui.aiRole)).filter((word) => word.length > 2).slice(0, 8);
    const keywordPool = Array.from(new Set([...roleKeywords, ...jdKeywords])).slice(0, 20);
    const corpus = ` ${currentProfileText()} `;
    const matchedKeywords = keywordPool.filter((word) => corpus.includes(` ${word} `));
    const missingKeywords = keywordPool.filter((word) => !corpus.includes(` ${word} `));
    const keywordCoverage = keywordPool.length ? matchedKeywords.length / keywordPool.length : 1;

    let writing = 100;
    if (!summaryWordCount) {
        writing -= 28;
    } else {
        if (summaryWordCount < 28) writing -= 18;
        if (summaryWordCount > 110) writing -= 12;
        if (averageSentenceLength > 26) writing -= 9;
        if (averageSentenceLength < 7) writing -= 5;
    }
    if (weakWordCount >= 5) writing -= Math.min(12, Math.round(weakWordCount / 2));
    if (repeatedWords.length) writing -= Math.min(9, repeatedWords.length * 3);
    writing = clampScore(writing);

    let impact = 0;
    impact += Math.min(40, profile.bulletLines.length * 8);
    impact += Math.min(30, actionCount * 8);
    impact += Math.min(30, metricCount * 12);
    impact = clampScore(impact);

    let ats = 20;
    if (profile.contacts.email) ats += 14;
    if (profile.contacts.phone) ats += 10;
    if (profile.contacts.link) ats += 8;
    ats += Math.min(22, Math.round(profile.skillItems.length * 2.2));
    ats += Math.round(keywordCoverage * 20);
    if (summaryWordCount) ats += 8;
    if (profile.experienceCount) ats += 8;
    if (profile.educationCount) ats += 6;
    ats = clampScore(ats);

    const overall = clampScore((writing * 0.35) + (impact * 0.35) + (ats * 0.30));

    const insights = [];
    const pushInsight = (level, title, detail) => {
        insights.push({ level, title, detail });
    };

    if (!profile.contacts.email || !profile.contacts.phone) {
        pushInsight("fix", "Contact details are incomplete", "Add both email and phone for recruiter callbacks.");
    }
    if (!summaryWordCount) {
        pushInsight("fix", "Summary is missing", "Write 2-3 lines that show your strengths, domain, and outcomes.");
    } else if (summaryWordCount < 28) {
        pushInsight("tip", "Summary is short", "Target 35-60 words so it reads with more authority.");
    }
    if (!profile.bulletLines.length) {
        pushInsight("fix", "Experience or project outcomes are missing", "Add achievement lines under each role or project.");
    } else {
        if (!metricCount) pushInsight("tip", "No measurable impact found", "Add percentages, cost, users, revenue, or timing outcomes.");
        if (actionCount < Math.ceil(profile.bulletLines.length * 0.5)) pushInsight("tip", "Action verbs are weak", "Start more lines with verbs like Built, Led, Improved, Optimized.");
    }
    if (profile.skillItems.length < 6) {
        pushInsight("tip", "Skill depth is low", "List 6-12 role-relevant skills to strengthen ATS matching.");
    }
    if (keywordPool.length && missingKeywords.length) {
        pushInsight("tip", "Keyword gaps detected", `Missing terms include ${missingKeywords.slice(0, 4).join(", ")}.`);
    }
    if (repeatedWords.length) {
        pushInsight("tip", "Repeated language detected", `Overused words: ${repeatedWords.map((item) => item.word).join(", ")}.`);
    }
    if (overall >= 85) {
        pushInsight("good", "Overall profile quality is strong", "Keep polishing with sharper metrics and role-specific keywords.");
    }

    const summaryRewriteNeeded = !summaryWordCount || summaryWordCount < 40 || weakWordCount >= 5;
    const summaryRewrite = summaryRewriteNeeded ? buildAISummaryRewrite(profile, missingKeywords) : "";

    const weakBulletLines = profile.bulletLines
        .filter((line) => !metricRegex.test(line) || !AI_ACTION_VERBS.has(tokenize(line)[0] || ""))
        .slice(0, 2);
    const bulletRewrites = weakBulletLines.map((line) => ({
        source: normalizeLine(line),
        rewrite: buildAIBulletRewrite(line, profile)
    }));

    return {
        overall,
        grade: aiScoreLabel(overall),
        writing,
        impact,
        ats,
        insights: insights.slice(0, 8),
        missingKeywords: missingKeywords.slice(0, 10),
        summaryRewrite,
        bulletRewrites
    };
}

function aiAnalyzerMarkup(result) {
    if (!result) return `<div class="ai-empty">Start editing to run AI analysis.</div>`;

    return `
<div class="ai-head">
    <strong>${result.overall}/100</strong>
    <span>${result.grade}</span>
</div>
<div class="ai-breakdown">
    <div class="ai-row"><label>Writing</label><div class="ai-meter"><span style="width:${result.writing}%"></span></div><b>${result.writing}</b></div>
    <div class="ai-row"><label>Impact</label><div class="ai-meter"><span style="width:${result.impact}%"></span></div><b>${result.impact}</b></div>
    <div class="ai-row"><label>ATS</label><div class="ai-meter"><span style="width:${result.ats}%"></span></div><b>${result.ats}</b></div>
</div>
${result.missingKeywords.length
            ? `<div class="ai-keys">${result.missingKeywords.map((word) => `<span class="ai-key">${esc(word)}</span>`).join("")}</div>`
            : `<div class="ai-ok">No major target-keyword gaps found.</div>`}
<div class="ai-insights">
    ${result.insights.map((item) => `
        <div class="ai-item ${item.level}">
            <strong>${esc(item.title)}</strong>
            <p>${esc(item.detail)}</p>
        </div>`).join("")}
</div>
${result.summaryRewrite
            ? `<div class="ai-rewrite"><div class="ai-rh">Suggested Summary Rewrite</div><p>${esc(result.summaryRewrite)}</p></div>`
            : ""}
${result.bulletRewrites.length
            ? `<div class="ai-rewrite"><div class="ai-rh">Suggested Bullet Rewrites</div>${result.bulletRewrites.map((item) => `<div class="ai-rline"><span class="ai-from">${esc(item.source)}</span><span class="ai-to">${esc(item.rewrite)}</span></div>`).join("")}</div>`
            : ""}
`;
}

function updateAIAnalyzerUI() {
    const node = document.getElementById("aiAnalyzer");
    if (node) {
        node.innerHTML = aiAnalyzerMarkup(analyzeAIResume());
    }

    const statusNode = document.getElementById("aiRemoteStatus");
    if (statusNode) {
        const baseText = AI_REMOTE.loading
            ? "Running OpenAI analysis..."
            : AI_REMOTE.error
                ? AI_REMOTE.error
                : (AI_REMOTE.note || "Enter API key and run OpenAI analysis.");
        statusNode.textContent = baseText;
        statusNode.classList.toggle("err", Boolean(AI_REMOTE.error));
        statusNode.classList.toggle("run", AI_REMOTE.loading);
    }

    const resultNode = document.getElementById("aiRemoteResult");
    if (resultNode) {
        resultNode.innerHTML = openAIResultMarkup(AI_REMOTE.result);
    }

    const runButton = document.getElementById("aiRunBtn");
    if (runButton) {
        runButton.disabled = AI_REMOTE.loading;
        runButton.textContent = AI_REMOTE.loading ? "Running..." : "Run OpenAI";
    }

    updateAITopCenterUI();
}

function setAIRole(value) {
    S.ui.aiRole = value;
    updateAIAnalyzerUI();
    updateShareLinkUI();
    scheduleSave();
}

function setAIModel(value) {
    S.ui.aiModel = normalizeAIModel(value);
    updateAIAnalyzerUI();
    updateShareLinkUI();
    scheduleSave();
}

function setAIApiKey(value) {
    AI_REMOTE.apiKey = text(value);
    AI_REMOTE.error = "";
    AI_REMOTE.note = "";
    try {
        if (AI_REMOTE.apiKey.trim()) {
            sessionStorage.setItem(AI_KEY_SESSION, AI_REMOTE.apiKey);
        } else {
            sessionStorage.removeItem(AI_KEY_SESSION);
        }
    } catch (error) {
        // Ignore session storage failures.
    }
    updateAIAnalyzerUI();
}

function safeJson(value) {
    if (!value || typeof value !== "object") return {};
    return value;
}

function extractErrorMessage(payload, fallback = "Request failed.") {
    const data = safeJson(payload);
    if (data.error && typeof data.error === "object") {
        if (typeof data.error.message === "string" && data.error.message.trim()) return data.error.message.trim();
        if (typeof data.error.code === "string" && data.error.code.trim()) return data.error.code.trim();
    }
    if (typeof data.message === "string" && data.message.trim()) return data.message.trim();
    return fallback;
}

function extractResponsesText(payload) {
    const data = safeJson(payload);
    if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text.trim();

    if (Array.isArray(data.output)) {
        const parts = [];
        data.output.forEach((item) => {
            if (!item || typeof item !== "object" || !Array.isArray(item.content)) return;
            item.content.forEach((content) => {
                if (!content || typeof content !== "object") return;
                if (typeof content.text === "string") parts.push(content.text);
            });
        });
        const combined = parts.join("\n").trim();
        if (combined) return combined;
    }

    return "";
}

function extractChatCompletionText(payload) {
    const data = safeJson(payload);
    if (!Array.isArray(data.choices) || !data.choices.length) return "";
    const message = data.choices[0] && data.choices[0].message;
    if (!message) return "";
    if (typeof message.content === "string") return message.content.trim();
    if (Array.isArray(message.content)) {
        const combined = message.content
            .map((part) => (part && typeof part.text === "string" ? part.text : ""))
            .join("\n")
            .trim();
        return combined;
    }
    return "";
}

function extractJSONBlock(rawText) {
    const source = text(rawText).trim();
    if (!source) return "";

    const codeBlockMatch = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = codeBlockMatch ? codeBlockMatch[1].trim() : source;
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return candidate;
    return candidate.slice(start, end + 1);
}

function toStringList(value, limit = 8) {
    if (!Array.isArray(value)) return [];
    return value
        .map((item) => text(item).trim())
        .filter(Boolean)
        .slice(0, limit);
}

function normalizeOpenAIAnalysis(raw) {
    if (!raw || typeof raw !== "object") throw new Error("OpenAI response was not valid JSON.");

    const scoreValue = Number(raw.overall_score);
    const overallScore = Number.isFinite(scoreValue) ? clampScore(scoreValue) : null;
    const strengths = toStringList(raw.strengths, 6);
    const gaps = toStringList(raw.gaps, 8);
    const missingKeywords = toStringList(raw.ats_keywords_missing, 12);
    const nextActions = toStringList(raw.next_actions, 6);
    const summaryRewrite = text(raw.summary_rewrite).trim();

    const bulletRewrites = Array.isArray(raw.bullet_rewrites)
        ? raw.bullet_rewrites
            .filter((item) => item && typeof item === "object")
            .map((item) => ({
                original: text(item.original).trim(),
                rewrite: text(item.rewrite).trim()
            }))
            .filter((item) => item.original || item.rewrite)
            .slice(0, 4)
        : [];

    return {
        overallScore,
        strengths,
        gaps,
        missingKeywords,
        summaryRewrite,
        bulletRewrites,
        nextActions
    };
}

function parseOpenAIAnalysisText(rawText) {
    const jsonBlock = extractJSONBlock(rawText);
    const parsed = JSON.parse(jsonBlock);
    return normalizeOpenAIAnalysis(parsed);
}

function buildOpenAIAnalyzerPrompt() {
    const profile = buildAIProfile();
    if (!profile) return "";

    const promptPayload = {
        document_type: profile.mode === "cv" ? "cv" : "resume",
        target_role: text(S.ui.aiRole).trim(),
        target_job_description: text(S.ui.jdText).trim().slice(0, 6000),
        summary: profile.summary,
        key_skills: profile.skillItems.slice(0, 20),
        experience_lines: profile.bulletLines.slice(0, 20)
    };

    return JSON.stringify(promptPayload, null, 2);
}

function systemAnalyzerPrompt() {
    return [
        "You are a senior resume coach and ATS evaluator.",
        "Evaluate the input and return ONLY valid JSON with this schema:",
        "{",
        '  "overall_score": number,',
        '  "strengths": string[],',
        '  "gaps": string[],',
        '  "ats_keywords_missing": string[],',
        '  "summary_rewrite": string,',
        '  "bullet_rewrites": [{"original": string, "rewrite": string}],',
        '  "next_actions": string[]',
        "}",
        "Rules:",
        "- Use concise, specific, professional language.",
        "- Keep bullet rewrites results-focused with metrics placeholders when needed.",
        "- Return no markdown, no commentary, no extra keys."
    ].join("\n");
}

async function requestOpenAIAnalysis(apiKey, model, userPrompt) {
    const sys = systemAnalyzerPrompt();
    const requestBody = {
        apiKey,
        model,
        prompt: userPrompt,
        systemPrompt: sys
    };

    const proxyCandidates = [];
    const sameOrigin = `${window.location.origin}${OPENAI_PROXY_PATH}`;
    proxyCandidates.push(sameOrigin);
    [
        `http://127.0.0.1:${OPENAI_PROXY_LOCAL_PORT}${OPENAI_PROXY_PATH}`,
        `http://localhost:${OPENAI_PROXY_LOCAL_PORT}${OPENAI_PROXY_PATH}`
    ].forEach((url) => {
        if (!proxyCandidates.includes(url)) proxyCandidates.push(url);
    });

    let lastProxyError = "";

    for (const endpoint of proxyCandidates) {
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody)
            });

            const contentType = text(response.headers.get("content-type")).toLowerCase();
            const looksJson = contentType.includes("application/json");
            const payload = looksJson ? await response.json().catch(() => ({})) : {};

            if (!response.ok) {
                const message = extractErrorMessage(payload, `Proxy request failed (${response.status}).`);
                if (response.status === 404 && endpoint === sameOrigin) {
                    lastProxyError = message;
                    continue;
                }
                throw new Error(message);
            }

            if (!looksJson) {
                if (endpoint === sameOrigin) {
                    lastProxyError = "Proxy route returned non-JSON response.";
                    continue;
                }
                throw new Error("Proxy returned an unexpected response format.");
            }

            const outputText = text(payload.output_text || payload.text).trim();
            if (!outputText) throw new Error(extractErrorMessage(payload, "OpenAI returned an empty analysis."));
            return outputText;
        } catch (error) {
            if (endpoint === sameOrigin) {
                lastProxyError = error && error.message ? error.message : "Proxy request failed.";
                continue;
            }
            throw error;
        }
    }

    const suffix = lastProxyError ? ` Last error: ${lastProxyError}` : "";
    throw new Error(`Local OpenAI proxy not reachable. Start server with: node server.js.${suffix}`);
}

function openAIResultMarkup(result) {
    if (!result) {
        return `<div class="ai-remote-empty">No OpenAI result yet. Run analysis to get role-specific rewrites.</div>`;
    }

    return `
<div class="ai-remote-card">
    ${result.overallScore !== null ? `<div class="ai-remote-score">OpenAI Score: <strong>${result.overallScore}/100</strong></div>` : ""}
    ${result.strengths.length ? `<div class="ai-remote-block"><h4>Strengths</h4><ul>${result.strengths.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>` : ""}
    ${result.gaps.length ? `<div class="ai-remote-block"><h4>Gaps</h4><ul>${result.gaps.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>` : ""}
    ${result.missingKeywords.length ? `<div class="ai-remote-keys">${result.missingKeywords.map((word) => `<span class="ai-key">${esc(word)}</span>`).join("")}</div>` : ""}
    ${result.summaryRewrite ? `<div class="ai-rewrite"><div class="ai-rh">OpenAI Summary Rewrite</div><p>${esc(result.summaryRewrite)}</p></div>` : ""}
    ${result.bulletRewrites.length ? `<div class="ai-rewrite"><div class="ai-rh">OpenAI Bullet Rewrites</div>${result.bulletRewrites.map((item) => `<div class="ai-rline"><span class="ai-from">${esc(item.original)}</span><span class="ai-to">${esc(item.rewrite)}</span></div>`).join("")}</div>` : ""}
    ${result.nextActions.length ? `<div class="ai-remote-block"><h4>Next Actions</h4><ul>${result.nextActions.map((item) => `<li>${esc(item)}</li>`).join("")}</ul></div>` : ""}
</div>`;
}

async function runOpenAIAnalyzer() {
    if (AI_REMOTE.loading) return;

    if (!S.mode) {
        AI_REMOTE.error = "Pick Resume or CV before running OpenAI analysis.";
        AI_REMOTE.note = "";
        updateAIAnalyzerUI();
        return;
    }

    const apiKey = text(AI_REMOTE.apiKey).trim();
    if (!apiKey) {
        AI_REMOTE.error = "Enter your OpenAI API key.";
        AI_REMOTE.note = "";
        updateAIAnalyzerUI();
        return;
    }

    const prompt = buildOpenAIAnalyzerPrompt();
    if (!prompt) {
        AI_REMOTE.error = "Add some profile content before running analysis.";
        AI_REMOTE.note = "";
        updateAIAnalyzerUI();
        return;
    }

    AI_REMOTE.loading = true;
    AI_REMOTE.error = "";
    AI_REMOTE.note = "Calling OpenAI...";
    updateAIAnalyzerUI();

    try {
        const model = normalizeAIModel(S.ui.aiModel);
        const responseText = await requestOpenAIAnalysis(apiKey, model, prompt);
        AI_REMOTE.result = parseOpenAIAnalysisText(responseText);
        AI_REMOTE.note = "OpenAI analysis updated.";
    } catch (error) {
        AI_REMOTE.error = error && error.message ? error.message : "OpenAI analysis failed.";
    } finally {
        AI_REMOTE.loading = false;
        updateAIAnalyzerUI();
    }
}

function lines(value) {
    return text(value)
        .split(/\n+/)
        .map((line) => line.trim())
        .filter(Boolean);
}

function scoreLabel(score) {
    if (score >= 85) return "Strong";
    if (score >= 70) return "Good";
    if (score >= 55) return "Fair";
    return "Needs Work";
}

function analyzeQualityHints() {
    if (!S.mode) return null;
    const hints = [];
    let score = 100;

    function addHint(level, message, penalty = 0) {
        hints.push({ level, message });
        score -= penalty;
    }

    if (S.mode === "resume") {
        const d = S.resume;
        const summaryWords = tokenize(d.summary).length;
        const entries = d.experience.filter((entry) => text(entry.title).trim() || text(entry.company).trim() || text(entry.location).trim() || text(entry.bullets).trim());
        const projectEntries = d.projects.filter((entry) => text(entry.name).trim() || text(entry.tech).trim() || text(entry.period).trim() || text(entry.highlights).trim() || text(entry.link).trim());
        const skillCount = text(d.skills).split(/\n+/).map((item) => item.trim()).filter(Boolean).length;

        if (!text(d.email).trim()) addHint("fix", "Add an email address so recruiters can contact you quickly.", 14);
        if (!text(d.phone).trim()) addHint("fix", "Add a phone number for direct callbacks.", 10);

        if (!text(d.summary).trim()) {
            addHint("fix", "Add a 2-3 sentence summary with role focus and strongest outcomes.", 14);
        } else if (summaryWords < 25) {
            addHint("fix", "Summary is short. Aim for around 35-60 words.", 10);
        } else if (summaryWords > 95) {
            addHint("tip", "Summary is long. Tighten it for faster skimming.", 5);
        } else {
            addHint("good", "Summary length is in a strong range.");
        }

        if (!entries.length && !projectEntries.length) {
            addHint("fix", "Add at least one experience or project entry.", 18);
        } else {
            const bulletLines = [];
            entries.forEach((entry) => bulletLines.push(...lines(entry.bullets)));
            projectEntries.forEach((entry) => bulletLines.push(...lines(entry.highlights)));

            if (bulletLines.length < 3) {
                addHint("fix", "Add more impact bullets across experience/projects (at least 3 total).", 12);
            }

            const metricRegex = /(\d+%|\d+\+|\$ ?\d|\brs\.? ?\d|\b\d{2,}\b|\brevenue\b|\bcost\b|\busers?\b|\bgrowth\b|\bconversion\b|\blatency\b)/i;
            const actionRegex = /^(achieved|built|created|delivered|designed|drove|implemented|improved|increased|launched|led|managed|optimized|reduced|scaled|streamlined|spearheaded|owned)\b/i;
            const metricCount = bulletLines.filter((line) => metricRegex.test(line)).length;
            const actionCount = bulletLines.filter((line) => actionRegex.test(line)).length;

            if (bulletLines.length && metricCount === 0) {
                addHint("tip", "Add measurable results to bullets (% , $, time, volume).", 6);
            } else if (metricCount >= 2) {
                addHint("good", "Experience and project bullets include measurable impact.");
            }

            if (bulletLines.length && actionCount < Math.ceil(bulletLines.length * 0.5)) {
                addHint("tip", "Start more bullets with strong action verbs.", 5);
            }
        }

        if (skillCount < 6) addHint("tip", "List 6-12 relevant skills for stronger ATS matching.", 6);
        if (!text(d.linkedin).trim() && !text(d.website).trim()) addHint("tip", "Add LinkedIn or portfolio link to increase credibility.", 4);

        const pageNode = document.getElementById("pageStatus");
        if (pageNode && /^([2-9]|\d{2,}) pages$/i.test(text(pageNode.textContent).trim())) {
            addHint("tip", "Resume is over one page. Trim lower-priority lines for tighter delivery.", 4);
        }
    } else {
        const d = S.cv;
        const summaryWords = tokenize(d.summary).length;
        const educationCount = d.education.filter((entry) => text(entry.degree).trim() || text(entry.institution).trim() || text(entry.location).trim() || text(entry.score).trim()).length;
        const experienceCount = d.experience.filter((entry) => text(entry.title).trim() || text(entry.org).trim() || text(entry.location).trim() || text(entry.desc).trim()).length;
        const projectCount = d.projects.filter((entry) => text(entry.name).trim() || text(entry.tech).trim() || text(entry.period).trim() || text(entry.highlights).trim() || text(entry.link).trim()).length;
        const publicationCount = d.publications.filter((entry) => text(entry.title).trim()).length;
        const skillCount = d.skills.reduce((count, entry) => {
            const items = text(entry.items).split(",").map((item) => item.trim()).filter(Boolean);
            return count + items.length;
        }, 0);

        if (!text(d.email).trim()) addHint("fix", "Add an academic/professional email contact.", 12);
        if (!text(d.name).trim()) addHint("fix", "Add your full name in the identity section.", 10);

        if (!text(d.summary).trim()) {
            addHint("fix", "Add a concise research summary to anchor your CV.", 12);
        } else if (summaryWords < 30) {
            addHint("tip", "Summary can be stronger with methods, domain, and impact keywords.", 6);
        } else {
            addHint("good", "Summary has enough depth for first-pass review.");
        }

        if (!educationCount) addHint("fix", "Add at least one education entry.", 16);
        if (!experienceCount && !projectCount) addHint("fix", "Add at least one experience or project entry.", 14);
        if (!publicationCount) addHint("tip", "Include publications/preprints if available for academic roles.", 6);
        if (skillCount < 6) addHint("tip", "Expand skills and tools to improve keyword coverage.", 5);

        const missingPubMeta = d.publications
            .filter((entry) => text(entry.title).trim())
            .filter((entry) => !text(entry.year).trim() || !text(entry.venue).trim()).length;
        if (missingPubMeta) {
            addHint("tip", "Add venue and year for each publication entry.", 4);
        }
    }

    score = Math.max(0, Math.round(score));
    if (!hints.length) {
        hints.push({ level: "good", message: "Content looks complete." });
    }

    return {
        score,
        label: scoreLabel(score),
        hints: hints.slice(0, 8)
    };
}

function qualityHintsMarkup(result) {
    if (!result) return `<div class="quality-empty">Start editing to see content quality hints.</div>`;
    return `
<div class="quality-head">
    <strong>${result.score}/100</strong>
    <span>${result.label}</span>
</div>
<div class="quality-meter"><span style="width:${result.score}%"></span></div>
<div class="quality-list">
    ${result.hints.map((hint) => `
        <div class="quality-item ${hint.level}">
            <span class="quality-pill">${hint.level === "fix" ? "Fix" : hint.level === "tip" ? "Improve" : "Good"}</span>
            <p>${esc(hint.message)}</p>
        </div>
    `).join("")}
</div>
`;
}

function updateQualityHintsUI() {
    const node = document.getElementById("qualityHints");
    if (!node) return;
    node.innerHTML = qualityHintsMarkup(analyzeQualityHints());
}

function slotStatusMarkup() {
    if (!SLOT_DATA) loadSlotData();
    return `
<div class="slot-grid">
    ${SLOT_IDS.map((slotId, index) => {
        const entry = SLOT_DATA.slots[slotId];
        const active = slotId === normalizeSlotId(S.ui.activeSlot);
        const stamp = entry && entry.data ? `Saved ${formatSlotTimestamp(entry.savedAt)}` : "Empty";
        return `
        <button type="button" class="slot-chip ${active ? "active" : ""}" onclick="setActiveSlot('${slotId}')">
            <span>Slot ${index + 1}</span>
            <small>${esc(stamp)}</small>
        </button>`;
    }).join("")}
</div>
<div class="slot-active">Active draft: ${slotLabel(S.ui.activeSlot)}</div>
`;
}

function updateSlotStatusUI() {
    const node = document.getElementById("slotStatus");
    if (!node) return;
    node.innerHTML = slotStatusMarkup();
}

function setActiveSlot(slotId) {
    S.ui.activeSlot = normalizeSlotId(slotId);
    updateSlotStatusUI();
    updateShareLinkUI();
    scheduleSave();
}

function saveToActiveSlot() {
    if (!SLOT_DATA) loadSlotData();
    const slotId = normalizeSlotId(S.ui.activeSlot);
    SLOT_DATA.slots[slotId] = {
        savedAt: new Date().toISOString(),
        data: clone(S)
    };
    persistSlotData();
    updateSlotStatusUI();
    setSaveStatus(`${slotLabel(slotId)} saved`);
    setTimeout(() => setSaveStatus("Saved"), 1000);
}

function loadFromActiveSlot() {
    if (!SLOT_DATA) loadSlotData();
    const slotId = normalizeSlotId(S.ui.activeSlot);
    const entry = SLOT_DATA.slots[slotId];
    if (!entry || !entry.data) {
        setSaveStatus(`${slotLabel(slotId)} is empty`, true);
        setTimeout(() => setSaveStatus("Saved"), 1300);
        return;
    }

    applyState(entry.data);
    UI.mobilePane = "form";
    render();
    scheduleSave();
    setSaveStatus(`${slotLabel(slotId)} loaded`);
    setTimeout(() => setSaveStatus("Saved"), 1000);
}

function clearActiveSlot() {
    if (!SLOT_DATA) loadSlotData();
    const slotId = normalizeSlotId(S.ui.activeSlot);
    const shouldClear = window.confirm(`Clear ${slotLabel(slotId)}?`);
    if (!shouldClear) return;

    SLOT_DATA.slots[slotId] = { savedAt: null, data: null };
    persistSlotData();
    updateSlotStatusUI();
    setSaveStatus(`${slotLabel(slotId)} cleared`);
    setTimeout(() => setSaveStatus("Saved"), 1000);
}

function encodeStateToken(state) {
    try {
        const raw = JSON.stringify(state);
        const bytes = new TextEncoder().encode(raw);
        let binary = "";
        bytes.forEach((byte) => {
            binary += String.fromCharCode(byte);
        });
        return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    } catch (error) {
        return "";
    }
}

function decodeStateToken(token) {
    const normalized = text(token).replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const raw = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
}

function generateShareLink() {
    const token = encodeStateToken(S);
    if (!token) return "";
    const link = new URL(window.location.href);
    link.searchParams.set("folio", token);
    return link.toString();
}

function setShareStatus(message, isError = false) {
    const node = document.getElementById("shareStatus");
    if (!node) return;
    node.textContent = message;
    node.classList.toggle("err", Boolean(isError));
}

function updateShareLinkUI() {
    const input = document.getElementById("shareLink");
    if (!input) return;
    const link = generateShareLink();
    input.value = link;

    const meta = document.getElementById("shareMeta");
    if (meta) {
        const len = link.length;
        meta.textContent = len
            ? `Length: ${len} chars${len > 1800 ? " - long links may fail in some apps." : ""}`
            : "Link unavailable";
        meta.classList.toggle("warn", len > 1800);
    }
}

function refreshShareLink() {
    updateShareLinkUI();
    setShareStatus("Share link refreshed.");
}

async function copyShareLink() {
    const link = generateShareLink();
    if (!link) {
        setShareStatus("Unable to generate link.", true);
        return;
    }

    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(link);
        } else {
            const input = document.getElementById("shareLink");
            if (!input) throw new Error("Share input missing");
            input.focus();
            input.select();
            const ok = document.execCommand("copy");
            if (!ok) throw new Error("Copy command failed");
            input.setSelectionRange(0, 0);
            input.blur();
        }
        setShareStatus("Share link copied.");
    } catch (error) {
        setShareStatus("Copy failed. Copy the link field manually.", true);
    }
}

function tryLoadStateFromQuery() {
    let token = "";
    try {
        token = new URL(window.location.href).searchParams.get("folio") || "";
    } catch (error) {
        return false;
    }
    if (!token) return false;

    try {
        const parsed = decodeStateToken(token);
        if (!parsed) return false;
        applyState(parsed);
        return true;
    } catch (error) {
        return false;
    }
}

function setTemplatePreset(value) {
    S.ui.templatePreset = normalizeTemplatePreset(value);
    render();
    scheduleSave();
}

function toggleATSMode() {
    S.ui.atsMode = !S.ui.atsMode;
    render();
    scheduleSave();
}

function up() {
    const preview = document.getElementById("pp");
    if (preview) preview.innerHTML = S.mode === "cv" ? cvPrev() : resPrev();
    refreshMeta();
    updateJDMatchUI();
    updateAIAnalyzerUI();
    updateSlotStatusUI();
    updateShareLinkUI();
    scheduleSave();
    window.requestAnimationFrame(() => {
        updatePageStatus();
        updateQualityHintsUI();
        updateAITopCenterUI();
    });
}

function getEditorScrollTop() {
    const panel = document.getElementById("fp");
    return panel ? panel.scrollTop : 0;
}

function restoreEditorScrollTop(value) {
    const panel = document.getElementById("fp");
    if (!panel) return;
    panel.scrollTop = Number.isFinite(value) ? Math.max(0, value) : 0;
}

function addItem(mode, key) {
    const editorScrollTop = getEditorScrollTop();
    S[mode][key].push(clone(DEFAULT_ENTRY[mode][key]));
    render({ preserveEditorScrollTop: true, editorScrollTop });
    scheduleSave();
}

function removeItem(mode, key, index) {
    if (S[mode][key].length <= 1) return;
    const editorScrollTop = getEditorScrollTop();
    S[mode][key].splice(index, 1);
    render({ preserveEditorScrollTop: true, editorScrollTop });
    scheduleSave();
}

function resetDragState() {
    DRAG_STATE.mode = "";
    DRAG_STATE.key = "";
    DRAG_STATE.from = -1;
}

function clearDragClasses() {
    document.querySelectorAll(".entry.dragging, .entry.drag-over").forEach((node) => {
        node.classList.remove("dragging");
        node.classList.remove("drag-over");
    });
}

function canReorder(mode, key) {
    return DRAG_STATE.from >= 0 && DRAG_STATE.mode === mode && DRAG_STATE.key === key;
}

function dragStartItem(mode, key, index, event) {
    DRAG_STATE.mode = mode;
    DRAG_STATE.key = key;
    DRAG_STATE.from = Number(index);

    if (event && event.dataTransfer) {
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", `${mode}:${key}:${index}`);
    }

    const entry = event && event.target ? event.target.closest(".entry") : null;
    if (entry) entry.classList.add("dragging");
}

function dragOverItem(mode, key, index, event) {
    if (!canReorder(mode, key) || DRAG_STATE.from === Number(index)) return;
    if (event) {
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    }
    const entry = event && event.currentTarget ? event.currentTarget : null;
    if (entry) entry.classList.add("drag-over");
}

function dragLeaveItem(event) {
    const entry = event && event.currentTarget ? event.currentTarget : null;
    if (entry) entry.classList.remove("drag-over");
}

function dragEndItem() {
    clearDragClasses();
    resetDragState();
}

function dropReorderItem(mode, key, toIndex, event) {
    if (!canReorder(mode, key)) return;
    if (event) event.preventDefault();

    const fromIndex = DRAG_STATE.from;
    const targetIndex = Number(toIndex);
    clearDragClasses();

    const list = S[mode] && S[mode][key];
    if (!Array.isArray(list)) {
        resetDragState();
        return;
    }
    if (
        !Number.isInteger(fromIndex) ||
        !Number.isInteger(targetIndex) ||
        fromIndex < 0 ||
        targetIndex < 0 ||
        fromIndex >= list.length ||
        targetIndex >= list.length ||
        fromIndex === targetIndex
    ) {
        resetDragState();
        return;
    }

    const editorScrollTop = getEditorScrollTop();
    const [moved] = list.splice(fromIndex, 1);
    list.splice(targetIndex, 0, moved);
    render({ preserveEditorScrollTop: true, editorScrollTop });
    scheduleSave();
    resetDragState();
}

function setMode(mode) {
    S.mode = mode;
    UI.mobilePane = "form";
    UI.aiPopupOpen = false;
    render();
    scheduleSave();
}

function setMobilePane(pane) {
    UI.mobilePane = pane === "preview" ? "preview" : "form";
    render();
}

function printCurrentWindow() {
    if (!S.mode) return;

    const isMobile = window.matchMedia("(max-width: 820px)").matches;
    if (isMobile) {
        printRestorePane = UI.mobilePane;
        UI.mobilePane = "preview";
        render();
    }

    window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
            window.print();
        });
    });
}

function printStylesMarkup() {
    return Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'))
        .map((link) => `<link rel="stylesheet" href="${esc(link.href)}">`)
        .join("");
}

function printSheetMarkup() {
    if (!S.mode) return "";
    const preset = normalizeTemplatePreset(S.ui.templatePreset);
    const previewMarkup = S.mode === "cv" ? cvPrev() : resPrev();
    return `<div class="doc-wrap"><div class="doc-sheet tpl-${preset}${S.ui.atsMode ? " ats-mode" : ""}" id="pp">${previewMarkup}</div></div>`;
}

function printDocument() {
    if (!S.mode) return;

    const modeData = S.mode === "cv" ? S.cv : S.resume;
    const personName = text(modeData && modeData.name).trim();
    const kind = S.mode === "cv" ? "CV" : "Resume";
    const title = personName ? `${personName} - ${kind}` : `${kind} Export`;

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${esc(title)}</title>
  <base href="${esc(window.location.href)}">
  ${printStylesMarkup()}
  <style>
    html, body { margin: 0; padding: 0; background: #fff; }
    .doc-wrap { width: 100%; display: block; }
    .doc-sheet { width: 100%; margin: 0 !important; box-shadow: none !important; border: none !important; min-height: 0 !important; }
    .doc a, .doc a:visited { color: #2563eb; }
    .doc-c-link, .doc-c-link:visited { color: inherit; }
    @page { size: A4; margin: 0; }
    @media print { .doc { padding: 15mm 20mm !important; } }
  </style>
</head>
<body>
  ${printSheetMarkup()}
</body>
</html>`;

    const frame = document.createElement("iframe");
    frame.setAttribute("aria-hidden", "true");
    frame.tabIndex = -1;
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    frame.style.opacity = "0";
    frame.style.pointerEvents = "none";
    document.body.appendChild(frame);

    let cleaned = false;
    const cleanup = () => {
        if (cleaned) return;
        cleaned = true;
        if (frame.parentNode) frame.parentNode.removeChild(frame);
    };

    const failToCurrentWindow = () => {
        cleanup();
        printCurrentWindow();
    };

    const fallbackTimer = window.setTimeout(() => {
        cleanup();
    }, 120000);

    frame.onload = () => {
        const win = frame.contentWindow;
        if (!win) {
            window.clearTimeout(fallbackTimer);
            failToCurrentWindow();
            return;
        }

        const handleAfterPrint = () => {
            win.removeEventListener("afterprint", handleAfterPrint);
            window.clearTimeout(fallbackTimer);
            cleanup();
        };

        win.addEventListener("afterprint", handleAfterPrint);
        win.focus();
        win.requestAnimationFrame(() => {
            win.requestAnimationFrame(() => {
                win.print();
            });
        });
    };

    const frameDoc = frame.contentWindow && frame.contentWindow.document;
    if (!frameDoc) {
        window.clearTimeout(fallbackTimer);
        failToCurrentWindow();
        return;
    }

    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();
}

function resetAllData() {
    const okay = window.confirm("Clear all data and start over?");
    if (!okay) return;
    applyState(BASE_STATE);
    S.mode = null;
    UI.mobilePane = "form";
    UI.aiPopupOpen = false;
    localStorage.removeItem(STORE_KEY);
    render();
}

function exportJSON() {
    try {
        const blob = new Blob([JSON.stringify(S, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `folio-${S.mode || "draft"}-${new Date().toISOString().slice(0, 10)}.json`;
        anchor.click();
        URL.revokeObjectURL(url);
        setSaveStatus("JSON exported");
        setTimeout(() => setSaveStatus("Saved"), 1200);
    } catch (error) {
        setSaveStatus("Export failed", true);
    }
}

function importJSON() {
    importInput.click();
}

importInput.addEventListener("change", async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    try {
        const textContent = await file.text();
        const parsed = JSON.parse(textContent);
        applyState(parsed);
        render();
        scheduleSave();
        setSaveStatus("Imported");
        setTimeout(() => setSaveStatus("Saved"), 1200);
    } catch (error) {
        setSaveStatus("Import failed", true);
        setTimeout(() => setSaveStatus("Saved"), 1500);
    } finally {
        importInput.value = "";
    }
});

function render(options = {}) {
    const preserveEditorScrollTop = Boolean(options.preserveEditorScrollTop);
    const editorScrollTop = preserveEditorScrollTop ? options.editorScrollTop : 0;
    if (!S.mode) {
        UI.aiPopupOpen = false;
    }
    app.innerHTML = S.mode ? builderH() : pickerH();
    if (S.mode) {
        refreshMeta();
        updateJDMatchUI();
        updateAIAnalyzerUI();
        updateSlotStatusUI();
        updateShareLinkUI();
        if (preserveEditorScrollTop) {
            restoreEditorScrollTop(editorScrollTop);
        }
        window.requestAnimationFrame(() => {
            updatePageStatus();
            updateQualityHintsUI();
            updateAITopCenterUI();
        });
        setSaveStatus("Saved");
    }
}

function aiTaskPriorityWeight(priority) {
    if (priority === "high") return 0;
    if (priority === "med") return 1;
    return 2;
}

function buildAITaskList() {
    if (!S.mode) return [];

    const tasks = [];
    const local = analyzeAIResume();
    const quality = analyzeQualityHints();
    const jd = analyzeJDMatch();
    const remote = AI_REMOTE.result;

    if (local) {
        if (local.overall < 78) {
            tasks.push({
                priority: "high",
                source: "Local AI",
                text: `Raise local AI score to 78+ (current ${local.overall}).`
            });
        }

        local.insights
            .filter((item) => item.level === "fix" || item.level === "tip")
            .slice(0, 3)
            .forEach((item) => {
                tasks.push({
                    priority: item.level === "fix" ? "high" : "med",
                    source: "Local AI",
                    text: item.title
                });
            });

        if (local.missingKeywords.length) {
            tasks.push({
                priority: "med",
                source: "Local AI",
                text: `Add missing keywords: ${local.missingKeywords.slice(0, 3).join(", ")}.`
            });
        }
    }

    if (quality) {
        if (quality.score < 80) {
            tasks.push({
                priority: "med",
                source: "Quality",
                text: `Improve quality score to 80+ (current ${quality.score}).`
            });
        }

        quality.hints
            .filter((item) => item.level === "fix" || item.level === "tip")
            .slice(0, 2)
            .forEach((item) => {
                tasks.push({
                    priority: item.level === "fix" ? "high" : "med",
                    source: "Quality",
                    text: item.message
                });
            });
    }

    if (jd && jd.missing.length) {
        tasks.push({
            priority: "med",
            source: "JD Match",
            text: `Cover these JD terms: ${jd.missing.slice(0, 3).join(", ")}.`
        });
    }

    if (remote) {
        remote.gaps.slice(0, 2).forEach((gap) => {
            tasks.push({
                priority: "high",
                source: "OpenAI",
                text: gap
            });
        });
        remote.nextActions.slice(0, 3).forEach((action) => {
            tasks.push({
                priority: "med",
                source: "OpenAI",
                text: action
            });
        });
    }

    const seen = new Set();
    const deduped = tasks.filter((task) => {
        const key = text(task.text).toLowerCase().trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });

    return deduped
        .sort((a, b) => aiTaskPriorityWeight(a.priority) - aiTaskPriorityWeight(b.priority))
        .slice(0, 8);
}

function aiTopStripMarkup() {
    const local = analyzeAIResume();
    const quality = analyzeQualityHints();
    const jd = analyzeJDMatch();
    const remote = AI_REMOTE.result;
    const tasks = buildAITaskList();

    const localScore = local ? local.overall : null;
    const qualityScore = quality ? quality.score : null;
    const jdScore = jd ? jd.score : null;
    const openAIScore = remote && remote.overallScore !== null ? remote.overallScore : null;

    return `
<div class="ai-top-head">
    <div>
        <h3>AI Copilot Center</h3>
        <p>Top AI suggestions and tasks in one place.</p>
    </div>
    <span class="ai-top-count">${tasks.length} tasks</span>
</div>
<div class="ai-top-metrics">
    <div class="ai-top-card"><span>Local AI</span><strong>${localScore !== null ? `${localScore}` : "--"}</strong></div>
    <div class="ai-top-card"><span>Quality</span><strong>${qualityScore !== null ? `${qualityScore}` : "--"}</strong></div>
    <div class="ai-top-card"><span>JD Match</span><strong>${jdScore !== null ? `${jdScore}` : "--"}</strong></div>
    <div class="ai-top-card"><span>OpenAI</span><strong>${openAIScore !== null ? `${openAIScore}` : "--"}</strong></div>
</div>
<div class="ai-top-list">
    ${tasks.length
            ? tasks.map((task) => `
                <div class="ai-top-task ${task.priority}">
                    <span class="ai-top-dot"></span>
                    <div>
                        <strong>${esc(task.text)}</strong>
                        <small>${esc(task.source)}</small>
                    </div>
                </div>
            `).join("")
            : `<div class="ai-top-empty">No pending AI tasks. Continue refining and rerun OpenAI for deeper suggestions.</div>`}
</div>
`;
}

function updateAITopCenterUI() {
    const node = document.getElementById("aiTopCenterBody");
    if (!node) return;
    node.innerHTML = aiTopStripMarkup();
}

function toggleAIPopup(forceOpen) {
    if (!S.mode) return;
    const next = typeof forceOpen === "boolean" ? forceOpen : !UI.aiPopupOpen;
    if (UI.aiPopupOpen === next) return;
    UI.aiPopupOpen = next;
    render();
}

function onAIPopupBackdropClick(event) {
    if (event && event.target === event.currentTarget) {
        toggleAIPopup(false);
    }
}

function switchAITab(tabId) {
    UI.aiTab = tabId;
    const tabs = document.querySelectorAll('.ai-tab-btn');
    tabs.forEach((t) => t.classList.toggle('active', t.dataset.tab === tabId));
    const panes = document.querySelectorAll('.ai-tab-pane');
    panes.forEach((p) => p.classList.toggle('active', p.dataset.tab === tabId));
}

function toolsPanel() {
    const aiTaskCount = buildAITaskList().length;
    return `
<div class="fsec toolsec ai-launch">
    <div class="ai-launch-info">
        <div class="flbl">AI Copilot Center</div>
        <p class="tool-note">Open a popup with all AI-driven priorities, gaps, and next tasks.</p>
    </div>
    <button class="cbtn hi" onclick="toggleAIPopup(true)">Open Copilot (${aiTaskCount})</button>
</div>

<div class="ai-pop${UI.aiPopupOpen ? " open" : ""}" onclick="onAIPopupBackdropClick(event)">
    <div class="ai-pop-panel" role="dialog" aria-modal="true" aria-label="AI Copilot Center">
        <div class="ai-pop-header">
            <div class="ai-pop-bar">
                <div>
                    <strong>AI Copilot Center</strong>
                    <span class="ai-pop-bar-sub">Your intelligent resume assistant</span>
                </div>
                <button class="cbtn ai-close-btn" aria-label="Close" title="Close" onclick="toggleAIPopup(false)">${I.x}</button>
            </div>
            <div class="ai-tabs">
                <button type="button" class="ai-tab-btn ${UI.aiTab === 'copilot' ? "active" : ""}" data-tab="copilot" onclick="switchAITab('copilot')">Copilot</button>
                <button type="button" class="ai-tab-btn ${UI.aiTab === 'analyzer' ? "active" : ""}" data-tab="analyzer" onclick="switchAITab('analyzer')">Analyzer</button>
                <button type="button" class="ai-tab-btn ${UI.aiTab === 'quality' ? "active" : ""}" data-tab="quality" onclick="switchAITab('quality')">Quality</button>
            </div>
        </div>
        <div class="ai-pop-body">
            <div class="ai-tab-pane ${UI.aiTab === 'copilot' ? "active" : ""}" data-tab="copilot">
                <div class="ai-topsec" id="aiTopCenterBody">${aiTopStripMarkup()}</div>
            </div>

            <div class="ai-tab-pane ${UI.aiTab === 'analyzer' ? "active" : ""}" data-tab="analyzer">
                <div class="fsec toolsec ai-mainsec" style="margin: 0; padding: 0;">
                    <div class="flbl" style="margin-bottom: 0.6rem;">AI Resume Analyzer</div>
                    <p class="tool-note" style="margin-bottom: 1.25rem;">Local scoring plus optional OpenAI deep analysis for rewrite-quality suggestions.</p>
                    <div class="ai-analyzer-grid">
                        <div class="ai-pane ai-local-pane">
                            <div class="ai-subhead">Local Analyzer</div>
                            <div class="frow o">
                                <input placeholder="Target role (e.g., Frontend Developer)" value="${esc(S.ui.aiRole)}" oninput="setAIRole(this.value)">
                            </div>
                            <div id="aiAnalyzer" class="ai-status">${aiAnalyzerMarkup(analyzeAIResume())}</div>
                        </div>
                        <div class="ai-pane ai-remote-pane">
                            <div class="ai-subhead">OpenAI Deep Analyzer</div>
                            <p class="tool-note">Run <code>node server.js</code> once for proxy access. API key stays in this browser session and is not included in share links or JSON export.</p>
                            <div class="frow o">
                                <input id="openaiApiKey" type="password" placeholder="OpenAI API key (sk-...)" value="${esc(AI_REMOTE.apiKey)}" oninput="setAIApiKey(this.value)" autocomplete="off">
                            </div>
                            <div class="frow t ai-model-row">
                                <select class="csel" aria-label="Copilot model" onchange="setAIModel(this.value)">
                                    ${copilotModelOptionsMarkup()}
                                </select>
                                <button class="cbtn hi ai-run-btn" id="aiRunBtn" onclick="runOpenAIAnalyzer()" ${AI_REMOTE.loading ? "disabled" : ""}>${AI_REMOTE.loading ? "Running..." : "Run OpenAI"}</button>
                            </div>
                            <div id="aiRemoteStatus" class="ai-remote-status${AI_REMOTE.error ? " err" : ""}${AI_REMOTE.loading ? " run" : ""}">
                                ${esc(AI_REMOTE.loading ? "Running OpenAI analysis..." : (AI_REMOTE.error || AI_REMOTE.note || "Enter API key and run OpenAI analysis."))}
                            </div>
                            <div id="aiRemoteResult" class="ai-remote-result">${openAIResultMarkup(AI_REMOTE.result)}</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="ai-tab-pane ${UI.aiTab === 'quality' ? "active" : ""}" data-tab="quality">
                <div class="fsec toolsec ai-qualitysec" style="margin: 0; padding: 0;">
                    <div class="flbl" style="margin-bottom: 0.6rem;">Content Quality Hints</div>
                    <p class="tool-note" style="margin-bottom: 1.25rem;">Live checks for clarity, impact, and completeness.</p>
                    <div id="qualityHints" class="quality-status">${qualityHintsMarkup(analyzeQualityHints())}</div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="fsec toolsec">
    <div class="flbl">Save Slots</div>
    <p class="tool-note">Keep up to 3 local draft versions and switch any time.</p>
    <div id="slotStatus" class="slot-status">${slotStatusMarkup()}</div>
    <div class="tool-actions">
        <button class="cbtn" onclick="saveToActiveSlot()">Save Slot</button>
        <button class="cbtn" onclick="loadFromActiveSlot()">Load Slot</button>
        <button class="cbtn warn" onclick="clearActiveSlot()">Clear Slot</button>
    </div>
</div>

<div class="fsec toolsec">
    <div class="flbl">Shareable Link</div>
    <p class="tool-note">Generate a URL with your current draft embedded in it.</p>
    <div class="frow o">
        <input id="shareLink" type="text" readonly value="${esc(generateShareLink())}">
    </div>
    <div id="shareMeta" class="share-meta"></div>
    <div class="tool-actions">
        <button class="cbtn" onclick="refreshShareLink()">Refresh Link</button>
        <button class="cbtn hi" onclick="copyShareLink()">Copy Link</button>
    </div>
    <div id="shareStatus" class="share-status"></div>
</div>

<div class="fsec toolsec">
    <div class="flbl">JD Match Checker</div>
    <p class="tool-note">Paste the job description to score keyword coverage and see missing terms.</p>
    <div class="frow o">
        <textarea id="jdInput" placeholder="Paste job description here..." oninput="setJDText(this.value)">${esc(S.ui.jdText)}</textarea>
    </div>
    <div id="jdStatus" class="jd-status">${jdStatusMarkup(analyzeJDMatch())}</div>
</div>`;
}

function pickerH() {
    return `
<div class="picker">
    <div class="picker-eye fu">Folio</div>
    <h1 class="fu fu1">Build your <em>resume or CV</em><br>in minutes</h1>
    <p class="picker-sub fu fu2">Professional resume and CV maker with live preview, ATS tools, and print-ready export.</p>
    <div class="picker-cards fu fu3">
        <div class="pcard" onclick="setMode('resume')">
            <div class="pcard-icon">${I.d1}</div>
            <h2>Resume</h2>
            <p class="pcard-desc">Focused, one-page document for industry job applications.</p>
            <div class="pcard-features">
                <div class="pcard-feat">Experience and Education</div>
                <div class="pcard-feat">Skills and Certifications</div>
                <div class="pcard-feat">Professional summary</div>
            </div>
            <div class="pcard-cta">${I.arrow} Start building</div>
        </div>
        <div class="pcard" onclick="setMode('cv')">
            <div class="pcard-icon">${I.d2}</div>
            <h2>Curriculum Vitae</h2>
            <p class="pcard-desc">Complete academic record for research, academia, and grants.</p>
            <div class="pcard-features">
                <div class="pcard-feat">Publications and Research</div>
                <div class="pcard-feat">Languages and Awards</div>
                <div class="pcard-feat">Full academic history</div>
            </div>
            <div class="pcard-cta">${I.arrow} Start building</div>
        </div>
    </div>
</div>`;
}

function builderH() {
    const other = S.mode === "cv" ? "resume" : "cv";
    const pct = completionPercent();
    const preset = normalizeTemplatePreset(S.ui.templatePreset);
    return `
<div class="builder si">
    <div class="chrome">
        <div class="chrome-left">
            <span class="chrome-brand">Folio</span>
            <div class="chrome-div"></div>
            <span class="chrome-badge">${S.mode === "cv" ? "CV" : "RESUME"}</span>
            <span class="chrome-note" id="completionStatus">0% complete</span>
            <span class="chrome-note" id="pageStatus">1 page</span>
            <span class="chrome-note" id="saveStatus">Saved</span>
            <div class="chrome-meter" aria-hidden="true"><span style="width:${pct}%"></span></div>
        </div>
        <div class="chrome-actions">
            <select class="csel" aria-label="Template preset" onchange="setTemplatePreset(this.value)">
                <option value="professional" ${preset === "professional" ? "selected" : ""}>Professional</option>
                <option value="modern" ${preset === "modern" ? "selected" : ""}>Modern</option>
                <option value="academic" ${preset === "academic" ? "selected" : ""}>Academic</option>
            </select>
            <button class="cbtn ${S.ui.atsMode ? "active" : ""}" onclick="toggleATSMode()">ATS ${S.ui.atsMode ? "On" : "Mode"}</button>
            <button class="cbtn desk" onclick="S.mode=null;render()">${I.back} Home</button>
            <button class="cbtn desk" onclick="setMode('${other}')">${I.swap} Switch to ${other}</button>
            <button class="cbtn desk" onclick="exportJSON()">Save JSON</button>
            <button class="cbtn desk" onclick="importJSON()">Load JSON</button>
            <button class="cbtn warn desk" onclick="resetAllData()">Reset</button>
            <button class="cbtn hi" onclick="printDocument()">${I.print} Export PDF</button>
        </div>
    </div>
    <div class="mobile-switch">
        <button class="msbtn ${UI.mobilePane === "form" ? "on" : ""}" onclick="setMobilePane('form')">Editor</button>
        <button class="msbtn ${UI.mobilePane === "preview" ? "on" : ""}" onclick="setMobilePane('preview')">Preview</button>
    </div>
    <div class="panels view-${UI.mobilePane}">
        <div class="fp fi" id="fp">${S.mode === "cv" ? cvForm() : resForm()}</div>
        <div class="pp fi">
            <div class="doc-wrap">
                <div class="doc-sheet tpl-${preset}${S.ui.atsMode ? " ats-mode" : ""}" id="pp">${S.mode === "cv" ? cvPrev() : resPrev()}</div>
            </div>
        </div>
    </div>
</div>`;
}

function cvForm() {
    const d = S.cv;
    const n = (i) => String(i + 1).padStart(2, "0");
    return `
${toolsPanel()}
<div class="fsec"><div class="flbl">Identity</div>
<div class="frow t"><input placeholder="Full name" value="${esc(d.name)}" oninput="S.cv.name=this.value;up()"><input placeholder="Academic title" value="${esc(d.title)}" oninput="S.cv.title=this.value;up()"></div>
<div class="frow t"><input placeholder="Email" value="${esc(d.email)}" oninput="S.cv.email=this.value;up()"><input placeholder="Phone" value="${esc(d.phone)}" oninput="S.cv.phone=this.value;up()"></div>
<div class="frow t"><input placeholder="Website" value="${esc(d.website)}" oninput="S.cv.website=this.value;up()"><input placeholder="Location" value="${esc(d.location)}" oninput="S.cv.location=this.value;up()"></div>
<div class="frow o"><input placeholder="LinkedIn" value="${esc(d.linkedin)}" oninput="S.cv.linkedin=this.value;up()"></div></div>

<div class="fsec"><div class="flbl">Research Summary</div><div class="frow o"><textarea placeholder="Describe your research focus, methods, and contributions..." oninput="S.cv.summary=this.value;up()">${esc(d.summary)}</textarea></div></div>

<div class="fsec"><div class="flbl">Education</div>${d.education.map((e, i) => `
<div class="entry" ondragover="dragOverItem('cv','education',${i},event)" ondragleave="dragLeaveItem(event)" ondrop="dropReorderItem('cv','education',${i},event)"><div class="entry-hd"><span class="entry-hd-left">${dragHandle('cv','education',i)}<span class="entry-n">EDU ${n(i)}</span></span><button class="rbtn" onclick="removeItem('cv','education',${i})">${I.trash} remove</button></div>
<div class="frow t"><input placeholder="Degree" value="${esc(e.degree)}" oninput="S.cv.education[${i}].degree=this.value;up()"><input placeholder="Institution" value="${esc(e.institution)}" oninput="S.cv.education[${i}].institution=this.value;up()"></div>
<div class="frow h"><input placeholder="Year" value="${esc(e.year)}" oninput="S.cv.education[${i}].year=this.value;up()"><input placeholder="Score / CGPA" value="${esc(e.score)}" oninput="S.cv.education[${i}].score=this.value;up()"><input placeholder="Location" value="${esc(e.location)}" oninput="S.cv.education[${i}].location=this.value;up()"></div>
<div class="frow o"><input placeholder="Thesis / note" value="${esc(e.details)}" oninput="S.cv.education[${i}].details=this.value;up()"></div>
</div>`).join("")}<button class="abtn" onclick="addItem('cv','education')">${I.plus} Add education</button></div>

<div class="fsec"><div class="flbl">Experience</div>${d.experience.map((e, i) => `
<div class="entry" ondragover="dragOverItem('cv','experience',${i},event)" ondragleave="dragLeaveItem(event)" ondrop="dropReorderItem('cv','experience',${i},event)"><div class="entry-hd"><span class="entry-hd-left">${dragHandle('cv','experience',i)}<span class="entry-n">EXP ${n(i)}</span></span><button class="rbtn" onclick="removeItem('cv','experience',${i})">${I.trash} remove</button></div>
<div class="frow t"><input placeholder="Role" value="${esc(e.title)}" oninput="S.cv.experience[${i}].title=this.value;up()"><input placeholder="Organization" value="${esc(e.org)}" oninput="S.cv.experience[${i}].org=this.value;up()"></div>
<div class="frow t"><input placeholder="Period" value="${esc(e.period)}" oninput="S.cv.experience[${i}].period=this.value;up()"><input placeholder="Location" value="${esc(e.location)}" oninput="S.cv.experience[${i}].location=this.value;up()"></div>
<div class="frow o"><textarea placeholder="Description..." oninput="S.cv.experience[${i}].desc=this.value;up()">${esc(e.desc)}</textarea></div>
</div>`).join("")}<button class="abtn" onclick="addItem('cv','experience')">${I.plus} Add position</button></div>

<div class="fsec"><div class="flbl">Projects</div>${d.projects.map((e, i) => `
<div class="entry" ondragover="dragOverItem('cv','projects',${i},event)" ondragleave="dragLeaveItem(event)" ondrop="dropReorderItem('cv','projects',${i},event)"><div class="entry-hd"><span class="entry-hd-left">${dragHandle('cv','projects',i)}<span class="entry-n">PRJ ${n(i)}</span></span><button class="rbtn" onclick="removeItem('cv','projects',${i})">${I.trash} remove</button></div>
<div class="frow t"><input placeholder="Project title" value="${esc(e.name)}" oninput="S.cv.projects[${i}].name=this.value;up()"><input placeholder="Tech stack (comma-separated)" value="${esc(e.tech)}" oninput="S.cv.projects[${i}].tech=this.value;up()"></div>
<div class="frow t"><input placeholder="Period" value="${esc(e.period)}" oninput="S.cv.projects[${i}].period=this.value;up()"><input placeholder="GitHub | Live Demo (optional)" value="${esc(e.link)}" oninput="S.cv.projects[${i}].link=this.value;up()"></div>
<div class="frow o"><textarea placeholder="Highlights - one per line." oninput="S.cv.projects[${i}].highlights=this.value;up()">${esc(e.highlights)}</textarea></div>
</div>`).join("")}<button class="abtn" onclick="addItem('cv','projects')">${I.plus} Add project</button></div>

<div class="fsec"><div class="flbl">Publications</div>${d.publications.map((e, i) => `
<div class="entry"><div class="entry-hd"><span class="entry-n">PUB ${n(i)}</span><button class="rbtn" onclick="removeItem('cv','publications',${i})">${I.trash} remove</button></div>
<div class="frow o"><input placeholder="Title" value="${esc(e.title)}" oninput="S.cv.publications[${i}].title=this.value;up()"></div>
<div class="frow h"><input placeholder="Venue / journal" value="${esc(e.venue)}" oninput="S.cv.publications[${i}].venue=this.value;up()"><input placeholder="Year" value="${esc(e.year)}" oninput="S.cv.publications[${i}].year=this.value;up()"><input placeholder="Authors" value="${esc(e.authors)}" oninput="S.cv.publications[${i}].authors=this.value;up()"></div>
</div>`).join("")}<button class="abtn" onclick="addItem('cv','publications')">${I.plus} Add publication</button></div>

<div class="fsec"><div class="flbl">Skills</div>${d.skills.map((e, i) => `
<div class="entry"><div class="entry-hd"><span class="entry-n">SKL ${n(i)}</span><button class="rbtn" onclick="removeItem('cv','skills',${i})">${I.trash} remove</button></div>
<div class="frow t"><input placeholder="Category" value="${esc(e.cat)}" oninput="S.cv.skills[${i}].cat=this.value;up()"><input placeholder="Items, one per line" value="${esc(e.items)}" oninput="S.cv.skills[${i}].items=this.value;up()"></div>
</div>`).join("")}<button class="abtn" onclick="addItem('cv','skills')">${I.plus} Add group</button></div>

<div class="fsec"><div class="flbl">Languages</div>${d.languages.map((e, i) => `
<div class="entry"><div class="entry-hd"><span class="entry-n">LNG ${n(i)}</span><button class="rbtn" onclick="removeItem('cv','languages',${i})">${I.trash} remove</button></div>
<div class="frow t"><input placeholder="Language" value="${esc(e.lang)}" oninput="S.cv.languages[${i}].lang=this.value;up()"><input placeholder="Proficiency" value="${esc(e.level)}" oninput="S.cv.languages[${i}].level=this.value;up()"></div>
</div>`).join("")}<button class="abtn" onclick="addItem('cv','languages')">${I.plus} Add language</button></div>

<div class="fsec"><div class="flbl">Awards and Honors</div>${d.awards.map((e, i) => `
<div class="entry"><div class="entry-hd"><span class="entry-n">AWD ${n(i)}</span><button class="rbtn" onclick="removeItem('cv','awards',${i})">${I.trash} remove</button></div>
<div class="frow h"><input placeholder="Award title" value="${esc(e.title)}" oninput="S.cv.awards[${i}].title=this.value;up()"><input placeholder="Year" value="${esc(e.year)}" oninput="S.cv.awards[${i}].year=this.value;up()"><input placeholder="Organization" value="${esc(e.org)}" oninput="S.cv.awards[${i}].org=this.value;up()"></div>
</div>`).join("")}<button class="abtn" onclick="addItem('cv','awards')">${I.plus} Add award</button></div>`;
}

function resForm() {
    const d = S.resume;
    const n = (i) => String(i + 1).padStart(2, "0");
    return `
${toolsPanel()}
<div class="fsec"><div class="flbl">Identity</div>
<div class="frow t"><input placeholder="Full name" value="${esc(d.name)}" oninput="S.resume.name=this.value;up()"><input placeholder="Email" value="${esc(d.email)}" oninput="S.resume.email=this.value;up()"></div>
<div class="frow t"><input placeholder="Phone" value="${esc(d.phone)}" oninput="S.resume.phone=this.value;up()"><input placeholder="Location" value="${esc(d.location)}" oninput="S.resume.location=this.value;up()"></div>
<div class="frow t"><input placeholder="Website / portfolio" value="${esc(d.website)}" oninput="S.resume.website=this.value;up()"><input placeholder="LinkedIn (optional)" value="${esc(d.linkedin)}" oninput="S.resume.linkedin=this.value;up()"></div></div>

<div class="fsec"><div class="flbl">Summary</div><div class="frow o"><textarea placeholder="2-3 sentences. Who you are, your superpower, what you are building toward." oninput="S.resume.summary=this.value;up()">${esc(d.summary)}</textarea></div></div>

<div class="fsec"><div class="flbl">Experience</div>${d.experience.map((e, i) => `
<div class="entry" ondragover="dragOverItem('resume','experience',${i},event)" ondragleave="dragLeaveItem(event)" ondrop="dropReorderItem('resume','experience',${i},event)"><div class="entry-hd"><span class="entry-hd-left">${dragHandle('resume','experience',i)}<span class="entry-n">EXP ${n(i)}</span></span><button class="rbtn" onclick="removeItem('resume','experience',${i})">${I.trash} remove</button></div>
<div class="frow t"><input placeholder="Job title" value="${esc(e.title)}" oninput="S.resume.experience[${i}].title=this.value;up()"><input placeholder="Company" value="${esc(e.company)}" oninput="S.resume.experience[${i}].company=this.value;up()"></div>
<div class="frow t"><input placeholder="Period - e.g. Jan 2022 - Present" value="${esc(e.period)}" oninput="S.resume.experience[${i}].period=this.value;up()"><input placeholder="Location" value="${esc(e.location)}" oninput="S.resume.experience[${i}].location=this.value;up()"></div>
<div class="frow o"><textarea placeholder="Key achievements - one per line, start with a strong action verb." oninput="S.resume.experience[${i}].bullets=this.value;up()">${esc(e.bullets)}</textarea></div>
</div>`).join("")}<button class="abtn" onclick="addItem('resume','experience')">${I.plus} Add role</button></div>

<div class="fsec"><div class="flbl">Projects</div>${d.projects.map((e, i) => `
<div class="entry" ondragover="dragOverItem('resume','projects',${i},event)" ondragleave="dragLeaveItem(event)" ondrop="dropReorderItem('resume','projects',${i},event)"><div class="entry-hd"><span class="entry-hd-left">${dragHandle('resume','projects',i)}<span class="entry-n">PRJ ${n(i)}</span></span><button class="rbtn" onclick="removeItem('resume','projects',${i})">${I.trash} remove</button></div>
<div class="frow t"><input placeholder="Project name" value="${esc(e.name)}" oninput="S.resume.projects[${i}].name=this.value;up()"><input placeholder="Tech stack (comma-separated)" value="${esc(e.tech)}" oninput="S.resume.projects[${i}].tech=this.value;up()"></div>
<div class="frow t"><input placeholder="Period" value="${esc(e.period)}" oninput="S.resume.projects[${i}].period=this.value;up()"><input placeholder="GitHub | Live Demo (optional)" value="${esc(e.link)}" oninput="S.resume.projects[${i}].link=this.value;up()"></div>
<div class="frow o"><textarea placeholder="Highlights - one per line." oninput="S.resume.projects[${i}].highlights=this.value;up()">${esc(e.highlights)}</textarea></div>
</div>`).join("")}<button class="abtn" onclick="addItem('resume','projects')">${I.plus} Add project</button></div>

<div class="fsec"><div class="flbl">Education</div>${d.education.map((e, i) => `
<div class="entry" ondragover="dragOverItem('resume','education',${i},event)" ondragleave="dragLeaveItem(event)" ondrop="dropReorderItem('resume','education',${i},event)"><div class="entry-hd"><span class="entry-hd-left">${dragHandle('resume','education',i)}<span class="entry-n">EDU ${n(i)}</span></span><button class="rbtn" onclick="removeItem('resume','education',${i})">${I.trash} remove</button></div>
<div class="frow t"><input placeholder="Degree" value="${esc(e.degree)}" oninput="S.resume.education[${i}].degree=this.value;up()"><input placeholder="School" value="${esc(e.school)}" oninput="S.resume.education[${i}].school=this.value;up()"></div>
<div class="frow h"><input placeholder="Graduation year" value="${esc(e.year)}" oninput="S.resume.education[${i}].year=this.value;up()"><input placeholder="Score / CGPA" value="${esc(e.score)}" oninput="S.resume.education[${i}].score=this.value;up()"><input placeholder="Location" value="${esc(e.location)}" oninput="S.resume.education[${i}].location=this.value;up()"></div>
</div>`).join("")}<button class="abtn" onclick="addItem('resume','education')">${I.plus} Add education</button></div>

<div class="fsec"><div class="flbl">Skills</div><div class="frow o"><textarea placeholder="One skill per line - React&#10;TypeScript&#10;Node.js&#10;AWS" oninput="S.resume.skills=this.value;up()">${esc(d.skills)}</textarea></div></div>

<div class="fsec"><div class="flbl">Certifications</div>${d.certifications.map((e, i) => `
<div class="entry" ondragover="dragOverItem('resume','certifications',${i},event)" ondragleave="dragLeaveItem(event)" ondrop="dropReorderItem('resume','certifications',${i},event)"><div class="entry-hd"><span class="entry-hd-left">${dragHandle('resume','certifications',i)}<span class="entry-n">CRT ${n(i)}</span></span><button class="rbtn" onclick="removeItem('resume','certifications',${i})">${I.trash} remove</button></div>
<div class="frow h"><input placeholder="Certification name" value="${esc(e.name)}" oninput="S.resume.certifications[${i}].name=this.value;up()"><input placeholder="Issuer" value="${esc(e.org)}" oninput="S.resume.certifications[${i}].org=this.value;up()"><input placeholder="Year" value="${esc(e.year)}" oninput="S.resume.certifications[${i}].year=this.value;up()"></div>
<div class="frow o"><input placeholder="Credential URL (Link)" value="${esc(e.url)}" oninput="S.resume.certifications[${i}].url=this.value;up()"></div>
<div class="frow o"><label class="cert-toggle"><input type="checkbox" ${e.offline ? "checked" : ""} onchange="S.resume.certifications[${i}].offline=this.checked?'yes':'';up()">This certificate is offline / email-based</label></div>
</div>`).join("")}<button class="abtn" onclick="addItem('resume','certifications')">${I.plus} Add certification</button></div>`;
}

function cvPrev() {
    const d = S.cv;
    const contacts = [d.email, d.phone, d.website, d.location, d.linkedin].filter(Boolean);
    const hasAny = d.name || d.title || contacts.length ||
        d.summary ||
        d.education.some((e) => e.degree || e.institution || e.location || e.score) ||
        d.experience.some((e) => e.title || e.org || e.location) ||
        d.projects.some((e) => e.name || e.tech || e.period || e.highlights || e.link) ||
        d.publications.some((e) => e.title) ||
        d.skills.some((e) => e.items) ||
        d.languages.some((e) => e.lang) ||
        d.awards.some((e) => e.title);

    if (!hasAny) {
        return `<div class="doc"><div class="doc-empty">Start filling in your details<br>and your CV will appear here.</div></div>`;
    }

    return `<div class="doc">
<div class="doc-name">${esc(d.name) || '<span class="doc-ph">Your Name</span>'}</div>
${d.title ? `<div class="doc-title">${esc(d.title)}</div>` : ""}
${contacts.length ? contactMarkup(contacts) : ""}
<div class="doc-hr"></div>
${d.summary ? `<div class="doc-sum">${esc(d.summary)}</div>` : ""}
${d.education.some((e) => e.degree || e.institution || e.location || e.score) ? `<div class="doc-sec"><div class="doc-sh">Education</div>${d.education.filter((e) => e.degree || e.institution || e.location || e.score).map((e) => `<div class="doc-item"><div class="doc-row"><span class="doc-it">${esc(e.degree)}</span><span class="doc-dt">${[e.year, e.score].filter(Boolean).map(esc).join(" | ")}</span></div>${(e.institution || e.location) ? `<div class="doc-sub">${[e.institution, e.location].filter(Boolean).map(esc).join(" | ")}</div>` : ""}${e.details ? `<div class="doc-body">${esc(e.details)}</div>` : ""}</div>`).join("")}</div>` : ""}
${d.experience.some((e) => e.title || e.org || e.location) ? `<div class="doc-sec"><div class="doc-sh">Experience</div>${d.experience.filter((e) => e.title || e.org || e.location).map((e) => `<div class="doc-item"><div class="doc-row"><span class="doc-it">${esc(e.title)}</span><span class="doc-dt">${esc(e.period)}</span></div>${(e.org || e.location) ? `<div class="doc-sub">${[e.org, e.location].filter(Boolean).map(esc).join(" | ")}</div>` : ""}${e.desc ? `<div class="doc-body">${esc(e.desc)}</div>` : ""}</div>`).join("")}</div>` : ""}
${d.projects.some((e) => e.name || e.tech || e.period || e.highlights || e.link) ? `<div class="doc-sec"><div class="doc-sh">Projects</div>${d.projects.filter((e) => e.name || e.tech || e.period || e.highlights || e.link).map((e) => `<div class="doc-item"><div class="doc-row"><span class="doc-it">${esc(e.name)}</span><span class="doc-dt">${esc(e.period)}</span></div>${commaSeparated(e.tech) ? `<div class="doc-sub">${esc(commaSeparated(e.tech))}</div>` : ""}${e.highlights ? `<div class="doc-body">${esc(e.highlights)}</div>` : ""}${e.link ? `<div class="doc-body">${externalLinkMarkup(e.link, "GitHub | Live Demo")}</div>` : ""}</div>`).join("")}</div>` : ""}
${d.publications.some((e) => e.title) ? `<div class="doc-sec"><div class="doc-sh">Publications</div>${d.publications.filter((e) => e.title).map((e) => `<div class="doc-item"><div class="doc-row"><span class="doc-it">${esc(e.title)}</span><span class="doc-dt">${esc(e.year)}</span></div><div class="doc-sub">${[e.venue, e.authors].filter(Boolean).map(esc).join(" | ")}</div></div>`).join("")}</div>` : ""}
${d.skills.some((e) => e.items) ? `<div class="doc-sec"><div class="doc-sh">Skills and Tools</div>${d.skills.filter((e) => e.items).map((e) => {
        const list = e.items.split(/\n+/).map((s) => s.trim()).filter(Boolean);
        return `<div class="doc-item">${e.cat ? `<div class="doc-sub" style="font-weight:500;color:var(--paper-text);margin-bottom:4px">${esc(e.cat)}</div>` : ""}${S.ui.atsMode ? `<div class="doc-body doc-plain-list">${list.map((s) => esc(s)).join("<br>")}</div>` : `<div class="doc-tags">${list.map((s) => `<span class="doc-tag">${esc(s)}</span>`).join("")}</div>`}</div>`;
    }).join("")}</div>` : ""}
${d.languages.some((e) => e.lang) ? `<div class="doc-sec"><div class="doc-sh">Languages</div><div class="doc-langs">${d.languages.filter((e) => e.lang).map((e) => `<span class="doc-lang"><strong>${esc(e.lang)}</strong> <span>${esc(e.level)}</span></span>`).join("")}</div></div>` : ""}
${d.awards.some((e) => e.title) ? `<div class="doc-sec"><div class="doc-sh">Awards and Honors</div>${d.awards.filter((e) => e.title).map((e) => `<div class="doc-item"><div class="doc-row"><span class="doc-it">${esc(e.title)}</span><span class="doc-dt">${esc(e.year)}</span></div>${e.org ? `<div class="doc-sub">${esc(e.org)}</div>` : ""}</div>`).join("")}</div>` : ""}
</div>`;
}

function resPrev() {
    const d = S.resume;
    const contacts = [d.email, d.phone, d.location, d.website, d.linkedin].filter(Boolean);
    const skills = d.skills ? d.skills.split(/\n+/).map((s) => s.trim()).filter(Boolean) : [];
    const hasAny = d.name || contacts.length || d.summary ||
        d.experience.some((e) => e.title || e.company || e.location) ||
        d.projects.some((e) => e.name || e.tech || e.period || e.highlights || e.link) ||
        d.education.some((e) => e.degree || e.school || e.location || e.score) ||
        skills.length ||
        d.certifications.some((e) => e.name || e.org || e.year || e.url || e.offline);

    if (!hasAny) {
        return `<div class="doc"><div class="doc-empty">Start filling in your details<br>and your resume will appear here.</div></div>`;
    }

    return `<div class="doc">
<div class="doc-name">${esc(d.name) || '<span class="doc-ph">Your Name</span>'}</div>
${contacts.length ? contactMarkup(contacts) : ""}
<div class="doc-hr"></div>
${d.summary ? `<div class="doc-sum">${esc(d.summary)}</div>` : ""}
${d.projects.some((e) => e.name || e.tech || e.period || e.highlights || e.link) ? `<div class="doc-sec"><div class="doc-sh">Projects</div>${d.projects.filter((e) => e.name || e.tech || e.period || e.highlights || e.link).map((e) => `<div class="doc-item"><div class="doc-row"><span class="doc-it">${esc(e.name)}</span><span class="doc-dt">${esc(e.period)}</span></div>${commaSeparated(e.tech) ? `<div class="doc-sub">${esc(commaSeparated(e.tech))}</div>` : ""}${e.highlights ? `<ul class="doc-bul">${e.highlights.split("\n").filter((b) => b.trim()).map((b) => `<li>${esc(b.trim())}</li>`).join("")}</ul>` : ""}${e.link ? `<div class="doc-body">${externalLinkMarkup(e.link, "GitHub | Live Demo")}</div>` : ""}</div>`).join("")}</div>` : ""}
${skills.length ? `<div class="doc-sec"><div class="doc-sh">Skills</div>${S.ui.atsMode ? `<div class="doc-body doc-plain-list">${skills.map((s) => esc(s)).join("<br>")}</div>` : `<div class="doc-tags">${skills.map((s) => `<span class="doc-tag">${esc(s)}</span>`).join("")}</div>`}</div>` : ""}
${d.education.some((e) => e.degree || e.school || e.location || e.score) ? `<div class="doc-sec"><div class="doc-sh">Education</div>${d.education.filter((e) => e.degree || e.school || e.location || e.score).map((e) => `<div class="doc-item"><div class="doc-row"><span class="doc-it">${esc(e.degree)}</span><span class="doc-dt">${[e.year, e.score].filter(Boolean).map(esc).join(" | ")}</span></div>${(e.school || e.location) ? `<div class="doc-sub">${[e.school, e.location].filter(Boolean).map(esc).join(" | ")}</div>` : ""}</div>`).join("")}</div>` : ""}
${d.certifications.some((e) => e.name || e.org || e.year || e.url || e.offline) ? `<div class="doc-sec"><div class="doc-sh">Certifications</div>${d.certifications.filter((e) => e.name || e.org || e.year || e.url || e.offline).map((e) => `<div class="doc-item"><div class="doc-row"><span class="doc-it">${esc(e.name)}</span><span class="doc-dt">${esc(e.year)}</span></div>${e.org ? `<div class="doc-sub">${esc(e.org)}</div>` : ""}${e.url ? `<div class="doc-body">${externalLinkMarkup(e.url, "View Credential")}</div>` : ""}${e.offline ? `<div class="doc-body"><span class="doc-badge">Verified by issuer</span></div>` : ""}</div>`).join("")}</div>` : ""}
${d.experience.some((e) => e.title || e.company || e.location) ? `<div class="doc-sec"><div class="doc-sh">Experience</div>${d.experience.filter((e) => e.title || e.company || e.location).map((e) => `<div class="doc-item"><div class="doc-row"><span class="doc-it">${esc(e.title)}</span><span class="doc-dt">${esc(e.period)}</span></div>${(e.company || e.location) ? `<div class="doc-sub">${[e.company, e.location].filter(Boolean).map(esc).join(" | ")}</div>` : ""}${e.bullets ? `<ul class="doc-bul">${e.bullets.split("\n").filter((b) => b.trim()).map((b) => `<li>${esc(b.trim())}</li>`).join("")}</ul>` : ""}</div>`).join("")}</div>` : ""}
</div>`;
}

document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if (key === "escape" && UI.aiPopupOpen) {
        event.preventDefault();
        toggleAIPopup(false);
        return;
    }

    if ((event.ctrlKey || event.metaKey) && key === "s") {
        event.preventDefault();
        exportJSON();
    }

    if ((event.ctrlKey || event.metaKey) && key === "p" && S.mode) {
        event.preventDefault();
        printDocument();
    }
});

window.addEventListener("afterprint", () => {
    if (printRestorePane === null) return;
    UI.mobilePane = printRestorePane;
    printRestorePane = null;
    render();
});

window.addEventListener("resize", () => {
    a4HeightPxCache = null;
    if (S.mode) {
        window.requestAnimationFrame(() => {
            updatePageStatus();
            updateQualityHintsUI();
            updateAITopCenterUI();
        });
    }
});

loadSavedState();
loadSlotData();
const loadedFromShareLink = tryLoadStateFromQuery();
render();
if (loadedFromShareLink) {
    scheduleSave();
}
