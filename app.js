const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.appendChild(e);setTimeout(()=>e.remove(),1800)}
$('#tabs').onclick=e=>{const b=e.target.closest('button');if(!b)return;document.body.dataset.tab=b.dataset.v;$$('#tabs button').forEach(x=>x.classList.toggle('on',x===b));$$('.view').forEach((v,i)=>v.classList.toggle('on',i==b.dataset.v));scrollTo(0,0)};
const DW=['월','화','수','목','금','토','일'],DN=DW.slice(0,5);
let lowfm=false,phase=null,consent=false,water=0,steps=0,synced=false,exDone=false,claimed=false,badged=false;
let G={kg:5,weeks:8,water:2000,steps:5000,meals:3};
const SVDEF={done:false,skip:false,diet:'mix',sched:'day',meals:3,stage:'new',cook:'cook',hard:'none',gut:false,avoid:[],past:[],goals:[],view:'trend'};
let SV={...SVDEF};
/* 추구미 테마 (설문과 분리) — 이름·해시태그는 여기서만 관리하고, 색·모양은 style.css의 [data-theme] 토큰 */
const THEMES={minimal:{n:'클린 미니멀',tags:['#클린걸','#꾸안꾸']},y2k:{n:'Y2K',tags:['#하이틴','#키치']},romantic:{n:'내추럴 로맨틱',tags:['#어른여자','#한유주코어']},vintage:{n:'빈티지',tags:['#다꾸','#스크랩북']}};
// 예전 테마 이름 → 새 테마
const THMIG={natural:'romantic',ballet:'romantic',oldmoney:'vintage',gorp:'minimal'};
let thm='minimal',thmSet=false,scm='';// scm: 화면 모드 ''(시스템)|'light'|'dark'
const sysDark=matchMedia('(prefers-color-scheme: dark)');
const curMode=()=>scm||(sysDark.matches?'dark':'light');
// 다크 모드에서는 테마와 상관없이 무채색 다크(클린 미니멀)로 보여 준다. 고른 테마는 그대로 저장
const effTh=(mode)=>(mode||curMode())=='dark'?'minimal':thm;
const combo=()=>(SV.done?TY[typeOf()].e+' '+TY[typeOf()].n:'내 루틴')+' × '+THEMES[thm].n;
function applyTheme(){const r=document.documentElement;if(!THEMES[thm])thm='minimal';r.setAttribute('data-theme',effTh());r.setAttribute('data-mode',curMode());
 const m=$('meta[name="theme-color"]');if(m)m.content=getComputedStyle(r).getPropertyValue('--bg').trim();
 $$('[data-md]').forEach(b=>b.classList.toggle('on',b.dataset.md===scm));thUI()}
// 미리보기 카드는 각자 data-theme을 달아 그 테마 색으로 그려진다
function thUI(){const md='light',html=Object.entries(THEMES).map(([k,t])=>`<button class="thc ${k==thm?'on':''}" data-th="${k}" data-theme="${k}" data-mode="${md}"><span class="thsw"><i style="background:var(--bg)"></i><i style="background:var(--accent)"></i><i style="background:var(--accent-soft)"></i><i style="background:var(--c-sky)"></i></span><b>${k==thm?'✓ ':''}${t.n}</b><small>${t.tags.join(' ')}</small></button>`).join('');
 ['#thlist','#thplist'].forEach(sel=>{const e=$(sel);if(!e)return;e.innerHTML=html;e.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{thm=b.dataset.th;thmSet=true;applyTheme();if(typeof posterUI==='function')posterUI();saveState()})})}
let thpFrom=false;
function thpOpen(fromSv){thpFrom=!!fromSv;$('#thpstep').textContent=fromSv?'다음 단계 · 내 앱 꾸미기':'내 앱 꾸미기';$('#thpok').textContent=fromSv||!profileDone?'다음: 기본 정보':'이 테마로 할게요';thUI();$('#thp').hidden=false;$('#thp').scrollTop=0}
/* survey · 식단 타입 */
// 식단 스타일(탄수 균형 vs 저탄수·고단백 선호) × 생활 리듬(주간 고정 vs 유연) → 동물 4타입. 정체기·비건·끼니 수 등은 타입 위 보정값.
const LC=()=>SV.diet=='lowcarb';
const typeOf=(a=SV)=>{const f=a.diet=='lowcarb',r=a.sched=='day';return f?(r?'lion':'owl'):(r?'bear':'squirrel')};
const TY={
 bear:{e:'🐻',n:'곰형',t:'든든한 세 끼 균형형',d:'정해진 시간에 밥·단백질·채소를 고루 먹을 때 가장 잘 맞아요.',tips:['끼니마다 밥 ⅔공기 + 단백질 1 + 채소 2','아침을 거르지 않아야 저녁 과식이 줄어요','저녁은 잠들기 3시간 전에 마무리해요']},
 squirrel:{e:'🐿️',n:'다람쥐형',t:'비축 도시락형',d:'생활 시간이 들쭉날쭉해서, 미리 소분해 두고 나눠 먹을 때 잘 맞아요.',tips:['일어나서 1~2시간 안에 첫 끼를 먹어요','3~4시간 간격으로 조금씩 나눠 먹어요','가방에 비상 간식(두유·삶은 달걀·견과)을 챙겨요']},
 lion:{e:'🦁',n:'사자형',t:'단백질 사냥형',d:'고기·생선·달걀로 든든하게 먹을 때 만족도가 높아요.',tips:['끼니마다 단백질과 채소를 먼저 먹어요','고기·생선은 굽거나 삶고, 지방은 올리브유·견과·생선으로 채워요']},
 owl:{e:'🦉',n:'부엉이형',t:'내 리듬 단백질형',d:'근무·생활 리듬에 맞춰 단백질 위주로 간단히 챙길 때 잘 맞아요.',tips:['끼니 시간은 시계 말고 일어난 시각 기준으로 잡아요','근무 중엔 달걀·그릭요거트·두부 같은 단백질 간식을 챙겨요','퇴근 후 잠들기 전 끼니는 가볍게 먹어요']}};
const SCH={day:{n:'주간 고정',en:['BREAKFAST','LUNCH','DINNER','SNACK'],m:['아침','점심','저녁','간식'],w:['점심','저녁'],last:'8시 전'},
 free:{n:'프리랜서·불규칙',en:['MEAL 1','MEAL 2','MEAL 3','SNACK'],m:['첫 끼','둘째 끼','셋째 끼','간식'],w:['둘째 끼','셋째 끼'],last:'잠들기 3시간 전'},
 shift:{n:'교대 근무',en:['PRE-SHIFT','ON SHIFT','AFTER SHIFT','SNACK'],m:['근무 전','근무 중','근무 후','비상 간식'],w:['근무 중','근무 후'],last:'가볍게'},
 night:{n:'야간 고정',en:['PRE-SHIFT','ON SHIFT','AFTER SHIFT','SNACK'],m:['출근 전','근무 중','퇴근 후','비상 간식'],w:['근무 중','퇴근 후'],last:'가볍게'}};
const DIETN={mix:'🍚 일반식',vegan:'🌱 비건·채식',lowcarb:'🥩 저탄수·고단백'};
const DIETM={
 mix:[['그릭요거트+바나나','또는 달걀2+고구마'],['밥 ⅔공기+단백질 1','+채소 2 도시락'],['밥 ⅔공기+단백질 1','채소 듬뿍'],['두유+견과 한 줌','근력 운동 날 쉐이크']],
 vegan:[['두유 오트밀+바나나','또는 두부 스크램블+토스트'],['현미밥 ⅔+두부·템페','+채소 2 도시락'],['잡곡밥 ⅔+콩·렌틸 요리','채소 듬뿍'],['두유+견과 한 줌','에다마메 한 컵']],
 lc:[]};
// 저탄수·고단백 선호: 탄수를 밥에 고정하지 않고 날마다 바꿔 제안하되, 끼니마다 탄수 1은 꼭 넣는다(130g 하한)
const CBM=['고구마 1개','감자 1개','단호박 1컵','현미밥 ½공기','귀리밥 ½공기','퀴노아 ½컵'],CBB=['고구마 1개','바나나 1개','귀리 ½컵','통밀빵 1장'],CBS=['바나나','사과','베리 한 컵','귤 2개'];
function lcM(){const d=todayIdx;return [['달걀2+아보카도','+'+CBB[d%4]],['단백질 1.5+채소 2','+'+CBM[d%6]],['생선·고기+채소 듬뿍','+'+CBM[(d+3)%6]],['그릭요거트+견과','+'+CBS[d%4]]]}
const dietM=()=>LC()?lcM():DIETM[SV.diet=='vegan'?'vegan':'mix'];
const AVN={d:'유제품',e:'달걀',n:'견과·땅콩',s:'갑각류',w:'밀가루'};
// 3단계: 0 생활 → 1 몸과 마음 → 2 나다움. req=필수(건너뛰기 없음)
const SVST=['생활','몸과 마음','나다움'];
const SVQ=[
 {st:0,req:1,k:'diet',q:'평소 어떤 식단이 가장 편하세요?',o:[['mix','🍚','일반식','가리는 것 없이 다 먹어요'],['vegan','🌱','비건·채식','고기·생선을 먹지 않아요'],['lowcarb','🥩','저탄수·고단백 선호','탄수는 적게, 단백질은 넉넉히 먹는 게 편해요']]},
 {st:0,req:1,k:'sched',q:'하루 생활 리듬은 어떤가요?',d:'끼니 시간을 내 리듬에 맞춰 짜 드려요.',o:[['day','🏢','주간 고정','출퇴근 시간이 거의 일정해요'],['free','💻','프리랜서·불규칙','일어나고 일하는 시간이 날마다 달라요'],['shift','🔄','교대 근무','2교대·3교대로 근무 시간이 바뀌어요'],['night','🌙','야간 고정','밤에 일하고 낮에 자요']]},
 {st:0,req:1,k:'meals',q:'하루에 보통 몇 번 먹나요?',o:[[2,'🍙','1~2끼','끼니를 자주 거르는 편이에요'],[3,'🍱','3끼','보통 세 끼를 먹어요'],[4,'🥨','조금씩 자주','간식까지 4번 이상 먹어요']]},
 {st:0,req:1,k:'cook',q:'평일 식사는 주로 어떻게 해결하나요?',o:[['cook','🍳','직접 요리·도시락',''],['conv','🏪','편의점·배달',''],['out','🍽️','구내식당·외식','']]},
 {st:1,k:'stage',q:'지금 다이어트는 어느 단계인가요?',o:[['new','🌱','이제 시작해요',''],['going','📉','잘 빠지고 있어요',''],['plateau','⏸️','4주 넘게 몸무게가 그대로예요','정체기'],['yoyo','🔁','빠졌다 다시 찌는 걸 반복했어요','요요']]},
 {st:1,k:'hard',q:'가장 무너지기 쉬운 순간은 언제예요?',o:[['sweet','🍫','오후에 단 게 당겨요',''],['binge','🍕','굶다가 몰아먹어요',''],['late','🌃','밤에 야식이 당겨요',''],['drink','🍻','회식·술자리가 많아요',''],['stress','😮‍💨','스트레스·감정적으로 먹을 때',''],['pms','🌙','생리 전 식욕이 늘 때',''],['none','🙂','딱히 없어요','']]},
 {st:1,k:'gut',q:'우유·콩·밀가루·양파 등을 먹으면 배가 자주 불편한가요?',d:'“네”를 고르면 고포드맵 메뉴를 빼 드려요. 장 민감 정보로 이 기기에만 저장되고, 설정에서 언제든 지울 수 있어요.',o:[[true,'😣','네, 자주 그래요',''],[false,'🙆','아니요·잘 모르겠어요','']]},
 {st:1,k:'avoid',multi:1,q:'못 먹거나 피해야 하는 음식이 있나요?',d:'여러 개 고를 수 있어요. 알레르기 정보는 이 기기에만 저장되고 설정에서 지울 수 있어요.',o:[['d','🥛','우유·유제품',''],['e','🥚','달걀',''],['n','🥜','견과·땅콩',''],['s','🦐','새우·갑각류',''],['w','🌾','밀가루',''],['none','🙅','없어요','']]},
 {st:1,k:'past',multi:1,q:'다이어트하면서 힘들었던 적이 있나요?',d:'여러 개 고를 수 있어요. 답에 맞춰 팁의 강도와 화면을 바꿔 드려요. 민감정보로 이 기기에만 저장되고 설정에서 지울 수 있어요.',o:[['injury','🩹','부상·통증',''],['hair','💇','탈모·피부 트러블',''],['period','🩸','생리불순',''],['yoyo','🔁','요요',''],['guilt','💭','먹는 것에 대한 강박·죄책감',''],['none','🙂','없어요','']]},
 {st:1,req:1,k:'care',multi:1,q:'지금 해당하는 게 있나요?',d:'이 답은 저장하지 않아요. 결과 화면에서 주의할 점만 알려 드려요.',o:[['preg','🤰','임신 중이거나 수유 중이에요',''],['ed','💬','섭식장애로 진료·상담을 받았거나 받는 중이에요',''],['med','🏥','당뇨·갑상선·다낭성난소증후군 등으로 진료 중이에요',''],['none','🙂','해당 없어요','']]},
 {st:2,k:'goals',multi:1,q:'어떤 변화를 보고 싶어요?',d:'여러 개 고를 수 있어요. 체중보다 다른 변화를 보고 싶다면 첫 화면에서 눈바디로 바로 가게 해 드려요.',o:[['fit','👖','옷 핏',''],['cond','🌿','붓기·컨디션',''],['weight','⚖️','체중',''],['habit','✅','습관 만들기','']]},
 {st:2,k:'view',q:'몸무게 기록은 어떻게 볼까요?',d:'설정에서 언제든 바꿀 수 있어요.',o:[['daily','📈','매일 숫자 보기','하루하루 몸무게 숫자를 봐요'],['trend','📊','주간 평균 추세만','하루 변동 대신 일주일 평균으로 봐요 (기본)'],['hide','🙈','숫자 숨기고 눈바디만','몸무게 숫자는 보지 않고 사진·옷 핏으로 봐요']]}];
const VWN={daily:'매일 숫자 보기',trend:'주간 평균 추세만',hide:'숫자 숨기고 눈바디만'};
const hasP=(a,k)=>(a.past||[]).includes(k);
// 결과 화면·기준 탭 카드에 같이 쓰는 안내 문구
function svNotes(a){const n=[],lc=a.diet=='lowcarb';
 if(hasP(a,'period'))n.push(['warn','🩸 <b>생리불순을 겪었다면 탄수 130g 하한이 특히 중요해요.</b> 탄수와 먹는 양이 크게 부족하면 몸이 에너지를 아끼려고 생리를 늦추거나 멈출 수 있어요. 그래서 이 앱은 어떤 타입이든 탄수를 하루 130g 아래로 안내하지 않고, 끼니마다 탄수 1을 넣어요. 생리불순이 계속되면 산부인과 진료를 권해요.']);
 if(lc&&!hasP(a,'period'))n.push(['','저탄수·고단백을 골라도 이 앱은 탄수화물을 하루 <b>130g 아래로 안내하지 않아요.</b> 여자 몸은 탄수가 부족하면 월경이 불규칙해질 수 있어서예요. 탄수는 꼭 밥이 아니어도 돼요. 고구마·감자·단호박·귀리·과일처럼 좋아하는 걸로 끼니마다 1번씩 넣고, 나머지는 단백질·좋은 지방으로 채워요.']);
 if(a.diet=='vegan')n.push(['','비타민 B12는 식물성 식품으로 채우기 어려워요. 보충제는 전문가와 상의해 주세요. 철분이 많은 콩·시금치는 비타민C(과일·파프리카)와 함께 먹어요.']);
 if(hasP(a,'guilt'))n.push(['soft','💭 먹는 일로 마음이 힘들었다면, 그건 의지가 약해서가 아니에요. 그래서 몸무게 숫자는 숨기고 행동만 체크하도록 맞춰 뒀어요(설정에서 바꿀 수 있어요). 먹는 생각이 하루를 많이 차지하거나 죄책감이 계속된다면, 정신건강의학과나 상담센터에서 편하게 이야기해 보는 것도 좋아요. 혼자 힘들 땐 정신건강 상담전화 1577-0199도 있어요.']);
 const c=a.care||[];
 if(c.includes('preg'))n.push(['warn','임신·수유 중에는 체중 감량 식단을 권하지 않아요. 이 앱의 감량 목표 대신 담당 의료진의 안내를 따라 주세요.']);
 if(c.includes('ed'))n.push(['warn','먹는 걸 기록하거나 목표를 세우는 일이 부담이 될 수 있어요. 이 앱은 칼로리를 보여주지 않지만, 꼭 담당 전문가와 함께 사용해 주세요. 힘들 땐 혼자 버티지 말고 도움을 요청하세요.']);
 if(c.includes('med'))n.push(['warn','진료 중인 질환이 있으면 식단·운동을 바꾸기 전에 담당 의사와 먼저 상의해 주세요.']);
 return n}
