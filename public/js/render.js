import { getState, getRuntime, getActiveQuestion } from './state.js';
import { countChars, countPlaceholders } from './counter.js';

export function fillInputs() {
  const state = getState();
  const q = getActiveQuestion();

  // 프로필
  const compInput = document.getElementById('company-input');
  if (compInput) compInput.value = state.profile.company;

  const roleInput = document.getElementById('role-input');
  if (roleInput) roleInput.value = state.profile.role;

  const postingInput = document.getElementById('posting-input');
  if (postingInput) postingInput.value = state.profile.jobPosting;

  // 문항 설정
  const qInput = document.getElementById('question-input');
  if (qInput) qInput.value = q.question;

  const limitInput = document.getElementById('char-limit-input');
  if (limitInput) limitInput.value = q.charLimit != null ? q.charLimit : '';

  const modeSelect = document.getElementById('count-mode-select');
  if (modeSelect) modeSelect.value = q.countMode;

  const titleCheck = document.getElementById('include-title-checkbox');
  if (titleCheck) titleCheck.checked = q.includeTitle;

  // 경험 메모
  const expSit = document.getElementById('exp-situation');
  if (expSit) expSit.value = q.experience.situation;

  const expAct = document.getElementById('exp-action');
  if (expAct) expAct.value = q.experience.action;

  const expRes = document.getElementById('exp-result');
  if (expRes) expRes.value = q.experience.result;

  const expLes = document.getElementById('exp-lesson');
  if (expLes) expLes.value = q.experience.lesson;

  // 본문 에디터
  const editor = document.getElementById('body-editor');
  if (editor) editor.value = q.text;
}

export function renderQuestionList() {
  const state = getState();
  const listEl = document.getElementById('question-list');
  const countBadge = document.getElementById('question-count');
  const titleEl = document.getElementById('editor-title');
  if (!listEl) return;

  listEl.textContent = '';

  const activeIdx = state.questions.findIndex((q) => q.id === state.activeQuestionId);
  const currentIdx = activeIdx >= 0 ? activeIdx : 0;

  if (titleEl) {
    titleEl.textContent = `문항 ${currentIdx + 1}`;
  }

  if (countBadge) {
    countBadge.textContent = `${state.questions.length} / 5`;
  }

  state.questions.forEach((q, idx) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'question-list__item';
    btn.dataset.id = q.id;

    if (q.id === state.activeQuestionId) {
      btn.setAttribute('aria-current', 'true');
    }

    const numSpan = document.createElement('span');
    numSpan.className = 'question-list__number';
    numSpan.textContent = `문항 ${idx + 1}`;

    const prevSpan = document.createElement('span');
    prevSpan.className = 'question-list__preview';
    const trimmed = (q.question || '').trim();
    if (!trimmed) {
      prevSpan.textContent = '문항 내용을 입력하세요';
    } else {
      const chars = Array.from(trimmed);
      if (chars.length > 20) {
        prevSpan.textContent = chars.slice(0, 20).join('') + '…';
      } else {
        prevSpan.textContent = trimmed;
      }
    }

    btn.appendChild(numSpan);
    btn.appendChild(prevSpan);
    li.appendChild(btn);
    listEl.appendChild(li);
  });
}

