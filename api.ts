import Anthropic from '@anthropic-ai/sdk';
import JSZip from 'jszip';

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

  const client = new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });

  // Race API call against a 60-second timeout
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(
      () => reject(new Error('Request timed out after 60 seconds. Try a faster model or shorten your objective.')),
      60_000
    )
  );

  const message = await Promise.race([
    client.messages.create({
      model,
      max_tokens: prompt.maxTokens,
      system: prompt.system,
      messages: [{ role: 'user', content: prompt.user }],
    }),
    timeoutPromise,
  ]);

  const textBlock = message.content.find(b => b.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text content returned by API.');
  }
  onLog(`[API] ok len=${textBlock.text.length}`);
  return textBlock.text;
}

export function parseJsonResponse<T>(raw: string): T {
  let cleaned = raw.trim();
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

export async function downloadZip(
  files: { filename: string; content: string }[],
  zipName: string
): Promise<void> {
  const zip = new JSZip();
  files.forEach(({ filename, content }) => zip.file(filename, content));
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
