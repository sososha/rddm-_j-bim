# テスト環境要件

## 1. 開発環境設定

### 1.1 フロントエンドテスト環境
```json
// package.json
{
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "ts-jest": "^29.0.0",
    "msw": "^2.0.0"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "jsdom",
    "setupFilesAfterEnv": [
      "<rootDir>/src/setupTests.ts"
    ],
    "moduleNameMapper": {
      "^@/(.*)$": "<rootDir>/src/$1"
    }
  }
}
```

### 1.2 バックエンドテスト環境
```toml
# Cargo.toml
[dev-dependencies]
tokio-test = "0.4"
mockall = "0.11"
async-trait = "0.1"
sqlx-test = "0.7"
test-log = "0.2"
```

### 1.3 E2Eテスト環境
```json
// package.json
{
  "devDependencies": {
    "cypress": "^13.0.0",
    "@cypress/code-coverage": "^3.0.0",
    "start-server-and-test": "^2.0.0"
  }
}
```

## 2. テストデータ設定

### 2.1 モックデータ構造
```typescript
// src/test/mocks/data.ts
interface TestData {
  projects: Project[];
  elements: Element[];
  users: User[];
  views: ViewState[];
}

const testData: TestData = {
  projects: [
    {
      id: "test-project-1",
      name: "テストプロジェクト1",
      elements: ["room-1", "wall-1"],
      views: ["floor", "structure"]
    }
  ],
  // ... その他のテストデータ
};
```

### 2.2 フィクスチャ
```typescript
// src/test/fixtures/
├── projects/
│   ├── empty.json
│   ├── simple.json
│   └── complex.json
├── elements/
│   ├── rooms.json
│   ├── walls.json
│   └── openings.json
└── views/
    ├── floor.json
    ├── structure.json
    └── architect.json
```

### 2.3 シードデータ
```sql
-- src/test/seed.sql
INSERT INTO projects (id, name, created_at) VALUES
('test-1', 'Test Project 1', CURRENT_TIMESTAMP),
('test-2', 'Test Project 2', CURRENT_TIMESTAMP);

INSERT INTO elements (id, project_id, type) VALUES
('room-1', 'test-1', 'room'),
('wall-1', 'test-1', 'wall');
```

## 3. モック設定

### 3.1 APIモック
```typescript
// src/test/mocks/api.ts
import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  rest.get('/api/projects', (req, res, ctx) => {
    return res(ctx.json(testData.projects));
  }),
  rest.post('/api/elements', (req, res, ctx) => {
    return res(ctx.json({ id: 'new-element-1' }));
  })
];

export const server = setupServer(...handlers);
```

### 3.2 WebSocketモック
```typescript
// src/test/mocks/websocket.ts
class MockWebSocket {
  onmessage: (event: MessageEvent) => void;
  send(data: string): void {
    // モックの実装
  }
  close(): void {
    // モックの実装
  }
}

global.WebSocket = MockWebSocket as any;
```

### 3.3 外部サービスモック
```typescript
// src/test/mocks/services.ts
jest.mock('@/services/pdf', () => ({
  generatePDF: jest.fn().mockResolvedValue('test.pdf'),
  convertToSVG: jest.fn().mockResolvedValue('test.svg')
}));
```

## 4. CI環境設定

### 4.1 GitHub Actions
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      sqlite:
        image: sqlite:latest
        
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
          
      - name: Install dependencies
        run: |
          npm ci
          cargo fetch
          
      - name: Run tests
        run: |
          npm test
          cargo test
          
      - name: Run E2E tests
        run: npm run test:e2e
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 4.2 Docker設定
```dockerfile
# test.Dockerfile
FROM node:20 as frontend
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm test

FROM rust:1.75 as backend
WORKDIR /app
COPY Cargo.* ./
RUN cargo fetch
COPY . .
RUN cargo test
```

### 4.3 テストレポート設定
```json
// jest.config.json
{
  "coverageReporters": [
    "text",
    "lcov",
    "cobertura"
  ],
  "reporters": [
    "default",
    "jest-junit"
  ]
}
```

## 5. モニタリング設定

### 5.1 パフォーマンスモニタリング
```typescript
// src/test/performance/monitor.ts
interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  apiLatency: number;
}

class PerformanceMonitor {
  start(): void {
    performance.mark('test-start');
  }
  
  end(): PerformanceMetrics {
    performance.mark('test-end');
    const measure = performance.measure(
      'test-duration',
      'test-start',
      'test-end'
    );
    return {
      renderTime: measure.duration,
      memoryUsage: performance.memory?.usedJSHeapSize,
      apiLatency: this.getAverageLatency()
    };
  }
}
```

### 5.2 エラーモニタリング
```typescript
// src/test/monitoring/error.ts
class ErrorMonitor {
  errors: Error[] = [];
  
  capture(error: Error): void {
    this.errors.push(error);
    console.error(`Test Error: ${error.message}`);
  }
  
  getReport(): string {
    return this.errors
      .map(e => `${e.name}: ${e.message}`)
      .join('\n');
  }
}
```

### 5.3 カバレッジモニタリング
```typescript
// src/test/monitoring/coverage.ts
interface CoverageReport {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
}

class CoverageMonitor {
  checkThresholds(report: CoverageReport): boolean {
    return (
      report.statements >= 90 &&
      report.branches >= 80 &&
      report.functions >= 90 &&
      report.lines >= 90
    );
  }
}
```

## 6. デバッグ設定

### 6.1 VSCode設定
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Jest Tests",
      "program": "${workspaceFolder}/node_modules/jest/bin/jest",
      "args": ["--runInBand"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen"
    },
    {
      "type": "lldb",
      "request": "launch",
      "name": "Rust Tests",
      "cargo": {
        "args": ["test", "--no-run"],
        "filter": {
          "name": "rddm",
          "kind": "lib"
        }
      }
    }
  ]
}
```

### 6.2 ログ設定
```typescript
// src/test/utils/logger.ts
const testLogger = {
  debug: (message: string) => {
    if (process.env.TEST_DEBUG) {
      console.debug(`[TEST] ${message}`);
    }
  },
  error: (message: string, error?: Error) => {
    console.error(`[TEST ERROR] ${message}`, error);
  }
};
```

## 7. セキュリティ設定

### 7.1 環境変数
```env
# .env.test
TEST_DB_URL=sqlite::memory:
TEST_API_KEY=test-api-key
TEST_JWT_SECRET=test-secret
```

### 7.2 認証設定
```typescript
// src/test/auth/setup.ts
const testAuth = {
  user: {
    id: 'test-user',
    role: 'admin'
  },
  token: 'test-jwt-token'
};

beforeEach(() => {
  localStorage.setItem('auth', JSON.stringify(testAuth));
});
```

## 8. クリーンアップ設定

### 8.1 データクリーンアップ
```typescript
// src/test/cleanup/database.ts
async function cleanupDatabase(): Promise<void> {
  await db.execute(`
    DELETE FROM elements;
    DELETE FROM projects;
    DELETE FROM users;
  `);
}

afterEach(async () => {
  await cleanupDatabase();
});
```

### 8.2 ファイルクリーンアップ
```typescript
// src/test/cleanup/files.ts
import { rm } from 'fs/promises';

async function cleanupTestFiles(): Promise<void> {
  await rm('./test-output', { recursive: true, force: true });
}

afterAll(async () => {
  await cleanupTestFiles();
});
``` 