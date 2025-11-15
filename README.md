# Vibe Transport

Version: 0.0.3

交通費記録アプリケーション - 通勤や出張での交通費を簡単に記録・管理

## 機能

- 交通費の記録（日時・区間・種別・会社・運賃）
- よく使う経路の保存と再利用
- データのエクスポート（CSV / XLSX）
- ダークモード対応
- キーボードナビゲーション（WCAG 2.1 AA）
	- タブの←/→、Home/End、スキップリンク
	- Escapeでフィルタクリア、Ctrl+Enterで送信
- データのローカルストレージ保存

## 技術スタック

- Next.js 16.0.0
- React
- TypeScript
- Tailwind CSS

## 開発環境のセットアップ

必要条件:
- Node.js 20.9.0以上
- npm 10.1.0以上

インストール:
```bash
npm install
```

開発サーバーの起動:
```bash
npm run dev
```

ビルド:
```bash
npm run build
```

## ライセンス

MIT License - 詳細は [LICENSE](./LICENSE) ファイルを参照してください。
