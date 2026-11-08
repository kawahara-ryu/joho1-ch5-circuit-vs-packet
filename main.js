
// ===== リアルタイム回線占有率HUD連動 =====
window.updateTrafficHud = function (pct, label, mode = 'normal') {
    const fill = document.getElementById('hud-traffic-fill');
    const val = document.getElementById('hud-traffic-val');
    if (!fill || !val) return;

    fill.style.width = pct + '%';
    if (mode === 'alert') {
        fill.classList.add('alert');
    } else {
        fill.classList.remove('alert');
    }
    val.textContent = label || (pct + '%');
};
// ===== BGM & Web Audio API サウンドエンジン =====
const AudioContextClass = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;
let isMuted = true;

const bgmTitle = new Audio('./bgm_title.mp3');
bgmTitle.loop = true;
bgmTitle.volume = 0.35;

const bgmMain = new Audio('./bgm_main.mp3');
bgmMain.loop = true;
bgmMain.volume = 0.35;

let currentBgm = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playBgm(track) {
    if (currentBgm === track) {
        if (!isMuted && track.paused) {
            track.play().catch(() => {});
        }
        return;
    }
    if (currentBgm) {
        currentBgm.pause();
        currentBgm.currentTime = 0;
    }
    currentBgm = track;
    if (!isMuted && currentBgm) {
        currentBgm.play().catch(() => {});
    }
}

function playTone(freq, type, dur, vol = 0.12) {
    if (isMuted) return;
    initAudio();
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.008, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur);
    } catch (e) {}
}

function sfxSwitch() {
    playTone(220, 'square', 0.06, 0.15);
    setTimeout(() => playTone(440, 'triangle', 0.08, 0.15), 50);
}

function sfxPaper() {
    playTone(360, 'triangle', 0.05, 0.08);
    setTimeout(() => playTone(280, 'triangle', 0.07, 0.06), 45);
}

function sfxBusy() {
    playTone(400, 'sawtooth', 0.18, 0.15);
    setTimeout(() => playTone(400, 'sawtooth', 0.18, 0.15), 240);
}

function sfxSnip() {
    playTone(900, 'triangle', 0.05, 0.15);
    setTimeout(() => playTone(1200, 'sine', 0.06, 0.12), 45);
}

function sfxStamp() {
    playTone(130, 'triangle', 0.14, 0.35);
    setTimeout(() => playTone(75, 'sine', 0.22, 0.3), 55);
}

function sfxCorrect() {
    [523, 659, 784].forEach((f, i) => {
        setTimeout(() => playTone(f, 'sine', 0.14, 0.14), i * 80);
    });
}

function sfxWrong() {
    playTone(170, 'sawtooth', 0.25, 0.18);
    setTimeout(() => playTone(135, 'sawtooth', 0.3, 0.18), 120);
}

function sfxThunder() {
    playTone(110, 'sawtooth', 0.35, 0.28);
    setTimeout(() => playTone(65, 'square', 0.4, 0.25), 90);
}

function sfxFanfare() {
    [523, 659, 784, 1047].forEach((f, i) => {
        setTimeout(() => playTone(f, 'triangle', 0.22, 0.16), i * 110);
    });
}

window.toggleMute = function () {
    isMuted = !isMuted;
    const btn = document.getElementById('mute-btn');
    if (isMuted) {
        btn.textContent = '🔇 消音中';
        if (currentBgm) currentBgm.pause();
    } else {
        btn.textContent = '🔊 音声: ON';
        initAudio();
        if (currentBgm) currentBgm.play().catch(() => {});
        sfxSwitch();
    }
};

// ===== 各工程の確認ミニクイズ定義 (全5工程) =====
const stageQuizzes = [
    {
        id: 1,
        stage: 1,
        badge: '第一工程 検収テスト',
        title: '回線交換方式と無言時間の非効率',
        summary: 'マダム猫が紅茶を飲んで黙っている（データを送っていない）間も回線が独占され続け、消防ねこの緊急連絡が「話し中」で弾かれてしまいました。',
        question: '回線交換方式の短所として、最も適切な説明はどれニャ？',
        choices: [
            '通信中に無言の時間があっても回線を占有し続け、他の人がその回線を使えない',
            'データが勝手に小包に分割されて順番がバラバラになる',
            '通信中に他の人のデータが混ざって盗聴されやすい',
            'ヘッダの荷札を貼る作業が必要になる'
        ],
        answerIndex: 0,
        explanation: '正解ニャ！回線交換方式は1本の回線を2人だけで最初から最後まで独占するため、無言の時間も回線を塞いでしまい利用効率が悪いのが弱点ニャ。'
    },
    {
        id: 2,
        stage: 2,
        badge: '第二工程 検収テスト',
        title: 'パケット分割サイズとヘッダ（オーバーヘッド',
        summary: '1文字ずつ12個にみじん切りした時は赤い「ヘッダ荷札」ばかりが増えて非効率になり、適度な4分割にしてヘッダを貼ることで効率よく梱包できました。',
        question: 'パケット交換において、分割するサイズを「極端に小さくしすぎた」場合に起きる問題は何ニャ？',
        choices: [
            '回線交換方式に自動で切り替わってしまう',
            'データ本体（ペイロード）に対してヘッダ（制御情報）の割合が増え、通信効率が落ちる',
            '宛先IPアドレスを書かなくてよくなる',
            'ルータを通過できなくなる'
        ],
        answerIndex: 1,
        explanation: '大正解ニャ！どのパケットにも必ず一定サイズの「ヘッダ（荷札）」が付くから、中身を細かく切りすぎると荷札ばかり運ぶことになって効率が落ちるニャ！'
    },
    {
        id: 3,
        stage: 3,
        badge: '第三工程 検収テスト',
        title: 'ルータの経路制御と耐障害性',
        summary: '片方の道だけに集中させると待合室（バッファ）が混雑し、さらに落雷で北ルートが切れてもルータAの分岐器で南のう回路へ切り替えられました。',
        question: 'パケット交換方式が「回線の利用効率が高く、通信障害にも強い」と言われる理由はどれニャ？',
        choices: [
            '1本の回線を1人だけで永久に独占できるから',
            'データを確認せずにすべて破棄するから',
            '複数の通信で回線を共有でき、途中の経路が故障してもルータが別ルートへ迂回させられるから',
            'LANケーブルを使わずに念力で送るから'
        ],
        answerIndex: 2,
        explanation: '完璧ニャ！小分けにしたパケットを交互に流して回線を共有でき、しかも道が壊れたらルータが生きている別ルートへ誘導できるのがパケット交換の強みニャ！'
    },
    {
        id: 4,
        stage: 4,
        badge: '第四工程 検収テスト',
        title: 'TCPによるパケット分割・通し番号・再送制御',
        summary: '番号なしの垂れ流しでは2番が欠けたままになり、TCPモードでは通し番号付きのヘッダで欠損した2番を検知し、「再送要求」で1〜4の順番通りに注文書を復元できました。',
        question: 'TCP/IPのトランスポート層において、データをパケットに分割して「通し番号」を付けたヘッダを付加し、途中で消えたパケットの「再送要求」を行って確実な通信を実現するプロトコルはどれニャ？',
        choices: [
            'HTTP',
            'IP',
            'DNS',
            'TCP'
        ],
        answerIndex: 3,
        explanation: 'お見事ニャ！TCPはデータをパケットに分割して通し番号を振り、欠損があれば「再送要求」して確実にデータを復元するプロトコルニャ！'
    },
    {
        id: 5,
        stage: 5,
        badge: '第五工程 最終検収テスト',
        title: '小規模LANの構成と「内と外の境界」',
        summary: '外（WAN）から順に「ONU ➔ ルータ ➔ スイッチングハブ ➔ アクセスポイント」と配線し、LAN内印刷とWAN通信の通り道の違いを実験しました。',
        question: '家庭や学校の「LAN内部のパソコン」から「同じLAN内部のプリンタ」へ印刷データを送る場合、データはどこを通るニャ？',
        choices: [
            '必ずルータとONUを通って、一度外のインターネット（WAN）に出てから戻ってくる',
            'LAN内部のスイッチングハブ（やAP）だけで中継され、ルータより外のインターネット（WAN）には出ない',
            'ONU（回線終端装置）だけで光信号に変換されて直接プリンタへ飛ぶ',
            '世界中のDNSサーバをすべて経由してからプリンタに届く'
        ],
        answerIndex: 1,
        explanation: '完全制覇ニャ！同じLAN同士の通信は「スイッチングハブ」で折り返すから、ルータの外（WAN）には出ないニャ。だから外のネット回線が工事中でもLAN内のプリンタ印刷はできるニャ！'
    }
];

// ===== ゲーム全体ステート =====
let currentStage = 1;
let score = 0;
let totalMisses = 0;
let animFrameId = null;

function setScreen(screenId) {
    document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
}

function updateScore(delta) {
    score += delta;
    const el = document.getElementById('score-val');
    if (el) el.textContent = score;
}

function recordMiss() {
    totalMisses++;
    const el = document.getElementById('miss-val');
    if (el) el.textContent = totalMisses;
}

function setSpeaker(role, imgFile, text) {
    const roleEl = document.getElementById('speaker-role');
    const imgEl = document.getElementById('speaker-img');
    const textEl = document.getElementById('speech-text');
    if (roleEl) roleEl.textContent = role;
    if (imgEl) imgEl.src = './' + imgFile;
    if (textEl) textEl.innerHTML = text;
}

function setStickyNote(title, desc) {
    const t = document.getElementById('note-title');
    const d = document.getElementById('note-desc');
    if (t) t.textContent = title;
    if (d) d.innerHTML = desc;
}

function setTicker(msg) {
    const el = document.getElementById('ticker-log');
    if (el) el.textContent = msg;
}

function updateStagePills(stageNum) {
    const fill = document.getElementById('step-roadmap-fill');
    if (fill) {
        const pcts = [10, 32, 54, 76, 100];
        fill.style.width = (pcts[stageNum - 1] || 10) + '%';
    }
    for (let i = 1; i <= 5; i++) {
        const pill = document.getElementById('pill-' + i);
        if (!pill) continue;
        pill.classList.remove('active', 'completed');
        if (i < stageNum) pill.classList.add('completed');
        if (i === stageNum) pill.classList.add('active');
    }
}

