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

export const COUNT_MODES = ['with_spaces', 'without_spaces'];
export const REVISE_MODES = ['concise', 'specific', 'fit_length'];
