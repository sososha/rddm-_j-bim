## Graphics コンポーネント 詳細定義

### 1. 責務

- グラフィックスの描画処理を行う。
    
- 基本的な図形（例えば、単色の四角形）を表示する。
    
- bevyのフレームワークと連携し、描画パイプラインを管理する。
    

### 2. 依存クレート

- bevy
    

### 3. インターフェース

- init_graphics(window_handle: WindowHandle) -> Result<(), Error>
    
    - **概要:** グラフィックスを初期化する。
        
    - **引数:**
        
        - window_handle: Windowコンポーネントで作成したウィンドウハンドル。
            
    - **戻り値:**
        
        - Ok(()): グラフィックスの初期化が成功した場合。
            
        - Err(Error): グラフィックスの初期化に失敗した場合のエラー。
            
- draw_rectangle(x: f32, y: f32, width: f32, height: f32, color: Color) -> Result<(), Error>
    
    - **概要:** 指定された位置、サイズ、色で四角形を描画する。
        
    - **引数:**
        
        - x: 四角形の左上隅のx座標。
            
        - y: 四角形の左上隅のy座標。
            
        - width: 四角形の幅。
            
        - height: 四角形の高さ。
            
        - color: 四角形の色。
            
    - **戻り値:**
        
        - Ok(()): 四角形の描画が成功した場合。
            
        - Err(Error): 四角形の描画に失敗した場合のエラー。
            
- render() -> Result<(), Error>
    
    - **概要:** シーンをレンダリングする。
        
    - **引数:** なし
        
    - **戻り値:**  
        * Ok(()): レンダリングが成功した場合。  
        * Err(Error): レンダリングに失敗した場合のエラー。
        

### 4. データモデル (Rustでの表現例)

```
// 色を表す構造体
#[derive(Clone, Copy)]
pub struct Color {
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

// Graphicsコンポーネントで使用するエラー型
#[derive(Debug)]
pub enum Error {
    GraphicsInitError,
    DrawError,
    RenderError,
}
```

content_copyUse code [with caution](https://support.google.com/legal/answer/13505487).Rust

### 5. 実装詳細

1. **init_graphics() の実装**
    
    - bevyのAppを生成し、ウィンドウ情報とグラフィックス設定を初期化する。
        
    - bevyのPluginを登録する。
        
    - エラー発生時は、適切なエラー型(Error::GraphicsInitError)をErrに格納して返す。
        

```
use bevy::prelude::*;
use bevy::window::{Window, WindowPlugin};

fn init_graphics(window_handle: WindowHandle) -> Result<(), Error> {
    let window_plugin = WindowPlugin {
        primary_window: Some(Window {
            title: "CAD App".to_string(),
            ..Default::default()
        }),
        ..Default::default()
    };

   App::new()
    .add_plugins((window_plugin))
    .add_systems(Startup, setup_camera)
        .run();
    Ok(())
}

fn setup_camera(mut commands: Commands) {
    commands.spawn(Camera2dBundle::default());
}
```

content_copyUse code [with caution](https://support.google.com/legal/answer/13505487).Rust

1. **draw_rectangle() の実装**
    
    - bevy の Commands を使用して、スプライトを生成し、四角形を描画する。
        
    - 指定された位置、サイズ、色を SpriteBundle に設定します。
        
    - エラー発生時は、適切なエラー型(Error::DrawError)をErrに格納して返す。
        

```
use bevy::{prelude::*, sprite::SpriteBundle};

fn draw_rectangle(x: f32, y: f32, width: f32, height: f32, color: Color, mut commands: Commands) -> Result<(), Error> {
    commands.spawn(SpriteBundle {
        sprite: Sprite {
            color: bevy::prelude::Color::rgba(color.r, color.g, color.b, color.a),
            ..default()
        },
        transform: Transform::from_xyz(x, y, 0.0)
            .with_scale(Vec3::new(width, height, 1.0)),
        ..default()
    });
    Ok(())
}
```

content_copyUse code [with caution](https://support.google.com/legal/answer/13505487).Rust

1. **render() の実装**
    
    - bevy のrun()関数を実行する。
        
    - エラー発生時は、適切なエラー型(Error::RenderError)をErrに格納して返す。
        

```
fn render() -> Result<(), Error> {
       bevy::app::run_app();
        Ok(())
    }
```

content_copyUse code [with caution](https://support.google.com/legal/answer/13505487).Rust

### 6. 考慮事項

- **描画パイプライン:** bevy の描画パイプラインをどのように管理するかを検討する必要があります。
    
- **3D描画:** 今回は2D描画のみを実装しますが、将来的な3D描画に対応できるように考慮する必要があります。
    
- **パフォーマンス:** 大量の図形を描画する場合のパフォーマンスを考慮する必要があります。
    
- **シェーダー:** 複雑な描画が必要な場合は、シェーダーを導入する必要があります。
    

### 7. Graphics コンポーネントのコード例 (Rust)

```
use bevy::prelude::*;
use bevy::window::{Window, WindowPlugin};

// 色を表す構造体
#[derive(Clone, Copy)]
pub struct Color {
    pub r: f32,
    pub g: f32,
    pub b: f32,
    pub a: f32,
}

// Graphicsコンポーネントで使用するエラー型
#[derive(Debug)]
pub enum Error {
    GraphicsInitError,
    DrawError,
    RenderError,
}

pub struct Graphics;

impl Graphics {
    pub fn init_graphics(window_handle: WindowHandle) -> Result<(), Error> {
        let window_plugin = WindowPlugin {
            primary_window: Some(Window {
                title: "CAD App".to_string(),
                ..Default::default()
            }),
            ..Default::default()
        };
    
       App::new()
        .add_plugins((window_plugin))
        .add_systems(Startup, setup_camera)
            .run();
        Ok(())
    }

    pub fn draw_rectangle(x: f32, y: f32, width: f32, height: f32, color: Color, mut commands: Commands) -> Result<(), Error> {
        commands.spawn(SpriteBundle {
            sprite: Sprite {
                color: bevy::prelude::Color::rgba(color.r, color.g, color.b, color.a),
                ..default()
            },
            transform: Transform::from_xyz(x, y, 0.0)
                .with_scale(Vec3::new(width, height, 1.0)),
            ..default()
        });
        Ok(())
    }

    pub fn render() -> Result<(), Error> {
       bevy::app::run_app();
        Ok(())
    }
}

fn setup_camera(mut commands: Commands) {
    commands.spawn(Camera2dBundle::default());
}
```