function triggerPageFlip() {
    sfxPaper();
    const board = document.getElementById('workbench-board');
    if (!board) return;
    board.classList.remove('page-flip-anim');
    void board.offsetWidth;
    board.classList.add('page-flip-anim');
}

function showHanko(label) {
    const hanko = document.getElementById('hankostamp');
    if (!hanko) return;
    hanko.textContent = label;
    hanko.classList.remove('hidden');
    sfxStamp();
    setTimeout(() => {
        hanko.classList.add('hidden');
    }, 1100);
}

// ===== 実習スタート =====
window.startExperiment = function () {
    initAudio();
    sfxSwitch();
    playBgm(bgmMain);
    currentStage = 1;
    score = 0;
    totalMisses = 0;
    updateScore(0);
    const missEl = document.getElementById('miss-val');
    if (missEl) missEl.textContent = '0';
    setScreen('screen-game');
    loadStage(1);
};

function loadStage(stageNum) {
    if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
    }
    currentStage = stageNum;
    updateStagePills(stageNum);
    triggerPageFlip();

    if (stageNum === 1) renderStage1();
    else if (stageNum === 2) renderStage2();
    else if (stageNum === 3) renderStage3();
    else if (stageNum === 4) renderStage4();
    else if (stageNum === 5) renderStage5();
}

// =========================================================================
// 【第一工程】黒電話交換盤と「無言の紅茶タイム」＆イライラ沸騰ゲージ
// =========================================================================
let s1State = {
    madamConnected: false,
    teaChecked: false,
    anger: 0,
    blockedCount: 0,
    blockedCallers: { fire: false, delivery: false }
};

function renderStage1() {
    s1State = {
        madamConnected: false,
        teaChecked: false,
        anger: 0,
        blockedCount: 0,
        blockedCallers: { fire: false, delivery: false }
    };

    document.getElementById('stage-heading').innerHTML =
        '<span class="u-title-chunk">【第一工程】</span><span class="u-title-chunk">黒電話交換盤と</span><span class="u-title-chunk">「無言独占」の悲劇</span>';
    document.getElementById('stage-status-badge').textContent = '回線交換モード';

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        'まずは昔の電話と同じ<strong>「回線交換方式」</strong>を動かすニャ。<br>下の交換盤で「① プラグを挿して通話開始」を押して、マダム白猫の回線を繋いでみるニャ！'
    );

    setStickyNote(
        '回線交換方式の本質',
        '通信する2人の間で「1本の専用回線」を最初から最後まで繋ぎっぱなしにする方式。<strong>相手が黙っている（データを送っていない）時間も回線を100%占有してしまう</strong>ため、利用効率が悪い。'
    );

    setTicker('待機中：まずはマダム白猫の回線プラグを接続してください。');

    const mount = document.getElementById('stage-mount');
    mount.innerHTML = `
        <div class="switchboard-panel">
            <div class="trunk-line-box">
                <div class="trunk-label">
                    <span>■ ねこ村 唯一の幹線通信ケーブル（定員：1組のみ独占）</span>
                    <button class="retro-btn btn-small hidden" id="btn-tea-silence" onclick="triggerTeaSilence()">
                        ［観察］マダムの「無言の紅茶タイム」を見る
                    </button>
                </div>
                <div class="wire-visual">
                    <div class="endpoint-box" id="s1-left-node">未接続</div>
                    <div class="cable-pipe" id="s1-cable-pipe">空き回線（利用可能）</div>
                    <div class="endpoint-box" id="s1-right-node">未接続</div>
                </div>
                <div class="anger-meter-row">
                    <span style="font-size:0.8rem;font-weight:900;color:#ff9c97;white-space:nowrap;">待たされ猫のイライラ沸騰度:</span>
                    <div class="anger-bar-bg">
                        <div class="anger-bar-fill" id="s1-anger-fill"></div>
                    </div>
                    <span class="mono-num" style="font-size:0.82rem;font-weight:900;color:#fff;" id="s1-anger-text">0%</span>
                </div>
            </div>

            <div class="callers-grid">
                <!-- マダム白猫 -->
                <div class="caller-slot" id="slot-madam">
                    <div class="caller-head">
                        <span>【1番線】マダム白猫</span>
                        <span class="caller-status" id="status-madam">待機中</span>
                    </div>
                    <p style="font-size:0.82rem;line-height:1.4;" id="desc-madam">用件：「昨日のまたたびパーティーの世間話（予定3時間）」</p>
                    <button class="retro-btn btn-secondary btn-small" id="btn-connect-madam" onclick="connectMadamLine()">
                        ① プラグを挿して通話開始
                    </button>
                </div>

                <!-- 消防ねこ -->
                <div class="caller-slot" id="slot-fire">
                    <div class="caller-head">
                        <span>【2番線】消防ねこ</span>
                        <span class="caller-status" id="status-fire">待機中</span>
                    </div>
                    <p style="font-size:0.82rem;line-height:1.4;">用件：「たい焼き屋さんの煙突がボヤ騒ぎニャ！」</p>
                    <button class="retro-btn btn-small" id="btn-call-fire" onclick="tryOtherCall('fire', '消防ねこ')" disabled>
                        ② この回線で発信する
                    </button>
                </div>

                <!-- 宅配ねこ -->
                <div class="caller-slot" id="slot-delivery">
                    <div class="caller-head">
                        <span>【3番線】宅配ねこ</span>
                        <span class="caller-status" id="status-delivery">待機中</span>
                    </div>
                    <p style="font-size:0.82rem;line-height:1.4;">用件：「高級またたび30袋の在庫確認ニャ！」</p>
                    <button class="retro-btn btn-small" id="btn-call-delivery" onclick="tryOtherCall('delivery', '宅配ねこ')" disabled>
                        ② この回線で発信する
                    </button>
                </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;background:#2b2623;padding:10px 14px;border-radius:8px;">
                <span style="font-size:0.88rem;font-weight:700;color:#fff3b8;" id="s1-guide-msg">
                    ▲ まずは「① プラグを挿して通話開始」を押してみよう！
                </span>
                <button class="retro-btn btn-danger hidden" id="btn-finish-s1" onclick="completeStage1()">
                    ［強制切断レバー］独占回線を切ってパケット方式へ改革！
                </button>
            </div>
        </div>
    `;
}

window.connectMadamLine = function () {
    if (s1State.madamConnected) return;
    s1State.madamConnected = true; updateTrafficHud(100, '100% (🛑 1組で独占！', 'alert');
    sfxSwitch();

    document.getElementById('s1-left-node').textContent = 'マダム白猫宅';
    document.getElementById('s1-right-node').textContent = 'ブティック猫宅';
    const pipe = document.getElementById('s1-cable-pipe');
    pipe.classList.add('occupied');
    pipe.textContent = '［回線独占中］「ざます〜！オホホホ！」(通信量 100%';

    const stMadam = document.getElementById('status-madam');
    stMadam.textContent = '通話中（独占）';
    stMadam.classList.add('talking');
    document.getElementById('btn-connect-madam').disabled = true;
    document.getElementById('btn-connect-madam').textContent = '● プラグ接続中';

    document.getElementById('btn-tea-silence').classList.remove('hidden');
    document.getElementById('btn-call-fire').disabled = false;
    document.getElementById('btn-call-delivery').disabled = false;

    setSpeaker(
        '【長電話マダム白猫】',
        'madam_cat.png',
        '「オホホ！この回線はわたくしが3時間まるごと借り切ったざます！」<br><span style="color:#b82924;">▶ 上の「［観察］無言の紅茶タイムを見る」や、他の2匹の「② この回線で発信する」を押してみるニャ！</span>'
    );
    document.getElementById('s1-guide-msg').textContent =
        '▶ 「無言の紅茶タイム」を観察し、消防ねこと宅配ねこの発信ボタンを押してみよう！';
    setTicker('回線接続完了：マダム白猫が幹線ケーブルを100%占有しました。');
};

window.triggerTeaSilence = function () {
    if (!s1State.madamConnected) return;
    s1State.teaChecked = true;
    sfxPaper();

    const pipe = document.getElementById('s1-cable-pipe');
    pipe.classList.remove('occupied');
    pipe.classList.add('silent-tea');
    pipe.textContent = '［無言で紅茶すすり中...］ズズーッ…（現在のデータ送信量：0 バイト / でも回線は独占中！';

    document.getElementById('desc-madam').innerHTML =
        '現在：<strong>無言でお茶を飲んでいるだけ（データ通信ゼロ）</strong>なのに回線を100%塞いでいます！';

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        '見てニャ！マダム猫はいま<strong>一言も喋らずに紅茶を飲んでいるだけ（データ量ゼロ）なのに、回線交換方式だから1本のケーブルが完全に塞がったまま</strong>ニャ！なんて非効率ニャ！'
    );
    setTicker('重要発見：回線交換では無言の時間（データ量0）も回線が占有され、他人が割り込めません！');
};

window.tryOtherCall = function (key, callerName) {
    if (!s1State.madamConnected) return;
    sfxBusy();

    const slot = document.getElementById('slot-' + key);
    const status = document.getElementById('status-' + key);
    const btn = document.getElementById('btn-call-' + key);

    slot.classList.add('blocked');
    status.textContent = 'プーッ！お話し中';
    status.classList.add('busy');
    btn.textContent = '× 回線塞がり（送信不可';

    if (!s1State.blockedCallers[key]) {
        s1State.blockedCallers[key] = true;
        s1State.blockedCount++;
    }

    s1State.anger = Math.min(100, s1State.blockedCount * 50);
    document.getElementById('s1-anger-fill').style.width = s1State.anger + '%';
    document.getElementById('s1-anger-text').textContent = s1State.anger + '%';

    setTicker(`発信失敗：${callerName}が発信しましたが、回線が独占されているため「話し中」で弾かれました！`);

    if (s1State.blockedCount >= 2) {
        setSpeaker(
            '【通信局・現場監督】',
            'operator_cat.png',
            'イライラ沸騰度が100%に達したニャ！たい焼き屋さんが丸焦げになる前に、右下の赤い<strong>「［強制切断レバー］」</strong>をガチャンと下ろしてパケット方式へ改革するニャ！'
        );
        document.getElementById('s1-guide-msg').textContent =
            '※ 待たされ猫たちの怒りが限界突破！右の強制切断レバーを引こう！';
        document.getElementById('btn-finish-s1').classList.remove('hidden');
    }
};

