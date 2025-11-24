/**
 * Strip Markdown formatting from text
 */
export function stripMarkdown(text: string | null | undefined): string {
  if (!text) return "";
  
  return text
    // Remove bold/italic: **text**, __text__, *text*, _text_
    .replace(/\*{1,2}(.+?)\*{1,2}/g, "$1")
    .replace(/_{1,2}(.+?)_{1,2}/g, "$1")
    // Remove links: [text](url)
    .replace(/\[(.+?)\]\(.+?\)/g, "$1")
    // Remove code: `text`
    .replace(/`(.+?)`/g, "$1")
    // Remove headings: # text
    .replace(/^#+\s+(.+)$/gm, "$1")
    .trim();
}

/**
 * Strip Markdown from each line while preserving line breaks
 */
export function stripMarkdownLines(text: string | null | undefined): string {
  if (!text) return "";
  
  return text
    .split("\n")
    .map(line => stripMarkdown(line))
    .filter(line => line.trim())
    .join("\n");
}
