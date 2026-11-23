import {
  getState,
  getActiveQuestion,
  subscribe,
  updateProfile,
  addQuestion,
  removeQuestion,
  setActiveQuestion,
  updateQuestion,
  updateExperience,
  replaceState,
  resetState,
  createDefaultState,
  setBusy,
  getRuntime,
} from './state.js';
import { loadState, saveState, clearState } from './storage.js';
import {
  renderAll,
  fillInputs,
  renderQuestionList,
  renderCounters,
  renderControls,
  renderFeedback,
} from './render.js';
import { showToast, confirmDialog, clearFieldErrors, showFieldErrors, setButtonLoading } from './ui.js';
import { SAVE_DEBOUNCE_MS, MESSAGES, MAX_QUESTIONS } from './constants.js';
import { validateFor } from './validate.js';
import { requestGenerate, requestFeedback, requestRevise, ApiError } from './api.js';
import { copyText, downloadTxt } from './export.js';

let saveTimer = null;
let lastQuotaToastTime = 0;

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);

  saveTimer = setTimeout(() => {
    const state = getState();
    const result = saveState(state);
    const saveStatusEl = document.getElementById('save-status');

    if (result === 'ok') {
      if (saveStatusEl) {
        saveStatusEl.textContent = MESSAGES.saved;
        setTimeout(() => {
          if (saveStatusEl.textContent === MESSAGES.saved) {
            saveStatusEl.textContent = '';
          }
        }, 2000);
      }
    } else if (result === 'quota') {
      const now = Date.now();
      if (now - lastQuotaToastTime > 10000) {
        showToast(MESSAGES.saveQuotaToast, 'error');
        lastQuotaToastTime = now;
      }
    }
  }, SAVE_DEBOUNCE_MS);
}

// 수정 예시 적용 (indexOf + slice 안전 치환)
function handleApplyExample(before, after) {
  const q = getActiveQuestion();
  const index = q.text.indexOf(before);
  if (index === -1) return;

  const nextText = q.text.slice(0, index) + after + q.text.slice(index + before.length);

  updateQuestion(q.id, {
    text: nextText,
    prevText: q.text,
  });

  const editor = document.getElementById('body-editor');
  if (editor) editor.value = nextText;

  showToast('수정 예시를 본문에 적용했어요.', 'success');
  renderFeedback(handleApplyExample);
}

async function handleGenerate() {
  const runtime = getRuntime();
  if (runtime.aiBusy) return;

  const state = getState();
  const q = getActiveQuestion();

  // 1. 유효성 검사
  const errors = validateFor('generate', state.profile, q);
  if (errors.length > 0) {
    showFieldErrors(errors);
    return;
  }
  clearFieldErrors();

  // 2. 본문 존재 시 덮어쓰기 다이얼로그
  if (q.text && q.text.trim().length > 0) {
    const confirmed = await confirmDialog({
      title: '새 초안으로 바꿀까요?',
      message: '현재 본문이 새 초안으로 바뀌어요. 마음에 들지 않으면 나중에 [직전 버전 복원]을 누를 수 있어요.',
      okLabel: '바꾸기',
    });
    if (!confirmed) return;
  }

  // 3. 로딩 상태 돌입
  setBusy('generate');
  const genBtn = document.getElementById('generate-btn');
  const aiStatusEl = document.getElementById('ai-status');

  setButtonLoading(genBtn, '초안 작성 중…');
  if (aiStatusEl) {
    aiStatusEl.textContent = 'AI가 작업하고 있어요. 최대 1분 정도 걸릴 수 있어요.';
  }

  const payload = {
    company: state.profile.company.trim(),
    role: state.profile.role.trim(),
    jobPosting: (state.profile.jobPosting || '').trim(),
    question: q.question.trim(),
    charLimit: q.charLimit,
    countMode: q.countMode,
    includeTitle: q.includeTitle,
    experience: {
      situation: (q.experience.situation || '').trim(),
      action: q.experience.action.trim(),
      result: (q.experience.result || '').trim(),
      lesson: (q.experience.lesson || '').trim(),
    },
  };

  try {
    const data = await requestGenerate(payload);

    // 성공 처리
    const currentText = q.text || '';
    const newPrevText = currentText.trim().length > 0 ? currentText : q.prevText;

    updateQuestion(q.id, {
      text: data.text,
      prevText: newPrevText,
    });

    const editor = document.getElementById('body-editor');
    if (editor) editor.value = data.text;

    if (data.overLimit) {
      showToast('글자수 제한을 넘었어요. [글자수 맞추기]를 눌러 보세요.', 'info');
    } else {
      showToast('초안을 만들었어요. 내용을 꼭 확인해 주세요.', 'success');
    }
  } catch (error) {
    if (error instanceof ApiError && error.code === 'INVALID_INPUT' && error.field) {
      showToast(error.userMessage, 'error');
    } else {
      showToast(error.userMessage || '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.', 'error');
    }
  } finally {
    setBusy(null);
    setButtonLoading(genBtn, null);
    if (aiStatusEl) aiStatusEl.textContent = '';
  }
}

