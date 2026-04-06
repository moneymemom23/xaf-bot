/**
 * X アフィリエイト 自動投稿スクリプト
 * - 管理アプリ(x_affiliate_manager.html)のlocalStorageデータを参照せず、
 *   posts.json（同フォルダ）から投稿データを読み込む
 * - 今日の日付 + 現在時刻に対応する投稿を1件投稿する
 * - 投稿済みは posted:true にして再投稿を防ぐ
 */

const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

// ── 設定読み込み ──
const configPath = path.join(__dirname, 'config.json');
const postsPath  = path.join(__dirname, 'posts.json');
const logPath    = path.join(__dirname, 'post_log.txt');

function log(msg) {
  const ts = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
  const line = `[${ts}] ${msg}`;
  console.log(line);
  fs.appendFileSync(logPath, line + '\n');
}

async function main() {
  // 設定チェック
  if (!fs.existsSync(configPath)) {
    log('ERROR: config.json が見つかりません');
    process.exit(1);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const keys = ['api_key','api_secret','access_token','access_token_secret'];
  for (const k of keys) {
    if (!config[k] || config[k] === 'ここに入力') {
      log(`ERROR: config.json の ${k} が未設定です`);
      process.exit(1);
    }
  }

  // 投稿データ読み込み
  if (!fs.existsSync(postsPath)) {
    log('ERROR: posts.json が見つかりません。setup.js を先に実行してください');
    process.exit(1);
  }
  const posts = JSON.parse(fs.readFileSync(postsPath, 'utf8'));

  // 今日の日付・時刻
  const now   = new Date();
  const jst   = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  const today = jst.toISOString().slice(0, 10);          // YYYY-MM-DD
  const hhmm  = jst.toISOString().slice(11, 16);         // HH:MM
  const hour  = parseInt(hhmm.split(':')[0]);

  // 投稿対象を探す（今日・未投稿・予定時刻が現在時刻より60分以上先でないもの）
  const nowMinutes = hour * 60 + parseInt(hhmm.split(':')[1]);
  const candidates = posts.filter(p => {
    if (p.posted) return false;
    if (p.date !== today) return false;
    if (p.status === 'done') return false;
    const [ph, pm] = (p.time || '00:00').split(':').map(Number);
    const scheduled = ph * 60 + pm;
    // 予定時刻が現在より60分以上先なら対象外（まだ早い）
    return scheduled <= nowMinutes + 60;
  });

  if (candidates.length === 0) {
    log(`INFO: ${today} ${hhmm} — 投稿対象なし（今日の投稿はすべて完了 or 時刻外）`);
    process.exit(0);
  }

  // 先頭1件を投稿
  const target = candidates[0];
  const tweetText = target.content + (target.hashtags ? '\n\n' + target.hashtags : '');

  log(`POSTING: [${target.date} ${target.time}] ${target.title}`);

  const client = new TwitterApi({
    appKey:            config.api_key,
    appSecret:         config.api_secret,
    accessToken:       config.access_token,
    accessSecret:      config.access_token_secret,
  });

  try {
    const res = await client.v2.tweet(tweetText);
    log(`SUCCESS: tweet_id=${res.data.id}`);

    // 投稿済みフラグを立てる
    const idx = posts.findIndex(p => p.id === target.id);
    if (idx >= 0) {
      posts[idx].posted = true;
      posts[idx].tweet_id = res.data.id;
      posts[idx].posted_at = jst.toISOString();
    }
    fs.writeFileSync(postsPath, JSON.stringify(posts, null, 2), 'utf8');
    log(`SAVED: posts.json を更新しました`);

  } catch (err) {
    log(`ERROR: 投稿失敗 — ${err.message || JSON.stringify(err)}`);
    process.exit(1);
  }
}

main();