window.completeStage1 = function () {
    updateScore(100);
    showHanko('検収済');
    setTimeout(() => {
        openStageQuizModal(0);
    }, 650);
};

// =========================================================================
// 【第二工程】分割サイズの3段階実験（丸ごと・12みじん切り・適度な4分割）＆荷札貼り
// =========================================================================
const orderPieces = [
    '高級またたび',
    '30袋を',
    'ねこカフェへ',
    '至急たのむ'
];

let s2State = {
    isSplit: false,
    taggedCount: 0,
    taggedFlags: [false, false, false, false]
};

function renderStage2() {
    s2State = {
        isSplit: false,
        taggedCount: 0,
        taggedFlags: [false, false, false, false]
    };

    document.getElementById('stage-heading').innerHTML =
        '<span class="u-title-chunk">【第二工程】</span><span class="u-title-chunk">分割サイズの実験と</span><span class="u-title-chunk">「ヘッダ荷札」貼り</span>';
    document.getElementById('stage-status-badge').textContent = 'パケット梱包作業';

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        '次はデータを小包に分ける<strong>「パケット化」</strong>の実験ニャ！<br>なぜ「ちょうどいいサイズ」に分ける必要があるのか、上の3つのボタンで<strong>「切らない」「みじん切り」「4分割」</strong>を試してみるニャ！'
    );

    setStickyNote(
        '分割サイズとヘッダの本質',
        '各パケットには必ず「ヘッダ（宛先・順番の荷札）」が付く。<strong>細かく切りすぎると中身より荷札のデータ量（オーバーヘッド）ばかり増えて通信効率が悪化する</strong>ため、適度なサイズに分割する。'
    );

    setTicker('第二工程開始：3つの分割ボタンを試して、最適なパケット分割を行ってください。');

    const mount = document.getElementById('stage-mount');
    mount.innerHTML = `
        <div class="packing-desk">
            <div class="scroll-banner">
                <div style="font-size:0.85rem;font-weight:900;color:#5c4e41;">■ 注文データ：「高級またたび30袋をねこカフェへ至急たのむ」（全20文字）</div>
                <div class="raw-message-strip" id="s2-raw-strip">
                    <div class="payload-piece">高級またたび</div>
                    <div class="payload-piece">30袋を</div>
                    <div class="payload-piece">ねこカフェへ</div>
                    <div class="payload-piece">至急たのむ</div>
                </div>
                <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:8px;">
                    <button class="retro-btn btn-small" id="btn-jam-test" onclick="testGiantSend()">
                        実験A：切らずに丸ごと送る（1塊）
                    </button>
                    <button class="retro-btn btn-small" id="btn-mijin-test" onclick="testMijingiriSend()">
                        実験B：1文字ずつみじん切り（20箱）
                    </button>
                    <button class="retro-btn btn-secondary btn-small" id="btn-cut-data" onclick="splitOrderData()">
                        ✂ 最適：ちょうどいい4分割にする
                    </button>
                </div>
                <div id="s2-experiment-result" class="overhead-alert-box hidden" style="margin-top:8px;"></div>
            </div>

            <div class="parcels-row" id="s2-parcels-row">
                ${orderPieces.map((txt, idx) => `
                    <div class="parcel-box" id="parcel-${idx}">
                        <div class="header-tag-slot" id="tag-slot-${idx}">
                            <span style="color:#5c4e41;font-weight:700;">［ヘッダ荷札なし］<br>（宛先・順番不明）</span>
                        </div>
                        <div class="payload-slot" id="payload-slot-${idx}">
                            <span style="color:#888;">（未分割）</span>
                        </div>
                        <button class="retro-btn btn-small" id="btn-tag-${idx}" onclick="attachHeaderTag(${idx})" disabled>
                            ＋ 荷札 [${idx + 1}/4] を貼る
                        </button>
                    </div>
                `).join('')}
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
                <span style="font-size:0.88rem;font-weight:900;color:#231b14;" id="s2-guide-text">
                    ▲ 実験A・実験Bを試すか、「✂ 最適：ちょうどいい4分割にする」を押そう！
                </span>
                <button class="retro-btn btn-primary hidden" id="btn-finish-s2" onclick="completeStage2()">
                    ▶ 4つのパケット小包を発送する！
                </button>
            </div>
        </div>
    `;
}

window.testGiantSend = function () {
    sfxWrong();
    const box = document.getElementById('s2-experiment-result');
    box.classList.remove('hidden');
    box.innerHTML = `
        <strong>【実験Aの結果：× 回線詰まり発生】</strong>
        巨大なデータの塊をそのまま流すと、そのデータが通り終わるまで回線を長時間独占してしまい、他の人の通信が割り込めません！
    `;
    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        'グシャァ！切らずに丸ごと流したら、巨大な1個のデータが道路を塞いでしまって他の人が使えないニャ！次は「実験B：1文字ずつみじん切り」か「✂ 4分割」を試すニャ！'
    );
    setTicker('実験A結果：分割なしでは回線を長時間塞いでしまいます。');
};

