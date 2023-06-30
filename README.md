# bvh to VRMA

このリポジトリは bvh ファイルを VRMAnimation ファイルに変換する web アプリケーションのリポジトリです。

# デモ

GitHub Pages でデモを公開しています。
https://vrm-c.github.io/bvh2vrma/

# 注意点

- VRMAnimation ファイル(vrma)の仕様はドラフト段階です。
- 変換結果を保証するものではありません。入力された bvh ファイルによっては失敗することがあります。
- ドラフトのため、書き出されたデータが将来的な仕様変更により使えなくなることがあります。

# 開発を行うには

ローカル環境で開発を行うにはこのリポジトリをクローンしてください。

```
git clone https://github.com/vrm-c/bvh2vrma
```

必要なパッケージをインストールの上、開発用の web サーバーの起動を行ってください。

```
yarn install && yarn dev
```

# VRMAnimation

VRMAnimation は現在仕様策定中の人間型モデルに対するアニメーションを記述するための glTF 拡張です。
詳しい仕様に関しては別途[仕様書](https://github.com/vrm-c/vrm-specification/blob/master/specification/VRMC_vrm_animation-1.0/README.ja.md)をお読みいただけますと幸いです。

# ライセンス

- [MIT ライセンス](./LICENSE.txt)
