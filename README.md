# Photo & GPX Map

> 最短 3 コマンドでローカル起動できるシンプルな React‑Leaflet アプリです。

---

## 📦 ディレクトリ構成

```
photo-gpx-map/
├─ public/             # 静的ファイル
│   ├─ photos/         # 画像 (person / *.jpg)
│   └─ routes/         # GPX ファイル
├─ src/                # React ソース
└─ data/photos.csv     # 画像メタ (path,datetime,lat,lng)
```

---

## 🔧 前提環境

| ツール     | 推奨バージョン | 確認コマンド          |
| ------- | ------- | --------------- |
| Node.js | 18 以上   | `node -v`       |
| npm     | 9 以上    | `npm -v`        |
| Git     | 2.30 以上 | `git --version` |

> Node / npm が入っていなければ [https://nodejs.org/ja](https://nodejs.org/ja) から **LTS** を、
> Git が無ければ [https://git-scm.com](https://git-scm.com) からインストールしてください。

---

## 🚀 クイックスタート

```bash
# 1. クローン
$ git clone git@github.com:<YOUR_NAME>/photo-gpx-map.git
$ cd photo-gpx-map

# 2. 依存パッケージ
$ npm install

# 3. 開発サーバ
$ npm run dev
```

実行後に表示される URL (既定: [http://localhost:5173](http://localhost:5173)) をブラウザで開けば完了です。
サーバ停止は **Ctrl + C**。

---

## 💡 よくあるトラブル

| 症状                       | 解決策                                                              |
| ------------------------ | ---------------------------------------------------------------- |
| `npm: command not found` | Node.js が未インストール / PATH 未設定。再インストール後に新しいターミナルを開く。                |
| `EADDRINUSE 5173`        | 別プロセスが使用中。`npm run dev -- --port 3000` のようにポートを変更。               |
| 画像が壊れて表示                 | HEIC や CMYK JPEG を含んでいる可能性。`file` コマンドで確認し、JPEG (sRGB) へ変換。      |
| 真っ白画面                    | `public/photos`・`public/routes`・`data/photos.csv` のパスが一致しているか確認。 |

---

## 🏗️ 本番ビルド

```bash
npm run build   # dist/ フォルダを生成
```

出来上がった `dist/` を静的ホスティング (GitHub Pages / Netlify など) へ配置してください。

---

## 🔑 SSH 設定（初回のみ）

```bash
# 鍵が無い場合
$ ssh-keygen -t ed25519 -C "you@example.com"
$ eval "$(ssh-agent -s)"
$ ssh-add ~/.ssh/id_ed25519

# 公開鍵をクリップボードへ (mac)
$ pbcopy < ~/.ssh/id_ed25519.pub
```

1. GitHub → *Settings → SSH and GPG keys* → **New SSH key**
2. ペーストして **Add SSH key**

---

## License

MIT © 2025 Yu Takase