window.testMijingiriSend = function () {
    sfxWrong();
    if (window.triggerTagAvalanche) window.triggerTagAvalanche();
    const chars = '高級またたび30袋をねこ'.split('');
    const box = document.getElementById('s2-experiment-result');
    box.classList.remove('hidden');
    box.innerHTML = `
        <div><strong>【実験Bの結果：× ヘッダ（荷札）だらけで大損！（オーバーヘッド増大）】</strong></div>
        <div>中身がたった1文字なのに、すべての箱に大きな赤い「ヘッダ荷札」が付くため、<strong>データ本体より荷札の通信量の方が膨大になって回線がパンク</strong>します！</div>
        <div class="mijingiri-grid">
            ${chars.map((c, i) => `<div class="tiny-parcel"><span>ヘッダ#${i + 1}</span>${c}</div>`).join('')}
            <div class="tiny-parcel">...計20箱！</div>
        </div>
    `;
    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        'うわぁ、箱と赤い荷札だらけニャ！<strong>細かく切りすぎると、中身（ペイロード）より荷札（ヘッダ）のデータ量ばかり増えて大損</strong>になるニャ！<br>だから「✂ 最適：ちょうどいい4分割にする」を選ぶニャ！'
    );
    setTicker('実験B結果：細かく切りすぎるとヘッダ（制御情報）の割合が増えすぎて通信効率が激減します！');
};

window.splitOrderData = function () {
    if (s2State.isSplit) return;
    s2State.isSplit = true;
    sfxSnip();

    const box = document.getElementById('s2-experiment-result');
    box.classList.remove('hidden');
    box.style.background = '#e6f7ea';
    box.style.borderColor = '#1e5c3a';
    box.innerHTML = `
        <strong>【最適分割：◎ バランス抜群の4分割！】</strong>
        回線を塞がず、かつヘッダ荷札の無駄も少ないベストなサイズ（4個のペイロード）に切り分けました！
    `;

    document.getElementById('s2-raw-strip').classList.add('split-done');
    document.getElementById('btn-cut-data').disabled = true;
    document.getElementById('btn-cut-data').textContent = '◎ 4分割完了（ペイロード';

    orderPieces.forEach((txt, idx) => {
        const pSlot = document.getElementById('payload-slot-' + idx);
        pSlot.innerHTML = `<div style="font-size:0.7rem;color:#5c4e41;">[ペイロード]</div><div>「${txt}」</div>`;
        document.getElementById('btn-tag-' + idx).disabled = false;
    });

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        'チョキチョキ！ちょうどいい4つの<strong>「ペイロード（データ本体）」</strong>に切り分けたニャ！<br>仕上げに4つの箱すべてに<strong>「＋ 荷札（ヘッダ）」</strong>を貼って、宛先と通し番号（1/4〜4/4）を記録するニャ！'
    );
    document.getElementById('s2-guide-text').textContent =
        '▶ 4つの箱それぞれの「＋ 荷札を貼る」ボタンを押してヘッダを付けよう！（残り4個';
    setTicker('データ分割完了：各箱にヘッダ荷札（宛先IP・通し番号）を貼り付けてください。');
};

window.attachHeaderTag = function (idx) {
    if (!s2State.isSplit || s2State.taggedFlags[idx]) return;
    s2State.taggedFlags[idx] = true;
    s2State.taggedCount++;
    sfxSwitch();

    const tagSlot = document.getElementById('tag-slot-' + idx);
    tagSlot.classList.add('tagged', 'tag-slot-stamped');
    tagSlot.innerHTML = `
        <div><span class="tag-badge-red">ヘッダ #${idx + 1}/4</span></div>
        <div class="mono-num" style="font-size:0.7rem;font-weight:700;color:#231b14;">宛先: ねこカフェ局<br>差出: 通信局</div>
    `;



    const btn = document.getElementById('btn-tag-' + idx);
    btn.disabled = true;
    btn.textContent = '◎ 荷札貼付済';

    const remain = 4 - s2State.taggedCount;
    if (remain > 0) {
        document.getElementById('s2-guide-text').textContent =
            `▶ いい調子ニャ！残り ${remain} 個の箱にもヘッダ荷札を貼ろう！`;
        setTicker(`ヘッダ貼付：パケット [${idx + 1}/4] に宛先と通し番号を記録しました。`);
    } else {
        const parcelsDesk = document.getElementById('s2-parcels-row');
        if (parcelsDesk && !document.getElementById('gold-stamp-s2')) {
            const gold = document.createElement('div');
            gold.id = 'gold-stamp-s2';
            gold.className = 'hanko-gold';
            gold.textContent = '💮 全小包 梱包合格！';
            parcelsDesk.parentElement.style.position = 'relative';
            parcelsDesk.parentElement.appendChild(gold);
        }

        // 全小包にレントゲン解析クリックを有効化
        orderPieces.forEach((piece, pIdx) => {
            const pb = document.getElementById('parcel-' + pIdx);
            if (pb) {
                pb.style.cursor = 'pointer';
                pb.title = '🔍 クリックでこのパケットの内部レントゲン解析を見る！';
                pb.onclick = () => {
                    window.openPacketScope({
                        seq: pIdx + 1,
                        payload: piece,
                        dst: '203.0.113.5 (ねこカフェ局',
                        src: '198.51.100.2 (通信局)'
                    });
                };
            }
        });

        setSpeaker(
            '【通信局・現場監督】',
            'operator_cat.png',
            '4つすべての箱に<strong>「ヘッダ（宛先・通し番号）」</strong>と<strong>「ペイロード（中身）」</strong>が揃って、立派なパケット小包が完成したニャ！<br>箱をクリックすると<strong>「🔬 レントゲンスコープ（内部透過解析）」</strong>も見られるニャ！<br>準備ができたら右下の「▶ 4つのパケット小包を発送する！」を押すニャ！',
            'ok'
        );
        document.getElementById('s2-guide-text').textContent =
            '◎ 全4個のパケット小包が完成！箱をクリックしてレントゲン解剖するか、右のボタンで発送しよう！';
        document.getElementById('btn-finish-s2').classList.remove('hidden');
        setTicker('梱包完了：全4パケット完成！小包をクリックすると内部レントゲン解析が見られます。');
    }
};

window.completeStage2 = function () {
    updateScore(100);
    showHanko('梱包合格');
    setTimeout(() => {
        openStageQuizModal(1);
    }, 650);
};

// =========================================================================
// 【第三工程】手動ルータ分岐・バッファ渋滞・落雷う回ルーティング (Canvas)
// =========================================================================
let s3State = {
    phase: 'ready',
    routeSouth: false,
    northLoad: 0,
    packets: [],
    deliveredCount: 0
};

function renderStage3() {
    s3State = {
        phase: 'ready',
        routeSouth: false,
        northLoad: 0,
        packets: [],
        deliveredCount: 0
    };

    document.getElementById('stage-heading').innerHTML =
        '<span class="u-title-chunk">【第三工程】</span><span class="u-title-chunk">回線の共有と</span><span class="u-title-chunk">「ルータ経路切替」</span>';
    document.getElementById('stage-status-badge').textContent = '経路制御（ルーティング';

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        '小包に分けたら発送ニャ！<br>「① 通信スタート」を押すと、マダム猫のパケットと注文パケットが1本の幹線を交互に共有して流れるニャ。<strong>いつでも右の「［分岐器］レバー」で北ルートと南ルートを手動切替できる</strong>ニャ！'
    );

    setStickyNote(
        'ルータの経路制御とバッファ',
        '<strong>ルータ</strong>はパケットの宛先を見て空いている道や生きている道へ振り分ける。1つの道にパケットが集中しすぎると待合室（<strong>バッファ</strong>）が溢れて遅延や消失が起きる。'
    );

    setTicker('第三工程待機中：「① 通信スタート」を押してパケットを送り出してください。');

    const mount = document.getElementById('stage-mount');
    mount.innerHTML = `
        <div class="routing-console">
            <div class="canvas-frame">
                <canvas id="network-canvas" width="700" height="265"></canvas>
            </div>
            <div class="router-control-bar">
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <button class="retro-btn btn-primary btn-small" id="btn-s3-start" onclick="startStage3Stream()">
                        ① 通信スタート（回線共有を開始）
                    </button>
                    <button class="retro-btn btn-secondary btn-small" id="btn-s3-switch" onclick="toggleRouterPath()">
                        ［手動分岐レバー］現在：【北の鉄橋ルート】
                    </button>
                    <button class="retro-btn btn-lightning btn-small" id="btn-lightning" onclick="triggerManualLightning()">
                        ⚡ 鉄橋に落雷を起こす！
                    </button>
                </div>
                <div style="font-weight:900;font-size:0.88rem;color:#231b14;" id="s3-counter">
                    到着した注文小包: <span class="mono-num">0 / 3</span> 個
                </div>
            </div>
        </div>
    `;

    drawNetworkCanvas();
}

window.startStage3Stream = function () {
    if (s3State.phase !== 'ready') return;
    s3State.phase = 'running1';
    sfxSwitch();

    document.getElementById('btn-s3-start').disabled = true;
    document.getElementById('btn-s3-start').textContent = '● パケット送信中...';

    const curRoute = s3State.routeSouth ? 'south' : 'north';
    s3State.packets = [
        { id: '#1', type: 'order', progress: 0.0, speed: 0.0055, route: curRoute, decided: false, active: true },
        { id: 'マダム話1', type: 'madam', progress: -0.18, speed: 0.0055, route: curRoute, decided: false, active: true },
        { id: '#3', type: 'order', progress: -0.36, speed: 0.0055, route: curRoute, decided: false, active: true },
        { id: 'マダム話2', type: 'madam', progress: -0.54, speed: 0.0055, route: curRoute, decided: false, active: true }
    ];

    setTicker('送信中：1本の回線を「注文小包」と「マダムの小包」が交互に共有して流れています！');
    runStage3Loop();
};

window.toggleRouterPath = function () {
    sfxSwitch();
    const btn = document.getElementById('btn-s3-switch');

    if (s3State.phase === 'broken') {
        s3State.routeSouth = true;
        s3State.phase = 'rerouted';
        btn.disabled = true;
        btn.textContent = '◎ ルータA分岐器：【南のう回路】へ切替完了！';
        btn.classList.remove('btn-danger');
        btn.classList.add('btn-primary');

        setSpeaker(
            '【通信局・現場監督】',
            'operator_cat.png',
            'ナイス切り替えニャ！ルータAが南のう回路（ルータC経由）へ経路を切り替えたから、残りのパケットが障害を避けてねこカフェ局へ向かっているニャ！'
        );
        setTicker('経路切替完了：ルータAが南のう回路（ルータC経由）へパケットを転送しています！');

        s3State.packets.push(
            { id: '#4', type: 'order', progress: 0.0, speed: 0.006, route: 'south', decided: true, active: true },
            { id: 'マダム話3', type: 'madam', progress: -0.22, speed: 0.006, route: 'south', decided: true, active: true }
        );
        return;
    }

    // 通常時の手動切り替え
    s3State.routeSouth = !s3State.routeSouth;
    btn.textContent = s3State.routeSouth
        ? '［手動分岐レバー］現在：【南のう回路ルート】'
        : '［手動分岐レバー］現在：【北の鉄橋ルート】';
    drawNetworkCanvas();
};

function triggerNorthBridgeStrike() {
    s3State.phase = 'broken';
    s3State.routeSouth = false;
    sfxThunder();

    const swBtn = document.getElementById('btn-s3-switch');
    swBtn.disabled = false;
    swBtn.classList.remove('btn-secondary');
    swBtn.classList.add('btn-danger');
    swBtn.textContent = '！ 落雷発生！ここを押して【南のう回路】へ切り替えろ！';

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        '大変ニャー！！北の鉄橋（ルータB）にパケットが集中したうえにカミナリが落ちて通行止めになったニャ！（衝撃で2番目の箱も欠損したニャ！）<br><strong>下の赤い「ルータA分岐器」ボタンを押して、【南のう回路】へ切り替えるニャ！</strong>'
    );
    setTicker('緊急事態：北ルート（ルータB）が落雷で断線！ルータAの分岐器を【南のう回路】へ切り替えてください！');
}

function runStage3Loop() {
    updateStage3Physics();
    drawNetworkCanvas();

    if (s3State.phase !== 'done') {
        animFrameId = requestAnimationFrame(runStage3Loop);
    }
}

function updateStage3Physics() {
    let allFinishedBatch1 = true;
    let northCount = 0;

    s3State.packets.forEach(pkt => {
        if (!pkt.active) return;
        pkt.progress += pkt.speed;

        // ルータA (progress 0.3) 通過時点で現在のレバー方向を適用
        if (!pkt.decided && pkt.progress >= 0.28) {
            pkt.decided = true;
            pkt.route = (s3State.phase === 'rerouted' || s3State.routeSouth) ? 'south' : 'north';
        }

        if (pkt.progress >= 0.3 && pkt.progress <= 0.7 && pkt.route === 'north') {
            northCount++;
        }

        if (pkt.progress >= 1.0) {
            pkt.active = false;
            if (pkt.type === 'order') {
                s3State.deliveredCount++;
                const cntEl = document.getElementById('s3-counter');
                if (cntEl) {
                    cntEl.innerHTML = `到着した注文小包: <span class="mono-num">${s3State.deliveredCount} / 3</span> 個（※#2が途中で欠損）`;
                }
            }
        } else {
            allFinishedBatch1 = false;
        }
    });

    s3State.northLoad = northCount;

    if (s3State.phase === 'running1' && allFinishedBatch1) {
        triggerNorthBridgeStrike();
    } else if (s3State.phase === 'rerouted' && allFinishedBatch1) {
        s3State.phase = 'done';
        updateScore(100);
        showHanko('迂回成功');
        setTimeout(() => {
            openStageQuizModal(2);
        }, 700);
    }
}

function getPacketXY(pkt) {
    const p = Math.max(0, Math.min(1, pkt.progress));
    const midY = pkt.route === 'north' ? 60 : 210;

    if (p < 0.3) {
        const t = p / 0.3;
        return { x: 90 + (230 - 90) * t, y: 135 };
    } else if (p < 0.65) {
        const t = (p - 0.3) / 0.35;
        return { x: 230 + (420 - 230) * t, y: 135 + (midY - 135) * t };
    } else {
        const t = (p - 0.65) / 0.35;
        return { x: 420 + (610 - 420) * t, y: midY + (135 - midY) * t };
    }
}

