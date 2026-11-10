'use strict';
const $=id=>document.getElementById(id);
const MEMBERS=[['ERIC','에릭'],['JACOB','제이콥'],['YOUNGHOON','영훈'],['HYUNJAE','현재'],['JUYEON','주연'],['KEVIN','케빈'],['NEW','뉴'],['Q','큐'],['SUNWOO','선우']];
const LEVELS=[['First Encounter','첫 만남'],['Everyday Moments','일상 대화'],['An Invitation','특별한 초대'],['Secret Messages','비밀 메시지'],['The Final Evening','특별한 밤']];
const BANK=[
[['안녕하세요','你好',['谢谢','再见','对不起']],['감사합니다','谢谢',['晚安','没关系','请进']],['이름','名字',['时间','地点','朋友']],['친구','朋友',['老师','家人','天气']],['만나다','见面',['喝水','回家','等待']],['반갑습니다','很高兴认识你',['我很累','我饿了','晚安']],['저는 학생이에요','我是学生',['我是老师','我在家','我是韩国人']],['잘 가요','再见',['谢谢','请坐','早上好']]],
[['오늘','今天',['昨天','明天','现在']],['내일','明天',['今天','昨天','上周']],['어제','昨天',['明天','今天','下个月']],['물','水',['咖啡','牛奶','茶']],['밥','饭',['书','衣服','房间']],['좋아요','很好／喜欢',['讨厌','不知道','很远']],['어디예요?','在哪里？',['多少钱？','几点了？','你是谁？']],['괜찮아요','没关系',['对不起','谢谢','再见']]],
[['시간','时间',['天气','朋友','名字']],['약속','约定',['礼物','房间','窗户']],['같이','一起',['独自','昨天','非常']],['기다리다','等待',['离开','吃饭','忘记']],['초대하다','邀请',['拒绝','睡觉','学习']],['언제','什么时候',['哪里','为什么','谁']],['주말','周末',['工作日','早晨','夜晚']],['만날까요?','要见面吗？',['吃过了吗？','在哪里？','下雨了吗？']]],
[['비밀','秘密',['声音','照片','回忆']],['메시지','消息',['电影','书本','钥匙']],['기억하다','记得',['忘记','离开','关闭']],['보고 싶어요','我想你',['我困了','我害怕','我饱了']],['조용히','安静地',['迅速地','明亮地','突然地']],['진심','真心',['谎言','秘密','运气']],['설레다','心动／期待',['生气','悲伤','无聊']],['믿어요','我相信',['我忘记','我拒绝','我离开']]],
[['별','星星',['月亮','太阳','云']],['밤','夜晚',['早晨','中午','下午']],['함께','一起',['永远','独自','突然']],['소중하다','珍贵',['危险','便宜','复杂']],['행복하다','幸福',['疲惫','生气','寒冷']],['고마워요','谢谢你',['对不起','请离开','我不知道']],['계속','继续',['停止','偶尔','已经']],['내일도 만나요','明天也见面吧',['昨天见过了','现在回家吧','今天不见了']]]
];
const STORY=[{ko:'아직 안 갔어?',zh:'还没走吗？',note:'深夜的私人休息室，灯光还亮着。'},{ko:'오늘도 열심히 했네.',zh:'今天也很努力呢。',note:'他放下手中的书，向你走近。'},{ko:'벌써 닷새째야. 대단하다.',zh:'已经是第五天了，真厉害。',note:'你听见他轻轻笑了一声。'},{ko:'내일도 같이 공부할래?',zh:'明天也要一起学习吗？',note:'你要怎样回答？',choices:['응, 약속해! · 嗯，约好了！','물론이지! · 当然！']},{ko:'그럼 내일 여기서 기다릴게.',zh:'那我明天就在这里等你。',note:'一段新的故事，才刚刚开始。'}];
const DB='tb-private-quest-v1';let db,assets=[],custom=[],progress={selected:4,passed:[],attempts:0,dates:[],storyUnlocked:false},quiz=null,scene=0,audio=null,objectURL=null;
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open(DB,1);req.onupgradeneeded=()=>{const d=req.result;d.createObjectStore('assets',{keyPath:'key'});d.createObjectStore('questions',{keyPath:'id'});d.createObjectStore('state',{keyPath:'key'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function getAll(store){return new Promise((resolve,reject)=>{const req=db.transaction(store,'readonly').objectStore(store).getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
function put(store,value){return new Promise((resolve,reject)=>{const tx=db.transaction(store,'readwrite');tx.objectStore(store).put(value);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function parseDay(s){const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d);}
function streak(){const days=new Set(progress.dates);let cursor=new Date();if(!days.has(dateKey(cursor)))cursor.setDate(cursor.getDate()-1);let count=0;while(days.has(dateKey(cursor))){count++;cursor.setDate(cursor.getDate()-1);}return count;}
function toast(msg){const e=$('toast');e.textContent=msg;e.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>e.style.display='none',3600);}
function stopAudio(){if(audio){audio.pause();audio=null;}if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null;}}
function play(blob){stopAudio();if(!blob){toast('请先在 COLLECTION 上传这段音频。');return;}objectURL=URL.createObjectURL(blob);audio=new Audio(objectURL);audio.onended=stopAudio;audio.play().catch(()=>{toast('音频无法播放，请检查文件格式。');stopAudio();});}
function asset(key){return assets.find(x=>x.key===key)?.blob||null;}
function playVoice(type){const blob=asset(`${progress.selected}:voice:${type}`);if(blob)play(blob);}
function renderMembers(){const root=$('memberGrid');root.replaceChildren();MEMBERS.forEach(([name,ko],i)=>{const b=document.createElement('button');b.type='button';b.className='member-card'+(progress.selected===i?' active':'');const photo=document.createElement('div');photo.className='member-photo';const blob=asset(`${i}:photo`);if(blob){const img=document.createElement('img');const url=URL.createObjectURL(blob);img.src=url;img.alt=name;img.onload=()=>URL.revokeObjectURL(url);photo.append(img);}else{const initial=document.createElement('span');initial.textContent=name[0];photo.append(initial);}const details=document.createElement('div');details.className='member-details';const strong=document.createElement('strong');strong.textContent=name;const small=document.createElement('small');small.textContent=ko;details.append(strong,small);b.append(photo,details);b.addEventListener('click',async()=>{progress.selected=i;await saveProgress();renderMembers();renderDashboard();playVoice('welcome');toast(`${name} 已成为你的陪学成员`);});root.append(b);});$('selectedNote').textContent=`CURRENT COMPANION · ${MEMBERS[progress.selected][0]} / ${MEMBERS[progress.selected][1]}`;}
function renderDashboard(){const n=progress.passed.length;$('dashMember').textContent=MEMBERS[progress.selected][0];$('dashLevels').textContent=`${n} / ${LEVELS.length}`;$('dashStreak').textContent=`${streak()} DAYS`;$('archiveSummary').textContent=`已通关 ${n} / 5 关 · 累计答题 ${progress.attempts} 次 · 已记录 ${progress.dates.length} 个有效学习日。`;const mark=$('dayMarks');mark.replaceChildren();for(let i=1;i<=5;i++){const box=document.createElement('div');box.className='day'+(i<=Math.min(streak(),5)?' done':'');box.textContent=`DAY ${i}`;mark.append(box);}const today=progress.dates.includes(dateKey());$('streakDetail').textContent=`当前连续 ${streak()} 天。${today?'今天的学习已达标。':'今天尚未完成有效关卡。'} 只有连续自然日达标才计入五日约定。`;renderLevels();renderStory();}
function renderLevels(){const map=$('levelMap');map.replaceChildren();LEVELS.forEach(([en,ko],i)=>{const passed=progress.passed.includes(i);const available=passed||i===0||progress.passed.includes(i-1);const b=document.createElement('button');b.type='button';b.className='level'+(passed?' passed':'');b.disabled=!available;const circle=document.createElement('span');circle.className='node';circle.textContent=passed?'✓':available?String(i+1).padStart(2,'0'):'♢';const copy=document.createElement('span');const name=document.createElement('strong');name.textContent=en;const sub=document.createElement('small');sub.textContent=`${ko} · ${passed?'COMPLETED · REPLAY':available?'AVAILABLE · START':'LOCKED'}`;copy.append(name,sub);b.append(circle,copy);b.addEventListener('click',()=>startQuiz(i));map.append(b);});}
function pool(level){return [...BANK[level].map((q,i)=>({id:`seed-${level}-${i}`,level,word:q[0],answer:q[1],wrong:q[2]})),...custom.filter(q=>q.level===level)];}
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function startQuiz(level){stopAudio();const list=shuffle(pool(level));if(list.length<8){toast('该关题库不足 8 道题。');return;}quiz={level,items:list.slice(0,8),index:0,correct:0,selected:null,done:false};$('quizModal').classList.remove('hidden');document.body.style.overflow='hidden';renderQuestion();}
function closeQuiz(){quiz=null;stopAudio();$('quizModal').classList.add('hidden');document.body.style.overflow='';}
function renderQuestion(){if(!quiz)return;const q=quiz.items[quiz.index];$('quizBar').style.width=`${quiz.index/8*100}%`;$('quizNext').disabled=true;$('quizNext').textContent='CONTINUE →';$('quizFeedback').textContent='';const root=$('quizBody');root.replaceChildren();const eyebrow=document.createElement('div');eyebrow.className='eyebrow';eyebrow.textContent=`QUESTION ${quiz.index+1} / 8 · ${LEVELS[quiz.level][0]}`;const h=document.createElement('h3');h.textContent=q.word;const intro=document.createElement('p');intro.className='muted';intro.textContent='请选择正确的中文意思。';const audioBlob = asset(`question:${q.id}`) || q.audio;asset(`question:${q.id}`);if(audioBlob){const listen=document.createElement('button');listen.type='button';listen.className='btn ghost';listen.textContent='♫ LISTEN TO WORD';listen.addEventListener('click',()=>play(audioBlob));root.append(eyebrow,h,intro,listen);}else root.append(eyebrow,h,intro);const options=document.createElement('div');options.className='answers';shuffle([q.answer,...q.wrong]).forEach(label=>{const btn=document.createElement('button');btn.type='button';btn.textContent=label;btn.addEventListener('click',()=>{if(quiz.selected!==null)return;quiz.selected=label;const correct=label===q.answer;if(correct){quiz.correct++;playVoice('correct');}else playVoice('wrong');options.querySelectorAll('button').forEach(x=>{x.disabled=true;if(x.textContent===q.answer)x.classList.add('correct');else if(x===btn)x.classList.add('wrong');});$('quizFeedback').textContent=correct?'CORRECT · 回答正确':'NOT QUITE · 正确答案：'+q.answer;$('quizNext').disabled=false;});options.append(btn);});root.append(options);}
async function finishQuiz(){const score=quiz.correct;const level=quiz.level;progress.attempts+=8;const passed=score>=6;if(passed){if(!progress.passed.includes(level))progress.passed.push(level);const today=dateKey();if(!progress.dates.includes(today))progress.dates.push(today);progress.dates.sort();if(streak()>=5)progress.storyUnlocked=true;playVoice('finish');}await saveProgress();const root=$('quizBody');root.replaceChildren();const title=document.createElement('h3');title.textContent=passed?'TRIAL COMPLETE':'TRY AGAIN';const desc=document.createElement('p');desc.className='muted';desc.textContent=`答对 ${score} / 8 题 · ${passed?'关卡已通过，今天的学习记录已更新。':'至少答对 6 题才能通关，请再试一次。'}`;root.append(title,desc);$('quizBar').style.width='100%';$('quizFeedback').textContent=progress.storyUnlocked?'SECRET STORY UNLOCKED · JUYEON':'THE CLUB AWAITS YOUR RETURN';$('quizNext').disabled=false;$('quizNext').textContent='RETURN TO THE CLUB →';quiz.done=true;renderDashboard();}
async function saveProgress(){await put('state',{key:'progress',value:progress});}
function renderStory(){const unlocked=progress.storyUnlocked;$('storyBadge').textContent=unlocked?'UNLOCKED · JUYEON STORY 001':`LOCKED · ${Math.min(streak(),5)} / 5 DAYS`;$('storyNext').disabled=!unlocked;if(!unlocked){$('storyKorean').textContent='A story worth earning.';$('storyChinese').textContent='连续五个不同自然日完成至少一关，解锁柱延的原创韩语互动剧情。';$('storyChoices').replaceChildren();return;}const s=STORY[scene];$('storyKorean').textContent=s.ko;$('storyChinese').textContent=s.zh+' · '+s.note;const root=$('storyChoices');root.replaceChildren();(s.choices||[]).forEach(choice=>{const b=document.createElement('button');b.type='button';b.textContent=choice;b.addEventListener('click',()=>{scene=(scene+1)%STORY.length;renderStory();});root.append(b);});$('storyNext').disabled=!!s.choices;$('storyNext').textContent=scene===STORY.length-1?'REPLAY STORY ↺':'CONTINUE →';}
function validateFile(file,type){if(!file)return true;const limit=type==='image'?5:12;if(file.size>limit*1024*1024)throw Error(`文件过大，${type==='image'?'照片':'音频'}不能超过 ${limit} MB`);if(type==='image'&&!file.type.startsWith('image/'))throw Error('请选择图片文件');if(type==='audio'&&!file.type.startsWith('audio/')&&!/\.(mp3|m4a|wav|ogg)$/i.test(file.name))throw Error('请选择音频文件');return true;}
async function saveMember(e){e.preventDefault();const i=Number($('memberSelect').value);const photo=$('memberPhoto').files[0];const voice=$('memberVoice').files[0];if(!photo&&!voice){$('memberStatus').textContent='请至少选择一张照片或一段录音。';return;}try{validateFile(photo,'image');validateFile(voice,'audio');if(photo){const obj={key:`${i}:photo`,blob:photo};await put('assets',obj);assets=assets.filter(a=>a.key!==obj.key).concat(obj);}if(voice){const obj={key:`${i}:voice:${$('voiceType').value}`,blob:voice};await put('assets',obj);assets=assets.filter(a=>a.key!==obj.key).concat(obj);}e.target.reset();$('memberStatus').textContent='已保存到当前浏览器。';renderMembers();toast('成员素材保存成功');}catch(err){$('memberStatus').textContent='保存失败：'+err.message;}}
async function saveQuestion(e){e.preventDefault();const audio=$('qAudio').files[0];try{validateFile(audio,'audio');const id=`custom-${Date.now()}-${Math.random().toString(36).slice(2)}`;const q={id,level:Number($('qLevel').value),word:$('qKorean').value.trim(),answer:$('qAnswer').value.trim(),wrong:[$('qWrong1').value.trim(),$('qWrong2').value.trim(),$('qWrong3').value.trim()],audio:audio||null};if(!q.word||!q.answer||q.wrong.some(x=>!x)||new Set([q.answer,...q.wrong]).size!==4)throw Error('请填写四个互不相同的答案选项。');await put('questions',q);custom.push(q);e.target.reset();$('questionStatus').textContent='题目已加入题库。';toast('新题目保存成功');}catch(err){$('questionStatus').textContent='保存失败：'+err.message;}}
function exportData(){const data={version:1,exportedAt:new Date().toISOString(),progress,customQuestions:custom.map(({audio,...q})=>q)};const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='the-boyz-learning-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function wire(){const menu=$('menu');menu.addEventListener('click',()=>{const open=$('nav').classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});$('nav').querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{$('nav').classList.remove('open');menu.setAttribute('aria-expanded','false');}));$('memberForm').addEventListener('submit',saveMember);$('questionForm').addEventListener('submit',saveQuestion);$('closeQuiz').addEventListener('click',closeQuiz);$('quizNext').addEventListener('click',async()=>{if(!quiz)return;if(quiz.done){closeQuiz();return;}if(quiz.selected===null)return;if(quiz.index===7){await finishQuiz();return;}quiz.index++;quiz.selected=null;renderQuestion();});$('storyNext').addEventListener('click',()=>{if(!progress.storyUnlocked)return;scene=(scene+1)%STORY.length;renderStory();});$('exportBtn').addEventListener('click',exportData);}
async function init(){wire();MEMBERS.forEach(([en],i)=>{const opt=new Option(`${en} · ${MEMBERS[i][1]}`,String(i));$('memberSelect').add(opt);});LEVELS.forEach(([en],i)=>$('qLevel').add(new Option(`${i+1} · ${en}`,String(i))));try{db=await openDB();const [saved,qs,files]=await Promise.all([getAll('state'),getAll('questions'),getAll('assets')]);progress={...progress,...(saved.find(x=>x.key==='progress')?.value||{})};custom=qs;assets=files;setupQuestionAudio();renderMembers();renderDashboard();}catch(err){toast('无法打开浏览器数据库，请通过 Live Server 运行：'+err.message);$('memberStatus').textContent='本地数据存储不可用：'+err.message;}}
init();
function setupQuestionAudio() {
  const panel = document.createElement('details');
  panel.className = 'panel';
  panel.innerHTML = `
    <summary>给现有题目配音</summary>
    <form>
      <label for="audioLevel">所属关卡</label>
      <select id="audioLevel"></select>

      <label for="audioQuestion">选择已有题目</label>
      <select id="audioQuestion" required></select>

      <label for="audioUpload">题目发音文件</label>
      <input id="audioUpload" type="file"
             accept="audio/*,.mp3,.m4a,.wav,.ogg" required>

      <button type="submit" class="btn">保存题目发音</button>
      <p id="audioStatus" class="muted" role="status"></p>
    </form>
  `;
  $('questionForm').before(panel);

  const form = panel.querySelector('form');
  const level = $('audioLevel');
  const question = $('audioQuestion');
  const upload = $('audioUpload');
  const status = $('audioStatus');
  const saveButton = form.querySelector('button');

  LEVELS.forEach(([name], index) => {
    level.add(new Option(`${index + 1} · ${name}`, String(index)));
  });

  function showQuestions() {
    const previous = question.value;
    const questions = pool(Number(level.value));
    question.replaceChildren();

    questions.forEach(q => {
      const hasAudio = asset(`question:${q.id}`) || q.audio;
      const label = `${q.word} — ${q.answer}${hasAudio ? '（已有音频）' : ''}`;
      question.add(new Option(label, q.id));
    });

    if (questions.some(q => q.id === previous)) {
      question.value = previous;
    }
  }

  panel.addEventListener('toggle', () => {
    if (panel.open) showQuestions();
  });
  level.addEventListener('change', () => {
    upload.value = '';
    status.textContent = '';
    showQuestions();
  });
  question.addEventListener('change', () => {
    upload.value = '';
    status.textContent = '';
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const file = upload.files[0];
    if (!question.value || !file) return;

    const entry = { key: `question:${question.value}`, blob: file };
    saveButton.disabled = true;
    level.disabled = true;
    question.disabled = true;
    upload.disabled = true;

    try {
      validateFile(file, 'audio');
      await put('assets', entry);
      assets = assets.filter(item => item.key !== entry.key).concat(entry);
      upload.value = '';
      showQuestions();
      status.textContent = '已保存。进入关卡后，抽到这道题就可以点按钮听发音。';
    } catch (error) {
      status.textContent = `保存失败：${error.message}`;
    } finally {
      saveButton.disabled = false;
      level.disabled = false;
      question.disabled = false;
      upload.disabled = false;
    }
  });
}