async function handleFeedback() {
  const runtime = getRuntime();
  if (runtime.aiBusy) return;

  const state = getState();
  const q = getActiveQuestion();

  // 1. 유효성 검사
  const errors = validateFor('feedback', state.profile, q);
  if (errors.length > 0) {
    showFieldErrors(errors);
    return;
  }
  clearFieldErrors();

  // 2. 로딩 상태 돌입
  setBusy('feedback');
  const fbBtn = document.getElementById('feedback-btn');
  const aiStatusEl = document.getElementById('ai-status');
  const emptyEl = document.getElementById('feedback-empty');
  const loadingEl = document.getElementById('feedback-loading');
  const contentEl = document.getElementById('feedback-content');

  setButtonLoading(fbBtn, '피드백 분석 중…');
  if (aiStatusEl) {
    aiStatusEl.textContent = 'AI가 작업하고 있어요. 최대 1분 정도 걸릴 수 있어요.';
  }
  if (emptyEl) emptyEl.hidden = true;
  if (contentEl) contentEl.hidden = true;
  if (loadingEl) loadingEl.hidden = false;

  const payload = {
    company: state.profile.company.trim(),
    role: state.profile.role.trim(),
    jobPosting: (state.profile.jobPosting || '').trim(),
    question: q.question.trim(),
    charLimit: q.charLimit,
    countMode: q.countMode,
    text: q.text.trim(),
  };

  try {
    const data = await requestFeedback(payload);
    updateQuestion(q.id, {
      feedback: {
        data,
        basedOnText: q.text,
        createdAt: new Date().toISOString(),
      },
    });
    renderFeedback(handleApplyExample);
    showToast('피드백을 받았어요.', 'success');
  } catch (error) {
    renderFeedback(handleApplyExample);
    showToast(error.userMessage || '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.', 'error');
  } finally {
    setBusy(null);
    setButtonLoading(fbBtn, null);
    if (aiStatusEl) aiStatusEl.textContent = '';
  }
}

