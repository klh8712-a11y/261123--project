import { requestText, requestJson, cleanText, AiError } from './openai-client.js';
import {
  GENERATE_INSTRUCTIONS,
  SHORTEN_INSTRUCTIONS,
  FEEDBACK_INSTRUCTIONS,
  FEEDBACK_SCHEMA,
  REVISE_BASE,
  REVISE_CONCISE,
  REVISE_SPECIFIC,
  REVISE_FIT,
  buildGeneratePrompt,
  sanitizeForPrompt,
} from './prompts.js';
import { countChars, countPlaceholders } from './count.js';

export const TOTAL_BUDGET_MS = 55000;
export const FIRST_CALL_TIMEOUT_MS = 50000;
export const MIN_RETRY_BUDGET_MS = 20000;

const TITLE_LINE = /^\[(?!보완 필요:)[^\]\n]{1,40}\]$/;

// includeTitle이 false인데 첫 줄이 [소제목]이면 그 줄을 지운다.
// includeTitle이 true인데 소제목이 없으면 그대로 둔다 (지어내지 않음).
export function applyTitleRule(text, includeTitle) {
  if (includeTitle) return text;
  const [firstLine, ...rest] = text.split('\n');
  return TITLE_LINE.test(firstLine.trim()) ? rest.join('\n').trim() : text;
}

export async function generateDraft(input) {
  const startedAt = Date.now();
  const prompt = buildGeneratePrompt(input);

  // 1차 호출
  let rawText = await requestText({
    instructions: GENERATE_INSTRUCTIONS,
    input: prompt,
    timeoutMs: FIRST_CALL_TIMEOUT_MS,
  });

  let text = applyTitleRule(rawText, input.includeTitle);
  let count = countChars(text);
  const basis = input.countMode === 'with_spaces' ? '공백 포함' : '공백 제외';
  let currentVal = input.countMode === 'with_spaces' ? count.withSpaces : count.withoutSpaces;
  let retried = false;

  // 글자수 초과 시 자동 축약 1회
  if (currentVal > input.charLimit) {
    const elapsed = Date.now() - startedAt;
    const remaining = TOTAL_BUDGET_MS - elapsed;

    if (remaining >= MIN_RETRY_BUDGET_MS) {
      const targetChars = Math.floor(input.charLimit * 0.92);
      const shortenInput = `<문항>
${sanitizeForPrompt(input.question)}
</문항>
<본문>
${text}
</본문>
<작성조건>
현재 글자수: ${basis} 기준 ${currentVal}자
목표 글자수: ${basis} 기준 ${targetChars}자 안팎
최대 글자수: ${input.charLimit}자
</작성조건>`;

      try {
        const shortenedRaw = await requestText({
          instructions: SHORTEN_INSTRUCTIONS,
          input: shortenInput,
          timeoutMs: remaining - 2000,
        });
        const shortenedText = applyTitleRule(shortenedRaw, input.includeTitle);
        text = shortenedText;
        count = countChars(text);
        currentVal = input.countMode === 'with_spaces' ? count.withSpaces : count.withoutSpaces;
        retried = true;
      } catch (err) {
        // 축약 실패 시 첫 결과 유지 (AGENTS / PRD 규정)
      }
    }
  }

  const overLimit = currentVal > input.charLimit;
  const placeholderCount = countPlaceholders(text);

  return {
    text,
    count,
    overLimit,
    placeholderCount,
    retried,
  };
}

