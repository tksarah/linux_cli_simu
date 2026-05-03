# GitHub Pages 公開手順

このフォルダは静的サイトなので、そのまま GitHub Pages に載せられます。

## すでに入っているもの

- `index.html`, `app.js`, `styles.css` は相対パス参照なので、そのまま Pages で動きます
- GitHub Pages 用の内容はこのリポジトリの `master` ブランチに入っています

## やること

1. GitHub で新しいリポジトリを作成する
2. このフォルダをそのリポジトリへ push する
3. リポジトリの `Settings > Pages` を開く
4. `Build and deployment` の `Source` を `Deploy from a branch` にする
5. Branch を `master`、Folder を `/ (root)` にして保存する
6. しばらく待つと公開 URL が有効になる

## 使い方の目安

- ローカル確認: `index.html` をブラウザで開く
- 公開確認: Actions の完了後に表示される Pages URL を開く
