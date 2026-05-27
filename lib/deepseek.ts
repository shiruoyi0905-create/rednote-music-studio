const DEEPSEEK_BASE = "https://api.deepseek.com";

type ChatOptions = {
  jsonMode?: boolean;
  temperature?: number;
  maxTokens?: number;
};

export async function chatDeepSeek(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  options: ChatOptions = {}
): Promise<string> {
  const {
    jsonMode = true,
    temperature = 0.65,
    maxTokens = 800,
  } = options;

  const body: Record<string, unknown> = {
    model: "deepseek-chat",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature,
    max_tokens: maxTokens,
    stream: false,
  };

  if (jsonMode) {
    body.response_format = { type: "json_object" };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 28000);

  try {
    const response = await fetch(`${DEEPSEEK_BASE}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`AI 服务异常 (${response.status})`);
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = json.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("AI 返回内容为空");
    return content;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("生成超时，请重试");
    }
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}
