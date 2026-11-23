// docs/03 §2 입력값 제한표와 동일하게 유지
export const LIMITS = {
  company: { min: 1, max: 50 },
  role: { min: 1, max: 50 },
  jobPosting: { min: 0, max: 3000 },
  question: { min: 5, max: 300 },
  charLimit: { min: 100, max: 3000 },
  experienceSituation: { min: 0, max: 1000 },
  experienceAction: { min: 10, max: 1000 },
  experienceResult: { min: 0, max: 1000 },
  experienceLesson: { min: 0, max: 1000 },
  feedbackText: { min: 50, max: 5000 },
  reviseText: { min: 20, max: 5000 },
};

export const MAX_QUESTIONS = 5;
export const DEFAULT_CHAR_LIMIT = 1000;
export const STORAGE_KEY = 'jaso-workshop:v1';
export const BACKUP_KEY = 'jaso-workshop:v1:backup';
export const SAVE_DEBOUNCE_MS = 500;
export const CLIENT_TIMEOUT_MS = 60000;
export const TOAST_DURATION_MS = 3000;

export const MESSAGES = {
  companyRequired: '회사명을 입력해 주세요.',
  companyMax: '회사명은 50자 이하로 입력해 주세요.',
  roleRequired: '지원 직무를 입력해 주세요.',
  roleMax: '지원 직무는 50자 이하로 입력해 주세요.',
  postingMax: '채용공고·인재상은 3,000자 이하로 입력해 주세요.',
  questionMin: '문항 내용을 5자 이상 입력해 주세요.',
  questionMax: '문항 내용은 300자 이하로 입력해 주세요.',
  charLimitRange: '글자수 제한은 100~3,000 사이의 숫자로 입력해 주세요.',
  expSituationMax: '상황·과제는 1,000자 이하로 입력해 주세요.',
  expActionRequired: '경험 메모의 [행동]을 10자 이상 입력해 주세요.',
  expActionMax: '행동은 1,000자 이하로 입력해 주세요.',
  expResultMax: '결과는 1,000자 이하로 입력해 주세요.',
  expLessonMax: '배운 점은 1,000자 이하로 입력해 주세요.',
  feedbackTextMin: '피드백을 받으려면 본문을 50자 이상 작성해 주세요.',
  feedbackTextMax: '본문은 5,000자 이하여야 해요.',
  reviseTextMin: '다듬으려면 본문을 20자 이상 작성해 주세요.',
  reviseTextMax: '본문은 5,000자 이하여야 해요.',
  maxQuestionsToast: '문항은 최대 5개까지 추가할 수 있어요.',
  saved: '저장됨',
  saveQuotaToast: '브라우저 저장 공간이 부족해 자동 저장하지 못했어요.',
  loadCorruptToast: '저장된 내용을 불러오지 못해 새로 시작해요.',
  resetDoneToast: '모든 내용을 지웠어요.',
};
