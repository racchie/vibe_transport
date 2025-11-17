# TODO（最新版）

更新日時: 2025-11-17

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
- [x] Hydration不一致の自動スキャンと修正【完了】
  - ✅ `toLocaleString()`を`formatCurrency()`に置き換え（HistoryList, TravelExpenseForm）
  - ✅ ExportPanelの初期月選択をuseEffect内で設定
  - ✅ ESLintルール追加（Math.random, new Date, Date.now, toLocaleString警告）
  - ✅ Hydration一貫性テスト追加（formatting.test.ts, hydration.test.tsx）
  - ✅ 新規ユーティリティ`src/lib/formatting.ts`作成
- [x] CI / リリース自動化【完了】
  - ✅ GitHub Actionsワークフロー `.github/workflows/release.yml` 作成
  - ✅ タグプッシュ時に自動でGitHub Release作成
  - ✅ CHANGELOGからリリースノート自動抽出
  - ✅ リリース前のテスト・ビルド検証

## 未実装 / 推奨タスク（優先度：高）

- [x] 位置情報を使用した現在地の駅・バス停の自動検出【Stage 1 完了（駅のみ）】
  - **Stage 1（MVP・今回実装）**: 駅の候補取得のみ
    - Geolocation API で現在地取得
    - HeartRails Express API で最寄り駅候補を提示（上位5件）
    - UI: フォームに「現在地から入力」ボタン、候補選択で駅名・路線名反映
    - プライバシー配慮（位置情報保存しない・オプトイン設計）
    - **運賃は手動入力のまま**（HeartRails は駅情報のみ提供）
    - 実装コスト: 低（1日以内）、完全無料
  - **懸念事項（調査完了）**:
    - ❌ HeartRails Express API は運賃・経路検索機能なし
    - ✅ 駅間運賃の自動取得には有料API必須（駅すぱあと/NAVITIME/ジョルダン）
    - ✅ 複数路線またぎも有料API必須
    - **結論**: MVPでは駅名候補のみ提供。運賃は次期リリースで有料API契約後に実装
  - **Stage 2（次期リリース）**: 運賃自動取得
    - 有料API導入（駅すぱあと Web サービス / NAVITIME API 推奨）
    - 出発駅・到着駅から運賃を自動計算・反映
    - 複数経路候補の表示（最安・最速）
    - 実装コスト: 中〜高（2〜4日）、API利用料（月額数千円〜）
  - **Stage 3（次期リリース）**: バス停対応
    - API選定後に実装（Geoapify / OSM / Google Places など）
    - MVPには含めず、機能追加として段階的導入
- [x] アクセシビリティ強化（スクリーンリーダー対応）【部分完了】
  - ✅ `aria-label` をフォーム要素とアクションボタンに追加
  - ✅ ACCESSIBILITY.md ドキュメント作成
  - ⏸️ フォームバリデーションエラーの `aria-describedby` （次回リリース）
  - ⏸️ 動的コンテンツの `aria-live` 通知（次回リリース）
  - ⏸️ スクリーンリーダーテスト（NVDA/JAWS/VoiceOver）
- [x] ダークモード自動検出
  - ✅ システム設定（`prefers-color-scheme: dark`）の自動検出
  - ✅ ユーザー設定の localStorage 保存
  - ✅ `useTheme` カスタムフック作成（自動検出・手動切替・永続化）
  - ✅ テーマ切り替えボタンコンポーネント（light/dark/system の3モード）

## 未実装 / 推奨タスク（優先度：中）

- [x] 編集の入力バリデーション強化・自動補完
  - ✅ 駅名/バス停の補完（HeartRails API を拡張利用）
  - ✅ 厳密なバリデーション（駅名形式、運賃範囲チェック）
  - ✅ リアルタイム入力サジェスト（デバウンス + セッションキャッシュ）
- [x] レスポンシブ UI 最適化（モバイル完全対応）
  - ✅ モバイルファーストデザイン: ページ余白・フォントサイズ最適化
  - ✅ タブナビゲーション: 横スクロール対応 + グラデーションインジケーター
  - ✅ フォーム: 2カラムグリッドレイアウト（タブレット以上）
  - ✅ 候補リスト: モバイルで画面下部に固定表示
  - ✅ 履歴リスト: アイコンボタン + カード型レイアウト
  - ✅ タッチターゲット: 全ボタンに最小44px×44px適用
  - ✅ タッチ操作最適化: アクティブ状態フィードバック
- [x] テスト追加（ユニット/統合）
  - Playwright / Cypress でのエンドツーエンドテスト
  - フォーム入力フロー、タブ切替、データ永続化のテスト

## 未実装 / 推奨タスク（優先度：低）

- [ ] データベース連携（クラウド DB 選定・実装）
  - Firebase, Supabase, MongoDB Atlas 等の検討
  - PC・スマホ双方でのデータ同期・共有機能
- [ ] リリースノート作成（GitHub Release）

---

## 削除されたタスク

- ~~インポート機能~~ — 既存データの取り込みは想定外のため、削除。エクスポート機能は保持。
- ~~削除の「元に戻す」機能~~ — 現時点では不要と判断。`confirm()` ダイアログで十分。

---

備考: キーボードナビゲーション実装完了により、WCAG 2.1 AA コンプライアンス達成。次のステップは「スクリーンリーダー対応」「ダークモード自動検出」などのアクセシビリティ強化が推奨されます。