function drawNetworkCanvas() {
    const canvas = document.getElementById('network-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#fdf8ec';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    function drawRoad(x1, y1, x2, y2, color, width, dashed = false) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (dashed) ctx.setLineDash([8, 6]);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.restore();
    }

    drawRoad(90, 135, 230, 135, '#231b14', 8);

    const northBroken = s3State.phase === 'broken' || s3State.phase === 'rerouted' || s3State.phase === 'done';
    const northColor = northBroken ? '#b82924' : (!s3State.routeSouth ? '#1e5c3a' : '#b0a494');
    drawRoad(230, 135, 420, 60, northColor, 6, northBroken);
    drawRoad(420, 60, 610, 135, northColor, 6, northBroken);

    const southColor = s3State.routeSouth ? '#1e5c3a' : '#b0a494';
    drawRoad(230, 135, 420, 210, southColor, s3State.routeSouth ? 7 : 5, !s3State.routeSouth);
    drawRoad(420, 210, 610, 135, southColor, s3State.routeSouth ? 7 : 5, !s3State.routeSouth);

    function drawNode(x, y, label, sub, bgColor) {
        ctx.save();
        ctx.fillStyle = bgColor;
        ctx.strokeStyle = '#231b14';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(x - 54, y - 26, 108, 52, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px "M PLUS Rounded 1c", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y - 4);
        ctx.font = 'bold 10px "M PLUS Rounded 1c", sans-serif';
        ctx.fillStyle = '#fff3b8';
        ctx.fillText(sub, x, y + 14);
        ctx.restore();
    }

    drawNode(90, 135, '〒 通信局', '（送信元）', '#1f476b');
    drawNode(230, 135, '［ルータA］', s3State.routeSouth ? '分岐: 南ルート' : '分岐: 北ルート', '#8b5a2b');
    drawNode(
        420,
        60,
        northBroken ? '× 北ルータB' : '● 北ルータB',
        northBroken ? '【落雷通行止】' : `待合バッファ:${s3State.northLoad}/2`,
        northBroken ? '#b82924' : '#2e6b45'
    );
    drawNode(420, 210, '● 南ルータC', '（う回路・空き', s3State.routeSouth ? '#2e6b45' : '#6e655c');
    drawNode(610, 135, '［ねこカフェ］', '（宛先）', '#1f476b');

    s3State.packets.forEach(pkt => {
        if (!pkt.active || pkt.progress < 0) return;
        const pos = getPacketXY(pkt);
        ctx.save();
        ctx.fillStyle = pkt.type === 'order' ? '#d9a76a' : '#f7b2c4';
        ctx.strokeStyle = '#231b14';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.roundRect(pos.x - 28, pos.y - 16, 56, 32, 5);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#231b14';
        ctx.font = 'bold 11px "M PLUS Rounded 1c", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pkt.id, pos.x, pos.y + 4);
        ctx.restore();
    });
}

// =========================================================================
// 【第四工程】TCP（再送＆順序復元）vs UDP（即時垂れ流し）の比較＆復元デスク
// =========================================================================
let s4State = {
    resent2: false,
    udpTested: false,
    pool: [
        { seq: 3, text: 'ねこカフェへ', placed: false },
        { seq: 1, text: '高級またたび', placed: false },
        { seq: 4, text: '至急たのむ', placed: false }
    ],
    slots: [null, null, null, null]
};

function renderStage4() {
    s4State = {
        resent2: false,
        udpTested: false,
        pool: [
            { seq: 3, text: 'ねこカフェへ', placed: false },
            { seq: 1, text: '高級またたび', placed: false },
            { seq: 4, text: '至急たのむ', placed: false }
        ],
        slots: [null, null, null, null]
    };

    document.getElementById('stage-heading').innerHTML =
        '<span class="u-title-chunk">【第四工程】</span><span class="u-title-chunk">TCPとUDPの比較・</span><span class="u-title-chunk">欠損再送と順序復元</span>';
    document.getElementById('stage-status-badge').textContent = 'TCP / UDP 受領デスク';

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        'ねこカフェ局に小包が届いたけど、<strong>「3番・1番・4番」と順番がバラバラで、「2番」が欠損</strong>しているニャ！<br>まずは上の<strong>「［比較実験］もしUDPモードでそのまま再生したら？」</strong>を試すか、<strong>「［TCP再送要求］[2/4]を再送」</strong>を押して番号順に並べるニャ！'
    );

    setStickyNote(
        'TCP と UDP の決定的な違い',
        '・<strong>TCP（確実性重視）</strong>：欠損を再送要求し、ヘッダ番号順に並べ直して完全復元する（Web・メール・注文書）。<br>・<strong>UDP（即時性重視）</strong>：再送を待たず届いた順に即再生する（通話・生配信・ゲーム）。'
    );

    setTicker('第四工程開始：UDPの即時再生を試すか、TCPの再送要求で[2/4]を取り寄せてください。');

    renderStage4DOM();
    setTimeout(() => { if (typeof drawOscilloscope === "function") drawOscilloscope("standby"); }, 40);
}

