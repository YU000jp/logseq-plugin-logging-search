import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'

export const styleList = [
    "Tile",
    "Gallery",
    "Wide",
    "Expansion",
]

export const modeList = () => [
    {
        value: "Full text search",
        translate: t("Full text search"),
        description: t("A query that displays the content of pages that match a word.")
    },
    {
        value: "Page search (page-embed)",
        translate: t("Page search (page-embed)"),
        description: t("Displays the content of each related page with embed.")
    },
    {
        value: "Page search (list only)",
        translate: t("Page search (list only)"),
        description: t("Displays a list of related pages.")
    },
    {
        value: "Related Pages References",
        translate: t("Related Pages References"),
        description: t("A query to search for related pages.") + " " + t("(Useful for logging.)")
    },
    {
        value: "Recent history",
        translate: t("Recent history"),
        description: t("Recent history in embed style view")
    },
    {
        value: "Favorites",
        translate: t("Favorites"),
        description: t("Favorites in embed style view")
    },
]

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (currentGraphName: string): SettingSchemaDesc[] => [
    // { // 使い方のヘルプ
    //     key: "help",
    //     type: "heading",
    //     // 使い方のヘルプ
    //     title: t("How to use"),
    //  description: `

    //     `,
    //     default: null,
    // },
    {
        key: currentGraphName + keySettingsViewMode,
        // type: "enum",
        type: "heading",
        default: "Full text search",
        // コンテンツのモード選択
        title: t("Content mode selection"),
        // ページのコンテンツを表示するモードを選択します。
        // full text search: 単語にマッチするページのコンテンツを表示するクエリー。
        // Page search (page-embed): 各関連ページコンテンツをembedで表示します。
        // Page search (list only): 関連ページのリストを表示します。(必ずサイドバーで開かれる)
        // related Pages References: 関連ページのリファレンスを表示する単一のクエリー。(ログとして役立つ)
        description: `

        ${t("Select the mode to display the content of the page.")}
        ${t("Full text search")}: ${t("A query that displays the content of pages that match a word.")}
        ${t("Page search (page-embed)")}: ${t("Displays the content of each related page with embed.")}
        ${t("Page search (list only)")}: ${t("Displays a list of related pages.")}
        ${t("Related Pages References")}: ${t("A query to search for related pages.")}
        `,
        // enumChoices: modeList().map((m) => m.value),
    },
    // Embed の場合のみ、Unlinked References を表示するかどうか
    // {
    //     key: currentGraphName + "embedUnlinkedReferences",
    //     type: "boolean",
    //     default: true,
    //     title: t("Display Unlinked References for Embed mode"),
    //     // Embed モードの場合、Unlinked References を表示します。
    //     description: t("Enable / Disable"),
    // },
    { // Embed の場合のみ、ページコンテンツが存在しないものを除外する
        key: currentGraphName + "embedExcludeNoContent",
        type: "boolean",
        default: true,
        title: t("Exclude pages with no content for Embed mode"),
        // Embed モードの場合、ページコンテンツが存在しないものを除外します。
        description: t("Enable / Disable"),
    },
    { // Embed の場合のみ、ページコンテンツの行数が少ないものを除外する
        key: currentGraphName + "embedExcludeFewLines",
        type: "enum",
        default: "1",
        title: t("Exclude pages with few blocks of content for Embed mode"),
        // Embed モードの場合、ページコンテンツの行数が少ないものを除外します。
        enumChoices: ["0", "1", "2", "3", "5"],
        description: t("The number of blocks to exclude."),

    },
    {
        key: currentGraphName + "count",
        // 表示するembedの数
        title: t("Max number of embed to display"),
        type: "enum",
        enumChoices: [
            "10", "20", "30", "40", "60", "80", "100",
        ],
        default: "30",
        // このプラグインで表示するembedの数です。表示パフォーマンスに影響します。
        // この設定に関わらず、Lined Referencesモードの場合、最高8に限定されます。
        description: `
        ${t("The number of embeds to display.")} ${t("It affects the display performance.")}
        ${t("In Linked References mode, it is limited to a maximum of 8 regardless of this setting.")}
        `,
    },
]

export const keySettingsPageStyle = "-pageStyle"
export const keySettingsViewMode = "-modeSelect"
export const keySettingsSearchFormDetails = "-searchFormDetails"