function svTips(a){const T=[...TY[typeOf(a)].tips],lc=a.diet=='lowcarb',inj=hasP(a,'injury');
 if(lc)T.push('🍠 탄수 1은 끼니마다 꼭 넣어요. 밥이 아니어도 돼요: 고구마·감자·단호박·귀리·퀴노아·과일 중에서 매일 바꿔 골라요');
 if(a.diet=='vegan')T.push('단백질은 두부·템페·콩·두유를 끼니마다 섞어서 채워요');
 if(inj)T.push('🩹 운동은 통증 없는 범위에서 걷기·스트레칭부터 해요. 점프·달리기·무거운 무게는 쉬고, 통증이 계속되면 진료를 먼저 받아요');
 if(hasP(a,'hair'))T.push('💇 탈모·피부 트러블은 단백질·철분과 먹는 양이 부족할 때 생기기 쉬워요. 단백질 목표와 탄수 하한을 꼭 채워요');
 if(a.stage=='plateau')T.push('⏸️ 정체기엔 더 줄이지 말고 채워요. 덜 먹을수록 근육이 빠지고 정체가 길어질 수 있어요','⏸️ 몸무게는 하루가 아니라 일주일 평균으로 봐요. 수분 때문에 1~2kg은 오르내려요',inj?'⏸️ 걸음은 통증 없는 만큼만, 근력 운동은 가벼운 밴드·맨몸 위주로, 잠 7시간을 먼저 챙겨요':'⏸️ 걸음 +2,000보, 근력 운동 주 2회, 잠 7시간을 먼저 챙겨요');
 if(a.stage=='yoyo'||hasP(a,'yoyo'))T.push('🔁 한 주에 체중의 0.5% 안팎으로 천천히 빼요. 기간을 넉넉히 잡을수록 다시 찌는 위험이 줄어요','🔁 금지보다 “반만 먹고 채우기”로 먹고 싶은 걸 남겨 둬요');
 if(a.meals==2)T.push('끼니가 적으면 단백질을 다 채우기 어려워요. 간식으로 단백질을 한 번 더 넣어요');
 if(a.meals==4)T.push('조금씩 자주 먹을 땐 간식도 단백질 위주로(달걀·요거트·두유) 골라요');
 if(a.cook=='cook')T.push('주말 30분 밀프렙: 단백질 2~3가지를 미리 구워 두면 평일 10분 도시락이 쉬워져요');
 if(a.cook=='conv')T.push(a.diet=='vegan'?'편의점은 두부바·두유 + 컵샐러드 + 주먹밥, 배달은 비건 포케·두부 샐러드를 골라요':lc?'편의점은 닭가슴살·삶은 달걀 + 컵샐러드 + 군고구마 1개, 배달은 샤브샤브·보쌈(밥 반 공기)을 골라요':'편의점은 삶은 달걀 2 + 컵샐러드 + 주먹밥 1, 배달은 샤브샤브·포케·보쌈(밥 반 공기)을 골라요');
 if(a.cook=='out')T.push('구내식당·외식에선 단백질 반찬부터 담고, 국물은 적게, 밥은 ⅔공기로 해요');
 const H={sweet:'오후 3~4시에 단백질 간식(요거트·두유)을 미리 먹으면 단 게 덜 당겨요',binge:'끼니를 거르면 몰아먹기 쉬워요. 첫 끼에 단백질을 꼭 넣어요',late:'저녁에 단백질을 충분히 먹고, 양치를 일찍 하거나 따뜻한 차로 마무리해요',drink:'술자리 전엔 단백질 간식, 술 한 잔에 물 한 잔, 안주는 단백질·채소 위주로 골라요',
  stress:'😮‍💨 먹기 전에 “배가 고픈 건지, 마음이 힘든 건지” 10초만 살펴요. 먹는다면 접시에 반만 덜어 천천히 먹고, 산책·샤워·통화처럼 먹지 않고 마음을 푸는 방법도 하나 정해 둬요',
  pms:'🌙 생리 전 식욕이 느는 건 호르몬 때문이라 자연스러워요. 고구마·바나나·요거트 같은 든든한 간식을 미리 챙기고, 참기보다 “반만 먹고 채우기”로 먹어요'};
 if(H[a.hard])T.push(H[a.hard]);return T}
function svBadges(a){const b=[DIETN[a.diet],SCH[a.sched].n];if(a.stage=='plateau')b.push('⏸️ 정체기 모드');if(a.stage=='yoyo')b.push('🔁 천천히 모드');if(hasP(a,'injury'))b.push('🩹 저강도 운동');if((a.avoid||[]).length)b.push('🚫 '+a.avoid.map(k=>AVN[k]).join('·'));b.push('👀 '+VWN[a.view||'trend']);return b.map(x=>`<span class="svbadge">${x}</span>`).join('')}
let svA=null,svI=0,svT=new Set();
function svOpen(){svA=JSON.parse(JSON.stringify({...SVDEF,...SV}));svA.care=[];svI=0;svT=new Set();svDraw();$('#sv').hidden=false;$('#sv').scrollTop=0}
// 설문을 마치면(또는 건너뛰면) 내 앱 꾸미기 → 기본 정보 순서로 이어진다
function svClose(){$('#sv').hidden=true}
function svDraw(){const box=$('#svin');
 if(svI>=SVQ.length){const ty=TY[typeOf(svA)];
  box.innerHTML=`<div class="svres deco tape"><div class="svsheet"><div class="sub">나의 식단 타입은</div><div class="svbig">${ty.e}</div><div class="svq" style="margin-top:4px">${ty.n} <span class="sub" style="font-size:16px">${ty.t}</span></div><div class="sub">${ty.d}</div><div class="svcombo">${ty.e} ${ty.n} × ${THEMES[thm].n}</div><div class="svbadges">${svBadges(svA)}</div></div></div>
  <div class="svnote"><b>이렇게 먹어요</b><ul>${svTips(svA).map(t=>`<li>${t}</li>`).join('')}</ul></div>
  ${svNotes(svA).map(([c,t])=>`<div class="svnote ${c}">${t}</div>`).join('')}
  <button class="pri" id="svok" style="width:100%;margin-top:16px;padding:12px">다음: 내 앱 꾸미기</button>
  <button id="svre" style="width:100%;margin-top:8px">처음부터 다시 하기</button>
  <div class="sub" style="margin-top:10px">성향에 맞춰 식단을 고르기 쉽게 나눈 참고용 분류예요. 진단이 아니에요.</div>`;
  $('#svok').onclick=svApply;$('#svre').onclick=()=>{svI=0;svT=new Set();svDraw()};return}
 const Q=SVQ[svI],v=svA[Q.k],on=o=>Q.multi?(o==='none'?(svT.has(Q.k)||!Q.req)&&!v.length:v.includes(o)):v===o;
 const next=()=>{svI++;svDraw();$('#sv').scrollTop=0};
 box.innerHTML=`<div class="svtop"><button id="svback">${svI?'‹ 이전':''}</button><span class="sub">${svI+1} / ${SVQ.length}</span><button id="svskip">나중에 할게요</button></div>
  <div class="svsteps">${SVST.map((n,i)=>`<span class="${i==Q.st?'on':i<Q.st?'done':''}">${i<Q.st?'✓ ':''}${i+1}. ${n}</span>`).join('')}</div>
  <div class="bar" style="margin-top:8px"><i style="width:${svI/SVQ.length*100}%"></i></div>
  <div class="svq">${Q.q}${Q.req?'<span class="svreq">필수</span>':''}</div>${Q.d?`<div class="sub">${Q.d}</div>`:''}
  ${Q.o.map(([val,e,t,s],i)=>`<button class="svo ${on(val)?'on':''}" data-i="${i}"><span class="e">${e}</span><span><b>${t}</b>${s?`<small>${s}</small>`:''}</span></button>`).join('')}
  ${Q.multi?`<button class="pri" id="svnext" style="width:100%;margin-top:14px;padding:12px" ${Q.req&&!svT.has(Q.k)?'disabled':''}>다음</button>`:''}
  ${Q.req?'':'<button id="svpass" style="width:100%;margin-top:8px">건너뛰기</button>'}`;
 $('#svback').onclick=()=>{if(svI){svI--;svDraw()}};
 $('#svskip').onclick=()=>{if(!SV.done)SV.skip=true;svClose();tyUI();thpOpen(true)};
 if(!Q.req)$('#svpass').onclick=next;
 $$('#svin .svo').forEach(b=>b.onclick=()=>{const val=Q.o[+b.dataset.i][0];svT.add(Q.k);
  if(Q.multi){svA[Q.k]=val==='none'?[]:v.includes(val)?v.filter(x=>x!==val):[...v,val];
   // 강박·죄책감을 고르면 기록 보기 기본값을 '숫자 숨김'으로(직접 고른 적이 없을 때만)
   if(Q.k=='past'&&!svT.has('view'))svA.view=hasP(svA,'guilt')?'hide':(SV.view||'trend');svDraw()}
  else{svA[Q.k]=val;next()}});
 if(Q.multi)$('#svnext').onclick=next}
function svApply(){const prev=SV.done?TY[typeOf()].n:null;const{care,...a}=svA;SV={...SVDEF,...a,done:true,skip:false};
 lowfm=SV.gut;$$('.lowfm').forEach(x=>x.checked=lowfm);$('#c2').checked=lowfm;
 // 필수 식단 기록은 최대 3번(간식까지 기록하라고 하지 않음). '조금씩 자주'는 팁으로만 반영
 G.meals=Math.min(3,SV.meals);$('#gm').value=G.meals;
 const ty=TY[typeOf()];logChg(prev&&prev!=ty.n?`식단 타입 ${prev}→${ty.n}`:`식단 타입: ${ty.n}`);G0={...G};
 applyLow();wmenu();calc();goalMsg();refresh();tyUI();svClose();scrollTo(0,0);thpOpen(true)}
function tyUI(){const e=$('#tycard');if(!e)return;
 if(!SV.done){e.innerHTML=`<summary><div><h2>내 식단 타입 찾기</h2><div class="sub">1분 설문으로 식단 구성을 나에게 맞춰요</div></div></summary><button class="pri" id="tygo" style="width:100%">설문 시작하기</button>`;$('#tygo').onclick=svOpen;return}
 const ty=TY[typeOf()];
 e.innerHTML=`<summary><div><h2>${ty.e} ${ty.n} · ${ty.t}</h2><div class="sub">${ty.d}</div><div class="svcombo">${combo()}</div></div></summary>
  <div class="svbadges" style="justify-content:flex-start">${svBadges(SV)}</div>
  <ul class="tytips">${svTips(SV).map(t=>`<li>${t}</li>`).join('')}</ul>
  ${svNotes(SV).map(([c,t])=>`<div class="svnote ${c}">${t}</div>`).join('')}
  <button id="tyre" style="width:100%;margin-top:10px">설문 다시 하기</button>`;$('#tyre').onclick=svOpen}
let todayIdx=(new Date().getDay()+6)%7,dayDone=[0,0,0,0,0,0,0],PL={s:[1,4],c:[5]};
/* 1. baseline */
function calc(){
 const age=+$('#age').value,ht=+$('#ht').value/100,wt=+$('#wt').value,pa=+$('#pa').value;
 if(!(age>0&&ht>0&&wt>0)){window.TARGET=null;window.CARBMIN=130;window.PROT=0;$('#calc').innerHTML='<div class="sub">나이·키·몸무게를 입력하면 내 기준이 계산돼요.</div>';$('#csum').textContent='기본 정보를 입력해 주세요';if(typeof posterUI==='function')posterUI();tot();return}
 const eer=Math.round(354-6.91*age+pa*(9.36*wt+726*ht));
 const deficit=deficitOf();const target=Math.max(eer-deficit,1400);
 const carbMin=Math.max(130*4,target*.5);
 const prot=Math.max(50,Math.round(wt*1.2/5)*5);
 let cLo=Math.round(carbMin/4),cHi=Math.round(target*.65/4),fLo=Math.round(target*.15/9),fHi=Math.round(target*.30/9);
 // 저탄수·고단백 선호 타입: 탄수는 하한 130g에 맞추고 나머지를 지방으로
 if(LC()){cLo=130;cHi=150;fLo=Math.round(Math.max(0,target-cHi*4-prot*4)/9);fHi=Math.round(Math.max(0,target-cLo*4-prot*4)/9)}
 window.TARGET=target;window.CARBMIN=cLo;window.PROT=prot;
 $('#calc').innerHTML=`<div class="grid2" style="font-size:13px"><div>탄수화물 <b>${cLo}g 이상</b><div class="sub">넉넉히 ${cLo}–${cHi}g</div></div><div>단백질 <b>${prot}g</b><div class="sub">체중 kg당 약 1.2g</div></div><div>지방 <b>${fLo}–${fHi}g</b><div class="sub">${LC()?'넉넉히 · ':''}견과·생선·올리브유 등 좋은 지방</div></div><div>식이섬유 <b>20g</b><div class="sub">채소 3접시 + 잡곡</div></div></div>
 <div class="sub" style="margin-top:6px">※ 한국인 영양소 섭취기준(2025)의 비율 범위(탄 50–65·단 10–20·지 15–30%)를 바탕으로 하되, 감량 중 근육을 지키려고 단백질은 체중 기준으로 잡은 예시예요. 개인 상태에 맞는 조정은 전문가 상담이 필요해요.${hasP(SV,'period')?'<div class="svnote warn">🩸 생리불순을 겪었다면 탄수 130g 하한이 특히 중요해요. 탄수와 먹는 양이 크게 부족하면 생리가 늦어지거나 멈출 수 있어요.</div>':''}${LC()?' 저탄수·고단백을 골라도 탄수화물은 월경 불순 예방을 위해 130g 아래로 내리지 않아요. 밥 대신 고구마·감자·단호박·귀리·과일로 채워도 돼요.':''}</div>`;
 $('#csum').textContent=`탄수 ${cLo}g↑ · 단백질 ${prot}g · 채소 3접시`;if(typeof posterUI==='function')posterUI();
 tot();
}
['age','ht','wt','pa'].forEach(i=>$('#'+i).oninput=calc);


/* menus */
const POOL={
L:[{n:'닭가슴살 달걀 볼 + 현미밥',al:'e',m:10,k:480,p:34,fm:0},{n:'참치 마요 샌드위치 + 방울토마토',al:'ew',m:8,k:430,p:28,fm:1},{n:'두부 계란 덮밥',al:'e',m:10,k:470,p:30,fm:0},{n:'연어 포케 볼',m:10,k:520,p:30,fm:0},{n:'소고기 야채 비빔밥',al:'e',m:7,k:530,p:29,fm:0},{n:'닭가슴살 월남쌈 + 잡곡밥',m:10,k:450,p:31,fm:1},{n:'오트밀 요거트 볼 + 삶은 달걀',al:'de',m:5,k:400,p:26,fm:1},{n:'새우 달걀 볶음밥',al:'se',m:10,k:500,p:27,fm:0},{n:'병아리콩 샐러드 + 통밀 토르티야',v:1,al:'w',m:8,k:460,p:22,fm:1},{n:'소불고기 쌈 도시락',m:10,k:510,p:32,fm:0},{n:'두부·템페 현미 포케 볼',v:1,m:10,k:480,p:24,fm:0},{n:'렌틸콩 커리 + 현미밥',v:1,m:10,k:500,p:22,fm:1},{n:'두부면 비빔국수 + 에다마메',v:1,m:8,k:430,p:26,fm:0},{n:'병아리콩 후무스 랩 + 채소스틱',v:1,al:'w',m:8,k:460,p:18,fm:1},{n:'소고기 스테이크 샐러드 + 구운 고구마 1개',lc:1,c:40,m:10,k:500,p:36,fm:0},{n:'연어 아보카도 퀴노아 볼',lc:1,c:38,m:10,k:520,p:32,fm:0},{n:'닭다리살 구이 + 달걀 + 단호박 찜',lc:1,c:32,al:'e',m:10,k:510,p:38,fm:0},{n:'고등어구이 + 쌈채소 + 찐 감자 1개',lc:1,c:35,m:10,k:480,p:30,fm:0},{n:'목살 수육 + 쌈채소 + 현미밥 ½공기',lc:1,c:35,m:10,k:520,p:34,fm:0},{n:'닭가슴살 그릭 샐러드 + 통밀 또띠아',lc:1,c:35,al:'dw',m:8,k:470,p:36,fm:1},{n:'참치 달걀 샐러드 + 바나나 1개',lc:1,c:32,al:'e',m:5,k:450,p:32,fm:0}],
D:[{n:'닭가슴살 스테이크 + 구운 채소 + 감자 1개',lc:1,c:35,m:15,k:470,p:38,fm:0},{n:'두부김치 볶음 + 잡곡밥',m:15,k:490,p:28,fm:1},{n:'연어 구이 + 샐러드 + 밥',m:15,k:540,p:36,fm:0},{n:'소고기 야채 볶음 + 밥',m:15,k:520,p:32,fm:0},{n:'순두부찌개 + 밥',al:'e',m:15,k:480,p:26,fm:0},{n:'새우 야채 볶음 + 잡곡밥',al:'s',m:15,k:500,p:30,fm:0},{n:'달걀찜 + 두부 + 나물 + 밥',al:'e',m:12,k:450,p:28,fm:0},{n:'닭볶음탕(소) + 밥 ½',lc:1,c:42,m:20,k:520,p:34,fm:1},{n:'두부 스테이크 + 구운 채소 + 현미밥',v:1,m:15,k:470,p:26,fm:0},{n:'콩불고기 덮밥',v:1,m:15,k:490,p:27,fm:1},{n:'템페 채소 볶음 + 잡곡밥',v:1,m:15,k:480,p:25,fm:0},{n:'채식 버섯 순두부 + 현미밥',v:1,m:15,k:450,p:22,fm:1},{n:'병아리콩 토마토 스튜 + 통밀빵',v:1,al:'w',m:20,k:470,p:20,fm:1},{n:'소고기 채소 구이 + 고구마 1개',lc:1,c:40,m:15,k:500,p:36,fm:0},{n:'연어 스테이크 + 아스파라거스 + 귀리밥 ½공기',lc:1,c:35,m:15,k:510,p:34,fm:1},{n:'닭가슴살 샤브샤브 + 채소 + 단호박',lc:1,c:30,m:15,k:450,p:38,fm:0},{n:'고등어 김치찜 + 현미밥 ½공기',lc:1,c:35,m:20,k:480,p:30,fm:1},{n:'돼지 안심 구이 + 단호박 + 채소',lc:1,c:30,m:15,k:470,p:36,fm:0},{n:'소고기 미역국 + 감자전 1장',lc:1,c:38,m:20,k:500,p:30,fm:0}],
S:[{n:'그릭요거트 + 베리',al:'d',m:2,k:150,c:14,p:15,fm:0},{n:'삶은 달걀 2개 + 방울토마토',al:'e',m:3,k:190,c:6,p:14,fm:0},{n:'고구마 ½ + 우유',al:'d',m:5,k:210,c:40,p:8,fm:0},{n:'두유 + 견과 한 줌',v:1,al:'n',m:1,k:200,c:12,p:10,fm:0},{n:'땅콩버터 토스트 ½ + 바나나',v:1,al:'nw',m:4,k:230,c:32,p:8,fm:1}]};
let wk={L:[0,2,3,4,7],D:[0,2,3,4,5]};
// 메뉴 태그: v 비건, lc 단백·지방 중심(밥 ½ 이하), al 알레르기(d 유제품·e 달걀·n 견과·s 갑각류·w 밀)
const okM=(t,i)=>{const m=POOL[t][i];return !!m&&(!lowfm||!m.fm)&&(SV.diet!='vegan'||m.v)&&(!LC()||m.lc)&&![...(m.al||'')].some(a=>SV.avoid.includes(a))};
const free=(t,ex)=>POOL[t].map((m,i)=>i).filter(i=>!ex.includes(i)&&okM(t,i));
const rnd=a=>a[Math.floor(Math.random()*a.length)];
function applyLow(){['L','D'].forEach(t=>wk[t].forEach((id,i)=>{if(!okM(t,id)){const f=free(t,wk[t]),all=POOL[t].map((m,j)=>j).filter(j=>okM(t,j));wk[t][i]=f.length?rnd(f):all.length?rnd(all):id}}))}
function wmenu(){
 applyLow();if(!$('#wmenu'))return;const sc=SCH[SV.sched]||SCH.day;$('#wmsub').textContent=(SV.sched=='day'?'점심 도시락(10분 안팎)·저녁':sc.w.join('·'))+' 메뉴예요. ↻로 바꿔요.'+(SV.diet=='vegan'?' 🌱 비건 메뉴만 골랐어요.':LC()?' 단백질 중심 메뉴로 골랐어요.':'')+(SV.avoid.length?' 🚫 '+SV.avoid.map(k=>AVN[k]).join('·')+' 제외.':'');
 const row=(t,lab,m,i)=>`<div class="mrow"><span class="sub" style="min-width:52px">${lab}</span><span style="flex:1;min-width:0">${m.n}${m.fm?'<span class="fm">고포드맵 주의</span>':''}<span class="sub"> · 단백질 ${m.p}g${LC()&&m.c?' · 탄수 ~'+m.c+'g':''}</span></span><button data-t="${t}" data-i="${i}" aria-label="메뉴 바꾸기">↻</button></div>`;
 $('#wmenu').innerHTML=DN.map((d,i)=>`<div class="meal" style="display:block"><b>${d}</b>${row('L',`<span class="en">${sc.en[1]} · </span>`+sc.w[0],POOL.L[wk.L[i]],i)}${row('D',`<span class="en">${sc.en[2]} · </span>`+sc.w[1],POOL.D[wk.D[i]],i)}</div>`).join('');
 $$('#wmenu button').forEach(b=>b.onclick=()=>{const t=b.dataset.t,i=+b.dataset.i,f=free(t,wk[t]);if(!f.length)return toast('교체할 메뉴가 없어요');wk[t][i]=rnd(f);wmenu()});
 if(typeof posterUI==='function')posterUI();
}
$$('.lowfm').forEach(c=>c.onchange=()=>{lowfm=c.checked;$$('.lowfm').forEach(x=>x.checked=lowfm);if(lowfm)$('#c2').checked=true;applyLow();wmenu();sens()});