async function handleRevise(mode) {
  const runtime = getRuntime();
  if (runtime.aiBusy) return;

  const state = getState();
  const q = getActiveQuestion();

  // 1. 유효성 검사
  const errors = validateFor('revise', state.profile, q);
  if (errors.length > 0) {
    showFieldErrors(errors);
    return;
  }
  clearFieldErrors();

  // 2. 로딩 상태
  setBusy('revise');
  const btnIdMap = {
    concise: 'revise-concise-btn',
    specific: 'revise-specific-btn',
    fit_length: 'revise-fit-btn',
  };
  const targetBtn = document.getElementById(btnIdMap[mode]);
  const aiStatusEl = document.getElementById('ai-status');

  setButtonLoading(targetBtn, '다듬는 중…');
  if (aiStatusEl) {
    aiStatusEl.textContent = 'AI가 작업하고 있어요. 최대 1분 정도 걸릴 수 있어요.';
  }

  const payload = {
    mode,
    company: state.profile.company.trim(),
    role: state.profile.role.trim(),
    question: q.question.trim(),
    charLimit: q.charLimit,
    countMode: q.countMode,
    includeTitle: q.includeTitle,
    experience: {
      situation: (q.experience.situation || '').trim(),
      action: (q.experience.action || '').trim(),
      result: (q.experience.result || '').trim(),
      lesson: (q.experience.lesson || '').trim(),
    },
    text: q.text.trim(),
  };

  try {
    const data = await requestRevise(payload);

    updateQuestion(q.id, {
      text: data.text,
      prevText: q.text,
    });

    const editor = document.getElementById('body-editor');
    if (editor) editor.value = data.text;

    if (data.overLimit) {
      showToast('글자수 제한을 넘었어요. [글자수 맞추기]를 눌러 보세요.', 'info');
    } else {
      showToast('본문을 다듬었어요. 마음에 들지 않으면 [직전 버전 복원]을 누르세요.', 'success');
    }
  } catch (error) {
    showToast(error.userMessage || '일시적인 오류가 발생했어요. 잠시 후 다시 시도해 주세요.', 'error');
  } finally {
    setBusy(null);
    setButtonLoading(targetBtn, null);
    if (aiStatusEl) aiStatusEl.textContent = '';
  }
}

