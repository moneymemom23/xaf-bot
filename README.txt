=====================================
 X アフィリエイト 自動投稿ボット
=====================================

【セットアップ手順】

▼ STEP 1: X Developer アカウントを取得
  1. https://developer.x.com にアクセス
  2. 「Sign up for Free Account」でアカウント作成
  3. 用途を英語で記入（例文はAIに頼めばOK）
  4. アプリを作成して以下4つの認証情報を取得：
     - API Key
     - API Key Secret
     - Access Token
     - Access Token Secret
  ※ アプリの権限は「Read and Write」に設定すること

▼ STEP 2: 認証情報を入力
  config.json を開いて4つの「ここに入力」を書き換える

▼ STEP 3: 接続テスト
  このフォルダで右クリック → 「ターミナルで開く」
  以下を実行:
    node test_connection.js
  「✅ 接続成功！」が表示されればOK

▼ STEP 4: 投稿データをセットアップ
  1. x_affiliate_manager.html を開く
  2. 右上の「Export」ボタンをクリック（JSONファイルが保存される）
  3. ターミナルで実行:
       node setup.js
  「posts.json を生成しました」と表示されればOK

▼ STEP 5: タスクスケジューラに登録（自動投稿の設定）
  PowerShell を「管理者として実行」で開き、以下を実行:
    cd C:\Users\remon\Desktop\xaf_bot
    .\register_scheduler.ps1
  毎日 7:30 と 21:00 に自動投稿されるようになります。

=====================================
【ファイル構成】
  config.json         ← API認証情報（秘密に保管）
  posts.json          ← 投稿データ（setup.jsで生成）
  post.js             ← 自動投稿スクリプト（タスクが実行）
  setup.js            ← posts.json 生成スクリプト
  test_connection.js  ← API接続テスト
  register_scheduler.ps1 ← タスクスケジューラ登録
  post_log.txt        ← 投稿ログ（自動生成）
=====================================
