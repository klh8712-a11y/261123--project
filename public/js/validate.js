import { LIMITS, MESSAGES } from './constants.js';

function getLen(str) {
  return Array.from(String(str ?? '').trim()).length;
}

export function validateFor(action, profile, question) {
  const errors = [];

  // 공통 검증: 회사명
  const companyLen = getLen(profile?.company);
  if (companyLen === 0) {
    errors.push({ field: 'company', inputId: 'company-input', message: MESSAGES.companyRequired });
  } else if (companyLen > LIMITS.company.max) {
    errors.push({ field: 'company', inputId: 'company-input', message: MESSAGES.companyMax });
  }

  // 공통 검증: 지원 직무
  const roleLen = getLen(profile?.role);
  if (roleLen === 0) {
    errors.push({ field: 'role', inputId: 'role-input', message: MESSAGES.roleRequired });
  } else if (roleLen > LIMITS.role.max) {
    errors.push({ field: 'role', inputId: 'role-input', message: MESSAGES.roleMax });
  }

  // 공통 검증: 채용공고 (선택이지만 초안 및 피드백 시)
  if (action === 'generate' || action === 'feedback') {
    const postingLen = getLen(profile?.jobPosting);
    if (postingLen > LIMITS.jobPosting.max) {
      errors.push({ field: 'jobPosting', inputId: 'posting-input', message: MESSAGES.postingMax });
    }
  }

  // 공통 검증: 문항 내용
  const questionLen = getLen(question?.question);
  if (questionLen < LIMITS.question.min) {
    errors.push({ field: 'question', inputId: 'question-input', message: MESSAGES.questionMin });
  } else if (questionLen > LIMITS.question.max) {
    errors.push({ field: 'question', inputId: 'question-input', message: MESSAGES.questionMax });
  }

  // 공통 검증: 글자수 제한
  const limitVal = question?.charLimit;
  if (
    typeof limitVal !== 'number' ||
    !Number.isInteger(limitVal) ||
    limitVal < LIMITS.charLimit.min ||
    limitVal > LIMITS.charLimit.max
  ) {
    errors.push({ field: 'charLimit', inputId: 'char-limit-input', message: MESSAGES.charLimitRange });
  }

  // 액션별 검증
  if (action === 'generate') {
    const sitLen = getLen(question?.experience?.situation);
    if (sitLen > LIMITS.experienceSituation.max) {
      errors.push({ field: 'experience.situation', inputId: 'exp-situation', message: MESSAGES.expSituationMax });
    }

    const actLen = getLen(question?.experience?.action);
    if (actLen < LIMITS.experienceAction.min) {
      errors.push({ field: 'experience.action', inputId: 'exp-action', message: MESSAGES.expActionRequired });
    } else if (actLen > LIMITS.experienceAction.max) {
      errors.push({ field: 'experience.action', inputId: 'exp-action', message: MESSAGES.expActionMax });
    }

    const resLen = getLen(question?.experience?.result);
    if (resLen > LIMITS.experienceResult.max) {
      errors.push({ field: 'experience.result', inputId: 'exp-result', message: MESSAGES.expResultMax });
    }

    const lesLen = getLen(question?.experience?.lesson);
    if (lesLen > LIMITS.experienceLesson.max) {
      errors.push({ field: 'experience.lesson', inputId: 'exp-lesson', message: MESSAGES.expLessonMax });
    }
  } else if (action === 'feedback') {
    const textLen = getLen(question?.text);
    if (textLen < LIMITS.feedbackText.min) {
      errors.push({ field: 'text', inputId: 'body-editor', message: MESSAGES.feedbackTextMin });
    } else if (textLen > LIMITS.feedbackText.max) {
      errors.push({ field: 'text', inputId: 'body-editor', message: MESSAGES.feedbackTextMax });
    }
  } else if (action === 'revise') {
    const textLen = getLen(question?.text);
    if (textLen < LIMITS.reviseText.min) {
      errors.push({ field: 'text', inputId: 'body-editor', message: MESSAGES.reviseTextMin });
    } else if (textLen > LIMITS.reviseText.max) {
      errors.push({ field: 'text', inputId: 'body-editor', message: MESSAGES.reviseTextMax });
    }
  }

  return errors;
}