const PMS={crave:['요거트 + 베리 + 견과','다크초콜릿 2조각 + 우유','고구마 ½ + 달걀'],bloat:['바나나 + 무가당 요거트','오이·토마토 + 두부','따뜻한 보리차 + 삶은 달걀'],tired:['달걀 + 통밀빵 ½','두유 + 견과','연어 주먹밥 소형']};
$$('[data-s]').forEach(b=>b.onclick=()=>{$$('[data-s]').forEach(x=>x.classList.toggle('on',x===b));$('#pms').innerHTML='<ul style="margin:6px 0;padding-left:18px;color:var(--ink);font-size:14px">'+PMS[b.dataset.s].map(x=>`<li>${x}</li>`).join('')+'</ul><span class="sub">메뉴 제안일 뿐, 치료·진단이 아니에요.</span>'});
function pmsBn(){if(!$('#pmsbn'))return;$('#pmsbn').innerHTML=(phase=='황체기'||phase=='월경기')?`<b class="ok">지금 ${phase}예요.</b> 증상이 있으면 아래에서 골라보세요.`:'생리주기를 체크하면 해당 시기에 이 메뉴를 먼저 안내해요.'}

/* cycle */
const PH=['월경기','난포기','배란기','황체기','모름/불규칙'];
const PHI={'월경기':['에스트로겐·프로게스테론이 모두 낮은 시기','피로감·아랫배 통증·허리 불편이 올 수 있어요. 출혈로 철분이 빠져나가 어지럽거나 기운이 없을 수 있어요.','무리한 운동보다 걷기·스트레칭으로. 철분(붉은 고기·두부·시금치)과 단백질을 챙기고 끼니는 거르지 않아요.'],
'난포기':['에스트로겐이 서서히 오르는 시기','기분·에너지가 안정되고 운동이 잘 되는 느낌을 받는 사람이 많아요(개인차).','컨디션이 좋아도 평소 루틴을 유지해요. 식사는 규칙적으로.'],
'배란기':['에스트로겐이 정점을 찍고 LH가 급상승해 배란이 일어나는 시기','체온이 약간 오르고 하복부 불편·식욕 변화를 느끼는 사람도 있어요.','불편하면 강도를 낮추고, 물을 충분히 마셔요.'],
'황체기':['프로게스테론이 높아지고 후반에 호르몬이 떨어지는 시기','식욕·단 음식 당김이 늘고, 수분이 몰려 붓거나 체중이 일시적으로 오를 수 있어요(지방이 늘어난 게 아니에요). 졸림·장 예민·PMS(예민함·두통)도 흔해요.','체중 숫자보다 추이를 봐요. 탄수를 억지로 줄이지 말고(하한 유지) 단백질·식이섬유와 PMS 간식 메뉴를 활용해요.'],
'모름/불규칙':['주기가 불규칙하면 호르몬 시기를 단정하기 어려워요','기록을 쌓으면 내 패턴을 볼 수 있어요.','몇 달째 월경이 없거나 매우 불규칙하면 진료 상담을 권해요.']};
function phinfoUI(){const p=PHI[(cyc[key(sim)]||{}).p];$('#phinfo').innerHTML=p?`<div class="advc" style="margin-top:8px"><b>${phase}</b><div class="sub" style="margin-top:4px">🧬 ${p[0]}</div><div class="sub" style="margin-top:4px">🫧 ${p[1]}</div><div class="sub" style="margin-top:4px">🌿 ${p[2]}</div><div class="sub" style="margin-top:6px;opacity:.8">일반적인 경향이며 개인차가 커요. 진단이 아니에요.</div></div>`:(consent?'<div class="sub" style="margin-top:8px">주기를 누르면 그 시기의 호르몬과 몸 상태를 간단히 알려줘요.</div>':'')}
function phasesUI(){phinfoUI();
 $('#phases').innerHTML=PH.map(p=>`<button class="chip ${(cyc[key(sim)]||{}).p==p?'on':''}" data-p="${p}" ${consent?'':'disabled style="opacity:.5"'}>${p}</button>`).join('');
 $$('#phases button').forEach(b=>b.onclick=()=>{const p=b.dataset.p,k=key(sim);if((cyc[k]||{}).p==p)delete cyc[k];else cyc[k]={t:new Date(sim.getFullYear(),sim.getMonth(),sim.getDate()).getTime(),p};phase=(cyc[k]||{}).p||((typeof cyPhase=='function'&&cyPhase(sim.getTime()))||{}).p||null;phasesUI();pmsBn();sens();upd();saveState()});
 $('#phnote').innerHTML=(consent?'직접 고른 날은 예측보다 우선해서 체중 그래프에 겹쳐 보여요. ':'')+'주기에 따라 <b>식단·운동 목표를 자동으로 바꾸진 않아요</b>(근거 부족) · 탄수 하한 130g은 항상 그대로예요. 기록해 두면 PMS 간식 메뉴를 안내해요.';
}
function setConsent(v){consent=v;$('#c1').checked=v;$('#c1x').checked=v;if(!v&&(Object.keys(cyc).length||CY)){cyc={};CY=null;phase=null;toast('동의 철회 → 주기 기록 삭제');upd()}phasesUI();pmsBn();sens();if(typeof cyUI=='function')cyUI();saveState()}
$('#c1x').onchange=e=>setConsent(e.target.checked);$('#c1').onchange=e=>setConsent(e.target.checked);
$('#c2').onchange=e=>{if(!e.target.checked&&lowfm){lowfm=false;SV.gut=false;$$('.lowfm').forEach(x=>x.checked=false);wmenu()}sens()};

/* daily required */
function planned(){const wd=(rd.getDay()+6)%7;return PL.s.includes(wd)?'근력':PL.c.includes(wd)?'유산소':null}
function reqs(){const pl=planned();const r=[{n:'식단 기록 '+G.meals+'번',d:logs.length>=G.meals,s:logs.length+'/'+G.meals},{n:'물 '+(G.water/1000)+'L',d:water>=G.water,s:(water/1000).toFixed(1)+'L'}];
 r.push(pl?{n:pl+' 운동',d:exDone,s:exDone?'완료':'미완료'}:{n:'걸음 '+G.steps.toLocaleString()+'보 (운동 없는 날)',d:steps>=G.steps,s:steps.toLocaleString()+'보'});return r}
function renderReq(){hist[key(rd)]=snap();if(typeof reportUI==='function')reportUI();
 const r=reqs(),h=r.map(x=>`<div class="meal" style="align-items:center"><span>${x.d?'✅':'⬜'} ${x.n}</span><span class="${x.d?'ok':'sub'}">${x.s}</span></div>`).join('');
 $('#req').innerHTML=h;$('#reqt').textContent=dl();
 if(r.every(x=>x.d)){const k=key(rd),had=doneDates[k],nw=stk(k);doneDates[k]=nw;if(!had){markWeek();toast('✅ '+dl()+' 필수 행동 완료! '+nw+' 스티커가 붙었어요')}if(had!=nw)upd()}
 weekP();dateUI();
}
function waterUI(){lockUI()}
function stepsUI(){lockUI();$('#stp').textContent=steps.toLocaleString();$('#stg').textContent=planned()?'운동하는 날엔 참고용':'운동 없는 날 목표 '+G.steps.toLocaleString()+'보';$('#sbar').style.width=Math.min(100,steps/G.steps*100)+'%';}
$('#stok').onclick=()=>{steps=Math.max(0,Math.round(+$('#stin').value||0));$('#stin').value='';stepsUI();renderReq()};
function exUI(){const pl=planned();$('#exinfo').innerHTML=pl?`<div class="row" style="justify-content:space-between"><span>${dl()} 계획: <b>${pl}</b></span><button id="exbtn" class="${exDone?'chip on':''}">${exDone?'✓ 완료':'운동 완료 체크'}</button></div>`:'<div>'+dl()+'은 <b>운동 없는 날</b>이에요 → 걸음 '+G.steps.toLocaleString()+'보가 목표예요.</div>';
 const b=$('#exbtn');if(b)b.onclick=()=>{exDone=!exDone;exUI();renderReq()}}

/* record: mode */
$$('[data-m]').forEach(b=>b.onclick=()=>{$$('[data-m]').forEach(x=>x.classList.toggle('on',x===b));$('#mn').hidden=b.dataset.m!='n';$('#mh').hidden=b.dataset.m!='h'});
const CR={'치킨':{h:'치킨 평소의 ½',add:['샐러드 한 접시'],t:[520,22,38],v:1,e:'🍗',note:'튀김옷은 줄이고 채소로 양 채우기'},
'떡볶이':{h:'떡볶이 ½',add:['삶은 달걀 2개','양배추 샐러드'],t:[440,57,18],v:1,e:'🍢',note:'탄수는 유지하고 단백질·채소 보충'},
'라면':{h:'라면 ½ (국물 적게)',add:['두부 반 모','달걀 + 채소'],t:[480,47,25],v:0.5,e:'🍜',note:'국물은 남기면 나트륨이 줄어요'},
'피자':{h:'피자 2조각',add:['샐러드'],t:[540,62,24],v:1,e:'🍕',note:'치즈 단백질 + 채소 섬유질'},
'짜장면':{h:'짜장면 ½',add:['계란 프라이','샐러드'],t:[480,61,17],v:1,e:'🍝',note:'면 ½로 탄수 절반, 단백질 보충'},
'초콜릿·과자':{h:'소포장 1개',add:['그릭요거트'],t:[260,24,17],v:0,e:'🍫',note:'당 먼저 말고 단백질과 같이'}};
$('#crave').innerHTML=Object.keys(CR).map(k=>`<button class="chip" data-k="${k}">${CR[k].e} ${k}</button>`).join('');
$$('#crave button').forEach(b=>b.onclick=()=>{$$('#crave button').forEach(x=>x.classList.toggle('on',x===b));const k=b.dataset.k,c=CR[k];
 $('#halfout').innerHTML=`<div class="half"><div>${c.h}</div><div class="plus">+</div><div style="background:var(--sky)">${c.add.join('<br>+ ')}</div></div><div class="sub" style="margin-top:8px">${c.note} · 탄 ${c.t[1]}g · 단 ${c.t[2]}g (근사치)</div><button class="pri" id="hadd" style="width:100%;margin-top:8px">이렇게 먹을게요 (기록에 추가)</button>`;
 $('#hadd').onclick=()=>{logs.push({n:`${k} 반만 먹고 채움 (${c.h} + ${c.add.join(', ')})`,k:c.t[0],c:c.t[1],p:c.t[2],v:c.v,e:c.e});tot();toast('기록에 추가했어요')}});

const CAT={
'샌드위치':{'에그샐러드':[420,40,18],'치킨':[450,42,26],'참치':[430,41,24],'BLT':[400,38,17]},
'비빔밥':{'야채':[520,88,16],'소고기':[580,90,24],'참치마요':[600,92,22],'돌솥':[620,98,22]},
'포케':{'연어':[520,60,30],'참치':[480,58,32],'닭가슴살':[470,56,34]},
'김밥':{'일반':[480,78,14],'참치':[520,80,18],'야채':[430,76,10]},
'덮밥·볶음밥':{'제육덮밥':[690,95,28],'불고기덮밥':[640,92,26],'새우볶음밥':[560,85,20]},
'국·정식':{'된장찌개 정식':[610,88,26],'김치찌개 정식':[640,90,28],'순두부 정식':[580,84,24]},
'샐러드':{'닭가슴살':[320,18,34],'연어':[350,16,28],'두부':[290,18,20]},
'면':{'라면':[500,80,10],'짜장면':[700,110,18],'칼국수':[560,95,20],'비빔냉면':[560,105,16],'쌀국수':[480,80,22],'파스타':[620,85,22]},
'분식':{'떡볶이':[520,98,11],'순대':[320,40,14],'튀김':[300,28,6]},
'간식':{'그릭요거트':[130,8,15],'과일':[90,22,1],'견과 한 줌':[170,6,6],'바나나':[100,26,1],'고구마':[130,30,2],'삶은 달걀':[75,1,6],'두유':[130,10,8],'프로틴바':[200,20,15]},
'고기·구이':{'삼겹살':[700,1,34],'제육볶음':[620,22,36],'닭갈비':[560,36,40],'보쌈':[520,4,45],'불고기':[430,20,32]},
'치킨·피자·버거':{'치킨 4조각':[620,22,48],'피자 2조각':[540,62,22],'햄버거':[520,45,24]},
'카페·음료':{'아메리카노':[10,2,1],'카페라떼':[180,14,9],'바닐라라떼':[250,32,8],'과일주스':[150,36,1]},
'밥·반찬':{'공깃밥':[300,66,6],'계란후라이':[95,0,6],'닭가슴살':[110,0,23],'김치':[15,3,1]}};
const SZ={'작게':[300,40,12],'보통':[500,65,20],'크게':[700,90,28]};
const ADD={'샐러드':[40,6,2],'삶은 달걀':[75,1,6],'두부':[90,2,9],'닭가슴살':[110,0,23]};
let cur=null,logs=[];
const UN={'샌드위치':'개','비빔밥':'그릇','포케':'그릇','김밥':'줄','덮밥·볶음밥':'그릇','국·정식':'상','샐러드':'접시','면':'그릇','분식':'접시','간식':'개','고기·구이':'인분','치킨·피자·버거':'인분','카페·음료':'잔','밥·반찬':'인분','기타':'인분'};
const ALI={'계란':'달걀','커피':'아메리카노','라떼':'카페라떼','밥':'공깃밥','치맥':'치킨','국수':'면'};
const POP=[['김밥','일반'],['샐러드','닭가슴살'],['포케','연어'],['샌드위치','에그샐러드'],['비빔밥','야채'],['면','라면'],['카페·음료','아메리카노'],['간식','바나나']];
const fatOf=(k,c,p)=>Math.max(0,Math.round((k-4*c-4*p)/9));
function pick(cat,item){cur={cat,item,por:1,add:[],x:[],size:'보통'};show()}
function renderRes(){const q=($('#fq').value||'').replace(/\s/g,'').toLowerCase(),all=[];
 Object.keys(CAT).forEach(c=>Object.keys(CAT[c]).forEach(i=>all.push([c,i])));
 if(!q){$('#fres').innerHTML='';return}let r;{const qs=[q];if(ALI[q])qs.push(ALI[q]);r=all.filter(([c,i])=>qs.some(t=>(i+c).replace(/\s/g,'').toLowerCase().includes(t))).slice(0,10)}
 const row=([c,i])=>{const v=CAT[c][i];return `<button class="meal" data-c="${c}" data-i="${i}" style="width:100%;text-align:left"><div>${EM[c]} ${c} · <b>${i}</b><div class="sub">1${UN[c]||'인분'} 기준 · 탄 ${v[1]}g · 단 ${v[2]}g · 지 ${fatOf(...v)}g</div></div><span class="sub" style="flex:none">선택</span></button>`};
 $('#fres').innerHTML=(r.length?r.map(row).join(''):'<div class="sub">검색 결과가 없어요.</div>')+(`<button id="fown" style="margin-top:6px;width:100%">“${$('#fq').value.trim()}” 직접 입력해서 기록</button>`);
 $$('#fres [data-c]').forEach(b=>b.onclick=()=>pick(b.dataset.c,b.dataset.i));
 if($('#fown'))$('#fown').onclick=()=>{const n=$('#fq').value.trim();cur={cat:'기타',item:'직접',por:1,add:[],x:[],size:'보통'};show();$('#cname').value=n}}
