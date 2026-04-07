# デザイン修正からウェブサイト反映までのワークフロー

このドキュメントでは、Pencilでデザインを修正してから、実際のウェブサイトに反映するまでの手順を説明します。

## 前提条件

- Pencilアプリがインストールされている
- Node.js（v22.12.0以上）がインストールされている
- Gitがインストールされている
- GitHubリポジトリへのpush権限がある

## ワークフロー全体像

```
Pencilでデザイン修正
    ↓
Astroコードに反映
    ↓
ローカルで確認
    ↓
Gitにコミット＆プッシュ
    ↓
GitHub Actionsが自動デプロイ
    ↓
本番サイトに反映
```

---

## ステップ1: Pencilでデザイン修正

### 1.1 Pencilファイルを開く

```bash
# Pencilアプリを起動
# ファイル → 開く → design/works.pen を選択
```

または、Finderから `design/works.pen` をダブルクリック

### 1.2 デザインを修正

- レイアウト、色、フォント、サイズなどを調整
- 保存（⌘+S）

### 1.3 スクリーンショットを取得（オプション）

修正内容を確認するため、Pencilでスクリーンショットを撮っておくと便利です。

---

## ステップ2: Astroコードに反映

### 2.1 Pencilのデザイン情報を確認

Kiroを使ってPencilファイルの内容を確認します：

```
Kiroに以下のように依頼：
「design/works.penの内容を確認して、src/pages/works/index.astroに反映してください」
```

### 2.2 手動で反映する場合

Pencilのデザインを見ながら、以下のファイルを編集：

- `src/pages/works/index.astro`

主な編集ポイント：
- `<style>` タグ内のCSS
- HTMLの構造
- フィルターボタンの配置

---

## ステップ3: ローカルで確認

### 3.1 開発サーバーを起動

```bash
cd scenoichiro-site
npm run dev
```

### 3.2 ブラウザで確認

```
http://localhost:4321/works
```

デザインが意図通りに反映されているか確認します。

### 3.3 修正が必要な場合

- `src/pages/works/index.astro` を再編集
- ブラウザをリロード（開発サーバーは自動リロード対応）

---

## ステップ4: Gitにコミット＆プッシュ

### 4.1 変更内容を確認

```bash
cd scenoichiro-site
git status
```

### 4.2 変更をステージング

```bash
git add src/pages/works/index.astro
```

複数ファイルを変更した場合：

```bash
git add -A
```

### 4.3 コミット

```bash
git commit -m "fix: works page design update"
```

コミットメッセージの例：
- `fix: works page filter layout`
- `style: update card design`
- `feat: add new filter options`

### 4.4 プッシュ

```bash
git push origin main
```

---

## ステップ5: 自動デプロイの確認

### 5.1 GitHub Actionsの確認

1. GitHubリポジトリにアクセス
2. 「Actions」タブをクリック
3. 最新のワークフロー実行を確認

### 5.2 デプロイ完了を待つ

通常、3〜5分程度でデプロイが完了します。

ワークフローの流れ：
1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Build Astro site
5. ✅ Deploy to GitHub Pages

### 5.3 本番サイトで確認

```
https://www.scenoichiro.com/works
```

ブラウザのキャッシュをクリアしてから確認：
- Chrome/Edge: `⌘+Shift+R`（Mac）/ `Ctrl+Shift+R`（Windows）
- Safari: `⌘+Option+R`

---

## トラブルシューティング

### デザインが反映されない

**原因1: ブラウザキャッシュ**
- 解決策: スーパーリロード（`⌘+Shift+R`）

**原因2: GitHub Actionsが失敗**
- 解決策: GitHubのActionsタブでエラーログを確認

**原因3: ビルドエラー**
- 解決策: ローカルで `npm run build` を実行してエラーを確認

### Gitのpushが失敗する

**原因1: 認証エラー**
- 解決策: GitHubの認証情報を確認

**原因2: コンフリクト**
```bash
git pull origin main
# コンフリクトを解決
git push origin main
```

### ローカルの開発サーバーが起動しない

**原因: 依存関係の問題**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## よく使うコマンド一覧

```bash
# 開発サーバー起動
npm run dev

# ビルド（本番用）
npm run build

# ビルド結果をプレビュー
npm run preview

# Git状態確認
git status

# 変更を確認
git diff

# コミット履歴
git log --oneline

# 最新のリモート変更を取得
git pull origin main
```

---

## 参考リンク

- [Astro公式ドキュメント](https://docs.astro.build/)
- [GitHub Actions](https://github.com/scenoichiro/scenoichiro-site/actions)
- [本番サイト](https://www.scenoichiro.com/)

---

## 更新履歴

- 2026-04-07: 初版作成
