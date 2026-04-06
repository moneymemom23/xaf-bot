# register_scheduler.ps1
# Windowsタスクスケジューラに自動投稿タスクを登録する
# PowerShellを「管理者として実行」してから実行してください

$NodePath = "C:\Program Files\nodejs\node.exe"
$ScriptPath = "$PSScriptRoot\post.js"
$WorkDir   = $PSScriptRoot

# タスク名
$TaskName730  = "XAF_AutoPost_0730"
$TaskName2100 = "XAF_AutoPost_2100"

# 既存タスクを削除（再登録のため）
foreach ($name in @($TaskName730, $TaskName2100)) {
  if (Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue) {
    Unregister-ScheduledTask -TaskName $name -Confirm:$false
    Write-Host "既存タスク削除: $name"
  }
}

# アクション定義
$Action = New-ScheduledTaskAction `
  -Execute $NodePath `
  -Argument "`"$ScriptPath`"" `
  -WorkingDirectory $WorkDir

# 設定
$Settings = New-ScheduledTaskSettingsSet `
  -ExecutionTimeLimit (New-TimeSpan -Minutes 5) `
  -StartWhenAvailable `
  -RunOnlyIfNetworkAvailable

# ログオン済みユーザーで実行
$Principal = New-ScheduledTaskPrincipal `
  -UserId $env:USERNAME `
  -LogonType Interactive `
  -RunLevel Limited

# 7:30 タスク（毎日）
$Trigger730 = New-ScheduledTaskTrigger -Daily -At "07:30"
Register-ScheduledTask `
  -TaskName $TaskName730 `
  -Action $Action `
  -Trigger $Trigger730 `
  -Settings $Settings `
  -Principal $Principal `
  -Description "XアフィリエイトBot - 朝7:30自動投稿" | Out-Null
Write-Host "✅ タスク登録完了: $TaskName730 (毎日 07:30)"

# 21:00 タスク（毎日）
$Trigger2100 = New-ScheduledTaskTrigger -Daily -At "21:00"
Register-ScheduledTask `
  -TaskName $TaskName2100 `
  -Action $Action `
  -Trigger $Trigger2100 `
  -Settings $Settings `
  -Principal $Principal `
  -Description "XアフィリエイトBot - 夜21:00自動投稿" | Out-Null
Write-Host "✅ タスク登録完了: $TaskName2100 (毎日 21:00)"

Write-Host "`n=== セットアップ完了 ==="
Write-Host "毎日 7:30 と 21:00 に自動投稿されます。"
Write-Host "PCがスリープ状態でも、起動後に実行されます（StartWhenAvailable）。"
Write-Host "`nタスクの確認: タスクスケジューラ → タスク スケジューラ ライブラリ"
