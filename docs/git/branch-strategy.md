# Git ブランチ戦略

## ブランチ構成

### メインブランチ
- `main`: 本番環境用のブランチ
- `develop`: 開発用のメインブランチ

### 機能ブランチ
- `feature/*`: 新機能開発用
  - 例: `feature/user-auth`, `feature/drawing-tool`
- `bugfix/*`: バグ修正用
  - 例: `bugfix/login-error`, `bugfix/memory-leak`

### リリースブランチ
- `release/*`: リリース準備用
  - 例: `release/v1.0.0`, `release/v1.1.0`

### ホットフィックスブランチ
- `hotfix/*`: 緊急バグ修正用
  - 例: `hotfix/critical-security-fix`

## ブランチフロー

1. 開発の流れ
   - `develop`から`feature/*`を作成
   - 開発完了後、`develop`にPRを作成
   - コードレビュー後、マージ

2. リリースの流れ
   - `develop`から`release/*`を作成
   - テスト・バグ修正を実施
   - 完了後、`main`と`develop`の両方にマージ

3. ホットフィックスの流れ
   - `main`から`hotfix/*`を作成
   - 修正後、`main`と`develop`の両方にマージ

## マージルール

1. PRの必須要件
   - コードレビュー（最��1名の承認）
   - CIテストの成功
   - コンフリクトの解消

2. マージ方式
   - `feature/*` → `develop`: Squash and merge
   - `release/*` → `main`: Merge commit
   - `hotfix/*` → `main`: Merge commit 