function renderStage4DOM() {
    const mount = document.getElementById('stage-mount');

    const poolHTML = s4State.pool.map((pkt, idx) => {
        if (pkt.placed) {
            return `
                <div class="packet-card" style="opacity:0.35;cursor:default;background:#e0d6c3;">
                    <div style="font-size:0.74rem;font-weight:900;">配置済み</div>
                    <div style="font-size:0.88rem;font-weight:900;">#${pkt.seq}/4</div>
                </div>
            `;
        }
        return `
            <div class="packet-card" onclick="placePacketToSlot(${idx})">
                <div><span class="tag-badge-red">ヘッダ #${pkt.seq}/4</span></div>
                <div style="font-size:0.94rem;font-weight:900;margin-top:3px;">「${pkt.text}」</div>
                <div style="font-size:0.72rem;color:#5c4e41;margin-top:2px;">▲ クリックで配置</div>
            </div>
        `;
    }).join('');

    const missingCardHTML = !s4State.resent2 ? `
        <div class="packet-card missing-card">
            <div style="color:#b82924;font-weight:900;font-size:0.78rem;">※ パケット欠損中</div>
            <div style="font-size:0.82rem;font-weight:900;margin:3px 0;">[#2/4 が未到着]</div>
            <button class="retro-btn btn-danger btn-small" onclick="requestRetransmit2()">
                ［再送要求］[2/4]を再送
            </button>
        </div>
    ` : '';

    const slotsHTML = s4State.slots.map((pkt, slotIdx) => {
        if (!pkt) {
            return `
                <div class="slot-target">
                    <div style="font-size:0.78rem;font-weight:900;color:#1f476b;">TCP復元枠 (${slotIdx + 1}番目)</div>
                    <div style="font-size:0.74rem;color:#777;">ここに #${slotIdx + 1}/4 を入れる</div>
                </div>
            `;
        }
        const isRightPos = pkt.seq === slotIdx + 1;
        return `
            <div class="slot-target filled" onclick="removePacketFromSlot(${slotIdx})" style="border-color:${isRightPos ? '#1e5c3a' : '#b82924'};background:${isRightPos ? '#eef7f0' : '#ffe8e6'};">
                <div><span class="tag-badge-red">ヘッダ #${pkt.seq}/4</span></div>
                <div style="font-size:0.92rem;font-weight:900;">「${pkt.text}」</div>
                <div style="font-size:0.7rem;color:#5c4e41;">（クリックで戻す）</div>
            </div>
        `;
    }).join('');

    const allCorrect = s4State.slots.every((p, i) => p && p.seq === i + 1);

    mount.innerHTML = `
        <div class="assembly-desk">
            <!-- ② サイバーオシロスコープ波形モニター -->
            <div class="oscilloscope-box">
                <div class="oscilloscope-header">
                    <span>📡 パケット到着＆音声再生モニター（オシロスコープ）</span>
                    <span id="osc-mode-label" class="mono-num" style="color:#00F0FF;">● STANDBY</span>
                </div>
                <canvas id="oscilloscope-canvas" class="oscilloscope-canvas" width="600" height="70"></canvas>
                <div id="oscilloscope-status" class="oscilloscope-status">
                    「UDP実験」または「TCP再送」を押して、パケットの音声波形を観察してみよう！
                </div>
            </div>

            <div class="protocol-mode-bar">
                <div style="font-size:0.86rem;font-weight:900;">
                    ■ プロトコル比較実験：注文書ではなく「生中継ラジオ（UDP）」だったらどうなる？
                </div>
                <button class="retro-btn btn-secondary btn-small" onclick="testUdpLivePlay()">
                    ▶ ［UDP実験］再送を待たずに届いた順で即再生してみる
                </button>
            </div>
            <div id="udp-result-banner" class="udp-live-banner ${s4State.udpTested ? '' : 'hidden'}">
                【UDPモード再生結果（待ち時間0秒・超高速）】：<br>
                『ねこカフェへ ➔ 高級またたび ➔ ［※ザーッ！（2番欠損ノイズ）］ ➔ 至急たのむ』<br>
                <span style="color:#ff9c97;">⇒ 止まらず一瞬で再生できる（通話・生配信には◎）が、大事な注文書では数量が消えて大事故になるため【TCP】が必要です！</span>
            </div>

            <div>
                <div class="tray-label">■ 到着トレイ（届いた順番がバラバラの小包）</div>
                <div class="incoming-Pool">
                    ${poolHTML}
                    ${missingCardHTML}
                </div>
            </div>

            <div>
                <div class="tray-label">■ TCP 注文書復元トレイ（ヘッダ番号 1/4 ➔ 2/4 ➔ 3/4 ➔ 4/4 の順に並べよう）</div>
                <div class="ordered-slots">
                    ${slotsHTML}
                </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;background:rgba(12,22,46,0.95);padding:10px 14px;border:1.5px solid rgba(0,240,255,0.4);border-radius:10px;box-shadow:0 0 15px rgba(0,240,255,0.15);">
                <div style="font-size:0.9rem;font-weight:900;">
                    TCP復元プレビュー：
                    <span style="color:#00F0FF;font-weight:800;">
                        ${s4State.slots.map(p => p ? p.text : '［？］').join(' ➔ ')}
                    </span>
                </div>
                <div style="display:flex;gap:8px;">
                    <button class="retro-btn btn-small" onclick="resetStage4Slots()">［初期化］並べ直す</button>
                    <button class="retro-btn btn-primary ${allCorrect ? '' : 'hidden'}" onclick="completeStage4()">
                        ▶ 受領ハンコを押して復元完了！
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.testUdpLivePlay = function () {
    s4State.udpTested = true;
    sfxSwitch();
    renderStage4DOM();
    setTimeout(() => { if (typeof drawOscilloscope === "function") drawOscilloscope("udp"); }, 40);
    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        'いまのが<strong>「UDP（即時性重視）」</strong>ニャ！2番の再送を待たずに届いた順で即再生するから<strong>ビデオ通話や生配信なら止まらなくて快適</strong>だけど、注文書で『30袋』が消えたら大問題ニャ！<br>注文書は<strong>「TCP」</strong>で［再送要求］して1〜4の順に並べるニャ！'
    );
    setTicker('UDP実験完了：再送なし・並び替えなしで即時再生しました（通話・配信向き、書類には不向き）。');
};

window.requestRetransmit2 = function () {
    const lbl = document.getElementById('osc-mode-label');
    const st = document.getElementById('oscilloscope-status');
    if (lbl) { lbl.textContent = '◎ TCP RETRANSMIT RECOVERED'; lbl.style.color = '#00F59B'; }
    if (st) { st.innerHTML = '<span style="color:#00F59B;font-weight:900;">◎ TCP注文書：欠損した#2を取り寄せて順番通りに完全復元！（Webやメール向き）</span>'; }
    drawOscilloscope('tcp');

    if (s4State.resent2) return;
    s4State.resent2 = true;
    sfxCorrect();
    setTimeout(() => { if (typeof drawOscilloscope === "function") drawOscilloscope("tcp"); }, 40);
    s4State.pool.push({ seq: 2, text: '30袋を', placed: false });

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        'ピピピッ！TCPの再送制御で「2番が届いてないニャ！」と連絡し、無事に<strong>「#2/4（30袋を）」</strong>が再送されてきたニャ！<br>さあ、上の小包を<strong>「#1/4 ➔ #2/4 ➔ #3/4 ➔ #4/4」の順番</strong>でクリックして下の復元トレイに並べるニャ！'
    );
    setTicker('TCP再送完了：欠損していたパケット [#2/4] が到着しました！番号順に並べてください。');
    renderStage4DOM();
    setTimeout(() => { if (typeof drawOscilloscope === "function") drawOscilloscope("standby"); }, 40);
};

window.placePacketToSlot = function (poolIdx) {
    const pkt = s4State.pool[poolIdx];
    if (!pkt || pkt.placed) return;

    const emptySlotIdx = s4State.slots.findIndex(s => s === null);
    if (emptySlotIdx === -1) return;

    sfxSwitch();
    pkt.placed = true;
    s4State.slots[emptySlotIdx] = pkt;

    if (s4State.slots.every(s => s !== null)) {
        const isCorrect = s4State.slots.every((p, i) => p.seq === i + 1);
        if (isCorrect) {
            sfxCorrect();
            setSpeaker(
                '【通信局・現場監督】',
                'operator_cat.png',
                'やったニャ！『高級またたび ➔ 30袋を ➔ ねこカフェへ ➔ 至急たのむ』と元の注文書通りにピタッと復元できたニャ！<br>右下の<strong>「▶ 受領ハンコを押して復元完了！」</strong>を押すニャ！'
            );
            setTicker('順序復元成功：ヘッダの通し番号（1/4〜4/4）通りにデータが結合されました！');
        } else {
            sfxWrong();
            recordMiss();
            setSpeaker(
                '【通信局・現場監督】',
                'operator_cat.png',
                'おっと、順番がズレている枠（赤い枠）があるニャ！<br>赤い枠をクリックして戻すか、「［初期化］並べ直す」を押して、<strong>ヘッダ番号が 1 ➔ 2 ➔ 3 ➔ 4 の順</strong>になるように並べるニャ！'
            );
            setTicker('注意：通し番号の順序が違います。1/4 → 2/4 → 3/4 → 4/4 の順に並べてください。');
        }
    }

    renderStage4DOM();
    setTimeout(() => { if (typeof drawOscilloscope === "function") drawOscilloscope("standby"); }, 40);
};

window.removePacketFromSlot = function (slotIdx) {
    const pkt = s4State.slots[slotIdx];
    if (!pkt) return;
    sfxSwitch();
    pkt.placed = false;
    s4State.slots[slotIdx] = null;
    renderStage4DOM();
    setTimeout(() => { if (typeof drawOscilloscope === "function") drawOscilloscope("standby"); }, 40);
};

window.resetStage4Slots = function () {
    sfxSwitch();
    s4State.pool.forEach(p => { p.placed = false; });
    s4State.slots = [null, null, null, null];
    renderStage4DOM();
    setTimeout(() => { if (typeof drawOscilloscope === "function") drawOscilloscope("standby"); }, 40);
};

window.completeStage4 = function () {
    updateScore(100);
    showHanko('復元完了');
    setTimeout(() => {
        openStageQuizModal(3);
    }, 650);
};

// =========================================================================
// 【第五工程（新設）】小規模LANの構築パズルと「LAN内印刷 vs WAN通信」経路実験
// =========================================================================
const lanDevices = [
    {
        id: 'hub',
        name: 'スイッチングハブ',
        sub: 'LAN内の有線機器を分岐',
        correctSlot: 2,
        wrongHint: 'スイッチングハブは「LANの内部でPCやプリンタを分岐させる装置」ニャ！ルータより内側（3番目）に配置するニャ！'
    },
    {
        id: 'onu',
        name: 'ONU (回線終端装置',
        sub: '光信号 ⇔ 電気信号の変換',
        correctSlot: 0,
        wrongHint: 'ONUは「外の光ファイバーの光を電気信号に変換する一番玄関の装置」ニャ！一番左（1番目：WANのすぐ隣）に配置するニャ！'
    },
    {
        id: 'ap',
        name: 'アクセスポイント (AP)',
        sub: '有線LAN ⇔ Wi-Fi電波変換',
        correctSlot: 3,
        wrongHint: 'アクセスポイントは「ハブから来た有線LANをWi-Fi電波に変えてスマホに届ける装置」ニャ！一番右（4番目：スマホの手前）に配置するニャ！'
    },
    {
        id: 'router',
        name: 'ルータ',
        sub: 'WANとLANの境界・経路制御',
        correctSlot: 1,
        wrongHint: 'ルータは「ONUのすぐ内側で、外のWANと内のLANの境界を守る関所」ニャ！左から2番目に配置するニャ！'
    }
];

let s5State = {
    slots: [null, null, null, null], // 0:ONU, 1:Router, 2:Hub, 3:AP
    activeTest: null, // 'lan' | 'wan' | null
    testedLan: false,
    testedWan: false
};

function renderStage5() {
    s5State = {
        slots: [null, null, null, null],
        activeTest: null,
        testedLan: false,
        testedWan: false
    };

    document.getElementById('stage-heading').innerHTML =
        '<span class="u-title-chunk">【第五工程】</span><span class="u-title-chunk">小規模LANの配線と</span><span class="u-title-chunk">「内と外の境界」実験</span>';
    document.getElementById('stage-status-badge').textContent = '小規模LAN構築';

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        '最終工程ニャ！ねこカフェ店内の<strong>「小規模LAN」</strong>を配線するニャ！<br>左端の「外のインターネット（WAN・光ファイバー）」から右端の「PC・プリンタ・スマホ」まで、<strong>①〜④の空枠に正しい順番で機器を配置</strong>するニャ！'
    );

    setStickyNote(
        '小規模LAN 4大機器の順番と役割',
        '外(WAN)から順に：<br>① <strong>ONU</strong>（光⇔電気の信号変換）<br>② <strong>ルータ</strong>（WANとLANの境界）<br>③ <strong>スイッチングハブ</strong>（LAN内の有線分岐）<br>④ <strong>アクセスポイント</strong>（Wi-Fi電波'
    );

    setTicker('第五工程開始：下の4つの機器カードをクリックして、①〜④の枠に正しく配線してください。');

    renderStage5DOM();
}

function renderStage5DOM() {
    const mount = document.getElementById('stage-mount');
    const slotTitles = [
        '① 玄関（光⇔電気変換',
        '② 関所（WAN/LAN境界',
        '③ 分岐（有線LAN集線',
        '④ 無線（Wi-Fi電波'
    ];

    const allCorrect = s5State.slots.every((dev, idx) => dev && dev.correctSlot === idx);

    const slotsHTML = s5State.slots.map((dev, idx) => {
        const isGlowLan = s5State.activeTest === 'lan' && idx === 2;
        const isGlowWan = s5State.activeTest === 'wan';
        const glowClass = (isGlowLan || isGlowWan) ? 'route-glow' : '';

        if (!dev) {
            return `
                <div class="lan-slot ${glowClass}">
                    <div style="font-size:0.75rem;font-weight:900;color:#1f476b;">${slotTitles[idx]}</div>
                    <div style="font-size:0.74rem;color:#777;margin-top:4px;">［未配線］</div>
                </div>
            `;
        }
        const isOk = dev.correctSlot === idx;
        return `
            <div class="lan-slot ${isOk ? 'filled-ok' : 'filled-ng'} ${glowClass}" onclick="removeLanDevice(${idx})">
                <div style="font-size:0.72rem;font-weight:900;color:${isOk ? '#1e5c3a' : '#b82924'};">${slotTitles[idx]}</div>
                <div style="font-size:0.86rem;font-weight:900;margin-top:2px;">${dev.name}</div>
                <div style="font-size:0.68rem;color:#5c4e41;">（クリックで外す）</div>
            </div>
        `;
    }).join('<span class="cable-arrow">⇔</span>');

    const partsHTML = lanDevices.map((dev, i) => {
        const isUsed = s5State.slots.some(s => s && s.id === dev.id);
        return `
            <div class="device-part-card ${isUsed ? 'used' : ''}" onclick="${isUsed ? '' : `placeLanDevice(${i})`}">
                <div style="font-size:0.88rem;font-weight:900;">${dev.name}</div>
                <div style="font-size:0.74rem;color:#94A3B8;margin-top:3px;">${dev.sub}</div>
                <div style="font-size:0.72rem;font-weight:900;color:#00F0FF;margin-top:4px;">${isUsed ? '［配置済］' : '▲ クリックで配線'}</div>
            </div>
        `;
    }).join('');

    const wanGlow = s5State.activeTest === 'wan' ? 'box-shadow:0 0 16px rgba(0,240,255,0.8);border-color:#00F0FF !important;' : '';
    const pcPrintGlow = s5State.activeTest === 'lan' ? 'box-shadow:0 0 16px rgba(0,245,155,0.8);border-color:#00F59B !important;color:#00F59B !important;' : '';
    const phoneGlow = s5State.activeTest === 'wan' ? 'box-shadow:0 0 16px rgba(0,240,255,0.8);border-color:#00F0FF !important;color:#00F0FF !important;' : '';

    mount.innerHTML = `
        <div class="lan-builder-desk">
            <div style="font-size:0.88rem;font-weight:900;color:#00F0FF;text-shadow:0 0 8px rgba(0,240,255,0.3);margin-bottom:6px;">
                ■ ねこカフェ店内のネットワーク配線図（左＝外の世界 WAN ／ 右＝店内の LAN）
            </div>

            <div class="wan-lan-diagram">
                <div class="zone-box zone-wan" style="background:#0b1528 !important; border:2px solid #00F0FF !important; color:#FFFFFF !important; ${wanGlow}">
                    <div style="color:#00F0FF !important; font-weight:900; font-size:0.82rem; margin-bottom:2px; text-shadow:0 0 8px rgba(0,240,255,0.6);">【外のWAN】</div>
                    <div style="font-size:0.75rem; color:#E0F2FE !important; font-weight:800; line-height:1.25;">インターネット<br><span style="color:#7dd3fc; font-size:0.68rem; font-weight:700;">(光ファイバー網)</span></div>
                </div>
                <span class="cable-arrow">➔</span>
                ${slotsHTML}
                <span class="cable-arrow">➔</span>
                <div class="zone-box zone-lan-end" style="background:#0b1528 !important; border:2px solid rgba(0,240,255,0.5) !important; display:flex; flex-direction:column; gap:6px; padding:6px 4px;">
                    <div style="padding:6px 4px; border:1.5px solid #00F0FF; border-radius:6px; background:#050B14 !important; color:#00F59B !important; font-weight:900; font-size:0.74rem; text-align:center; text-shadow:0 0 6px rgba(0,245,155,0.5); ${pcPrintGlow}">
                        【有線】PC1 &amp; プリンタ
                    </div>
                    <div style="padding:6px 4px; border:1.5px solid #00F0FF; border-radius:6px; background:#050B14 !important; color:#00F0FF !important; font-weight:900; font-size:0.74rem; text-align:center; text-shadow:0 0 6px rgba(0,240,255,0.5); ${phoneGlow}">
                        【Wi-Fi】スマホ端末
                    </div>
                </div>
            </div>

            <div>
                <div class="tray-label">■ ネットワーク機器パーツ置き場（クリックすると左の空枠から順に配線されます）</div>
                <div class="device-parts-pool">
                    ${partsHTML}
                </div>
            </div>

            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;background:rgba(12,22,46,0.95);padding:10px 14px;border:1.5px solid rgba(0,240,255,0.4);border-radius:10px;box-shadow:0 0 15px rgba(0,240,255,0.15);">
                ${!allCorrect ? `
                    <span style="font-size:0.88rem;font-weight:900;color:#FFFFFF;">
                        ▲ 外（WAN）に近い左側から順番に、① ONU ➔ ② ルータ ➔ ③ スイッチングハブ ➔ ④ AP を配線しよう！
                    </span>
                    <button class="retro-btn btn-small" onclick="resetLanSlots()">［初期化］配線をやり直す</button>
                ` : `
                    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                        <span style="font-size:0.84rem;font-weight:900;color:#1e5c3a;">◎ 配線完成！通信の通り道を実験しよう：</span>
                        <button class="retro-btn btn-secondary btn-small" id="btn-test-lan" onclick="runLanPrintTest()">
                            実験1：PC1から店内プリンタへ印刷（LAN内通信）
                        </button>
                        <button class="retro-btn btn-secondary btn-small" id="btn-test-wan" onclick="runWanWebTest()">
                            実験2：スマホから外のWebサイトを見る（WAN通信）
                        </button>
                        <button class="retro-btn btn-small" id="btn-test-broken" style="background:#FF006E;border-color:#FFBE0B;" onclick="runWanBrokenTest()">
                            ⚡ 実験3：外の光回線が断線したら？（LAN境界実験）
                        </button>
                    </div>
                    <button class="retro-btn btn-primary ${(s5State.testedLan && s5State.testedWan) ? '' : 'hidden'}" id="btn-finish-s5" onclick="completeStage5()">
                        ▶ 全5工程の業務を完了する！
                    </button>
                `}
            </div>
        </div>
    `;
}

window.placeLanDevice = function (devIdx) {
    const dev = lanDevices[devIdx];
    const emptyIdx = s5State.slots.findIndex(s => s === null);
    if (emptyIdx === -1) return;

    s5State.slots[emptyIdx] = dev;

    if (dev.correctSlot === emptyIdx) {
        sfxSwitch();
        setTicker(`配線OK：【${dev.name}】を正しい位置（${emptyIdx + 1}番目）に接続しました！`);
    } else {
        sfxWrong();
        recordMiss();
        setSpeaker(
            '【通信局・現場監督】',
            'operator_cat.png',
            `おっと、そこは違うニャ！<br><strong>${dev.wrongHint}</strong><br>赤い枠をクリックして一旦外してから、正しい機器を選ぶニャ！`
        );
        setTicker(`配線エラー：${dev.name} の位置が違います。赤い枠をクリックして外してください。`);
    }

    const allCorrect = s5State.slots.every((d, i) => d && d.correctSlot === i);
    if (allCorrect) {
        sfxCorrect();
        setSpeaker(
            '【通信局・現場監督】',
            'operator_cat.png',
            'お見事ニャ！外から順に<strong>「① ONU ➔ ② ルータ ➔ ③ スイッチングハブ ➔ ④ アクセスポイント」</strong>と完璧に配線できたニャ！<br>最後に下の<strong>「実験1（LAN内印刷）」と「実験2（WAN通信）」の両方のボタン</strong>を押して、データがどこを通るか目撃するニャ！'
        );
        setTicker('LAN配線完了！「実験1：店内プリンタ印刷」と「実験2：外のWeb閲覧」の両方を試してください。');
    }

    renderStage5DOM();
};

window.removeLanDevice = function (slotIdx) {
    if (!s5State.slots[slotIdx]) return;
    sfxSwitch();
    s5State.slots[slotIdx] = null;
    s5State.activeTest = null;
    renderStage5DOM();
};

window.resetLanSlots = function () {
    sfxSwitch();
    s5State.slots = [null, null, null, null];
    s5State.activeTest = null;
    renderStage5DOM();
};

window.runLanPrintTest = function () {
    s5State.activeTest = 'lan';
    s5State.testedLan = true;
    sfxCorrect();
    renderStage5DOM();

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        '光っている場所に注目ニャ！<br><strong>店内のPCから店内のプリンタへ印刷するときは、「③ スイッチングハブ」だけで折り返すから、ルータやONU、外のインターネット（WAN）は一切通らない</strong>ニャ！<br>（つまり外のネット回線が故障していても、LAN内の印刷やファイル共有はできるニャ！'
    );
    setTicker('実験1（LAN内通信）：PC ➔ スイッチングハブ ➔ プリンタ で完結！（ルータの外へは出ません');
};

window.runWanWebTest = function () {
    s5State.activeTest = 'wan';
    s5State.testedWan = true;
    sfxCorrect();
    renderStage5DOM();

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        '今度は全部光ったニャ！<br>スマホから外のWebサイトを見るときは、<strong>「④ AP ➔ ③ ハブ ➔ ② ルータ（内と外の関所） ➔ ① ONU（光変換） ➔ 外のWAN」</strong>とすべての機器を通って外の世界へ出ていくニャ！'
    );
    setTicker('実験2（WAN通信）：スマホ ➔ AP ➔ ハブ ➔ ルータ ➔ ONU ➔ 外のインターネット へ通過！');
};

window.completeStage5 = function () {
    updateScore(100);
    showHanko('全工程完遂');
    setTimeout(() => {
        openStageQuizModal(4);
    }, 650);
};

// =========================================================================
// 工程クリア時の1問確認テストモーダル
// =========================================================================
function openStageQuizModal(quizIdx) {
    const q = stageQuizzes[quizIdx];
    const modal = document.getElementById('stage-overlay');
    document.getElementById('overlay-badge').textContent = q.badge;
    document.getElementById('overlay-title').textContent = q.title;
    document.getElementById('overlay-desc').textContent = q.summary;
    document.getElementById('mini-quiz-q').textContent = '問. ' + q.question;

    const fb = document.getElementById('mini-quiz-feedback');
    fb.classList.add('hidden');
    fb.textContent = '';

    const nextBtn = document.getElementById('next-stage-btn');
    nextBtn.classList.add('hidden');
    nextBtn.textContent = q.stage < 5 ? `次の工程へ進む ▶` : '業務完了報告書を見る ▶';

    const choicesBox = document.getElementById('mini-quiz-choices');
    choicesBox.innerHTML = q.choices.map((cText, i) => `
        <button class="quiz-choice-btn" id="qchoice-${i}" onclick="answerStageQuiz(${quizIdx}, ${i})">
            ${['ア', 'イ', 'ウ', 'エ'][i]}. ${cText}
        </button>
    `).join('');

    modal.classList.remove('hidden');
}

window.answerStageQuiz = function (quizIdx, selectedIdx) {
    const q = stageQuizzes[quizIdx];
    const fb = document.getElementById('mini-quiz-feedback');
    const nextBtn = document.getElementById('next-stage-btn');

    if (selectedIdx === q.answerIndex) {
        sfxCorrect();
        document.querySelectorAll('.quiz-choice-btn').forEach((btn, i) => {
            btn.disabled = true;
            if (i === q.answerIndex) btn.classList.add('correct');
        });
        fb.textContent = '◎ ' + q.explanation;
        fb.classList.remove('hidden');
        nextBtn.classList.remove('hidden');
    } else {
        sfxWrong();
        recordMiss();
        const wrongBtn = document.getElementById('qchoice-' + selectedIdx);
        if (wrongBtn) {
            wrongBtn.classList.add('wrong');
            wrongBtn.disabled = true;
        }
        fb.textContent = '× 惜しいニャ！さっきの現場での操作を思い出して、もう1つ選んでみるニャ！';
        fb.classList.remove('hidden');
    }
};

window.proceedNextStage = function () {
    sfxSwitch();
    document.getElementById('stage-overlay').classList.add('hidden');
    if (currentStage < 5) {
        loadStage(currentStage + 1);
    } else {
        showClearScreen();
    }
};

// =========================================================================
// クリア画面（ミス回数に応じた局長査定ランク変化）＆ あいことばコピー
// =========================================================================
function showClearScreen() {
    sfxFanfare();
    playBgm(bgmTitle);

    const finalScore = Math.max(100, score - totalMisses * 20);
    document.getElementById('final-score').textContent = finalScore;
    document.getElementById('final-misses').textContent = totalMisses;

    const rankEl = document.getElementById('final-rank');
    const titleEl = document.getElementById('final-title-name');
    const rewardEl = document.getElementById('final-reward');
    const commentEl = document.getElementById('final-comment');

    if (totalMisses === 0) {
        rankEl.textContent = '特級';
        titleEl.innerHTML = '<strong>特命ネットワーク総括技師（ノーミス最高評価）</strong>';
        rewardEl.textContent = '高級ちゅ〜る 1年分 ＋ 黄金のLANケーブル勲章';
        commentEl.textContent = 'ミス0回の神業ニャ！回線交換の弱点、パケット分割の適量、TCP/UDPの使い分け、小規模LANの内と外の境界まで完全制覇した伝説の通信技師ニャ！';
    } else if (totalMisses <= 2) {
        rankEl.textContent = '一級';
        titleEl.innerHTML = '<strong>主任パケット通信技師（優秀評価）</strong>';
        rewardEl.textContent = '高級またたび缶 3ヶ月分 ＋ 真鍮のルータバッジ';
        commentEl.textContent = '素晴らしい手さばきニャ！現場で試行錯誤したおかげで、なぜその通信方式やLAN機器が必要なのか本質がバッチリ身についたニャ！';
    } else {
        rankEl.textContent = '二級';
        titleEl.innerHTML = '<strong>現場通信局員（完遂評価）</strong>';
        rewardEl.textContent = '焼きかつお 1本 ＋ LANケーブル皮むき研修券';
        commentEl.textContent = '最後まで粘り強く全5工程をやり遂げたニャ！もう一度ノーミス（特級）を目指して挑戦すると、さらに完璧に頭に入るニャ！';
    }

    setScreen('screen-clear');
}

window.copyKeyword = function () {
    const kw = document.getElementById('keyword-val').textContent.trim();
    const btn = document.getElementById('copy-btn');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(kw).then(() => {
            showCopySuccess(btn);
        }).catch(() => {
            fallbackCopy(kw, btn);
        });
    } else {
        fallbackCopy(kw, btn);
    }
};

function fallbackCopy(text, btn) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    showCopySuccess(btn);
}

function showCopySuccess(btn) {
    sfxCorrect();
    const orig = btn.innerHTML;
    btn.innerHTML = '◎ コピー完了！';
    btn.style.background = '#1e5c3a';
    setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
    }, 2000);
}

window.openReviewModal = function () {
    sfxSwitch();
    document.getElementById('reviewModal').classList.remove('hidden');
};

window.closeReviewModal = function () {
    sfxSwitch();
    document.getElementById('reviewModal').classList.add('hidden');
};

window.triggerManualLightning = function () {
    const canvasFrame = document.querySelector('.canvas-frame');
    if (canvasFrame) {
        canvasFrame.classList.add('lightning-flash');
        setTimeout(() => canvasFrame.classList.remove('lightning-flash'), 600);
    }
    sfxThunder();

    // 北ルート寸断
    s3State.phase = 'broken';
    s3State.routeSouth = false;
    if (!s3State.arrivalLog) s3State.arrivalLog = [];
    s3State.arrivalLog.push({ lost: true, label: '× #2/4（北鉄橋に落雷！寸断発生' });
    if (typeof updateArrivalLogDOM === "function") updateArrivalLogDOM();

    // ルータAが障害を自動検知して南へ自動迂回！
    setTimeout(() => {
        s3State.routeSouth = true;
        s3State.phase = 'rerouted';
        const swBtn = document.getElementById('btn-s3-switch');
        if (swBtn) {
            swBtn.textContent = '◎ ルータA：【南のう回路へ自動迂回】完了！';
            swBtn.classList.remove('btn-secondary', 'btn-danger');
            swBtn.classList.add('btn-primary');
        }
        setSpeaker(
            '【通信局・現場監督】',
            'operator_cat.png',
            '⚡ ドカーン！北ルートの鉄橋に落雷発生ニャ！<br>でも<strong>ルータAが瞬時に障害を自動検知し、【南のう回路（ルータC経由）】へパケットを自動迂回</strong>させたニャ！これがインターネットの強さ（冗長性と自律ルーティング）ニャ！'
        );
        setTicker('⚡ 落雷検知：ルータAが南のう回路へパケットを自動迂回させました！');

        s3State.packets.push(
            { id: '#4', type: 'order', progress: 0.0, speed: 0.007, route: 'south', decided: true, active: true },
            { id: 'マダム話3', type: 'madam', progress: -0.2, speed: 0.007, route: 'south', decided: true, active: true }
        );
    }, 800);
};

window.drawOscilloscope = function (mode) {
    const canvas = document.getElementById('oscilloscope-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // グリッド線
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();

    // 波形
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (mode === 'udp') {
        ctx.strokeStyle = '#FFBE0B';
        ctx.shadowColor = '#FFBE0B';
        ctx.shadowBlur = 8;
        for (let x = 0; x < w; x++) {
            let y = h / 2;
            if (x < 140) {
                y += Math.sin(x * 0.08) * 22; // #1 パケット波形
            } else if (x >= 140 && x < 260) {
                // #2 欠落によるノイズ・乱れ！
                y += (Math.random() - 0.5) * 6;
            } else {
                y += Math.sin(x * 0.08) * 22; // #3, #4 パケット波形
            }
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
    } else if (mode === 'tcp') {
        ctx.strokeStyle = '#00F59B';
        ctx.shadowColor = '#00F59B';
        ctx.shadowBlur = 10;
        for (let x = 0; x < w; x++) {
            const y = h / 2 + Math.sin(x * 0.08) * 24; // 完璧に復元された美しい波形
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
    } else {
        ctx.strokeStyle = '#00F0FF';
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 6;
        for (let x = 0; x < w; x++) {
            const y = h / 2 + Math.sin(x * 0.05) * 10;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
};

window.jumpToStage = function(n) { loadStage(n); };


// =========================================================================
// 【マシマシ新機能】パケット解剖レントゲン・荷札雪崩・モグラ断線・用語ツールチップ
// =========================================================================

// 🔬 パケット解剖レントゲンスコープ開閉
window.openPacketScope = function (data) {
    sfxPaper();
    const modal = document.getElementById('packet-scope-modal');
    if (!modal) return;
    document.getElementById('scope-seq').textContent = `#${data.seq || 1} / 4 パケット`;
    document.getElementById('scope-dst-ip').textContent = data.dst || '203.0.113.5 (ねこカフェ局';
    document.getElementById('scope-src-ip').textContent = data.src || '198.51.100.2 (通信局)';
    document.getElementById('scope-payload-text').textContent = `「${data.payload || 'データ本体'}」 (5バイト)`;
    modal.classList.remove('hidden');
};

