import '@logseq/libs' //https://plugins-doc.logseq.com/
import { AppGraphInfo, AppInfo, LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin.user'
import { setup as l10nSetup } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { addLeftMenuSearchForm } from './custom/form'
import { resetPage } from './custom/page'
import { BlockUuid, getUuidFromPageName } from './embed/query/advancedQuery'
import { AddMenuButton, handleRouteChange } from './handle'
import { clearEle } from './lib'
import cssMain from './main.css?inline'
import { keySettingsPageStyle, settingsTemplate, styleList } from './settings'
import af from "./translations/af.json"
import de from "./translations/de.json"
import es from "./translations/es.json"
import fr from "./translations/fr.json"
import id from "./translations/id.json"
import it from "./translations/it.json"
import ja from "./translations/ja.json"
import ko from "./translations/ko.json"
import nbNO from "./translations/nb-NO.json"
import nl from "./translations/nl.json"
import pl from "./translations/pl.json"
import ptBR from "./translations/pt-BR.json"
import ptPT from "./translations/pt-PT.json"
import ru from "./translations/ru.json"
import sk from "./translations/sk.json"
import tr from "./translations/tr.json"
import uk from "./translations/uk.json"
import zhCN from "./translations/zh-CN.json"
import zhHant from "./translations/zh-Hant.json"

export const mainPageTitle = "Logging-Search-Plugin" // メインページのタイトル
export const mainPageTitleLower = mainPageTitle.toLowerCase()
export const shortKey = "psp" // ショートキー
const keyCssMain = "main"
export const keyPageBarId = `${shortKey}--pagebar`
export const icon = "🔍"
export const keySearchInput = `${shortKey}--searchInput`
export const keyOnSidebarCheckbox = `${shortKey}--onSidebarCheckbox`
export const keyToggleButton = `${shortKey}--changeStyleToggle`
export const keyViewSelect = `${shortKey}--viewSelect`
export const keySettingsButton = `${shortKey}--pluginSettings`
export const keyRunButton = `${shortKey}--run`
export const keyCloseButton = `${shortKey}--close`
export const keyLeftMenuSearchForm = `${shortKey}--search-form`

let currentGraphName = "" // 現在のgraph名を保持する

let processingResetForm = false
let logseqVersion: string = "" //バージョンチェック用
let logseqVersionMd: boolean = false //バージョンチェック用
let logseqDbGraph: boolean = false
// export const getLogseqVersion = () => logseqVersion //バージョンチェック用
export const booleanLogseqVersionMd = () => logseqVersionMd //バージョンチェック用
export const booleanDbGraph = () => logseqDbGraph //バージョンチェック用

const getCurrentGraph = async (): Promise<string> => {
  const userGraph = await logseq.App.getCurrentGraph() as { name: AppGraphInfo["name"] } | null
  if (userGraph) {
    // console.log("currentGraph", userGraph.name)
    currentGraphName = userGraph.name + "/" // 現在のgraph名を保持
    return currentGraphName
  } else {
    currentGraphName = "" // demo graphの場合は空文字
    console.warn("getCurrentGraph failed or the demo graph")
    return ""
  }
}

export const checkGraphName = async (): Promise<string> => {
  if (currentGraphName === "")
    return await getCurrentGraph()

  else
    return currentGraphName
}

const loadByGraph = async () => {
  const currentGraphName = await getCurrentGraph()
  if (currentGraphName === "")
    return // demo graphの場合は実行しない
  else {
    logseq.useSettingsSchema(settingsTemplate(currentGraphName))
  }
}

/* main */
const main = async () => {

  // バージョンチェック
  logseqVersionMd = await checkLogseqVersion()
  // DBグラフチェック
  logseqDbGraph = await checkDbGraph()

  // l10nのセットアップ
  await l10nSetup({
    builtinTranslations: {//Full translations
      ja, af, de, es, fr, id, it, ko, "nb-NO": nbNO, nl, pl, "pt-BR": ptBR, "pt-PT": ptPT, ru, sk, tr, uk, "zh-CN": zhCN, "zh-Hant": zhHant
    }
  })

  /* user settings */

  // graph変更時の処理
  logseq.App.onCurrentGraphChanged(async () => {
    await loadByGraph()
  })

  // 初回読み込み
  await loadByGraph()

  // メインページが存在したら削除する
  if (await getUuidFromPageName(mainPageTitle, logseqVersionMd) as BlockUuid[] | null)
    resetPage(mainPageTitle)
  else
    await logseq.Editor.createPage(mainPageTitle, "", { redirect: false, createFirstBlock: true })

  setTimeout(() => {
    // 専用メニューボタンを追加
    AddMenuButton()
  }, 300)

  addLeftMenuSearchForm()

  let processingButton = false
  //クリックイベント
  logseq.provideModel({

    // トグルボタンが押されたら
    [keyToggleButton]: () => {
      if (processingButton === true) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      // スタイルを順番に切り替える
      logseq.updateSettings({
        [currentGraphName + keySettingsPageStyle]: styleList[(styleList.indexOf(logseq.settings![currentGraphName + keySettingsPageStyle] as string) + 1) % styleList.length]
      })
    },

    // 設定ボタンが押されたら
    [keySettingsButton]: () => {
      if (processingButton === true) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      logseq.showSettingsUI()
    },

    // 閉じるボタンが押されたら
    [keyCloseButton]: () => {
      if (processingButton === true) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      resetPage(mainPageTitle)
    },

  })


  logseq.App.onRouteChanged(async ({ path, template }) => handleRouteChange(path, template))//ページ読み込み時に実行コールバック
  // logseq.App.onPageHeadActionsSlotted(async () => handleRouteChange())//Logseqのバグあり。動作保証が必要


  // CSSを追加
  logseq.provideStyle({ style: cssMain, key: keyCssMain })


  // プラグインが有効になったとき
  // document.bodyのクラスを変更する
  if (logseq.settings![currentGraphName + keySettingsPageStyle])
    parent.document.body.classList.add(`${shortKey}-${logseq.settings![currentGraphName + keySettingsPageStyle]}`)


  // プラグイン設定変更時
  logseq.onSettingsChanged(async (newSet: LSPluginBaseInfo['settings'], oldSet: LSPluginBaseInfo['settings']) => {

    // スタイル変更時の処理
    if (newSet[currentGraphName + keySettingsPageStyle] !== oldSet[currentGraphName + keySettingsPageStyle]) {
      //document.bodyのクラスを変更する
      if (oldSet[currentGraphName + keySettingsPageStyle])
        parent.document.body.classList.remove(`${shortKey}-${oldSet[currentGraphName + keySettingsPageStyle]}`)
      if (newSet[currentGraphName + keySettingsPageStyle])
        parent.document.body.classList.add(`${shortKey}-${newSet[currentGraphName + keySettingsPageStyle]}`)
    }

    // 入力候補が変更されたとき
    if (newSet[currentGraphName + "searchWordDataList"] !== oldSet[currentGraphName + "searchWordDataList"]) {

      if (processingResetForm) {
        setTimeout(() => {
          if (processingResetForm) return
          resetForm()
        }, 100)
        return
      }
      processingResetForm = true
      await resetForm()
      setTimeout(() => processingResetForm = false, 100)
    }
  })


  // プラグインが無効になったとき
  logseq.beforeunload(async () => {
    if (logseq.settings![currentGraphName + keySettingsPageStyle])
      parent.document.body.classList.remove(`${shortKey}-${logseq.settings![currentGraphName + keySettingsPageStyle]}`)
    clearEle(keyLeftMenuSearchForm)
    resetPage(mainPageTitle)
  })

  logseq.App.onCurrentGraphChanged(async () => {
    logseqDbGraph = await checkDbGraph()
  })
}/* end_main */


const resetForm = async () => {
  const formInputElement = parent.document.getElementById(keySearchInput) as HTMLInputElement | null
  if (formInputElement)
    logseq.updateSettings({ [currentGraphName + "searchWord"]: formInputElement.value })

  clearEle(keyLeftMenuSearchForm)
  await new Promise(resolve => setTimeout(resolve, 500))//500ms待ってから再描画
  await addLeftMenuSearchForm()
}

// MDモデルかどうかのチェック DBモデルはfalse
const checkLogseqVersion = async (): Promise<boolean> => {
  const logseqInfo = (await logseq.App.getInfo("version")) as AppInfo | any
  //  0.11.0もしくは0.11.0-alpha+nightly.20250427のような形式なので、先頭の3つの数値(1桁、2桁、2桁)を正規表現で取得する
  const version = logseqInfo.match(/(\d+)\.(\d+)\.(\d+)/)
  if (version) {
    logseqVersion = version[0] //バージョンを取得
    // console.log("logseq version: ", logseqVersion)

    // もし バージョンが0.10.*系やそれ以下ならば、logseqVersionMdをtrueにする
    if (logseqVersion.match(/0\.([0-9]|10)\.\d+/)) {
      logseqVersionMd = true
      // console.log("logseq version is 0.10.* or lower")
      return true
    } else logseqVersionMd = false
  } else logseqVersion = "0.0.0"
  return false
}

// DBグラフかどうかのチェック DBグラフだけtrue
const checkDbGraph = async (): Promise<boolean> => {
  const element = parent.document.querySelector(
    "div.block-tags",
  ) as HTMLDivElement | null // ページ内にClassタグが存在する  WARN:: ※DOM変更の可能性に注意
  if (element) {
    logseqDbGraph = true
    return true
  } else logseqDbGraph = false
  return false
}

logseq.ready(main).catch(console.error)