export function renderCounters() {
  const state = getState();
  const q = getActiveQuestion();

  // 채용공고 카운트
  const postingCountEl = document.getElementById('posting-input-count');
  if (postingCountEl) {
    const count = Array.from((state.profile.jobPosting || '').trim()).length;
    postingCountEl.textContent = `${count.toLocaleString('ko-KR')} / 3,000`;
  }

  // 문항 내용 카운트
  const qCountEl = document.getElementById('question-input-count');
  if (qCountEl) {
    const count = Array.from((q.question || '').trim()).length;
    qCountEl.textContent = `${count.toLocaleString('ko-KR')} / 300`;
  }

  // 경험 메모 카운트
  const sitCountEl = document.getElementById('exp-situation-count');
  if (sitCountEl) {
    const count = Array.from((q.experience.situation || '').trim()).length;
    sitCountEl.textContent = `${count.toLocaleString('ko-KR')} / 1,000`;
  }
  const actCountEl = document.getElementById('exp-action-count');
  if (actCountEl) {
    const count = Array.from((q.experience.action || '').trim()).length;
    actCountEl.textContent = `${count.toLocaleString('ko-KR')} / 1,000`;
  }
  const resCountEl = document.getElementById('exp-result-count');
  if (resCountEl) {
    const count = Array.from((q.experience.result || '').trim()).length;
    resCountEl.textContent = `${count.toLocaleString('ko-KR')} / 1,000`;
  }
  const lesCountEl = document.getElementById('exp-lesson-count');
  if (lesCountEl) {
    const count = Array.from((q.experience.lesson || '').trim()).length;
    lesCountEl.textContent = `${count.toLocaleString('ko-KR')} / 1,000`;
  }

  // 본문 에디터 카운터
  const withSpacesEl = document.getElementById('count-with-spaces');
  const withoutSpacesEl = document.getElementById('count-without-spaces');
  const statusEl = document.getElementById('count-status');
  const noticeEl = document.getElementById('placeholder-notice');

  if (withSpacesEl && withoutSpacesEl && statusEl) {
    const { withSpaces, withoutSpaces } = countChars(q.text);
    const limit = q.charLimit;
    const mode = q.countMode;

    if (mode === 'with_spaces') {
      withSpacesEl.style.fontWeight = '600';
      withoutSpacesEl.style.fontWeight = '400';
      withSpacesEl.textContent =
        limit != null
          ? `공백 포함 ${withSpaces.toLocaleString('ko-KR')} / ${limit.toLocaleString('ko-KR')}자`
          : `공백 포함 ${withSpaces.toLocaleString('ko-KR')}자`;
      withoutSpacesEl.textContent = `공백 제외 ${withoutSpaces.toLocaleString('ko-KR')}자`;
    } else {
      withSpacesEl.style.fontWeight = '400';
      withoutSpacesEl.style.fontWeight = '600';
      withSpacesEl.textContent = `공백 포함 ${withSpaces.toLocaleString('ko-KR')}자`;
      withoutSpacesEl.textContent =
        limit != null
          ? `공백 제외 ${withoutSpaces.toLocaleString('ko-KR')} / ${limit.toLocaleString('ko-KR')}자`
          : `공백 제외 ${withoutSpaces.toLocaleString('ko-KR')}자`;
    }

    statusEl.className = 'counter__status';
    statusEl.textContent = '';

    const currentVal = mode === 'with_spaces' ? withSpaces : withoutSpaces;

    if (limit != null && currentVal > 0) {
      const threshold = Math.ceil(limit * 0.9);
      if (currentVal > limit) {
        statusEl.className = 'counter__status counter__status--danger';
        statusEl.textContent = `${(currentVal - limit).toLocaleString('ko-KR')}자 초과`;
      } else if (currentVal >= threshold) {
        statusEl.className = 'counter__status counter__status--success';
        statusEl.textContent = '적정';
      }
    }
  }

  if (noticeEl) {
    const pCount = countPlaceholders(q.text);
    if (pCount > 0) {
      noticeEl.textContent = `본문에 [보완 필요] 표시가 ${pCount}개 있어요. 실제 내용으로 바꿔 주세요.`;
      noticeEl.hidden = false;
    } else {
      noticeEl.textContent = '';
      noticeEl.hidden = true;
    }
  }
}

export function renderControls() {
  const state = getState();
  const runtime = getRuntime();
  const q = getActiveQuestion();

  const addBtn = document.getElementById('add-question-btn');
  if (addBtn) {
    addBtn.disabled = runtime.aiBusy || state.questions.length >= 5;
  }

  const delBtn = document.getElementById('delete-question-btn');
  if (delBtn) {
    delBtn.disabled = runtime.aiBusy || state.questions.length <= 1;
  }

  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) {
    resetBtn.disabled = runtime.aiBusy;
  }

  const copyBtn = document.getElementById('copy-btn');
  if (copyBtn) {
    copyBtn.disabled = runtime.aiBusy || !q.text || q.text.trim().length === 0;
  }

  const restoreBtn = document.getElementById('restore-btn');
  if (restoreBtn) {
    restoreBtn.disabled = runtime.aiBusy || q.prevText === null;
  }

  const editor = document.getElementById('body-editor');
  if (editor) {
    editor.readOnly = runtime.aiBusy;
  }

  const aiButtons = [
    'generate-btn',
    'feedback-btn',
    'revise-concise-btn',
    'revise-specific-btn',
    'revise-fit-btn',
  ];
  for (const id of aiButtons) {
    const btn = document.getElementById(id);
    if (btn) btn.disabled = runtime.aiBusy;
  }
}