function initEvents() {
  // 1. 지원 정보 이벤트
  document.getElementById('company-input')?.addEventListener('input', (e) => {
    updateProfile({ company: e.target.value });
    clearFieldErrors();
  });

  document.getElementById('role-input')?.addEventListener('input', (e) => {
    updateProfile({ role: e.target.value });
    clearFieldErrors();
  });

  document.getElementById('posting-input')?.addEventListener('input', (e) => {
    updateProfile({ jobPosting: e.target.value });
    clearFieldErrors();
  });

  // 2. 문항 설정 이벤트
  document.getElementById('question-input')?.addEventListener('input', (e) => {
    const active = getActiveQuestion();
    updateQuestion(active.id, { question: e.target.value });
    clearFieldErrors();
  });

  document.getElementById('char-limit-input')?.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    const active = getActiveQuestion();
    if (val === '') {
      updateQuestion(active.id, { charLimit: null });
    } else {
      const num = Number(val);
      updateQuestion(active.id, { charLimit: Number.isInteger(num) ? num : null });
    }
    clearFieldErrors();
  });

  document.getElementById('count-mode-select')?.addEventListener('change', (e) => {
    const active = getActiveQuestion();
    updateQuestion(active.id, { countMode: e.target.value });
  });

  document.getElementById('include-title-checkbox')?.addEventListener('change', (e) => {
    const active = getActiveQuestion();
    updateQuestion(active.id, { includeTitle: e.target.checked });
  });

  // 3. 경험 메모 이벤트
  document.getElementById('exp-situation')?.addEventListener('input', (e) => {
    const active = getActiveQuestion();
    updateExperience(active.id, { situation: e.target.value });
    clearFieldErrors();
  });

  document.getElementById('exp-action')?.addEventListener('input', (e) => {
    const active = getActiveQuestion();
    updateExperience(active.id, { action: e.target.value });
    clearFieldErrors();
  });

  document.getElementById('exp-result')?.addEventListener('input', (e) => {
    const active = getActiveQuestion();
    updateExperience(active.id, { result: e.target.value });
    clearFieldErrors();
  });

  document.getElementById('exp-lesson')?.addEventListener('input', (e) => {
    const active = getActiveQuestion();
    updateExperience(active.id, { lesson: e.target.value });
    clearFieldErrors();
  });

  // 4. 본문 에디터
  document.getElementById('body-editor')?.addEventListener('input', (e) => {
    const active = getActiveQuestion();
    updateQuestion(active.id, { text: e.target.value });
    clearFieldErrors();
    renderFeedback(handleApplyExample);
  });

  // 5. 문항 목록 선택
  document.getElementById('question-list')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.question-list__item');
    if (!btn || !btn.dataset.id) return;
    setActiveQuestion(btn.dataset.id);
    fillInputs();
    clearFieldErrors();
    renderFeedback(handleApplyExample);
  });

  // 6. 문항 추가
  document.getElementById('add-question-btn')?.addEventListener('click', () => {
    const state = getState();
    if (state.questions.length >= MAX_QUESTIONS) {
      showToast(MESSAGES.maxQuestionsToast, 'info');
      return;
    }
    const newQ = addQuestion();
    if (newQ) {
      fillInputs();
      clearFieldErrors();
      renderFeedback(handleApplyExample);
      document.getElementById('question-input')?.focus();
    }
  });

  // 7. 문항 삭제
  const deleteBtn = document.getElementById('delete-question-btn');
  deleteBtn?.addEventListener('click', async () => {
    const state = getState();
    if (state.questions.length <= 1) return;

    const confirmed = await confirmDialog({
      title: '문항을 삭제할까요?',
      message: '작성한 문항 내용과 본문이 모두 사라져요.',
      okLabel: '삭제',
      danger: true,
    });

    if (confirmed) {
      const active = getActiveQuestion();
      removeQuestion(active.id);
      fillInputs();
      clearFieldErrors();
      renderFeedback(handleApplyExample);
      deleteBtn.focus();
    } else {
      deleteBtn.focus();
    }
  });

  // 8. 전체 초기화
  document.getElementById('reset-btn')?.addEventListener('click', async () => {
    const confirmed = await confirmDialog({
      title: '모든 내용을 지울까요?',
      message: '지원 정보, 모든 문항과 작성한 본문이 완전히 삭제돼요. 되돌릴 수 없어요.',
      okLabel: '전체 초기화',
      danger: true,
    });

    if (confirmed) {
      clearState();
      resetState();
      fillInputs();
      clearFieldErrors();
      renderFeedback(handleApplyExample);
      showToast(MESSAGES.resetDoneToast, 'info');
    }
  });

  // 9. AI 초안 생성
  document.getElementById('generate-btn')?.addEventListener('click', handleGenerate);

  // 10. AI 피드백
  document.getElementById('feedback-btn')?.addEventListener('click', handleFeedback);

  // 11. AI 다듬기 3종
  document.getElementById('revise-concise-btn')?.addEventListener('click', () => handleRevise('concise'));
  document.getElementById('revise-specific-btn')?.addEventListener('click', () => handleRevise('specific'));
  document.getElementById('revise-fit-btn')?.addEventListener('click', () => handleRevise('fit_length'));

  // 12. 직전 버전 복원
  document.getElementById('restore-btn')?.addEventListener('click', () => {
    const q = getActiveQuestion();
    if (!q.prevText) return;

    const restoredText = q.prevText;
    updateQuestion(q.id, {
      text: restoredText,
      prevText: null,
    });

    const editor = document.getElementById('body-editor');
    if (editor) editor.value = restoredText;

    showToast('직전 버전으로 되돌렸어요.', 'info');
    renderFeedback(handleApplyExample);
  });

  // 13. 본문 복사
  document.getElementById('copy-btn')?.addEventListener('click', async () => {
    const q = getActiveQuestion();
    const text = (q.text || '').trim();
    if (!text) return;

    const ok = await copyText(q.text);
    if (ok) {
      showToast('본문을 복사했어요.', 'success');
    } else {
      showToast('복사하지 못했어요. 본문을 직접 선택해 복사해 주세요.', 'error');
    }
  });

  // 14. TXT 내보내기
  document.getElementById('export-btn')?.addEventListener('click', () => {
    const state = getState();
    downloadTxt(state);
    showToast('TXT 파일을 저장했어요.', 'success');
  });
}

function init() {
  const { state: loaded, status } = loadState();

  if (status === 'ok') {
    replaceState(loaded);
  } else if (status === 'corrupt') {
    replaceState(createDefaultState());
    showToast(MESSAGES.loadCorruptToast, 'error');
  } else {
    replaceState(createDefaultState());
  }

  fillInputs();
  renderAll(handleApplyExample);
  initEvents();

  subscribe((state, runtime, reason) => {
    if (reason !== 'busy') {
      scheduleSave();
    }
    renderQuestionList();
    renderCounters();
    renderControls();
  });
}

window.addEventListener('DOMContentLoaded', init);
