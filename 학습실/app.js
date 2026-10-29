'use strict';
(() => {
  const chapters = window.STUDY_CONTENT;
  const key = 'algo2_2026_2_midterm_v1';
  const $ = id => document.getElementById(id);
  const escape = s => String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const sections = chapters.flatMap(c=>c.sections.map(s=>({c,s,key:c.id+'/'+s.id})));
  const known = new Set(sections.map(x=>x.key));
  let state = {done:{},answers:{}}, storage = null, warning = '';
  const status = message => { $('storage-status').textContent = message; };
  const fail = message => { warning=message;storage=null;$('storage-status').classList.add('warning');status(message); };
  try {
    storage=window.localStorage;
    const raw=storage.getItem(key);
    if (raw !== null) {
      const obj=JSON.parse(raw);
      if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !obj.done || !obj.answers || typeof obj.done!=='object' || typeof obj.answers!=='object' || Array.isArray(obj.done) || Array.isArray(obj.answers)) throw new Error('손상');
      for (const [k,v] of Object.entries(obj.done)) { if (!known.has(k) || typeof v!=='boolean') throw new Error('형식');state.done[k]=v; }
      for (const [k,v] of Object.entries(obj.answers)) { if (!known.has(k) || typeof v!=='string') throw new Error('형식');state.answers[k]=v; }
    }
    storage.setItem(key,JSON.stringify(state));
    status('학습 기록은 이 브라우저에 저장됩니다. 다른 브라우저·기기로 자동 동기화되지 않습니다.');
  } catch(e) { fail('저장된 기록을 읽거나 저장할 수 없습니다. 기존 기록은 삭제하지 않았습니다. 이번 입력은 이 화면에서만 유지되며 새로고침하면 사라질 수 있습니다.'); }
  function save() {
    if(!storage)return;
    try { storage.setItem(key,JSON.stringify(state));status('학습 기록과 답안이 이 브라우저에 저장되었습니다.'); }
    catch(e){fail('저장 공간 또는 브라우저 제한으로 저장하지 못했습니다. 입력은 현재 화면에서 유지되지만 새로고침하면 사라질 수 있습니다.');}
  }
  let active = null;
  function progress(){
    $('progress').textContent=`${Object.values(state.done).filter(Boolean).length} / ${sections.length}절 학습 완료`;
    for(const a of $('chapters').querySelectorAll('a')){
      const c=chapters.find(x=>x.id===a.dataset.chapter);
      a.querySelector('small').textContent=`${c.sections.filter(s=>state.done[c.id+'/'+s.id]).length}/${c.sections.length}`;
    }
  }
  $('chapters').innerHTML=chapters.map(c=>`<a class="chapter-link" data-chapter="${c.id}" href="#${c.id}/${c.sections[0].id}"><span class="num">${c.number}</span><span>${escape(c.title)}</span><small></small></a>`).join('');
  function decorate(container){
    for(const table of container.querySelectorAll('table')){const wrap=document.createElement('div');wrap.className='table-scroll';wrap.tabIndex=0;wrap.setAttribute('role','region');wrap.setAttribute('aria-label','가로로 이동할 수 있는 학습 표');table.before(wrap);wrap.append(table);}
    for(const p of container.querySelectorAll('pre')){p.tabIndex=0;p.setAttribute('aria-label','코드 또는 의사코드. 가로로 이동할 수 있습니다.');}
  }
  function render(c){
    active=c.id;
    for(const a of $('chapters').querySelectorAll('a')){const yes=a.dataset.chapter===c.id;a.classList.toggle('active',yes);if(yes)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');}
    const idx=chapters.indexOf(c);
    $('lesson').innerHTML=`<div class="hero"><div class="kicker">LECTURE ${c.number} / ALGORITHM NOTES</div><h1 tabindex="-1">${escape(c.title)}</h1><p>${escape(c.description)}</p><div class="hero-foot"><span>${c.sections.length}개 절 · 개념 / 예제 / 직접 풀기 · 단계별 실행 보기</span><span>원본 강의자료는 배포본에 포함하지 않습니다.</span></div></div><nav class="toc" aria-label="현재 강의 소절">${c.sections.map(s=>`<a href="#${c.id}/${s.id}">${escape(s.title)}</a>`).join('')}</nav>`+c.sections.map(s=>{
      const id=c.id+'/'+s.id;
      const page=s.pages.length===1?`p. ${s.pages[0]}`:`pp. ${s.pages[0]}–${s.pages[1]}`;
      let q='';
      if(s.quiz){q=`<div class="exercise"><div class="tag">직접 풀기 · 새로 만든 연습</div><h3>설명을 덮고 확인해 보세요</h3><div>${s.quiz.question}</div><label for="answer-${s.id}">내 답안</label><textarea id="answer-${s.id}" data-answer="${id}" ${s.quiz.code?'class="code"':''} spellcheck="false" aria-describedby="help-${s.id}" placeholder="정답을 열기 전에 풀이를 적어 보세요."></textarea><p id="help-${s.id}" class="input-help">${s.quiz.code?'Tab: 4칸 들여쓰기 · Esc 후 Tab / Shift+Tab: 입력창 밖으로 이동':'답안을 적은 뒤 해설과 비교하세요. 자동 채점하지 않습니다.'}</p><details><summary>정답·해설 보기</summary><div class="answer">${s.quiz.answer}</div><p class="source-note">학습용 자체 해설입니다. 공식 정답이 아닙니다.</p></details></div>`;}
      return `<section class="section" id="${s.id}"><div class="section-head"><h2 tabindex="-1">${escape(s.title)}</h2><label class="done"><input type="checkbox" data-done="${id}" ${state.done[id]?'checked':''}>학습 완료</label></div><div class="source"><span>Lec.${c.number} · ${page}</span> <span>· 표지 포함 PDF 쪽수</span></div><div class="body">${s.html}</div>${q}</section>`;
    }).join('')+`<nav class="pager" aria-label="이전 다음 강의">${idx?`<a href="#${chapters[idx-1].id}/${chapters[idx-1].sections[0].id}">← ${escape(chapters[idx-1].title)}</a>`:'<span></span>'}${idx<chapters.length-1?`<a href="#${chapters[idx+1].id}/${chapters[idx+1].sections[0].id}">${escape(chapters[idx+1].title)} →</a>`:'<a href="#lec00/orientation">처음으로 ↑</a>'}</nav>`;
    decorate($('lesson'));
    window.AlgoMotion?.mount(c,$('lesson'));
    for(const field of $('lesson').querySelectorAll('textarea'))field.value=state.answers[field.dataset.answer]||'';
    progress();
  }
  function closeMenu(){ $('navigation').classList.remove('open');$('menu').setAttribute('aria-expanded','false');$('menu').querySelector('span').textContent='＋'; }
  function route(){
    window.AlgoMotion?.stop();
    $('search').value='';$('results').hidden=true;$('lesson').hidden=false;$('search-count').textContent='';
    let parts=[];try{parts=decodeURIComponent(location.hash.slice(1)).split('/');}catch(e){}
    let c=chapters.find(c=>c.id===parts[0]);let s=c?.sections.find(s=>s.id===parts[1]);
    if(!c){c=chapters[0];s=c.sections[0];}
    if(!s)s=c.sections[0];
    if(active!==c.id)render(c);
    window.AlgoMotion?.focus(s.id);
    closeMenu();
    requestAnimationFrame(()=>{const target=document.getElementById(s.id);if(!target || active!==c.id)return;target.querySelector('h2').focus({preventScroll:true});target.scrollIntoView({behavior:'instant',block:'start'});});
  }
  $('menu').addEventListener('click',()=>{const yes=$('navigation').classList.toggle('open');$('menu').setAttribute('aria-expanded',String(yes));$('menu').querySelector('span').textContent=yes?'−':'＋';});
  document.addEventListener('change',e=>{if(e.target.matches('[data-done]')){state.done[e.target.dataset.done]=e.target.checked;save();progress();}});
  document.addEventListener('input',e=>{if(e.target.matches('[data-answer]')){state.answers[e.target.dataset.answer]=e.target.value;save();}});
  document.addEventListener('keydown',e=>{
    const f=e.target;if(!f.matches('textarea.code'))return;
    const hint=$('help-'+f.id.slice(7));
    if(e.key==='Escape'){f.dataset.escape='yes';hint.textContent='다음 Tab은 다음 요소로, Shift+Tab은 이전 요소로 이동합니다.';return;}
    if(e.key==='Tab'){
      if(f.dataset.escape==='yes'){delete f.dataset.escape;return;}
      if(e.shiftKey)return;
      e.preventDefault();f.setRangeText('    ',f.selectionStart,f.selectionEnd,'end');f.dispatchEvent(new Event('input',{bubbles:true}));return;
    }
    if(!['Shift','Control','Alt','Meta'].includes(e.key)){delete f.dataset.escape;hint.textContent='Tab: 4칸 들여쓰기 · Esc 후 Tab / Shift+Tab: 입력창 밖으로 이동';}
  });
  document.addEventListener('focusout',e=>{if(e.target.matches('textarea.code')){delete e.target.dataset.escape;$('help-'+e.target.id.slice(7)).textContent='Tab: 4칸 들여쓰기 · Esc 후 Tab / Shift+Tab: 입력창 밖으로 이동';}});
  $('search').addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();route();}});
  $('search').addEventListener('input',()=>{
    window.AlgoMotion?.stop();
    const q=$('search').value.trim().toLocaleLowerCase();
    if(!q){$('results').hidden=true;$('lesson').hidden=false;$('search-count').textContent='';return;}
    const matches=sections.filter(x=>(x.c.title+' '+x.s.title+' '+x.s.text).toLocaleLowerCase().includes(q));
    $('lesson').hidden=true;$('results').hidden=false;$('search-count').textContent=`${matches.length}개 절`;
    $('results').innerHTML=`<h1 class="search-title">‘${escape(q)}’ 찾기</h1>`+(matches.length?matches.map(x=>{
      const plain=x.s.text.replace(/\s+/g,' ');const at=plain.toLocaleLowerCase().indexOf(q);const start=Math.max(0,at-35);
      return `<a class="result-link" href="#${x.key}"><span>Lec.${x.c.number} · ${escape(x.c.title)}</span><strong>${escape(x.s.title)}</strong><p>${escape(plain.slice(start,start+150))}…</p></a>`;
    }).join(''):'<p>일치하는 개념이 없습니다. 한글·영어 용어나 더 짧은 단어로 다시 찾아보세요.</p>');
  });
  document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#lec"]');if(a && a.hash===location.hash){e.preventDefault();route();}});
  document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();$('main').focus();});
  window.addEventListener('hashchange',route);
  if(location.hash)route();else {render(chapters[0]);closeMenu();}
})();
