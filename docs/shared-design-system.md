# PO.TORO 共通デザイン基盤

## 公開方式

GitHub Pagesが配信するHTMLは従来どおりリポジトリ直下に置きます。Node.jsによる実行時ビルドは行わず、公開URLとGitHub Pages設定は変更しません。

ヘッダーとフッターの原本は次の2ファイルです。

- `_includes/site-header.html`
- `_includes/site-footer.html`

編集後は次のコマンドで13個の公開HTMLへ同期します。

```powershell
node scripts/sync-shared-layout.js
node scripts/sync-shared-layout.js --check
node scripts/validate-site.js
```

生成済みHTMLもGitへコミットするため、GitHub Pages側にNode.jsや追加設定は不要です。

## ページ追加時

1. `scripts/sync-shared-layout.js` の `pages` に公開HTML、現在ページキー、ルート相対パスを追加する。
2. ページ固有CSSより後に `assets/css/design-system.css` を読み込む。
3. `body` に `theme-v2` を付ける。
4. `assets/js/core.js` と、ページ固有初期化または `assets/js/page-init.js` を読み込む。
5. 同期・サイト検証を実行する。

`recruit/index.html` はルート接頭辞に `../` を使います。`uniforms.html` は本文と専用CSSを維持し、共通ヘッダー、フッター、デザイントークンだけを利用します。

## 共通トークン

色、書体、余白、角丸、影、ボタン、カード、フォーカス、フェード演出は `assets/css/design-system.css` が管理します。トップページ固有の洋館セクションと配置は `assets/css/theme-v2.css` に残します。

## 画像方針

- 写真・POPは可能な限りWebPを先に指定する。
- ファーストビューだけ `fetchpriority="high"` を使う。
- 下層コンテンツ画像は `loading="lazy"` と `decoding="async"` を使う。
- CSS背景は遅延読込できないため、画面構成に不可欠な装飾だけに限定する。
- 大きなPNG/JPEGを追加した場合はWebP版も用意し、サイト検証を通す。

## JavaScript無効時

本文は標準状態で表示します。`core.js` がIntersectionObserverを準備できた要素だけ `reveal-ready` になり、フェード対象となります。JavaScriptが無効、未読込、または初期化に失敗した場合も本文は隠れません。
