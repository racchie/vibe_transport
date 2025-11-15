# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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