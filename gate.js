// 생성물: scripts/build-client.js (src/Gate.js) — 직접 수정하지 마세요
// 시작 게이트 순수 함수 — 서버·앱 화면·공개 페이지(site/gate.js) 공용. GAS 서비스 호출 없음.

/** 시작 링크: base#e=<이메일>[&r=family] */
function gateStartLink(base, email, role) {
  var e = String(email || '').trim().toLowerCase();
  return base + '#e=' + encodeURIComponent(e) + (role === 'family' ? '&r=family' : '');
}

/** 해시 → { email, role }. '+' 를 공백으로 바꾸지 않도록 직접 푼다. */
function gateParseHash(hash) {
  var h = String(hash || '').replace(/^#/, '');
  var email = null, role = 'buyer';
  var parts = h ? h.split('&') : [];
  for (var i = 0; i < parts.length; i++) {
    var eq = parts[i].indexOf('=');
    if (eq < 0) continue;
    var k = parts[i].slice(0, eq), v;
    try { v = decodeURIComponent(parts[i].slice(eq + 1)); } catch (err) { v = null; }
    if (v === null) continue;
    if (k === 'e') {
      v = v.trim().toLowerCase();
      if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) email = v;
    } else if (k === 'r' && v === 'family') {
      role = 'family';
    }
  }
  return { email: email, role: role };
}

/** UA → { os, inApp } */
function gateBrowser(ua) {
  ua = String(ua || '');
  var os = /iPhone|iPad|iPod/.test(ua) ? 'ios' : /Android/.test(ua) ? 'android' : 'other';
  var inApp = null;
  if (/KAKAOTALK/i.test(ua)) inApp = 'kakao';
  else if (/NAVER\(/.test(ua)) inApp = 'naver';
  else if (/Instagram/.test(ua)) inApp = 'instagram';
  else if (/FBAN|FBAV|FB_IAB/.test(ua)) inApp = 'facebook';
  else if (/Line\//.test(ua)) inApp = 'line';
  else if (/DaumApps/.test(ua)) inApp = 'daum';
  else if (/; wv\)/.test(ua)) inApp = 'webview';
  return { os: os, inApp: inApp };
}

/** 앱 안 브라우저를 벗어나는 주소. 방법이 없으면 null. */
function gateEscapeUrl(info, url) {
  if (!info || !info.inApp) return null;
  if (info.inApp === 'kakao') return 'kakaotalk://web/openExternal?url=' + encodeURIComponent(url);
  if (info.os === 'android') return 'intent://' + String(url).replace(/^https?:\/\//, '') + '#Intent;scheme=https;package=com.android.chrome;end';
  return null;
}

/** 구글 계정 선택 주소(이메일 있으면 미리 고름) */
function gateChooserUrl(appUrl, email) {
  return email
    ? 'https://accounts.google.com/AccountChooser?Email=' + encodeURIComponent(email) + '&continue=' + encodeURIComponent(appUrl)
    : appUrl;
}