export async function getFeedback(input) {
  const basis = input.countMode === 'with_spaces' ? '공백 포함' : '공백 제외';
  const promptInput = `<지원정보>
회사명: ${sanitizeForPrompt(input.company)}
직무: ${sanitizeForPrompt(input.role)}
</지원정보>
<채용공고>
${sanitizeForPrompt(input.jobPosting) || '없음'}
</채용공고>
<문항>
${sanitizeForPrompt(input.question)}
</문항>
<본문>
${input.text}
</본문>
<작성조건>
글자수: ${basis} 기준 최대 ${input.charLimit}자
</작성조건>`;

  const json = await requestJson({
    instructions: FEEDBACK_INSTRUCTIONS,
    input: promptInput,
    schemaName: 'cover_letter_feedback',
    schema: FEEDBACK_SCHEMA,
    timeoutMs: FIRST_CALL_TIMEOUT_MS,
  });

  // docs/05 §9 피드백 결과 검사 및 정리
  const scores = json?.scores;
  if (
    !scores ||
    typeof scores.relevance !== 'number' ||
    typeof scores.specificity !== 'number' ||
    typeof scores.jobFit !== 'number' ||
    typeof scores.readability !== 'number'
  ) {
    throw new AiError('AI_BAD_OUTPUT', 'invalid_scores');
  }

  const cleanScores = {
    relevance: Math.max(1, Math.min(5, Math.round(scores.relevance))),
    specificity: Math.max(1, Math.min(5, Math.round(scores.specificity))),
    jobFit: Math.max(1, Math.min(5, Math.round(scores.jobFit))),
    readability: Math.max(1, Math.min(5, Math.round(scores.readability))),
  };

  let summary = String(json.summary || '').trim();
  if (!summary) throw new AiError('AI_BAD_OUTPUT', 'empty_summary');
  if (Array.from(summary).length > 150) {
    summary = Array.from(summary).slice(0, 149).join('') + '…';
  }

  const strengths = (Array.isArray(json.strengths) ? json.strengths : [])
    .map((s) => String(s || '').trim())
    .filter(Boolean)
    .slice(0, 3);

  const improvements = (Array.isArray(json.improvements) ? json.improvements : [])
    .map((item) => ({
      issue: String(item?.issue || '').trim(),
      suggestion: String(item?.suggestion || '').trim(),
    }))
    .filter((item) => item.issue && item.suggestion)
    .slice(0, 3);

  const rewriteExamples = (Array.isArray(json.rewriteExamples) ? json.rewriteExamples : [])
    .map((item) => ({
      before: String(item?.before || '').trim(),
      after: String(item?.after || '').trim(),
    }))
    .filter((item) => item.before && item.after && item.before !== item.after && input.text.includes(item.before))
    .slice(0, 2);

  return {
    summary,
    scores: cleanScores,
    strengths,
    improvements,
    rewriteExamples,
  };
}

export async function reviseDraft(input) {
  const startedAt = Date.now();
  const basis = input.countMode === 'with_spaces' ? '공백 포함' : '공백 제외';
  let modeInstruction = REVISE_CONCISE;
  let conditionLine = `글자수: ${basis} 기준 최대 ${input.charLimit}자`;

  if (input.mode === 'specific') {
    modeInstruction = REVISE_SPECIFIC;
  } else if (input.mode === 'fit_length') {
    modeInstruction = REVISE_FIT;
    const min = Math.floor(input.charLimit * 0.9);
    conditionLine = `글자수: ${basis} 기준 ${min}~${input.charLimit}자`;
  }

  const instructions = `${REVISE_BASE}\n\n${modeInstruction}`;
  const promptInput = `<지원정보>
회사명: ${sanitizeForPrompt(input.company)}
직무: ${sanitizeForPrompt(input.role)}
</지원정보>
<문항>
${sanitizeForPrompt(input.question)}
</문항>
<경험메모>
상황·과제: ${sanitizeForPrompt(input.experience?.situation) || '없음'}
행동: ${sanitizeForPrompt(input.experience?.action) || '없음'}
결과: ${sanitizeForPrompt(input.experience?.result) || '없음'}
배운 점: ${sanitizeForPrompt(input.experience?.lesson) || '없음'}
</경험메모>
<본문>
${input.text}
</본문>
<작성조건>
${conditionLine}
소제목: ${input.includeTitle ? '포함' : '미포함'}
</작성조건>`;

  let rawText = await requestText({
    instructions,
    input: promptInput,
    timeoutMs: FIRST_CALL_TIMEOUT_MS,
  });

  let text = applyTitleRule(rawText, input.includeTitle);
  let count = countChars(text);
  let currentVal = input.countMode === 'with_spaces' ? count.withSpaces : count.withoutSpaces;
  let retried = false;

  // 글자수 초과 시 자동 축약 1회
  if (currentVal > input.charLimit) {
    const elapsed = Date.now() - startedAt;
    const remaining = TOTAL_BUDGET_MS - elapsed;

    if (remaining >= MIN_RETRY_BUDGET_MS) {
      const targetChars = Math.floor(input.charLimit * 0.92);
      const shortenInput = `<문항>
${sanitizeForPrompt(input.question)}
</문항>
<본문>
${text}
</본문>
<작성조건>
현재 글자수: ${basis} 기준 ${currentVal}자
목표 글자수: ${basis} 기준 ${targetChars}자 안팎
최대 글자수: ${input.charLimit}자
</작성조건>`;

      try {
        const shortenedRaw = await requestText({
          instructions: SHORTEN_INSTRUCTIONS,
          input: shortenInput,
          timeoutMs: remaining - 2000,
        });
        const shortenedText = applyTitleRule(shortenedRaw, input.includeTitle);
        text = shortenedText;
        count = countChars(text);
        currentVal = input.countMode === 'with_spaces' ? count.withSpaces : count.withoutSpaces;
        retried = true;
      } catch (err) {}
    }
  }

  const overLimit = currentVal > input.charLimit;
  const placeholderCount = countPlaceholders(text);

  return {
    text,
    count,
    overLimit,
    placeholderCount,
    retried,
  };
}
