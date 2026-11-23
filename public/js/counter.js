// 줄바꿈(\r\n)을 1글자(\n)로 통일한 뒤 센다. 이모지도 1자로 세기 위해 Array.from 사용.
export function countChars(text) {
  const normalized = String(text ?? '').replace(/\r\n?/g, '\n');
  return {
    withSpaces: Array.from(normalized).length,
    withoutSpaces: Array.from(normalized.replace(/\s/g, '')).length,
  };
}

export const PLACEHOLDER_PATTERN = /\[보완 필요:[^\]]*\]/g;

export function countPlaceholders(text) {
  return (String(text ?? '').match(PLACEHOLDER_PATTERN) || []).length;
}
