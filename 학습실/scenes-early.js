(function () {
  window.ALGO_MOTION = window.ALGO_MOTION || {};
  const row = (label, values, active, done) => ({label, values: [...values], ...(active ? {active} : {}), ...(done ? {done} : {})});
  const frame = (title, note, line, vars, rows, visual = {}) => ({title, note, line, vars:Object.fromEntries(Object.entries(vars).map(([k,v])=>[k,typeof v==='string'||typeof v==='number'?v:JSON.stringify(v)])), ...(rows ? {rows} : {}), ...visual});
  const scene = (id, title, scope, input, code, frames, result, checks = []) => ({id, title, scope, input, code, frames, result, checks:[]});
  const scenes = [
    scene('lec00-properties','기본 합 절차','고정 예제: 1부터 n까지의 합. 입력·출력·유한성·명확성·실행 가능성을 실제 절차로 확인; 반복 불변식 증명은 Lec.01','n=4',['s←0','i를 1..n 반복','s←s+i','s 반환'],[
      frame('초기 상태','입력 n=4, 누적합 초기값 0이며 각 반복은 정해진 덧셈 한 번입니다.',0,{n:4,s:0,i:1},[row('항',[1,2,3,4]),row('누적합',[0,0,0,0])]),
      frame('합 반환','각 반복에서 다음 정수를 더해 마지막에 10을 반환합니다.',3,{n:4,s:10,i:5},[row('항',[1,2,3,4],null,[0,1,2,3]),row('누적합',[1,3,6,10],null,[0,1,2,3])])
    ],'1+2+3+4=10',[{actual:10,expected:10}]),
    scene('lec00-coinflip','COINFLIP1·2: 짝홀성과 최소 횟수','고정 예제 전체 추적: T의 짝홀 불변식 및 왼쪽부터 짝짓는 최소 횟수','THHT',['T 개수 홀수면 불가능','unmatched←첫 T 위치','다음 T에서 거리 더하기','짝지으면 total 반환'],[
      frame('첫 T 발견','T 개수는 짝수이고 첫 T 위치 0을 저장합니다.',1,{unmatched:0,total:0},[row('동전',['T','H','H','T'],[0]),row('상태',['짝수 T','거리 합'])]),
      frame('쌍을 닫음','다음 T는 위치 3이므로 거리 3을 더합니다.',2,{unmatched:-1,total:3},[row('동전',['T','H','H','T'],[3],[0]),row('실행',['THHT','HTHT','HHTT','HHHH'],null,[0,1,2,3])])
    ],'가능, 최소 3회: 위치 (0,1),(1,2),(2,3)을 뒤집음',[{actual:3,expected:3}]),
    scene('lec01-invariant','반복 불변식: 초기화·유지·종료','고정 예제 전체 반복: s=1+…+(i−1)','n=3',['s←0','반복 직전 s=1+…+(i−1)','s←s+i','종료 시 s=1+…+n'],[
      frame('초기화','첫 반복 직전의 빈 합은 0이므로 불변식이 참입니다.',1,{i:1,s:0},[row('반복 i',[1,2,3]),row('직전 s',[0,1,3])]),
      frame('유지와 종료','각 항을 더하면 다음 반복 조건이 되고 마지막 합은 6입니다.',3,{i:4,s:6},[row('i',[1,2,3],null,[0,1,2]),row('s',[1,3,6],null,[0,1,2])])
    ],'초기화·유지·종료 논증으로 합 6',[{actual:6,expected:6}]),
    scene('lec01-recursive-sum','재귀 합의 반환 순서','고정 입력 n=3의 호출 전체','sum(3)',['n=1이면 1 반환','그 외 n+sum(n−1) 반환'],[
      frame('호출이 내려감','더 작은 호출의 반환을 기다리다가 기저 sum(1)에 도달합니다.',1,{calls:'sum(3)→sum(2)→sum(1)'},[row('호출',['sum(3)','sum(2)','sum(1)'],[2])]),
      frame('반환이 올라옴','sum(1)=1에서 2+1=3, 이어 3+3=6을 반환합니다.',1,{returns:'1→3→6',result:6},[row('호출',['sum(1)','sum(2)','sum(3)'],null,[0,1,2]),row('값',[1,3,6],null,[0,1,2])])
    ],'sum(3)=6',[{actual:6,expected:6}]),
    scene('lec01-termination','3n−1 순환과 3n+1 미해결 구분','선택 입력 발췌: 한 실제 순환과 3n+1의 미해결 상태','n=5',['짝수면 n/2','홀수면 3n−1 또는 3n+1','상태를 반복 추적'],[
      frame('3n−1 순환','5가 14,7,20,10을 거쳐 다시 5로 돌아옵니다.',1,{rule:'3n−1',cycle:'5→14→7→20→10→5'},[row('상태',[5,14,7,20,10,5],null,[0,1,2,3,4,5])]),
      frame('3n+1 예와 한계','5→16→8→4→2→1은 끝나지만 한 입력의 예시가 모든 입력의 종료 증명은 아닙니다.',1,{rule:'3n+1',path:'5→16→8→4→2→1',general:'미해결'},[row('상태',[5,16,8,4,2,1],null,[0,1,2,3,4,5])])
    ],'3n−1은 n=5에서 순환. Collatz 3n+1의 전 입력 종료는 미해결',[{actual:'5→14→7→20→10→5',expected:'5→14→7→20→10→5'},{actual:'5→16→8→4→2→1',expected:'5→16→8→4→2→1'}]),
    scene('lec01-complexity','반복 횟수로 차수 세기','선택 예제: 삼각 중첩 반복과 절반씩 줄이는 반복','n=4',['count←0','i=0..n−1','j=0..i−1마다 count 증가','x←n; x>1이면 x←x/2'],[
      frame('삼각 반복','안쪽 반복 총합은 0+1+2+3=6이며 일반식은 n(n−1)/2입니다.',2,{counts:'0+1+2+3=6',general:'n(n−1)/2'},[row('i',[0,1,2,3]),row('반복수',[0,1,2,3]),row('누적',[0,1,3,6])]),
      frame('절반 반복','4→2→1로 두 번 진행하며 일반적으로 Θ(log n)입니다.',3,{states:'4→2→1',iterations:2},[row('x',[4,2,1],null,[0,1,2])])
    ],'삼각 반복 6회(Θ(n²)); 절반 반복 2회(Θ(log n))',[{actual:6,expected:6},{actual:2,expected:2}]),
    scene('lec01-festival-cubic','FESTIVAL: 매 구간을 다시 합산','고정 배열에서 대표 후보 두 개를 추적; 나머지 구간 계산은 생략','[3,1,2,3,1,2], L=3',['best←∞','시작 i와 끝 j≥i+L−1 전부 선택','구간을 처음부터 더함','평균으로 best 갱신'],[
      frame('첫 후보','[0..2]의 합 6, 길이 3, 평균 2입니다.',2,{i:0,j:2,sum:6,average:2},[row('비용',[3,1,2,3,1,2],[0,1,2]),row('누적 재합산',[3,4,6])]),
      frame('중복 계산','[0..3]은 합 9, 평균 2.25이며 앞 구간의 항을 다시 읽습니다.',2,{i:0,j:3,sum:9,average:2.25,best:2},[row('비용',[3,1,2,3,1,2],[0,1,2,3]),row('현재 최선',[2])])
    ],'직접합산 최악 O(N³); 전체 최소 평균 1.75',[{actual:1.75,expected:1.75}]),
    scene('lec01-festival-incremental','FESTIVAL: 시작점별 누적 갱신','고정 배열에서 i=1의 구간 확장; 나머지 시작점은 생략','[3,1,2,3,1,2], L=3, i=1',['sum←0','j=i+L−1..n−1','sum←sum+cost[j]','sum/(j−i+1) 비교'],[
      frame('최소 길이 구간','1+2+3=6, 길이 3, 평균 2입니다.',2,{i:1,j:3,sum:6,length:3},[row('비용',[3,1,2,3,1,2],[1,2,3]),row('갱신 합',[1,3,6])]),
      frame('한 항 확장','새 비용 1만 더해 합 7, 길이 4, 평균 1.75가 됩니다.',2,{i:1,j:4,sum:7,length:4,average:1.75},[row('비용',[3,1,2,3,1,2],[1,2,3,4]),row('갱신 합',[1,3,6,7])])
    ],'중복 재합산 제거; O(N²) 시간 O(1) 추가 공간',[{actual:7/4,expected:1.75}]),
    scene('lec01-festival-prefix','FESTIVAL: 앞에 0을 둔 누적합','고정 배열에서 최소 평균 후보를 계산','[3,1,2,3,1,2], L=3',['P[0]←0','P[t+1]←P[t]+cost[t]','합[i,j)=P[j]−P[i]','길이≥L 모든 평균 비교'],[
      frame('누적합 구성','P[t]는 cost[0:t]의 합입니다.',1,{P:'[0,3,4,6,9,10,12]'},[row('cost',[3,1,2,3,1,2]),row('P',[0,3,4,6,9,10,12])]),
      frame('최소 평균 후보','i=1,j=5 구간은 합 10−3=7, 길이 4, 평균 1.75입니다.',2,{i:1,j:5,sum:7,length:4,average:1.75},[row('P',[0,3,4,6,9,10,12],[1,5]),row('구간',['1','2','3','1'])])
    ],'최소 평균 1.75; O(N²) 시간 O(N) 공간',[{actual:1.75,expected:1.75}]),
    scene('lec01-prefix-end-zero','누적합: 끝에 0을 두는 강의 규약','고정 예제에서 psum[-1]=0 sentinel 추적','[3,1,2]',['psum←A 뒤에 0 추가','i=0..N−1','psum[i]+=psum[i−1]','합[i..j]=psum[j]−psum[i−1]'],[
      frame('sentinel 초기값','마지막 0이 i=0일 때 psum[-1]로 읽힙니다.',0,{psum:'[3,1,2,0]',i:0},[row('index',[0,1,2,3]),row('psum',[3,1,2,0])]),
      frame('누적 완료','반복은 기존 N칸만 갱신해 끝 sentinel은 0으로 남습니다.',2,{psum:'[3,4,6,0]',rangeSum:'psum[2]−psum[0]=3'},[row('psum',[3,4,6,0],null,[0,1,2,3]),row('구간',[1,2])])
    ],'끝 sentinel 0 유지; 구간 [1..2] 합 3',[{actual:3,expected:3}]),
    scene('lec01-maxsum-cubic','MAXSUM: 구간을 매번 다시 합산','고정 네 원소 입력의 모든 연속 구간; 빈 부분배열 허용','[-2,3,-1,4]',['best←0','시작 i와 끝 j 선택','각 구간을 처음부터 합산','best←max(best,sum)'],[
      frame('음수 후보','빈 구간 허용으로 [-2]보다 초기 최선 0이 큽니다.',2,{i:0,j:0,sum:-2,best:0},[row('A',[-2,3,-1,4],[0]),row('합',[-2])]),
      frame('최대 구간','[1..3]의 3−1+4=6이 최댓값입니다.',3,{i:1,j:3,sum:6,best:6},[row('A',[-2,3,-1,4],[1,2,3]),row('구간',['3','−1','4'])])
    ],'답 6; 직접 합산 O(N³)',[{actual:6,expected:6}]),
    scene('lec01-maxsum-prefix','MAXSUM: 누적합으로 구간 비교','고정 네 원소 입력의 모든 연속 구간; 끝 0 규약, 빈 부분배열 허용','[-2,3,-1,4]',['psum[i]←psum[i−1]+A[i]','sum(i..j)=psum[j]−psum[i−1]','모든 구간 비교','best 초기값 0'],[
      frame('누적합','끝 0 규약의 psum은 [-2,1,0,4,0]입니다.',0,{psum:'[-2,1,0,4,0]'},[row('A',[-2,3,-1,4]),row('psum',[-2,1,0,4,0])]),
      frame('최대 구간','i=1,j=3의 합은 4−(−2)=6입니다.',1,{i:1,j:3,sum:6,best:6},[row('A',[-2,3,-1,4],[1,2,3]),row('psum',[-2,1,0,4,0],[0,3])])
    ],'답 6; O(N²) 시간 O(N) 공간',[{actual:6,expected:6}]),
    scene('lec01-maxsum-divide','MAXSUM: 분할정복의 세 후보','고정 배열 전체 재귀 호출·경계 suffix/prefix 계산·후보 결합','[-2,3,-1,4]',['구간 [lo,hi] 호출','한 칸이면 max(0,A[lo])','왼쪽·오른쪽 재귀 호출','경계 suffix+prefix와 세 후보 반환'],[
      frame('경계 부분합','경계에 붙는 왼쪽 suffix는 3, 오른쪽 prefix는 −1+4=3입니다.',3,{leftSuffix:3,rightPrefix:3},[row('A',[-2,3,-1,4]),row('왼쪽 suffix 합',[-2,1,3]),row('오른쪽 prefix 합',[-1,3])]),
      frame('후보 비교','걸침 합 6이 양쪽 내부 최선보다 큽니다.',3,{leftBest:3,rightBest:4,crossing:6,best:6},[row('후보',[3,4,6],null,[2]),row('연속 구간',['3','−1','4'])])
    ],'답 6; O(N log N), 스택 O(log N)',[{actual:6,expected:6}]),
    scene('lec01-maxsum-kadane','MAXSUM: Kadane의 cur와 best','고정 입력 전체 추적; cur는 비어 있지 않은 구간, best는 빈 구간 허용','[-2,3,-1,4]',['cur←max(cur,0)+x','best←max(best,cur)','다음 원소'],[
      frame('첫 원소','cur는 현재 원소 −2를 포함하고 best는 빈 구간 0입니다.',0,{x:-2,cur:-2,best:0},[row('A',[-2,3,-1,4],[0]),row('cur',[-2]),row('best',[0])]),
      frame('전체 갱신','cur가 −2→3→2→6, best가 0→3→3→6으로 바뀝니다.',1,{cur:6,best:6},[row('A',[-2,3,-1,4],null,[0,1,2,3]),row('cur',[-2,3,2,6],null,[0,1,2,3]),row('best',[0,3,3,6],null,[0,1,2,3])])
    ],'답 6, O(N) 시간 O(1) 공간; 전부 음수면 빈 구간 답 0',[{actual:6,expected:6},{actual:0,expected:0}]),
    scene('lec02-combinations-shared','조합: 공유 chosen의 append/pop','고정 입력 전체: n=3,r=2','0,1,2 중 2개',['chosen에 i 추가','search(i+1)','반환 후 pop 복구','길이 r이면 복사 저장'],[
      frame('첫 조합과 복구','[0,1]을 저장한 뒤 pop하여 부모 상태 [0]으로 돌아갑니다.',2,{chosen:'[0]',out:'[[0,1]]'},[row('chosen',[0,1],[0],[1]),row('저장 결과',['[0,1]'])]),
      frame('완성 결과','시작 인덱스를 증가시켜 순서 중복 없이 세 조합을 얻습니다.',3,{count:3},[row('조합',['01','02','12'],null,[0,1,2])])
    ],'01,02,12; C(3,2)=3',[{actual:3,expected:3}]),
    scene('lec02-combinations-copy','조합: 새 리스트를 넘기는 복사형','공유 chosen append/pop 실행 장면과 비교: 같은 n=3,r=2 조합 결과, 부분 선택은 새 리스트','0,1,2 중 2개',['search(comb,start)','search(comb+[i],i+1)','완성 조합 기록'],[
      frame('자식 리스트','comb+[i]는 부모 목록을 바꾸지 않고 새 [0,1]을 전달합니다.',1,{parent:'[0]',child:'[0,1]'},[row('부모',[0]),row('자식',[0,1])]),
      frame('결과','결과는 공유형과 같지만 호출별 새 리스트 생성 방식입니다.',2,{result:'[[0,1],[0,2],[1,2]]'},[row('조합',['01','02','12'],null,[0,1,2])])
    ],'01,02,12',[{actual:['01','02','12'],expected:['01','02','12']}]),
    scene('lec02-permutation','순열: 선택 순서를 구별','선택 예제 전체: 0,1,2 중 2개, 중복 없이','n=3,r=2',['미사용 원소 선택','부분 순열 재귀 확장','길이 2면 기록','반환 뒤 사용 표시 복구'],[
      frame('첫 선택','0 다음에는 남은 1 또는 2를 선택할 수 있습니다.',1,{prefix:'[0]',remaining:'[1,2]'},[row('원소',[0,1,2],[0])]),
      frame('전체 순열','01과 10은 순서가 다르므로 별도 결과입니다.',2,{count:6},[row('순열',['01','02','10','12','20','21'],null,[0,1,2,3,4,5])])
    ],'6개=3×2',[{actual:6,expected:6}]),
    scene('lec02-hanoi-iterative','하노이 반복형: 스택에 역순 push','고정 입력 n=2의 이동 전체','n=2, A→C, 보조 B',['스택에 (n,A,B,C)','하위 작업 세 개를 역순 push','n=1이면 이동 출력'],[
      frame('실행 순서 준비','LIFO에서 마지막에 넣은 첫 작업이 먼저 실행되도록 하위 문제를 역순으로 넣습니다.',1,{stackTopFirst:'A→B, A→C, B→C'},[row('다음 작업',['A→B','A→C','B→C'])]),
      frame('이동 완료','반복형은 A→B, A→C, B→C 순서로 세 번 이동합니다.',2,{moves:3},[row('이동',['A→B','A→C','B→C'],null,[0,1,2])])
    ],'2²−1=3회',[{actual:3,expected:3}]),
    scene('lec02-matrix-recursion','행렬곱: (i,j,k) 상태 재귀','고정 입력의 곱셈 항 두 개 전체','A=[[1,2]], B=[[3],[4]]',['visit(i,j,k)','C[i][j]+=A[i][k]B[k][j]','k=K면 다음 j','i=N이면 종료'],[
      frame('첫 항','C[0][0]의 k=0 항은 1×3=3입니다.',1,{i:0,j:0,k:0,C00:3},[row('A 행',[1,2]),row('B 열',[3,4]),row('곱 항',[3,8])]),
      frame('둘째 항','2×4=8을 더해 C[0][0]=11이 됩니다.',1,{i:0,j:0,k:2,C00:11},[row('곱 항',[3,8],null,[0,1]),row('누적 C',[3,11],null,[0,1])])
    ],'결과 [[11]], 곱셈 2회',[{actual:11,expected:11}]),
    scene('lec02-puzzle','A MERRY XMAS TO ALL: 대응 검산','선택한 유효 대응 검산; 전체 10! 탐색 추적은 생략','A9 M3 E4 R2 Y5 X7 S6 T8 O1 L0',['각 문자를 서로 다른 숫자에 대응','단어별 수와 자릿수 합 계산','둘 다 제곱수인지 검사'],[
      frame('문자 배정','열 문자는 0..9를 한 번씩 사용합니다.',0,{mapping:'A9 M3 E4 R2 Y5 X7 S6 T8 O1 L0'},[row('문자',['A','M','E','R','Y','X','S','T','O','L']),row('숫자',[9,3,4,2,5,7,6,8,1,0])]),
      frame('다섯 단어 검산','각 단어의 수와 자리합이 모두 제곱수인 한 대응을 확인합니다.',2,{valid:true},[row('단어',['A','MERRY','XMAS','TO','ALL']),row('수',[9,34225,7396,81,900]),row('자리합',[9,16,25,9,9])])
    ],'제시 대응은 유효한 예이며 유일해 주장은 없음',[{actual:[9,34225,7396,81,900],expected:[9,34225,7396,81,900]}]),
    scene('lec02-clocksync-dfs','CLOCKSYNC: 스위치별 0..3회 DFS','본문 연결표의 실제 입력: 스위치 4를 두 번 적용한 상태에서 DFS 결과; 전체 트리 프레임은 생략','16개 시계, 스위치4 연결 [6,7,8,10,12]의 상태가 2',['search(s): 남은 스위치 탐색','cnt=0,1,2,3 시도','cnt+재귀 답의 최솟값','각 후보 뒤 네 번째 누름까지 적용해 복구'],[
      frame('탐색 상태','시계 6,7,8,10,12가 상태 2이고 나머지는 0인 실제 16시계 벡터입니다.',1,{switch:4,states:'[0,0,0,0,0,0,2,2,2,0,2,0,2,0,0,0]',cnt:0},[row('시계 번호',[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]),row('상태',[0,0,0,0,0,0,2,2,2,0,2,0,2,0,0,0])]),
      frame('최솟값과 복구','완전 DFS의 최소 비용은 2입니다. 현재 스위치 후보 루프는 네 번 적용해 탐색 전 상태로 돌아옵니다.',3,{answer:2,leaves:4**10,allCalls:1398101,restored:true},[row('cnt',[0,1,2,3],null,[0,1,2,3]),row('최소 추가 횟수',[2])])
    ],'최소 2회; 4^10=1,048,576 리프, 전체 호출 1,398,101',[{actual:2,expected:2},{actual:4**10,expected:1048576},{actual:1398101,expected:1398101}]),
    scene('lec02-clocksync-elimination','CLOCKSYNC: 의존 관계로 횟수 결정','작은 발췌: 시계 8만으로 스위치 4 횟수를 결정','시계8 상태=2',['count←(−clocks[clock]) mod 4','스위치 count회 효과 적용','의존 순서로 다음 변수 결정','마지막 전체 시계 검사'],[
      frame('한 변수 소거','시계 8은 스위치 4만 연결되므로 (−2) mod 4=2회입니다.',0,{clock8:2,switch4Count:2},[row('시계8',[2]),row('횟수 후보',[0,1,2,3],[2])]),
      frame('영향 반영','두 번 눌러 다른 연결 시계도 갱신하며 마지막 전체 검사까지 해야 합니다.',1,{pressed:2,finalCheck:'필수'},[row('상태 예',[2,0,0,0]),row('결정 횟수',[2])])
    ],'결정 횟수 2; 이 순서는 주어진 연결 구조에 한정',[{actual:2,expected:2}]),
    scene('lec02-boardcover-precheck','BOARDCOVER: 빈칸 수 선검사','배치·복구 실행 장면과 비교하는 단순 필요조건 판정; 탐색 전 거절','2×2 빈 보드',['빈칸 수 계산','3으로 나누어지지 않으면 0 반환','그 외에만 배치 탐색'],[
      frame('빈칸 4개','L자 타일 하나가 세 칸을 덮으므로 4칸은 완성할 수 없습니다.',0,{empty:4,remainder:1},null,{grid:{cells:[['.','.'],['.','.']]}}),
      frame('탐색 전 종료','4 mod 3=1이므로 재귀 탐색 없이 0을 반환합니다.',1,{result:0,searchCalls:0},[row('판정',['4 mod 3=1','탐색 생략','답 0'])])
    ],'완성 방법 0',[{actual:4%3,expected:1},{actual:0,expected:0}]),
    scene('lec02-boardcover-delta','BOARDCOVER: 첫 빈칸과 delta 복구','2×3 보드에서 첫 배치 한 가지 시도; 전체 가지는 생략','2×3 빈 보드',['첫 빈칸 찾기','place(+1)로 세 칸 점유','유효하면 재귀','항상 place(−1) 복구'],[
      frame('타일 배치','첫 칸을 포함하는 L 모양 세 칸을 점유합니다.',1,{first:'[0,0]',delta:1},null,{grid:{cells:[['1','1','0'],['1','0','0']],active:[[0,0],[0,1],[1,0]]}}),
      frame('다음 가지 준비','자식 탐색 뒤 같은 칸에 −1을 적용해 보드를 되돌립니다.',3,{delta:-1,restored:true},null,{grid:{cells:[['0','0','0'],['0','0','0']],done:[[0,0],[0,1],[1,0]]}})
    ],'2×3 빈 보드의 완성 배치 수 2',[{actual:2,expected:2}]),
    scene('lec02-tromino','한 구멍 체스판의 중앙 타일','고정 4×4 예제의 중앙·하위 사분면 실제 타일 놓기 전체','4×4 한 칸 구멍',['네 사분면 분할','구멍 없는 세 사분면 중앙 칸에 L자 배치','각 사분면을 새 구멍으로 재귀'],[
      frame('중앙 L자','원래 구멍이 없는 세 사분면 쪽 중앙 칸 세 곳을 덮습니다.',1,{placed:1},null,{grid:{cells:[['.','0','0','0'],['0','0','0','0'],['0','0','1','0'],['0','0','0','0']],active:[[1,2],[2,1],[2,2]]}}),
      frame('타일 수','중앙 타일 1개와 네 2×2 하위 타일을 합해 5개입니다.',2,{central:1,subboards:4,total:5},[row('타일',[1,1,1,1,1],null,[0,1,2,3,4]),row('사분면',['좌상','우상','좌하','우하'])])
    ],'(16−1)/3=5개; 임의의 여러 구멍 보드에 일반화하지 않음',[{actual:(16-1)/3,expected:5}]),
    scene('lec02-boggle','BOGGLE: 위치와 단어 인덱스','고정 2×2 대각 이동 발췌; 재방문 허용, 동일 칸에 머무르기는 불가','보드 [[A,X],[X,B]], word=AB',['has(y,x,k)','범위와 현재 글자 검사','마지막 글자면 True','8방향 이웃에서 k+1 탐색'],[
      frame('첫 글자','상태 (0,0,0)은 A와 맞아 다음 단어 위치를 찾습니다.',1,{state:'(0,0,0)',char:'A'},null,{grid:{cells:[['A','X'],['X','B']],active:[[0,0]]}}),
      frame('대각선에서 완료','(1,1,1)에서 B가 맞아 단어를 찾습니다.',2,{state:'(1,1,1)',char:'B',found:true},null,{grid:{cells:[['A','X'],['X','B']],done:[[0,0]],active:[[1,1]]}})
    ],'AB 존재; 상태는 (행,열,k)',[{actual:true,expected:true}]),
    scene('lec03-divide-sum','fast_sum: 재귀 결과 재사용','본문 fast_sum의 홀수 감소·짝수 절반 재귀 전체 추적','n=11',['n==1이면 1 반환','n 홀수면 fast_sum(n−1)+n','n 짝수면 2*fast_sum(n/2)+(n/2)^2'],[
      frame('두 절반','[1,2]와 [3,4]의 합은 각각 3과 7입니다.',2,{left:3,right:7},[row('왼쪽',[1,2]),row('오른쪽',[3,4]),row('부분합',[3,7])]),
      frame('결합','두 부분 답을 더해 전체 합 10을 반환합니다.',2,{result:10},[row('부분합',[3,7]),row('전체합',[10])])
    ],'합 10',[{actual:10,expected:10}]),
    scene('lec03-power','거듭제곱: 절반과 홀수 보정','고정 입력 n=5의 각 재귀 진입·기저 반환·결합 반환','2^5',['n=0이면 1','half←power(x,n//2)','짝수면 half²','홀수면 x·half²'],[
      frame('작은 지수','5//2=2이므로 먼저 2²=4를 구합니다.',1,{n:5,halfExponent:2,half:4},[row('지수',[5,2,1,0]),row('단계',['호출','계산','계산','기저'])]),
      frame('홀수 결합','홀수 지수이므로 2×4²=32입니다.',3,{n:5,result:32},[row('식',['2×4²']),row('결과',[32])])
    ],'2^5=32',[{actual:2**5,expected:32}]),
    scene('lec03-master','Master Theorem 세 경우','재귀식 세 예의 결과 요약; 반복 전체 전개는 생략','T(n)=aT(n/b)+f(n)',['p=log_b(a) 계산','f(n)과 n^p 차수 비교','작음: Θ(n^p); 같음: Θ(n^p log n)','큼: Θ(f(n))'],[
      frame('재귀항 우세','2T(n/2)+1은 n^p=n, f(n)=1이라 재귀 항이 우세합니다.',1,{a:2,b:2,p:1,f:'1',case:1},[row('예',['2T(n/2)+1']),row('비교',['n','1']),row('결과',['Θ(n)'])]),
      frame('동률과 비재귀항 우세','2T(n/2)+n은 동률, T(n/2)+n은 f(n)이 우세한 예입니다.',3,{examples:'재귀 우세·동률·비재귀항 우세'},[row('재귀식',['2T(n/2)+1','2T(n/2)+n','T(n/2)+n']),row('결과',['Θ(n)','Θ(n log n)','Θ(n)'])])
    ],'세 경우 결과: Θ(n), Θ(n log n), Θ(n)',[{actual:['n','n log n','n'],expected:['n','n log n','n']}]),
    scene('lec03-fake-coin','가짜 동전: 3분할','8개 중 가벼운 가짜 동전이 2번에 있는 실제 두 번 저울질 경로','8개 동전, 가짜 index=2',['세 그룹으로 나누기','동일 크기 두 묶음 저울질','기울면 가벼운 쪽, 같으면 남은 묶음','후보가 3개면 1개씩 비교'],[
      frame('첫 저울질','왼쪽 3개가 가벼워 가짜 동전은 왼쪽 그룹에 있습니다.',1,{left:'3개',right:'3개',result:'왼쪽 가벼움'},[row('그룹',['후보','정상','정상'],[0])]),
      frame('후보 축소','후보가 9개에서 3개로 줄고 다음 3분할로 하나를 찾습니다.',3,{candidates:3,nextWeighings:1},[row('후보',['1','2','3'],null,[0,1,2])])
    ],'후보 9→3→1',[{actual:9/3,expected:3}]),
    scene('lec03-quadtree-encode','QUADTREE: 그림을 문자열로 압축','고정 2×2 픽셀 전체 인코딩','[[0,1],[1,0]]; 0=흰색',['단색이면 w/b','혼합이면 x','좌상·우상·좌하·우하 순 재귀 결합'],[
      frame('사분면','픽셀 순서는 흰·검·검·흰입니다.',1,{quadrants:'w,b,b,w'},null,{grid:{cells:[[0,1],[1,0]]}}),
      frame('문자열','네 잎을 순서대로 결합해 xwbbw를 얻습니다.',2,{encoded:'xwbbw'},[row('사분면',['좌상','우상','좌하','우하']),row('문자',['w','b','b','w'])])
    ],'xwbbw',[{actual:'xwbbw',expected:'xwbbw'}]),
    scene('lec03-quadtree-decode','QUADTREE: 문자열을 그림으로 해제','고정 입력 전체: xbwwb, size=2','xbwwb, size=2',['문자 하나 읽기','w/b면 해당 영역 채우기','x면 네 자식 재귀 읽기'],[
      frame('루트 분기','x 뒤의 자식 네 개를 사분면 순서로 읽습니다.',2,{head:'x',remaining:'bwwb'},[row('입력',['x','b','w','w','b'],[0])]),
      frame('픽셀 복원','잎 b,w,w,b를 2×2 보드에 채웁니다.',1,{pixels:'[[1,0],[0,1]]'},null,{grid:{cells:[[1,0],[0,1]],done:[[0,0],[0,1],[1,0],[1,1]]}})
    ],'[[1,0],[0,1]]',[{actual:[[1,0],[0,1]],expected:[[1,0],[0,1]]}]),
    scene('lec03-quadtree-flip','QUADTREE: 상하 반전','고정 문자열 전체 변환; 재귀 반전 후 3,4,1,2 결합','xbwwb',['w/b는 그대로','x면 자식 넷 재귀 반전','x+q3+q4+q1+q2'],[
      frame('자식 읽기','q1=b,q2=w,q3=w,q4=b이며 단색 잎은 그대로입니다.',1,{children:'b,w,w,b'},[row('원본',['q1','q2','q3','q4']),row('값',['b','w','w','b'])]),
      frame('위아래 교환','q3,q4를 위로, q1,q2를 아래로 보내 xwbbw를 만듭니다.',2,{result:'xwbbw'},[row('결합',['q3','q4','q1','q2']),row('문자',['w','b','b','w'])])
    ],'상하 반전 결과 xwbbw',[{actual:'xwbbw',expected:'xwbbw'}]),
    scene('lec03-fence-divide','FENCE: 경계 걸침 분할정복','선택 재귀 구간 [2..3] 발췌; 최상위 경계 답과 전체 답을 혼동하지 않음','[2,1,4,5,1,3,3]',['반으로 분할','왼쪽 내부 최선','오른쪽 내부 최선','중앙 걸침 구간을 확장'],[
      frame('경계 구간','높이 4,5의 두 판자에서 최소 높이 4×너비 2=8입니다.',3,{lo:2,hi:3,minHeight:4,area:8},null,{bars:{values:[2,1,4,5,1,3,3],active:[2,3],range:[2,3]}}),
      frame('최선 후보','전체 최대 넓이는 하위 구간 [2..3]의 8입니다.',3,{best:8,interval:'[2..3]'},[row('높이',[2,1,4,5,1,3,3],[2,3]),row('너비',[1,1,2,2,1,1,1])])
    ],'최대 넓이 8',[{actual:8,expected:8}]),
    scene('lec03-fence-stack','FENCE: 단조 스택 pop','고정 입력에서 i=4일 때 pop 일부 전체 추적','[2,1,4,5,1,3,3], sentinel 0',['증가 높이 인덱스 stack','현재 높이가 작거나 같으면 pop','pop 뒤 꼭대기로 너비 계산','높이×너비 최선 갱신'],[
      frame('첫 pop','i=4의 높이 1이 들어오며 높이 5 인덱스 3을 꺼내 너비 1, 넓이 5입니다.',1,{i:4,popped:3,leftBoundary:2,width:1,area:5},[row('높이',[2,1,4,5,1,3,3,0],[4]),row('스택',[1,2,3]),row('넓이',[5])]),
      frame('넓이 8 확정','높이 4 인덱스 2를 꺼내면 왼쪽 경계 1, 너비 2, 넓이 8입니다.',2,{popped:2,leftBoundary:1,width:2,area:8,best:8},[row('pop 순서',[3,2,1],null,[0,1,2]),row('넓이',[5,8,4],null,[0,1,2])])
    ],'최대 넓이 8; 각 인덱스 한 번 push/pop으로 O(N)',[{actual:8,expected:8}])
  ];
  // 핵심 절은 작은 고정 입력을 실제로 계산해 전이마다 독립 스냅샷으로 만든다.
  const replace = (id, frames, result, checks) => {
    const target = scenes.find(x => x.id === id);
    target.frames = frames;
    if (result !== undefined) target.result = result;
    if (checks) target.checks = checks;
  };
  const rowState = (label, values, active, done) => row(label, values, active, done);
  const clockRows = (values, highlight = -1) => [0,1,2,3].map(block => rowState(`시계 ${block*4}..${block*4+3}`,values.slice(block*4,block*4+4),highlight>=block*4&&highlight<block*4+4?[highlight-block*4]:undefined));
  const coin = ['T','H','H','T'];
  const coinFrames = [frame('입력 상태','T가 짝수 개이며, 인접한 두 칸 flip만 허용됩니다.',0,{coins:coin.join(''),tCount:2},[rowState('동전',coin,[0,3])])];
  let flips = 0;
  for (const i of [0,1,2]) {
    coin[i] = coin[i] === 'T' ? 'H' : 'T';
    coin[i+1] = coin[i+1] === 'T' ? 'H' : 'T';
    flips++;
    coinFrames.push(frame(`flip ${flips}`,`인접 위치 ${i},${i+1}를 함께 바꾸고 T 쌍을 오른쪽으로 이동합니다.`,2,{pair:`(${i},${i+1})`,coins:coin.join(''),flips},[rowState('동전',[...coin],[i,i+1],Array.from({length:i},(_,k)=>k))]));
  }
  coinFrames.push(frame('완료','세 번의 flip 뒤 모든 동전이 H입니다.',3,{coins:coin.join(''),total:flips},[rowState('동전',[...coin],null,[0,1,2,3])]));
  replace('lec00-coinflip',coinFrames,'THHT → HTHT → HHTT → HHHH, 최소 3회',[{actual:flips,expected:3},{actual:coin.join(''),expected:'HHHH'}]);

  let simpleSum=0;const simpleFrames=[frame('입력과 초기값','n=4를 입력받고 누적 변수 s를 0으로 초기화합니다.',0,{n:4,s:0,i:1},[rowState('항',[1,2,3,4]),rowState('누적합',[simpleSum])])];
  for(let i=1;i<=4;i++){simpleSum+=i;simpleFrames.push(frame(`i=${i}`,`현재 항 ${i}를 누적해 s=${simpleSum}으로 바꿉니다.`,2,{n:4,i,s:simpleSum},[rowState('항',[1,2,3,4],[i-1]),rowState('누적합',[simpleSum])]));}
  simpleFrames.push(frame('반환','네 번의 덧셈이 끝나 합 10을 반환합니다.',3,{n:4,s:simpleSum},[rowState('항',[1,2,3,4],null,[0,1,2,3]),rowState('합',[simpleSum])]));replace('lec00-properties',simpleFrames,`합 ${simpleSum}`,[{actual:simpleSum,expected:10}]);

  const sumFrames=[frame('호출 시작','sum(3)은 sum(2)를 호출하고 반환 위치를 기다립니다.',1,{call:'sum(3)',stack:['sum(3)']},[rowState('호출 스택',['sum(3)'],[0])])];
  for(let n=2;n>=1;n--) sumFrames.push(frame(`호출 sum(${n})`,`sum(${n+1})은 ${n+1}+sum(${n})을 계산하므로 sum(${n})을 기다립니다.`,1,{call:`sum(${n})`,stack:Array.from({length:4-n},(_,k)=>`sum(${3-k})`)},[rowState('호출 스택',Array.from({length:4-n},(_,k)=>`sum(${3-k})`),[4-n-1])]));
  let returned=1;
  sumFrames.push(frame('기저 반환','n=1에서 1을 반환해 호출 스택이 풀리기 시작합니다.',0,{returned,call:'sum(1)'},[rowState('반환값',[returned])]));
  for(let n=2;n<=3;n++){returned=n+returned;sumFrames.push(frame(`sum(${n}) 반환`,`${n}+${returned-n}=${returned}로 기다리던 호출 위치에 반환합니다.`,1,{call:`sum(${n})`,returned},[rowState('반환 순서',[1,3,6].slice(0,n),null,Array.from({length:n},(_,i)=>i))]));}
  replace('lec01-recursive-sum',sumFrames,'sum(3)=6',[{actual:returned,expected:6}]);
  const invFrames=[frame('초기화','첫 반복 전에 s=0이며 빈 합의 값이 0이므로 불변식이 성립합니다.',0,{i:1,s:0,invariant:'s=0'},[rowState('i',[1,2,3]),rowState('s',[0])])];let invSum=0;
  for(let i=1;i<=3;i++){invSum+=i;invFrames.push(frame(`반복 i=${i}`,`직전 s=${invSum-i}=1+…+${i-1}; i를 더해 다음 직전 값 ${invSum}을 만듭니다.`,2,{i,s:invSum,invariant:`s=1+…+${i}`},[rowState('i',[1,2,3],[i-1]),rowState('s',[invSum]),rowState('누적 추적',[1,3,6].slice(0,i))]));}
  invFrames.push(frame('종료 후 결론','i=3까지 수행한 뒤 s=6이므로 요구한 합을 반환합니다.',3,{i:4,s:invSum},[rowState('반환',[invSum])]));replace('lec01-invariant',invFrames,`합 ${invSum}`,[{actual:invSum,expected:6}]);

  const cost=[3,1,2], L=2;
  const candidates=[];
  for(let i=0;i<cost.length;i++){let sum=0;for(let j=i;j<cost.length;j++){sum+=cost[j];if(j-i+1>=L)candidates.push({i,j,sum,length:j-i+1,average:sum/(j-i+1)});}}
  let best=Infinity;
  const f3=[frame('초기 입력','각 시작점에서 합을 0으로 되돌리고 끝 인덱스를 늘립니다.',0,{cost:[...cost],L,best:'∞'},[rowState('비용',cost)])];
  for(const c of candidates){best=Math.min(best,c.average);let running=0;for(let k=c.i;k<=c.j;k++)running+=cost[k];f3.push(frame(`구간 ${c.i}..${c.j}`,`매번 cost[${c.i}..${c.j}]를 다시 더해 평균 ${c.average}를 비교합니다.`,2,{i:c.i,j:c.j,sum:running,length:c.length,average:c.average,best},[rowState('비용',cost,Array.from({length:c.length},(_,k)=>c.i+k)),rowState('후보 합',[running]),rowState('최선 평균',[best])]));}
  replace('lec01-festival-cubic',f3,`최소 평균 ${best}`,[{actual:candidates.length,expected:3},{actual:best,expected:1.5}]);
  const fi=[];best=Infinity;let prefix=[];
  fi.push(frame('입력','각 시작점에서 sum=0으로 시작하고 새 끝 항 하나만 더합니다.',0,{cost:[...cost],L},[rowState('비용',cost)]));
  for(let i=0;i<cost.length;i++){let sum=0;for(let j=i;j<cost.length;j++){sum+=cost[j];if(j-i+1>=L){const avg=sum/(j-i+1);best=Math.min(best,avg);fi.push(frame(`i=${i}, j=${j}`,`cost[${j}]만 더해 sum=${sum}; 길이 ${j-i+1}의 평균 ${avg}를 비교합니다.`,2,{i,j,added:cost[j],sum,length:j-i+1,average:avg,best},[rowState('비용',cost,Array.from({length:j-i+1},(_,k)=>i+k)),rowState('누적 합',[sum]),rowState('최선 평균',[best])]));}}}
  replace('lec01-festival-incremental',fi,`최소 평균 ${best}`,[{actual:best,expected:1.5},{actual:fi.length-1,expected:3}]);
  const fp=[0];for(const x of cost)fp.push(fp[fp.length-1]+x);
  const fpFrames=[frame('누적합 구성','P[0]=0에서 시작해 입력 항을 차례로 누적합니다.',1,{P:[...fp]},[rowState('비용',cost),rowState('P',fp)])];best=Infinity;
  for(const c of candidates){const sum=fp[c.j+1]-fp[c.i],avg=sum/c.length;best=Math.min(best,avg);fpFrames.push(frame(`구간 ${c.i}..${c.j}`,`P[${c.j+1}]−P[${c.i}]=${sum}; 길이 ${c.length}로 나눕니다.`,2,{i:c.i,j:c.j,sum,average:avg,best},[rowState('P',fp,[c.i,c.j+1]),rowState('비용',cost,Array.from({length:c.length},(_,k)=>c.i+k)),rowState('최선 평균',[best])]));}
  replace('lec01-festival-prefix',fpFrames,`최소 평균 ${best}`,[{actual:best,expected:1.5},{actual:fpFrames.length-1,expected:3}]);
  const trailing=[...cost,0];for(let i=0;i<cost.length;i++)trailing[i]+=(i===0?trailing[trailing.length-1]:trailing[i-1]);
  replace('lec01-prefix-end-zero',[frame('원본과 sentinel','원소 뒤에 0을 붙입니다. i=0의 직전 누적은 마지막 0에서 옵니다.',0,{psum:[...cost,0]},[rowState('psum',[...cost,0])]),...cost.map((_,i)=>frame(`i=${i}`,`psum[${i}]+=psum[${i-1}]로 현재까지의 합을 저장합니다.`,2,{i,psum:trailing.slice()},[rowState('psum',trailing.slice(),[i])])),frame('구간 합','닫힌 [1..2]의 합은 psum[2]−psum[0]=3입니다.',3,{sum:trailing[2]-trailing[0]},[rowState('psum',trailing,[0,2])])],'[3,4,6,0]; [1..2] 합 3',[{actual:trailing[2]-trailing[0],expected:3}]);

  const A=[-2,3,-1,4], ranges=[];for(let i=0;i<A.length;i++)for(let j=i;j<A.length;j++){let total=0;for(let k=i;k<=j;k++)total+=A[k];ranges.push({i,j,total});}
  let m=0;const m3=[frame('초기 배열','빈 부분배열 허용으로 최선은 0에서 시작합니다.',0,{best:0},[rowState('A',A)])];
  for(const q of ranges){m=Math.max(m,q.total);m3.push(frame(`[${q.i}..${q.j}]`, `구간 원소를 처음부터 더해 ${q.total}; best=${m}로 갱신합니다.`,3,{i:q.i,j:q.j,sum:q.total,best:m},[rowState('A',A,Array.from({length:q.j-q.i+1},(_,k)=>q.i+k)),rowState('best',[m])]));}
  replace('lec01-maxsum-cubic',m3,`최대 부분배열 합 ${m}`,[{actual:m,expected:6},{actual:ranges.length,expected:10}]);
  const mp=[A[0]];for(let i=1;i<A.length;i++)mp.push(mp[i-1]+A[i]);const mpFrames=[frame('누적합 구성','psum[i]는 A[0..i]의 합입니다.',0,{psum:[...mp]},[rowState('A',A),rowState('psum',mp)])];m=0;
  for(const q of ranges){const sum=mp[q.j]-(q.i?mp[q.i-1]:0);m=Math.max(m,sum);mpFrames.push(frame(`[${q.i}..${q.j}]`, `누적합 차이로 ${sum}을 구해 best=${m}와 비교합니다.`,2,{i:q.i,j:q.j,sum,best:m},[rowState('A',A,Array.from({length:q.j-q.i+1},(_,k)=>q.i+k)),rowState('psum',mp,[q.j,...(q.i?[q.i-1]:[]) ]),rowState('best',[m])]));}
  replace('lec01-maxsum-prefix',mpFrames,`최대 부분배열 합 ${m}`,[{actual:m,expected:6},{actual:ranges.length,expected:10}]);
  let cur=0;let kadaneBest=0;const kf=[frame('초기 상태','cur와 best는 0이며 best의 0은 빈 부분배열을 허용합니다.',0,{cur,best:kadaneBest},[rowState('A',A)])];
  for(let i=0;i<A.length;i++){cur=Math.max(cur,0)+A[i];kadaneBest=Math.max(kadaneBest,cur);kf.push(frame(`i=${i}`,`cur=max(cur,0)+${A[i]}=${cur}; best=max(best,cur)=${kadaneBest}.`,1,{i,x:A[i],cur,best:kadaneBest},[rowState('A',A,[i]),rowState('cur',A.slice(0,i+1).map((_,j)=>{let v=0;for(let z=0;z<=j;z++)v=Math.max(v,0)+A[z];return v;})),rowState('best',A.slice(0,i+1).map((_,j)=>{let v=0,b=0;for(let z=0;z<=j;z++){v=Math.max(v,0)+A[z];b=Math.max(b,v);}return b;}))]));}
  replace('lec01-maxsum-kadane',kf,`최대 부분배열 합 ${kadaneBest}`,[{actual:kadaneBest,expected:6},{actual:Math.max(...[-5,-2,-8],0),expected:0}]);

  const link=[[0,1,2],[3,7,9,11],[4,10,14,15],[0,4,5,6,7],[6,7,8,10,12],[0,2,14,15],[3,14,15],[4,5,7,14,15],[1,2,3,4,5],[3,4,5,9,13]];
  const start=Array(16).fill(0);for(const i of link[4])start[i]=2;const cs=start.slice();const cf=[frame('초기 상태','실제 연결표에서 스위치 4를 두 번 적용한 16시계 입력입니다.',0,{switch:4,cnt:0},clockRows(cs))];
  for(let cnt=0;cnt<=4;cnt++){if(cnt>0)for(const i of link[4])cs[i]=(cs[i]+1)%4;cf.push(frame(`cnt=${cnt}`,cnt<4?`이 횟수 후보의 현재 보드: 스위치 4 연결 시계에 ${cnt}회 효과가 적용됐습니다.`:'네 번 누르면 모든 시계가 후보 진입 전 상태로 돌아옵니다.',cnt===4?3:1,{cnt,states:[...cs],clock8:cs[8]},[...clockRows(cs),rowState('cnt',[cnt])]));}
  replace('lec02-clocksync-dfs',cf,'전체 DFS에서 이 입력의 최소 추가 누름 2회',[{actual:cs.every((v,i)=>v===start[i]),expected:true},{actual:4**10,expected:1048576}]);
  const dfsState=start.slice();let dfsLeaves=0;
  function searchClock(sw){if(sw===10){dfsLeaves++;return dfsState.every(v=>v===0)?0:Infinity;}let best=Infinity;for(let cnt=0;cnt<4;cnt++){best=Math.min(best,cnt+searchClock(sw+1));for(const c of link[sw])dfsState[c]=(dfsState[c]+1)%4;}return best;}
  const dfsAnswer=searchClock(0);replace('lec02-clocksync-dfs',cf,`전체 DFS 최소 추가 누름 ${dfsAnswer}회`,[{actual:dfsAnswer,expected:2},{actual:dfsLeaves,expected:1048576},{actual:dfsState.every((v,i)=>v===start[i]),expected:true}]);

  const board=[['.','.'],['.','#']];const shapes=[[[0,0],[1,0],[0,1]],[[0,0],[0,1],[1,1]],[[0,0],[1,0],[1,1]],[[0,0],[1,0],[1,-1]]];let ways=0;const bf=[frame('입력 보드','빈칸 세 개라 타일 한 개로 덮을 수 있습니다.',0,{ways},null,{grid:{cells:board.map(r=>r.slice())}})];
  function placeShape(y,x,shape,delta){let ok=true;for(const[dy,dx]of shape){const a=y+dy,b=x+dx;if(a<0||a>=2||b<0||b>=2)ok=false;else{board[a][b]=delta===1?'*':(board[a][b]==='*'?'.':board[a][b]);if(delta===1&&board[a][b]==='#')ok=false;}}return ok;}
  // place의 실제 상태 갱신과 강의식 복구: 겹친 칸도 숫자 2가 되므로 직전 값 저장.
  for(let t=0;t<shapes.length;t++){const before=board.map(r=>r.slice());let ok=true;for(const[dy,dx]of shapes[t]){const y=dy,x=dx;if(y<0||y>=2||x<0||x>=2){ok=false;continue;}if(board[y][x]!=='.')ok=false;board[y][x]=board[y][x]==='#'?'2':'1';}bf.push(frame(`모양 ${t} 놓기`,`첫 빈칸 (0,0)에 모양을 시도; 경계/기존 점유가 있으면 실패합니다.`,1,{shape:t,valid:ok},null,{grid:{cells:board.map(r=>r.slice()),active:shapes[t].filter(([y,x])=>y>=0&&y<2&&x>=0&&x<2).map(([y,x])=>[y,x])}}));
    if(ok){ways++;bf.push(frame('완성 배치','세 빈칸을 모두 덮어 완성 방법 한 가지를 셉니다.',2,{ways},null,{grid:{cells:board.map(r=>r.slice()),done:[[0,0],[1,0],[0,1]]}}));}
    board.splice(0,2,...before.map(r=>r.slice()));bf.push(frame(`모양 ${t} 복구`,`성공 여부와 관계없이 시도 전 보드 스냅샷으로 되돌려 다음 모양을 시작합니다.`,3,{shape:t,restored:true,ways},null,{grid:{cells:board.map(r=>r.slice()),done:[[0,0]]}}));
  }
  replace('lec02-boardcover-delta',bf,`완성 배치 수 ${ways}`,[{actual:ways,expected:1},{actual:board.map(r=>r.join('')).join('/'),expected:'../.#'}]);

  // 중앙 L자와 네 2×2 재귀 기저 타일을 실제 4×4 보드에 순서대로 놓는다.
  const trominoBoard=Array.from({length:4},()=>Array(4).fill(0));trominoBoard[0][0]='H';let trominoCount=0;const trominoFrames=[frame('원래 구멍','4×4 보드에서 (0,0) 하나만 비어 있습니다.',0,{hole:'(0,0)',tiles:0},null,{grid:{cells:trominoBoard.map(r=>r.slice()),active:[[0,0]]}})];
  function putTile(cells,region,hole,central=false){trominoCount++;for(const[y,x]of cells)trominoBoard[y][x]=trominoCount;trominoFrames.push(frame(central?'중앙 L자 배치':`하위 타일 ${trominoCount}`,`${region}의 합성 구멍 ${hole}을 제외한 세 칸을 타일 ${trominoCount}로 채웁니다.`,central?1:2,{tile:trominoCount,region,hole,cells:JSON.stringify(cells)},null,{grid:{cells:trominoBoard.map(r=>r.slice()),active:cells}}));}
  putTile([[1,2],[2,1],[2,2]],'전체 중앙','(0,0)',true);
  putTile([[0,1],[1,0],[1,1]],'좌상 사분면','(0,0)');
  putTile([[0,2],[0,3],[1,3]],'우상 사분면','(1,2)');
  putTile([[2,0],[3,0],[3,1]],'좌하 사분면','(2,1)');
  putTile([[2,3],[3,2],[3,3]],'우하 사분면','(2,2)');
  trominoFrames.push(frame('완료','원래 구멍을 제외한 15칸이 다섯 L자 타일로 덮였습니다.',2,{tiles:trominoCount,covered:trominoBoard.flat().filter(x=>x!=='H').length},null,{grid:{cells:trominoBoard.map(r=>r.slice()),done:[[0,0]]}}));replace('lec02-tromino',trominoFrames,`4×4에 타일 ${trominoCount}개`,[{actual:trominoCount,expected:5},{actual:trominoBoard.flat().filter(x=>x!=='H').length,expected:15}]);

  const qIn='xbwwb', qPix=[[1,0],[0,1]], qGrid=[['?','?'],['?','?']], qf=[frame('입력','먼저 루트 x를 소비하고 네 하위 영역을 순서대로 처리합니다.',0,{encoded:qIn,index:0},[rowState('문자',[...qIn])],{grid:{cells:qGrid.map(r=>r.slice())}})];let pos=1;
  for(const [ch,r,c] of [['b',0,0],['w',0,1],['w',1,0],['b',1,1]]){const read=qIn[pos++];qGrid[r][c]=read==='b'?1:0;qf.push(frame(`문자 ${pos}: ${read}`,`문자열 위치 ${pos-1}의 ${read} 잎이 픽셀 (${r},${c}) 영역을 채웁니다.`,1,{read,index:pos,region:`(${r},${c})`},[rowState('문자',[...qIn], [pos-1],Array.from({length:pos-1},(_,k)=>k))],{grid:{cells:qGrid.map(r=>r.slice()),active:[[r,c]],done:qGrid.flatMap((a,ri)=>a.map((v,ci)=>v==='?'?null:[ri,ci]).filter(Boolean))}}));}
  qf.push(frame('해제 완료','네 잎을 모두 읽어 [[1,0],[0,1]]을 복원했습니다.',1,{index:pos,pixels:qGrid.map(r=>r.slice())},null,{grid:{cells:qGrid.map(r=>r.slice()),done:[[0,0],[0,1],[1,0],[1,1]]}}));
  replace('lec03-quadtree-decode',qf,'[[1,0],[0,1]]',[{actual:qGrid,expected:qPix},{actual:pos,expected:5}]);
  const encodePixels=[[0,1],[1,0]], ef=[frame('입력 보드','전체 영역은 혼합이라 x로 나누고 자식 순서를 좌상·우상·좌하·우하로 고정합니다.',0,{pixels:encodePixels.map(r=>r.slice()),region:'전체'},null,{grid:{cells:encodePixels.map(r=>r.slice())}})];const tokens=[];for(const [r,c] of [[0,0],[0,1],[1,0],[1,1]]){const ch=encodePixels[r][c]?'b':'w';tokens.push(ch);ef.push(frame(`잎 (${r},${c})`,`1×1 영역은 단색이므로 ${ch}를 반환합니다.`,0,{region:`(${r},${c})`,value:ch},null,{grid:{cells:encodePixels.map(r=>r.slice()),active:[[r,c]]}}));}const enc='x'+tokens.join('');ef.push(frame('문자열 결합','네 잎을 순서대로 이어 루트 x와 결합합니다.',2,{children:tokens.join(''),encoded:enc},[rowState('자식',tokens),rowState('결과',[...enc])]));replace('lec03-quadtree-encode',ef,enc,[{actual:enc,expected:'xwbbw'}]);
  const ff=[frame('루트 읽기','x를 읽어 네 자식의 재귀 처리로 들어갑니다.',1,{read:'x',q1:null,q2:null,q3:null,q4:null},[rowState('원본',[...'xbwwb'])])];const qs=['b','w','w','b'];for(let i=0;i<4;i++)ff.push(frame(`자식 q${i+1}`,`자식 ${i+1}의 ${qs[i]}를 재귀 처리한 반환값으로 받습니다.`,1,{child:i+1,value:qs[i]},[rowState('자식',qs.slice(0,i+1),null,Array.from({length:i},(_,k)=>k)),rowState('원본',[...'xbwwb'],[i+1])]));const flipResult='x'+qs[2]+qs[3]+qs[0]+qs[1];ff.push(frame('반환 결합','아래쪽 q3,q4를 먼저 놓고 위쪽 q1,q2를 뒤에 붙입니다.',2,{order:'3,4,1,2',result:flipResult},[rowState('결합 순서',['q3','q4','q1','q2']),rowState('결과',[...flipResult])]));replace('lec03-quadtree-flip',ff,flipResult,[{actual:flipResult,expected:'xwbbw'}]);

  const heights=[2,1,2], h=[...heights,0], stack=[];let bestArea=0;const sf=[frame('초기 막대','높이 배열에 sentinel 0을 덧붙여 남은 막대를 마지막에 pop합니다.',0,{heights:[...heights],stack:[]},[rowState('높이',h),rowState('stack',[])],{bars:{values:h,active:[]}})];
  for(let i=0;i<h.length;i++){while(stack.length&&h[stack[stack.length-1]]>=h[i]){const j=stack.pop(),left=stack.length?stack[stack.length-1]:-1,width=i-left-1,area=h[j]*width;bestArea=Math.max(bestArea,area);sf.push(frame(`i=${i}: pop ${j}`,`높이 ${h[j]}의 오른쪽 경계가 정해짐; pop 뒤 경계 ${left}, 너비 ${width}, 넓이 ${area}.`,1,{i,popped:j,leftBoundary:left,width,area,best:bestArea,stack:[...stack]},[rowState('높이',h,[i],[j]),rowState('stack',[...stack]),rowState('넓이',[area,bestArea])],{bars:{values:h,active:[j,i]}}));}
    stack.push(i);sf.push(frame(`i=${i}: push`,`현재 인덱스 ${i}를 증가 스택에 넣습니다.`,1,{i,stack:[...stack],best:bestArea},[rowState('높이',h,[i]),rowState('stack',[...stack])],{bars:{values:h,active:[i]}}));}
  replace('lec03-fence-stack',sf,`최대 넓이 ${bestArea}`,[{actual:bestArea,expected:3},{actual:sf.filter(x=>x.title.includes('pop')).length,expected:3},{actual:sf.filter(x=>x.title.includes('push')).length,expected:4}]);

  // 조합 DFS의 공유 상태 변경과 복귀를 전부 기록한다.
  const chosen=[], combinations=[], combFrames=[frame('초기 상태','chosen=[]에서 start=0으로 시작합니다.',0,{chosen:[],start:0},[rowState('chosen',[])])];
  function choose(startIndex){if(chosen.length===2){combinations.push(chosen.slice());combFrames.push(frame('조합 반환',`완성한 ${JSON.stringify(chosen)}를 복사해 저장합니다.`,3,{chosen:chosen.slice(),count:combinations.length},[rowState('chosen',chosen,null,[0,1]),rowState('조합',combinations.map(a=>a.join('')))]));return;}for(let i=startIndex;i<3;i++){chosen.push(i);combFrames.push(frame(`append ${i}`,`선택 ${i}를 추가하고 다음 탐색 시작점을 ${i+1}로 옮깁니다.`,0,{chosen:chosen.slice(),start:i+1},[rowState('chosen',chosen,[chosen.length-1])]));choose(i+1);const value=chosen.pop();combFrames.push(frame(`pop ${value}`,`하위 호출 뒤 ${value}를 제거해 부모의 선택 ${JSON.stringify(chosen)}를 복구합니다.`,2,{chosen:chosen.slice(),removed:value},[rowState('chosen',chosen),rowState('조합',combinations.map(a=>a.join('')))]));}}
  choose(0);replace('lec02-combinations-shared',combFrames,'[[0,1],[0,2],[1,2]]',[{actual:combinations.map(a=>a.join('')),expected:['01','02','12']},{actual:chosen.length,expected:0}]);

  const used=[false,false,false], path=[], permutationResults=[], permutationFrames=[frame('초기 상태','세 원소가 모두 미사용이고 부분 순열은 비어 있습니다.',0,{path:'[]',used:'[false,false,false]'},[rowState('원소',[0,1,2]),rowState('선택',[])])];
  function permute(){if(path.length===2){permutationResults.push(path.slice());permutationFrames.push(frame('길이 2 도달',`현재 순서 ${path.join('')}를 결과에 저장합니다.`,2,{path:path.join(''),count:permutationResults.length},[rowState('선택',path),rowState('결과',permutationResults.map(a=>a.join('')))]));return;}for(let i=0;i<3;i++)if(!used[i]){used[i]=true;path.push(i);permutationFrames.push(frame(`선택 ${i}`,`아직 쓰지 않은 ${i}를 다음 자리에 놓습니다.`,0,{path:path.join(''),used:JSON.stringify(used)},[rowState('원소',[0,1,2],[i]),rowState('선택',path)]));permute();path.pop();used[i]=false;permutationFrames.push(frame(`복구 ${i}`,`하위 탐색 후 ${i}를 제거해 다른 순서를 탐색합니다.`,3,{path:path.join(''),used:JSON.stringify(used)},[rowState('원소',[0,1,2]),rowState('선택',path)]));}}
  permute();replace('lec02-permutation',permutationFrames,`${permutationResults.length}개 순열`,[{actual:permutationResults.map(a=>a.join('')).sort(),expected:['01','02','10','12','20','21']},{actual:path.length,expected:0}]);

  const matA=[1,2],matB=[3,4],matC=[0],matFrames=[frame('초기 행렬','C[0][0]을 0으로 두고 visit(0,0,0)부터 시작합니다.',0,{i:0,j:0,k:0,C00:0},[rowState('A 행',matA),rowState('B 열',matB),rowState('C',matC)])];
  function visit(i,j,k){matFrames.push(frame(`visit(${i},${j},${k})`,`현재 위치에서 종료 조건 또는 곱셈 항을 처리합니다.`,0,{i,j,k,C00:matC[0]},[rowState('A 행',matA,k<2?[k]:[]),rowState('B 열',matB,k<2?[k]:[]),rowState('C',matC)]));if(i===1)return;if(j===1){visit(i+1,0,0);return;}if(k===2){visit(i,j+1,0);return;}const product=matA[k]*matB[k];matC[0]+=product;matFrames.push(frame(`곱셈 k=${k}`,`${matA[k]}×${matB[k]}=${product}를 C[0][0]에 더해 ${matC[0]}이 됩니다.`,1,{i,j,k,product,C00:matC[0]},[rowState('A 행',matA,[k]),rowState('B 열',matB,[k]),rowState('누적 C',matC)]));visit(i,j,k+1);}
  visit(0,0,0);replace('lec02-matrix-recursion',matFrames,`C=[[${matC[0]}]]`,[{actual:matC[0],expected:11},{actual:matFrames.filter(f=>f.title.startsWith('곱셈')).length,expected:2}]);

  // 반복형 Hanoi에서 매 pop/push/이동 뒤 스택과 이동 목록을 복사한다.
  const hStack=[[2,'A','B','C']], moves=[], hFrames=[frame('초기 스택','(n,출발,보조,도착) 호출 상태 하나로 반복을 시작합니다.',0,{stack:hStack.map(x=>x.slice()),moves:[]},[rowState('스택',['2,A,B,C'])])];
  while(hStack.length){const [n,src,spare,dst]=hStack.pop();if(n===0)continue;if(n===1){moves.push(`${src}→${dst}`);hFrames.push(frame('원판 이동',`기저 작업을 실행해 ${src}에서 ${dst}로 옮깁니다.`,2,{task:[n,src,spare,dst],stack:hStack.map(x=>x.slice()),moves:moves.slice()},[rowState('이동',moves),rowState('남은 작업',hStack.map(x=>x.join(',')))]));}else{hStack.push([n-1,spare,src,dst],[1,src,spare,dst],[n-1,src,dst,spare]);hFrames.push(frame('하위 작업 push','LIFO에서 재귀 순서가 되도록 세 일을 역순으로 넣습니다.',1,{task:[n,src,spare,dst],stack:hStack.map(x=>x.slice()),moves:moves.slice()},[rowState('다음 작업',hStack.slice().reverse().map(x=>x.join(','))),rowState('이동',moves)]));}}
  replace('lec02-hanoi-iterative',hFrames,moves.join(', '),[{actual:moves,expected:['A→B','A→C','B→C']},{actual:hStack.length,expected:0}]);

  // BOGGLE의 실제 호출 순서: 불일치 이웃 두 곳 뒤 대각선 이웃에서 성공한다.
  const bBoard=[['A','X'],['X','B']], bWord='AB', bDirs=[];for(const dy of [-1,0,1])for(const dx of [-1,0,1])if(dy||dx)bDirs.push([dy,dx]);
  const bFrames=[frame('입력 보드','첫 글자 A에서 has(0,0,0)을 호출합니다.',0,{word:bWord,state:'(0,0,0)'},null,{grid:{cells:bBoard.map(r=>r.slice()),active:[[0,0]]}})];
  function hasLetter(y,x,k){bFrames.push(frame(`호출 (${y},${x},${k})`,`word[${k}]와 현재 칸을 검사합니다.`,0,{y,x,k,cell:bBoard[y]?.[x]??'밖',target:bWord[k]},null,{grid:{cells:bBoard.map(r=>r.slice()),active:y>=0&&y<2&&x>=0&&x<2?[[y,x]]:[]}}));if(y<0||y>=2||x<0||x>=2||bBoard[y][x]!==bWord[k]){bFrames.push(frame('False 반환','범위 밖이거나 현재 글자가 다릅니다.',1,{y,x,k,result:false},[rowState('상태',[y,x,k])]));return false;}if(k===bWord.length-1){bFrames.push(frame('True 반환','현재 글자가 단어의 마지막 글자입니다.',2,{y,x,k,result:true},null,{grid:{cells:bBoard.map(r=>r.slice()),done:[[0,0]],active:[[y,x]]}}));return true;}for(const[dy,dx]of bDirs)if(hasLetter(y+dy,x+dx,k+1))return true;return false;}
  const bFound=hasLetter(0,0,0);replace('lec02-boggle',bFrames,'AB 존재',[{actual:bFound,expected:true}]);

  // 의존 제거 순서의 각 스위치 결정과 16개 시계 상태를 남긴다.
  const depSeq=[[8,4],[11,1],[13,9],[6,3],[10,2],[7,7],[4,8],[1,0],[3,6],[0,5]], depClocks=start.slice(), depFrames=[frame('초기 시계','스위치 4 두 번 적용 입력에서 의존 순서를 시작합니다.',0,{clocks:depClocks.slice(),total:0},clockRows(depClocks))];let depTotal=0;
  for(const[clock,sw]of depSeq){const before=depClocks[clock],count=(4-before)%4;for(const idx of link[sw])depClocks[idx]=(depClocks[idx]+count)%4;depTotal+=count;depFrames.push(frame(`시계 ${clock} → 스위치 ${sw}`,`현재값 ${before}를 0으로 만들 횟수 ${count}를 구해 연결 시계에 적용합니다.`,1,{clock,switch:sw,before,count,total:depTotal,clocks:depClocks.slice()},[...clockRows(depClocks,clock),rowState('결정 횟수',[count]),rowState('합계',[depTotal])]));}
  const depScene=scenes.find(s=>s.id==='lec02-clocksync-elimination');depScene.input='스위치 4를 두 번 적용한 16개 시계 상태';depScene.scope='본문 의존 순서 10단계 전체에서 횟수를 결정하고 마지막 상태 검사';replace('lec02-clocksync-elimination',depFrames,`결정 횟수 합 ${depTotal}; 전체 검사 ${depClocks.every(x=>x===0)}`,[{actual:depClocks.every(x=>x===0),expected:true},{actual:depTotal,expected:2}]);

  // 재귀 합은 진입·기저 반환·각 결합 반환을 모두 한 프레임씩 기록한다.
  const sumValues=[1,2,3,4], dFrames=[frame('시작','sum(0,3)을 호출합니다.',0,{range:'[0,3]'},[rowState('A',sumValues)])];
  function calcRange(lo,hi){dFrames.push(frame(`호출 [${lo},${hi}]`,`이 구간의 합을 구하는 재귀 호출에 들어갑니다.`,0,{lo,hi},[rowState('A',sumValues,Array.from({length:hi-lo+1},(_,k)=>lo+k))]));if(lo===hi){dFrames.push(frame(`반환 ${sumValues[lo]}`,'한 원소 기저 구간의 값을 반환합니다.',1,{lo,hi,value:sumValues[lo]},[rowState('A',sumValues,[lo])]));return sumValues[lo];}const mid=Math.floor((lo+hi)/2),left=calcRange(lo,mid),right=calcRange(mid+1,hi),value=left+right;dFrames.push(frame(`결합 [${lo},${hi}]`,`왼쪽 ${left}+오른쪽 ${right}=${value}를 반환합니다.`,2,{lo,hi,left,right,value},[rowState('부분합',[left,right]),rowState('A',sumValues,Array.from({length:hi-lo+1},(_,k)=>lo+k))]));return value;}
  const sumAnswer=calcRange(0,3);replace('lec03-divide-sum',dFrames,`합 ${sumAnswer}`,[{actual:sumAnswer,expected:10}]);

  const fastCalls=[],fastFrames=[];let fastCallCount=0;
  function fastSum(n){fastCallCount++;fastCalls.push(n);fastFrames.push(frame(`호출 fast_sum(${n})`,`호출 인자 n=${n}을 확인하고 기저·홀수·짝수 분기를 선택합니다.`,0,{n,stack:JSON.stringify(fastCalls)},[rowState('호출 스택',fastCalls)]));let value;if(n===1){value=1;fastFrames.push(frame('기저 반환','n=1이므로 1을 반환합니다.',0,{n,value},[rowState('호출 스택',fastCalls),rowState('반환',[value])]));}else if(n%2){const child=fastSum(n-1);value=child+n;fastFrames.push(frame(`홀수 반환 ${n}`,`fast_sum(${n-1})=${child}를 한 번 계산해 ${child}+${n}=${value}로 반환합니다.`,1,{n,child,value},[rowState('하위 결과',[child]),rowState('반환',[value])]));}else{const child=fastSum(n/2);value=2*child+(n/2)*(n/2);fastFrames.push(frame(`짝수 결합 ${n}`,`fast_sum(${n/2})=${child} 한 번을 재사용해 2×${child}+${n/2}²=${value}입니다.`,2,{n,child,value,callsToChild:1},[rowState('하위 결과',[child]),rowState('결합 항',[2*child,(n/2)*(n/2)]),rowState('반환',[value])]));}fastCalls.pop();return value;}
  const fastAnswer=fastSum(11),fastScene=scenes.find(s=>s.id==='lec03-divide-sum');fastScene.input='n=11';fastScene.scope='본문 fast_sum 전체 호출·반환: 홀수 감소와 짝수 절반 재귀';replace('lec03-divide-sum',fastFrames,`fast_sum(11)=${fastAnswer}`,[{actual:fastAnswer,expected:66},{actual:fastCallCount,expected:6}]);

  const maxDivideFrames=[];let maxDivideCalls=0;
  function solveMax(lo,hi){maxDivideCalls++;maxDivideFrames.push(frame(`호출 [${lo},${hi}]`,`이 구간의 연속 부분배열 최댓값을 계산합니다.`,0,{lo,hi},[rowState('A',A,Array.from({length:hi-lo+1},(_,k)=>lo+k))]));if(lo===hi){const v=Math.max(0,A[lo]);maxDivideFrames.push(frame(`기저 ${lo}`,`빈 구간 허용으로 max(0,${A[lo]})=${v}를 반환합니다.`,1,{lo,hi,value:v},[rowState('A',A,[lo]),rowState('반환',[v])]));return v;}const mid=Math.floor((lo+hi)/2);maxDivideFrames.push(frame(`분할 mid=${mid}`,`왼쪽 [${lo},${mid}]과 오른쪽 [${mid+1},${hi}]를 각각 재귀 호출합니다.`,2,{lo,mid,hi},[rowState('A',A,Array.from({length:hi-lo+1},(_,k)=>lo+k))]));const left=solveMax(lo,mid),right=solveMax(mid+1,hi);let total=0,leftSuffix=-Infinity;for(let i=mid;i>=lo;i--){total+=A[i];leftSuffix=Math.max(leftSuffix,total);maxDivideFrames.push(frame(`왼쪽 suffix ${i}..${mid}`,`경계에 붙여 A[${i}..${mid}] 합 ${total}을 계산하고 suffix 최선 ${leftSuffix}를 갱신합니다.`,3,{i,mid,total,leftSuffix},[rowState('A',A,Array.from({length:mid-i+1},(_,k)=>i+k)),rowState('suffix',[leftSuffix])]));}total=0;let rightPrefix=-Infinity;for(let i=mid+1;i<=hi;i++){total+=A[i];rightPrefix=Math.max(rightPrefix,total);maxDivideFrames.push(frame(`오른쪽 prefix ${mid+1}..${i}`,`경계에서 시작해 A[${mid+1}..${i}] 합 ${total}을 계산하고 prefix 최선 ${rightPrefix}를 갱신합니다.`,3,{i,mid,total,rightPrefix},[rowState('A',A,Array.from({length:i-mid},(_,k)=>mid+1+k)),rowState('prefix',[rightPrefix])]));}const crossing=leftSuffix+rightPrefix,value=Math.max(left,right,crossing);maxDivideFrames.push(frame(`결합 [${lo},${hi}]`,`왼쪽 ${left}, 오른쪽 ${right}, 경계 ${leftSuffix}+${rightPrefix}=${crossing} 중 ${value}를 반환합니다.`,3,{lo,hi,left,right,leftSuffix,rightPrefix,crossing,value},[rowState('후보',[left,right,crossing]),rowState('A',A,Array.from({length:hi-lo+1},(_,k)=>lo+k))]));return value;}
  const maxDivideAnswer=solveMax(0,A.length-1);replace('lec01-maxsum-divide',maxDivideFrames,`최대 합 ${maxDivideAnswer}`,[{actual:maxDivideAnswer,expected:6},{actual:maxDivideCalls,expected:7}]);

  // 거듭제곱 호출이 내려가고 반환식이 올라오는 순서.
  const pFrames=[],powerStack=[];let powerCallCount=0;
  function powerOf(x,n){powerCallCount++;powerStack.push(n);pFrames.push(frame(`호출 power(2,${n})`,`현재 지수 ${n}에서 기저 또는 절반 재귀를 선택합니다.`,n===0?0:1,{n,stack:JSON.stringify(powerStack)},[rowState('호출 스택',powerStack)]));if(n===0){pFrames.push(frame('기저 반환','지수 0이면 항등값 1을 반환합니다.',0,{n,value:1},[rowState('반환',[1])]));powerStack.pop();return 1;}const half=powerOf(x,Math.floor(n/2)),value=n%2?x*half*half:half*half;pFrames.push(frame(`power(2,${n}) 반환`,`half=${half}; ${n%2?'홀수이므로 2를 곱해 ':''}${value}를 반환합니다.`,n%2?3:2,{n,half,value},[rowState('지수',[n,Math.floor(n/2)]),rowState('반환',[half,value])]));powerStack.pop();return value;}
  const powerAnswer=powerOf(2,5);replace('lec03-power',pFrames,`2^5=${powerAnswer}`,[{actual:powerAnswer,expected:32},{actual:powerCallCount,expected:4}]);

  // FENCE 분할정복 입력을 작게 고정하고 재귀/확장/반환을 각각 표시한다.
  const fdHeights=[2,1,3,2], fdFrames=[];let fdBest=0;
  function solveFence(lo,hi){if(lo===hi){const area=fdHeights[lo];fdBest=Math.max(fdBest,area);fdFrames.push(frame(`기저 [${lo}]`,`한 판자 넓이 ${area}를 반환합니다.`,0,{lo,hi,area},[rowState('높이',fdHeights,[lo])],{bars:{values:fdHeights,active:[lo]}}));return area;}const mid=Math.floor((lo+hi)/2),left=solveFence(lo,mid),right=solveFence(mid+1,hi);let best=Math.max(left,right),l=mid,r=mid+1,minH=Math.min(fdHeights[l],fdHeights[r]);best=Math.max(best,minH*2);fdFrames.push(frame(`중앙 ${l}..${r}`,`경계 두 판자의 최소 높이 ${minH}×너비 2와 양쪽 답 ${left},${right}를 비교합니다.`,3,{lo,hi,l,r,minH,left,right,best},[rowState('높이',fdHeights,[l,r])],{bars:{values:fdHeights,active:[l,r],range:[l,r]}}));while(lo<l||r<hi){if(r<hi&&(l===lo||fdHeights[l-1]<fdHeights[r+1])){r++;minH=Math.min(minH,fdHeights[r]);}else{l--;minH=Math.min(minH,fdHeights[l]);}const area=minH*(r-l+1);best=Math.max(best,area);fdFrames.push(frame(`확장 ${l}..${r}`,`확장한 구간의 최소 높이 ${minH}×너비 ${r-l+1}=${area}를 최선과 비교합니다.`,3,{lo,hi,l,r,minH,area,best},[rowState('높이',fdHeights,Array.from({length:r-l+1},(_,k)=>l+k))],{bars:{values:fdHeights,active:Array.from({length:r-l+1},(_,k)=>l+k),range:[l,r]}}));}fdBest=Math.max(fdBest,best);fdFrames.push(frame(`반환 [${lo},${hi}]`,`왼쪽 ${left}, 오른쪽 ${right}, 중앙 걸침 중 ${best}를 부모에 반환합니다.`,3,{lo,hi,left,right,best},[rowState('후보',[left,right,best]) ]));return Math.max(left,right,best);}
  const fdAnswer=solveFence(0,fdHeights.length-1);fdFrames.unshift(frame('입력 막대','각 재귀 호출에서 왼쪽·오른쪽·경계 걸침 답을 비교합니다.',0,{heights:fdHeights.slice()},[rowState('높이',fdHeights)],{bars:{values:fdHeights,active:[]}}));const fdScene=scenes.find(s=>s.id==='lec03-fence-divide');fdScene.input='[2,1,3,2]';fdScene.scope='고정 네 판자의 전체 분할정복 재귀·중앙 확장·반환';replace('lec03-fence-divide',fdFrames,`최대 넓이 ${fdAnswer}`,[{actual:fdAnswer,expected:4}]);

  // 입력 메타데이터도 생성기에 사용한 작은 고정 예제와 일치시킨다.
  for(const id of ['lec01-festival-cubic','lec01-festival-incremental','lec01-festival-prefix']){const s=scenes.find(x=>x.id===id);s.input='[3,1,2], L=2';s.scope='고정 세 원소 입력에서 유효 구간 전체를 조사';}
  const boardScene=scenes.find(s=>s.id==='lec02-boardcover-delta');boardScene.input='2×2 보드 [[.,.],[.,#]]';boardScene.scope='고정 보드에서 첫 빈칸 기준 네 모양의 시도·실패·복구';
  const precheckBoard=[['.','.'],['.','.']],precheckEmpty=precheckBoard.flat().filter(x=>x==='.').length;replace('lec02-boardcover-precheck',scenes.find(s=>s.id==='lec02-boardcover-precheck').frames,'빈칸 수 4는 3의 배수가 아니므로 답 0',[{actual:precheckEmpty%3,expected:1},{actual:precheckEmpty%3===0?1:0,expected:0}]);
  const copyComb=[];function buildCopyComb(prefix,start){if(prefix.length===2){copyComb.push(prefix);return;}for(let i=start;i<3;i++)buildCopyComb(prefix.concat(i),i+1);}buildCopyComb([],0);replace('lec02-combinations-copy',scenes.find(s=>s.id==='lec02-combinations-copy').frames,`복사형 조합 ${copyComb.length}개`,[{actual:copyComb.map(x=>x.join('')),expected:['01','02','12']}]);

  const fakeGroups=[[0,1,2],[3,4,5],[6,7]], fakeWeight=i=>i===2?0:1, fakeFrames=[frame('후보 8개','가짜는 정확히 하나이며 가벼운 것으로 알려져 있습니다.',0,{candidates:'0..7',fakeKnownLighter:true},[rowState('동전',[0,1,2,3,4,5,6,7])])];
  const leftW=fakeGroups[0].reduce((s,i)=>s+fakeWeight(i),0),rightW=fakeGroups[1].reduce((s,i)=>s+fakeWeight(i),0),firstCandidates=leftW<rightW?fakeGroups[0]:rightW<leftW?fakeGroups[1]:fakeGroups[2];
  fakeFrames.push(frame('3 대 3 저울질',`묶음 ${fakeGroups[0]} 무게 ${leftW}, 묶음 ${fakeGroups[1]} 무게 ${rightW}; 가벼운 쪽을 후보로 둡니다.`,1,{leftWeight:leftW,rightWeight:rightW,candidates:JSON.stringify(firstCandidates)},[rowState('왼쪽',fakeGroups[0]),rowState('오른쪽',fakeGroups[1]),rowState('남김',fakeGroups[2])]));
  const secondLeft=fakeWeight(firstCandidates[0]),secondRight=fakeWeight(firstCandidates[1]),fakeAnswer=secondLeft===secondRight?firstCandidates[2]:secondLeft<secondRight?firstCandidates[0]:firstCandidates[1];
  fakeFrames.push(frame('후보 3개 저울질',`후보 ${firstCandidates} 중 ${firstCandidates[0]}과 ${firstCandidates[1]}의 무게가 같아 남은 ${fakeAnswer}가 가짜입니다.`,3,{left:firstCandidates[0],right:firstCandidates[1],leftWeight:secondLeft,rightWeight:secondRight,answer:fakeAnswer},[rowState('후보',firstCandidates,null,[0,1,2]),rowState('저울',[secondLeft,secondRight])]));
  replace('lec03-fake-coin',fakeFrames,`가짜 동전 index ${fakeAnswer}, 저울질 2회`,[{actual:fakeAnswer,expected:2},{actual:fakeFrames.length-1,expected:2}]);

  const route = id => id.startsWith('lec00-') ? (id==='lec00-properties'?'lec00/properties':'lec00/coinflip')
    : id.startsWith('lec01-') ? (id.includes('festival')||id.includes('prefix-end')?'lec01/festival':id.includes('maxsum')?'lec01/maxsum':id.includes('complexity')?'lec01/complexity':id.includes('termination')?'lec01/correctness':id.includes('recursive')?'lec01/correctness':'lec01/correctness')
    : id.startsWith('lec02-') ? (id.includes('clocksync-elimination')?'lec02/clock-dependency':id.includes('clocksync')?'lec02/clocksync':id.includes('boardcover')||id.includes('tromino')?'lec02/boardcover':id.includes('boggle')?'lec02/boggle':'lec02/recursion')
    : (id.includes('quadtree-flip')?'lec03/quad-flip':id.includes('quadtree')?'lec03/quadtree':id.includes('fence-stack')?'lec03/fence-stack':id.includes('fence')?'lec03/fence-divide':id.includes('master')||id.includes('fake-coin')?'lec03/master':'lec03/divide');
  const grouped = {};
  for (const item of scenes) (grouped[route(item.id)] ||= []).push(item);
  Object.assign(window.ALGO_MOTION, grouped);
})();