$('#fq').oninput=renderRes;$('#pkx').onclick=()=>{cur=null;show()};
function show(){
 $('#fsrch').hidden=!!cur;$('#s2').hidden=!(cur&&cur.item=='직접');$('#s3').hidden=!(cur&&cur.item);
 if(!cur){renderRes();return}
 $('#pk').textContent=cur.item=='직접'?'🍽️ 직접 입력':EM[cur.cat]+' '+cur.cat+' '+cur.item;
 $('#csize').innerHTML=Object.keys(SZ).map(k=>`<button class="chip ${cur.size==k?'on':''}" data-z="${k}">${k}</button>`).join('');
 $$('#csize button').forEach(b=>b.onclick=()=>{cur.size=b.dataset.z;show()});
 const u=UN[cur.cat]||'인분';$('#portions').innerHTML=[.5,1,1.5].map(p=>`<button class="chip ${p==cur.por?'on':''}" data-p="${p}">${p==.5?'반 '+u:p==1?'한 '+u:'한 '+u+' 반'}</button>`).join('');
 $$('#portions button').forEach(b=>b.onclick=()=>{cur.por=+b.dataset.p;show()});
 $('#adds').innerHTML=Object.keys(ADD).map(a=>`<button class="chip ${cur.add.includes(a)?'on':''}" data-a="${a}">${cur.add.includes(a)?'− ':'+ '}${a}</button>`).join('');
 $$('#adds button').forEach(b=>b.onclick=()=>{const a=b.dataset.a;cur.add=cur.add.includes(a)?cur.add.filter(x=>x!=a):[...cur.add,a];show()});
 $('#xlist').textContent=cur.x.length?'직접 추가: '+cur.x.join(', ')+' (대략 추정)':'';
 const s=sum(cur);$('#rk').textContent=s[2];$('#rm').textContent=`탄 ${s[1]}g · 지 ${fatOf(...s)}g`+(cur.item=='직접'||cur.x.length?' · 추정':' · 평균치');
}
function base(x){return x.item=='직접'||x.cat=='기타'?SZ[x.size]:CAT[x.cat][x.item]}
function sum(x){if(!x.item)return[0,0,0];const f=base(x);let r=f.map(v=>v*x.por);x.add.forEach(a=>ADD[a].forEach((v,i)=>r[i]+=v));r[0]+=x.x.length*80;r[1]+=x.x.length*8;r[2]+=x.x.length*3;return r.map(Math.round)}
$('#xadd').onclick=()=>{const v=$('#xname').value.trim();if(!v||!cur)return;cur.x.push(v);$('#xname').value='';show()};
$('#save').onclick=()=>{const s=sum(cur);const nm=(cur.item=='직접'||cur.cat=='기타'?($('#cname').value.trim()||'직접 입력 메뉴'):cur.cat+' '+cur.item);logs.push({n:nm+(cur.por!=1?` ×${cur.por}`:'')+(cur.add.length||cur.x.length?' + '+[...cur.add,...cur.x].join(', '):''),k:s[0],c:s[1],p:s[2],v:vegOf(cur),e:EM[cur.cat]});cur=null;$('#fq').value='';$('#cname').value='';show();tot();toast('저장됨')};
function tot(){
 $('#log').innerHTML=logs.length?logs.map((l,i)=>`<div class="meal"><div>${l.e||''} ${l.n}<div class="sub">탄 ${l.c}g · 단 ${l.p}g · 지 ${fatOf(l.k,l.c,l.p)}g</div></div><span class="row" style="gap:4px;flex:none;flex-wrap:nowrap"><button data-f="${i}" aria-label="즐겨찾기">${favs.some(f=>f.n==nm(l))?'★':'☆'}</button><button data-d="${i}">삭제</button></span></div>`).join(''):'아직 기록이 없어요.';
 $$('#log [data-d]').forEach(b=>b.onclick=()=>{logs.splice(+b.dataset.d,1);tot()});
 $$('#log [data-f]').forEach(b=>b.onclick=()=>{const l=logs[+b.dataset.f],i=favs.findIndex(f=>f.n==nm(l));if(i>=0)favs.splice(i,1);else favs.push({...l,n:nm(l)});tot()});
 const c=logs.reduce((a,l)=>a+l.c,0),p=logs.reduce((a,l)=>a+l.p,0),f=logs.reduce((a,l)=>a+fatOf(l.k,l.c,l.p),0),v=logs.reduce((a,l)=>a+(l.v||0),0),cg=window.CARBMIN||130,pg=window.PROT||60;
 const br=(n,a,b,u)=>`<div class="sbar"><span>${n}</span><span class="bar"><i style="width:${Math.min(100,b?a/b*100:0)}%"></i></span><span>${Math.round(a*10)/10}/${b}${u}</span></div>`;
 $('#tot').innerHTML=br('탄수',c,cg,'g')+br('단백질',p,pg,'g')+br('채소',v,3,'접시')+`<div class="sub" style="margin-top:4px">지방 ${f}g · 견과·생선·올리브유 같은 좋은 지방 위주로</div>`+(logs.length>=G.meals&&c<cg?`<div class="sub" style="margin-top:6px">탄수 ${Math.round(c)}g — 하한 ${cg}g 이상을 목표로 해요 (줄이는 게 목표가 아니에요).</div>`:'');
 quickUI();plateUI();renderReq();
}

/* weekly */
function planChips(box){box.innerHTML=[['s','근력'],['c','유산소']].map(([t,n])=>`<div class="sub" style="margin-top:6px">${n}</div><div class="row">${DW.map((d,i)=>`<button class="chip ${PL[t].includes(i)?'on':''}" data-t2="${t}" data-i2="${i}">${d}</button>`).join('')}</div>`).join('');
 box.querySelectorAll('button').forEach(b=>b.onclick=()=>{const t=b.dataset.t2,i=+b.dataset.i2,o=t=='s'?'c':'s';PL[o]=PL[o].filter(x=>x!=i);PL[t]=PL[t].includes(i)?PL[t].filter(x=>x!=i):[...PL[t],i];plBoxes();refresh()})}
function plBoxes(){['#plbox','#oplbox'].forEach(q=>{if($(q))planChips($(q))})}
function weekRender(){
 $('#week').innerHTML=DW.map((d,i)=>{let t='걷기',c='';if(PL.s.includes(i)){t='근력';c='p'}else if(PL.c.includes(i)){t='유산소';c='w'}return `<div class="${c} ${i==todayIdx?'t':''}"><b>${d}</b><br>${t}</div>`}).join('');
 $('#todaylbl').textContent=`오늘은 ${DW[todayIdx]}요일 (테스트는 설정 탭의 '다음 날로'로 넘겨요). 운동 요일은 설정 탭의 '목표 설정'에서 바꿔요.`}
function weekP(){const n=dayDone.reduce((a,b)=>a+b,0);$('#wkn').textContent=n+'/5';$('#wkbar').style.width=Math.min(100,n*20)+'%';
 $('#wkd').innerHTML=DW.map((d,i)=>`<span class="tag" style="background:${dayDone[i]?'var(--leaf-soft)':'var(--bg)'};border:1px solid var(--line)">${d}${dayDone[i]?' ✓':''}</span>`).join('');
 if(n>=5&&!badged){badged=true;weeksDone++;toast('🏅 주간 뱃지 획득!');if(typeof upd==='function')upd()}}

let cycSync=false,cycStart=0,slp={},sleepSync=false,cond={},doneDates={},sim=new Date(),weeksDone=0,wlog=[];
const key=d=>d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
const FOODS=['🥪','🥘','🍣','🍙','🍛','🍲','🥗','🍜','🍢','🥛','🍗','🍕','🍫'],EM={'샌드위치':'🥪','비빔밥':'🥘','포케':'🍣','김밥':'🍙','덮밥·볶음밥':'🍛','국·정식':'🍲','샐러드':'🥗','면':'🍜','분식':'🍢','간식':'🥛','고기·구이':'🥩','치킨·피자·버거':'🍗','카페·음료':'☕','밥·반찬':'🍚','기타':'🍽️'};
let rd=new Date(sim.getFullYear(),sim.getMonth(),sim.getDate()),days={},cyc={},favs=[],simOff=0,wiped=false,profileDone=false,chg=[];
const dl=()=>key(rd)==key(sim)?'오늘':(rd.getMonth()+1)+'/'+rd.getDate();
const nm=l=>l.n.replace(' 📷','');
const tk=k=>{const p=k.split('-');return new Date(+p[0],+p[1]-1,+p[2]).getTime()};
function stash(){days[key(rd)]={logs,water,steps,exDone}}
function setRec(d){stash();rd=new Date(d.getFullYear(),d.getMonth(),d.getDate());const o=days[key(rd)]||{logs:[],water:0,steps:0,exDone:false};logs=o.logs;water=o.water;steps=o.steps;exDone=o.exDone;cur=null;refresh()}
function markWeek(){const a=new Date(sim.getFullYear(),sim.getMonth(),sim.getDate()).getTime(),diff=Math.round((a-rd.getTime())/864e5);if(diff>=0&&diff<=todayIdx)dayDone[(rd.getDay()+6)%7]=1}
function hasRec(d){const k=key(d);if(k==key(rd))return logs.length||water||steps||exDone;const o=days[k];return o&&(o.logs.length||o.water||o.steps||o.exDone)}
function dateUI(){const md=d=>(d.getMonth()+1)+'/'+d.getDate()+'('+DW[(d.getDay()+6)%7]+')';let h='';
 for(let i=0;i<7;i++){const d=new Date(sim.getFullYear(),sim.getMonth(),sim.getDate()-i);h+=`<button class="chip ${key(d)==key(rd)?'on':''}" data-i="${i}">${i==0?'오늘':i==1?'어제':md(d)}${hasRec(d)?' ●':''}</button>`}
 $('#dates').innerHTML=h;
 $$('#dates button').forEach(b=>b.onclick=()=>{const i=+b.dataset.i;setRec(new Date(sim.getFullYear(),sim.getMonth(),sim.getDate()-i))});
 $('#datenote').textContent=key(rd)==key(sim)?'● 표시는 기록이 있는 날이에요. 놓친 날도 눌러서 기억나는 만큼만 남겨요.':`지난 날(${md(rd)}) 기록 중이에요. 괜찮아요, 기억나는 만큼만 남겨요.`;
 $('#condt').textContent=dl()}
function quickUI(){
 const seen=new Set(favs.map(f=>f.n)),rec=[];const add=l=>{const n=nm(l);if(!seen.has(n)&&rec.length<6){seen.add(n);rec.push({...l,n})}};
 [...logs].reverse().forEach(add);Object.keys(days).filter(k=>k!=key(rd)).sort((a,b)=>tk(b)-tk(a)).forEach(k=>[...days[k].logs].reverse().forEach(add));
 const items=[...favs.map(f=>({f,fav:1})),...rec.map(f=>({f}))],sh=n=>n.length>14?n.slice(0,13)+'…':n;
 $('#qrow').innerHTML=items.length?items.map((x,i)=>`<button class="chip" data-q="${i}">${x.fav?'★ ':''}${x.f.e||''} ${sh(x.f.n)}</button>`).join(''):'<span class="sub">기록이 쌓이면 자주 먹은 메뉴가 여기에 나와요.</span>';
 $$('#qrow [data-q]').forEach(b=>b.onclick=()=>{logs.push({...items[+b.dataset.q].f});tot();toast('한 번에 기록했어요')});
 const yk=key(new Date(rd.getFullYear(),rd.getMonth(),rd.getDate()-1)),y=(days[yk]||{}).logs||[],btn=$('#sameyd');
 btn.disabled=!y.length;btn.textContent=(key(rd)==key(sim)?'어제':'전날')+'와 같음'+(y.length?` (${y.length}개)`:' (기록 없음)');
 btn.onclick=()=>{y.forEach(l=>logs.push({...l,n:nm(l)}));tot();toast('전날 기록을 가져왔어요')}}
const SK='dietproto_v1';
function saveState(){if(wiped)return;try{stash();localStorage.setItem(SK,JSON.stringify({SV,thm,thmSet,scm,CY,nb,wsd,profileDone,chg,days,hist,doneDates,cond,wlog,cyc,favs,G,PL,simOff,weeksDone,badged,dayDone,lowfm,consent,wk,synced,sleepSync,slp,cycSync,cycStart,age:$('#age').value,pa:$('#pa').value,ht:$('#ht').value,wt:$('#wt').value}))}catch(e){}}
function loadState(){try{const t=localStorage.getItem(SK);if(!t)return;const o=JSON.parse(t);
 ({SV,thm,thmSet,scm,CY,nb,wsd,profileDone,chg,days,hist,doneDates,cond,wlog,cyc,favs,G,PL,simOff,weeksDone,badged,dayDone,lowfm,consent,wk,synced,sleepSync,slp,cycSync,cycStart}=Object.assign({SV,thm,thmSet,scm,CY,nb,wsd,profileDone,chg,days,hist,doneDates,cond,wlog,cyc,favs,G,PL,simOff,weeksDone,badged,dayDone,lowfm,consent,wk,synced,sleepSync,slp,cycSync,cycStart},o));
 sim=new Date();sim.setDate(sim.getDate()+simOff);todayIdx=(sim.getDay()+6)%7;rd=new Date(sim.getFullYear(),sim.getMonth(),sim.getDate());
 const d0=days[key(rd)];if(d0){logs=d0.logs||[];water=d0.water||0;steps=d0.steps||0;exDone=!!d0.exDone}
 ['age','pa','ht','wt'].forEach(i=>{if(o[i]!=null)$('#'+i).value=o[i]});if(wlog.length)$('#wt').value=wlog[wlog.length-1].v;
 $('#gkg').value=G.kg;$('#gwk').value=G.weeks;$('#gw').value=G.water;$('#gs').value=G.steps;$('#gm').value=G.meals;
 
 // 예전 데이터 변환: 저탄고지·키토·카니보어 → 저탄수·고단백 선호, 새 설문 항목 기본값, 예전 테마 이름
 nb={cloth:'',fit:{},photos:[],...(nb||{})};SV={...SVDEF,...SV};if(['lchf','keto','carn'].includes(SV.diet))SV.diet='lowcarb';if(THMIG[thm])thm=THMIG[thm];
 $$('.lowfm').forEach(x=>x.checked=lowfm);$('#c2').checked=lowfm;$('#c1').checked=consent;$('#c1x').checked=consent}catch(e){}}
function upd(){calUI();chartUI();sumUI();wUI();wsl();stampUI();if(typeof reportUI==='function')reportUI()}
const shown=e=>!e?'':Array.from(e).length>1?'🌟':e;
const STK=[['🥗','균형 식사','탄수 하한·단백질 목표·채소 3회분'],['💪','운동 완료','계획한 운동을 한 날'],['👟','걸음 목표','걸음 목표를 채운 날'],['🌙','숙면','수면 컨디션이 "좋음"인 날'],['⭐','기본','필수 행동 완료 (위 스티커가 없을 때)']];
function stk(k){const h=hist[k],c=cond[k]||{},o=[];if(!h)return '⭐';const pg=(window.PROT||60),cg=window.CARBMIN||130;
 if(h.m>=G.meals&&h.c>=cg&&h.p>=pg&&h.v>=3)o.push('🥗');if(h.pl&&h.ex)o.push('💪');if(h.s>=G.steps)o.push('👟');if(c.s==3)o.push('🌙');return o.length?o.join(''):'⭐'}
function stampUI(){const e=doneDates[key(rd)];$('#stampbox').innerHTML=e?`${dl()}의 스티커 ${Array.from(e).length>1?'· 2개 이상 받아서 🌟 ':''}<span style="font-size:28px;vertical-align:middle">${shown(e)}</span><div class="sub" style="margin-top:4px">${STK.filter(x=>e.includes(x[0])).map(x=>x[0]+' '+x[1]).join(' · ')}</div>`:`<span class="sub">${dl()} 필수 행동을 모두 채우면 스티커가 붙어요. (식사 균형·운동·걸음·수면 기준)</span>`}
/* weight */
function logWeight(v,d){d=d||sim;v=Math.round(v*10)/10;if(!(v>20&&v<300))return false;const k=key(d),e={k,t:new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),v},i=wlog.findIndex(x=>x.k==k);if(i>=0)wlog[i]=e;else wlog.push(e);wlog.sort((a,b)=>a.t-b.t);return true}
function useWeight(){if(!wlog.length)return;$('#wt').value=wlog[wlog.length-1].v;goalMsg();calc()}
const PHC={'월경기':'--blush','난포기':'--sky','배란기':'--lemon','황체기':'--lilac'};
function phaseAtT(t){let b=null;Object.values(cyc).forEach(e=>{if(e.t<=t&&t-e.t<3*864e5&&(!b||e.t>b.t))b=e});if(b)return b.p;const q=typeof cyPhase=='function'&&cyPhase(t);return q&&PHC[q.p]?q.p:null}
function cycleInsight(){if(wlog.length<4||!(Object.keys(cyc).length||(CY&&CY.starts.length)))return '';const t0=wlog[0].t,xs=wlog.map(w=>(w.t-t0)/864e5),ys=wlog.map(w=>w.v),n=ys.length,mx=xs.reduce((a,b)=>a+b)/n,my=ys.reduce((a,b)=>a+b)/n;let sxx=0,sxy=0;xs.forEach((x,i)=>{sxx+=(x-mx)**2;sxy+=(x-mx)*(ys[i]-my)});const b=sxx?sxy/sxx:0,A=[],B=[];
 wlog.forEach((w,i)=>{const p=phaseAtT(w.t);if(!p||p=='모름/불규칙')return;const r=ys[i]-(my+b*(xs[i]-mx));(p=='월경기'||p=='황체기'?A:B).push(r)});
 if(A.length<2||B.length<2)return '';const av=a=>a.reduce((x,y)=>x+y,0)/a.length,d=av(A)-av(B);
 return d>.25?`<div style="margin-top:6px"><b>황체기·월경기</b>에는 추세보다 평균 <b>+${d.toFixed(1)}kg</b> 높게 기록됐어요. 주기 중에는 수분 변화로 체중이 오를 수 있어서, 이 시기 숫자에 너무 흔들리지 않아도 돼요(개인차가 있고, 경향일 뿐이에요).</div>`:'<div style="margin-top:6px">주기에 따른 뚜렷한 체중 차이는 아직 보이지 않아요.</div>'}
