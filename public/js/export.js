import { countChars } from './counter.js';

export async function copyText(text) {
  if (!text) return false;

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {}
  }

  // 폴백 방식 (document.execCommand)
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '-9999px';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch {
    return false;
  }
}

export function downloadTxt(state) {
  const companyRaw = (state.profile.company || '').trim();
  const roleRaw = (state.profile.role || '').trim();

  const safeCompany = companyRaw ? companyRaw.replace(/[\\/:*?"<>|\s]+/g, '_').slice(0, 30) : '이름없음';

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateFormatted = `${year}-${month}-${day}`;
  const dateStr8 = `${year}${month}${day}`;

  const fileName = `자소서_${safeCompany}_${dateStr8}.txt`;

  const headerCompany = companyRaw || '미입력';
  const headerRole = roleRaw || '미입력';

  let content = `[${headerCompany}] ${headerRole} 자기소개서\n작성일: ${dateFormatted}\n\n`;

  state.questions.forEach((q, idx) => {
    const qNumber = idx + 1;
    const qContent = (q.question || '').trim() || '미입력';
    const basisStr = q.countMode === 'with_spaces' ? '공백 포함' : '공백 제외';
    const limitStr = q.charLimit != null ? `${q.charLimit.toLocaleString('ko-KR')}자, ${basisStr} 기준` : `${basisStr} 기준`;

    const bodyText = (q.text || '').trim();
    const bodyContent = bodyText.length > 0 ? q.text : '(작성된 본문 없음)';

    const { withSpaces, withoutSpaces } = countChars(q.text);

    content += `${qNumber}. ${qContent} (${limitStr})\n`;
    content += `${bodyContent}\n`;
    content += `(공백 포함 ${withSpaces.toLocaleString('ko-KR')}자 / 공백 제외 ${withoutSpaces.toLocaleString('ko-KR')}자)\n\n`;
  });

  // UTF-8 BOM (\uFEFF) 추가
  const blob = new Blob(['\uFEFF' + content.trimEnd()], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
