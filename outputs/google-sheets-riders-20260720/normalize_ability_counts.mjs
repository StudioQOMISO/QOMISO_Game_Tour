import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.cwd(), "..", "..");
const files = [
  "選手スプレッドシート/01_現役選手300名.csv",
  "選手スプレッドシート/02_引退選手.csv",
  "選手スプレッドシート/03_区分保留.csv",
];

const statTags = {
  sprint: "最高速",
  acceleration: "反復加速",
  punch: "パンチ力",
  cruise: "巡航力",
  climb: "登坂力",
  stamina: "長距離耐久",
  resistance: "総合安定",
  technique: "戦術眼",
  bikeControl: "バイクコントロール",
  pave: "悪路耐性",
  recovery: "総合安定",
  dailyRecovery: "日別回復",
  teamwork: "アシスト",
  ego: "勝負強さ",
  fighting: "闘争心",
};

function splitCsvLine(line) {
  const raw = [];
  const decoded = [];
  let token = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      token += ch;
      if (quoted && line[i + 1] === '"') {
        token += line[i + 1];
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (ch === "," && !quoted) {
      raw.push(token);
      decoded.push(decodeCsv(token));
      token = "";
    } else {
      token += ch;
    }
  }
  raw.push(token);
  decoded.push(decodeCsv(token));
  return { raw, decoded };
}

function decodeCsv(token) {
  if (token.startsWith('"') && token.endsWith('"')) {
    return token.slice(1, -1).replace(/""/g, '"');
  }
  return token;
}

function encodeCsv(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

let changed = 0;
const additionSources = { primary: 0, secondary: 0, stat: 0, fallback: 0 };

for (const relative of files) {
  const filePath = path.join(root, relative);
  const original = fs.readFileSync(filePath, "utf8");
  const newline = original.includes("\r\n") ? "\r\n" : "\n";
  const hadFinalNewline = /\r?\n$/.test(original);
  const lines = original.split(/\r?\n/);
  if (lines.at(-1) === "") lines.pop();
  const header = splitCsvLine(lines[0]).decoded;
  const index = Object.fromEntries(header.map((name, i) => [name, i]));
  const required = ["name", "primary_archetype", "secondary_archetype", "aptitude_tags", ...Object.keys(statTags)];
  for (const key of required) if (!(key in index)) throw new Error(`${relative}: missing ${key}`);

  for (let rowIndex = 1; rowIndex < lines.length; rowIndex += 1) {
    const parsed = splitCsvLine(lines[rowIndex]);
    let tags = parsed.decoded[index.aptitude_tags].split(" / ").map((v) => v.trim()).filter(Boolean);
    if (tags.length > 3) throw new Error(`${relative}:${rowIndex + 1}: more than 3 abilities`);
    if (tags.length < 3) {
      const candidates = [];
      const primary = parsed.decoded[index.primary_archetype].trim();
      const secondary = parsed.decoded[index.secondary_archetype].trim();
      if (primary) candidates.push({ tag: primary, source: "primary" });
      if (secondary) candidates.push({ tag: secondary, source: "secondary" });
      const rankedStats = Object.entries(statTags)
        .map(([key, tag]) => ({ tag, score: Number(parsed.decoded[index[key]] || 0), source: "stat" }))
        .sort((a, b) => b.score - a.score);
      candidates.push(...rankedStats, ...["総合安定", "勝負強さ", "戦術眼"].map((tag) => ({ tag, source: "fallback" })));
      while (tags.length < 3) {
        const candidate = candidates.find(({ tag }) => tag && !tags.includes(tag));
        if (!candidate) throw new Error(`${relative}:${rowIndex + 1}: cannot fill abilities`);
        tags.push(candidate.tag);
        additionSources[candidate.source] += 1;
      }
      parsed.raw[index.aptitude_tags] = encodeCsv(tags.join(" / "));
      lines[rowIndex] = parsed.raw.join(",");
      changed += 1;
    }
  }
  fs.writeFileSync(filePath, lines.join(newline) + (hadFinalNewline ? newline : ""), "utf8");
}

console.log(JSON.stringify({ changed, additionSources }, null, 2));
