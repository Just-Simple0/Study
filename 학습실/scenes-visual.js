'use strict';
(() => {
  const source='xxbwwbbwb',N=4;
  function decode(text,size){let p=0;const a=Array.from({length:size},()=>Array(size).fill(0));function read(y,x,n){const h=text[p++];if(h!=='x'){for(let r=y;r<y+n;r++)for(let c=x;c<x+n;c++)a[r][c]=Number(h==='b');return;}const k=n/2;for(const [dy,dx]of [[0,0],[0,k],[k,0],[k,k]])read(y+dy,x+dx,k);}read(0,0,size);if(p!==text.length)throw Error('quadtree parse');return a;}
  function flip(text){let p=0;function read(){const h=text[p++];if(h!=='x')return h;const q=Array.from({length:4},read);return 'x'+q[2]+q[3]+q[0]+q[1];}return read();}
  const original=decode(source,N),qtext=['xbwwb','b','w','b'];
  const blocks=qtext.map((s,i)=>({id:'q'+(i+1),x:160+(i%2)*135,y:30+Math.floor(i/2)*145,cells:decode(s,2)}));
  const frames=[];const snap=(title,note,line,vars,order=['q1','q2','q3','q4'])=>frames.push(JSON.parse(JSON.stringify({title,note,line,vars,tiles:blocks,rows:[{label:'현재 부모의 자식 순서 (좌상·우상·좌하·우하)',values:order},{label:'사분면별 픽셀 — 1=검정, 0=흰색',values:blocks.map(b=>b.id+': '+b.cells.map(r=>r.join('')).join('/'))}]})));
  snap('원본 4×4 그림','q1만 다시 네 부분으로 나뉩니다. 먼저 q1 내부를 뒤집은 뒤 부모의 사분면 위치를 바꿉니다.',1,{입력:source,호출:'flip(root)'});
  const leaves=[...qtext[0].slice(1)],returned=[];
  for(let i=0;i<leaves.length;i++){returned.push(leaves[i]);snap(`q1의 자식 ${i+1}: ${leaves[i]}`,'단색 잎은 뒤집어도 같으므로 그대로 반환합니다. q1의 네 반환값을 모읍니다.',0,{호출:'flip(q1) → leaf',반환:returned.join(', ')});}
  const inner='x'+returned[2]+returned[3]+returned[0]+returned[1];blocks[0].cells=decode(inner,2);
  snap('q1 내부를 먼저 반전','q1 내부에서도 아래 두 자식을 위로 보냅니다. q1의 위치는 아직 좌상단이며 내부 픽셀만 뒤집혔습니다.',2,{호출:'flip(q1)',반환:inner});
  for(let i=1;i<4;i++)snap(`q${i+1}은 단색: 그대로 반환`,'이 사분면 전체가 한 색이므로 크기와 관계없이 같은 문자를 반환합니다.',0,{호출:'flip(q'+(i+1)+')',반환:qtext[i]});
  blocks.forEach((b,i)=>b.y=30+(1-Math.floor(i/2))*145);
  const result=flip(source);
  snap('부모에서 q3·q4·q1·q2로 이동','이제 q3·q4가 위로, 이미 내부 반전된 q1·q2가 아래로 이동합니다. 모든 재귀 수준에서 같은 규칙을 적용해야 합니다.',2,{호출:'flip(root)',결과:result},['q3','q4','q1','q2']);
  const s={id:'lec03-quad-flip-moving',title:'QUADTREE: 사분면 그림을 직접 뒤집기',scope:'학습용 추가 예제 전체 추적 · 상하 반전은 출제 예고 대상. 인코딩·디코딩 자체의 직접 출제를 뜻하지 않습니다.',input:source+' (4×4, b=검정, w=흰색)',code:['w/b이면 그대로 반환','q1,q2,q3,q4 ← 네 자식의 flip 반환값','return "x" + q3 + q4 + q1 + q2'],frames,result:`${source} → ${result}; 마지막 그림은 원본의 행 순서를 거꾸로 한 것과 같습니다.`,checks:[{actual:decode(result,N),expected:original.slice().reverse()},{actual:flip(result),expected:source}]};
  window.ALGO_MOTION=window.ALGO_MOTION||{};
  const key='lec03/quad-flip';window.ALGO_MOTION[key]=[s,...window.ALGO_MOTION[key]||[]];
  const n=4,terms=[1,2,3,4],sumFrames=[];let sum=0;
  for(let i=1;i<=n;i++){
    sumFrames.push({title:`반복 직전 i=${i}`,note:i===1?"아직 더한 항이 없는 빈 합은 0입니다. s=0으로 초기화했으므로 첫 반복 직전에 불변식이 성립합니다.":`지금 s=${sum}은 이미 처리한 1부터 ${i-1}까지의 합입니다. 다음 항 ${i}를 더하기 전에 불변식이 성립합니다.`,line:1,vars:{i,s:sum,n},rows:[{label:'더할 정수',values:terms,active:[i-1],done:terms.map((_,j)=>j).filter(j=>j<i-1)},{label:'s',values:[sum]}]});
    const old=sum;sum+=i;
    sumFrames.push({title:`${old} + ${i} = ${sum}`,note:`s에 ${i}를 더했으므로 이제 1부터 ${i}까지의 합입니다. i가 1 증가하면 다음 반복 직전의 불변식이 됩니다.`,line:2,vars:{i,s:sum,n},rows:[{label:'더할 정수',values:terms,done:terms.map((_,j)=>j).filter(j=>j<i)},{label:'s',values:[sum]}]});
  }
  sumFrames.push({title:'종료: i=5, s=10',note:'i가 n을 넘어서 반복을 끝냅니다. 불변식의 i−1이 n이 되었으므로 s는 1부터 n까지의 합입니다. 초기화·유지·종료를 연결해야 전체 정확성이 증명됩니다.',line:3,vars:{i:5,s:sum,n},rows:[{label:'더할 정수',values:terms,done:[0,1,2,3]},{label:'s',values:[sum]}]});
  const invariant={id:'lec01-invariant',title:'반복 불변식: 더하기를 한 번씩 추적',scope:'학습용 고정 예제의 전체 반복 · 초기화, 유지, 종료 조건을 함께 확인합니다.',input:'n=4; s=0',code:['s ← 0','for i = 1 .. n:  # 직전 s = 1 + … + (i−1)','    s ← s + i','return s'],frames:sumFrames,result:'1+2+3+4=10. 종료 시 불변식으로 정답임을 확인합니다.',checks:[{actual:sum,expected:n*(n+1)/2}]};
  const correctness='lec01/correctness';window.ALGO_MOTION[correctness]=[invariant,...(window.ALGO_MOTION[correctness]||[]).filter(x=>x.id!==invariant.id)];
  const all=()=>Object.values(window.ALGO_MOTION).flat();
  const amend=(id,fields)=>{const item=all().find(s=>s.id===id);if(item)Object.assign(item,fields);};
  amend('lec00-coinflip',{code:['T 개수가 홀수면 불가능','왼쪽부터 남은 T 위치 찾기','그 T와 오른쪽 이웃을 함께 뒤집어 T를 이동','두 T가 만나 사라지면 다음 쌍; 모두 H면 종료'],scope:'THHT의 실제 인접 뒤집기 전체 과정. 거리 합 계산법으로 구한 최소 3회를 실제 동작으로 확인합니다.'});
  amend('lec01-festival-incremental',{code:['시작 i마다 sum←0','j=i..n−1','sum←sum+cost[j]','길이 j−i+1≥L일 때만 평균 비교']});
  amend('lec01-festival-prefix',{code:['P[0]←0','P[t+1]←P[t]+cost[t]','닫힌 구간 합[i..j]=P[j+1]−P[i]','길이 j−i+1≥L인 모든 평균 비교'],scope:'고정 세 원소의 유효 구간 전체. 이 장면은 끝 인덱스 j를 포함하므로 P[j+1]을 읽습니다. 본문의 반열린 [i,j)와 구분합니다.'});
  amend('lec01-maxsum-prefix',{code:['psum[0]=A[0]; i≥1이면 psum[i]=psum[i−1]+A[i]','i=0이면 psum[j], 그 외 psum[j]−psum[i−1]','모든 구간 합을 best와 비교','best 초기값 0: 빈 부분배열 허용']});
  amend('lec02-clocksync-elimination',{input:'[0,0,0,0,0,0,2,2,2,0,2,0,2,0,0,0]; 0=12시, 1=3시, 2=6시, 3=9시',scope:'주어진 강의 연결 구조에서 의존 순서 10단계를 모두 적용하는 고정 예제. 마지막 전체 시계 검사가 필요합니다.'});
  amend('lec03-master',{scope:'f(n)=Θ(n^k)인 강의의 다항식 예제 세 가지 비교. 일반 f(n)에 단순한 크기 비교만 적용한다는 뜻은 아닙니다.'});
  amend('lec03-fence-stack',{input:'[2,1,2], 끝에 sentinel 0 추가',scope:'세 판자 전체를 왼쪽부터 읽고 sentinel까지 모든 push/pop을 추적합니다.'});
  const board=Array.from({length:4},()=>Array(4).fill('·'));board[0][0]='구멍';let tileId=0;const tf=[];
  const emit=(title,note,line,vars,active=[])=>tf.push({title,note,line,vars,grid:{cells:board.map(r=>r.slice()),active}});
  emit('구멍 하나인 4×4 보드','이 보충 알고리즘은 2의 거듭제곱 크기와 구멍 하나라는 조건을 사용합니다.',0,{크기:4,구멍:'(0,0)'});
  function tile(y,x,size,hy,hx){
    const h=size/2,centers=[[y+h-1,x+h-1],[y+h-1,x+h],[y+h,x+h-1],[y+h,x+h]],q=(hy>=y+h?2:0)+(hx>=x+h?1:0),id=++tileId,filled=[];
    for(let i=0;i<4;i++)if(i!==q){const[r,c]=centers[i];board[r][c]=id;filled.push([r,c]);}
    emit(`타일 ${id} 배치 (${size}×${size} 영역)`,size===2?'세 빈칸을 L자 타일 하나로 덮습니다. 기존 구멍 또는 상위 호출이 채운 칸은 덮지 않습니다.':'원래 구멍이 없는 세 사분면에 걸쳐 중앙 타일을 놓습니다. 이제 네 사분면 모두 하나의 구멍을 가진 하위 문제가 됩니다.',size===2?2:1,{영역:`(${y},${x}), size=${size}`,tile:id,구멍사분면:q+1},filled);
    if(size>2)for(let i=0;i<4;i++){const hole=i===q?[hy,hx]:centers[i];tile(y+(i>=2?h:0),x+(i%2?h:0),h,...hole);}
  }
  tile(0,0,4,0,0);
  emit('완료: L자 타일 5개','같은 숫자 세 칸이 하나의 L자 타일입니다. 원래 구멍 한 칸을 제외한 15칸을 정확히 한 번씩 덮었습니다.',2,{타일수:tileId,덮은칸:15});
  const valid=Array.from({length:tileId},(_,i)=>i+1).every(id=>{const cells=board.flatMap((r,y)=>r.flatMap((v,x)=>v===id?[[y,x]]:[]));return cells.length===3&&Math.max(...cells.map(p=>p[0]))-Math.min(...cells.map(p=>p[0]))===1&&Math.max(...cells.map(p=>p[1]))-Math.min(...cells.map(p=>p[1]))===1;});
  const tromino={id:'lec02-tromino',title:'한 구멍 체스판: 중앙 배치와 재귀',scope:'본문의 보충 알고리즘 · 4×4, 구멍 하나의 전체 타일 배치. 임의의 여러 구멍 보드와 구분합니다.',input:'4×4 보드, 원래 구멍 (0,0)',code:['구멍이 속한 사분면 확인','다른 세 사분면의 중앙 칸에 L자 타일 배치','네 하위 보드에서 반복; 2×2는 타일 하나로 완료'],frames:tf,result:'5개 L자 타일로 15칸을 덮습니다.',checks:[{actual:tileId,expected:5},{actual:valid,expected:true},{actual:board[0][0],expected:'구멍'}]};
  window.ALGO_MOTION['lec02/boardcover']=(window.ALGO_MOTION['lec02/boardcover']||[]).map(s=>s.id===tromino.id?tromino:s);
  // Keep the problem picture visible during comparisons, returns and queue updates.
  // Every frame remains self-contained so backward and random navigation are identical.
  const clone=x=>JSON.parse(JSON.stringify(x,(_,v)=>v===Infinity?'∞':v===-Infinity?'−∞':v));
  const hfPos={r:[290,35],u:[115,95],v:[390,95],a:[55,160],d:[175,160],f:[300,160],w:[465,160],c:[395,215],z:[535,215],b:[500,275],e:[570,275]};
  const stickyIds=new Set(['lec06-prim-heap-full','lec06-lan-visited-full','lec06-lan-sentinel-full','lec06-greedy-shortest-edge-counterexample','lec02-boggle','lec03-fence-divide','lec03-quadtree-encode','lec02-boardcover-precheck','lec05-packing-fractional']);
  for(const scene of all()){
    const carry={},state={};
    for(const f of scene.frames){
      for(const name of ['graph','grid','bars']){
        if(f[name])carry[name]=clone(f[name]);
        else if(stickyIds.has(scene.id)&&carry[name]){
          f[name]=clone(carry[name]);
          if(name==='grid'){f.grid.active=[];const{y,x}=f.vars;if(Number.isInteger(y)&&Number.isInteger(x)&&f.grid.cells[y]?.[x]!==undefined)f.grid.active=[[y,x]];}
          if(name==='bars'){f.bars.active=[];delete f.bars.range;}
          if(name==='graph'){
            const v=f.vars;f.graph.nodes.forEach(n=>n.active=n.id===(v.v||v.u||v.node));
            f.graph.edges.forEach(e=>e.active=!!v.u&&!!v.v&&((e.from===v.u&&e.to===v.v)||(e.to===v.u&&e.from===v.v)));
          }
        }
      }
      if(scene.id==='lec05-packing-fractional'&&!f.bars)f.bars={values:[60,100,120],active:[0]};
      f.note=f.note.replaceAll('Infinity','∞');
      if(f.vars.pick===null)f.vars.pick='선택 불가';
      if(f.vars.best&&typeof f.vars.best==='object'&&!Array.isArray(f.vars.best))for(const k of Object.keys(f.vars.best))if(f.vars.best[k]===null)f.vars.best[k]='∞';
      if(f.graph){
        if(scene.id==='lec06-huffman-tree-full')for(const n of f.graph.nodes){[n.x,n.y]=hfPos[n.id];n.radius=17;}
        if(scene.id==='lec06-huffman-rebuild-full')for(const n of f.graph.nodes)n.radius=17;
        if(scene.id.startsWith('lec06-lan-'))for(const e of f.graph.edges)if(e.from==='B'&&e.to==='C'&&f.graph.nodes.find(n=>n.id==='C')?.done)e.done=true;
        for(const k of ['best','parent','queue','selected','dist'])if(f.vars[k]!==undefined&&f.vars[k]!==null)state[k]=f.vars[k];
        const rows=[];
        if(state.best&&typeof state.best==='object')rows.push({label:'minweight — 현재 트리까지의 최소 간선',indices:Object.keys(state.best),values:Object.values(state.best).map(v=>v===Infinity||v===null?'∞':v)});
        if(state.parent&&typeof state.parent==='object')rows.push({label:'parent — 연결 후보 부모',indices:Object.keys(state.parent),values:Object.values(state.parent).map(v=>v??'—')});
        if(Array.isArray(state.queue))rows.push({label:'우선순위 큐 — 남은 후보',values:state.queue.length?state.queue.map(v=>Array.isArray(v)?`${v[2]}→${v[1]}:${v[0]}`:v):['비어 있음']});
        if(Array.isArray(state.dist))rows.push({label:scene.id.endsWith('sentinel-full')?'dist — −1은 방문 완료':'dist — 제곱 거리 후보',indices:['A','B','C'],values:state.dist.slice()});
        if(Array.isArray(state.selected))rows.push({label:'선택한 간선',values:state.selected.length?state.selected.map(v=>`${v[0]}–${v[1]}:${v[2]}`):['없음']});
        if(!rows.length)rows.push({label:'노드 상태',indices:f.graph.nodes.map(n=>n.id),values:f.graph.nodes.map(n=>n.active?'현재':n.done?'완료':'대기')});
        f.rows=rows;
        if(scene.id.includes('greedy-shortest-edge'))f.rows=[{label:'비교할 경로',values:['S→A→T','S→B→T']},{label:'전체 경로 비용',values:[101,4]}];
      }
      if(scene.id==='lec02-boggle')f.rows=[{label:'탐색 상태 (행, 열, 단어 인덱스)',indices:['y','x','k'],values:[f.vars.y??0,f.vars.x??0,f.vars.k??0]}];
      if(scene.id==='lec02-boardcover-precheck')f.rows=[{label:'탐색 전 필요조건 검사',indices:['빈칸 수','3으로 나눈 나머지'],values:[4,1]}];
      if(scene.id==='lec03-quadtree-encode'){
        if(!state.output)state.output='x';
        if(['w','b'].includes(f.vars.value))state.output+=f.vars.value;
        if(f.vars.encoded)state.output=f.vars.encoded;
        f.rows=[{label:'지금까지 만든 문자열',values:[state.output]}];
      }
      if(scene.id==='lec05-packing-fractional')f.rows=[{label:'물건 가치 — 분할 선택은 비율만큼 계산',indices:['A','B','C'],values:f.bars.values,active:f.bars.active||[]}];
    }
  }
})();
