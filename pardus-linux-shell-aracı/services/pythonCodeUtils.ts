// AI yanıtından Python kod bloğunu ayıklar
export function extractPythonCode(aiText: string): string | null {
  const codeBlockRegex = /```python([\s\S]*?)```/g;
  const match = codeBlockRegex.exec(aiText);
  if (match && match[1]) {
    return match[1].trim();
  }
  return null;
}
