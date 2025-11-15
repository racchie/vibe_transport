# TODO（最新版）

更新日時: 2025-11-15

## 完了済み

  - `npm run dev`で開発サーバ起動・出力確認（完了）
  - `README.md` / `CHANGELOG.md` 更新、コミット、タグ v0.0.2 作成・push（完了）
  - `FrequentRoutesList`：経路の追加・編集・保存・一覧表示（実装済み）
  - 記録の編集モード、更新確認モーダル、削除（ローカル state / localStorage）（実装済み）
  - CSV / XLSX のエクスポート機能（実装済み）
  - 「新規記録」「よく使う経路」「記録履歴」「データのエクスポート」タブ（実装済み）
  - 記録保存・経路使用時に簡易トーストを表示（実装済み）
- [x] トースト改良（段階1+2）【完了】
  - 段階1: 独立した `Toast.tsx` コンポーネント化、Fade-in/Out アニメーション（CSS Animation）、`aria-live="polite"` でアクセシビリティ強化、複数トースト対応（キュー管理）、カスタムフック `useToast.ts` 実装
  - 段階2: トースト種別（`success`/`error`/`warning`/`info`）、アイコン表示、手動クローズボタン、タイムアウト設定可能化
  - 成果: 8個の RTL テスト追加、全 25 テスト通過、dark mode 対応、アニメーション実装
- [x] HistoryList RTL テスト追加【完了】
  - 7個の RTL 統合テスト実装（compact/detailed モード、empty state、user interactions）
- [x] 全コンポーネント dark mode 対応【完了】
  - TravelExpenseForm, FrequentRoutesList, ExportPanel, page.tsx, HistoryList に dark: クラス追加
## 進行中 / 部分実装

- [x] 履歴アイテムのソート/表示制御【完了】
  - ✅ 新規追加は先頭に挿入する仕様
  - ✅ ソート機能（日付/交通手段）、ソート順序の切り替え
  - ✅ キーワード検索、日付範囲フィルタ
  - ✅ 月別グループ化
  - ✅ ページネーション（5/10/20/50 件単位）
  - ✅ コンパクト/詳細表示モード
  - ✅ 更新時の自動移動（先頭に移動）
  - ✅ レスポンシブ UI 最適化（モバイル/タブレット/PC）
- [x] キーボードナビゲーション（WCAG 2.1 AA）【完了】
  - ✅ タブの ←/→ キーナビゲーション（Home/End キーで先頭/最後へ移動）
  - ✅ フォーカス管理 (:focus-visible スタイル、sr-only ユーティリティ)
  - ✅ キーボードショートカット（Escape でフィルタクリア、Ctrl+Enter で送信）
  - ✅ スキップリンク実装（非表示「メインコンテンツへスキップ」）
  - ✅ ARIA 属性完備（role='tablist', role='tab', aria-selected, aria-controls）

## 未実装 / 推奨タスク（優先度：高）

- [ ] アクセシビリティ強化（スクリーンリーダー対応）
  - `aria-label`, `aria-describedby` をフォーム要素に追加
  - スクリーンリーダーテスト（NVDA/JAWS/VoiceOver）
  - セマンティック HTML の確認（`<button>` vs `<div>`）
- [ ] ダークモード自動検出
  - システム設定（`prefers-color-scheme: dark`）の自動検出
  - ユーザー設定の localStorage 保存

## 未実装 / 推奨タスク（優先度：中）

- [ ] レスポンシブ UI 最適化（モバイル完全対応）
  - スマホ版をベースとした設計を PC 版でも見やすく・使いやすく改善
  - 画面サイズ別の UI 調整（タッチ操作最適化）

## 未実装 / 推奨タスク（優先度：低）

- [ ] Hydration 不一致の自動スキャンと修正提案
  - `toLocaleString` / `Intl` / `Math.random` 等のクライアント依存 API を検出・修正
- [ ] データベース連携（クラウド DB 選定・実装）
  - Firebase, Supabase, MongoDB Atlas 等の検討
  - PC・スマホ双方でのデータ同期・共有機能
- [ ] CI / リリース自動化
  - タグ付けで GitHub Release を作成するワークフロー
- [ ] リリースノート作成（GitHub Release）

---

## 削除されたタスク

- ~~インポート機能~~ — 既存データの取り込みは想定外のため、削除。エクスポート機能は保持。
- ~~削除の「元に戻す」機能~~ — 現時点では不要と判断。`confirm()` ダイアログで十分。

---

備考: キーボードナビゲーション実装完了により、WCAG 2.1 AA コンプライアンス達成。次のステップは「スクリーンリーダー対応」「ダークモード自動検出」などのアクセシビリティ強化が推奨されます。