# Logseq プラグイン: Logging Search 🔎

- このプラグインは、クエリやページ埋め込みを使用して検索結果を表示します。
  - Logseq コアの検索機能ではブロックを表示できません。クエリ機能を使用してこれを克服します。

> [!WARNING]
このプラグインは Logseq db バージョンでは動作しません。

<div align="right">

[English](https://github.com/YU000jp/logseq-plugin-logging-search/)/[日本語](https://github.com/YU000jp/logseq-plugin-logging-search/blob/main/readme.ja.md) [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-logging-search)](https://github.com/YU000jp/logseq-plugin-logging-search/releases)[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-logging-search/total.svg)](https://github.com/YU000jp/logseq-plugin-logging-search/releases)<!-- Published 2023 --><a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
</div>

## 概要

- Logseq の左メニューに検索ボックスが配置されます。そこにテキストを入力して検索します。
- 一時的な検索結果ページが生成され、埋め込みとクエリが配置されます。

1. 左メニューからキーワードを送信
   - Enter キーを押して送信します。
   - サイドバーで開くには、入力フィールドの横にあるトグルをオンにします。
   - コンテンツモードの選択
     1. キーワードを含むすべてのブロック (全文検索)
     1. 関連ページを検索 (リスト)
     1. 関連ページの内容 (embed)
     1. 関連ページにリンクされたすべてのブロック
   > ![image](https://github.com/user-attachments/assets/ac903fd7-5cd3-4b0a-97fb-df3a43fc0967)

2. 右サイドバーまたはメインページでの検索結果
   - このプラグインは、ユーザーに代わってクエリを含むブロックを生成します。ユーザーが手順を追うよりも速くなります。
   - クエリは、ブロックごとのビューまたはジャーナルの時系列ログとして有効です。
   > ![image](https://github.com/user-attachments/assets/ff2210a6-967f-449f-8f51-d90f3938daa9)

---

## はじめに

### Logseq マーケットプレイスからインストール

- 右上のツールバーの [`---`] を押して [`プラグイン`] を開きます。マーケットプレイスを選択します。検索フィールドに `log` と入力し、検索結果から選択してインストールします。

---

## ショーケース / 質問 / アイデア / ヘルプ

> このようなことを尋ねたり見つけたりするには、[Discussions](https://github.com/YU000jp/logseq-plugin-logging-search/discussions) タブに移動してください。
1. 現在のところ、キーワードに含まれる大文字小文字とスペースは区別されます。
1. 埋め込みモードでは、カードタイルスタイルで表示できます。（サイドバーを除く）
   - 通常の埋め込みと同様に、その場で編集できます。表示エリアが小さすぎる場合は、サイドバーで開くかズームインします。
   > ![image](https://github.com/user-attachments/assets/671fd65c-ed02-4b15-8bbc-c8fa1757b84b)
1. ページ検索 (リンク)
   - キーワードをタイトルに含むページ を一覧表示するシンプルな機能
   > ![image](https://github.com/user-attachments/assets/b404bb28-6db7-4aa5-974d-5329663103a5)
1. このプラグインがオンになっていると、「Logging-Search-Plugin」ページが生成されます。削除しても復元されます。
1. このプラグインにはまだ改善の余地があります。問題が発生したり、改善のアイデアがあればお知らせください。
1. このプラグインは Logseq の DOM（Document Object Model）構造に依存しています。Logseq のバージョンアップデートにより DOM 構造が変更された場合、スタイルが適用されないことがあります。CSS を調整して対応します。何か気づいたことがあれば、問題を提起してください。

## 先行技術 & クレジット

アイコン > [icooon-mono.com](https://icooon-mono.com/11095-%e6%9e%a0%e3%81%a4%e3%81%8d%e3%81%ae%e7%be%bd%e6%a0%b9%e3%83%9a%e3%83%b3%e3%81%ae%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3%e7%b4%a0%e6%9d%90/)

著者 > [@YU000jp](https://github.com/YU000jp)
