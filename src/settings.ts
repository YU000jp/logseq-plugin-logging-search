import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'

export const styleList = [
    "Tile",
    "Gallery",
    "Wide",
    "Expansion",
]

export const modeListArray = [ // 順番確定
    "All blocks containing the keyword",
    "Find related pages",
    "Contents of relevant pages",
    "All blocks linked to related pages",
]

export const modeList = () => modeListArray.map((m) => ({ value: m, label: t(m) }))

/* user setting */
// https://logseq.github.io/plugins/types/SettingSchemaDesc.html
export const settingsTemplate = (currentGraphName: string): SettingSchemaDesc[] => [
    {
        key: currentGraphName + keySettingsViewMode,
        // type: "enum",
        type: "heading",
        default: modeListArray[0],
        // コンテンツのモード選択
        title: t("Content mode selection"),
        description: modeList().map((m) => m.label).join("\n"),
        // enumChoices: modeList().map((m) => m.value),
    },
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
        `,
    },
    {
        key: currentGraphName + "searchWordDataList",
        type: "string",
        inputAs: "textarea",
        default: "",
        // 検索ワードの入力候補エントリーの修正用
        title: t("List of search words for input correction"),
        // 検索を実行すると検索ワードが追加され、最大30件保持されます。改行で区切られています。
        description: t("When you execute a search, the search word is added here and up to 30 are retained. It is separated by line breaks."),
    },
]

export const keySettingsPageStyle = "-pageStyle"
export const keySettingsViewMode = "-modeSelect"
export const keySettingsSearchFormDetails = "-searchFormDetails"
