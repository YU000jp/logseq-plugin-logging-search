# Logseq Plugin: Logging Search 🔎

- This plugin displays search results using query or page embedding.
  - The search function in Logseq core cannot display blocks. Use the query feature to overcome this.

> [!WARNING]
This plugin does not work with Logseq db version.

<div align="right">

[English](https://github.com/YU000jp/logseq-plugin-logging-search/)/[日本語](https://github.com/YU000jp/logseq-plugin-logging-search/blob/main/readme.ja.md) [![latest release version](https://img.shields.io/github/v/release/YU000jp/logseq-plugin-logging-search)](https://github.com/YU000jp/logseq-plugin-logging-search/releases)[![Downloads](https://img.shields.io/github/downloads/YU000jp/logseq-plugin-logging-search/total.svg)](https://github.com/YU000jp/logseq-plugin-logging-search/releases)<!-- Published 2023 --><a href="https://www.buymeacoffee.com/yu000japan"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a pizza&emoji=🍕&slug=yu000japan&button_colour=FFDD00&font_colour=000000&font_family=Poppins&outline_colour=000000&coffee_colour=ffffff" /></a>
</div>

## Overview

- A search box will be placed in the left menu of Logseq. Enter text there to search.
- A temporary search results page is generated, where the embedding and query are placed.

1. Submit a keyword from the left menu
   - Press Enter to send.
   - To open in the sidebar, turn on the toggle next to the input field.
   - Content mode selection
     1. Full text search
     2. Page search (page-embed)
     3. Page search (list only)
     4. Related pages references
   > ![image](https://github.com/user-attachments/assets/ac903fd7-5cd3-4b0a-97fb-df3a43fc0967)

2. Search result in the right sidebar or as main page
   - This plugin generates the block with the query on behalf of the user. It will be quicker than a user can follow the procedure.
   - The query is valid either as a block-by-block view or as a time-series log in a journal.
   > ![image](https://github.com/user-attachments/assets/ff2210a6-967f-449f-8f51-d90f3938daa9)

---

## Getting Started

### Install from Logseq Marketplace

- Press [`---`] on the top right toolbar to open [`Plugins`]. Select marketplace. Type `log` in the search field, select it from the search results and install

---

## Showcase / Questions / Ideas / Help

> Go to the [Discussions](https://github.com/YU000jp/logseq-plugin-logging-search/discussions) tab to ask and find this kind of things.
1. 
1. Currently, search terms are matched case-sensitive and space-sensitive.
1. In embed mode, it can be displayed in card tile style. (Except in the sidebar)
   > ![image](https://github.com/user-attachments/assets/671fd65c-ed02-4b15-8bbc-c8fa1757b84b)
1. As with normal embed, it can be edited on the fly. If the display area is too small, open it in the sidebar or zoom in.
1. When this plugin is turned on, the “Logging-Search-Plugin” page is generated. This will be restored even if you delete it.
1. This plugin still has room for improvement. Please let me know if you encounter any issues or have any ideas for enhancement.
1. This plugin relies on Logseq's DOM (Document Object Model) structure. If the DOM structure changes due to a Logseq version update, styles may not be applied. We will adjust the CSS to deal with it. If you notice something, please raise an issue.

## Prior art & Credit

Icon > [icooon-mono.com](https://icooon-mono.com/11095-%e6%9e%a0%e3%81%a4%e3%81%8d%e3%81%ae%e7%be%bd%e6%a0%b9%e3%83%9a%e3%83%b3%e3%81%ae%e3%82%a2%e3%82%a4%e3%82%b3%e3%83%b3%e7%b4%a0%e6%9d%90/)

Author > [@YU000jp](https://github.com/YU000jp)
