# コミットメッセージルール

## 基本形式

```
<type>(<scope>): <subject>

<body>

<footer>
```

## Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響を与えない変更（空白、フォーマット、セミコロンの欠落など）
- `refactor`: バグ修正や機能追加のないコードの変更
- `perf`: パフォーマンスを向上させるコードの変更
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやドキュメント生成などの補助ツールやライブラリの変更

## Scope

変更の範囲を示す。以下は例：

- `ui`: UI関連の変更
- `api`: API関連の変更
- `db`: データベース関連の変更
- `auth`: 認証関連の変更
- `core`: コアロジックの変更

## Subject

変更内容の要約。以下のルールに従う：

- 命令形で記述（"changed" や "changes" ではなく "change" 使用）
- 最初の文字は小文字
- 文末にピリオドを付けない
- 50文字以内

## Body

変更の詳細な説明：

- 変更の理由
- 以前の動作との比較
- 72文字で改行
- 複数行可

## Footer

- Breaking changes の説明
- Issue への参照
- 関連PRへの参照

## 例

```
feat(auth): implement JWT authentication

- Add JWT token generation and validation
- Create middleware for protected routes
- Add refresh token mechanism

Closes #123
```

```
fix(ui): resolve memory leak in drawing canvas

The canvas was not properly disposing WebGL contexts,
leading to increased memory usage over time.

Breaking change: Canvas.dispose() must now be called manually
```

## コミット時の注意点

1. 単一の責任
   - 1つのコミットは1つの論理的な変更のみを含む
   - 複数の変更は別々のコミットに分ける

2. 動作確認
   - コミット前にビルドとテストが成功することを確認
   - リンター/フォーマッターを実行

3. 機密情報
   - パスワード、APIキー、トークンなどをコミットしない
   - .gitignoreの確認

4. コミットの粒度
   - 小さく、理解しやすい単位でコミット
   - 後からの変更履歴の追跡が容易になるように 