# アクセシビリティ実装ガイド

## 現在の実装状況（WCAG 2.1 AA準拠）

### ✅ 実装済み

#### キーボードナビゲーション
- タブの ←/→ キーナビゲーション（Home/End キーで先頭/最後へ移動）
- フォーカス管理 (`:focus-visible` スタイル)
- キーボードショートカット（Escape でフィルタクリア、Ctrl+Enter で送信）
- スキップリンク実装（`sr-only` + `sr-only-focusable`）
- ARIA 属性（`role='tablist'`, `role='tab'`, `aria-selected`, `aria-controls`）

#### ARIA属性
- Toast通知: `aria-live="polite"`, `aria-label="Notifications"`
- 候補リスト: `role="listbox"`, `role="option"`, `aria-selected`
- ボタン: 一部に `aria-label` 実装

#### セマンティックHTML
- 適切な `<button>` 要素の使用
- フォームの `<label>` と `<input>` の関連付け（`htmlFor`/`id`）

---

## 今後の改善計画

### 優先度：高

#### 1. フォームバリデーションの強化
**目的**: エラーメッセージをスクリーンリーダーで適切に通知

**実装内容**:
```tsx
// エラーメッセージの関連付け
<input
  aria-invalid={!!errors.fare}
  aria-describedby={errors.fare ? "fare-error" : undefined}
/>
{errors.fare && (
  <p id="fare-error" role="alert" className="text-sm text-red-600">
    {errors.fare}
  </p>
)}
```

**対象ファイル**:
- `src/components/TravelExpenseForm.tsx`
- `src/components/FrequentRoutesList.tsx`

#### 2. ボタンとアクションの明確化
**目的**: アクション内容をスクリーンリーダーで理解可能に

**実装内容**:
```tsx
// Before
<button onClick={() => onEdit(r)}>編集</button>

// After
<button
  onClick={() => onEdit(r)}
  aria-label={`${r.fromStation}から${r.toStation}への記録を編集`}
>
  編集
</button>
```

**対象ファイル**:
- `src/components/HistoryList.tsx`
- `src/components/FrequentRoutesList.tsx`

---

### 優先度：中

#### 3. 動的コンテンツの通知
**目的**: 検索結果やフィルタ適用後の変更を通知

**実装内容**:
```tsx
<div aria-live="polite" aria-atomic="true" className="sr-only">
  {filteredCount}件の記録が見つかりました
</div>
```

**対象ファイル**:
- `src/components/HistoryControls.tsx`
- `src/components/HistoryList.tsx`

#### 4. ステータスフィードバック
**目的**: 位置情報取得やエクスポートの進行状況を通知

**実装内容**:
```tsx
<div aria-live="polite" className="sr-only">
  {status === 'loading' && '最寄り駅を検索しています'}
  {status === 'success' && `${candidates.length}件の候補が見つかりました`}
</div>
```

**対象ファイル**:
- `src/components/TravelExpenseForm.tsx`
- `src/components/ExportPanel.tsx`

---

### 優先度：低

#### 5. セマンティックHTMLの改善
**実装内容**:
- 見出し階層の整理（`<h2>`, `<h3>`）
- リスト構造の適用（`<ul role="list">`）
- フォームの `aria-label`

#### 6. 候補リストの強化
**実装内容**:
```tsx
<div
  role="listbox"
  aria-activedescendant={`option-${highlightedIndex}`}
>
  {candidates.map((c, idx) => (
    <div id={`option-${idx}`} role="option">
  ))}
</div>
```

---

## テスト計画

### 自動テスト
```bash
# axe-coreのインストール
npm install --save-dev axe-core @axe-core/react

# テストに組み込み
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);
```

### 手動テスト
1. **NVDA（Windows）**
   - フォーム入力フロー
   - タブナビゲーション
   - エラー通知

2. **VoiceOver（macOS）**
   - 同上

3. **キーボードのみ操作**
   - 全機能が操作可能か確認

---

## 参考リソース

- [WCAG 2.1 ガイドライン](https://www.w3.org/TR/WCAG21/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [axe DevTools](https://www.deque.com/axe/devtools/)

---

## 実装タイムライン

| フェーズ | 内容 | 工数 | 優先度 |
|---------|------|------|--------|
| Phase 1 | フォームバリデーション + ボタンaria-label | 2-3h | 高 |
| Phase 2 | 動的コンテンツ通知 + ステータス | 2h | 中 |
| Phase 3 | セマンティックHTML + 候補リスト強化 | 1-2h | 低 |
| Phase 4 | テストとドキュメント | 1h | - |

**合計**: 約6-8時間
