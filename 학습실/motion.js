'use strict';
(() => {
  const registry = window.ALGO_MOTION || {};
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const valueText=v=>typeof v==='object'?JSON.stringify(v,(_,x)=>x===Infinity?'∞':x===-Infinity?'−∞':x):v===Infinity?'∞':v===-Infinity?'−∞':v;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let players = [], serial = 0;
  const stopAll = () => players.forEach(p => p.stop());
  function graphHTML(graph, id) {
    const nodes = new Map(graph.nodes.map(n => [n.id, n]));
    const edgeHTML = graph.edges.map(e => {
      const a = nodes.get(e.from), b = nodes.get(e.to); if (!a || !b) return '';
      const dx=b.x-a.x, dy=b.y-a.y, len=Math.hypot(dx,dy)||1;
      const ar=(a.radius||22)+2,br=(b.radius||22)+5;
      const x1=a.x+dx/len*ar,y1=a.y+dy/len*ar,x2=b.x-dx/len*br,y2=b.y-dy/len*br;
      return `<g class="motion-edge ${e.active?'is-active':''} ${e.done?'is-done':''}"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${e.directed?`marker-end="url(#${id}-arrow)"`:''}/>${e.label!==undefined?`<text x="${(a.x+b.x)/2+dy/len*10}" y="${(a.y+b.y)/2-dx/len*10}" text-anchor="middle">${esc(e.label)}</text>`:''}</g>`;
    }).join('');
    const nodeHTML=graph.nodes.map(n=>`<g data-node="${esc(n.id)}" data-x="${n.x}" data-y="${n.y}" transform="translate(${n.x} ${n.y})" class="motion-node ${n.active?'is-active':''} ${n.done?'is-done':''}"><circle r="${n.radius||22}"/><text text-anchor="middle" dominant-baseline="central" y="${n.done?-3:0}">${esc(n.label)}</text>${n.active?`<path class="motion-pointer" d="M -5 -${(n.radius||22)+9} L 0 -${(n.radius||22)+3} L 5 -${(n.radius||22)+9} Z"/>`:''}${n.done?`<text class="motion-tick" x="0" y="${(n.radius||22)-4}" text-anchor="middle">✓</text>`:''}</g>`).join('');
    return `<div class="motion-graph-scroll" tabindex="0" role="region" aria-label="그래프. 좁은 화면에서는 좌우로 이동할 수 있습니다."><svg viewBox="0 0 600 300" role="img" aria-label="현재 단계의 연결 관계. 아래 연결 정보에서 같은 내용을 읽을 수 있습니다."><defs><marker id="${id}-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor"/></marker></defs>${edgeHTML}${nodeHTML}</svg></div><p class="motion-graph-legend">가는 선: 후보 · 굵은 검정 선: 확정 간선 · 버건디 강조: 현재 처리</p><details class="motion-graph-text"><summary>연결 정보 읽기</summary><p>${graph.nodes.map(n=>`${esc(n.label)}${n.active?' [현재]':''}${n.done?' [확정]':''}`).join(' · ')}</p><ul>${graph.edges.map(e=>`<li>${esc(nodes.get(e.from)?.label)} ${e.directed?'→':'—'} ${esc(nodes.get(e.to)?.label)}${e.label!==undefined?' : '+esc(e.label):''}${e.active?' [현재 연결]':''}${e.done?' [확정 간선]':''}</li>`).join('')}</ul></details>`;
  }
  function rowsHTML(rows, previous) {
    return (rows||[]).map((row,r)=>{
      const old=previous?.rows?.find(x=>x.label===row.label);
      return `<div class="motion-row"><div class="motion-row-label">${esc(row.label)}</div><div class="motion-cells" tabindex="0" role="group" aria-label="${esc(row.label)}">${row.values.map((v,i)=>{
        const active=(row.active||[]).includes(i),done=(row.done||[]).includes(i),changed=old&&String(old.values[i])!==String(v);
        return `<div class="motion-cell ${active?'is-active':''} ${done?'is-done':''} ${changed?'is-changed':''}" data-cell="${r}-${i}"><span class="motion-cell-index">${esc(row.indices?.[i]??i)}</span><strong>${esc(v)}</strong><small>${active?'▼ 현재':done?'✓ 확정':changed?'변경':'　'}</small></div>`;
      }).join('')}</div></div>`;
    }).join('');
  }
  function gridHTML(grid) {
    const selected=(list,r,c)=>(list||[]).some(p=>p[0]===r&&p[1]===c);
    return `<div class="motion-grid-scroll" tabindex="0" role="region" aria-label="현재 격자. 행과 열은 0부터 시작합니다."><table class="motion-grid"><tbody>${grid.cells.map((row,r)=>`<tr><th scope="row">${r}행</th>${row.map((v,c)=>`<td class="${selected(grid.active,r,c)?'is-active':''} ${selected(grid.done,r,c)?'is-done':''}" aria-label="${r}행 ${c}열: ${esc(v)}${selected(grid.active,r,c)?', 현재':''}${selected(grid.done,r,c)?', 확정':''}"><small>${c}열</small><strong>${esc(v)}</strong>${selected(grid.active,r,c)?'<span>▼</span>':selected(grid.done,r,c)?'<span>✓</span>':'<span>　</span>'}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  }
  function barsHTML(bars) {
    const max=Math.max(1,...bars.values.map(Math.abs));
    return `<div class="motion-bars" role="group" aria-label="막대 높이와 인덱스">${bars.values.map((v,i)=>`<div class="motion-bar-column ${bars.active?.includes(i)?'is-active':''} ${bars.range&&i>=bars.range[0]&&i<=bars.range[1]?'in-range':''}"><span>${esc(v)}</span><div class="motion-bar-track"><div data-bar="${i}" class="motion-bar" style="height:${Math.abs(v)/max*100}%"></div></div><small>${i}${bars.active?.includes(i)?' ▼':''}</small></div>`).join('')}</div>`;
  }
  function tilesHTML(tiles){
    return `<div class="motion-tiles-scroll" tabindex="0" role="region" aria-label="사분면 이미지. 1은 검은색, 0은 흰색입니다."><svg viewBox="0 0 600 320" role="img" aria-label="사분면의 위치와 픽셀 변화">${tiles.map(t=>{
      const size=120,w=size/t.cells[0].length,h=size/t.cells.length;
      return `<g data-node="${esc(t.id)}" data-x="${t.x}" data-y="${t.y}" transform="translate(${t.x} ${t.y})"><rect width="120" height="120" fill="#fffaf3" stroke="#822f43" stroke-width="3"/>${t.cells.map((r,y)=>r.map((v,x)=>`<rect x="${x*w+1}" y="${y*h+1}" width="${w-2}" height="${h-2}" fill="${v?'#302725':'#fffaf3'}" stroke="#d8cbc0"/>`).join('')).join('')}<text x="60" y="-7" text-anchor="middle" fill="#822f43" font-size="13">${esc(t.id)}</text></g>`;
    }).join('')}</svg></div>`;
  }
  class Player {
    constructor(section, scenes) {
      this.scenes=scenes;this.sceneIndex=0;this.index=0;this.timer=null;this.speed=1400;this.previous=null;this.id='motion-'+(++serial);
      this.root=document.createElement('details');this.root.className='motion';this.root.dataset.motion=section.id;
      this.root.innerHTML=`<summary><span class="motion-summary-title">실행 과정을 눈으로 보기</span><span class="motion-summary-count">${scenes.length}가지 과정 · 직접 넘겨보기</span></summary><div class="motion-inner"><div class="motion-intro"><label for="${this.id}-scene">알고리즘·구현 선택</label><select id="${this.id}-scene" class="motion-scene">${scenes.map((s,i)=>`<option value="${i}">${esc(s.title)}</option>`).join('')}</select><p class="motion-scope"></p><p class="motion-input"></p></div><div class="motion-controls"><button type="button" data-action="reset">처음</button><button type="button" data-action="prev">← 이전</button><button type="button" data-action="play">재생 ▶</button><button type="button" data-action="next">다음 →</button><label class="motion-speed">속도 <select aria-label="재생 속도"><option value="2400">천천히</option><option value="1400" selected>보통</option><option value="650">빠르게</option></select></label></div><div class="motion-progress"><label for="${this.id}-step">단계 <output></output></label><input id="${this.id}-step" type="range" min="0" value="0" step="1" aria-label="실행 단계"></div><div class="motion-stage"><h3 class="motion-step-title"></h3><div class="motion-visual"></div><dl class="motion-vars"></dl><p class="motion-note"></p></div><details class="motion-code" open><summary>현재 계산 · 요약 의사코드</summary><ol></ol></details><p class="motion-result" hidden></p><p class="motion-help">▼ 현재 처리 · ✓ 확정 · 이전/다음으로 계산을 되짚어 보세요. 고정된 학습 예제입니다.</p><span class="motion-live" role="status" aria-live="polite"></span></div>`;
      section.querySelector('.body').before(this.root);
      this.$=selector=>this.root.querySelector(selector);
      const transport=document.createElement('div');transport.className='motion-transport';this.$('.motion-controls').before(transport);transport.append(this.$('.motion-controls'),this.$('.motion-progress'));
      this.$('.motion-code ol').tabIndex=0;this.$('.motion-code ol').setAttribute('aria-label','요약 의사코드. 긴 줄은 좌우로 이동할 수 있습니다.');
      this.root.addEventListener('click',e=>{const b=e.target.closest('[data-action]');if(!b)return;const action=b.dataset.action;if(action==='play'){if(this.timer)this.stop();else this.play();return;}this.stop();this.set(action==='reset'?0:this.index+(action==='next'?1:-1),true);});
      this.$('.motion-scene').addEventListener('change',e=>{this.stop();this.sceneIndex=Number(e.target.value);this.index=0;this.previous=null;this.draw(true);});
      this.$('input[type=range]').addEventListener('input',e=>{this.stop();this.set(Number(e.target.value),true);});
      this.$('.motion-speed select').addEventListener('change',e=>{const playing=!!this.timer;this.stop();this.speed=Number(e.target.value);if(playing)this.play();});
      this.root.addEventListener('toggle',()=>{if(!this.root.open)this.stop();});
      this.observer=new IntersectionObserver(entries=>{if(entries.some(e=>!e.isIntersecting))this.stop();});
      this.observer.observe(this.root);
      this.stop();this.draw(false);
    }
    get scene(){return this.scenes[this.sceneIndex];}
    stop(){if(this.timer)clearInterval(this.timer);this.timer=null;this.$('[data-action=play]').textContent='재생 ▶';this.$('[data-action=play]').setAttribute('aria-pressed','false');this.root.dataset.playing='false';}
    play(){stopAll();if(this.index===this.scene.frames.length-1)this.set(0,false);this.$('[data-action=play]').textContent='일시정지 Ⅱ';this.$('[data-action=play]').setAttribute('aria-pressed','true');this.root.dataset.playing='true';this.timer=setInterval(()=>{this.set(this.index+1,false);if(this.index===this.scene.frames.length-1)this.stop();},this.speed);}
    set(index,announce){this.index=Math.max(0,Math.min(index,this.scene.frames.length-1));this.draw(announce);}
    draw(announce){
      const s=this.scene,f=s.frames[this.index],range=this.$('input[type=range]'),visual=this.$('.motion-visual');
      const graphTextOpen=visual.querySelector('.motion-graph-text')?.open;
      const positions=new Map([...visual.querySelectorAll('[data-node]')].map(n=>[n.dataset.node,{x:Number(n.dataset.x),y:Number(n.dataset.y)}]));
      const barHeights=new Map([...visual.querySelectorAll('[data-bar]')].map(n=>[n.dataset.bar,n.style.height]));
      this.$('.motion-scope').textContent=s.scope;
      this.$('.motion-input').textContent='입력 · '+s.input;
      this.$('output').textContent=`${this.index+1} / ${s.frames.length}`;range.max=s.frames.length-1;range.value=this.index;range.setAttribute('aria-valuetext',`${this.index+1}/${s.frames.length}: ${f.title}`);
      this.$('[data-action=reset]').disabled=this.index===0;this.$('[data-action=prev]').disabled=this.index===0;this.$('[data-action=next]').disabled=this.index===s.frames.length-1;
      this.$('.motion-step-title').textContent=f.title;
      visual.innerHTML=(f.graph?graphHTML(f.graph,this.id):'')+(f.tiles?tilesHTML(f.tiles):'')+(f.bars?barsHTML(f.bars):'')+(f.grid?gridHTML(f.grid):'')+rowsHTML(f.rows,this.previous);
      if(f.graph||f.tiles)visual.insertAdjacentHTML('beforeend','<p class="motion-pan-hint">그림이 넓으면 좌우로 밀어서 볼 수 있습니다.</p>');
      if(graphTextOpen&&visual.querySelector('.motion-graph-text'))visual.querySelector('.motion-graph-text').open=true;
      this.$('.motion-vars').innerHTML=Object.entries(f.vars||{}).map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(valueText(v))}</dd></div>`).join('');
      this.$('.motion-note').textContent=f.note;
      this.$('.motion-code ol').innerHTML=s.code.map((line,i)=>`<li class="${i===f.line?'is-active':''}" ${i===f.line?'aria-current="step"':''}><code>${esc(line)}</code></li>`).join('');
      this.$('.motion-result').hidden=this.index!==s.frames.length-1;this.$('.motion-result').textContent='확인한 결과 · '+s.result;
      if(announce)this.$('.motion-live').textContent=`${this.index+1}/${s.frames.length}. ${f.title}. ${f.note}`;
      if(!reduced.matches&&this.root.open){
        for(const node of visual.querySelectorAll('[data-node]')){const old=positions.get(node.dataset.node);if(old){const x=Number(node.dataset.x),y=Number(node.dataset.y);if(old.x!==x||old.y!==y)node.animate([{transform:`translate(${old.x}px,${old.y}px)`},{transform:`translate(${x}px,${y}px)`}],{duration:350,easing:'ease-out'});}else node.animate([{opacity:0},{opacity:1}],{duration:350});}
        for(const bar of visual.querySelectorAll('[data-bar]')){const old=barHeights.get(bar.dataset.bar);if(old&&old!==bar.style.height)bar.animate([{height:old},{height:bar.style.height}],{duration:350,easing:'ease-out'});}
      }
      this.previous=f;this.root.dataset.frame=String(this.index);this.root.dataset.scene=s.id;
    }
    destroy(){this.stop();this.observer.disconnect();}
  }
  window.AlgoMotion={
    mount(chapter,container){players.forEach(p=>p.destroy());players=[];for(const s of chapter.sections){const scenes=registry[chapter.id+'/'+s.id];if(scenes?.length)players.push(new Player(container.querySelector('#'+s.id),scenes));}},
    focus(sectionId){stopAll();for(const p of players)p.root.open=p.root.dataset.motion===sectionId;},
    stop:stopAll,
    inventory:()=>Object.entries(registry).flatMap(([section,scenes])=>scenes.map(s=>({section,id:s.id,title:s.title,frames:s.frames.length})))
  };
  document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});
  window.addEventListener('pagehide',stopAll);
  reduced.addEventListener('change',()=>{document.getAnimations().forEach(a=>{if(a.effect?.target?.closest('.motion'))a.cancel();});});
})();
