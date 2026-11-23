import { DEFAULT_CHAR_LIMIT, MAX_QUESTIONS } from './constants.js';

function generateId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'id_' + Math.random().toString(36).slice(2, 11);
}

export function createDefaultQuestion() {
  return {
    id: generateId(),
    question: '',
    charLimit: DEFAULT_CHAR_LIMIT,
    countMode: 'with_spaces',
    includeTitle: true,
    experience: {
      situation: '',
      action: '',
      result: '',
      lesson: '',
    },
    text: '',
    prevText: null,
    feedback: null,
    updatedAt: new Date().toISOString(),
  };
}

export function createDefaultState() {
  const initialQuestion = createDefaultQuestion();
  return {
    version: 1,
    profile: {
      company: '',
      role: '',
      jobPosting: '',
    },
    questions: [initialQuestion],
    activeQuestionId: initialQuestion.id,
  };
}

let appState = createDefaultState();
const runtimeState = {
  aiBusy: false,
  busyAction: null,
};

const listeners = new Set();

export function getState() {
  return appState;
}

export function getRuntime() {
  return runtimeState;
}

export function getActiveQuestion() {
  return (
    appState.questions.find((q) => q.id === appState.activeQuestionId) ||
    appState.questions[0]
  );
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function notify(reason) {
  for (const fn of listeners) {
    try {
      fn(appState, runtimeState, reason);
    } catch (e) {
      console.error('State subscriber error:', e);
    }
  }
}

export function replaceState(next) {
  appState = next;
  notify('replace');
}

export function resetState() {
  appState = createDefaultState();
  notify('reset');
}

export function setBusy(action) {
  runtimeState.aiBusy = Boolean(action);
  runtimeState.busyAction = action;
  notify('busy');
}

export function updateProfile(patch) {
  appState.profile = { ...appState.profile, ...patch };
  notify('profile');
}

export function addQuestion() {
  if (appState.questions.length >= MAX_QUESTIONS) return null;
  const newQ = createDefaultQuestion();
  appState.questions.push(newQ);
  appState.activeQuestionId = newQ.id;
  notify('add_question');
  return newQ;
}

export function removeQuestion(id) {
  if (appState.questions.length <= 1) return false;
  const index = appState.questions.findIndex((q) => q.id === id);
  if (index === -1) return false;

  appState.questions.splice(index, 1);
  if (appState.activeQuestionId === id) {
    const nextIndex = index > 0 ? index - 1 : 0;
    appState.activeQuestionId = appState.questions[nextIndex].id;
  }
  notify('remove_question');
  return true;
}

export function setActiveQuestion(id) {
  if (appState.activeQuestionId === id) return;
  const exists = appState.questions.some((q) => q.id === id);
  if (!exists) return;
  appState.activeQuestionId = id;
  notify('select_question');
}

export function updateQuestion(id, patch) {
  const target = appState.questions.find((q) => q.id === id);
  if (!target) return;
  Object.assign(target, patch, { updatedAt: new Date().toISOString() });
  notify('question');
}

export function updateExperience(id, patch) {
  const target = appState.questions.find((q) => q.id === id);
  if (!target) return;
  target.experience = { ...target.experience, ...patch };
  target.updatedAt = new Date().toISOString();
  notify('experience');
}
