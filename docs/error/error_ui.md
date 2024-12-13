# エラー通知UI設計書

## 1. 概要
本文書では、ユーザーへのエラー通知を行うUIコンポーネントの設計と実装ガイドラインを定義します。

## 2. UI設計原則

### 2.1 基本方針
- 明確で理解しやすい通知
- エラーの重要度に応じた表示方法
- ユーザーの操作を妨げない配置
- 適切なタイミングでの表示と消去
- アクセシビリティへの配慮

### 2.2 表示レベル
```rust
#[derive(Debug, Clone)]
pub enum NotificationLevel {
    Modal,      // モーダルダイアログ
    Toast,      // トースト通知
    Status,     // ステータスバー表示
    Inline,     // インライン表示
}

impl NotificationLevel {
    fn from_severity(severity: &Severity) -> Self {
        match severity {
            Severity::Critical => NotificationLevel::Modal,
            Severity::Error => NotificationLevel::Toast,
            Severity::Warning => NotificationLevel::Status,
            _ => NotificationLevel::Inline,
        }
    }
}
```

## 3. UIコンポーネント

### 3.1 エラーダイアログ
```rust
pub struct ErrorDialog {
    pub title: String,
    pub message: String,
    pub severity: Severity,
    pub actions: Vec<DialogAction>,
    pub details: Option<String>,
}

pub enum DialogAction {
    Retry,
    Ignore,
    Cancel,
    Custom(String, Box<dyn Fn() -> Result<(), SystemError>>),
}

impl ErrorDialog {
    pub fn show(&self) -> Result<DialogResponse, SystemError> {
        // ダイアログの表示ロジック
    }
}
```

### 3.2 トースト通知
```rust
pub struct ToastNotification {
    pub message: String,
    pub severity: Severity,
    pub duration: Duration,
    pub action: Option<ToastAction>,
}

impl ToastNotification {
    pub fn show(&self) {
        // トースト通知の表示ロジック
    }

    pub fn dismiss(&self) {
        // トースト通知の消去ロジック
    }
}
```

### 3.3 ステータスバー
```rust
pub struct StatusBar {
    pub current_status: SystemStatus,
    pub error_count: usize,
    pub warning_count: usize,
}

impl StatusBar {
    pub fn update_status(&mut self, status: SystemStatus) {
        // ステータスの更新ロジック
    }

    pub fn show_error_summary(&self) {
        // エラーサマリーの表示
    }
}
```

## 4. レイアウトとスタイル

### 4.1 配色定義
```rust
pub struct ErrorColors {
    pub critical: Color,
    pub error: Color,
    pub warning: Color,
    pub info: Color,
    pub background: Color,
    pub text: Color,
}

impl Default for ErrorColors {
    fn default() -> Self {
        Self {
            critical: Color::rgb(1.0, 0.0, 0.0),  // 赤
            error: Color::rgb(0.8, 0.0, 0.0),     // 暗い赤
            warning: Color::rgb(1.0, 0.7, 0.0),   // オレンジ
            info: Color::rgb(0.0, 0.0, 0.8),      // 青
            background: Color::rgb(0.95, 0.95, 0.95), // 薄いグレー
            text: Color::rgb(0.1, 0.1, 0.1),      // 濃いグレー
        }
    }
}
```

### 4.2 レイアウト定義
```rust
pub struct ErrorDialogLayout {
    pub width: f32,
    pub height: f32,
    pub padding: f32,
    pub margin: f32,
    pub border_radius: f32,
}

impl Default for ErrorDialogLayout {
    fn default() -> Self {
        Self {
            width: 400.0,
            height: 300.0,
            padding: 16.0,
            margin: 8.0,
            border_radius: 4.0,
        }
    }
}
```

## 5. インタラクション設計

### 5.1 ユーザーアクション
```rust
pub enum UserAction {
    Dismiss,
    Retry,
    ShowDetails,
    CopyDetails,
    ReportIssue,
    Custom(String),
}

impl ErrorDialog {
    pub fn handle_action(&self, action: UserAction) -> Result<(), SystemError> {
        match action {
            UserAction::Retry => {
                // リトライロジック
            }
            UserAction::ShowDetails => {
                // 詳細表示ロジック
            }
            // ... 他のアクショ��
        }
    }
}
```

### 5.2 アニメーション
```rust
pub struct NotificationAnimation {
    pub entry_duration: Duration,
    pub exit_duration: Duration,
    pub transition: TransitionType,
}

pub enum TransitionType {
    Fade,
    Slide,
    Scale,
    Custom(Box<dyn Fn(f32) -> Transform>),
}
```

## 6. アクセシビリティ

### 6.1 支援技術対応
```rust
pub trait AccessibleError {
    fn get_aria_label(&self) -> String;
    fn get_role(&self) -> String;
    fn is_modal(&self) -> bool;
    fn get_live_region_type(&self) -> LiveRegionType;
}

pub enum LiveRegionType {
    Polite,
    Assertive,
    Off,
}
```

### 6.2 キーボード操作
```rust
impl ErrorDialog {
    pub fn handle_keyboard_event(&self, event: KeyboardEvent) -> Result<(), SystemError> {
        match event.key {
            Key::Escape => self.dismiss(),
            Key::Enter => self.confirm(),
            Key::Tab => self.focus_next(),
            // ... 他のキー操作
        }
    }
}
```

## 7. 国際化対応

### 7.1 メッセージテンプレート
```rust
pub struct ErrorTemplate {
    pub key: String,
    pub translations: HashMap<Language, String>,
    pub parameters: Vec<String>,
}

impl ErrorTemplate {
    pub fn format(&self, language: Language, params: &[String]) -> String {
        // メッセージのフォーマット処理
    }
}
```

### 7.2 方向性対応
```rust
pub enum TextDirection {
    LeftToRight,
    RightToLeft,
}

impl ErrorDialog {
    pub fn adjust_layout(&mut self, direction: TextDirection) {
        // レイアウトの調整
    }
}
```

## 8. パフォーマンス最適化

### 8.1 レンダリング最適化
- コンポーネントの遅延ロード
- アニメーションの最適化
- リソースのプリロード

### 8.2 メモリ管理
```rust
impl ErrorNotificationManager {
    pub fn cleanup_old_notifications(&mut self) {
        // 古い通知の削除
    }

    pub fn recycle_components(&mut self) {
        // UIコンポーネントの再利用
    }
}
```

## 9. テスト戦略

### 9.1 ユニットテスト
```rust
#[cfg(test)]
mod tests {
    #[test]
    fn test_error_dialog_display() {
        let dialog = ErrorDialog::new(
            "Test Error",
            "This is a test error message",
            Severity::Error,
        );
        assert!(dialog.is_visible());
    }
}
```

### 9.2 インテグレーションテスト
- 複数の通知の同時表示
- アニメーションの連携
- ユーザー操作のシミュレーション

## 10. モニタリングと分析

### 10.1 メトリクス収集
```rust
pub struct UIMetrics {
    pub display_count: HashMap<NotificationLevel, usize>,
    pub interaction_count: HashMap<UserAction, usize>,
    pub average_display_time: Duration,
    pub dismissal_rate: f64,
}
```

### 10.2 ユーザー行動分析
- エラー通知の閲覧時間
- ユーザーの対応パターン
- 改善提案の収集
``` 