export function renderFeedback(onApplyExample = null) {
  const q = getActiveQuestion();
  const emptyEl = document.getElementById('feedback-empty');
  const loadingEl = document.getElementById('feedback-loading');
  const contentEl = document.getElementById('feedback-content');
  const staleEl = document.getElementById('feedback-stale');

  if (!emptyEl || !loadingEl || !contentEl) return;

  if (!q.feedback || !q.feedback.data) {
    emptyEl.hidden = false;
    loadingEl.hidden = true;
    contentEl.hidden = true;
    if (staleEl) staleEl.hidden = true;
    return;
  }

  emptyEl.hidden = true;
  loadingEl.hidden = true;
  contentEl.hidden = false;

  const data = q.feedback.data;

  if (staleEl) {
    staleEl.hidden = q.text === q.feedback.basedOnText;
  }

  // 1. 요약
  const summaryEl = document.getElementById('feedback-summary');
  if (summaryEl) summaryEl.textContent = data.summary || '';

  // 2. 점수 (4개 고정 순서)
  const scoresEl = document.getElementById('feedback-scores');
  if (scoresEl) {
    scoresEl.textContent = '';
    const scoreConfigs = [
      { key: 'relevance', label: '문항 적합성', dotClass: 'dot--sky' },
      { key: 'specificity', label: '구체성', dotClass: 'dot--orange' },
      { key: 'jobFit', label: '직무 연관성', dotClass: 'dot--teal' },
      { key: 'readability', label: '가독성', dotClass: 'dot--purple' },
    ];

    scoreConfigs.forEach((cfg) => {
      const scoreVal = data.scores?.[cfg.key] ?? 0;
      const li = document.createElement('li');
      li.className = 'score';

      const labelSpan = document.createElement('span');
      labelSpan.className = 'score__label';
      const dot = document.createElement('span');
      dot.className = `dot ${cfg.dotClass}`;
      dot.setAttribute('aria-hidden', 'true');
      labelSpan.appendChild(dot);
      labelSpan.appendChild(document.createTextNode(cfg.label));

      const barSpan = document.createElement('span');
      barSpan.className = 'score__bar';
      barSpan.setAttribute('role', 'img');
      barSpan.setAttribute('aria-label', `5점 만점에 ${scoreVal}점`);

      const fillSpan = document.createElement('span');
      fillSpan.className = 'score__fill';
      fillSpan.style.width = `${scoreVal * 20}%`;
      barSpan.appendChild(fillSpan);

      const valSpan = document.createElement('span');
      valSpan.className = 'score__value';
      valSpan.textContent = `${scoreVal} / 5`;

      li.appendChild(labelSpan);
      li.appendChild(barSpan);
      li.appendChild(valSpan);
      scoresEl.appendChild(li);
    });
  }

  // 3. 강점
  const strengthsEl = document.getElementById('feedback-strengths');
  if (strengthsEl) {
    strengthsEl.textContent = '';
    if (!data.strengths || data.strengths.length === 0) {
      const li = document.createElement('li');
      li.textContent = '없음';
      li.style.color = 'var(--color-ink-muted)';
      strengthsEl.appendChild(li);
    } else {
      data.strengths.forEach((s) => {
        const li = document.createElement('li');
        li.textContent = s;
        strengthsEl.appendChild(li);
      });
    }
  }

  // 4. 개선점
  const improvementsEl = document.getElementById('feedback-improvements');
  if (improvementsEl) {
    improvementsEl.textContent = '';
    if (!data.improvements || data.improvements.length === 0) {
      const li = document.createElement('li');
      li.textContent = '없음';
      li.style.color = 'var(--color-ink-muted)';
      improvementsEl.appendChild(li);
    } else {
      data.improvements.forEach((imp) => {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.className = 'feedback__issue';
        strong.textContent = imp.issue + ' : ';
        li.appendChild(strong);
        li.appendChild(document.createTextNode(imp.suggestion));
        improvementsEl.appendChild(li);
      });
    }
  }

  // 5. 수정 예시
  const examplesEl = document.getElementById('feedback-examples');
  if (examplesEl) {
    examplesEl.textContent = '';
    if (!data.rewriteExamples || data.rewriteExamples.length === 0) {
      const li = document.createElement('li');
      li.textContent = '없음';
      li.style.color = 'var(--color-ink-muted)';
      examplesEl.appendChild(li);
    } else {
      data.rewriteExamples.forEach((ex) => {
        const li = document.createElement('li');
        li.className = 'example';

        const labelBefore = document.createElement('p');
        labelBefore.className = 'example__label';
        labelBefore.textContent = '원문';

        const pBefore = document.createElement('p');
        pBefore.className = 'example__before';
        pBefore.textContent = ex.before;

        const labelAfter = document.createElement('p');
        labelAfter.className = 'example__label';
        labelAfter.textContent = '수정안';

        const pAfter = document.createElement('p');
        pAfter.className = 'example__after';
        pAfter.textContent = ex.after;

        const applyBtn = document.createElement('button');
        applyBtn.type = 'button';
        applyBtn.className = 'btn btn--utility example__apply';

        // 적용 가능 여부 판별 (현재 본문에 before가 포함되어 있는가)
        const canApply = q.text.includes(ex.before);
        if (canApply) {
          applyBtn.textContent = '본문에 적용';
          applyBtn.disabled = false;
          if (onApplyExample) {
            applyBtn.addEventListener('click', () => onApplyExample(ex.before, ex.after));
          }
        } else {
          applyBtn.textContent = '본문이 바뀌어 적용할 수 없어요';
          applyBtn.disabled = true;
        }

        li.appendChild(labelBefore);
        li.appendChild(pBefore);
        li.appendChild(labelAfter);
        li.appendChild(pAfter);
        li.appendChild(applyBtn);
        examplesEl.appendChild(li);
      });
    }
  }
}

export function renderAll(onApplyExample = null) {
  renderQuestionList();
  renderCounters();
  renderControls();
  renderFeedback(onApplyExample);
}