function wUIdaily(){
 const n=wlog.length,md=t=>{const d=new Date(t);return (d.getMonth()+1)+'/'+d.getDate()};
 if(!n){$('#wsum').innerHTML='';$('#wchart').innerHTML='';$('#wleg').innerHTML='';$('#wnote').textContent='기록이 없어요. 몸무게를 입력하면 추이가 쌓여요.';return}
 const f=wlog[0],l=wlog[n-1],diff=l.v-f.v,target=f.v-G.kg;
 $('#wsum').innerHTML=`<div>시작 <b>${f.v}kg</b></div><div>현재 <b>${l.v}kg</b></div><div>변화 <b>${diff>0?'+':''}${diff.toFixed(1)}kg</b></div><div>목표 <b>${target.toFixed(1)}kg</b></div>`;
 const vs=wlog.map(x=>x.v).concat(target),lo=Math.min(...vs)-.5,hi=Math.max(...vs)+.5,X0=34,X1=290,Y0=12,Y1=106;
 const t0=f.t,t1=l.t,px=t=>n==1||t1==t0?(X0+X1)/2:X0+(t-t0)/(t1-t0)*(X1-X0),py=v=>Y1-(v-lo)/(hi-lo)*(Y1-Y0);
 let h='';
 if(n>1)for(let t=f.t;t<l.t;t+=864e5){const c=PHC[phaseAtT(t)];if(!c)continue;const xa=px(t),xb=px(Math.min(l.t,t+864e5));if(xb>xa)h+=`<rect x="${xa}" y="${Y0}" width="${xb-xa}" height="${Y1-Y0}" style="fill:var(${c});opacity:.6"/>`}
 h+=`<line x1="${X0}" x2="${X1}" y1="${py(target)}" y2="${py(target)}" stroke-dasharray="4 4" style="stroke:var(--sub)"/><text x="${X1}" y="${py(target)-4}" text-anchor="end" font-size="9" style="fill:var(--sub)">목표 ${target.toFixed(1)}</text>`;
 h+=`<text x="4" y="${Y0+3}" font-size="9" style="fill:var(--sub)">${hi.toFixed(0)}</text><text x="4" y="${Y1}" font-size="9" style="fill:var(--sub)">${lo.toFixed(0)}</text>`;
 if(n>1)h+=`<polyline fill="none" stroke-width="2.5" stroke-linejoin="round" style="stroke:var(--leaf)" points="${wlog.map(x=>px(x.t)+','+py(x.v)).join(' ')}"/>`;
 wlog.forEach(x=>{h+=`<circle cx="${px(x.t)}" cy="${py(x.v)}" r="3.5" style="fill:var(--leaf)"/>`});
 h+=`<text x="${X0}" y="124" font-size="9" text-anchor="start" style="fill:var(--sub)">${md(f.t)}</text>`+(n>1?`<text x="${X1}" y="124" font-size="9" text-anchor="end" style="fill:var(--sub)">${md(l.t)}</text>`:'');
 $('#wchart').innerHTML=h;
 const hasC=Object.keys(cyc).length>0||!!(CY&&CY.starts.length);
 $('#wleg').innerHTML=hasC&&n>1?Object.entries(PHC).map(([p,c])=>`<span class="sub"><i style="display:inline-block;width:10px;height:10px;border-radius:3px;background:var(${c});vertical-align:-1px"></i> ${p}</span>`).join(''):'';
 const days_=(l.t-f.t)/864e5,rate=days_>=7?(f.v-l.v)/(days_/7):null;
 $('#wnote').innerHTML=(rate!=null?`주 평균 ${rate>=0?'−':'+'}${Math.abs(rate).toFixed(2)}kg · `:'')+'몸무게는 하루에도 1–2kg 오르내릴 수 있어요. 한 번의 숫자보다 추이를 봐요.'+(rate!=null&&rate>1?' <b class="bad">주 1kg이 넘는 속도예요. 너무 빠르면 목표 기간을 늘려보세요.</b>':'')+cycleInsight()+(hasC?'':`<div class="sub" style="margin-top:6px">${consent?'기준 탭에서 생리주기를 체크하면 체중 그래프에 겹쳐 보여요.':'주기를 함께 보려면 기준 탭에서 생리주기 저장에 동의하고 체크해요.'}</div>`);
}
$('#wadd').onclick=()=>{const v=+$('#wnew').value;if(!logWeight(v))return toast('몸무게를 확인해 주세요');$('#wnew').value='';useWeight();upd();sens();toast('기록했어요 · '+v+'kg')};
$('#wt').addEventListener('change',()=>{if(logWeight(+$('#wt').value)){upd();sens()}});
$('#wdel').onclick=()=>{if(!wlog.length)return;wlog.pop();useWeight();upd();sens()};
$('#wseed').onclick=()=>{const cur=wlog.length?wlog[wlog.length-1].v:+$('#wt').value;if(!cur){toast('먼저 기본 정보를 입력해 주세요');return}
 for(let ago=42;ago>=3;ago-=3){const d=new Date(sim.getFullYear(),sim.getMonth(),sim.getDate()-ago),cd=(42-ago)%28,p=cd<5?'월경기':cd<13?'난포기':cd<16?'배란기':'황체기',wv=cur+.06*ago+(p=='월경기'||p=='황체기'?.6:0)+(Math.random()-.5)*.3;
  logWeight(wv,d);if(consent)cyc[key(d)]={t:new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime(),p}}
 upd();sens();toast(consent?'체중·주기 예시를 채웠어요':'체중 예시를 채웠어요 (주기는 동의 후 가능)')};
/* weekly report */
let hist={};
function snap(){return{m:logs.length,c:logs.reduce((a,l)=>a+l.c,0),p:logs.reduce((a,l)=>a+l.p,0),v:logs.reduce((a,l)=>a+(l.v||0),0),w:water,s:steps,pl:planned()?1:0,ex:exDone?1:0}}
function dayStat(d){const h=hist[key(d)],c=cond[key(d)]||{},o={};const pg=(window.PROT||60),cg=window.CARBMIN||130;
 if(h){o.meal=h.m>=G.meals;o.water=h.w>=G.water;o.move=h.pl?!!h.ex:h.s>=G.steps;if(h.m>=G.meals){o.carb=h.c>=cg;o.prot=h.p>=pg;o.veg=h.v>=3}}
 o.sleep=c.s||null;o.en=c.e||null;o.gut=c.g||null;o.all=!!doneDates[key(d)];return o}
const ADV={
 sleep:{n:'수면',fx:'잠이 부족하면 식욕 호르몬(렙틴↓·그렐린↑)이 달라져 배고픔과 단 음식 생각이 늘 수 있다고 보고돼요. 식사량을 줄이는 중에 수면이 짧으면 지방보다 근육이 더 줄었다는 연구도 있고, 하룻밤 수면이 부족해도 인슐린 민감성(혈당 조절)이 떨어질 수 있다고 해요. 몸을 잘 활성화시키려는 목표에 수면은 식단만큼 중요해요.',tips:['취침·기상 시간을 먼저 일정하게 맞추기','잠들기 2–3시간 전 큰 식사와 오후 카페인 줄이기','못 잔 다음 날은 식욕이 커질 수 있으니 고단백 간식(요거트·삶은 달걀)을 미리 정해두기','졸린 날에도 탄수 하한(130g)은 유지하기 — 더 줄이지 않기']},
 water:{n:'물',fx:'수분이 부족하면 피로감이 커지고 변비가 생기기 쉬워요. 한국인 영양소 섭취기준 수분 충분섭취량은 하루 약 2,100mL(식사 속 수분 포함)예요. 장이 예민하다면 식이섬유를 늘릴 때 물도 같이 늘려요.',tips:['컵 단위(200ml)로 바로 기록하기','식사 전 한 컵 먼저','보리차·무가당 차도 좋아요']},
 move:{n:'움직임',fx:'걷기와 운동은 소비 에너지를 늘리고, 근력운동은 감량 중 근육을 지키는 데 도움이 돼요. 몰아서 하기보다 자주 움직이는 쪽이 오래 가요.',tips:['점심 후 10분 걷기','운동 없는 날은 걸음 목표만 채우기','운동 요일이 버겁다면 목표 설정에서 현실적으로 다시 정하기']},
 carb:{n:'탄수 하한',fx:'탄수화물을 너무 줄이면 컨디션과 지속력이 떨어져요. 이 앱은 하루 130g 아래로 내려가지 않게 안내해요. 줄이는 게 아니라 채우는 게 목표예요.',tips:['매끼 탄수 1은 꼭: 밥이 아니어도 고구마·감자·단호박·귀리·과일로 채워도 돼요','잡곡·고구마처럼 천천히 오르는 탄수 고르기','탄수만 먹지 말고 단백질·채소와 함께']},
 prot:{n:'단백질',fx:'단백질은 포만감을 높이고 감량 중 근육 유지에 도움이 돼요. 한국인 영양소 섭취기준 권장섭취량(성인 여성 50–55g)은 최소선이에요. 감량 중 근육이 빠지지 않게 앱 목표는 체중 kg당 약 1.2g으로 잡았어요(개인 상태에 따라 전문가 상담이 필요해요).',tips:['달걀·두부·닭가슴살 중 하나를 매끼에','간식도 요거트·삶은 달걀로','반만 먹고 채울 때 단백질부터 추가하기']},
 veg:{n:'채소',fx:'채소는 식이섬유(성인 여성 충분섭취량 20g)와 포만감을 채워줘요. 먹고 싶은 음식을 ½만 먹고 샐러드를 더하는 방식이 부담이 가장 적어요.',tips:['도시락에 샐러드 한 컵 더하기','반찬에 채소 한 가지 추가','장이 예민하면 고포드맵 표시 확인']},
 meal:{n:'식단 기록',fx:'기록이 비면 리포트와 추천이 정확하지 않아요. 완벽할 필요 없이 한 끼만 3탭으로 남겨도 충분해요.',tips:['카테고리 → 메뉴 → 양 3탭','먹은 직후 바로 기록하기']}};