window.closePacketScope = function (e) {
    if (e && e.target && e.target.closest('.modal-card')) return;
    const modal = document.getElementById('packet-scope-modal');
    if (modal) modal.classList.add('hidden');
};

// 🏷 荷札雪崩パニック（実験B用）
window.triggerTagAvalanche = function () {
    const container = document.getElementById('avalanche-container');
    if (!container) return;
    container.classList.remove('hidden');
    container.innerHTML = '';
    for (let i = 1; i <= 24; i++) {
        const tag = document.createElement('div');
        tag.className = 'avalanche-tag';
        tag.textContent = `🏷 荷札(ヘッダ) #${i}`;
        tag.style.left = (Math.random() * 85) + 'vw';
        tag.style.top = '-50px';
        tag.style.animationDelay = (Math.random() * 0.7) + 's';
        tag.style.animationDuration = (1.6 + Math.random() * 0.8) + 's';
        container.appendChild(tag);
    }
    setTimeout(() => {
        container.classList.add('hidden');
        container.innerHTML = '';
    }, 3000);
};

// ⚡ 実験3：外の光回線断線時のモグラ工事ねこ登場
window.runWanBrokenTest = function () {
    s5State.activeTest = 'broken';
    sfxWrong();
    renderStage5DOM();

    // WANエリアにモグラ工事看板を出現
    const wanZone = document.querySelector('.zone-wan');
    if (wanZone) {
        wanZone.classList.add('wan-broken');
        const bar = document.createElement('div');
        bar.className = 'mole-barricade';
        bar.innerHTML = '🚧 モグラに光ケーブルかじられたニャー！（屋外断線';
        wanZone.appendChild(bar);
    }

    setSpeaker(
        '【通信局・現場監督】',
        'operator_cat.png',
        '大事件ニャ！外の光ファイバーが工事断線して、外のWebサイトは見られなくなったニャ！<br>でも落ち着くニャ！<strong>「店内のPC ➔ スイッチングハブ ➔ 店内のプリンタ」はルータの外（WAN）に出ないから、外が断線していても印刷はピンピン動く</strong>ニャ！これがLANの境界の本質ニャ！'
    );
    setTicker('実験3（屋外断線）：外のWANは不通ですが、ハブだけで折り返す店内印刷は正常に動きます！');
};

