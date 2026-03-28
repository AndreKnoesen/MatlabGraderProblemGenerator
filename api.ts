interface ClaudePrompt {
  system: string;
  user: string;
  maxTokens: number;
}

export async function callClaude(
  prompt: ClaudePrompt,
  apiKey: string,
  model: string,
  onLog: (msg: string) => void
): Promise<string> {
  onLog('[API] sending request...');

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
    onLog('[API] request timed out after 60s');
  }, 60_000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-calls': 'true',
      },
      body: JSON.stringify({
        model,
        max_tokens: prompt.maxTokens,
        system: prompt.system,
        messages: [{ role: 'user', content: prompt.user }],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    onLog(`[API] status ${response.status}`);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errText}`);
    }

    const data = await response.json() as { content: { text: string }[] };
    const text = data.content[0].text;
    onLog(`[API] ok len=${text.length}`);
    return text;

  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof Error && e.name === 'AbortError') {
      throw new Error('Request timed out after 60 seconds. Try a faster model or shorten your objective.');
    }
    throw e;
  }
}

export function parseJsonResponse<T>(raw: string): T {
  let cleaned = raw.trim();
  // Strip ```json ... ``` or ``` ... ``` fences
  cleaned = cleaned.replace(/^```json\s*/i, '').replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/\s*```$/i, '');
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new Error(
      `Failed to parse JSON response. Raw response:\n\n${raw.slice(0, 500)}`
    );
  }
}

export function downloadText(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export function toSnakeCase(s: string): string {
  return s.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
}
