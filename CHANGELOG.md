# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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