function reportUI(){
 const days=[];for(let i=6;i>=0;i--){const d=new Date(sim);d.setDate(d.getDate()-i);days.push(d)}
 const st=days.map(dayStat),md=d=>(d.getMonth()+1)+'/'+d.getDate();
 $('#rrange').textContent=md(days[0])+' – '+md(days[6]);
 const cats=['meal','water','move','carb','prot','veg'];
 const res=cats.map(k=>{const v=st.map(x=>x[k]).filter(x=>x!==undefined);return{k,ok:v.filter(Boolean).length,den:v.length,t:null}});
 const sl=st.map(x=>x.sleep).filter(Boolean),g3=sl.filter(x=>x==3).length,g2=sl.filter(x=>x==2).length,g1=sl.filter(x=>x==1).length;
 res.push({k:'sleep',ok:g3+.5*g2,den:sl.length,t:`${g3}/${sl.length}일`,sl:[g3,g2,g1]});
 res.forEach(r=>{r.ratio=r.den?r.ok/r.den:null;r.t=r.t||`${r.ok}/${r.den}일`});
 const have=res.filter(r=>r.den>0),all=st.filter(x=>x.all).length;
 // hero
 $('#rhero').innerHTML=`<div class="row" style="justify-content:space-between"><span class="sub">필수 행동 모두 채운 날</span><b class="big">${all}<small style="font-size:14px">/7일</small></b></div><div class="row" style="gap:6px;margin-top:6px;justify-content:space-between">${days.map((d,i)=>`<div style="text-align:center;flex:1"><div style="font-size:22px;height:30px">${shown(doneDates[key(d)])||'·'}</div><div class="sub" style="font-size:11px">${DW[(d.getDay()+6)%7]}</div></div>`).join('')}</div>${days.some(d=>Array.from(doneDates[key(d)]||'').length>1)?'<div class="sub" style="margin-top:6px">🌟 스티커를 2개 이상 받은 날</div>':''}<div style="margin-top:8px;font-size:14px">${all>=5?'🎉 주 5일 이상 해냈어요!':all>=3?'꾸준히 쌓이고 있어요. 한 걸음씩 가요.':'아직 시작 단계예요. 기록만 해도 충분히 의미 있어요.'}</div>`;
 // good
 const good=have.filter(r=>r.ratio>=.7).sort((a,b)=>b.ratio-a.ratio);
 const col=r=>r>=.7?'var(--leaf)':r>=.5?'var(--lemon)':'var(--blush)';
 $('#rgood').innerHTML=(have.length?have.slice().sort((a,b)=>b.ratio-a.ratio).map(r=>`<div class="sbar"><span>${ADV[r.k].n}</span><span class="bar"><i style="width:${Math.max(4,r.ratio*100)}%;background:${col(r.ratio)}"></i></span><span>${r.t}</span></div>`).join(''):'<div class="sub">아직 기록이 없어요. 데모 버튼으로 예시 한 주를 채워보세요.</div>')+(good.length?`<div style="margin-top:8px;font-size:14px">👏 <b>${good.slice(0,3).map(r=>ADV[r.k].n).join(' · ')}</b>을(를) 잘 지켰어요.</div>`:'');
 // heatmap
 const rows=[['meal','식단'],['water','물'],['move','움직임'],['carb','탄수'],['prot','단백질'],['veg','채소']];
 let hm='<div></div>'+days.map(d=>`<div class="sub" style="text-align:center">${DW[(d.getDay()+6)%7]}</div>`).join('');
 rows.forEach(([k,n])=>{hm+=`<div>${n}</div>`+st.map(x=>`<div class="hc ${x[k]===undefined?'':x[k]?'ok':'bad'}"></div>`).join('')});
 hm+='<div>수면</div>'+st.map(x=>`<div class="hc ${x.sleep==3?'ok':x.sleep==2?'mid':x.sleep==1?'bad':''}"></div>`).join('');
 $('#rhm').innerHTML=hm;
 // cond + weight
 const avg=k=>{const v=st.map(x=>x[k]).filter(Boolean);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
 const cb=[['en','에너지'],['gut','장 편안함'],['sleep','수면']].map(([k,n])=>{const a=avg(k);return `<div class="sbar"><span>${n}</span><span class="bar"><i style="width:${a?a/3*100:0}%;background:${a?col(a/3):'var(--line)'}"></i></span><span>${a?a.toFixed(1)+'/3':'-'}</span></div>`}).join('');
 const wk=wlog.filter(x=>x.t>=new Date(days[0].getFullYear(),days[0].getMonth(),days[0].getDate()).getTime());
 const W7=wkAvg(),wt=SV.view=='hide'?'':SV.view=='trend'?(W7.length>1?`<div style="font-size:14px;margin-top:6px">주간 평균 ${W7[W7.length-2].v}kg → ${W7[W7.length-1].v}kg (${W7[W7.length-1].v-W7[W7.length-2].v>0?'+':''}${(W7[W7.length-1].v-W7[W7.length-2].v).toFixed(1)}kg)</div>`:'<div class="sub" style="margin-top:6px">두 주 이상 기록하면 주간 평균 변화를 보여줘요.</div>'):wk.length>1?`<div style="font-size:14px;margin-top:6px">몸무게 ${wk[0].v}kg → ${wk[wk.length-1].v}kg (${(wk[wk.length-1].v-wk[0].v)>0?'+':''}${(wk[wk.length-1].v-wk[0].v).toFixed(1)}kg)</div>`:'<div class="sub" style="margin-top:6px">이번 주 몸무게 기록이 2번 이상이면 변화를 보여줘요.</div>';
 $('#rcond').innerHTML=cb+wt;
 // advice
 const weak=have.filter(r=>r.ratio<.6).sort((a,b)=>(a.k=='sleep'?-1:b.k=='sleep'?1:0)||a.ratio-b.ratio).slice(0,3);
 let adv='';
 weak.forEach(r=>{const a=r.k=='move'&&hasP(SV,'injury')?{...ADV.move,tips:['통증 없는 범위에서 걷기·스트레칭부터','점프·달리기·무거운 무게는 쉬어요','통증이 계속되면 운동보다 진료를 먼저 받아요']}:ADV[r.k];adv+=`<div class="advc"><b>${a.n} · ${r.t}${r.k=='sleep'?` (좋음 ${r.sl[0]} · 보통 ${r.sl[1]} · 별로 ${r.sl[2]})`:''}</b><div class="sub" style="margin-top:4px">${a.fx}</div><ul>${a.tips.map(t=>`<li>${t}</li>`).join('')}</ul></div>`});
 if(!sl.length)adv+='<div class="advc"><b>수면 기록이 없어요</b><div class="sub" style="margin-top:4px">기록 탭의 "오늘 컨디션"에서 수면을 체크하면, 수면이 식욕과 다이어트에 미치는 영향을 리포트에 반영해요.</div></div>';
 if(!weak.length&&sl.length)adv+='<div class="advc"><b>🎉 큰 보완점이 없어요</b><div class="sub" style="margin-top:4px">이번 주 패턴을 유지해 봐요. 컨디션이 떨어지는 날이 있으면 수면과 물부터 확인하세요.</div></div>';
 if(avg('en')&&avg('en')<2)adv+='<div class="advc"><b>에너지가 낮은 편이에요</b><div class="sub" style="margin-top:4px">수면·탄수·수분이 부족하면 피로가 커질 수 있어요. 위 항목부터 점검해 보세요. 증상이 계속되면 전문가와 상담하세요.</div></div>';
 $('#radv').innerHTML=adv;
}
$('#rseed').onclick=()=>{for(let i=1;i<=6;i++){const d=new Date(sim);d.setDate(d.getDate()-i);const k=key(d),wd=(d.getDay()+6)%7,pl=(PL.s.includes(wd)||PL.c.includes(wd))?1:0,m=Math.random()<.85?G.meals:G.meals-1,r=Math.random;
  const h={m,c:m>=G.meals?(r()<.7?(window.CARBMIN||233)+r()*60:150+r()*60):60,p:m>=G.meals?55+r()*50:20,v:m>=G.meals?1+r()*3:.5,w:r()<.75?G.water:1000+r()*900,s:2500+r()*7000,pl,ex:pl?(r()<.8?1:0):0};hist[k]=h;
  const ok=h.m>=G.meals&&h.w>=G.water&&(pl?h.ex:h.s>=G.steps);
  const q=r(),sl=q<.2?3:q<.55?2:1,rr=()=>Math.max(1,Math.min(3,Math.round(2+(r()-.5)*1.6)));cond[k]={e:Math.max(1,sl+(r()<.4?0:-1)),g:rr(),s:sl};if(ok)doneDates[k]=stk(k)}upd();condUI();toast('예시 한 주를 채웠어요')};

/* plate */
const VEG={'샌드위치':.3,'비빔밥':1,'포케':1,'김밥':.5,'덮밥·볶음밥':.5,'국·정식':1,'샐러드':1.5,'면':.3,'분식':.2,'간식':0,'고기·구이':.2,'치킨·피자·버거':.1,'카페·음료':0,'밥·반찬':.1,'기타':.3};
function vegOf(x){return (VEG[x.cat]??.3)*x.por+(x.add.includes('샐러드')?1:0)}
function sector(a0,a1,q){const r=80,p=a=>[100+r*Math.cos(a*Math.PI/180),100+r*Math.sin(a*Math.PI/180)],[x0,y0]=p(a0),[x1,y1]=p(a1);return `<path d="M100 100 L${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1} Z" transform="translate(100 100) scale(${q}) translate(-100 -100)"`}
function plateUI(){
 const c=logs.reduce((a,l)=>a+l.c,0),p=logs.reduce((a,l)=>a+l.p,0),v=logs.reduce((a,l)=>a+(l.v||0),0);
 const cg=window.CARBMIN||130,pg=(window.PROT||60),vg=3;
 const R=[[c/cg,'탄수','--lemon',-90,30],[p/pg,'단백질','--blush',30,150],[v/vg,'채소','--leaf-soft',150,270]];
 let h='<circle cx="100" cy="100" r="92" style="fill:var(--card);stroke:var(--line)" stroke-width="3"/>';
 R.forEach(([r,n,col,a0,a1])=>{const q=Math.min(1,r);h+=sector(a0,a1,1)+` style="fill:var(${col});opacity:.25"/>`;if(q>0)h+=sector(a0,a1,q)+` style="fill:var(${col});stroke:var(--ink);stroke-opacity:.15"/>`;const m=(a0+a1)/2*Math.PI/180;h+=`<text x="${100+50*Math.cos(m)}" y="${100+50*Math.sin(m)+4}" text-anchor="middle" font-size="12" font-weight="700" style="fill:var(--ink)">${n}</text>`});
 $('#plate').innerHTML=h;
 const rs=R.map(x=>Math.min(1,x[0])),full=rs.every(x=>x>=1),names=['탄수','단백질','채소'],tips=['밥·고구마 같은 탄수를 더해요 (줄이는 게 목표가 아니에요)','달걀·두부·살코기를 더해요','샐러드를 곁들여요 (먹고 싶은 건 반만, 샐러드로 채우기!)'],low=rs.indexOf(Math.min(...rs));
 $('#ptxt').innerHTML=`탄수 <b>${Math.round(c)}</b>/${cg}g<br>단백질 <b>${Math.round(p)}</b>/${pg}g<br>채소 <b>${v.toFixed(1)}</b>/${vg}접시<div class="${full?'ok':'sub'}" style="margin-top:8px">${!logs.length?'기록하면 접시가 채워져요.':full?'🎉 균형 접시 완성!':'가장 빈 칸: '+names[low]+' → '+tips[low]}</div>`;
}
/* condition */
const CF=[['e','에너지'],['g','장 편안함'],['s','수면']],CL=[['좋음',3],['보통',2],['별로',1]];
function condUI(){const k0=key(rd),c=cond[k0]||{};$('#cond').innerHTML=CF.map(([f,n])=>`<div class="row" style="justify-content:space-between;margin-bottom:6px"><span style="font-size:14px">${n}</span><span class="row" style="gap:4px">${CL.map(([l,v])=>`<button class="chip ${c[f]==v?'on':''}" data-f="${f}" data-v="${v}">${l}</button>`).join('')}</span></div>`).join('');
 $$('#cond [data-f]').forEach(b=>b.onclick=()=>{const k=key(rd);cond[k]=cond[k]||{};cond[k][b.dataset.f]=+b.dataset.v;condUI();renderReq();upd()})}
function sc(d){const c=cond[key(d)];if(!c)return null;const v=Object.values(c);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
function chartUI(){const days=[];for(let i=13;i>=0;i--){const d=new Date(sim);d.setDate(d.getDate()-i);days.push(d)}
 let h='';days.forEach((d,i)=>{const s=sc(d),x=8+i*19.5;if(s==null)h+=`<rect x="${x}" y="78" width="14" height="3" rx="1.5" style="fill:var(--line)"/>`;else{const hh=s/3*64;h+=`<rect x="${x}" y="${80-hh}" width="14" height="${hh}" rx="4" style="fill:${s>=2.5?'var(--leaf)':s>=1.8?'var(--lemon)':'var(--blush)'}"/>`}});
 $('#cchart').innerHTML=h;
 const a=[],b=[];days.forEach(d=>{const s=sc(d);if(s==null)return;(doneDates[key(d)]?a:b).push(s)});const av=x=>x.reduce((p,q)=>p+q,0)/x.length;
 $('#cins').innerHTML=(a.length>=3&&b.length>=3)?`필수 행동을 채운 날 컨디션 평균 <b>${av(a).toFixed(1)}</b> · 못 채운 날 <b>${av(b).toFixed(1)}</b> (3점 만점). 같이 나타난 경향일 뿐 원인은 아니에요.`:'컨디션을 며칠 기록하면 필수 행동과의 관계를 보여줘요.'}
$('#cseed').onclick=()=>{for(let i=1;i<=14;i++){const d=new Date(sim);d.setDate(d.getDate()-i);const done=Math.random()<.65;if(done)doneDates[key(d)]=rnd(['⭐','👟','💪','🌙','🥗']);const base=done?2.5:1.9,r=()=>Math.max(1,Math.min(3,Math.round(base+(Math.random()-.5)*1.4)));cond[key(d)]={e:r(),g:r(),s:r()}}upd();toast('예시 데이터를 채웠어요')};
/* calendar + summary */
function calUI(){const y=sim.getFullYear(),m=sim.getMonth(),first=(new Date(y,m,1).getDay()+6)%7,dim=new Date(y,m+1,0).getDate();
 $('#calh').innerHTML=DW.map(d=>`<div class="sub">${d}</div>`).join('');let h='',n=0;for(let i=0;i<first;i++)h+='<div></div>';
 for(let d=1;d<=dim;d++){const done=doneDates[y+'-'+(m+1)+'-'+d];if(done)n++;h+=`<div class="cd ${d==sim.getDate()?'t':''} ${d>sim.getDate()?'f':''}">${done?`<i>${shown(done)}</i>`:''}<span class="sub">${d}</span></div>`}
 $('#cal').innerHTML=h;$('#calt').textContent=`${y}년 ${m+1}월 도장판`;$('#calc2').textContent=n+'일 달성'}
function sumUI(){const n=Object.keys(doneDates).length,vals=Object.keys(cond).map(k=>{const v=Object.values(cond[k]);return v.reduce((a,b)=>a+b,0)/v.length}),avg=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1)+' / 3':'-',wd=wlog.length>1?(wlog[wlog.length-1].v-wlog[0].v):null;
 $('#sumg').innerHTML=[['달성한 날',n+'일'],['체중 변화',wd==null?'-':(wd>0?'+':'')+wd.toFixed(1)+'kg'],['컨디션 평균',avg],['주간 뱃지',weeksDone+'개']].map(([a,b])=>`<div class="tile" style="padding:10px"><b style="font-size:18px">${b}</b><div class="sub">${a}</div></div>`).join('')}
$('#nextday').onclick=()=>{stash();sim.setDate(sim.getDate()+1);simOff++;todayIdx=(sim.getDay()+6)%7;if(todayIdx==0){dayDone=[0,0,0,0,0,0,0];badged=false}setRec(sim);toast(DW[todayIdx]+'요일이 됐어요')};
$('#demodone').onclick=()=>{while(logs.length<G.meals)logs.push({n:'(데모) 식사',k:400,c:60,p:20,v:1,e:rnd(FOODS)});water=G.water;if(planned())exDone=true;else steps=Math.max(steps,G.steps);waterUI();stepsUI();exUI();tot()};

/* 기록 보는 방식(SV.view): daily 매일 숫자 / trend 주간 평균만(기본) / hide 숫자 숨기고 눈바디만 */
function wkAvg(){const m={};wlog.forEach(w=>{const d=new Date(w.t),mon=new Date(d.getFullYear(),d.getMonth(),d.getDate()-((d.getDay()+6)%7)).getTime();(m[mon]=m[mon]||[]).push(w.v)});
 return Object.keys(m).map(Number).sort((a,b)=>a-b).map(t=>({t,v:Math.round(m[t].reduce((a,b)=>a+b,0)/m[t].length*10)/10,n:m[t].length}))}
function wUI(){const c=$('#wcard');if(c)c.hidden=SV.view=='hide';if(SV.view=='hide')return;if(SV.view=='daily')return wUIdaily();
 const W=wkAvg(),n=W.length,md=t=>{const d=new Date(t);return (d.getMonth()+1)+'/'+d.getDate()};$('#wleg').innerHTML='';
 if(!n){$('#wsum').innerHTML='';$('#wchart').innerHTML='';$('#wnote').textContent='기록이 없어요. 몸무게를 입력하면 주간 평균 추세가 쌓여요.';return}
 const f=W[0],l=W[n-1],pv=n>1?W[n-2]:null,target=(wlog[0].v)-G.kg;
 $('#wsum').innerHTML=`<div>이번 주 평균 <b>${l.v}kg</b></div><div>지난주 대비 <b>${pv?(l.v-pv.v>0?'+':'')+(l.v-pv.v).toFixed(1)+'kg':'-'}</b></div><div>첫 주 평균 <b>${f.v}kg</b></div><div>목표 <b>${target.toFixed(1)}kg</b></div>`;
 const vs=W.map(x=>x.v).concat(target),lo=Math.min(...vs)-.5,hi=Math.max(...vs)+.5,X0=34,X1=290,Y0=12,Y1=106,px=i=>n==1?(X0+X1)/2:X0+i/(n-1)*(X1-X0),py=v=>Y1-(v-lo)/(hi-lo)*(Y1-Y0);
 let h=`<line x1="${X0}" x2="${X1}" y1="${py(target)}" y2="${py(target)}" stroke-dasharray="4 4" style="stroke:var(--sub)"/><text x="${X1}" y="${py(target)-4}" text-anchor="end" font-size="9" style="fill:var(--sub)">목표 ${target.toFixed(1)}</text>`;
 if(n>1)h+=`<polyline fill="none" stroke-width="2.5" stroke-linejoin="round" style="stroke:var(--leaf)" points="${W.map((x,i)=>px(i)+','+py(x.v)).join(' ')}"/>`;
 W.forEach((x,i)=>{h+=`<circle cx="${px(i)}" cy="${py(x.v)}" r="4" style="fill:var(--leaf)"/>`});
 h+=`<text x="${X0}" y="124" font-size="9" style="fill:var(--sub)">${md(f.t)} 주</text>`+(n>1?`<text x="${X1}" y="124" font-size="9" text-anchor="end" style="fill:var(--sub)">${md(l.t)} 주</text>`:'');
 $('#wchart').innerHTML=h;$('#wnote').innerHTML='하루 숫자 대신 <b>주간 평균</b>만 보여줘요. 하루 1–2kg 오르내리는 건 대부분 수분이에요.'+cycleInsight()}
function wsl(){const e=$('#wsl');if(!e)return;if(!wlog.length){e.textContent='기록하면 추이가 보여요';return}
 if(SV.view=='trend'){const W=wkAvg(),l=W[W.length-1],p=W[W.length-2];e.textContent='이번 주 평균 '+l.v+'kg'+(p?' · 지난주 대비 '+(l.v-p.v>0?'+':'')+(l.v-p.v).toFixed(1)+'kg':'');return}
 e.textContent='현재 '+wlog[wlog.length-1].v+'kg'+(wlog.length>1?' · 처음 대비 '+((wlog[wlog.length-1].v-wlog[0].v)>0?'+':'')+(wlog[wlog.length-1].v-wlog[0].v).toFixed(1)+'kg':'')}
// 보고 싶은 변화에 체중이 없거나 숫자를 숨기면 눈바디를 앞에
function bodyOrder(){const gl=SV.goals||[],go=$('#nbgo');if(go)go.hidden=!(SV.view=='hide'||(gl.length&&!gl.includes('weight')));const nb=$('#nbcard'),w=$('#wcard');if(!nb||!w||nb.parentNode!==w.parentNode)return;const g=SV.goals||[],photo=SV.view=='hide'||(g.length&&!g.includes('weight'));
 if(photo){if(nb.nextElementSibling!==w)w.parentNode.insertBefore(nb,w);nb.open=true}else{if(w.nextElementSibling!==nb)nb.parentNode.insertBefore(w,nb)}}
function vwUI(){const e=$('#vwset');if(!e)return;e.innerHTML=Object.entries(VWN).map(([k,n])=>`<button class="chip ${SV.view==k?'on':''}" data-vw="${k}">${n}</button>`).join('');
 $('#vwnote').textContent={daily:'매일 기록한 몸무게 숫자를 그대로 보여줘요.',trend:'하루 변동 대신 주간 평균과 지난주 대비 변화만 보여줘요.',hide:'몸무게 카드와 목표 kg을 숨기고, 첫 화면에 눈바디를 앞에 둬요.'}[SV.view];
 e.querySelectorAll('[data-vw]').forEach(b=>b.onclick=()=>{SV.view=b.dataset.vw;logChg('기록 보는 방식: '+VWN[SV.view]);vwUI();posterUI();upd();saveState()})}

/* 생리주기 예측 — 모든 날짜는 '예상'. 식단·운동 목표(탄수 하한 등)는 주기에 따라 바꾸지 않는다 */
let CY=null,wsd=false;// wsd: 몸무게 첫 기록을 이미 채웠는지
// {starts:[시작일 ts...], cyc:입력한 평균 주기, len:생리 기간}
const DAY=864e5,dz=t=>{const d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()};
const md2=t=>{const d=new Date(t);return (d.getMonth()+1)+'/'+d.getDate()},ymd=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const pymd=s=>{const p=(s||'').split('-');return p.length==3?new Date(+p[0],+p[1]-1,+p[2]).getTime():NaN};
function cyInts(){if(!CY)return[];const s=CY.starts;return s.slice(1).map((t,i)=>Math.round((t-s[i])/DAY))}
// 기록된 시작일이 2번 이상이면 최근 주기(최대 6개)의 평균으로, 아니면 입력한 평균 주기로 예측
function cyAvg(){const iv=cyInts().slice(-6);return iv.length?Math.round(iv.reduce((a,b)=>a+b,0)/iv.length):(CY&&CY.cyc)||28}
function cyPhase(t){if(!CY||!CY.starts.length)return null;t=dz(t);let S=null;for(const x of CY.starts)if(x<=t)S=x;if(S==null)return null;
 const C=cyAvg(),P=CY.len||5,i=Math.round((t-S)/DAY),ov=C-14,r={i,S,C};
 // 월경기: 시작일부터 생리 기간 / 배란기: (다음 예상일-14) ±2일 / 난포기: 그 사이 / 황체기: 배란기 후 ~ 다음 생리 전
 r.p=i<P?'월경기':i>=C?'예정일 지남':(i>=ov-2&&i<=ov+2)?'배란기':i<ov-2?'난포기':'황체기';return r}
function cyAddStart(t){t=dz(t);CY=CY||{starts:[],cyc:28,len:5};if(!CY.starts.includes(t))CY.starts.push(t);CY.starts.sort((a,b)=>a-b)}
function cyNotices(){const N=[];if(!CY||!CY.starts.length)return N;const iv=cyInts().slice(-6),C=cyAvg(),since=Math.round((dz(sim.getTime())-CY.starts[CY.starts.length-1])/DAY);
 if(since>=90)N.push(['warn',`마지막 생리 후 ${since}일 동안 기록이 없어요. 임신 가능성이 있다면 임신 테스트로 먼저 확인해 보세요. 3개월 이상 생리가 없으면 산부인과 방문을 권해요.`]);
 if(iv.filter(x=>x>38).length>=3)N.push(['soft','주기가 길게 이어지고 있어요. 한 번 산부인과에서 확인해 보면 마음이 편할 수 있어요.']);
 else if(iv.filter(x=>x<24).length>=2)N.push(['soft','주기가 짧게 이어지고 있어요. 한 번 산부인과에서 확인해 보면 마음이 편할 수 있어요.']);
 N.push(['',C>=24&&C<=38?`평균 주기 ${C}일(예상)로 일반적인 범위(24~38일) 안이에요.`:`평균 주기 ${C}일(예상)로 일반적인 범위(24~38일)를 벗어나 있어요. 기록이 쌓이면 예측이 더 정확해져요.`]);return N}
const CYT={'월경기':['철분(붉은 고기·두부·시금치)과 단백질을 챙기고 끼니는 거르지 않아요','따뜻한 국물·차로 몸을 편하게 하고, 운동은 걷기·스트레칭 정도로 가볍게 해요','피곤하고 기운이 없을 수 있어요. 잠을 먼저 챙겨요'],
 '난포기':['컨디션이 좋은 사람이 많은 시기예요(개인차). 근력 운동을 하기 좋아요','평소 루틴대로 규칙적으로 먹어요'],
 '배란기':['아랫배가 살짝 불편하거나 식욕이 달라질 수 있어요','물을 충분히 마시고, 불편하면 운동 강도를 낮춰요'],
 '황체기':['식욕이 늘고 붓는 건 정상이에요. 호르몬 때문에 생기는 자연스러운 변화예요','이 시기 체중 증가는 대부분 수분이에요. 생리가 시작되면 대개 빠지니 숫자에 흔들리지 않아도 돼요','탄수는 줄이지 말고(하루 130g 하한), 고구마·바나나·요거트 같은 든든한 간식을 미리 챙겨요'],
 '예정일 지남':['스트레스·수면·먹는 양이 바뀌면 늦어질 수 있어요','생리가 시작되면 아래에서 시작일을 기록해 주세요. 예측이 다시 맞춰져요']};
function cyForm(){return `<div class="grid2" style="margin-top:8px"><div style="grid-column:1/-1"><label>마지막 생리 시작일</label><input id="cyl" type="date" value="${CY&&CY.starts.length?ymd(CY.starts[CY.starts.length-1]):''}"></div><div><label>평균 주기(일)</label><input id="cyc" type="number" value="${CY?CY.cyc:28}"></div><div><label>평균 생리 기간(일)</label><input id="cyn" type="number" value="${CY?CY.len:5}"></div></div><button class="pri" id="cysave" style="width:100%;margin-top:8px">저장</button>`}
function cySet(last,c,n){const t=pymd(last),today=dz(sim.getTime());if(!(t<=today&&today-t<366*DAY))return '마지막 생리 시작일을 확인해 주세요.';c=Math.round(+c);n=Math.round(+n||5);if(!(c>=15&&c<=90))return '평균 주기는 15~90일로 넣어 주세요.';if(!(n>=1&&n<=10))return '생리 기간은 1~10일로 넣어 주세요.';
 cyAddStart(t);CY.cyc=c;CY.len=n;return ''}
function cyUI(){const b=$('#cybox');if(!b)return;
 if(!consent){b.innerHTML='<div class="sub" style="margin-top:6px">동의하면 마지막 생리 시작일과 평균 주기로 단계(예상)와 시기별 식단·컨디션 팁을 볼 수 있어요.</div>';return}
 if(!CY||!CY.starts.length){b.innerHTML='<div class="sub" style="margin-top:6px">마지막 생리 시작일과 평균 주기를 넣어 주세요.</div>'+cyForm()+'<div class="bad" id="cymsg" style="font-size:13px"></div>';$('#cysave').onclick=()=>{const m=cySet($('#cyl').value,$('#cyc').value,$('#cyn').value);if(m)return $('#cymsg').textContent=m;cyChanged()};return}
 const now=dz(sim.getTime()),ph=cyPhase(now),C=cyAvg(),S=ph.S,nx=S+C*DAY,ov=nx-14*DAY,left=Math.round((nx-now)/DAY),iv=cyInts();
 b.innerHTML=`<div class="cyrow"><div class="cybox">오늘 (예상)<b>${ph.p}</b><span class="sub">주기 ${ph.i+1}일째</span></div><div class="cybox">다음 생리 (예상)<b>${md2(nx)}</b><span class="sub">${left>0?left+'일 뒤':left==0?'오늘':-left+'일 지남'}</span></div>
  <div class="cybox">배란일 (예상)<b>${md2(ov)}</b><span class="sub">배란기 ${md2(ov-2*DAY)}~${md2(ov+2*DAY)}</span></div><div class="cybox">평균 (예상)<b>${C}일 주기</b><span class="sub">생리 ${CY.len}일 · ${iv.length?'기록 '+(iv.length)+'주기 평균':'입력값 기준'}</span></div></div>
  <div class="advc"><b>${ph.p} (예상) 팁</b><ul>${(CYT[ph.p]||[]).map(t=>`<li>${t}</li>`).join('')}</ul></div>
  ${cyNotices().map(([c,t])=>`<div class="svnote ${c}">${t}</div>`).join('')}
  <div class="row" style="margin-top:10px;flex-wrap:nowrap"><input type="date" id="cyd" value="${ymd(now)}"><button class="pri" id="cyadd" style="flex:none">🩸 생리 시작 기록</button></div>
  <details style="margin-top:8px"><summary class="sub">시작일 기록·주기 정보 수정</summary><div class="sub" style="margin-top:6px">${CY.starts.slice(-7).map((t,i,a)=>md2(t)+(i?` (${Math.round((t-a[i-1])/DAY)}일)`:'')).join(' → ')}</div>
   <button id="cydel" style="margin-top:6px">마지막 시작일 기록 지우기</button>${cyForm()}<div class="bad" id="cymsg" style="font-size:13px"></div></details>`;
 $('#cyadd').onclick=()=>{const t=pymd($('#cyd').value);if(!(t<=now))return toast('날짜를 확인해 주세요');cyAddStart(t);cyChanged();toast('생리 시작일을 기록했어요 · 예측을 다시 맞췄어요')};
 $('#cydel').onclick=()=>{CY.starts.pop();if(!CY.starts.length)CY=null;cyChanged()};
 $('#cysave').onclick=()=>{const m=cySet($('#cyl').value,$('#cyc').value,$('#cyn').value);if(m)return $('#cymsg').textContent=m;cyChanged()}}
function cyChanged(){refresh();saveState()}

/* 눈바디: 사진은 IndexedDB(이 기기)에만 저장, 목록·기준 옷·핏 기록은 nb */
let nb={cloth:'',fit:{},photos:[]};
const FIT=[['tight','꽉 낌'],['fit','딱 맞음'],['loose','여유 있음']];
function idb(){return new Promise((ok,no)=>{const r=indexedDB.open('dietproto_photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('p');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)})}
function idbDo(mode,f){return idb().then(db=>new Promise((ok,no)=>{const tx=db.transaction('p',mode),st=tx.objectStore('p'),q=f(st);tx.oncomplete=()=>ok(q&&q.result);tx.onerror=()=>no(tx.error)}))}
const idbGet=k=>idbDo('readonly',s=>s.get(k)),idbPut=(k,v)=>idbDo('readwrite',s=>{s.put(v,k)}),idbDel=k=>idbDo('readwrite',s=>{s.delete(k)}),idbClear=()=>idbDo('readwrite',s=>{s.clear()}).catch(()=>{});
// 긴 변 900px JPEG로 줄여 저장 용량을 아낀다
function shrink(src,w,h,mirror){const k=Math.min(1,900/Math.max(w,h)),c=document.createElement('canvas');c.width=Math.round(w*k);c.height=Math.round(h*k);const x=c.getContext('2d');if(mirror){x.translate(c.width,0);x.scale(-1,1)}x.drawImage(src,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.78)}
async function nbSave(url){const k=key(sim);try{await idbPut(k,url)}catch(e){return toast('사진을 저장하지 못했어요 (저장 공간을 확인해 주세요)')}
 if(!nb.photos.includes(k))nb.photos.push(k);nb.photos.sort((a,b)=>tk(a)-tk(b));nbView=null;nbUI();sens();saveState();toast('눈바디를 저장했어요 · 이 기기에만 저장돼요')}
let nbView=null;
function nbFig(k,cls){const d=new Date(tk(k)),p2=x=>String(x).padStart(2,'0');return `<figure class="mbf ${cls||''}" data-nb="${k}"><div class="scr"><img data-src="${k}" alt="${k} 눈바디"><span class="stamp">'${p2(d.getFullYear()%100)} ${p2(d.getMonth()+1)} ${p2(d.getDate())}</span></div><figcaption>${d.getMonth()+1}/${d.getDate()}</figcaption></figure>`}
function nbUI(){const box=$('#nbmb');if(!box)return;const P=nb.photos,n=P.length;
 $('#nbsl').textContent=n?`사진 ${n}장 · 최근 ${md2(tk(P[n-1]))}`+(nb.cloth?' · 기준 옷: '+nb.cloth:''):'같은 자리·같은 거리에서 찍으면 변화가 잘 보여요';
 let h='';
 if(nbView){h+=`<div class="advc"><img data-src="${nbView}" alt="" style="width:100%;border-radius:8px"><div class="row" style="justify-content:space-between;margin-top:6px"><span class="sub">${md2(tk(nbView))} 눈바디</span><span><button id="nbvdel" class="danger">이 사진 삭제</button> <button id="nbvx">닫기</button></span></div></div>`}
 if(n>=2)h+=`<div class="sub" style="margin-top:10px">처음 vs 최근</div><div class="nbcmp">${nbFig(P[0])}${nbFig(P[n-1])}</div>`;
 if(n){const sh=P.slice().reverse().slice(0,12),em=Math.max(6,Math.ceil(sh.length/3)*3)-sh.length;h+=`<div class="sub" style="margin-top:10px">${effTh()=='vintage'?'눈바디 스크랩':'무드보드'}</div><div class="mb">${sh.map(k=>nbFig(k)).join('')}${'<div class="mbempty"></div>'.repeat(em)}</div>`}
 else h+='<div class="sub" style="margin-top:10px">아직 사진이 없어요. 촬영 가이드의 실루엣에 맞춰 찍으면 다음에도 같은 구도로 비교할 수 있어요.</div>';
 box.innerHTML=h;
 box.querySelectorAll('img[data-src]').forEach(im=>idbGet(im.dataset.src).then(u=>{if(u)im.src=u}).catch(()=>{}));
 box.querySelectorAll('[data-nb]').forEach(f=>f.onclick=()=>{nbView=f.dataset.nb;nbUI()});
 if(nbView){$('#nbvx').onclick=()=>{nbView=null;nbUI()};$('#nbvdel').onclick=async()=>{const k=nbView;await idbDel(k).catch(()=>{});nb.photos=nb.photos.filter(x=>x!==k);nbView=null;nbUI();sens();saveState();toast('사진을 지웠어요')}}
 $('#nbcloth').value=nb.cloth||'';const today=nb.fit[key(sim)];
 $('#nbfit').innerHTML=FIT.map(([k,t])=>`<button class="chip ${today==k?'on':''}" data-fit="${k}">${t}</button>`).join('');
 $$('#nbfit [data-fit]').forEach(b=>b.onclick=()=>{const k=key(sim);if(nb.fit[k]==b.dataset.fit)delete nb.fit[k];else nb.fit[k]=b.dataset.fit;nbUI();sens();saveState()});
 const F=Object.keys(nb.fit).sort((a,b)=>tk(a)-tk(b)).slice(-6);
 $('#nbfith').textContent=F.length?(nb.cloth?nb.cloth+' · ':'')+F.map(k=>md2(tk(k))+' '+FIT.find(x=>x[0]==nb.fit[k])[1]).join(' → '):(nb.cloth?'오늘 입어 보고 느낌을 골라요.':'먼저 기준 옷을 하나 정해 두면 같은 옷으로 비교할 수 있어요.')}
$('#nbclothok').onclick=()=>{nb.cloth=$('#nbcloth').value.trim().slice(0,30);nbUI();sens();saveState();toast(nb.cloth?'기준 옷을 저장했어요':'기준 옷을 비웠어요')};
$('#nbfile').onchange=e=>{const f=e.target.files[0];e.target.value='';if(!f)return;const im=new Image(),u=URL.createObjectURL(f);im.onload=()=>{nbSave(shrink(im,im.naturalWidth,im.naturalHeight));URL.revokeObjectURL(u)};im.onerror=()=>toast('사진을 열 수 없어요');im.src=u};
// 촬영 가이드: 실루엣·머리/발끝 선, 지난 사진 겹쳐 보기, 3초 타이머(숫자만 바뀌고 움직이는 효과 없음)
let camS=null,camFace='environment',camTimer=false,camGh=false;
function camStop(){if(camS){camS.getTracks().forEach(t=>t.stop());camS=null}}
async function camStart(){camStop();try{camS=await navigator.mediaDevices.getUserMedia({video:{facingMode:camFace,width:{ideal:1080},height:{ideal:1920}},audio:false});const v=$('#camv');v.srcObject=camS;v.style.transform=camFace=='user'?'scaleX(-1)':'';await v.play().catch(()=>{});return true}catch(e){camClose();toast('카메라를 열 수 없어요. “사진 고르기”로 올려 주세요');return false}}
async function camOpen(){if(!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)){toast('이 브라우저에선 카메라를 열 수 없어요. “사진 고르기”를 써 주세요');return}
 $('#cam').hidden=false;$('#camcnt').textContent='';camGhUI();await camStart()}
function camClose(){camStop();$('#cam').hidden=true}
function camGhUI(){const g=$('#camghost'),last=nb.photos[nb.photos.length-1];$('#camghostb').disabled=!last;g.hidden=!(camGh&&last);if(camGh&&last)idbGet(last).then(u=>{if(u)g.src=u}).catch(()=>{});$('#camghostb').textContent=camGh?'지난 사진 끄기':'지난 사진';$('#camtimer').textContent=camTimer?'⏱ 3초 켬':'⏱ 3초'}
function camShoot(){const v=$('#camv');if(!v.videoWidth)return toast('카메라가 아직 준비 중이에요');nbSave(shrink(v,v.videoWidth,v.videoHeight,camFace=='user'));camClose()}
$('#nbshot').onclick=camOpen;
$('#nbgo').onclick=()=>{const b=document.querySelector('#tabs [data-v="2"]');if(b)b.click()};$('#camx').onclick=camClose;
$('#camflip').onclick=()=>{camFace=camFace=='user'?'environment':'user';camStart()};
$('#camtimer').onclick=()=>{camTimer=!camTimer;camGhUI()};$('#camghostb').onclick=()=>{camGh=!camGh;camGhUI()};
$('#camgo').onclick=()=>{if(!camTimer)return camShoot();let n=3;const c=$('#camcnt'),tick=()=>{if(n==0){c.textContent='';return camShoot()}c.textContent=n;n--;setTimeout(tick,1000)};tick()};
/* sensitive */
function sens(){const L=[];if(CY&&CY.starts.length)L.push('생리주기 정보: 시작일 '+CY.starts.length+'회 · 평균 주기 '+cyAvg()+'일 · 생리 '+CY.len+'일');if(Object.keys(cyc).length)L.push('생리주기 직접 고른 날 '+Object.keys(cyc).length+'일');if((SV.past||[]).length)L.push('다이어트로 힘들었던 경험: '+SV.past.map(k=>(SVQ.find(q=>q.k=='past').o.find(o=>o[0]==k)||[,,k])[2]).join('·'));if(nb.photos.length)L.push('눈바디 사진 '+nb.photos.length+'장');if(nb.cloth||Object.keys(nb.fit).length)L.push('기준 옷 핏 기록 '+Object.keys(nb.fit).length+'회'+(nb.cloth?' ('+nb.cloth+')':''));if(lowfm)L.push('장 민감(고포드맵) 제외 설정: 켜짐');if(SV.avoid.length)L.push('피해야 할 음식(알레르기): '+SV.avoid.map(k=>AVN[k]).join('·'));if(wlog.length)L.push('몸무게 기록 '+wlog.length+'건');if(Object.keys(cond).length)L.push('컨디션 기록 '+Object.keys(cond).length+'일');
 $('#sens').innerHTML=L.length?L.map(v=>`<div class="meal"><div class="sub" style="color:var(--ink)">${v}</div></div>`).join(''):'<div class="ok">저장된 민감정보가 없어요.</div>'}
$('#del1').onclick=()=>{$('#del2').hidden=false;$('#del1').hidden=true};
$('#delno').onclick=()=>{$('#del2').hidden=true;$('#del1').hidden=false};
$('#delok').onclick=()=>{phase=null;cyc={};CY=null;SV.past=[];nb={cloth:'',fit:{},photos:[]};nbView=null;idbClear().then(()=>nbUI());lowfm=false;SV.gut=false;SV.avoid=[];wlog=[];cond={};$$('.lowfm').forEach(x=>x.checked=false);['c1','c1x','c2'].forEach(i=>$('#'+i).checked=false);consent=false;phasesUI();pmsBn();wmenu();tot();sens();upd();condUI();cyUI();nbUI();saveState();$('#del2').hidden=true;$('#del1').hidden=false;toast('민감정보를 삭제했어요')};
$$('[data-md]').forEach(b=>b.onclick=()=>{scm=b.dataset.md;applyTheme();saveState()});
sysDark.addEventListener&&sysDark.addEventListener('change',()=>{if(!scm)applyTheme()});
$('#thpok').onclick=()=>{thmSet=true;$('#thp').hidden=true;applyTheme();posterUI();tyUI();saveState();scrollTo(0,0);if(thpFrom||!profileDone)onbOpen(true);else toast(combo()+' 루틴이에요')};

function deficitOf(){return Math.min(500,Math.round(G.kg*7700/(G.weeks*7)))}
function goalMsg(){$('#gsum').textContent=`${G.kg}kg · ${G.weeks}주 · 필수 행동 ${G.meals}끼/${(G.water/1000).toFixed(1)}L`;$('#gwv').textContent=(G.water/1000).toFixed(1)+'L';const r=G.kg/G.weeks,wt=+$('#wt').value||0,pc=wt?r/wt*100:0;
 let t=wt?`${wt}kg → <b>${(wt-G.kg).toFixed(1)}kg</b> · 주 ${r.toFixed(2)}kg`:`주 ${r.toFixed(2)}kg 속도`,c='ok',n=wt?'완만한 속도예요.':'';
 if(wt&&pc>1){c='bad';n='주 체중의 1%를 넘는 속도예요. 근육이 빠질 위험이 커서 기간을 늘려보세요.'}else if(wt&&pc>.75)n='다소 빠른 편이에요. 단백질과 근력 운동을 꼭 챙겨요.';
 $('#gmsg').innerHTML=`${t}<div class="${c}">${n}</div>`}
let G0={...G};
function goalIn(){G.kg=Math.min(20,Math.max(1,+$('#gkg').value||5));G.weeks=Math.min(52,Math.max(2,Math.round(+$('#gwk').value)||8));G.water=Math.min(2000,Math.max(500,+$('#gw').value||2000));G.steps=+$('#gs').value;G.meals=+$('#gm').value;goalMsg();calc();refresh()}
function goalLog(){const L=[];if(G0.kg!=G.kg)L.push(`목표 ${G0.kg}→${G.kg}kg`);if(G0.weeks!=G.weeks)L.push(`기간 ${G0.weeks}→${G.weeks}주`);if(G0.water!=G.water)L.push(`물 ${(G0.water/1000).toFixed(1)}→${(G.water/1000).toFixed(1)}L`);if(G0.steps!=G.steps)L.push(`걸음 ${G0.steps.toLocaleString()}→${G.steps.toLocaleString()}`);if(G0.meals!=G.meals)L.push(`식단 기록 ${G0.meals}→${G.meals}번`);L.forEach(logChg);G0={...G}}
function logChg(t){chg.unshift({t:Date.now(),txt:t});if(chg.length>20)chg.length=20;chgUI()}
function chgUI(){const e=$('#chg');if(!e)return;e.innerHTML=chg.length?chg.slice(0,5).map(c=>{const d=new Date(c.t);return `<div>${d.getMonth()+1}/${d.getDate()} · ${c.txt}</div>`}).join(''):'아직 변경 이력이 없어요.'}
['gkg','gwk','gw','gs','gm'].forEach(i=>{$('#'+i).oninput=goalIn;$('#'+i).onchange=()=>{goalIn();goalLog()}});
function refresh(){posterUI();lockUI();phase=(cyc[key(sim)]||{}).p||((typeof cyPhase=='function'&&cyPhase(sim.getTime()))||{}).p||null;cyUI();nbUI();vwUI();phasesUI();pmsBn();dateUI();quickUI();waterUI();stepsUI();exUI();weekRender();show();upd();condUI();tot();sens()}
loadState();if(!PL||!PL.s)PL={s:[...((PL&&PL.p)||[]),...((PL&&PL.w!=null)?[PL.w]:[])],c:[]};G.water=Math.min(2000,Math.max(500,G.water||2000));$('#gw').value=G.water;G.meals=Math.min(3,G.meals||3);$('#gm').value=G.meals;plBoxes();G0={...G};goalMsg();// 기본 정보 몸무게로 첫 기록을 한 번만 채움(민감정보 삭제 후 다시 생기지 않게)
if(!wlog.length&&profileDone&&!wsd)logWeight(+$('#wt').value);if(profileDone)wsd=true;calc();wmenu();phasesUI();pmsBn();refresh();
$('#wipe').onclick=()=>{wiped=true;try{localStorage.removeItem(SK)}catch(e){}toast('삭제했어요. 다시 불러와요');idbClear().finally(()=>{try{location.reload()}catch(e){}})};

/* poster */
function posterUI(){
 const pg=window.PROT||0,cg=window.CARBMIN||130,ok=pg>0;
 $('#pmsm').textContent=LC()?'탄수 1은 끼니마다 꼭 · 종류는 매일 바꿔도 OK':'단백질은 끼니마다 나눠서';
 $('.pright').textContent=combo();bodyOrder();tyUI();
 $('#pt1').textContent=G.weeks%4==0?(G.weeks/4)+'달':G.weeks+'주';$('#pt2').textContent=SV.view=='hide'?'🌿 내 페이스':'−'+G.kg+'kg';
 $('#pstats').innerHTML=[[ok?cg+'g↑':'-','탄수'],[ok?pg+'g':'-','단백질'],[(G.water/1000).toFixed(1)+'L','물'],[G.steps.toLocaleString(),'걸음']].map(([a,b])=>`<div class="pst"><b>${a}</b><span>${b}</span></div>`).join('');
 $('#pweek').innerHTML=DW.map((d,i)=>{let t='걷기',c='';if(PL.s.includes(i)){t='근력';c='p'}else if(PL.c.includes(i)){t='유산소';c='w'}return `<div class="${c} ${i==todayIdx?'t':''}"><b>${d}</b>${t}</div>`}).join('');
 const sh=[.25,.3,.3,.15].map(r=>ok?Math.round(pg*r/5)*5:0),sc=SCH[SV.sched]||SCH.day,M=dietM().map(([a,b],i)=>[`<span class="en">${sc.en[i]}</span><span class="pmn">${sc.m[i]}</span>`,a+'<br>'+b+(i==2?', '+sc.last:''),['--sky','--leaf-soft','--blush','--lilac'][i]]);
 $('#pmeals').innerHTML=M.map(([n,t,c],i)=>`<div class="pm" style="background:var(${c})"><div><span>${n}</span><small>${sh[i]?'단백질 ~'+sh[i]+'g':''}</small></div>${t}</div>`).join('');
}
const _wr=weekRender;weekRender=function(){_wr();posterUI()};
/* lock screen */
function todayData(){return key(rd)==key(sim)?{water,steps}:(days[key(sim)]||{water:0,steps:0})}
function lockUI(){if(!$('#wbn'))return;const t=todayData(),gc=Math.max(1,Math.ceil(G.water/200)),cups=Math.floor(t.water/200);
 $('#wbs').textContent=`오늘 ${cups}/${gc}잔`;
 $('#wdrops').innerHTML=Array.from({length:Math.max(gc,cups)},(_,i)=>`<span style="opacity:${i<cups?1:.25}">💧</span>`).join('');
 $('#wbar2').style.width=Math.min(100,t.water/G.water*100)+'%'}
function todayRec(){return key(rd)==key(sim)?null:(days[key(sim)]||(days[key(sim)]={logs:[],water:0,steps:0,exDone:false}))}
function addWaterToday(ml){const o=todayRec();if(!o){water=Math.max(0,water+ml);waterUI();renderReq()}else{o.water=Math.max(0,o.water+ml);lockUI()}}
$('#wplus').onclick=()=>{addWaterToday(200);toast('💧 물 1잔 기록! ('+Math.floor(todayData().water/200)+'잔)')};
$('#wminus').onclick=()=>{addWaterToday(-200)};
function checkHash(){if(location.hash!=='#water')return;try{const t=Date.now(),l=+sessionStorage.getItem('wlast')||0;if(t-l<4000)return;sessionStorage.setItem('wlast',t)}catch(e){}addWaterToday(200);toast('💧 물 1잔 기록!');try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}
addEventListener('hashchange',checkHash);
/* wallpaper */
let wpTheme=null;
// 배경화면 색은 style.css 테마 토큰을 그대로 읽어 온다(밝게/어둡게는 data-mode로 고름)
function thVars(mode){const d=document.createElement('div');d.setAttribute('data-theme',effTh(mode));d.setAttribute('data-mode',mode);d.style.display='none';document.body.appendChild(d);
 const cs=getComputedStyle(d),o={};['bg','surface','text','text-sub','accent','accent-2','accent-soft','line','c-sky','c-blush','c-lilac','c-lemon','drop','radius','page-bg'].forEach(k=>o[k]=cs.getPropertyValue('--'+k).trim());d.remove();return o}
const WPS={star:'M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z',spark:'M12 1.5l2.6 7.9 7.9 2.6-7.9 2.6L12 22.5l-2.6-7.9L1.5 12l7.9-2.6z',petal:'M12 2C6 6 3.5 11.5 6 16.5c2.4 4.4 8.6 5.8 12 1.6 3.4-4.4.8-11.6-6-16.1z',clover:'M12 3a4 4 0 0 1 0 8 4 4 0 0 1 0-8zM17 8a4 4 0 0 1 0 8 4 4 0 0 1 0-8zM12 13a4 4 0 0 1 0 8 4 4 0 0 1 0-8zM7 8a4 4 0 0 1 0 8 4 4 0 0 1 0-8z'};
// 배경 이미지·무늬는 미리 불러 둔다(배경화면을 그릴 때 바로 쓰게)
const WPI={};
function wpSrc(mode){return [...(thVars(mode)['page-bg']||'').matchAll(/url\((?:"([^"]+)"|([^)"]+))\)/g)].map(m=>m[1]||m[2])}
function wpPrep(mode){return Promise.all(wpSrc(mode).map(s=>WPI[s]?WPI[s]:(WPI[s]=new Promise(ok=>{const im=new Image();im.onload=()=>ok(im);im.onerror=()=>ok(null);im.src=s}))))}
async function wpLoad(mode){const ims=await wpPrep(mode);wpSrc(mode).forEach((s,i)=>WPI[s+'#img']=ims[i])}
function wpDraw(theme){const W=1170,H=2532,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d'),D=theme=='dark',v=thVars(D?'dark':'light'),T=effTh(D?'dark':'light');
 const C={bg:v.bg,ink:v.text,card:v.surface,yel:v['c-lemon'],yt:v.text,sky:v['c-sky'],leaf:v['accent-soft'],blush:v['c-blush'],lilac:v['c-lilac'],sub:v['text-sub'],line:v.line,accent:v.accent};
 const F="'Noto Sans KR','Apple SD Gothic Neo',system-ui,sans-serif",MONO="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace",R=Math.max(12,(parseFloat(v.radius)||8)*3),IMGT=T=='y2k'||T=='romantic'||T=='vintage';
 // 테마별 카드: 미니멀 얇은 선 / Y2K 1.5px 진한 테두리 / 로맨틱 테두리 없이 옅은 그림자 / 빈티지 얇은 선 + 아래 그림자
 const FR={minimal:{w:3,c:C.line},y2k:{w:4.5,c:C.ink},romantic:{w:0,sh:['rgba(90,62,54,.10)',60,18]},vintage:{w:3,c:C.line,sh:['rgba(74,59,51,.08)',0,6]}}[T]||{w:3,c:C.line};
 const rr=(a,b,w,h,r,fill,stroke)=>{x.save();if(stroke&&FR.sh&&fill){x.shadowColor=FR.sh[0];x.shadowBlur=FR.sh[1];x.shadowOffsetY=FR.sh[2]}x.beginPath();x.roundRect(a,b,w,h,r);if(fill){x.fillStyle=fill;x.fill()}x.restore();if(stroke&&FR.w){x.beginPath();x.roundRect(a,b,w,h,r);x.lineWidth=FR.w;x.strokeStyle=FR.c;x.stroke()}};
 const isY=T=='y2k';
 const tx=(t,a,b,sz,wt,col,al,fam)=>{x.font=`${wt} ${sz}px ${fam||F}`;x.textAlign=al||'left';x.textBaseline='alphabetic';x.fillStyle=col;x.fillText(t,a,b)};
 // 배경 위 글자 아래에 면 색 라벨(명암비 유지)
 const lbl=(a,b,w,sz)=>{if(IMGT)rr(a-18,b-sz*1.02,w+36,sz*1.36,Math.min(R,sz*.6),C.card)};
 const tw=(t,sz,wt)=>{x.font=`${wt} ${sz}px ${F}`;return x.measureText(t).width};
 const rgba=(h,a)=>{const n=parseInt(h.slice(1),16);return `rgba(${n>>16},${n>>8&255},${n&255},${a})`};
 const icon=(d,px,py,size,fill,stroke,rot,lw)=>{x.save();x.translate(px+size/2,py+size/2);x.rotate((rot||0)*Math.PI/180);const k=size/24;x.scale(k,k);x.translate(-12,-12);const p=new Path2D(d);if(fill){x.fillStyle=fill;x.fill(p)}if(stroke){x.lineWidth=lw||1.2;x.lineJoin='round';x.strokeStyle=stroke;x.stroke(p)}x.restore()};
 const chrome=(a,b,s)=>{const g=x.createLinearGradient(a,b,a+s,b+s);[[0,'#FBFBFC'],[.38,'#C3C8CF'],[.55,'#F2F3F5'],[1,'#A9AEB7']].forEach(([o,cc])=>g.addColorStop(o,cc));return g};
 const tape=(a,b,w,rot,c1,c2)=>{x.save();x.translate(a,b);x.rotate(rot*Math.PI/180);x.globalAlpha=.85;for(let i=0;i<w;i+=18){x.fillStyle=(i/18)%2?c2:c1;x.fillRect(i,0,Math.min(18,w-i),56)}x.restore()};
 // 배경
 x.fillStyle=C.bg;x.fillRect(0,0,W,H);
 const src=wpSrc(D?'dark':'light'),im=src.length&&WPI[src[0]+'#img'];
 if(im&&T!='vintage'){const k=Math.max(W/im.width,H/im.height),iw=im.width*k,ih=im.height*k;x.drawImage(im,(W-iw)/2,(H-ih)/2,iw,ih);if(D){x.fillStyle=T=='y2k'?'rgba(16,20,22,.86)':'rgba(28,20,18,.84)';x.fillRect(0,0,W,H)}}
 if(im&&T=='vintage'){const p=x.createPattern(im,'repeat');p.setTransform(new DOMMatrix().scale(3));x.fillStyle=p;x.fillRect(0,0,W,H)}
 const L=70,CW=W-2*L;
 // 잠금화면 위젯 줄(시계 바로 아래 가운데)에 물 1잔 단축어 위젯이 놓이도록 물방울 버튼 자리를 맞춘다(앱 첫 화면 #wbn과 같은 배치)
 const wy=640,wh=200,cx=W/2,cy=wy+wh/2,cr=96;
 rr(L,wy,CW,wh,Math.min(R*1.4,90),C.sky,1);
 x.beginPath();x.arc(cx,cy,cr,0,Math.PI*2);x.fillStyle=v['surface']&&IMGT?'#FFFFFF':C.card;if(D)x.fillStyle=C.bg;x.fill();x.lineWidth=7;x.strokeStyle=C.ink;x.stroke();
 x.save();x.translate(cx-12*5.2,cy-12*5.2-6);x.scale(5.2,5.2);x.fillStyle=v.drop;x.fill(new Path2D('M12 2.5C12 2.5 5 10.3 5 15a7 7 0 0 0 14 0c0-4.7-7-12.5-7-12.5z'));x.strokeStyle='rgba(255,255,255,.8)';x.lineWidth=1.6;x.lineCap='round';x.stroke(new Path2D('M9 15.5a3 3 0 0 0 3 3'));x.restore();
 tx('💧 물 마시기',L+44,cy-8,46,900,C.ink);tx('하루 '+Math.round(G.water/200)+'잔',L+44,cy+52,34,500,C.sub);
 tx('누르면',W-L-44,cy-8,38,700,C.ink,'right');tx('+1잔',W-L-44,cy+52,38,700,C.ink,'right');
 const cb=$('.pright').textContent;lbl(L,904,tw(cb,36,700),36);tx(cb,L,904,36,700,C.sub);// 타입 × 테마
 let y=944;
 const t1=$('#pt1').textContent,w1=tw(t1,140,900);lbl(L,y+120,w1,140);tx(t1,L,y+120,140,900,C.ink);
 const t2=$('#pt2').textContent,w2=tw(t2,110,900)+70;
 rr(L+w1+50,y,w2,150,Math.min(R,40),C.yel);tx(t2,L+w1+50+w2/2,y+112,110,900,C.yt,'center');
 y+=200;
 const st=[...document.querySelectorAll('#pstats .pst')].map(e=>[e.querySelector('b').textContent,e.querySelector('span').textContent]),g=24,bw=(CW-3*g)/4;
 st.forEach(([a,b],i)=>{const bx=L+i*(bw+g);rr(bx,y,bw,170,R,C.card,1);tx(a,bx+bw/2,y+86,a.length>6?44:54,900,C.ink,'center');tx(b,bx+bw/2,y+138,32,500,C.sub,'center')});
 y+=250;lbl(L,y,tw('주간 루틴',54,900),54);tx('주간 루틴',L,y,54,900,C.ink);y+=30;
 const wk=[...document.querySelectorAll('#pweek > div')],cg=14,cw=(CW-6*cg)/7;
 wk.forEach((e,i)=>{const bx=L+i*(cw+cg),k=e.className.includes('p')?C.blush:e.className.includes('w')?C.lilac:C.card;rr(bx,y,cw,160,Math.min(R,34),k,1);tx(e.querySelector('b').textContent,bx+cw/2,y+68,42,900,C.ink,'center');tx(e.lastChild.textContent,bx+cw/2,y+120,30,500,C.sub,'center')});
 y+=240;const ms=$('#pmsm').textContent,w3=tw('하루 식단',54,900);lbl(L,y,w3+30+tw(ms,32,500),54);tx('하루 식단',L,y,54,900,C.ink);tx(ms,L+w3+30,y,32,500,C.sub);y+=30;
 const pm=[...document.querySelectorAll('#pmeals .pm')],cols=[C.sky,C.leaf,C.blush,C.lilac],mg=24,mw=(CW-mg)/2;
 pm.forEach((e,i)=>{const bx=L+(i%2)*(mw+mg),by=y+Math.floor(i/2)*(230+mg),en=isY?(e.querySelector('.en')||{}).textContent:'';rr(bx,by,mw,230,R,cols[i],1);
  const o=en?24:0;if(en)tx(en.replace(/[ ·]+$/,''),bx+34,by+46,26,700,C.sub,'left',MONO);
  tx((e.querySelector('.pmn')||e.firstElementChild).textContent,bx+34,by+66+o,46,900,C.ink);const sm=e.querySelector('small').textContent;tx(sm,bx+mw-34,by+68+o,30,500,C.sub,'right');
  e.innerHTML.replace(/^<div>.*?<\/div>/,'').split('<br>').forEach((ln,j)=>tx(ln.replace(/<[^>]+>/g,'').trim(),bx+34,by+120+o+j*(o?40:44),34,500,C.ink))});
 const end=y+2*230+mg;
 // 장식(정적): 글자와 겹치지 않는 자리, 아래쪽 손전등·카메라 버튼 자리는 피함
 if(T=='y2k'){const sk=D?'#EEF2F3':'#24232B';icon(WPS.spark,W-L-90,wy-70,110,chrome(W-L-90,wy-70,110),sk,0,.8);icon(WPS.spark,W/2-36,end+30,72,chrome(W/2-36,end+30,72),sk,0,.9);
  x.save();x.lineWidth=16;x.strokeStyle=chrome(L-10,wy-80,100);x.beginPath();x.arc(L+40,wy-30,38,0,Math.PI*2);x.stroke();x.lineWidth=2.5;x.strokeStyle=sk;x.beginPath();x.arc(L+40,wy-30,47,0,Math.PI*2);x.stroke();x.beginPath();x.arc(L+40,wy-30,29,0,Math.PI*2);x.stroke();x.restore()}
 if(T=='romantic'){const pc=D?['#C98F7E','#B98273','#D49C8A']:['#F6C9B8','#F8D5C6','#F3BFAC'];icon(WPS.petal,L-20,wy-110,110,pc[0],null,-30);icon(WPS.petal,W-L-110,wy-100,96,pc[2],null,60);icon(WPS.petal,W/2-45,end+24,90,pc[1],null,20)}
 if(T=='vintage'){const sk=D?'#F3E9DC':'#4A3B33';tape(L+30,wy-26,150,-6,'#F2A7C3','#FBE3EC');tape(W-L-200,y-22,150,5,'#A9CBEB','#E4EEF7');
  icon(WPS.star,W-L-80,wy-90,70,'#F2A7C3',sk,0,1);icon(WPS.star,W/2+60,end+34,56,'#A9CBEB',sk,0,1);icon(WPS.clover,W/2-120,end+30,60,'#9DB69A',null);tx('· + ·',W/2-10,end+76,40,700,D?'#E08A64':'#C2483D','center')}
 return c.toDataURL('image/png')}
