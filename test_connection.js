/**
 * test_connection.js — API接続テスト
 * config.json の認証情報が正しいか確認する
 */

const { TwitterApi } = require('twitter-api-v2');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf8'));

async function test() {
  console.log('X API 接続テストを開始します...\n');

  const client = new TwitterApi({
    appKey:      config.api_key,
    appSecret:   config.api_secret,
    accessToken: config.access_token,
    accessSecret: config.access_token_secret,
  });

  try {
    const me = await client.v2.me();
    console.log('✅ 接続成功！');
    console.log(`   アカウント名: ${me.data.name}`);
    console.log(`   ハンドル:     @${me.data.username}`);
    console.log(`   ID:           ${me.data.id}`);
    console.log('\n自動投稿の準備完了です。');
  } catch (err) {
    console.log('❌ 接続失敗');
    console.log(`   エラー: ${err.message}`);
    console.log('\nconfig.json の4つの認証情報を確認してください。');
  }
}

test();
