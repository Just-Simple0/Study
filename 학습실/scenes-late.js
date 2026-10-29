(function () {
  window.ALGO_MOTION = window.ALGO_MOTION || {};

  const row = (label, values, active = [], done = [], indices) => ({
    label,
    values: values.slice(),
    ...(active.length ? { active: active.slice() } : {}),
    ...(done.length ? { done: done.slice() } : {}),
    ...(indices ? { indices: indices.slice() } : {}),
  });
  const frame = (title, note, line, vars, visual) => ({
    title, note, line, vars: { ...vars },
    ...JSON.parse(JSON.stringify(visual)),
  });
  const scene = (id, title, scope, input, code, frames, result, checks = []) => ({
    id, title, scope, input, code: code.slice(), frames: frames.slice(), result,
    ...(checks.length ? { checks: checks.map((c) => ({ actual: c[0], expected: c[1] })) } : {}),
  });
  const rows = (...items) => ({ rows: items });
  const grid = (cells, active = [], done = []) => ({ grid: { cells, ...(active.length ? { active } : {}), ...(done.length ? { done } : {}) } });
  const bars = (values, active = [], range) => ({ bars: { values, active, ...(range ? { range } : {}) } });
  const graph = (nodes, edges) => ({ graph: { nodes, edges } });

  const chooseNaive = scene('lec04-choose-naive', '이항계수: 저장 없는 재귀', '고정 예제 C(4,2)의 호출 일부를 보인다. 전체 재귀 트리 중 중복 상태가 나타나는 가지를 선택해 표시한다.', 'C(4,2), 기저 C(n,0)=C(n,n)=1',
    ['choose(n,k): 기저면 1 반환', '왼쪽 C(n-1,k-1)을 재귀 호출', '오른쪽 C(n-1,k)을 재귀 호출', '두 결과를 더해 반환'], [
      frame('첫 분기', 'C(4,2)는 C(3,1)과 C(3,2)로 나뉜다. 이 프레임은 중복을 보이기 위한 선택 trace다.', 1, { call: 'C(4,2)', left: 'C(3,1)', right: 'C(3,2)' }, rows(row('호출', ['C(4,2)', 'C(3,1)', 'C(3,2)'], [0]))),
      frame('같은 상태 재등장', '왼쪽 가지와 오른쪽 가지가 모두 C(2,1)을 계산한다. 저장하지 않으므로 두 번째에도 다시 호출한다.', 2, { repeated: 'C(2,1)', saved: false }, rows(row('호출 위치', ['C(3,1)', 'C(3,2)'], [0, 1]), row('C(2,1) 계산 횟수', [1, 2], [1]))),
      frame('값 반환', 'C(4,2)=C(3,1)+C(3,2)=3+3=6이다. 각 가지의 재계산까지 포함하면 호출 수가 늘어난다.', 3, { value: 6, calls: 11 }, rows(row('상태', ['C(4,2)', 'C(3,1)', 'C(3,2)'], [0]), row('값', [6, 3, 3], [0]))),
    ], 'C(4,2)=6. 중복 상태 C(2,1)은 이 선택 trace에서 양쪽 가지에 다시 등장한다.', [[6, 6], ['C(2,1)', 'C(2,1)']]);

  const chooseMemo = scene('lec04-choose-memo', '이항계수: 메모이제이션', 'C(4,2)의 도달 상태를 재귀로 계산하고 첫 계산 뒤 저장한다. 캐시 초기화 비용은 표시 범위 밖이다.', '캐시가 비어 있는 C(4,2)',
    ['기저 상태면 1 반환', 'cache에 있으면 저장값 반환', '두 하위 상태를 재귀 계산', '합을 cache[n,k]에 저장'], [
      frame('상태 방문', 'C(3,1)을 계산하며 C(2,1)을 처음 방문한다. 값을 구한 뒤 cache에 기록한다.', 2, { state: 'C(2,1)', cache: 'miss' }, rows(row('상태', ['C(2,1)', 'C(1,0)', 'C(1,1)'], [0]), row('반환값', ['미계산', 1, 1], [0]))),
      frame('재방문', '다른 가지에서 같은 C(2,1)에 도착하면 재귀를 더 펼치지 않고 저장된 2를 읽는다.', 1, { state: 'C(2,1)', cache: 'hit', value: 2 }, rows(row('cache key', ['(2,1)'], [0]), row('cache value', [2], [0]))),
      frame('최종 합', '필요 상태를 계산한 값으로 C(4,2)=6을 반환한다. 캐시에는 기저를 제외한 실제 도달 상태가 남는다.', 3, { result: 6, computed: 5 }, rows(row('n', [0, 1, 2, 3, 4]), row('C(n,1)', [1, 1, 2, 3, 4]), row('C(4,2)', [6], [0]))),
    ], 'C(4,2)=6이며 이미 계산한 상태는 재사용한다.', [[6, 6], [2, 2]]);

  const chooseTable = scene('lec04-choose-table', '이항계수: 아래에서 위로 채우기', 'n≤4, k≤2인 이항계수 표의 작은 삼각 부분만 계산한다.', 'C(n,k)=C(n−1,k−1)+C(n−1,k)',
    ['C(n,0)=C(n,n)=1', 'n=1부터 증가', '각 내부 칸을 위 행 두 칸의 합으로 계산'], [
      frame('기저 행', '양 끝 칸은 하나를 고르지 않거나 모두 고르는 한 가지 경우다.', 0, { n: 0 }, grid([[1]])),
      frame('중간 행', 'C(3,1)=C(2,0)+C(2,1)=1+2=3으로 의존 값이 이미 채워져 있다.', 2, { n: 3, k: 1, sum: '1+2' }, grid([[1], [1, 1], [1, 2, 1], [1, 3, 3, 1]], [], [[0, 0], [1, 0], [1, 1], [2, 0], [2, 1], [2, 2], [3, 0], [3, 1], [3, 2], [3, 3]])),
      frame('목표 칸', '마지막 두 의존 칸 C(3,1), C(3,2)를 더해 C(4,2)=6을 얻는다.', 2, { n: 4, k: 2, result: 6 }, grid([[1], [1, 1], [1, 2, 1], [1, 3, 3, 1], [1, 4, 6, 4, 1]], [[4, 2]], [[3, 1], [3, 2]])),
    ], 'C(4,2)=6.', [[6, 6]]);

  const choose2row = scene('lec04-choose-2row', '이항계수: 두 행만 보관', '같은 C(4,2) 표를 이전 행과 현재 행만 유지해 계산한다.', 'n=4, k=2',
    ['prev=[1]', '각 n에서 cur[0]=1', 'cur[j]=prev[j-1]+prev[j]', 'prev=cur'], [
      frame('이전 행', 'n=2의 결과 [1,2,1]에서 필요한 열 0..2를 보관한다.', 0, { n: 2, prev: [1, 2, 1] }, rows(row('prev', [1, 2, 1], [], [], ['k=0', 'k=1', 'k=2']))),
      frame('현재 행 계산', 'k=1은 이전 행의 두 값 1+2, k=2는 2+1을 더한다.', 2, { n: 3, cur: [1, 3, 3] }, rows(row('prev n=2', [1, 2, 1]), row('cur n=3', [1, 3, 3], [1, 2]))),
      frame('행 교체', '현재 행을 다음 반복의 이전 행으로 바꾼다. 보관 행 수는 항상 둘이다.', 3, { n: 4, prev: [1, 3, 3], cur: [1, 4, 6] }, rows(row('prev n=3', [1, 3, 3]), row('cur n=4', [1, 4, 6], [1, 2]))),
    ], 'C(4,2)=6. 보관 공간은 O(k)이며 두 행을 번갈아 쓴다.', [[6, 6], [2, 2]]);

  const choose1row = scene('lec04-choose-1row', '이항계수: 한 행 갱신 방향', 'C(4,2)를 1차원 배열에 갱신한다. 오른쪽에서 왼쪽 순서만 사용한다.', 'dp=[1,0,0], n=1..4',
    ['for n=1..4:', '  for j=min(n,k)..1:', '    dp[j]+=dp[j-1]'], [
      frame('초기 배열', 'dp[0]=1은 아무것도 고르지 않는 한 가지 경우다.', 0, { n: 0 }, rows(row('k', [0, 1, 2]), row('dp', [1, 0, 0]))),
      frame('오른쪽부터 갱신', 'n=3에서 j=2를 먼저 바꾼다. dp[1]은 이전 행의 값 2라 새 칸은 2다.', 2, { n: 3, j: 2, update: '1+2=3' }, rows(row('j', [0, 1, 2]), row('dp', [1, 3, 3], [2]))),
      frame('목표 결과', 'n=4에서도 오른쪽부터 갱신해 dp[2]=6을 얻는다. 왼쪽부터면 이번 행의 값을 다시 읽는다.', 2, { n: 4, result: 6 }, rows(row('j', [0, 1, 2]), row('dp', [1, 4, 6], [2]))),
    ], 'C(4,2)=6. 한 행 이항계수는 오른쪽부터 갱신한다.', [[6, 6], [[1, 4, 6], [1, 4, 6]]]);

  const tri = [[5], [1, 2], [7, 3, 4]];
  const triangle2d = scene('lec04-triangle-2d', 'TRIANGLEPATH: 2차원 표', '본문 학습 삼각형을 사용해 D[y][x]=현재 값+아래 두 최댓값을 계산한다.', 'T=[[5],[1,2],[7,3,4]]',
    ['마지막 행 D=T', 'y를 아래에서 위로', 'D[y][x]=T[y][x]+max(D[y+1][x],D[y+1][x+1])'], [
      frame('기저 행 복사', '마지막 행은 그 칸에서 끝까지 가는 합 자체다.', 0, { y: 2 }, grid([[null], [null, null], [7, 3, 4]], [], [[2, 0], [2, 1], [2, 2]])),
      frame('두 번째 행', '1+max(7,3)=8, 2+max(3,4)=6으로 계산한다.', 2, { y: 1, D: [8, 6] }, grid([[null], [8, 6], [7, 3, 4]], [[1, 0], [1, 1]], [[2, 0], [2, 1], [2, 2]])),
      frame('꼭대기', '5+max(8,6)=13. 미래 합이 더 큰 왼쪽 가지를 따라 경로 5→1→7을 얻는다.', 2, { y: 0, result: 13 }, grid([[13], [8, 6], [7, 3, 4]], [[0, 0]], [[1, 0], [2, 0]])),
    ], '최댓값 13, 한 최적 경로 5→1→7.', [[13, 13], [[13], [8, 6], [7, 3, 4]]]);
  const triangle1d = scene('lec04-triangle-1row', 'TRIANGLEPATH: 한 행 압축', '같은 작은 삼각형에서 한 배열을 왼쪽부터 갱신한다.', '초기 dp=[7,3,4]',
    ['dp=T[-1][:]', 'y를 아래에서 위로:', '  x를 왼쪽부터:', '    dp[x]=T[y][x]+max(dp[x],dp[x+1])'], [
      frame('마지막 행', '복사본 dp가 입력 삼각형을 바꾸지 않고 마지막 행을 보관한다.', 0, { dp: [7, 3, 4] }, rows(row('dp', [7, 3, 4]))),
      frame('행 1 갱신', 'x=0을 먼저 계산해 8을 쓴다. 다음 칸은 아직 이전 행 값 dp[2]=4를 읽는다.', 3, { y: 1, x: 0 }, rows(row('T[y]', [1, 2]), row('dp', [8, 3, 4], [0]))),
      frame('꼭대기 값', 'x=1을 6으로 갱신한 뒤 꼭대기 계산은 max(8,6)을 사용한다.', 3, { y: 0, result: 13 }, rows(row('dp', [13, 6, 4], [0]), row('경로 선택', ['왼쪽', '아래'], [0]))),
    ], '최댓값 13. 입력 삼각형은 보존되고 추가 DP 공간은 O(n).', [[13, 13], [[8, 6, 4], [13, 6, 4]]]);

  const tiling = scene('lec04-tiling-forms', 'TILING2: 재귀·메모·표·두 변수', '폭 5의 도미노 타일링을 네 구현 관점으로 비교한다. 재귀 호출 트리는 중복 가지를 보여 주는 발췌다.', 'F(0)=1,F(1)=1,F(n)=F(n−1)+F(n−2)',
    ['recursive(n): F(n-1)+F(n-2)', 'memo(n): cache[n] 재사용', 'table[i]=table[i-1]+table[i-2]', 'a,b=b,a+b'], [
      frame('순수 재귀의 겹침', 'F(5)는 F(4),F(3)으로 갈라지고 F(4) 아래에서도 F(3)을 계산한다.', 0, { call: 'F(5)', repeated: 'F(3)' }, rows(row('가지', ['F(5)', 'F(4)', 'F(3)', 'F(3)'], [2, 3]))),
      frame('메모 적중', '한 번 계산한 F(3)=3을 반대 가지에서 다시 만나면 캐시값을 읽는다.', 1, { state: 'F(3)', cache: 3 }, rows(row('n', [0, 1, 2, 3, 4, 5]), row('F(n)', [1, 1, 2, 3, 5, 8], [3]))),
      frame('표 계산', '작은 폭부터 채우면 매 칸의 두 의존 값이 이미 완성되어 있다.', 2, { table: [1, 1, 2, 3, 5, 8] }, rows(row('폭 n', [0, 1, 2, 3, 4, 5]), row('방법 수', [1, 1, 2, 3, 5, 8], [5]))),
      frame('두 변수', '마지막 두 답만으로 다음 답을 만들며 추가 공간을 상수 개 변수로 줄인다.', 3, { before: [5, 8], next: 13 }, rows(row('F(4),F(5)', [5, 8]), row('F(6)', [13], [0]))),
    ], '폭 5는 8가지. 재귀는 지수적으로 중복하고, memo/table은 O(n), 두 변수는 O(1) 추가 공간.', [[8, 8], [13, 13]]);

  const tilingMatrix = scene('lec04-tiling-matrix', 'TILING2: 행렬 거듭제곱', '본문의 Q^n[0][0]=TILING2(n) 정의로 n=5를 계산한다. 이진 거듭제곱의 곱셈은 작은 행렬로 표시한다.', 'Q=[[1,1],[1,0]], n=5',
    ['result=I, base=Q', 'n의 비트가 남는 동안:', '  홀수면 result*=base', '  base*=base; n//=2'], [
      frame('초기', '항등행렬은 곱해도 값을 바꾸지 않는 시작값이다.', 0, { exponent: 5 }, rows(row('Q', ['1 1', '1 0']), row('result', ['1 0', '0 1']))),
      frame('첫 비트', '5는 홀수이므로 result에 Q를 곱하고 지수를 절반으로 줄인다.', 2, { exponent: 5, result: 'Q' }, rows(row('result', ['1 1', '1 0'], [0, 1]))),
      frame('완성', 'Q^5=[[8,5],[5,3]]이므로 좌상단 원소가 폭 5의 방법 수 8이다.', 3, { exponent: 0, power: 5, tilings: 8 }, rows(row('Q^5', ['8 5', '5 3']), row('TILING2(5)', [8], [0]))),
    ], 'Q^5[0][0]=8. 행렬 거듭제곱은 O(log n)회의 고정 크기 행렬 곱을 쓴다.', [[8, 8], [[8, 5], [5, 3]]]);

  const tilingVariant = scene('lec04-tiling-square-variant', '2×2 타일 추가 변형', '본문의 2024 기출 연결 변형만 계산한다. 원래 도미노 타일링과 다른 점화식임을 표시한다.', '도미노 + 2×2 타일, G(0)=1,G(1)=1',
    ['G(0)=1; G(1)=1', 'G(n)=G(n-1)+2G(n-2)', 'n=2부터 증가'], [
      frame('폭 2 경우', '폭 2를 채우는 방법은 가로 도미노 두 장 또는 2×2 정사각 타일이어서 두 가지다.', 1, { n: 2, G2: 'G1+2G0' }, rows(row('경우 계수', ['G(1)', '2×G(0)'], [1]))),
      frame('값 계산', 'G(2)=1+2×1=3. 도미노-only의 F(2)=2와 다르다.', 1, { n: 2, G: 3 }, rows(row('n', [0, 1, 2, 3, 4]), row('G(n)', [1, 1, 3, 5, 11], [2]))),
      frame('폭 4', '같은 점화식으로 G(3)=5, G(4)=11이다. 추가 타일이 점화식 계수를 바꾼다.', 2, { n: 4, G: 11 }, rows(row('도미노만 F', [1, 1, 2, 3, 5]), row('변형 G', [1, 1, 3, 5, 11], [4]))),
    ], '확장 점화식에서 G(2)=3, G(4)=11. 이 장면은 기출 연결 변형이다.', [[3, 3], [11, 11]]);

  const polyMemo = scene('lec04-poly-memo', 'POLY: 첫 행 길이와 메모', '본문의 세로 단조 폴리오미노 점화식을 n=4까지 계산한다. 상태는 전체 칸 수와 첫 행 길이다.', 'P(n,first), P(0,0)=1',
    ['P(n,first)=Σ(first+second−1)*P(n-first,second)', 'memo[n,first]가 있으면 반환', '각 second 항을 곱해 누적'], [
      frame('기저', '칸이 0개 남으면 빈 아래 모양 하나다.', 0, { state: 'P(0,0)', value: 1 }, rows(row('상태', ['P(0,0)'], [0]))),
      frame('상태 의존', '첫 행 길이 2이면 아래 첫 행 길이에 따라 부착 위치 수가 달라져 두 번째 상태가 필요하다.', 0, { state: 'P(4,2)', second: 1, placements: 2 }, rows(row('second', [1, 2]), row('placements', [2, 3]), row('subproblem', ['P(2,1)', 'P(2,2)']))),
      frame('누적 결과', 'n≤4의 총 폴리오미노 수는 1,1,2,6이다. 각 P(n,first)를 더해 P(n)을 얻는다.', 2, { n: 4, total: 19 }, rows(row('n', [1, 2, 3, 4]), row('P(n)', [1, 2, 6, 19], [3]))),
    ], 'P(4)=19. 상태의 첫 행 길이를 버리면 전이 계수를 알 수 없다.', [[19, 19], ['P(n,first)', 'P(n,first)']]);
  const polyTable = scene('lec04-poly-table', 'POLY: 의존 순서 표 채우기', '같은 점화식을 아래쪽 칸 수가 먼저 계산되도록 태뷸레이션한다.', 'dp[n][first], n≤4',
    ['dp[0][0]=1', 'n=1..N:', '  first=1..n:', '    second별 곱을 합산'], [
      frame('기저 행', 'dp[0][0]=1은 아래쪽이 빈 모양 한 가지를 나타낸다.', 0, { n: 0 }, rows(row('dp[0]', [1]))),
      frame('중간 상태', 'dp[3][1]=dp[2][1]+dp[2][2]=2+2=4. 전체 n=3 답은 첫 행 길이별 합이다.', 3, { n: 3, first: 1, value: 4 }, rows(row('first', [1, 2, 3]), row('dp[3]', [4, 1, 1], [0]), row('합', [6], [0]))),
      frame('목표 답', 'n=4의 첫 행 길이별 상태를 합하면 19다.', 3, { n: 4, total: 19 }, rows(row('first', [1, 2, 3, 4]), row('dp[4]', [8, 4, 2, 1]), row('P(4)', [19], [0]))),
    ], 'n=4의 총 경우 수 P(4)=19.', [[19, 19], [[8, 4, 2, 1], [8, 4, 2, 1]]]);

  const catalanMemo = scene('lec04-catalan-memo', 'Catalan: 루트 분할 메모', '서로 다른 세 키의 BST 모양 수를 memo 재귀로 계산한다.', 'C0=1, Cn=ΣCi*C(n−1−i)',
    ['C(n): cache hit이면 반환', 'n=0이면 1', 'i=0..n-1 항을 곱해 더함', '결과를 cache에 저장'], [
      frame('빈 트리', '왼쪽 또는 오른쪽 부분 트리가 비면 그 모양은 하나다.', 1, { state: 'C(0)', value: 1 }, rows(row('C(0)', [1]))),
      frame('루트 1', '세 키 중 가장 작은 키가 루트면 왼쪽은 비고 오른쪽 C(2) 모양 두 개가 가능하다.', 2, { i: 0, term: 'C0*C2=2' }, rows(row('루트 rank i', [0, 1, 2]), row('항', [2, 1, 2], [0]))),
      frame('합산', '세 루트의 기여도 2+1+2를 합쳐 C3=5를 저장한다.', 3, { C3: 5 }, rows(row('i', [0, 1, 2]), row('기여', [2, 1, 2]), row('C3', [5], [0]))),
    ], '서로 다른 세 키의 BST 모양은 5개.', [[5, 5], [1, 1]]);
  const catalanTable = scene('lec04-catalan-table', 'Catalan: 작은 n부터 표 채우기', 'C0부터 C4까지 분할 크기별 곱의 합을 표에 기록한다.', 'C0=1',
    ['C[0]=1', 'n=1..4:', '  C[n]=Σ C[i]*C[n-1-i]'], [
      frame('기저', '빈 구조 한 가지가 모든 분할의 끝 항을 살린다.', 0, { C0: 1 }, rows(row('n', [0]), row('C[n]', [1]))),
      frame('C3', '가능한 왼쪽 크기 0,1,2의 기여도는 2,1,2다.', 2, { n: 3, terms: [2, 1, 2] }, rows(row('왼쪽 크기', [0, 1, 2]), row('곱', [2, 1, 2], [0, 1, 2]))),
      frame('C4', 'C4=5+2+2+5=14. 표에 앞서 계산한 C0..C3만 참조한다.', 2, { n: 4, C4: 14 }, rows(row('n', [0, 1, 2, 3, 4]), row('C[n]', [1, 1, 2, 5, 14], [4]))),
    ], 'Catalan 수열의 C3=5, C4=14.', [[14, 14], [1, 1]]);

  const triReconstruct = scene('lec05-triangle-reconstruct', '삼각형 경로 복원과 동률', '본문의 복원 규칙으로 최댓값과 한 경로를 찾는다. 동률이면 오른쪽 아래로 가는 규칙을 적용한다.', 'T=[[1],[1,1],[1,1,1]]',
    ['아래에서 dp와 path 계산', 'down>right면 path=-1', 'down<right면 path=+1', '동률이면 오른쪽 선택'], [
      frame('동률 감지', '꼭대기에서 아래 미래 합이 같으므로 path=0으로 표시한다.', 3, { down: 2, right: 2, path: 0 }, grid([[3], [2, 2], [1, 1, 1]], [[0, 0]], [[1, 0], [1, 1]])),
      frame('오른쪽 규칙', '복원 코드는 path>=0이면 x를 늘려 오른쪽 아래로 이동한다.', 3, { x: 0, nextX: 1 }, grid([[3], [2, 2], [1, 1, 1]], [[1, 1]], [[0, 0]])),
      frame('경로 완성', '동률에서 정한 규칙으로 한 최적 경로 1→1→1을 복원한다. 다른 최적 경로도 존재한다.', 3, { maximum: 3, route: [1, 1, 1], allPaths: false }, rows(row('경로 값', [1, 1, 1]), row('합', [3], [0]))),
    ], '최댓값 3, 오른쪽 tie-break로 복원한 경로 1→1→1. 모든 최적 경로를 열거하지 않는다.', [[3, 3], [[1, 1, 1], [1, 1, 1]]]);

  const packCompare = scene('lec05-packing-fractional', '0-1 배낭과 fractional 배낭', '본문의 탐욕 실패 예제를 사용한다. 비율 탐욕, 0-1 최적, 분할 가능 최적을 분리해 비교한다.', '무게/가치=(10,60),(20,100),(30,120), W=50',
    ['가치/무게 비율 내림차순', '0-1 탐욕은 가능한 물건을 통째로 선택', '0-1 DP는 넣기/빼기 최댓값', 'fractional은 남은 용량만큼 분할'], [
      frame('비율 정렬', '밀도는 6,5,4다. 0-1 탐욕은 첫 물건 뒤 남은 용량 40에 두 번째를 담는다.', 0, { ratio: [6, 5, 4], remaining: 40 }, rows(row('물건', ['A:10/60', 'B:20/100', 'C:30/120']), row('비율', [6, 5, 4], [0]))),
      frame('0-1 탐욕의 결과', 'A+B 무게 30, 가치 160. C는 남은 용량 20에 들어가지 않는다.', 1, { chosen: ['A', 'B'], weight: 30, value: 160 }, bars([60, 100, 120], [0, 1])),
      frame('0-1 최적', 'B+C를 택하면 무게 50, 가치 220으로 탐욕 160보다 크다.', 2, { chosen: ['B', 'C'], weight: 50, value: 220 }, bars([60, 100, 120], [1, 2])),
      frame('fractional 최적', '분할 허용이면 A와 B 뒤 C의 20/30을 담아 60+100+80=240이다.', 3, { chosen: ['A', 'B', '0.667C'], value: 240 }, bars([60, 100, 80], [0, 1, 2])),
    ], '0-1 최적 220, 비율 탐욕의 0-1 값 160, fractional 최적 240.', [[220, 220], [160, 160], [240, 240]]);

  const packMemo = scene('lec05-packing-memo-reconstruct', '배낭 메모와 선택 복원', '본문의 작은 배낭 예제에서 캐시 값 비교로 선택을 복원한다.', '물건 (2,3),(3,4),(4,5), 용량 5',
    ['pack(i,c)=max(drop,pick)', 'pick은 w[i]≤c일 때만 허용', '복원: pack(i,c)≠pack(i+1,c)이면 선택', '선택 뒤 i++, c-=w[i]'], [
      frame('첫 물건 비교', 'pack(0,5)=7, drop=pack(1,5)=5이므로 첫 물건을 선택한다.', 2, { state: [0, 5], pick: 7, drop: 5 }, rows(row('선택', ['안 넣음', '넣음'], [1]), row('가치', [5, 7], [1]))),
      frame('용량 갱신', '첫 물건을 넣어 용량은 3, 인덱스는 1이 된다. 같은 물건은 다시 고려하지 않는다.', 3, { i: 1, capacity: 3, chosen: [0] }, rows(row('남은 용량', [3]), row('다음 물건', [1]))),
      frame('둘째 선택', 'pack(1,3)=4와 pack(2,3)=0을 비교해 두 번째를 넣는다. 최종 선택 [0,1]의 가치가 7이다.', 2, { chosen: [0, 1], weight: 5, value: 7 }, rows(row('선택 인덱스', [0, 1]), row('무게', [2, 3]), row('가치', [3, 4]))),
    ], '메모 최적값 7, 복원 선택 물건 0과 1.', [[7, 7], [[0, 1], [0, 1]]]);

  const packTable = scene('lec05-packing-table', '배낭: 2차원 표', '본문의 같은 작은 예제로 앞 i개 물건 상태 D[i][c]를 채운다.', 'W=5, (w,p)=(2,3),(3,4),(4,5)',
    ['D[0][c]=0', 'i=1..n:', '  c=0..W:', '    max(이전행, 가치+이전행)'], [
      frame('기저', '물건이 없을 때는 어떤 용량에서도 가치가 0이다.', 0, { i: 0 }, grid([[0, 0, 0, 0, 0, 0]])),
      frame('둘째 물건', '용량 5에서는 둘째 물건을 넣어 4+D[1][2]=7이 된다.', 3, { i: 2, capacity: 5 }, grid([[0, 0, 0, 0, 0, 0], [0, 0, 3, 3, 3, 3], [0, 0, 3, 4, 4, 7]], [[2, 5]], [[1, 2]])),
      frame('표 완성', '마지막 물건 (4,5)을 고려해도 용량 5의 값은 7로 유지된다.', 3, { result: 7 }, grid([[0, 0, 0, 0, 0, 0], [0, 0, 3, 3, 3, 3], [0, 0, 3, 4, 4, 7], [0, 0, 3, 4, 5, 7]], [[3, 5]], [[2, 5]])),
    ], 'D[3][5]=7.', [[7, 7]]);
  const pack1row = scene('lec05-packing-1row', '배낭: 한 행은 뒤에서 갱신', '0-1 배낭 한 행 압축에서 물건 재사용을 막는 역순 갱신을 보인다.', '첫 물건 (w=2,v=3), W=5',
    ['dp=[0]*(W+1)', '각 물건에 대해 c=W..w:', '  dp[c]=max(dp[c],v+dp[c-w])'], [
      frame('첫 물건 전', '용량별 가치가 모두 0으로 시작한다.', 0, { dp: [0, 0, 0, 0, 0, 0] }, rows(row('용량', [0, 1, 2, 3, 4, 5]), row('dp', [0, 0, 0, 0, 0, 0]))),
      frame('큰 용량부터', 'c=5에서 이전 상태 dp[3]=0을 읽어 3을 기록한다. 이번 물건을 두 번 쓸 수 없다.', 2, { c: 5 }, rows(row('dp', [0, 0, 0, 3, 3, 3], [3, 4, 5]))),
      frame('완료', '한 물건으로 용량 2 이상에서 가치 3을 얻는다. 정방향 갱신이면 무제한 배낭 값이 된다.', 2, { dp: [0, 0, 3, 3, 3, 3] }, rows(row('용량', [0, 1, 2, 3, 4, 5]), row('dp', [0, 0, 3, 3, 3, 3], [2, 3, 4, 5]))),
    ], '한 행 결과 [0,0,3,3,3,3]. 역순으로 갱신한다.', [[[0, 0, 3, 3, 3, 3]], [[0, 0, 3, 3, 3, 3]]]);

  const lisBoth = scene('lec05-lis-directions', 'LIS: 시작 방향과 끝 방향', '본문과 과제의 서로 반대 방향 상태를 같은 수열에서 비교한다.', 'S=[1,3,2,4]',
    ['L[i]=i에서 시작: 오른쪽부터', 'E[i]=i에서 끝: 왼쪽부터', '둘 다 엄격 증가 조건 사용'], [
      frame('입력 순서', '원소의 순서를 바꾸지 않고 각 위치를 상태로 둔다.', 0, { S: [1, 3, 2, 4] }, rows(row('index', [0, 1, 2, 3]), row('S', [1, 3, 2, 4]))),
      frame('시작 상태', '오른쪽에서 왼쪽으로 계산한 L은 [3,2,2,1]이다.', 0, { L: [3, 2, 2, 1] }, bars([3, 2, 2, 1], [0])),
      frame('끝 상태', '왼쪽에서 오른쪽으로 계산한 과제 dp는 [1,2,2,3]이다. 두 방향의 최댓값은 모두 3.', 1, { E: [1, 2, 2, 3], answer: 3 }, rows(row('L: 시작', [3, 2, 2, 1]), row('E: 끝', [1, 2, 2, 3]), row('max', [3, 3]))),
    ], '시작 방향 L=[3,2,2,1], 끝 방향 E=[1,2,2,3], LIS 길이 3.', [[3, 3], [[3, 2, 2, 1], [3, 2, 2, 1]]]);

  const lisReconstruct = scene('lec05-lis-reconstruct', 'LIS: choices 따라 복원', '본문의 강의 수열에서 choices 인덱스를 따라 실제 LIS 하나를 복원한다.', 'S=[1,9,7,4,2,6,3,11,10]',
    ['L[i]=1로 시작', '오른쪽 후보 중 더 큰 원소 검사', '길이 최대면 choices[i]=j', '최대 시작 인덱스부터 포인터 추적'], [
      frame('길이와 포인터', 'L은 각 위치에서 시작하는 최대 길이, choices는 다음 원소의 인덱스다.', 2, { L: [4, 2, 2, 3, 3, 2, 2, 1, 1], choices: [3, 7, 7, 5, 5, 7, 7, -1, -1] }, rows(row('index', [0, 1, 2, 3, 4, 5, 6, 7, 8]), row('S', [1, 9, 7, 4, 2, 6, 3, 11, 10]), row('L', [4, 2, 2, 3, 3, 2, 2, 1, 1]))),
      frame('포인터 이동', '최대 길이 시작점 0에서 choices[0]=3, 이어 5, 7로 간다.', 3, { indices: [0, 3, 5, 7] }, rows(row('index 경로', [0, 3, 5, 7]), row('값 경로', [1, 4, 6, 11], [0, 1, 2, 3]))),
      frame('결과 확인', '복원된 값은 원래 인덱스 순서를 보존하며 엄격히 증가하고 길이는 4다.', 3, { length: 4, route: [1, 4, 6, 11] }, bars([1, 9, 7, 4, 2, 6, 3, 11, 10], [0, 3, 5, 7])),
    ], '한 LIS는 인덱스 0→3→5→7, 값 1→4→6→11.', [[4, 4], [[1, 4, 6, 11], [1, 4, 6, 11]]]);

  const tails = scene('lec05-lis-tails', 'LIS: tails는 실제 경로가 아님', '본문의 [5,6,7,1,2]를 왼쪽부터 처리해 최소 끝값 배열을 갱신한다.', '엄격 증가, bisect_left 위치 사용',
    ['각 x에서 처음으로 tails[k]≥x인 k 찾기', 'k가 끝이면 append', '그 외에는 tails[k]=x'], [
      frame('초기 삽입', '5,6,7은 각각 더 긴 증가 부분수열을 만들어 tails 뒤에 붙는다.', 1, { x: 7, tails: [5, 6, 7] }, rows(row('입력 처리', [5, 6, 7]), row('tails', [5, 6, 7]))),
      frame('작은 값 교체', '1은 길이 1인 수열의 끝값 5를 더 유리한 1로 바꾼다. 길이는 그대로 3이다.', 2, { x: 1, position: 0 }, rows(row('tails', [1, 6, 7], [0]))),
      frame('또 교체', '2는 두 번째 자리의 끝값을 바꿔 tails=[1,2,7]이 된다. 이 배열은 입력 순서의 경로가 아니다.', 2, { x: 2, length: 3, actualSubsequence: false }, rows(row('tails', [1, 2, 7]), row('원본 위치', [3, 4, 2], [0, 1, 2]))),
    ], 'LIS 길이는 tails 길이 3. tails=[1,2,7] 자체는 원본의 부분수열이 아니다.', [[3, 3], [[1, 2, 7], [1, 2, 7]]]);

  const klis = scene('lec05-klis-kth', 'KLIS: 개수로 분기 건너뛰기', '본문의 강의 예제에서 사전순 6번째 LIS를 찾는다. 후보는 값 오름차순, 개수는 최장 길이만 센다.', 'S=[5,1,6,4,3,2,8,7], k=6',
    ['L[i], C[i]를 뒤에서 계산', '최장 길이 다음 후보를 값순 정렬', 'skip=k-1', 'cnt≤skip이면 묶음 건너뜀'], [
      frame('전체 개수', '가상 시작점의 최장 길이는 4(가상 원소 포함), LIS 개수는 10이다.', 1, { lengthIncludingSentinel: 4, count: 10, k: 6 }, rows(row('S', [5, 1, 6, 4, 3, 2, 8, 7]), row('L', [3, 3, 2, 2, 2, 2, 1, 1]), row('C', [2, 8, 2, 2, 2, 2, 1, 1]))),
      frame('첫 묶음 선택', '가상 시작 뒤 값 1의 분기는 8개라 skip=5가 그 안에 들어간다.', 1, { skip: 5, candidate: 1, branchCount: 8 }, rows(row('후보 값', [1]), row('분기 개수', [8], [0]))),
      frame('두 분기 건너뜀', '값 2의 2개, 값 3의 2개를 건너 skip=1이 된다. 값 4의 묶음 안에서 목표를 찾는다.', 3, { skipped: [2, 3], skip: 1 }, rows(row('후보', [2, 3, 4]), row('개수', [2, 2, 2]), row('skip 진행', [5, 3, 1, 0]))),
      frame('수열 완성', '값 4를 택하면 마지막 후보 7의 한 가지를 건너 8을 고른다. 결과는 [1,4,8].', 2, { result: [1, 4, 8], k: 6 }, rows(row('선택', [1, 4, 8], [0, 1, 2]))),
    ], '사전순 6번째 LIS는 [1,4,8]. 전체 LIS 개수 10.', [[10, 10], [[1, 4, 8], [1, 4, 8]]]);

  const coinCounter = scene('lec06-greedy-coin-counterexample', '탐욕 반례: 동전 거스름돈', '본문의 동전 단위 1,3,4와 금액 6만 추적한다.', '동전 [1,3,4], amount=6',
    ['큰 동전부터 가능한 만큼 선택', '남은 금액에서 반복', 'DP는 각 금액의 최소 동전 수 비교'], [
      frame('탐욕 선택', '가장 큰 4를 고르면 남은 금액은 2다.', 0, { remaining: 2, chosen: [4] }, bars([1, 3, 4], [2])),
      frame('탐욕 종료', '남은 2는 1+1이므로 총 3개 동전이 필요하다.', 1, { chosen: [4, 1, 1], count: 3 }, rows(row('동전', [4, 1, 1]), row('개수', [1, 2, 3], [2]))),
      frame('최적 비교', '3+3은 두 개로 금액 6을 만든다. 가장 큰 현재 동전을 고르는 규칙은 최적을 보장하지 않는다.', 2, { optimal: [3, 3], count: 2 }, rows(row('방법', ['4+1+1', '3+3']), row('동전 수', [3, 2], [1]))),
    ], '탐욕 3개, 최적 2개. 탐욕 선택 속성을 별도로 증명해야 한다.', [[3, 3], [2, 2]]);

  const shortestCounter = scene('lec06-greedy-shortest-edge-counterexample', '탐욕 반례: 가장 짧은 첫 간선', '본문의 학습용 방향 그래프에서 첫 간선만 가장 짧게 고르는 전략이 실패하는 trace다.', 'S→A=1,A→T=100,S→B=2,B→T=2',
    ['현재 보이는 가장 짧은 간선을 선택', '목적지까지의 나머지 비용도 비교', '전체 경로 합으로 결과 확인'], [
      frame('가장 짧은 간선', 'S에서 나가는 간선은 S→A=1, S→B=2라 국소 선택은 A다.', 0, { selected: 'S→A', weight: 1 }, graph([{ id: 'S', label: 'S', x: 80, y: 150, done: true }, { id: 'A', label: 'A', x: 250, y: 75, active: true }, { id: 'B', label: 'B', x: 250, y: 225 }, { id: 'T', label: 'T', x: 500, y: 150 }], [{ from: 'S', to: 'A', label: '1', directed: true, active: true }, { from: 'A', to: 'T', label: '100', directed: true }, { from: 'S', to: 'B', label: '2', directed: true }, { from: 'B', to: 'T', label: '2', directed: true }])),
      frame('경로 비용', 'A를 거치면 1+100=101, B를 거치면 2+2=4다. 첫 간선 길이만으로 최단 경로를 결정할 수 없다.', 2, { viaA: 101, viaB: 4 }, rows(row('경로', ['S→A→T', 'S→B→T']), row('합', [101, 4], [1]))),
      frame('최단 결과', '전체 누적 비용을 비교해 S→B→T를 택해야 한다. 여기서는 일반 탐욕 규칙의 반례만 보이며 Dijkstra 구현 범위는 아니다.', 2, { best: 'S→B→T', distance: 4 }, graph([{ id: 'S', label: 'S', x: 80, y: 150, done: true }, { id: 'A', label: 'A', x: 250, y: 75 }, { id: 'B', label: 'B', x: 250, y: 225, active: true }, { id: 'T', label: 'T', x: 500, y: 150, done: true }], [{ from: 'S', to: 'A', label: '1', directed: true }, { from: 'A', to: 'T', label: '100', directed: true }, { from: 'S', to: 'B', label: '2', directed: true, active: true }, { from: 'B', to: 'T', label: '2', directed: true, active: true }])),
    ], '국소 간선 1을 고른 경로는 101, 최단 경로 비용은 4.', [[101, 101], [4, 4]]);

  const matchorder = scene('lec06-matchorder', 'MATCHORDER: 이길 최소 레이팅', '본문 예제에서 동률도 승리인 조건을 반영해 출전 선수를 소비한다.', '상대 [3,1,2], 우리 [2,2,3]',
    ['우리 레이팅 정렬', '각 상대에 대해 처음 rating≥상대 찾기', '없으면 가장 약한 선수 소비', '승수 누적'], [
      frame('정렬', '우리 선수 레이팅을 [2,2,3]으로 정렬한다.', 0, { left: [2, 2, 3], wins: 0 }, rows(row('우리', [2, 2, 3]))),
      frame('상대 3', '같은 레이팅도 승리라 3을 내어 이긴다. 강한 선수를 불필요하게 먼저 쓰지 않는다.', 1, { opponent: 3, chosen: 3, wins: 1 }, rows(row('남은 우리', [2, 2]), row('경기 결과', ['3 vs 3: 승'], [0]))),
      frame('남은 경기', '상대 1에는 2, 상대 2에는 남은 2를 내어 두 경기 모두 이긴다.', 2, { opponents: [1, 2], wins: 3 }, rows(row('상대', [1, 2]), row('선택', [2, 2]), row('승리', [true, true]))),
    ], '최대 승수 3. 동률 레이팅도 승리로 처리한다.', [[3, 3], [[3, 2, 2], [3, 2, 2]]]);

  const strjoin = scene('lec06-strjoin', 'STRJOIN: 최소 두 길이 합치기', '본문의 [1,2,3,4]를 매 단계 최소 두 개 선택으로 합친다.', '길이 [1,2,3,4]',
    ['최소 두 값을 꺼냄', 'joined=a+b; cost+=joined', 'joined를 후보에 다시 넣음'], [
      frame('첫 합병', '현재 최소 1과 2를 합쳐 3을 만든다. 합병 비용에 3을 더한다.', 0, { heap: [3, 3, 4], joined: 3, cost: 3 }, rows(row('후보 길이', [1, 2, 3, 4]), row('꺼냄', [1, 2], [0, 1]))),
      frame('두 번째 합병', '새로 만든 3도 후보에 다시 넣었으므로 3과 3을 합쳐 6, 누적 비용은 9다.', 2, { heap: [4, 6], joined: 6, cost: 9 }, rows(row('후보', [3, 3, 4]), row('누적 비용', [3, 9], [1]))),
      frame('마지막 합병', '4+6=10을 더해 전체 합병 비용 19를 얻는다. 최종 문자열 길이 10과 총 비용 19는 다르다.', 1, { joined: 10, cost: 19 }, rows(row('합병 비용', [3, 6, 10]), row('누적', [3, 9, 19], [2]))),
    ], '전체 합병 비용 19.', [[19, 19], [10, 10]]);

  const orderedDP = scene('lec06-strjoin-ordered-dp', '순서 고정 합병: 구간 DP 비교', '본문의 보충 설명인 이웃 구간만 합치는 변형이다. 자유롭게 두 최소 길이를 고르는 STRJOIN과 구분한다.', '순서 고정 길이 [1,2,3]',
    ['D[i][i]=0', 'D[i][j]=min_k(D[i][k]+D[k+1][j])+sum(i..j)', '모든 분할 k 검사'], [
      frame('기저 구간', '원소 하나인 구간은 합병할 필요가 없어 비용 0이다.', 0, { interval: '[0,0]' }, rows(row('구간', ['[1]', '[2]', '[3]']), row('비용', [0, 0, 0]))),
      frame('길이 2', '첫 두 길이를 합치는 비용은 1+2=3, 뒤 두 길이는 2+3=5다.', 1, { candidates: [3, 5] }, rows(row('구간', ['[1,2]', '[2,3]']), row('D', [3, 5]))),
      frame('전체 구간', '분할 위치에 따라 3+0+6=9 또는 0+5+6=11이어서 최소는 9다.', 1, { splitCosts: [9, 11], result: 9 }, rows(row('분할', ['1|23', '12|3']), row('총비용', [11, 9], [1]))),
    ], '순서 고정 변형의 최소 비용 9. 자유 합병 STRJOIN의 heap trace와 문제 제약이 다르다.', [[9, 9], [[3, 5], [3, 5]]]);

  const huffmanTree = scene('lec06-huffman-tree', 'Huffman: 최소 두 빈도를 결합', '강의의 6문자 빈도와 정해진 tie-free 순서로 실제 트리를 만든다. 표의 각 단계는 간선과 결합 노드를 함께 나타낸다.', 'a16,b5,c12,d17,e10,f25',
    ['최소 두 노드를 pop', '부모 빈도=두 빈도 합', '첫 노드 왼쪽(0), 둘째 오른쪽(1)', '부모를 후보에 push'], [
      frame('첫 결합', 'b:5와 e:10을 묶어 내부 노드 15를 만든다.', 0, { popped: ['b:5', 'e:10'], parent: '+15' }, graph([{ id: 'b', label: 'b5', x: 100, y: 90 }, { id: 'e', label: 'e10', x: 100, y: 210 }, { id: 'p', label: '+15', x: 400, y: 150, active: true }], [{ from: 'p', to: 'b', label: '0', active: true }, { from: 'p', to: 'e', label: '1', active: true }])),
      frame('중간 결합', 'c:12와 내부 노드 15를 결합해 27을 만들고 다시 후보에 넣는다.', 2, { popped: ['c:12', '+15'], parent: '+27' }, rows(row('후보 전', [12, 15, 16, 17, 25]), row('결합', [12, 15, 27], [2]))),
      frame('루트 완성', '전체 결합 순서는 15,27,33,52,85다. 내부 노드 합의 총합이 가중 경로 길이 212와 같다.', 3, { merges: [15, 27, 33, 52, 85], weightedBits: 212 }, graph([{ id: 'r', label: '+85', x: 300, y: 45, active: true }, { id: 'u', label: '+33', x: 170, y: 120 }, { id: 'v', label: '+52', x: 430, y: 120 }, { id: 'a', label: 'a16', x: 100, y: 215 }, { id: 'd', label: 'd17', x: 240, y: 215 }, { id: 'f', label: 'f25', x: 360, y: 215 }, { id: 'w', label: '+27', x: 500, y: 210 }, { id: 'c', label: 'c12', x: 450, y: 270 }, { id: 'z', label: '+15', x: 550, y: 270 }, { id: 'b', label: 'b5', x: 515, y: 285 }, { id: 'e', label: 'e10', x: 580, y: 285 }], [{ from: 'r', to: 'u', label: '0' }, { from: 'r', to: 'v', label: '1' }, { from: 'u', to: 'a', label: '0' }, { from: 'u', to: 'd', label: '1' }, { from: 'v', to: 'f', label: '0' }, { from: 'v', to: 'w', label: '1' }, { from: 'w', to: 'c', label: '0' }, { from: 'w', to: 'z', label: '1' }, { from: 'z', to: 'b', label: '0' }, { from: 'z', to: 'e', label: '1' }])),
    ], '강의 예제의 총 가중 비트 수 212. 좌우 배정 규칙을 고정한 한 트리.', [[212, 212], [[15, 27, 33, 52, 85], [15, 27, 33, 52, 85]]]);

  const huffmanEncode = scene('lec06-huffman-encode', 'Huffman: 코드 생성과 인코딩', '강의 트리의 고정된 코드표로 abcdef를 인코딩한다.', 'a=00,d=01,f=10,c=110,b=1110,e=1111',
    ['왼쪽 간선에 0, 오른쪽에 1', '문자 잎까지 경로를 기록', '입력 문자열의 코드를 이어 붙임'], [
      frame('코드 경로', 'a는 루트 왼쪽에서 다시 왼쪽으로 가므로 00이다.', 0, { char: 'a', code: '00' }, graph([{ id: 'r', label: '+85', x: 300, y: 55 }, { id: 'u', label: '+33', x: 180, y: 155, active: true }, { id: 'a', label: 'a16', x: 100, y: 255, done: true }], [{ from: 'r', to: 'u', label: '0', active: true }, { from: 'u', to: 'a', label: '0', active: true }])),
      frame('문자별 코드', '각 문자는 잎까지의 경로 한 개를 코드로 가진다.', 1, { codes: { a: '00', d: '01', f: '10', c: '110', b: '1110', e: '1111' } }, rows(row('문자', ['a', 'd', 'f', 'c', 'b', 'e']), row('코드', ['00', '01', '10', '110', '1110', '1111']))),
      frame('연결', 'abcdef를 구분선 기준으로 이어 붙이면 00111011001111110이다. 구분선은 실제 비트열에 포함되지 않는다.', 2, { bits: '00111011001111110' }, rows(row('문자', ['a', 'b', 'c', 'd', 'e', 'f']), row('코드', ['00', '1110', '110', '01', '1111', '10']))),
    ], 'abcdef → 00|1110|110|01|1111|10 → 00111011001111110.', [['00111011001111110', '00111011001111110']]);

  const huffmanDecode = scene('lec06-huffman-decode', 'Huffman: 잎에서 출력하고 루트 복귀', '본문의 비트열 001110을 고정 트리로 읽어 ab를 복원한다.', 'bits=001110',
    ['비트 0이면 왼쪽, 1이면 오른쪽', '잎에 도착하면 문자 출력', '문자 출력 뒤 루트로 복귀'], [
      frame('첫 문자 a', '첫 두 비트 00으로 a 잎에 도착해 출력한다. 다음 비트를 건너뛰지 않고 루트로 돌아간다.', 1, { consumed: '00', output: 'a', next: 'root' }, graph([{ id: 'r', label: '+85', x: 300, y: 45, active: true }, { id: 'u', label: '+33', x: 180, y: 150 }, { id: 'a', label: 'a16', x: 100, y: 260, done: true }], [{ from: 'r', to: 'u', label: '0' }, { from: 'u', to: 'a', label: '0', active: true }])),
      frame('두 번째 문자 b', '남은 1110을 따라 오른쪽 내부 노드에서 b 잎에 도착한다.', 0, { consumed: '001110', output: 'ab' }, graph([{ id: 'r', label: '+85', x: 300, y: 45 }, { id: 'v', label: '+52', x: 430, y: 140 }, { id: 'w', label: '+27', x: 500, y: 220 }, { id: 'z', label: '+15', x: 420, y: 270 }, { id: 'b', label: 'b5', x: 350, y: 280, done: true }], [{ from: 'r', to: 'v', label: '1' }, { from: 'v', to: 'w', label: '1' }, { from: 'w', to: 'z', label: '1' }, { from: 'z', to: 'b', label: '0', active: true }])),
      frame('완성', '모든 비트를 소비하고 내부 노드에 남지 않았으므로 디코딩 결과는 ab다.', 2, { bits: '001110', decoded: 'ab', complete: true }, rows(row('비트', ['00', '1110']), row('문자', ['a', 'b']), row('결과', ['ab'], [0]))),
    ], '001110은 ab로 디코딩된다.', [['ab', 'ab']]);

  const huffmanSerialize = scene('lec06-huffman-serialize', 'Huffman: 전위 직렬화로 트리 재구성', '내부는 +, 잎은 문자라는 규약과 두 자식 내부 노드 규칙을 이용해 재구성한다. 강의 트리의 한 국소 구조를 발췌한다.', '전위 토큰 + + a d + f + c + b e',
    ['토큰이 잎 문자면 잎 반환', '토큰 +이면 왼쪽을 재귀 구성', '다음 토큰으로 오른쪽 구성', '두 자식이 끝나면 + 노드 반환'], [
      frame('루트 토큰', '첫 토큰 +는 내부 노드이므로 다음 서브트리를 왼쪽부터 읽는다.', 1, { token: '+', cursor: 0 }, rows(row('전위 토큰', ['+', '+', 'a', 'd', '+', 'f', '+', 'c', '+', 'b', 'e'], [0]))),
      frame('왼쪽 서브트리', '다음 + 아래 a와 d 잎을 읽으면 왼쪽 내부 노드 +33이 완성된다.', 2, { cursor: 3, built: '+(a,d)' }, graph([{ id: 'u', label: '+33', x: 300, y: 65, active: true }, { id: 'a', label: 'a16', x: 190, y: 200 }, { id: 'd', label: 'd17', x: 410, y: 200 }], [{ from: 'u', to: 'a', label: '0' }, { from: 'u', to: 'd', label: '1' }])),
      frame('트리 완성', '내부 노드는 자식 두 개를 읽고 닫으므로 남은 토큰까지 처리하면 11개 노드의 동일한 구조를 재구성한다.', 3, { nodes: 11, leaves: 6, complete: true }, rows(row('전위 입력', ['+ + a d + f + c + b e']), row('내부/잎 수', [5, 6]), row('규칙', ['+는 자식 2개']))),
    ], '규약이 주어진 전위 토큰은 Huffman 트리 구조를 유일하게 재구성한다. 일반 이진트리의 전위순회만으로는 충분하지 않다.', [[11, 11], [6, 6]]);

  const mstEdges = [{ from: 'A', to: 'B', label: '2', active: true }, { from: 'A', to: 'C', label: '5' }, { from: 'B', to: 'C', label: '1' }, { from: 'B', to: 'D', label: '4' }, { from: 'C', to: 'D', label: '3' }];
  const mstNodes = [{ id: 'A', label: 'A', x: 100, y: 150 }, { id: 'B', label: 'B', x: 270, y: 70 }, { id: 'C', label: 'C', x: 270, y: 230 }, { id: 'D', label: 'D', x: 500, y: 150 }];
  const primArray = scene('lec06-prim-array', 'Prim 배열: 최소 경계 간선', '본문의 4정점 예제를 출발점 A에서 배열 minweight로 계산한다.', 'AB=2, AC=5, BC=1, BD=4, CD=3',
    ['minweight[A]=0', '가장 작은 미선택 정점 추가', '이웃의 간선 가중치로 minweight 갱신', 'V−1개 간선까지 반복'], [
      frame('A에서 시작', 'A를 트리에 넣고 경계 간선 AB=2, AC=5를 후보로 둔다.', 0, { added: ['A'], minweight: [0, 2, 5, '∞'], parent: ['-', 'A', 'A', '-'] }, rows(row('정점', ['A', 'B', 'C', 'D']), row('minweight', [0, 2, 5, '∞']), row('parent', ['-', 'A', 'A', '-']))),
      frame('B 추가', '후보 중 B의 간선 2를 고른다. B에서 C로 가는 간선 1이 기존 5보다 작아 갱신한다.', 2, { added: ['A', 'B'], candidate: 'BC=1' }, graph(mstNodes.map(n => ({ ...n, done: n.id === 'A' || n.id === 'B', active: n.id === 'C' })), mstEdges.map(e => ({ ...e, active: e.from === 'B' && e.to === 'C' })))),
      frame('MST 완성', 'C를 1, D를 3의 간선으로 붙여 총비용 2+1+3=6이다.', 3, { edges: ['AB:2', 'BC:1', 'CD:3'], total: 6 }, rows(row('선택 간선', ['AB:2', 'BC:1', 'CD:3']), row('비용 누적', [2, 3, 6], [2]))),
    ], 'Prim MST 비용 6, 간선 AB·BC·CD.', [[6, 6], [['AB', 'BC', 'CD'], ['AB', 'BC', 'CD']]]);

  const primHeap = scene('lec06-prim-heap', 'Prim 힙: 중복 후보 건너뛰기', '같은 그래프에서 힙 후보를 꺼내며 이미 추가한 정점 후보를 건너뛴다.', '시작 후보 (0,A), 이후 경계 간선 후보 push',
    ['q에 (weight,vertex,parent) push', '최소 후보 pop', 'added면 버림', '새 정점과 이웃 간선을 push'], [
      frame('첫 후보들', 'A를 pop한 뒤 AB:2와 AC:5 후보를 넣는다.', 3, { heap: ['B:2(A)', 'C:5(A)'] }, rows(row('힙 후보', ['B:2(A)', 'C:5(A)']))),
      frame('더 좋은 C 후보', 'B:2를 꺼내 B를 추가하고 BC:1, BD:4 후보를 넣는다. C:5 후보는 힙에 남아 있다.', 3, { added: ['A', 'B'], heap: ['C:1(B)', 'D:4(B)', 'C:5(A)'] }, rows(row('후보', ['C:1(B)', 'D:4(B)', 'C:5(A)']), row('선택 상태', ['A', 'B'], [], [0, 1]))),
      frame('오래된 후보 무시', 'C:1로 C를 이미 넣은 뒤 C:5가 pop되면 added 검사로 버린다. 총비용은 배열 Prim과 같은 6이다.', 2, { stale: 'C:5(A)', skipped: true, total: 6 }, rows(row('pop', ['C:5(A)']), row('added[C]', [true], [0]), row('누적 MST', [6]))),
    ], '힙 Prim도 비용 6. 정점의 오래된 중복 후보를 더하지 않는다.', [[6, 6], [true, true]]);

  const kruskal = scene('lec06-kruskal-compare', 'Kruskal: 간선순 선택 비교', '본문에서 다룬 원리까지만 보여 준다. Union-Find 구현은 범위 밖이며 사이클 판별은 현재 연결 요소 표로 표현한다.', 'AB2, AC5, BC1, BD4, CD3',
    ['간선을 가중치 오름차순 정렬', '서로 다른 연결 조각이면 선택', '사이클이면 건너뜀', 'V−1개 선택 시 종료'], [
      frame('간선 정렬', '가중치 순서는 BC:1, AB:2, CD:3, BD:4, AC:5다.', 0, { sorted: ['BC:1', 'AB:2', 'CD:3', 'BD:4', 'AC:5'] }, rows(row('간선', ['BC', 'AB', 'CD', 'BD', 'AC']), row('weight', [1, 2, 3, 4, 5]))),
      frame('세 간선 선택', 'BC, AB, CD는 각각 서로 다른 조각을 연결해 세 정점 수 4의 MST에 필요한 3개를 채운다.', 1, { selected: ['BC', 'AB', 'CD'], components: 1 }, graph(mstNodes.map(n => ({ ...n, done: true })), mstEdges.map(e => ({ ...e, active: ['BC', 'AB', 'CD'].includes(e.from + e.to) || ['BC', 'AB', 'CD'].includes(e.to + e.from) })))),
      frame('비교 요약', 'Prim은 현재 트리의 경계 정점을 확장하고 Kruskal은 전체 정렬 간선을 조각 사이에서 선택한다. 비용은 둘 다 6이다.', 3, { prim: 6, kruskal: 6, selectedEdges: 3 }, rows(row('방식', ['Prim', 'Kruskal']), row('선택 기준', ['현재 경계', '전체 간선순']), row('비용', [6, 6]))),
    ], 'Kruskal MST 비용 6. Union-Find 상세 구현은 여기서 확장하지 않는다.', [[6, 6], [3, 3]]);

  const lanAdded = scene('lec06-lan-visited-added', 'LAN: 별도 visited 배열', '본문 좌표 예제에서 AB 기존 연결을 비용 0으로 두고 Prim 방문 배열을 사용한다.', 'A=(0,0),B=(3,0),C=(3,4), 기존 AB',
    ['제곱 거리 행렬 생성', '기존 연결 비용을 양방향 0으로', '최소 미방문 후보 선택', '선택 간선마다 sqrt 비용 누적'], [
      frame('가중치 구성', 'AB의 물리 길이는 3이어도 이미 설치되어 추가 비용은 0이다. BC 길이는 4다.', 1, { W: [[0, 0, 25], [0, 0, 16], [25, 16, 0]] }, rows(row('거리 제곱', ['AB', 'AC', 'BC']), row('가중치', [0, 25, 16]))),
      frame('무료 간선 선택', 'A에서 B로 가중치 0인 후보를 선택한다. 0은 유효한 미방문 후보이므로 visited로 구분한다.', 2, { added: ['A', 'B'], cost: 0 }, graph([{ id: 'A', label: 'A', x: 80, y: 150, done: true }, { id: 'B', label: 'B', x: 300, y: 150, done: true, active: true }, { id: 'C', label: 'C', x: 520, y: 150 }], [{ from: 'A', to: 'B', label: '0', done: true }, { from: 'B', to: 'C', label: '4' }, { from: 'A', to: 'C', label: '5' }])),
      frame('길이 누적', 'B에서 C로 실제 길이 4를 추가한다. 최종 추가 설치 비용은 4다.', 3, { added: ['A', 'B', 'C'], total: 4 }, rows(row('선택 간선', ['AB 기존:0', 'BC 신규:4']), row('추가 비용', [0, 4], [1]))),
    ], '추가 케이블 길이 4. 비교는 제곱 거리, 합산은 각 선택 간선의 실제 길이를 쓴다.', [[4, 4], [0, 0]]);

  const lanSentinel = scene('lec06-lan-visited-sentinel', 'LAN: dist=-1 방문 표식', '과제 코드의 방문 상태 통합 구현을 같은 입력으로 추적한다. 무료 간선 0은 미방문 후보로 유지한다.', 'dist 초기 [0,0,25], 선택 후 dist[u]=-1',
    ['dist[0]에서 시작', 'dist[v]≥0인 최소 후보 선택', '선택 비용 sqrt(dist[u]) 누적', 'dist[u]=-1로 방문 표시'], [
      frame('초기 후보', 'A는 시작점, B는 기존 케이블 때문에 dist=0이다. 0보다 큰지 검사하면 B를 놓친다.', 1, { dist: [0, 0, 25] }, rows(row('정점', ['A', 'B', 'C']), row('dist', [0, 0, 25]))),
      frame('B 방문 표식', 'B를 고른 뒤 dist[B]=-1로 바꾸어 다음 후보 탐색에서 제외한다.', 3, { dist: [-1, -1, 16], added: ['A', 'B'] }, rows(row('dist', [-1, -1, 16]), row('상태', ['방문', '방문', '후보']))),
      frame('동일 비용', 'C에 붙는 최소 제곱 거리는 16이므로 sqrt(16)=4를 더한다. sentinel 구현도 별도 visited와 같은 결과다.', 2, { dist: [-1, -1, -1], total: 4 }, rows(row('제곱 거리', [0, 16]), row('실제 추가 길이', [0, 4], [1]))),
    ], 'dist=-1 방문 표식 구현의 추가 비용도 4.', [[4, 4], [-1, -1]]);

  const lec04 = [chooseNaive, chooseMemo, chooseTable, choose2row, choose1row, triangle2d, triangle1d, tiling, tilingMatrix, tilingVariant, polyMemo, polyTable, catalanMemo, catalanTable];
  const lec05dp = [triReconstruct, packCompare, packMemo, packTable, pack1row];
  const lec05lis = [lisBoth, lisReconstruct, tails, klis];
  const lec06greedy = [coinCounter, shortestCounter, matchorder, strjoin, orderedDP, huffmanTree, huffmanEncode, huffmanDecode, huffmanSerialize];
  const lec06mst = [primArray, primHeap, kruskal, lanAdded, lanSentinel];

  Object.assign(window.ALGO_MOTION, {
    'lec04/dp': lec04,
    'lec05/dp': lec05dp,
    'lec05/lis': lec05lis,
    'lec06/greedy': lec06greedy,
    'lec06/mst': lec06mst,
  });

  // Renderer acceptance requires algorithmic iterations, not chapter summaries.
  // These builders retain the complete small state and emit one snapshot per update.
  const traced = (id, title, scope, input, code, steps, result, actual, expected) => {
    const last = code.length - 1;
    const mapped = steps.map((step) => ({ ...step, line: Math.max(0, Math.min(last, step.line)) }));
    return scene(id, title, scope, input, code, mapped, result, [[actual, expected]]);
  };
  const chooseGrid = (table) => table.map((r) => Array.from({ length: 5 }, (_, c) => r[c] ?? ''));
  const chooseFull = () => {
    const table = Array.from({ length: 5 }, (_, n) => Array(n + 1).fill(0));
    const steps = [];
    for (let n = 0; n < 5; n++) {
      for (let k = 0; k <= n; k++) {
        table[n][k] = k === 0 || k === n ? 1 : table[n - 1][k - 1] + table[n - 1][k];
        steps.push(frame(`C(${n},${k}) 채움`, k === 0 || k === n ? '경계 상태이므로 한 가지다.' : `C(${n - 1},${k - 1})+C(${n - 1},${k})=${table[n - 1][k - 1]}+${table[n - 1][k]}=${table[n][k]}를 기록한다.`, k === 0 || k === n ? 0 : 1, { n, k, value: table[n][k] }, grid(chooseGrid(table), [[n, k]])));
      }
    }
    const independent = (n, k) => { let v = 1; for (let i = 1; i <= k; i++) v = v * (n - i + 1) / i; return v; };
    return traced('lec04-choose-table-full', '이항계수: 표를 한 칸씩 채우기', 'C(4,2)까지 모든 표 상태를 계산한다. 각 프레임은 실제 칸 하나를 갱신한다.', 'C(4,2), 경계 C(n,0)=C(n,n)=1', ['경계면 1', '그 외 위쪽 두 값의 합', '완성 표 반환'], steps, 'C(4,2)=6.', table[4][2], independent(4, 2));
  };
  const chooseRightToLeft = () => {
    const dp = [1, 0, 0]; const steps = [frame('초기', 'dp[0]=1에서 시작한다.', 0, { n: 0 }, rows(row('dp', dp)))];
    for (let n = 1; n <= 4; n++) for (let j = Math.min(n, 2); j >= 1; j--) {
      const before = dp.slice(); dp[j] += dp[j - 1];
      steps.push(frame(`n=${n}, j=${j}`, `오른쪽부터 갱신해 아직 이전 행 값인 dp[${j - 1}]=${before[j - 1]}을 읽고 ${before[j]}+${before[j - 1]}=${dp[j]}로 바꾼다.`, 2, { n, j, before, read: before[j - 1], after: dp.slice() }, rows(row('dp', dp, [j]))));
    }
    return traced('lec04-choose-1row-full', '이항계수: 한 행의 각 갱신', '1차원 이항계수 배열을 n=1..4의 모든 j에서 오른쪽부터 갱신한다.', 'k=2, dp=[1,0,0]', ['n=1..4', 'j=min(n,k)..1', 'dp[j]+=dp[j-1]'], steps, 'dp[2]=6.', dp[2], 4 * 3 / 2);
  };
  const triangleFull = () => {
    const T = [[5], [1, 2], [7, 3, 4]]; const D = T.map((r) => r.slice()); const steps = [];
    for (let y = T.length - 2; y >= 0; y--) for (let x = 0; x <= y; x++) {
      D[y][x] = T[y][x] + Math.max(D[y + 1][x], D[y + 1][x + 1]);
      steps.push(frame(`D[${y}][${x}] 갱신`, `입력 ${T[y][x]}에 아래 두 미래값 ${D[y + 1][x]}, ${D[y + 1][x + 1]} 중 큰 ${Math.max(D[y + 1][x], D[y + 1][x + 1])}을 더한다.`, 2, { y, x, D: D.map((r) => r.slice()) }, grid(D.map((r) => r.slice()), [[y, x]], D.flatMap((r, ri) => r.map((_, ci) => [ri, ci])).filter(([ri]) => ri > y))));
    }
    return traced('lec04-triangle-2d-full', 'TRIANGLEPATH: 표의 모든 칸 갱신', '본문의 3행 예제에서 아래 행부터 모든 비기저 칸을 한 칸씩 계산한다.', '[[5],[1,2],[7,3,4]]', ['마지막 행은 입력값', 'y를 아래에서 위로', 'D[y][x]=T[y][x]+max(아래 두 칸)'], steps, '최댓값 13.', D[0][0], 13);
  };
  const triangleCompressed = () => {
    const T = [[5], [1, 2], [7, 3, 4]]; const dp = T[2].slice(); const steps = [frame('기저 복사', '입력 삼각형의 마지막 행을 새 배열로 복사한다.', 0, { y: 2 }, rows(row('dp', dp)))];
    for (let y = 1; y >= 0; y--) for (let x = 0; x <= y; x++) {
      const old = dp.slice(); dp[x] = T[y][x] + Math.max(dp[x], dp[x + 1]);
      steps.push(frame(`y=${y}, x=${x}`, `왼쪽부터 처리한다. dp[${x}]는 현재 행에서 바뀌고 dp[${x + 1}]은 아직 아래 행 값이다.`, 3, { y, x, before: old, after: dp.slice() }, rows(row('dp', dp, [x]))));
    }
    return traced('lec04-triangle-1row-full', 'TRIANGLEPATH: 한 행의 각 칸 갱신', '같은 입력에서 압축 배열의 갱신 순서를 모든 칸마다 보인다.', '초기 dp=[7,3,4]', ['dp=T[-1][:]', 'y를 아래에서 위로', 'x를 왼쪽부터', 'dp[x]=T[y][x]+max(dp[x],dp[x+1])'], steps, '최댓값 13.', dp[0], 13);
  };

  const dynamic04 = [chooseFull(), chooseRightToLeft(), triangleFull(), triangleCompressed()];
  window.ALGO_MOTION['lec04/dp'] = dynamic04.concat(lec04.filter((s) => !['lec04-choose-table', 'lec04-choose-1row', 'lec04-triangle-2d', 'lec04-triangle-1row'].includes(s.id)));

  const tilingScene = (kind) => {
    const n = 5, steps = [];
    if (kind === 'recursive') {
      const calls = [];
      const fib = (x) => { calls.push(`F(${x})`); return x <= 1 ? 1 : fib(x - 1) + fib(x - 2); };
      const answer = fib(n);
      for (let i = 0; i < calls.length; i++) {
        const value=Number(calls[i].match(/\d+/)[0]);
        steps.push(frame(`호출 ${i + 1}/${calls.length}`, `${calls[i]}를 실제 호출한다. 저장하지 않는 재귀라 중복 호출도 다시 펼친다.`, value<=1?0:1, { call: calls[i], count: i + 1 }, rows(row('최근 호출', calls.slice(Math.max(0, i - 5), i + 1)))));
      }
      return traced('lec04-tiling-recursive-full', 'TILING2: 재귀 호출 trace', '폭 5의 재귀에서 실제 호출 15회를 모두 프레임으로 보인다.', 'F(0)=F(1)=1, n=5', ['n≤1이면 1', '그 외 F(n)=F(n−1)+F(n−2)'], steps, `F(5)=${answer}`, answer, 8);
    }
    if (kind === 'memo') {
      const cache = new Map([[0, 1], [1, 1]]);
      const solve = (x) => {
        if (cache.has(x)) {
          steps.push(frame(`F(${x}) hit`, `cache의 F(${x})=${cache.get(x)}를 읽어 재계산을 생략한다.`, 0, { n: x, hit: true }, rows(row('cache n', [...cache.keys()].sort((a,b)=>a-b)), row('cache 값', [...cache.keys()].sort((a,b)=>a-b).map(k=>cache.get(k))))));
          return cache.get(x);
        }
        const a = solve(x - 1), b = solve(x - 2); cache.set(x, a + b);
        steps.push(frame(`F(${x}) 저장`, `${a}+${b}=${a+b}를 계산해 cache[${x}]에 기록한다.`, 2, { n: x, value: a + b }, rows(row('cache n', [...cache.keys()].sort((a,b)=>a-b)), row('cache 값', [...cache.keys()].sort((a,b)=>a-b).map(k=>cache.get(k))))));
        return cache.get(x);
      };
      const answer = solve(n);
      return traced('lec04-tiling-memo-full', 'TILING2: 메모 miss와 hit', '폭 5 메모 재귀에서 상태 저장과 재사용 이벤트를 실제 호출 순서로 보인다.', 'cache={F(0):1,F(1):1}', ['cache hit이면 반환', 'F(n)=F(n−1)+F(n−2)', '새 결과 저장'], steps, `F(5)=${answer}`, answer, 8);
    }
    if (kind === 'table') {
      const T = [1, 1];
      for (let i = 2; i <= n; i++) {
        T[i] = T[i - 1] + T[i - 2];
        steps.push(frame(`T[${i}]`, `이미 계산한 ${T[i-1]}+${T[i-2]}=${T[i]}를 한 칸에 기록한다.`, 2, { i }, rows(row('폭', Array.from({length:T.length},(_,j)=>j)), row('방법 수', T, [i]))));
      }
      return traced('lec04-tiling-table-full', 'TILING2: 표 한 칸씩 채우기', 'F(2)..F(5)를 각 상태별 프레임으로 갱신한다.', 'F(0)=1,F(1)=1', ['T[0]=T[1]=1', 'i=2..n', 'T[i]=T[i-1]+T[i-2]'], steps, `F(5)=${T[n]}`, T[n], 8);
    }
    if (kind === 'two') {
      let a=1,b=1;
      for(let i=2;i<=n;i++){const old=[a,b];[a,b]=[b,a+b];steps.push(frame(`반복 ${i}`, `${old[0]}+${old[1]}=${b}; 최근 두 값만 다음 상태로 넘긴다.`, 1, {i,old,after:[a,b]}, rows(row('이전 두 값',old),row('갱신 뒤', [a,b]))));}
      return traced('lec04-tiling-two-vars-full','TILING2: 두 변수만 갱신','폭 2..5의 반복마다 두 변수 값이 이동한다.','a=F(0)=1,b=F(1)=1',['i=2..n 반복','a,b=b,a+b'],steps,`F(5)=${b}`,b,8);
    }
    let A=[[1,1],[1,0]],R=[[1,0],[0,1]],exp=n;
    const mul=(X,Y)=>X.map((r,i)=>r.map((_,j)=>X[i][0]*Y[0][j]+X[i][1]*Y[1][j]));
    while(exp>0){
      if(exp%2){R=mul(R,A);steps.push(frame(`비트 ${exp}`, '홀수 비트이므로 result에 현재 base를 곱한다.',1,{exp,result:R.map(r=>r.slice())},rows(row('result',R.map(r=>r.join(' '))))));}
      exp=Math.floor(exp/2);
      if(exp){
        A=mul(A,A);
        steps.push(frame('base 제곱', '다음 비트에 쓸 행렬을 제곱한다.',2,{exp,base:A.map(r=>r.slice())},rows(row('base',A.map(r=>r.join(' '))))));
      }
    }
    return traced('lec04-tiling-matrix-full','TILING2: 행렬 거듭제곱','Q^5의 각 비트 처리와 제곱을 순서대로 보인다.','Q=[[1,1],[1,0]], Q^n[0][0]=F(n)',['while n>0','홀수면 result*=base','base*=base; n//=2'],steps,`Q^5[0][0]=${R[0][0]}`,R[0][0],8);
  };
  const tilingDynamic = ['recursive','memo','table','two','matrix'].map(tilingScene);
  window.ALGO_MOTION['lec04/dp'] = tilingDynamic.concat(dynamic04, lec04.filter((s) => !['lec04-choose-table', 'lec04-choose-1row', 'lec04-triangle-2d', 'lec04-triangle-1row', 'lec04-tiling-forms', 'lec04-tiling-matrix'].includes(s.id)));

  const sequence = [1, 9, 7, 4, 2, 6, 3, 11, 10];
  const bruteLis = (a) => {
    let best=[];
    for(let mask=1;mask<(1<<a.length);mask++){
      const p=a.filter((_,i)=>mask>>i&1);
      if(p.every((v,i)=>i===0||p[i-1]<v)&&p.length>best.length)best=p;
    }
    return best.length;
  };
  const lisDirectionScene = (ending) => {
    const a=sequence.slice(), n=a.length, L=Array(n).fill(1), choices=Array(n).fill(-1), steps=[];
    const code=ending?['L[i]=1','i를 왼쪽부터 순회','j<i, A[j]<A[i]이면 후보 L[j]+1','후보가 현재 L[i]보다 크면 L[i] 갱신']:['L[i]=1, choices[i]=-1','i를 오른쪽부터 순회','j>i, A[j]>A[i]이면 후보 L[j]+1','후보가 현재 L[i]보다 크면 L[i], choices[i] 갱신'];
    const is=[...Array(n).keys()];
    const outer=ending?is:[...is].reverse();
    for(const i of outer){
      for(const j of (ending?is.slice(0,i):is.slice(i+1))){
        const valid=ending?a[j]<a[i]:a[i]<a[j], prev=L[i], candidate=valid?L[j]+1:-1, improved=valid&&candidate>prev;
        if(improved){L[i]=candidate;if(!ending)choices[i]=j;}
        const line=improved?3:2;
        steps.push(frame(`i=${i}, j=${j}`, !valid?`${ending?'A[j]<A[i]':'A[i]<A[j]'}가 거짓이므로 후보를 건너뛴다.`:improved?`증가 조건이 참이고 후보 ${candidate}>현재 ${prev}라 ${ending?'L[i]':'L[i]와 choices[i]'}를 갱신한다.`:`증가 조건은 참이지만 후보 ${candidate}가 현재 ${prev}보다 크지 않아 값을 유지한다.`,line,{i,j,valid,candidate,improved,L:L.slice(),choices:choices.slice()},rows(row('index',is),row('A',a),row('L',L,[i]))));
      }
      if(! (ending?is.slice(0,i):is.slice(i+1)).length)steps.push(frame(`i=${i} 기저`, '유효한 이전/다음 원소가 없어 자기 자신 길이 1을 유지한다.',0,{i,L:L.slice()},rows(row('A',a),row('L',L,[i]))));
    }
    const answer=Math.max(...L);
    return traced(ending?'lec05-lis-ending-full':'lec05-lis-starting-full',ending?'LIS: 각 i와 이전 j 비교':'LIS: 각 i와 이후 j 비교',ending?'과제 상태 정의처럼 i를 왼쪽부터 두고 모든 이전 j를 검사한다.':'본문 상태 L[i]=i에서 시작하는 길이. i를 오른쪽부터 두며 가능한 모든 j를 검사한다.',`S=[${a.join(',')}]; 엄격 증가`,code,steps,`L=${JSON.stringify(L)}, 최장 길이 ${answer}`,answer,bruteLis(a));
  };
  const lisRebuildFull = () => {
    const a=sequence.slice(),n=a.length,L=Array(n).fill(1),next=Array(n).fill(-1),steps=[];
    for(let i=n-1;i>=0;i--)for(let j=i+1;j<n;j++)if(a[i]<a[j]&&L[j]+1>L[i]){L[i]=L[j]+1;next[i]=j;}
    let at=L.indexOf(Math.max(...L));const start=at,route=[];
    while(at!==-1){
      route.push(at);
      steps.push(frame(`choices[${at}]`, `인덱스 ${at}의 값 ${a[at]}를 경로에 넣고 다음 인덱스 ${next[at]}로 이동한다.`,3,{at,next:next[at],route:route.slice()},rows(row('index',Array.from({length:n},(_,i)=>i)),row('A',a),row('choices',next,[at]))));
      at=next[at];
    }
    const result=route.map(i=>a[i]);
    return traced('lec05-lis-reconstruct-full','LIS: choices를 따라 한 경로 복원','본문 강의 수열에서 시작 상태를 모두 계산한 뒤 실제 다음 인덱스를 한 번에 하나씩 따라간다.',`S=[${a.join(',')}]`,['L[i]=1, choices[i]=-1','오른쪽 j 후보 전부 비교','최대면 L[i],choices[i] 갱신','최대 L 시작점부터 추적'],steps,`인덱스 ${route.join('→')}, 값 ${result.join('→')}`,result,[1,4,6,11]);
  };
  const tailsFull = () => {
    const a=[5,6,7,1,2],t=[],steps=[];
    for(let i=0;i<a.length;i++){
      const x=a[i];let lo=0,hi=t.length;
      while(lo<hi){const mid=(lo+hi)>>1;const before=[lo,hi];if(t[mid]<x)lo=mid+1;else hi=mid;steps.push(frame(`x=${x}: 이분 탐색`, `tails[${mid}]=${t[mid]} ${t[mid]<x?'<':'≥'} ${x}이므로 탐색 범위를 [${lo},${hi})로 줄인다.`,0,{i,x,mid,before,range:[lo,hi]},rows(row('tails',t,[mid]))));}
      if(lo===t.length)t.push(x);else t[lo]=x;
      steps.push(frame(`x=${x} 반영`,lo===t.length-1&&lo===t.length-1?`첫 x 이상 위치 ${lo}에서 값을 ${x}로 둔다. tails 길이는 ${t.length}다.`:`처음 x 이상인 위치 ${lo}를 ${x}로 바꿔 길이별 최소 끝값을 유지한다.`,2,{i,x,position:lo,tails:t.slice()},rows(row('입력',a,[],Array.from({length:i+1},(_,j)=>j)),row('tails',t,[lo]))));
    }
    return traced('lec05-lis-tails-full','빠른 LIS: 입력마다 tails 탐색·갱신','본문 [5,6,7,1,2]의 각 입력값에 대해 이분 탐색과 배열 갱신 프레임을 만든다. tails는 실제 부분수열이라고 해석하지 않는다.',`S=[${a.join(',')}]`,['lo=0, hi=len(tails)','첫 tails[k]≥x 탐색','끝이면 append, 아니면 교체'],steps,`LIS 길이 ${t.length}, tails=${JSON.stringify(t)}`,t.length,bruteLis(a));
  };
  const klisFull = () => {
    const a=[5,1,6,4,3,2,8,7],n=a.length,L=Array(n).fill(1),C=Array(n).fill(1),steps=[];
    for(let i=n-1;i>=0;i--){
      let best=0;
      for(let j=i+1;j<n;j++){
        const valid=a[i]<a[j];if(valid)best=Math.max(best,L[j]);
        steps.push(frame(`길이 i=${i}, j=${j}`,valid?`더 큰 뒤 원소 ${a[j]}의 길이 ${L[j]}가 후보가 된다.`:'값이 증가하지 않아 후보에서 제외한다.',1,{phase:'length',i,j,valid,best,L:L.slice()},rows(row('A',a),row('L',L,[i]))));
      }
      if(best)L[i]=best+1;
      steps.push(frame(`L[${i}] 확정`,`i에서 시작하는 최장 길이는 ${L[i]}이다.`,1,{phase:'length-done',i,L:L.slice()},rows(row('L',L,[i]))));
    }
    for(let i=n-1;i>=0;i--){
      let count=0;
      for(let j=i+1;j<n;j++){
        const valid=a[i]<a[j]&&L[i]===L[j]+1;if(valid)count+=C[j];
        steps.push(frame(`개수 i=${i}, j=${j}`,valid?`최장 후속 조건을 만족해 C[${j}]=${C[j]}를 더한다. 누적 ${count}.`:'증가 또는 L[i]=L[j]+1 조건이 맞지 않아 세지 않는다.',2,{phase:'count',i,j,valid,count,L:L.slice(),C:C.slice()},rows(row('L',L),row('C',C,[i]))));
      }
      if(L[i]===1)count=1;C[i]=count;
      steps.push(frame(`C[${i}] 확정`,`길이 ${L[i]}인 수열 개수 ${C[i]}를 저장한다.`,2,{phase:'count-done',i,C:C.slice()},rows(row('C',C,[i]))));
    }
    const max=Math.max(...L);const candidates=Array.from({length:n},(_,i)=>i).filter(i=>L[i]===max).sort((i,j)=>a[i]-a[j]);
    let k=6,skip=k-1,at=-1;const answer=[];
    for(const i of candidates){
      steps.push(frame(`시작 후보 ${a[i]}`,`이 분기의 개수 ${C[i]}와 현재 skip=${skip}을 비교한다.`,1,{phase:'skip-start',candidate:a[i],skip,count:C[i]},rows(row('후보 값',candidates.map(j=>a[j])),row('개수',candidates.map(j=>C[j])))));
      if(C[i]<=skip){skip-=C[i];steps.push(frame(`${a[i]} 분기 건너뜀`,`분기 ${C[i]}개를 건너 skip=${skip}으로 바꾼다.`,3,{skip},rows(row('skip',[skip]))));}
      else{at=i;answer.push(a[i]);break;}
    }
    while(at>=0&&L[at]>1){
      const opts=[];for(let j=at+1;j<n;j++)if(a[at]<a[j]&&L[at]===L[j]+1)opts.push(j);opts.sort((x,y)=>a[x]-a[y]);
      let picked=false;
      for(const j of opts){
        steps.push(frame(`다음 후보 ${a[j]}`,`후속 최장 수열 ${C[j]}개와 skip=${skip}을 비교한다.`,1,{phase:'skip-next',from:a[at],candidate:a[j],skip,count:C[j]},rows(row('후보 값',opts.map(x=>a[x])),row('후보 개수',opts.map(x=>C[x])))));
        if(C[j]<=skip){skip-=C[j];steps.push(frame(`${a[j]} 분기 건너뜀`,`skip에서 ${C[j]}를 빼 ${skip}이 된다.`,3,{skip},rows(row('skip',[skip]))));}
        else{at=j;answer.push(a[j]);picked=true;break;}
      }
      if(!picked)break;
    }
    const all=[];const walk=(prev,path)=>{if(path.length===max){all.push(path.slice());return;}for(let j=prev+1;j<n;j++)if(prev<0||a[prev]<a[j])walk(j,path.concat(a[j]));};walk(-1,[]);
    const lis=all.filter(p=>p.length===max).sort((x,y)=>{for(let i=0;i<x.length;i++)if(x[i]!==y[i])return x[i]-y[i];return 0;});
    return traced('lec05-klis-full','KLIS: 길이→개수→skip 복원','강의 수열에서 모든 i,j의 길이/개수 전이와 사전순 묶음 건너뛰기를 단계별 표시한다.',`S=[${a.join(',')}], k=6`,['뒤에서 L[i] 계산','뒤에서 C[i] 계산','다음 후보를 값순 정렬','cnt≤skip이면 skip-=cnt'],steps,`전체 ${lis.length}개 중 6번째 ${JSON.stringify(answer)}`,answer,lis[5]);
  };
  const dynamicLis=[lisDirectionScene(false),lisDirectionScene(true),lisRebuildFull(),tailsFull(),klisFull()];
  window.ALGO_MOTION['lec05/lis'] = dynamicLis;

  const packingGenerated = () => {
    const w=[2,3,4],p=[3,4,5],W=5,n=w.length,dp=Array.from({length:n+1},()=>Array(W+1).fill(0)),steps=[];
    for(let i=1;i<=n;i++)for(let c=0;c<=W;c++){
      const drop=dp[i-1][c],pick=c>=w[i-1]?p[i-1]+dp[i-1][c-w[i-1]]:-Infinity;
      dp[i][c]=Math.max(drop,pick);
      steps.push(frame(`물건 ${i-1}, 용량 ${c}`,c<w[i-1]?`무게 ${w[i-1]}가 용량 ${c}보다 커 넣을 수 없어 이전 값 ${drop}을 복사한다.`:`빼기 ${drop}와 넣기 ${p[i-1]}+${dp[i-1][c-w[i-1]]}=${pick}을 비교해 ${dp[i][c]}를 쓴다.`,3,{i,c,drop,pick:Number.isFinite(pick)?pick:null,value:dp[i][c]},grid(dp.map(r=>r.slice()),[[i,c]],[])));
    }
    const exhaustive=(i,c)=>i===n?0:Math.max(exhaustive(i+1,c),c>=w[i]?p[i]+exhaustive(i+1,c-w[i]):-Infinity);
    return traced('lec05-packing-table-full','0-1 배낭: 표의 각 칸 계산','본문 예제의 앞 i개 상태를 용량 0..5까지 한 칸씩 계산한다.',`W=${W}; w=${w}; p=${p}`,['D[0][c]=0','각 물건 i, 용량 c','max(drop, p[i-1]+이전행[c-w])'],steps,`최댓값 ${dp[n][W]}`,dp[n][W],exhaustive(0,W));
  };
  const packingOneRow = () => {
    const w=[2,3,4],p=[3,4,5],W=5,d=Array(W+1).fill(0),steps=[];
    for(let i=0;i<w.length;i++)for(let c=W;c>=w[i];c--){const old=d.slice(),candidate=p[i]+d[c-w[i]];d[c]=Math.max(d[c],candidate);steps.push(frame(`물건 ${i}, c=${c}`,`용량을 큰 쪽부터 처리한다. 이전 행에 해당하는 dp[${c-w[i]}]=${old[c-w[i]]}을 읽는다.`,2,{i,c,old,candidate,after:d.slice()},rows(row('용량',Array.from({length:W+1},(_,j)=>j)),row('dp',d,[c]))));}
    const expected=packingGenerated().checks[0].expected;
    return traced('lec05-packing-one-row-full','0-1 배낭: 한 행의 역순 갱신','각 물건마다 모든 허용 용량을 뒤에서 앞으로 갱신한다.',`W=${W}; w=${w}; p=${p}`,['각 물건 i','c=W..w[i]','dp[c]=max(dp[c],p[i]+dp[c-w[i]])'],steps,`최댓값 ${d[W]}`,d[W],expected);
  };
  const packingMemoGenerated = () => {
    const w=[2,3,4],p=[3,4,5],W=5,n=w.length,cache=new Map(),steps=[];
    const f=(i,c)=>{
      const key=`${i},${c}`;
      if(cache.has(key)){steps.push(frame(`cache hit (${i},${c})`,'이미 저장된 상태를 읽으므로 하위 호출을 다시 만들지 않는다.',0,{i,c,value:cache.get(key)},rows(row('cache key',[...cache.keys()]),row('cache 값',[...cache.values()]))));return cache.get(key);}
      if(i===n){cache.set(key,0);steps.push(frame('기저 저장', '모든 물건을 보았으므로 남은 용량과 무관하게 추가 가치는 0이다.',1,{i,c,value:0},rows(row('cache key',[...cache.keys()]),row('cache 값',[...cache.values()]))));return 0;}
      const drop=f(i+1,c),pick=c>=w[i]?p[i]+f(i+1,c-w[i]):-Infinity;
      cache.set(key,Math.max(drop,pick));steps.push(frame(`상태 (${i},${c}) 저장`, `빼기 ${drop}, 넣기 ${Number.isFinite(pick)?pick:'불가'} 중 큰 ${cache.get(key)}를 저장한다.`,3,{i,c,drop,pick:Number.isFinite(pick)?pick:null,value:cache.get(key)},rows(row('cache key',[...cache.keys()]),row('cache 값',[...cache.values()]))));return cache.get(key);
    };
    const value=f(0,W);
    let c=W;const chosen=[];
    for(let i=0;i<n;i++){const drop=f(i+1,c),pick=c>=w[i]?p[i]+f(i+1,c-w[i]):-Infinity;const take=pick>drop;if(take){chosen.push(i);c-=w[i];}steps.push(frame(`복원 물건 ${i}`,take?`넣기 분기 ${pick}가 빼기 ${drop}보다 커 물건 ${i}를 고르고 용량을 ${c}로 줄인다.`:`빼기 분기 ${drop}가 최적이거나 동률이어서 물건 ${i}를 건너뛴다.`,4,{i,take,chosen:chosen.slice(),capacity:c},rows(row('물건',w.map((_,j)=>j),[i]),row('선택',chosen))));}
    return traced('lec05-packing-memo-full','0-1 배낭: 메모와 복원','본문의 pack(i,c)에서 도달한 cache hit/miss/저장 후 같은 캐시값 비교로 실제 선택을 복원한다.',`W=${W}; w=${w}; p=${p}`,['cache hit이면 반환','기저 i=n이면 0','빼기/가능한 넣기 비교','최댓값 저장','복원: 값이 다르면 넣고 용량 갱신'],steps,`pack(0,5)=${value}; 선택 ${chosen}`,{value,chosen},{value:7,chosen:[0,1]});
  };
  const dynamicPacking=[packingGenerated(),packingOneRow(),packingMemoGenerated()];

  const matchGenerated=()=>{
    const rivals=[3,1,2],left=[2,2,3],steps=[];let wins=0;
    for(let t=0;t<rivals.length;t++){const r=rivals[t];let idx=left.findIndex(x=>x>=r);if(idx<0)idx=0;const pick=left.splice(idx,1)[0],win=pick>=r;if(win)wins++;steps.push(frame(`상대 ${r}`,win?`처음으로 ${r} 이상인 최소 선수 ${pick}을 내어 승리한다.`:`이길 선수가 없어 가장 약한 ${pick}을 소비한다.`,1,{turn:t,opponent:r,pick,win,wins,left:left.slice()},rows(row('상대 순서',rivals, [t]),row('선수 소비 뒤',left))));}
    const expected=3;
    return traced('lec06-matchorder-full','MATCHORDER: 상대마다 한 명씩 배정','본문 [3,1,2] 대 [2,2,3]의 각 경기를 선수 소비와 함께 보여준다. 같은 레이팅은 승리다.',`상대=${rivals}; 우리=[2,2,3]`,['정렬한 우리 선수 유지','상대별 첫 rating≥상대 선택','없으면 최약자 소비','승수 누적'],steps,`${wins}승`,wins,expected);
  };
  const strjoinGenerated=()=>{
    let q=[1,2,3,4],cost=0;const steps=[];
    while(q.length>1){q.sort((a,b)=>a-b);const a=q.shift(),b=q.shift(),sum=a+b;cost+=sum;q.push(sum);q.sort((a,b)=>a-b);steps.push(frame(`${a}+${b} 합병`,`가장 작은 두 길이를 합쳐 ${sum}를 다시 후보에 넣고 누적 비용은 ${cost}다.`,1,{a,b,merged:sum,cost,queue:q.slice()},rows(row('정렬된 후보',q))));}
    return traced('lec06-strjoin-full','STRJOIN: 매 합병 뒤 다시 정렬','길이 [1,2,3,4]에서 최소 두 항목 pop, 합 비용 누적, 새 길이 삽입을 매번 표시한다.', '길이=[1,2,3,4]',['최소 두 값 pop','합을 비용에 더함','합친 길이를 후보에 push'],steps,`총 합병 비용 ${cost}`,cost,19);
  };
  const greedyCoins=()=>{
    let rem=6,chosen=[],steps=[];for(const coin of [4,3,1])while(rem>=coin){rem-=coin;chosen.push(coin);steps.push(frame(`동전 ${coin} 선택`,`현재 남은 금액에서 가장 큰 가능한 ${coin}을 택해 ${rem}이 남는다.`,0,{coin,remaining:rem,chosen:chosen.slice()},rows(row('동전',chosen),row('남은 금액',[rem]))));}
    const min=[0,Infinity,Infinity,Infinity,Infinity,Infinity,Infinity];for(let x=1;x<=6;x++)for(const coin of [1,3,4])if(coin<=x)min[x]=Math.min(min[x],min[x-coin]+1);
    return traced('lec06-greedy-coin-full','탐욕 반례: 6원의 동전 선택','본문 동전 체계 1,3,4에서 큰 동전 우선 반복과 최소 동전 수 DP를 비교한다.', 'amount=6; coins=[1,3,4]',['가능한 가장 큰 동전을 선택','금액에서 빼기','DP로 최소 동전 수 계산'],steps,`탐욕 ${chosen.length}개, 최적 ${min[6]}개`,{coins:chosen,sum:chosen.reduce((a,b)=>a+b,0),minimum:min[6]},{coins:[4,1,1],sum:6,minimum:2});
  };

  const shortestCounterGenerated=()=>{
    const edges=[['S','A',1],['A','T',100],['S','B',2],['B','T',2]],paths=[['S→A→T',[1,100]],['S→B→T',[2,2]]],costs=paths.map(([name,ws])=>({name,cost:ws.reduce((a,b)=>a+b,0)})),steps=[];
    const ns=[{id:'S',label:'S',x:80,y:150},{id:'A',label:'A',x:250,y:75},{id:'B',label:'B',x:250,y:225},{id:'T',label:'T',x:500,y:150}],ge=edges.map(([from,to,w])=>({from,to,label:String(w),directed:true}));
    steps.push(frame('첫 간선 비교','S의 국소 최소 간선은 S→A=1이라 탐욕이 A를 고른다.',0,{localChoice:'S→A',localWeight:1},graph(ns.map(n=>({...n,active:n.id==='A'})),ge.map(e=>({...e,active:e.from==='S'&&e.to==='A'})))));
    steps.push(frame('두 경로 비용','전체 경로를 따라가면 A 경유 101, B 경유 4다. 그래프의 모든 노드와 간선은 같은 위치를 유지한다.',2,{costs},rows(row('경로',costs.map(x=>x.name)),row('합',costs.map(x=>x.cost),[1]))));
    steps.push(frame('전체 최솟값','두 간선만 보고 고른 경로는 최단이 아니다. 전체 합은 B 경유의 4다.',2,{best:Math.min(...costs.map(x=>x.cost))},graph(ns.map(n=>({...n,done:n.id==='S'||n.id==='B'||n.id==='T',active:n.id==='B'})),ge.map(e=>({...e,active:e.from==='S'&&e.to==='B'||e.from==='B'&&e.to==='T'})))));
    return traced('lec06-greedy-shortest-edge-full','탐욕 반례: 가장 짧은 첫 간선','본문 학습용 방향 그래프에서 국소 간선 선택과 전체 경로 비용을 대조한다. Dijkstra 구현은 범위 밖이다.','S→A=1,A→T=100,S→B=2,B→T=2',['현재 최소 간선 선택','경로의 나머지 비용 비교','전체 합 최소 선택'],steps,'A 경유 101, B 경유 4',{local:1,costs:costs.map(x=>x.cost),best:Math.min(...costs.map(x=>x.cost))},{local:1,costs:[101,4],best:4});
  };
  const packingCompareGenerated=()=>{
    const items=[[10,60],[20,100],[30,120]],W=50,ratio=items.map(([w,v],i)=>({i,w,v,r:v/w})).sort((a,b)=>b.r-a.r),steps=[];let rem=W,greedy=0,greedyItems=[];
    for(const it of ratio)if(it.w<=rem){greedy+=it.v;rem-=it.w;greedyItems.push(it.i);}
    let optimal=0,optMask=0;for(let mask=0;mask<(1<<items.length);mask++){let w=0,v=0;for(let i=0;i<items.length;i++)if(mask>>i&1){w+=items[i][0];v+=items[i][1];}if(w<=W&&v>optimal){optimal=v;optMask=mask;}}
    let left=W,fractional=0,parts=[];for(const it of ratio){const take=Math.min(left,it.w),v=it.v*take/it.w;fractional+=v;left-=take;parts.push({item:it.i,weight:take,value:v});if(left===0)break;}
    steps.push(frame('비율 정렬','가치/무게 비율 6,5,4 순서로 선택한다.',0,{ratio:ratio.map(x=>x.r)},rows(row('물건',ratio.map(x=>String.fromCharCode(65+x.i))),row('무게',[...ratio.map(x=>x.w)]),row('비율',ratio.map(x=>x.r)))));
    steps.push(frame('0-1 비율 탐욕','A와 B를 통째로 넣으면 가치 160, 남은 용량은 20이다.',1,{items:greedyItems,weight:items.filter((_,i)=>greedyItems.includes(i)).reduce((a,x)=>a+x[0],0),value:greedy,remaining:rem},bars(items.map(x=>x[1]),greedyItems)));
    steps.push(frame('0-1 모든 부분집합','모든 2³ 조합을 비교하면 B+C가 무게 50, 가치 220으로 가장 크다.',2,{mask:optMask,optimal},bars(items.map(x=>x[1]),items.map((_,i)=>i).filter(i=>optMask>>i&1))));
    steps.push(frame('분할 허용','fractional이면 C에서 남은 20/30만 넣어 가치 240을 만든다.',3,{parts,fractional},bars(parts.map(x=>x.value),parts.map((_,i)=>i))));
    return traced('lec05-packing-fractional-full','PACKING: 0-1과 fractional 선택 비교','본문의 세 물건 반례를 비율 탐욕·0-1 부분집합 최적·분할 가능 최적으로 실제 계산한다.',`items=${JSON.stringify(items)}, W=${W}`,['가치/무게 비율 정렬','통째 선택 가능한 경우만 추가','0-1 부분집합 중 최댓값','남은 용량만큼 분할'],steps,`0-1 탐욕 ${greedy}, 0-1 최적 ${optimal}, fractional ${fractional}`,{greedy,optimal,fractional},{greedy:160,optimal:220,fractional:240});
  };

  const orderedDPGenerated=()=>{
    const a=[1,2,3],n=a.length,D=Array.from({length:n},()=>Array(n).fill(0)),steps=[],sum=(i,j)=>a.slice(i,j+1).reduce((x,y)=>x+y,0);
    for(let len=2;len<=n;len++)for(let i=0;i+len<=n;i++){
      const j=i+len-1,candidates=[];
      for(let k=i;k<j;k++){const value=D[i][k]+D[k+1][j]+sum(i,j);candidates.push(value);D[i][j]=k===i?value:Math.min(D[i][j],value);steps.push(frame(`D[${i}][${j}], k=${k}`,`마지막 분할 ${k}에서 왼쪽 ${D[i][k]}+오른쪽 ${D[k+1][j]}+구간합 ${sum(i,j)}=${value}를 비교한다.`,1,{i,j,k,value,candidates:candidates.slice(),D:D.map(r=>r.slice())},grid(D.map(r=>r.slice()),[[i,j]])));}
    }
    const rec=(i,j)=>{if(i===j)return 0;let best=Infinity;for(let k=i;k<j;k++)best=Math.min(best,rec(i,k)+rec(k+1,j)+sum(i,j));return best;};
    return traced('lec06-strjoin-ordered-dp-full','순서 고정 합병: 각 구간 분할 비교','본문의 보충 변형인 이웃 구간만 합치는 DP에서 길이 2·3 구간의 모든 k 분할을 계산한다. 자유 합병 STRJOIN과 구분한다.',`lengths=${a}`,['D[i][i]=0','구간 길이 증가','모든 분할 k 비교','D[i][j]=min candidate'],steps,`최소 비용 ${D[0][2]}`,{value:D[0][2],pair:D[0][1]}, {value:rec(0,2),pair:rec(0,1)});
  };

  const dynamic05dp=[triReconstruct,...dynamicPacking,packCompare];
  const dynamic06greedy=[greedyCoins(),shortestCounter,matchGenerated(),strjoinGenerated(),orderedDP];

  const huffmanGenerated=()=>{
    const leaves=[['a',16],['b',5],['c',12],['d',17],['e',10],['f',25]];
    const coords={r:[300,40],u:[170,100],v:[430,100],a:[90,160],d:[240,160],f:[360,160],w:[510,160],c:[460,215],z:[550,215],b:[510,265],e:[560,265]};
    const specs=[{parent:'z',left:'b',right:'e',sum:15},{parent:'w',left:'c',right:'z',sum:27},{parent:'u',left:'a',right:'d',sum:33},{parent:'v',left:'f',right:'w',sum:52},{parent:'r',left:'u',right:'v',sum:85}];
    const label={a:'a16',b:'b5',c:'c12',d:'d17',e:'e10',f:'f25',u:'+33',v:'+52',w:'+27',z:'+15',r:'+85'};
    const present=new Set(leaves.map(([c])=>c)),edges=[],steps=[],nodes=Object.keys(coords);
    const root={};for(const [c,f]of leaves)root[c]={char:c,freq:f};
    const q=leaves.map(([c,f],i)=>({char:c,freq:f,id:c,serial:i}));let serial=q.length,total=0;
    for(let k=0;k<specs.length;k++){
      q.sort((x,y)=>x.freq-y.freq||x.serial-y.serial);const a=q.shift(),b=q.shift(),spec=specs[k],par={char:null,freq:a.freq+b.freq,left:a,right:b,id:spec.parent,serial:serial++};q.push(par);present.add(spec.parent);total+=par.freq;
      edges.push({from:spec.parent,to:spec.left,label:'0',directed:false},{from:spec.parent,to:spec.right,label:'1',directed:false});
      const graphNodes=nodes.filter(id=>present.has(id)).map(id=>({id,label:label[id],x:coords[id][0],y:coords[id][1],active:id===spec.parent,done:id!==spec.parent}));
      steps.push(frame(`병합 ${k+1}: ${a.freq}+${b.freq}=${par.freq}`,`현재 최소 노드 ${a.freq}, ${b.freq}를 부모 ${par.freq}로 묶는다. 새 부모를 후보에 다시 넣는다.`,0,{merge:k+1,popped:[a.freq,b.freq],parent:par.freq,queue:q.map(x=>x.freq).sort((x,y)=>x-y),internalSum:total},graph(graphNodes,edges.map(e=>({...e,done:true})))));
    }
    const codes={};const walk=(node,prefix)=>{if(node.char)codes[node.char]=prefix||'0';else{walk(node.left,prefix+'0');walk(node.right,prefix+'1');}};walk(q[0],'');
    const weighted=leaves.reduce((s,[c,f])=>s+f*codes[c].length,0);
    return traced('lec06-huffman-tree-full','Huffman: 5회 병합으로 트리 만들기','강의 빈도 6개를 최소 두 노드씩 꺼내 모두 결합한다. 트리 노드 좌표는 고정하고 프레임마다 새 간선을 추가한다.', 'a16,b5,c12,d17,e10,f25',['빈도 최소 두 노드 pop','왼쪽/오른쪽 자식 연결','부모 빈도 합 push'],steps,`코드 ${JSON.stringify(codes)}, 가중 비트 ${weighted}`,{merges:specs.map(s=>s.sum),weighted}, {merges:[15,27,33,52,85],weighted:212});
  };
  const huffmanEncodeFull=()=>{
    const codes={a:'00',b:'1110',c:'110',d:'01',e:'1111',f:'10'},text='abcdef',steps=[];let bits='';
    for(let i=0;i<text.length;i++){const c=text[i];bits+=codes[c];steps.push(frame(`${c} 인코딩`,`문자 잎 ${c}까지의 코드 ${codes[c]}를 출력 비트열 뒤에 붙인다.`,2,{i,char:c,code:codes[c],bits},rows(row('문자열',[...text],[],Array.from({length:i},(_,j)=>j)),row('코드',[...text].map(x=>codes[x]),[i]),row('누적 비트',[bits]))));}
    const expected='00111011001111110';
    return traced('lec06-huffman-encode-full','Huffman: 문자마다 코드 이어 붙이기','강의의 고정 트리 코드표로 abcdef 여섯 문자를 각각 인코딩한다.',`codes=${JSON.stringify(codes)}`,['문자 잎까지 0/1 경로 기록','각 문자의 코드를 이어 붙임'],steps,bits,bits,expected);
  };
  const huffmanDecodeFull=()=>{
    const codes={a:'00',b:'1110',c:'110',d:'01',e:'1111',f:'10'},bits='001110',reverse=Object.fromEntries(Object.entries(codes).map(([k,v])=>[v,k]));let pending='',out='',steps=[];
    for(let i=0;i<bits.length;i++){
      pending+=bits[i];const found=reverse[pending];
      if(found){
        out+=found;
        steps.push(frame(`비트 ${i}: ${bits[i]} → 잎 ${found}`,`누적 경로 ${pending}가 문자 ${found}의 잎 코드와 일치한다. 문자를 출력하고 다음 비트는 루트에서 읽는다.`,1,{i,bit:bits[i],path:pending,output:out},rows(row('입력 비트',[...bits],[],Array.from({length:i+1},(_,j)=>j)),row('출력',[...out]))));
        pending='';
      } else {
        steps.push(frame(`비트 ${i}: ${bits[i]}`,`현재 접두 경로 ${pending}는 아직 잎이 아니므로 문자를 출력하지 않는다.`,0,{i,bit:bits[i],path:pending,output:out},rows(row('입력 비트',[...bits],[],Array.from({length:i+1},(_,j)=>j)),row('출력',[...out]))));
      }
    }
    return traced('lec06-huffman-decode-full','Huffman: 비트마다 이동·잎 출력','001110의 비트를 하나씩 소비해 잎에서 문자 출력 후 루트로 복귀한다.',`bits=${bits}`,['비트 0은 왼쪽, 1은 오른쪽','잎이면 출력','출력 후 루트 복귀'],steps,`디코딩 결과 ${out}`,out,'ab');
  };
  const huffmanRebuildFull=()=>{
    const tokens=['+','+','a','d','+','f','+','c','+','b','e'],nodes=[],edges=[],events=[];let cursor=0;
    const parse=(parent=null,side='')=>{
      const token=tokens[cursor],index=cursor++,id=`n${index}`;const node={id,token,left:null,right:null,index};nodes.push(node);events.push({id,token,index});
      if(parent)edges.push({from:parent,to:id,label:side});
      if(token==='+'){node.left=parse(id,'0');node.right=parse(id,'1');}
      return node;
    };
    const root=parse();
    let leafIndex=0;
    const place=(node,depth)=>{
      if(node.token!=='+'){node.x=70+leafIndex*92;leafIndex++;node.y=45+depth*48;return node.x;}
      const lx=place(node.left,depth+1),rx=place(node.right,depth+1);node.x=(lx+rx)/2;node.y=45+depth*48;return node.x;
    };
    place(root,0);
    const steps=[];
    for(let i=0;i<events.length;i++){
      const e=events[i],created=new Set(events.slice(0,i+1).map(x=>x.id));
      const visualNodes=nodes.filter(n=>created.has(n.id)).map(n=>({id:n.id,label:n.token,x:n.x,y:n.y,active:n.id===e.id,done:n.id!==e.id}));
      const visualEdges=edges.filter(x=>created.has(x.from)&&created.has(x.to)).map(x=>({from:x.from,to:x.to,label:x.label,directed:true}));
      steps.push(frame(`토큰 ${i+1}: ${e.token}`,e.token==='+'?'내부 노드 +를 만들고 전위 순서대로 왼쪽·오른쪽 자식 재귀 호출을 기다린다.':`잎 ${e.token}를 실제 구성 트리에 붙인다.`,e.token==='+'?1:0,{cursor:i+1,token:e.token,node:e.id,nodes:visualNodes.length},graph(visualNodes,visualEdges)));
    }
    const expectedNodes=2*6-1,actualNodes=nodes.length;
    return traced('lec06-huffman-rebuild-full','Huffman: 직렬화 토큰으로 트리 재구성','내부 +와 잎 문자, 두 자식 규칙으로 강의 트리를 재귀 파싱한다. 노드 좌표는 고정하고 토큰을 읽을 때마다 실제 부모-자식 간선을 추가한다.',`preorder=${tokens.join(' ')}`,['잎이면 문자 노드 반환','+이면 왼쪽 자식 재귀 구성','오른쪽 자식 재귀 구성','두 자식 반환 뒤 부모 완성'],steps,`잎 ${leafIndex}개와 내부 ${actualNodes-leafIndex}개, 전체 ${actualNodes}노드`,actualNodes,expectedNodes);
  };

  const primGenerated=(heapMode=false)=>{
    const nodes=[{id:'A',label:'A',x:100,y:150},{id:'B',label:'B',x:270,y:70},{id:'C',label:'C',x:270,y:230},{id:'D',label:'D',x:500,y:150}];
    const es=[['A','B',2],['A','C',5],['B','C',1],['B','D',4],['C','D',3]];
    const adj={A:[],B:[],C:[],D:[]};for(const [u,v,w]of es){adj[u].push([v,w]);adj[v].push([u,w]);}
    const added=new Set(),best={A:0,B:Infinity,C:Infinity,D:Infinity},parent={A:null,B:null,C:null,D:null},chosen=[],steps=[];let total=0;
    const code=heapMode?['heap에 (weight,node,parent)','최소 후보 pop','added면 skip','새 정점에서 후보 push']:['minweight[A]=0','미선택 최소 정점 선택','인접 간선 weight로 후보 완화'];
    const snapshot=(activeEdge)=>{
      const ns=nodes.map(n=>({...n,done:added.has(n.id),active:n.id===activeEdge?.to}));
      const edges=es.map(([u,v,w])=>({from:u,to:v,label:String(w),active:!!activeEdge&&((u===activeEdge.from&&v===activeEdge.to)||(v===activeEdge.from&&u===activeEdge.to)),done:chosen.some(e=>(e[0]===u&&e[1]===v)||(e[0]===v&&e[1]===u))}));
      return graph(ns,edges);
    };
    while(added.size<nodes.length){
      const u=nodes.map(n=>n.id).filter(x=>!added.has(x)).sort((a,b)=>best[a]-best[b]||a.localeCompare(b))[0];
      if(!Number.isFinite(best[u]))break;
      added.add(u);total+=best[u];if(parent[u])chosen.push([parent[u],u,best[u]]);
      steps.push(frame(`${u} 정점 추가`,`미선택 후보 중 minweight가 최소인 ${u}:${best[u]}를 트리에 넣고 비용을 누적한다.`,1,{u,added:[...added],best:{...best},parent:{...parent},total},snapshot(parent[u]?{from:parent[u],to:u}:null)));
      for(const [v,w]of adj[u])if(!added.has(v)){
        const before=best[v],improve=w<best[v];if(improve){best[v]=w;parent[v]=u;}
        steps.push(frame(`${u}→${v} 완화`,`간선 하나의 가중치 ${w}를 기존 minweight ${before}와 비교한다. ${improve?'더 작아 parent도 갱신한다.':'더 작지 않아 유지한다.'}`,2,{u,v,w,before,after:best[v],parent:parent[v],best:{...best}},snapshot({from:u,to:v})));
      }
    }
    const value=total;
    return traced(heapMode?'lec06-prim-heap-full':'lec06-prim-array-full',heapMode?'Prim 힙: pop·추가·간선 push':'Prim 배열: 정점 추가와 모든 인접 간선 완화',heapMode?'고정 4정점 그래프에서 최소 힙 후보의 추가/갱신/방문 상태를 보인다.':'고정 4정점 그래프에서 각 미선택 정점 추가와 인접 간선의 minweight 비교를 전부 보인다.','A-B:2,A-C:5,B-C:1,B-D:4,C-D:3',code,steps,`선택 간선 ${chosen.map(e=>`${e[0]}${e[1]}:${e[2]}`).join(',')}; 비용 ${value}`,{total:value,edges:chosen.map(e=>e[2]).sort((a,b)=>a-b)},{total:6,edges:[1,2,3]});
  };
  const kruskalGenerated=()=>{
    const nodes=[{id:'A',label:'A',x:100,y:150},{id:'B',label:'B',x:270,y:70},{id:'C',label:'C',x:270,y:230},{id:'D',label:'D',x:500,y:150}],edges=[['B','C',1],['A','B',2],['C','D',3],['B','D',4],['A','C',5]],parent={A:'A',B:'B',C:'C',D:'D'},selected=[],steps=[];
    const find=x=>parent[x]===x?x:(parent[x]=find(parent[x]));let total=0;
    for(const [u,v,w]of edges){const ru=find(u),rv=find(v),take=ru!==rv;if(take){parent[ru]=rv;selected.push([u,v,w]);total+=w;}const graphEdges=edges.map(([a,b,c])=>({from:a,to:b,label:String(c),active:a===u&&b===v,done:selected.some(e=>e[0]===a&&e[1]===b)}));steps.push(frame(`${u}-${v}:${w}`,take?`끝점이 다른 연결 조각 ${ru},${rv}를 연결해 간선을 택한다.`:`끝점이 이미 같은 조각 ${ru}에 있어 사이클을 만들므로 건너뛴다.`,1,{u,v,w,take,parent:{...parent},selected:selected.map(e=>e.slice()),total},graph(nodes.map(n=>({...n,done:Object.values(parent).every(x=>x===parent[n.id])})),graphEdges)));}
    return traced('lec06-kruskal-full','Kruskal: 정렬 간선마다 사이클 판별','본문 범위의 Kruskal 원리를 5개 정렬 간선마다 표시한다. Union-Find 세부 구현은 시각 상태용 연결 조각 표로 대체한다.',`간선=[BC1,AB2,CD3,BD4,AC5]`,['가중치 정렬','각 간선의 연결 조각 비교','사이클이면 skip','선택 간선 비용 합'],steps,`MST 비용 ${total}`,total,6);
  };
  const lanGenerated=(sentinel=false)=>{
    const pts=[[0,0],[3,0],[3,4]],labels=['A','B','C'],n=3,installed=[[0,1]],W=pts.map(([x,y])=>pts.map(([a,b])=>(x-a)**2+(y-b)**2));
    for(const [u,v]of installed)W[u][v]=W[v][u]=0;
    const dist=W[0].slice(),added=Array(n).fill(false),steps=[];let total=0;
    if(sentinel)dist[0]=-1;else added[0]=true;
    for(let iter=0;iter<n-1;iter++){
      let u=-1;for(let v=1;v<n;v++)if((sentinel?dist[v]>=0:!added[v])&&(u<0||dist[v]<dist[u]))u=v;
      const sq=dist[u];total+=Math.sqrt(sq);if(sentinel)dist[u]=-1;else added[u]=true;
      steps.push(frame(`${labels[u]} 선택`,`후보 제곱거리 ${sq}를 선택하고 실제 길이 √${sq}=${Math.sqrt(sq)}를 비용에 더한다.`,2,{iter,node:labels[u],squared:sq,total,dist:dist.slice(),visited:added.slice()},graph(pts.map((p,i)=>({id:labels[i],label:labels[i],x:80+p[0]*100,y:80+p[1]*35,done:sentinel?dist[i]===-1:added[i],active:i===u})),[{from:'A',to:'B',label:'0',done:sentinel?dist[1]===-1:added[1]},{from:'B',to:'C',label:'4',active:u===1},{from:'A',to:'C',label:'5'}])));
      for(let v=1;v<n;v++)if(sentinel?dist[v]>=0:!added[v]){const old=dist[v];if(W[u][v]<dist[v])dist[v]=W[u][v];steps.push(frame(`${labels[u]} 완화 ${labels[v]}`,`거리 제곱 ${W[u][v]}와 현재 후보 ${old}를 비교해 ${dist[v]}로 둔다. 방문 표식 방식 ${sentinel?'dist=-1':'별도 visited'}을 적용한다.`,3,{u:labels[u],v:labels[v],old,next:dist[v],dist:dist.slice()},rows(row('건물',labels),row('dist²',dist))));}
    }
    return traced(sentinel?'lec06-lan-sentinel-full':'lec06-lan-visited-full',sentinel?'LAN: dist=-1 방문 상태':'LAN: 별도 visited 상태',`본문 좌표와 기존 AB 케이블로 Prim을 수행한다. ${sentinel?'dist=-1':'added 배열'}을 매 단계 갱신한다.`,`A=(0,0),B=(3,0),C=(3,4), AB 기존`,['제곱 거리 계산','AB 기존 간선=0','최소 후보 선택','선택 후 방문 표시·거리 완화'],steps,`추가 길이 ${total}`,Number(total.toFixed(8)),4);
  };

  const chooseNaiveFull=()=>{
    const steps=[],stack=[];let calls=0;
    const f=(n,k)=>{
      calls++;stack.push(`C(${n},${k})`);
      steps.push(frame(`호출 ${calls}`,`C(${n},${k}) 호출. 저장하지 않으므로 호출 트리에서 같은 상태가 다시 계산된다.`,1,{n,k,stack:stack.slice()},rows(row('호출 stack',stack.slice(-8)))));
      const value=(k===0||k===n)?1:f(n-1,k-1)+f(n-1,k);stack.pop();
      steps.push(frame(`반환 C(${n},${k})=${value}`,`하위 호출을 마치고 ${value}를 반환한다.`,3,{n,k,value,depth:stack.length},rows(row('호출 stack',stack.slice(-8)),row('반환값',[value]))));
      return value;
    };
    const actual=f(4,2);
    return traced('lec04-dp-naive-full','이항계수: 중복 재귀 호출 전체','C(4,2)의 실제 재귀 호출과 반환 2개 이벤트를 모두 만든다.', 'C(4,2)', ['기저면 1 반환','C(n-1,k-1) 호출','C(n-1,k) 호출','두 결과 합산 반환'],steps,`C(4,2)=${actual}, 호출 ${calls}회`,{value:actual,calls},{value:6,calls:11});
  };
  const chooseMemoFull=()=>{
    const cache=new Map(),steps=[];let calls=0,hits=0;
    const f=(n,k)=>{
      calls++;const key=`${n},${k}`;
      if(cache.has(key)){
        hits++;
        steps.push(frame(`cache hit C(${n},${k})`,`이미 저장한 ${cache.get(key)}를 반환해 하위 재귀를 생략한다.`,1,{n,k,hit:true,value:cache.get(key),hits},rows(row('cache key',[...cache.keys()]),row('cache value',[...cache.values()]))));
        return cache.get(key);
      }
      const value=(k===0||k===n)?1:f(n-1,k-1)+f(n-1,k);cache.set(key,value);
      steps.push(frame(`저장 C(${n},${k})`,`처음 계산한 결과 ${value}를 cache에 넣는다.`,3,{n,k,value,states:cache.size},rows(row('cache key',[...cache.keys()]),row('cache value',[...cache.values()]))));
      return value;
    };
    const actual=f(4,2);
    return traced('lec04-dp-memo-full','이항계수: 상태 계산과 cache hit','C(4,2)의 실제 메모 재귀에서 최초 계산과 중복 방문을 각각 프레임으로 만든다.', '빈 cache, C(4,2)', ['기저면 1','cache hit이면 반환','두 하위 상태 계산','결과 저장'],steps,`결과 ${actual}, cache hit ${hits}`,{value:actual,hits},{value:6,hits:1});
  };
  const chooseTwoRowsFull=()=>{
    let prev=[1],steps=[frame('n=0', 'C(0,0)=1을 첫 이전 행으로 둔다.',0,{n:0},rows(row('prev',[1])))];
    for(let n=1;n<=4;n++){
      const cur=Array(n+1).fill(1);
      for(let j=1;j<n;j++){
        cur[j]=prev[j-1]+prev[j];
        steps.push(frame(`n=${n}, j=${j}`,`새 행의 양 끝 사이 칸을 이전 행 ${prev[j-1]}+${prev[j]}=${cur[j]}로 계산한다.`,2,{n,j,prev:prev.slice(),cur:cur.slice()},rows(row('이전 행',prev),row('현재 행',cur,[j]))));
      }
      prev=cur;steps.push(frame(`행 ${n} 완성`,`현재 행 [${cur}]을 다음 반복의 prev로 넘긴다.`,3,{n,prev:prev.slice()},rows(row('prev',prev))));
    }
    return traced('lec04-dp-two-rows-full','이항계수: 두 행의 모든 내부 칸','n=1..4 각 내부 j를 계산하고 행을 교체한다.', 'C(4,2)', ['cur[0]=cur[n]=1','n=1..4','j=1..n-1: cur[j]=prev[j-1]+prev[j]','prev=cur'],steps,`C(4,2)=${prev[2]}`,prev[2],4*3/2);
  };
  const polyBuild=(tableMode)=>{
    const N=4,dp=Array.from({length:N+1},()=>Array(N+1).fill(0)),steps=[];
    for(let n=1;n<=N;n++)for(let f=1;f<=n;f++){
      if(n===f){
        dp[n][f]=1;
        steps.push(frame(`P(${n},${f})=1`,'한 줄만 놓는 기저 상태다.',tableMode?2:0,{n,first:f,value:1},grid(dp.map(r=>r.slice()),[[n,f]])));
        continue;
      }
      let sum=0;
      for(let s=1;s<=n-f;s++){
        const term=(f+s-1)*dp[n-f][s];sum+=term;
        if(tableMode)steps.push(frame(`P(${n},${f}), second=${s}`,`${f}+${s}−1=${f+s-1}개 붙임 위치 × 아래 상태 ${dp[n-f][s]}개 = ${term}; 누적 ${sum}.`,3,{n,first:f,second:s,term,sum},grid(dp.map(r=>r.slice()),[[n,f]],[[n-f,s]])));
      }
      dp[n][f]=sum;
      if(!tableMode)steps.push(frame(`메모 P(${n},${f})`,`모든 second 항을 더해 ${sum}를 cache에 저장한다.`,2,{n,first:f,value:sum},grid(dp.map(r=>r.slice()),[[n,f]])));
    }
    const total=dp[N].reduce((a,b)=>a+b,0);
    return traced(tableMode?'lec04-poly-table-full':'lec04-poly-memo-full',tableMode?'POLY: 표 상태와 항 계산':'POLY: 재귀 상태와 메모 결과',`본문 점화식으로 n≤${N}의 각 첫 행 길이 상태를 계산한다. ${tableMode?'표에서 각 곱 항을 별도 프레임으로 보인다.':'각 (n,first) 상태가 계산될 때 cache에 남는다.'}`,`P(n,f)=Σ(f+s−1)P(n−f,s)`,['n과 first 상태','second마다 배치수×하위모양수','항의 합 저장'],steps,`P(4)=${total}; row=${JSON.stringify(dp[N].slice(1))}`,{total,row:dp[N].slice(1)},{total:19,row:[10,5,3,1]});
  };
  const polyMemoRecursive=()=>{
    const cache=new Map(),steps=[];
    const P=(n,f)=>{
      const key=`${n},${f}`;
      if(cache.has(key)){steps.push(frame(`P(${n},${f}) hit`,'이미 계산된 상태를 cache에서 가져온다.',1,{n,first:f,hit:true,value:cache.get(key)},rows(row('cache key',[...cache.keys()]),row('cache 값',[...cache.values()]))));return cache.get(key);}
      if(n===f){cache.set(key,1);steps.push(frame(`P(${n},${f}) 기저`,'한 줄만 놓는 상태는 한 가지이고 cache에 저장한다.',0,{n,first:f,value:1},rows(row('cache key',[...cache.keys()]),row('cache 값',[...cache.values()]))));return 1;}
      let sum=0;
      for(let s=1;s<=n-f;s++){const below=P(n-f,s),ways=f+s-1,term=ways*below;sum+=term;steps.push(frame(`P(${n},${f}), s=${s}`,`${ways}개 부착 위치 × 아래 상태 ${below}개=${term}; 누적 ${sum}.`,2,{n,first:f,second:s,ways,below,term,sum},rows(row('상태',[`P(${n},${f})`,`P(${n-f},${s})`]),row('부착 위치',[ways]),row('누적',[sum]))));}
      cache.set(key,sum);steps.push(frame(`P(${n},${f}) 저장`,`모든 second 항의 합 ${sum}을 cache에 저장한다.`,3,{n,first:f,value:sum},rows(row('cache key',[...cache.keys()]),row('cache 값',[...cache.values()]))));return sum;
    };
    const values=[];for(let f=1;f<=4;f++)values.push(P(4,f));const actual=values.reduce((x,y)=>x+y,0);
    return traced('lec04-poly-memo-full','POLY: 재귀 상태 miss·항·저장','P(4,f)를 첫 행 길이마다 재귀 메모로 계산하고 하위 상태와 각 부착 항을 보여준다.', 'P(n,f)=Σ(f+s−1)P(n−f,s)', ['cache에 있으면 반환','n=f이면 1','각 second의 부착 위치×하위 모양','합을 cache에 저장'],steps,`P(4)=${actual}; row=${JSON.stringify(values)}`,{total:actual,row:values},{total:19,row:[10,5,3,1]});
  };
  const catalanBuild=(memoMode)=>{
    const C=[1],steps=[];
    for(let n=1;n<=5;n++){
      let sum=0;
      for(let i=0;i<n;i++){
        const term=C[i]*C[n-1-i];sum+=term;
        steps.push(frame(`C(${n}) 분할 i=${i}`,`왼쪽 ${i}개와 오른쪽 ${n-1-i}개의 독립 모양 수 ${C[i]}×${C[n-1-i]}=${term}을 누적한다.`,2,{n,i,left:C[i],right:C[n-1-i],term,sum},rows(row('C',C),row('기여',[term]),row('누적',[sum]))));
      }
      C[n]=sum;
      steps.push(frame(`C(${n}) 확정`,`모든 루트 분할 기여 합 ${sum}을 ${memoMode?'cache':'표'}에 저장한다.`,3,{n,value:sum,C:C.slice()},rows(row('n',C.map((_,i)=>i)),row('C(n)',C,[n]))));
    }
    return traced(memoMode?'lec04-catalan-memo-full':'lec04-catalan-table-full',memoMode?'Catalan: 메모 재귀 항 누적':'Catalan: 표의 루트 분할 누적','빈 BST의 한 가지를 C0=1로 두고 C1..C5 각 왼쪽 크기 분할을 실제 합산한다.','Cn=Σ C[i]C[n−1−i]',['각 루트 크기 i','왼쪽 경우×오른쪽 경우','모든 분할 합산'],steps,`C5=${C[5]}`,C[5],42);
  };
  const catalanMemoRecursive=()=>{
    const cache=new Map([[0,1]]),steps=[];
    const C=n=>{
      if(cache.has(n)){steps.push(frame(`C(${n}) hit`,`cache C(${n})=${cache.get(n)}를 재사용한다.`,0,{n,hit:true,value:cache.get(n)},rows(row('cache n',[...cache.keys()]),row('cache C',[...cache.values()]))));return cache.get(n);}
      let sum=0;
      for(let i=0;i<n;i++){const left=C(i),right=C(n-1-i),term=left*right;sum+=term;steps.push(frame(`C(${n}), i=${i}`,`왼쪽 ${i}개×오른쪽 ${n-1-i}개: ${left}×${right}=${term}, 누적 ${sum}.`,2,{n,i,left,right,term,sum},rows(row('cache n',[...cache.keys()]),row('cache C',[...cache.values()]),row('현재 합',[sum]))));}
      cache.set(n,sum);steps.push(frame(`C(${n}) 저장`,`루트 분할 합 ${sum}을 cache에 저장한다.`,3,{n,value:sum},rows(row('cache n',[...cache.keys()]),row('cache C',[...cache.values()]))));return sum;
    };
    const actual=C(5),independent=[1,1,2,5,14,42][5];
    return traced('lec04-catalan-memo-full','Catalan: 메모 재귀 분할 trace','C(5)를 재귀로 계산하며 기저 hit, 각 루트 분할 곱, 상태 저장을 프레임으로 만든다.', 'C0=1; Cn=ΣCi*C(n−1−i)',['cache에 있으면 반환','각 i 분할을 재귀 계산','왼쪽×오른쪽 더하기','합을 cache에 저장'],steps,`C5=${actual}`,actual,independent);
  };
  const tileSquareVariant=()=>{
    const G=[1,1],steps=[];
    for(let n=2;n<=5;n++){
      G[n]=G[n-1]+2*G[n-2];
      steps.push(frame(`G(${n})`,`${G[n-1]}+2×${G[n-2]}=${G[n]}; 폭 2의 완성 방법 두 종류가 계수 2를 만든다.`,1,{n,G:G.slice()},rows(row('폭',G.map((_,i)=>i)),row('경우 수',G,[n]))));
    }
    return traced('lec04-tiling-square-full','TILING2 변형: 2×2 타일 포함','본문의 기출 변형 점화식을 폭 2..5에서 한 단계씩 적용한다.','도미노와 2×2 정사각 타일; G0=G1=1',['G0=G1=1','G(n)=G(n-1)+2G(n-2)'],steps,`G(5)=${G[5]}`,G[5],21);
  };

  const dynamicDPBasics=[chooseNaiveFull(),chooseMemoFull(),chooseFull(),chooseTwoRowsFull(),chooseRightToLeft()];
  const dynamicPoly=[polyMemoRecursive(),polyBuild(true)];
  const dynamicCatalan=[catalanMemoRecursive(),catalanBuild(false)];
  const triangleRebuildFull=()=>{
    const T=[[1],[1,1],[1,1,1]],D=[[3],[2,2],[1,1,1]],path=[[0],[0,0],[0,0,0]],steps=[];let x=0,route=[];
    for(let y=T.length-2;y>=0;y--)for(let c=0;c<=y;c++){
      const a=D[y+1][c],b=D[y+1][c+1];path[y][c]=a>b?-1:a<b?1:0;
      steps.push(frame(`path[${y}][${c}]`,a===b?'두 자식 미래값이 같아 path=0으로 기록한다. 복원 tie-break는 오른쪽이다.':`아래 ${a}, 오른쪽 ${b} 중 큰 쪽 표시 ${path[y][c]}를 기록한다.`,1,{y,x:c,down:a,right:b,choice:path[y][c],path:path.map(r=>r.slice())},grid(D.map(r=>r.slice()),[[y,c]])));
    }
    for(let y=0;y<T.length;y++){
      route.push(T[y][x]);
      steps.push(frame(`경로 행 ${y}`,`현재 x=${x}의 값을 경로에 넣는다.`,3,{y,x,route:route.slice()},grid(T.map(r=>r.slice()),[[y,x]])));
      if(y<T.length-1&&path[y][x]>=0)x++;
    }
    return traced('lec05-triangle-reconstruction-full','삼각형: path 칸 계산과 실제 복원','본문 tie-break 규칙으로 모든 비기저 선택표를 채운 뒤 각 행을 따라간다.',`T=[[1],[1,1],[1,1,1]]`,['미래 합 비교해 path 저장','path<0이면 아래','path≥0이면 오른쪽','경로 값을 차례로 기록'],steps,`최댓값 3, 경로 ${route.join('→')}`,{value:3,route}, {value:3,route:[1,1,1]});
  };
  const primHeapGenerated=()=>{
    const ns=[{id:'A',label:'A',x:100,y:150},{id:'B',label:'B',x:270,y:70},{id:'C',label:'C',x:270,y:230},{id:'D',label:'D',x:500,y:150}],es=[['A','B',2],['A','C',5],['B','C',1],['B','D',4],['C','D',3]],q=[[0,'A','-']],seen=new Set(),picked=[],steps=[];let total=0;
    while(q.length){
      q.sort((a,b)=>a[0]-b[0]||a[1].localeCompare(b[1]));
      const [w,u,p]=q.shift();
      if(seen.has(u)){
        steps.push(frame(`오래된 ${u}:${w} 후보`,`${u}는 이미 MST에 있어 이 중복 후보를 버리고 비용에 더하지 않는다.`,2,{u,w,parent:p,skip:true,queue:q.map(x=>x.slice())},rows(row('힙 pop',[`${u}:${w}`]),row('MST 정점',[...seen]))));
        continue;
      }
      seen.add(u);total+=w;if(p!=='-')picked.push([p,u,w]);
      const graphState=graph(ns.map(n=>({...n,done:seen.has(n.id),active:n.id===u})),es.map(([a,b,c])=>({from:a,to:b,label:String(c),done:p!=='-'&&((a===p&&b===u)||(a===u&&b===p))})));
      steps.push(frame(`${u} pop·추가`,`최솟값 후보 ${u}:${w}를 확정하고 ${w}를 누적한다.`,1,{u,w,parent:p,total,queue:q.map(x=>x.slice())},graphState));
      for(const [a,b,c]of es){
        const v=a===u?b:b===u?a:null;
        if(v&&!seen.has(v)){
          q.push([c,v,u]);
          steps.push(frame(`push ${u}→${v}:${c}`,'현재 정점의 경계 간선을 힙 후보에 추가한다. 같은 정점의 중복 후보는 pop 때 visited로 거른다.',3,{u,v,w:c,queue:q.map(x=>x.slice())},rows(row('heap 후보',q.map(x=>`${x[1]}:${x[0]}(${x[2]})`)),row('visited',[...seen]))));
        }
      }
    }
    return traced('lec06-prim-heap-full','Prim 힙: 후보 push/pop 전체 trace','고정 4정점 그래프에서 각 경계 후보를 push하고 pop하며 중복 방문 후보를 건너뛴다.','AB2,AC5,BC1,BD4,CD3',['(0,A) push','최소 후보 pop','이미 방문이면 skip','새 정점의 경계 후보 push'],steps,`MST ${picked.map(e=>e[0]+e[1]+':'+e[2]).join(',')}, 비용 ${total}`,{total,edges:picked.map(e=>e[2]).sort((a,b)=>a-b)},{total:6,edges:[1,2,3]});
  };
  const dynamicHuffman=[huffmanGenerated(),huffmanEncodeFull(),huffmanDecodeFull(),huffmanRebuildFull()];
  const dynamicPrim=[primGenerated(false),primHeapGenerated(),kruskalGenerated()];
  const dynamicLan=[lanGenerated(false),lanGenerated(true)];
  const dynamicStrjoin=[strjoinGenerated()];
  const dynamicMatchorder=[matchGenerated()];
  const dynamicGreedy=[greedyCoins(),shortestCounter];
  const expectedDPBasics=dynamicDPBasics;
  for(const obsolete of ['lec04/dp','lec05/dp','lec06/mst'])delete window.ALGO_MOTION[obsolete];
  Object.assign(window.ALGO_MOTION,{
    'lec04/dp-basics':expectedDPBasics,
    'lec04/triangle':[triangleFull(),triangleCompressed()],
    'lec04/tiling':tilingDynamic.concat([tileSquareVariant()]),
    'lec04/poly':dynamicPoly,
    'lec04/catalan':dynamicCatalan,
    'lec05/reconstruct':[triangleRebuildFull()],
    'lec05/packing':[packCompare],
    'lec05/packing-cost':[packingMemoGenerated(),packingGenerated(),packingOneRow()],
    'lec05/lis':[lisDirectionScene(false),lisDirectionScene(true),lisRebuildFull()],
    'lec05/lis-fast':[tailsFull()],
    'lec05/klis':[klisFull()],
    'lec06/greedy':dynamicGreedy,
    'lec06/matchorder':dynamicMatchorder,
    'lec06/strjoin':dynamicStrjoin.concat([orderedDP]),
    'lec06/huffman-tree':[huffmanGenerated(),huffmanRebuildFull()],
    'lec06/huffman-code':[huffmanEncodeFull(),huffmanDecodeFull()],
    'lec06/prim':dynamicPrim,
    'lec06/lan':dynamicLan,
  });
})();
