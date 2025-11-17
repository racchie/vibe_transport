# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

# CHANGELOG

## [Unreleased] - 2025-11-17

### Added
- **アクセシビリティ強化（スクリーンリーダー対応）**
  - `aria-label` をアクションボタンに追加（HistoryList, FrequentRoutesList, ExportPanel）
  - 編集/削除/使用ボタンにコンテキスト情報を含むラベルを付与
  - エクスポートボタンに件数と形式情報を含むラベルを付与
  - `ACCESSIBILITY.md` ドキュメント作成（実装状況、今後の計画、テスト指針）

### Improved
- スクリーンリーダー使用時のユーザー体験向上
- WCAG 2.1 AA 準拠の維持と強化

---

## [0.0.5] - 2025-11-17

### Fixed
- **Hydration不一致の修正**
  - `toLocaleString()`を独自の`formatCurrency()`関数に置き換え、サーバー/クライアント間で一貫した通貨フォーマットを実現
  - `ExportPanel`の初期月選択を`useEffect`内で設定し、SSR/CSRの不一致を解消
  - 新規ユーティリティ`src/lib/formatting.ts`を作成（`formatCurrency`, `getClientOnlyValue`）
- **CIエラー修正**
  - テストファイルの`@typescript-eslint/no-explicit-any`エラーを修正
  - 安全な`Date.now()`/`new Date()`使用箇所に`eslint-disable-next-line`追加

### Added
- **ESLint hydrationルール**
  - `Math.random()`, `new Date()`, `Date.now()`, `toLocaleString()`の使用を警告する静的解析ルール追加
  - 将来のHydration不一致を予防
- **Hydration一貫性テスト**
  - `tests/formatting.test.ts`: フォーマット関数のユニットテスト（8テスト）
  - `tests/hydration.test.tsx`: HistoryListの複数レンダリング一貫性テスト（3テスト）
- **CI/リリース自動化**
  - GitHub Actionsワークフロー `.github/workflows/release.yml` 追加
  - タグプッシュ時にGitHub Releaseを自動作成
  - CHANGELOGからリリースノートを自動抽出
  - テストとビルドをリリース前に実行

### Changed
- テスト総数: 28 → 39（+11テスト）

---

## [0.0.4] - 2025-11-16

### Added
- Geolocation Stage 1 (station-only suggestions)
  - "📍 現在地" ボタンで最寄り駅候補を表示（HeartRails Express API）
  - 候補選択で駅名反映、交通手段を自動で「電車」に設定、会社名を補助入力
- Small UX improvements
  - 候補取得中の表示（検索中…）と「候補が見つかりませんでした」のメッセージ
  - 候補リストのキーボード操作（↑/↓/Enter/Esc）とハイライト
- Tests
  - フックのユニットテスト（geolocation成功/拒否）
  - フォーム統合テスト（候補選択で入力反映）

### Notes
- 運賃の自動計算・経路探索は次期リリース（有料API導入後）
- バス停は本バージョンでは未対応（手入力で対応）

## [0.0.3] - 2025-11-15

### Added
- Comprehensive keyboard navigation (WCAG 2.1 AA)
  - Arrow key navigation for tabs (Left/Right, Home/End)
  - Focus-visible styles and skip link to main content
  - Shortcuts: Escape to clear filters, Ctrl+Enter to submit form
  - ARIA roles and attributes for tablist and tabs
- Toast system refactor (stage 1+2)
  - Independent Toast component with animations and icons
  - Multiple toast support, close button, timeout, aria-live="polite"
- History UX improvements
  - Auto-move updated record to the top of the list
  - Responsive HistoryControls (mobile/tablet/desktop)
- Dark mode styling for all components
- Test coverage expanded (8 Toast tests, 7 HistoryList tests, others) – 25/25 passing

### Changed
- Updated TODO.md to reflect completed features and restored missing tasks (geolocation, validation, E2E tests)

### Build
- Verified build with Next.js 16 (Turbopack) and TypeScript strict mode

## [0.0.1] - 2025-10-26

### Added
- 基本的な交通費記録機能の実装
  - 日付、出発地、目的地、交通手段、運賃の記録
  - よく使う経路の保存と再利用機能
  - ローカルストレージを使用したデータ永続化
- プロジェクトの初期設定
  - Next.js 16.0.0 + TypeScript + Tailwind CSS のセットアップ
  - コンポーネント構造の確立（TravelExpenseForm, FrequentRoutesList）
  - クライアントサイドレンダリングの最適化（Hydrationエラーの修正）
- リポジトリの初期設定
  - GitHubリポジトリの作成とプッシュ
  - 基本的なドキュメント（README.md, LICENSE）の追加
  - GitHub Actionsの設定
  - CHANGELOG.mdの作成

## [0.0.2] - 2025-11-01

### Added
- タブ切替UIを導入（「新規記録」「よく使う経路」「記録履歴」「データのエクスポート」）
- データのエクスポートを専用タブへ移動
- 記録保存・よく使う経路の利用時にトースト通知を表示（登録完了メッセージ）

### Fixed
- ダークモードで文字や境界線が見えなくなる問題に対する一時的なスタイル調整