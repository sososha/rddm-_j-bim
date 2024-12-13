# RDDM J-BIM

リアルタイムデータ同期機能を備えた建築BIMアプリケーション

## 概要

RDDM J-BIMは、異なるビュー（間取り図、構造図、意匠図）間でリアルタイムデータ同期を実現する建築BIMアプリケーションです。

### 主要機能

- マルチビュー編集
  - 間取り図
  - 構造図
  - 意匠図
- リアルタイムデータ同期
- 協調設計支援
- バージョン管理

## 技術スタック

### フロントエンド
- React + TypeScript
- Vite
- Jotai (状態管理)
- Konva.js (キャンバス描画)
- TailwindCSS (スタイリング)

### バックエンド
- Rust
- Axum (Webフレームワーク)
- SQLx (データベース)
- WebSocket (リアルタイム通信)

### データベース
- SQLite

### 開発環境
- Docker
- VSCode
- Git/GitHub

## セットアップ

### 前提条件
- Docker Desktop
- Node.js v20以上
- Rust 1.75以上
- VSCode

### 開発環境の構築

1. リポジトリのクローン
```bash
git clone https://github.com/sososha/rddm-_j-bim.git
cd rddm-_j-bim
```

2. 環境変数の設定
```bash
cp .env.example .env
```

3. Dockerコンテナの起動
```bash
docker compose up -d
```

4. フロントエンド開発サーバーの起動
```bash
cd src/frontend
npm install
npm run dev
```

5. バックエンド開発サーバーの起動
```bash
cd src/backend
cargo run
```

## 開発ガイドライン

- [ブランチ戦略](docs/git/branch-strategy.md)
- [コミットルール](docs/git/commit-rules.md)
- [コーディング規約](docs/coding-standards.md)
- [テストガイドライン](docs/test/guidelines.md)

## ディレクトリ構造

```
/
├── docs/               # ドキュメント
├── src/               # ソースコード
│   ├── frontend/     # フロントエンドアプリケーション
│   └── backend/      # バックエンドアプリケーション
├── docker/           # Docker設定
├── .vscode/          # VSCode設定
└── tests/            # テストコード
```

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。
