# スタイルガイド

## 概要
RDDMシステムのビジュアルデザインシステムの定義。

## カラーパレット

### 1. ブランドカラー
```css
:root {
  /* プライマリカラー */
  --primary-50: #E3F2FD;
  --primary-100: #BBDEFB;
  --primary-200: #90CAF9;
  --primary-300: #64B5F6;
  --primary-400: #42A5F5;
  --primary-500: #2196F3;  /* メインカラー */
  --primary-600: #1E88E5;
  --primary-700: #1976D2;
  --primary-800: #1565C0;
  --primary-900: #0D47A1;

  /* アクセントカラー */
  --accent-50: #FFF3E0;
  --accent-100: #FFE0B2;
  --accent-200: #FFCC80;
  --accent-300: #FFB74D;
  --accent-400: #FFA726;
  --accent-500: #FF9800;  /* メインアクセント */
  --accent-600: #FB8C00;
  --accent-700: #F57C00;
  --accent-800: #EF6C00;
  --accent-900: #E65100;
}
```

### 2. システムカラー
```css
:root {
  /* グレースケール */
  --gray-50: #FAFAFA;
  --gray-100: #F5F5F5;
  --gray-200: #EEEEEE;
  --gray-300: #E0E0E0;
  --gray-400: #BDBDBD;
  --gray-500: #9E9E9E;
  --gray-600: #757575;
  --gray-700: #616161;
  --gray-800: #424242;
  --gray-900: #212121;

  /* セマンティックカラー */
  --success: #4CAF50;
  --warning: #FFC107;
  --error: #F44336;
  --info: #2196F3;
}
```

### 3. 図面要素カラー
```css
:root {
  /* 間取り図モード */
  --floorplan-wall: #424242;
  --floorplan-room: #FFFFFF;
  --floorplan-door: #757575;
  --floorplan-window: #BDBDBD;

  /* 構造図モード */
  --structural-beam: #1565C0;
  --structural-column: #0D47A1;
  --structural-wall: #1976D2;
  --structural-slab: #90CAF9;

  /* 意匠図モード */
  --architectural-wall: #424242;
  --architectural-opening: #BDBDBD;
  --architectural-fixture: #757575;
  --architectural-furniture: #9E9E9E;
}
```

## タイポグラフィ

### 1. フォントファミリー
```css
:root {
  --font-primary: 'Noto Sans JP', sans-serif;
  --font-secondary: 'Roboto', sans-serif;
  --font-mono: 'Source Code Pro', monospace;
}
```

### 2. フォントサイズ
```css
:root {
  --text-xs: 0.75rem;   /* 12px */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.125rem;  /* 18px */
  --text-xl: 1.25rem;   /* 20px */
  --text-2xl: 1.5rem;   /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.25rem;  /* 36px */
}
```

### 3. フォントウェイト
```css
:root {
  --font-light: 300;
  --font-regular: 400;
  --font-medium: 500;
  --font-bold: 700;
}
```

## スペーシング

### 1. 基本スペーシング
```css
:root {
  --spacing-0: 0;
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-10: 2.5rem;  /* 40px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */
}
```

### 2. レイアウトスペーシング
```css
:root {
  --layout-gutter: var(--spacing-4);
  --layout-margin: var(--spacing-6);
  --layout-padding: var(--spacing-4);
}
```

## シャドウ

```css
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

## 境界線

```css
:root {
  --border-width-thin: 1px;
  --border-width-medium: 2px;
  --border-width-thick: 4px;
  
  --border-radius-sm: 0.125rem;  /* 2px */
  --border-radius-md: 0.25rem;   /* 4px */
  --border-radius-lg: 0.5rem;    /* 8px */
  --border-radius-full: 9999px;
}
```

## アニメーション

### 1. トランジション
```css
:root {
  --transition-fast: 150ms;
  --transition-normal: 250ms;
  --transition-slow: 350ms;
  
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
}
```

### 2. アニメーション
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
```

## コンポーネントスタイル

### 1. ボタン
```css
.btn {
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-medium);
  transition: all var(--transition-normal) var(--ease-in-out);
}

.btn-primary {
  background-color: var(--primary-500);
  color: white;
}

.btn-secondary {
  background-color: var(--gray-200);
  color: var(--gray-800);
}
```

### 2. 入力フィールド
```css
.input {
  padding: var(--spacing-2) var(--spacing-3);
  border: var(--border-width-thin) solid var(--gray-300);
  border-radius: var(--border-radius-md);
  font-size: var(--text-base);
}

.input:focus {
  border-color: var(--primary-500);
  box-shadow: 0 0 0 2px var(--primary-100);
}
```

### 3. パネル
```css
.panel {
  background-color: white;
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-4);
}
```

## レスポンシブデザイン

### 1. ブレークポイント
```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

### 2. メディアクエリ
```css
/* モバイルファースト */
@media (min-width: 640px) {
  /* Small devices */
}

@media (min-width: 768px) {
  /* Medium devices */
}

@media (min-width: 1024px) {
  /* Large devices */
}
```

## アクセシビリティ

### 1. フォーカス表示
```css
:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

.focus-visible:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}
```

### 2. ハイコントラストモード
```css
@media (prefers-contrast: high) {
  :root {
    --primary-500: #0056b3;
    --accent-500: #d14900;
  }
}
```

## ダークモード

```css
@media (prefers-color-scheme: dark) {
  :root {
    --gray-50: #18181B;
    --gray-100: #27272A;
    --gray-200: #3F3F46;
    --gray-300: #52525B;
    --gray-400: #71717A;
    --gray-500: #A1A1AA;
    --gray-600: #D4D4D8;
    --gray-700: #E4E4E7;
    --gray-800: #F4F4F5;
    --gray-900: #FAFAFA;
  }
}
``` 