async function wpOpen(theme){wpTheme=theme||wpTheme||curMode();try{await document.fonts.load("900 40px 'Noto Sans KR'");await document.fonts.load("500 40px 'Noto Sans KR'")}catch(e){}await wpLoad(wpTheme);
 $('#wpimg').src=wpDraw(wpTheme);$$('[data-wp]').forEach(b=>b.classList.toggle('on',b.dataset.wp==wpTheme));$('#wpov').hidden=false}
$('#wpbtn').onclick=()=>wpOpen();
$$('[data-wp]').forEach(b=>b.onclick=()=>wpOpen(b.dataset.wp));
$('#wpclose').onclick=()=>{$('#wpov').hidden=true};
$('#wpshare').onclick=async()=>{try{const r=await fetch($('#wpimg').src),bl=await r.blob(),f=new File([bl],'diet-wallpaper.png',{type:'image/png'});if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f]});return}}catch(e){}toast('이 화면에선 공유가 막혀 있어요. 이미지를 길게 눌러 저장해 주세요')};
/* onboarding */
function onbOpen(fromSv){const ty=SV.done?TY[typeOf()]:null;$('#onbstep').hidden=!fromSv;$('#onbt').textContent=ty?`${ty.e} ${ty.n} 루틴 만들기`:'시작해볼까요?';$('#onbs').textContent=ty?'나이·키·몸무게를 넣으면 내 타입에 맞춘 탄·단·지 기준과 하루 식단이 첫 화면에 만들어져요. 나중에 언제든 바꿀 수 있어요.':'기본 정보를 넣으면 나에게 맞는 루틴이 첫 화면에 만들어져요. 나중에 언제든 바꿀 수 있어요.';$('#onbskip').hidden=!profileDone;const hc=!!(consent&&CY&&CY.starts.length);$('#ocyon').checked=hc;$('#ocyf').hidden=!hc;$('#ocylast').value=hc?ymd(CY.starts[CY.starts.length-1]):'';$('#ocyc').value=CY?CY.cyc:28;$('#ocylen').value=CY?CY.len:5;$('#ocylast').max=ymd(sim.getTime());$('#oage').value=$('#age').value;$('#oht').value=$('#ht').value;$('#owt').value=$('#wt').value;$('#opa').value=$('#pa').value;$('#okg').value=G.kg;$('#owk').value=G.weeks;plBoxes();$('#onbmsg').textContent='';$('#onb').hidden=false}
$('#onbre').onclick=()=>onbOpen();
$('#ocyon').onchange=e=>{$('#ocyf').hidden=!e.target.checked};
$('#onbskip').onclick=()=>{$('#onb').hidden=true;scrollTo(0,0);if(SV.done)toast(`${TY[typeOf()].e} ${TY[typeOf()].n} 루틴으로 맞췄어요`)};
$('#onbgo').onclick=()=>{const age=+$('#oage').value,ht=+$('#oht').value,wt=+$('#owt').value,m=$('#onbmsg');
 if(!(age>=19&&age<=80))return m.textContent='이 앱은 19~80세 성인 기준으로 만들어졌어요.';
 if(!(ht>=120&&ht<=220&&wt>=30&&wt<=250))return m.textContent='키와 몸무게를 확인해 주세요.';
 if($('#ocyon').checked){const bk=CY?JSON.parse(JSON.stringify(CY)):null,e=cySet($('#ocylast').value,$('#ocyc').value,$('#ocylen').value);if(e){CY=bk;return m.textContent='생리주기: '+e}if(!consent)setConsent(true)}
 $('#age').value=age;$('#ht').value=ht;$('#wt').value=wt;$('#pa').value=$('#opa').value;
 G.kg=Math.min(20,Math.max(1,+$('#okg').value||5));G.weeks=Math.min(52,Math.max(2,Math.round(+$('#owk').value)||8));$('#gkg').value=G.kg;$('#gwk').value=G.weeks;

 if(!profileDone)wlog=[];logWeight(wt);logChg(profileDone?'기본정보 다시 입력':'기본정보 입력');G0={...G};profileDone=true;$('#onb').hidden=true;goalMsg();calc();refresh();scrollTo(0,0);toast(SV.done?combo()+' 루틴을 만들었어요':'내 루틴을 만들었어요')};
applyTheme();if(!SV.done&&!SV.skip)svOpen();else if(!thmSet)thpOpen(!profileDone);else if(!profileDone)onbOpen();checkHash();chgUI();posterUI();lockUI();
setInterval(saveState,1500);addEventListener('pagehide',saveState);document.addEventListener('visibilitychange',saveState);