// 💡 インライン用語フキダシ初期化
window.initTermTips = function () {
    const tips = [
        { term: 'パケット', title: '📦 パケットとは？', desc: '大きなデータを小分けにした小包のこと。道路（回線）を独占せずにみんなで共有できるニャ！' },
        { term: 'ヘッダ', title: '🏷 ヘッダ（荷札）とは？', desc: 'パケットの先頭に付く「宛先IP・送信元IP・通し番号」。これがないと迷子になるニャ！' },
        { term: 'ペイロード', title: '🎁 ペイロードとは？', desc: 'ヘッダ荷札を除いた「データ本体（中身）」のこと。小包の箱に入っている荷物そのものニャ！' },
        { term: 'オーバーヘッド', title: '⚖ オーバーヘッドとは？', desc: '中身（ペイロード）に対して余計にかかる荷札や制御情報のムダな重みのことニャ！' },
        { term: 'ONU', title: '🔌 ONU（回線終端装置', desc: '外の光ファイバー（光信号）と店内のLANケーブル（電気信号）を翻訳する玄関マシンニャ！' },
        { term: 'ルータ', title: '🚦 ルータ（関所）', desc: '外の世界（WAN）と内の世界（LAN）の境界に立ち、最適な道順を案内する交通整理役ニャ！' },
        { term: 'スイッチングハブ', title: '🔀 スイッチングハブ', desc: 'LANの中だけで複数機器を枝分かれさせるタコ足配線役。LAN内印刷はここでUターンするニャ！' }
    ];

    document.querySelectorAll('.stage-mount, .speech-sheet, .sticky-desc').forEach(el => {
        tips.forEach(t => {
            const regex = new RegExp(`(?<![a-zA-Z0-9_])${t.term}(?![a-zA-Z0-9_])`, 'g');
            // 安全なテキストノード置換
        });
    });
};

window.addEventListener('DOMContentLoaded', () => {
    if (window.initTermTips) window.initTermTips();
});
