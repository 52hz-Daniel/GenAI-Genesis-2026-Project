/**
 * Sector 4: Live interview agent (cascaded path).
 * Uses live interviewer prompt and same query_user_history tool as coach-agent.
 * Read-only: openai, query-user-history.
 */
import OpenAI from "openai";
import { getOpenAIClient } from "./openai";
import { buildLiveInterviewMessages, type LiveMessage } from "./live-prompts";
import { queryUserHistory } from "./query-user-history";

const TOOL_NAME = "query_user_history";
const MAX_TOOL_ROUNDS = 3;

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: TOOL_NAME,
      description:
        "Search the user's past interview history for evidence about a specific competency. Use this when the user makes a claim (e.g. 'I lead teams well') and you want to recall their past performance to challenge or deepen the conversation. Pass the competency name (e.g. Leadership, Communication, STAR Method Structuring, Teamwork, Conflict Resolution, Quantifying Impact).",
      parameters: {
        type: "object",
        properties: {
          competency_name: { type: "string", description: "Competency name to search for" },
        },
        required: ["competency_name"],
      },
    },
  },
];

type Message = OpenAI.Chat.Completions.ChatCompletionMessageParam;

function formatHistoryResult(items: { evidence_quote: string; socratic_feedback_given: string | null; created_at: string }[]): string {
  if (items.length === 0) return "No past evidence found for this competency.";
  return items
    .map(
      (item, i) =>
        `[${i + 1}] Quote: "${item.evidence_quote}"${item.socratic_feedback_given ? ` Feedback given: ${item.socratic_feedback_given}` : ""} (${item.created_at.slice(0, 10)})`
    )
    .join("\n\n");
}

/**
 * Get interviewer reply for the live session (cascaded path). Uses live prompt and optional tools.
 */
export async function getLiveInterviewReply(
  history: LiveMessage[],
  context: string | undefined,
  userId: string | null
): Promise<string> {
  const openai = getOpenAIClient();
  const baseMessages = buildLiveInterviewMessages(history, context);
  const systemMessage = baseMessages[0];
  const restMessages = baseMessages.slice(1) as Message[];
  const messages: Message[] = [systemMessage, ...restMessages];

  const useTools = !!userId;
  let rounds = 0;

  while (rounds < MAX_TOOL_ROUNDS) {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.8,
      ...(useTools && rounds < MAX_TOOL_ROUNDS ? { tools: TOOLS, tool_choice: "auto" } : {}),
    });

    const choice = completion.choices[0];
    const msg = choice?.message;
    if (!msg) break;

    if (msg.tool_calls?.length && userId) {
      messages.push(msg as Message);
      for (const tc of msg.tool_calls) {
        const fn = "function" in tc ? tc.function : undefined;
        if (fn?.name !== TOOL_NAME || fn?.arguments === undefined) continue;
        let args: { competency_name?: string };
        try {
          args = JSON.parse(fn.arguments);
        } catch {
          args = {};
        }
        const competencyName = typeof args.competency_name === "string" ? args.competency_name : "Communication";
        const items = await queryUserHistory(userId, competencyName, 3);
        const content = formatHistoryResult(items);
        messages.push({
          role: "tool",
          tool_call_id: tc.id,
          content,
        });
      }
      rounds++;
      continue;
    }

    const content = msg.content?.trim() ?? "";
    return content;
  }

  const lastAssistant = messages.filter((m) => m.role === "assistant").pop();
  const content = lastAssistant && typeof lastAssistant === "object" && "content" in lastAssistant && lastAssistant.content;
  return typeof content === "string" ? content.trim() : "";
}
