import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'

export const styleList = [
    "Tile",
    "Gallery",
    "Wide",
    "Expansion",
]

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (currentGraphName: string, draftTitleWord: string): SettingSchemaDesc[] => [
    { // 使い方のヘルプ
        key: "help",
        type: "heading",
        // 使い方のヘルプ
        title: t("How to use"),
        // 下書きページ(ドラフト)をembedで一括で扱うためのプラグインです。
        // コンテンツが完成したら、ページ名を変更してください。
        // ドラフトにテンプレートが適用されます。
        // リストページを開いたときに、各ドラフトが存在しない場合にテンプレートが適用されます。
        // テンプレートが適用されていないドラフトに、テンプレートを適用するには、そのページを開いて削除し、リストページを開いてください。
        // ページタイトルにカーソルを合わせると、Logseqコアのツールチップ機能が稼働します。(それが設定でオンになっている場合)
        // ページタイトルをクリックすると、そのページに移動します。移動してから、ページタイトルを右クリックすると、コンテキストメニューがでてページタイトルの変更や削除がおこなえます。
        description: `

        ${t("This plugin is for handling draft pages in bulk with embeds.")}
        ${t("When the content is complete, change the page name.")}
        ${t("The template is applied to draft pages.")}
        ${t("When you open the list page, if each draft does not exist, the template is applied.")}
        ${t("To apply the template to a draft that is not yet applied, open the page, delete it, and open the list page.")}
        ${t("When you hover over the page title, the Logseq core tooltip feature will be activated. (If it is set to on.)")}
        ${t("Click the page title to go to that page. After moving, right-click the page title to display the context menu and change or delete the page title.")}
        `,
        default: null,
    },
    { // メインページのスタイル
        key: currentGraphName + keySettingsPageStyle,
        title: t("Page style"),
        type: "enum",
        enumChoices: styleList,
        default: "Gallery",
        // Tile: コンテンツ最小限のスタイル
        // Gallery: 上下左右に配置するスタイル
        // Wide: 画面を横に広く使うスタイル
        // Expansion: 下側に展開するスタイル
        description: `
        
        ${t("The Tile style displays content in a minimalist manner.")}
        ${t("The Gallery style arranges the blocks up, down, left, and right.")}
        ${t("The Wide style uses the screen horizontally.")}
        ${t("The Expansion style is a style that expands on the underside.")}
        `,
    },
    {
        key: currentGraphName + "count",
        // 表示するembedの数
        title: t("Number of embed to display"),
        type: "enum",
        enumChoices: [
            "1", "2", "3", "4", "5", "6", "7", "9", "11", "13", "15", "17", "19",
        ],
        default: "7",
        // この数を減らす前に、必要なドラフトはタイトルを変更してください。
        description: t("The number of embeds to display. Before reducing this number, change the title of the drafts you need."),
    },
    {
        key: currentGraphName + "addLeftMenu",
        type: "boolean",
        default: true,
        // 左メニューバーにボタンを追加して、このプラグインにアクセスできるようにします。
        title: t("Add a button to the left menu bar to access this plugin"),
        // ツールバーからもアクセスできます。
        description: t("Or from the toolbar"),
    },
    {
        key: currentGraphName + "removeDraftFromRecent",
        type: "boolean",
        default: true,
        // 左メニューの履歴リストから各ドラフトを取り除く
        title: t("Remove each draft from the history list in the left menu"),
        // 有効 / 無効
        description: t("Enable / Disable"),
    },
    {
        key: currentGraphName + "draftTitleWord",
        // ドラフトタイトルの単語
        title: t("Draft title word"),
        type: "string",
        default: (draftTitleWord + "--") || "Draft--",
        // 下書きページのタイトルに表示される単語です。この単語の後に番号が追加されます。例えば、単語が「Draft--」の場合、下書きページのタイトルは「Draft--1」「Draft--2」となります。
        description: t("The word that appears in the title of the draft page. The number is added after this word. For example, if the word is 'Draft--', the title of the draft page is 'Draft--1', 'Draft--2', and so on."),
    },
]

export const keySettingsPageStyle = "pageStyle"
