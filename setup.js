/**
 * setup.js — 管理アプリのデータを posts.json に書き出す
 *
 * x_affiliate_manager.html の localStorage は直接読めないため、
 * 管理アプリの「Export」ボタンで出力したJSONを読み込み、
 * 自動投稿用の posts.json を生成する。
 *
 * 使い方:
 *   1. x_affiliate_manager.html を開いて Export ボタンをクリック
 *   2. ダウンロードされた xaf_YYYY-MM-DD.json を xaf_bot フォルダに移動
 *   3. node setup.js xaf_YYYY-MM-DD.json
 */

const fs   = require('fs');
const path = require('path');

const inputFile = process.argv[2];
if (!inputFile) {
  // 引数なしの場合、デスクトップにある最新のxafファイルを自動検索
  const desktop = path.join(process.env.USERPROFILE || 'C:/Users/remon', 'Desktop');
  const files = fs.readdirSync(desktop)
    .filter(f => f.startsWith('xaf_') && f.endsWith('.json') && f !== 'xaf_initial_strategy.json')
    .sort()
    .reverse();
  if (files.length === 0) {
    console.log('ERROR: xaf_*.json が見つかりません');
    console.log('管理アプリ (x_affiliate_manager.html) を開いて Export ボタンをクリックしてください');
    process.exit(1);
  }
  const latest = path.join(desktop, files[0]);
  console.log(`自動検出: ${latest}`);
  convertFile(latest);
} else {
  convertFile(inputFile);
}

function convertFile(src) {
  const data = JSON.parse(fs.readFileSync(src, 'utf8'));
  const posts = (data.posts || []).map(p => ({
    id:         p.id,
    date:       p.date,
    time:       p.time || '21:00',
    title:      p.title || '',
    content:    p.content || '',
    hashtags:   p.hashtags || '',
    program_id: p.program_id || '',
    status:     p.status || 'scheduled',
    posted:     p.status === 'done' || false,
    tweet_id:   p.tweet_id || null,
    posted_at:  p.posted_at || null,
  }));

  const outPath = path.join(__dirname, 'posts.json');
  fs.writeFileSync(outPath, JSON.stringify(posts, null, 2), 'utf8');

  const pending = posts.filter(p => !p.posted && p.status !== 'done').length;
  console.log(`✅ posts.json を生成しました（全 ${posts.length} 件 / 未投稿 ${pending} 件）`);

  // 今後の予定を表示
  const now   = new Date();
  const jst   = new Date(now.getTime() + 9*60*60*1000);
  const today = jst.toISOString().slice(0,10);
  const upcoming = posts
    .filter(p => !p.posted && p.date >= today)
    .sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time))
    .slice(0,5);

  if (upcoming.length > 0) {
    console.log('\n直近の投稿予定:');
    upcoming.forEach(p => console.log(`  ${p.date} ${p.time}  ${p.title}`));
  }
}
