import { LIMITS, COUNT_MODES, REVISE_MODES } from './constants.js';

function getLen(val) {
  return Array.from(String(val ?? '').trim()).length;
}

export function validateGenerateInput(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, field: 'body', message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.' };
  }

  // 1. company
  if (typeof body.company !== 'string') {
    return { ok: false, field: 'company', message: '회사명을 입력해 주세요.' };
  }
  const company = body.company.trim();
  const compLen = Array.from(company).length;
  if (compLen === 0) {
    return { ok: false, field: 'company', message: '회사명을 입력해 주세요.' };
  }
  if (compLen > LIMITS.company.max) {
    return { ok: false, field: 'company', message: '회사명은 50자 이하로 입력해 주세요.' };
  }

  // 2. role
  if (typeof body.role !== 'string') {
    return { ok: false, field: 'role', message: '지원 직무를 입력해 주세요.' };
  }
  const role = body.role.trim();
  const roleLen = Array.from(role).length;
  if (roleLen === 0) {
    return { ok: false, field: 'role', message: '지원 직무를 입력해 주세요.' };
  }
  if (roleLen > LIMITS.role.max) {
    return { ok: false, field: 'role', message: '지원 직무는 50자 이하로 입력해 주세요.' };
  }

  // 3. jobPosting (선택)
  let jobPosting = '';
  if (body.jobPosting != null) {
    if (typeof body.jobPosting !== 'string') {
      return { ok: false, field: 'jobPosting', message: '채용공고·인재상은 3,000자 이하로 입력해 주세요.' };
    }
    jobPosting = body.jobPosting.trim();
    if (Array.from(jobPosting).length > LIMITS.jobPosting.max) {
      return { ok: false, field: 'jobPosting', message: '채용공고·인재상은 3,000자 이하로 입력해 주세요.' };
    }
  }

  // 4. question
  if (typeof body.question !== 'string') {
    return { ok: false, field: 'question', message: '문항 내용을 5자 이상 입력해 주세요.' };
  }
  const question = body.question.trim();
  const qLen = Array.from(question).length;
  if (qLen < LIMITS.question.min) {
    return { ok: false, field: 'question', message: '문항 내용을 5자 이상 입력해 주세요.' };
  }
  if (qLen > LIMITS.question.max) {
    return { ok: false, field: 'question', message: '문항 내용은 300자 이하로 입력해 주세요.' };
  }

  // 5. charLimit
  if (typeof body.charLimit !== 'number' || !Number.isInteger(body.charLimit)) {
    return { ok: false, field: 'charLimit', message: '글자수 제한은 100~3,000 사이의 숫자로 입력해 주세요.' };
  }
  if (body.charLimit < LIMITS.charLimit.min || body.charLimit > LIMITS.charLimit.max) {
    return { ok: false, field: 'charLimit', message: '글자수 제한은 100~3,000 사이의 숫자로 입력해 주세요.' };
  }

  // 6. countMode
  if (typeof body.countMode !== 'string' || !COUNT_MODES.includes(body.countMode)) {
    return { ok: false, field: 'countMode', message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.' };
  }

  // 7. includeTitle
  if (typeof body.includeTitle !== 'boolean') {
    return { ok: false, field: 'includeTitle', message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.' };
  }

  // 8. experience
  if (!body.experience || typeof body.experience !== 'object' || Array.isArray(body.experience)) {
    return { ok: false, field: 'experience.action', message: '경험 메모의 [행동]을 10자 이상 입력해 주세요.' };
  }

  // experience.situation
  let situation = '';
  if (body.experience.situation != null) {
    if (typeof body.experience.situation !== 'string') {
      return { ok: false, field: 'experience.situation', message: '상황·과제는 1,000자 이하로 입력해 주세요.' };
    }
    situation = body.experience.situation.trim();
    if (Array.from(situation).length > LIMITS.experienceSituation.max) {
      return { ok: false, field: 'experience.situation', message: '상황·과제는 1,000자 이하로 입력해 주세요.' };
    }
  }

  // experience.action (필수 10~1000)
  if (typeof body.experience.action !== 'string') {
    return { ok: false, field: 'experience.action', message: '경험 메모의 [행동]을 10자 이상 입력해 주세요.' };
  }
  const action = body.experience.action.trim();
  const actLen = Array.from(action).length;
  if (actLen < LIMITS.experienceAction.min) {
    return { ok: false, field: 'experience.action', message: '경험 메모의 [행동]을 10자 이상 입력해 주세요.' };
  }
  if (actLen > LIMITS.experienceAction.max) {
    return { ok: false, field: 'experience.action', message: '행동은 1,000자 이하로 입력해 주세요.' };
  }

  // experience.result
  let result = '';
  if (body.experience.result != null) {
    if (typeof body.experience.result !== 'string') {
      return { ok: false, field: 'experience.result', message: '결과는 1,000자 이하로 입력해 주세요.' };
    }
    result = body.experience.result.trim();
    if (Array.from(result).length > LIMITS.experienceResult.max) {
      return { ok: false, field: 'experience.result', message: '결과는 1,000자 이하로 입력해 주세요.' };
    }
  }

  // experience.lesson
  let lesson = '';
  if (body.experience.lesson != null) {
    if (typeof body.experience.lesson !== 'string') {
      return { ok: false, field: 'experience.lesson', message: '배운 점은 1,000자 이하로 입력해 주세요.' };
    }
    lesson = body.experience.lesson.trim();
    if (Array.from(lesson).length > LIMITS.experienceLesson.max) {
      return { ok: false, field: 'experience.lesson', message: '배운 점은 1,000자 이하로 입력해 주세요.' };
    }
  }

  return {
    ok: true,
    value: {
      company,
      role,
      jobPosting,
      question,
      charLimit: body.charLimit,
      countMode: body.countMode,
      includeTitle: body.includeTitle,
      experience: { situation, action, result, lesson },
    },
  };
}

export function validateFeedbackInput(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, field: 'body', message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.' };
  }

  // company
  if (typeof body.company !== 'string') return { ok: false, field: 'company', message: '회사명을 입력해 주세요.' };
  const company = body.company.trim();
  const compLen = Array.from(company).length;
  if (compLen === 0) return { ok: false, field: 'company', message: '회사명을 입력해 주세요.' };
  if (compLen > LIMITS.company.max) return { ok: false, field: 'company', message: '회사명은 50자 이하로 입력해 주세요.' };

  // role
  if (typeof body.role !== 'string') return { ok: false, field: 'role', message: '지원 직무를 입력해 주세요.' };
  const role = body.role.trim();
  const roleLen = Array.from(role).length;
  if (roleLen === 0) return { ok: false, field: 'role', message: '지원 직무를 입력해 주세요.' };
  if (roleLen > LIMITS.role.max) return { ok: false, field: 'role', message: '지원 직무는 50자 이하로 입력해 주세요.' };

  // jobPosting
  let jobPosting = '';
  if (body.jobPosting != null) {
    if (typeof body.jobPosting !== 'string') return { ok: false, field: 'jobPosting', message: '채용공고·인재상은 3,000자 이하로 입력해 주세요.' };
    jobPosting = body.jobPosting.trim();
    if (Array.from(jobPosting).length > LIMITS.jobPosting.max) return { ok: false, field: 'jobPosting', message: '채용공고·인재상은 3,000자 이하로 입력해 주세요.' };
  }

  // question
  if (typeof body.question !== 'string') return { ok: false, field: 'question', message: '문항 내용을 5자 이상 입력해 주세요.' };
  const question = body.question.trim();
  const qLen = Array.from(question).length;
  if (qLen < LIMITS.question.min) return { ok: false, field: 'question', message: '문항 내용을 5자 이상 입력해 주세요.' };
  if (qLen > LIMITS.question.max) return { ok: false, field: 'question', message: '문항 내용은 300자 이하로 입력해 주세요.' };

  // charLimit
  if (typeof body.charLimit !== 'number' || !Number.isInteger(body.charLimit)) {
    return { ok: false, field: 'charLimit', message: '글자수 제한은 100~3,000 사이의 숫자로 입력해 주세요.' };
  }
  if (body.charLimit < LIMITS.charLimit.min || body.charLimit > LIMITS.charLimit.max) {
    return { ok: false, field: 'charLimit', message: '글자수 제한은 100~3,000 사이의 숫자로 입력해 주세요.' };
  }

  // countMode
  if (typeof body.countMode !== 'string' || !COUNT_MODES.includes(body.countMode)) {
    return { ok: false, field: 'countMode', message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.' };
  }

  // text (50~5000)
  if (typeof body.text !== 'string') return { ok: false, field: 'text', message: '피드백을 받으려면 본문을 50자 이상 작성해 주세요.' };
  const text = body.text.trim();
  const textLen = Array.from(text).length;
  if (textLen < LIMITS.feedbackText.min) return { ok: false, field: 'text', message: '피드백을 받으려면 본문을 50자 이상 작성해 주세요.' };
  if (textLen > LIMITS.feedbackText.max) return { ok: false, field: 'text', message: '본문은 5,000자 이하여야 해요.' };

  return {
    ok: true,
    value: { company, role, jobPosting, question, charLimit: body.charLimit, countMode: body.countMode, text },
  };
}

export function validateReviseInput(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, field: 'body', message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.' };
  }

  // mode
  if (typeof body.mode !== 'string' || !REVISE_MODES.includes(body.mode)) {
    return { ok: false, field: 'mode', message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.' };
  }

  // company
  if (typeof body.company !== 'string') return { ok: false, field: 'company', message: '회사명을 입력해 주세요.' };
  const company = body.company.trim();
  const compLen = Array.from(company).length;
  if (compLen === 0) return { ok: false, field: 'company', message: '회사명을 입력해 주세요.' };
  if (compLen > LIMITS.company.max) return { ok: false, field: 'company', message: '회사명은 50자 이하로 입력해 주세요.' };

  // role
  if (typeof body.role !== 'string') return { ok: false, field: 'role', message: '지원 직무를 입력해 주세요.' };
  const role = body.role.trim();
  const roleLen = Array.from(role).length;
  if (roleLen === 0) return { ok: false, field: 'role', message: '지원 직무를 입력해 주세요.' };
  if (roleLen > LIMITS.role.max) return { ok: false, field: 'role', message: '지원 직무는 50자 이하로 입력해 주세요.' };

  // question
  if (typeof body.question !== 'string') return { ok: false, field: 'question', message: '문항 내용을 5자 이상 입력해 주세요.' };
  const question = body.question.trim();
  const qLen = Array.from(question).length;
  if (qLen < LIMITS.question.min) return { ok: false, field: 'question', message: '문항 내용을 5자 이상 입력해 주세요.' };
  if (qLen > LIMITS.question.max) return { ok: false, field: 'question', message: '문항 내용은 300자 이하로 입력해 주세요.' };

  // charLimit
  if (typeof body.charLimit !== 'number' || !Number.isInteger(body.charLimit)) {
    return { ok: false, field: 'charLimit', message: '글자수 제한은 100~3,000 사이의 숫자로 입력해 주세요.' };
  }
  if (body.charLimit < LIMITS.charLimit.min || body.charLimit > LIMITS.charLimit.max) {
    return { ok: false, field: 'charLimit', message: '글자수 제한은 100~3,000 사이의 숫자로 입력해 주세요.' };
  }

  // countMode
  if (typeof body.countMode !== 'string' || !COUNT_MODES.includes(body.countMode)) {
    return { ok: false, field: 'countMode', message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.' };
  }

  // includeTitle
  if (typeof body.includeTitle !== 'boolean') {
    return { ok: false, field: 'includeTitle', message: '요청 형식이 올바르지 않아요. 새로고침 후 다시 시도해 주세요.' };
  }

  // text (20~5000)
  if (typeof body.text !== 'string') return { ok: false, field: 'text', message: '다듬으려면 본문을 20자 이상 작성해 주세요.' };
  const text = body.text.trim();
  const textLen = Array.from(text).length;
  if (textLen < LIMITS.reviseText.min) return { ok: false, field: 'text', message: '다듬으려면 본문을 20자 이상 작성해 주세요.' };
  if (textLen > LIMITS.reviseText.max) return { ok: false, field: 'text', message: '본문은 5,000자 이하여야 해요.' };

  // experience (선택)
  let experience = { situation: '', action: '', result: '', lesson: '' };
  if (body.experience && typeof body.experience === 'object') {
    experience = {
      situation: typeof body.experience.situation === 'string' ? body.experience.situation.trim() : '',
      action: typeof body.experience.action === 'string' ? body.experience.action.trim() : '',
      result: typeof body.experience.result === 'string' ? body.experience.result.trim() : '',
      lesson: typeof body.experience.lesson === 'string' ? body.experience.lesson.trim() : '',
    };
  }

  return {
    ok: true,
    value: {
      mode: body.mode,
      company,
      role,
      question,
      charLimit: body.charLimit,
      countMode: body.countMode,
      includeTitle: body.includeTitle,
      text,
      experience,
    },
  };
}
