import '@logseq/libs' //https://plugins-doc.logseq.com/
import { AppGraphInfo, LSPluginBaseInfo } from '@logseq/libs/dist/LSPlugin.user'
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
let logseqVersion: string = "" //アプリバージョン(情報用のみ。グラフ種別の判定には使わない)
let logseqVersionMd: boolean = false //現在のグラフがファイルベースか(= !logseqDbGraph)
let logseqDbGraph: boolean = false //現在のグラフがDBグラフか
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

  // アプリバージョンを保存(情報用のみ)
  await fetchAppVersion()

  // 初回起動時はグラフ作成前に検出が走ることがあるため、グラフが用意できるまで短時間待つ
  await waitGraphReady()

  // 現在のグラフがDBグラフか(検出失敗=API非搭載の旧アプリ=ファイルグラフのみ開ける)
  const checkId = ++latestCheckId
  const detectedDbGraph = await checkDbGraph()
  if (checkId === latestCheckId) {
    logseqDbGraph = detectedDbGraph ?? false
    logseqVersionMd = !logseqDbGraph
  }

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
  }, 1000)

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
    const id = ++latestCheckId
    const isDb = await checkDbGraph()
    // 判定不能なら既知のフラグを維持し、より新しい判定が開始されていたら破棄する
    if (id !== latestCheckId || isDb === null) return
    logseqDbGraph = isDb
    logseqVersionMd = !isDb
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

// グラフ種別の検出は非同期のため、最新の判定のみがフラグを更新できるようにするガード
let latestCheckId = 0

// アプリのバージョンを保存(情報用のみ。グラフ種別の判定には使わない)
const fetchAppVersion = async (): Promise<void> => {
  const logseqInfo = (await logseq.App.getInfo("version")) as unknown
  // 0.11.0もしくは0.11.0-alpha+nightly.20250427のような形式なので、先頭の3つの数値(1桁、2桁、2桁)を正規表現で取得する
  const version = typeof logseqInfo === "string" ? logseqInfo : "0.0.0"
  const match = version.match(/(\d+)\.(\d+)\.(\d+)/)
  logseqVersion = match ? match[0] : version
}

// 現在のグラフがDBグラフか。検出失敗時はnullを返す(0.10.xなどAPI非搭載ホスト。
// logseq.Appは動的プロキシのためtypeofガードは効かず、try/catchで判定する)
const checkDbGraph = async (): Promise<boolean | null> => {
  try {
    const value = await (logseq.App as any).checkCurrentIsDbGraph()
    return typeof value === "boolean" ? value : null
  } catch {
    return null
  }
}

// 初回起動時はグラフがまだ作成されていないことがあるため、利用可能になるまで短時間待つ
const waitGraphReady = async (timeoutMs = 3000): Promise<void> => {
  try {
    const start = Date.now()
    while (Date.now() - start < timeoutMs) {
      if (await logseq.App.getCurrentGraph())
        return
      await new Promise(resolve => setTimeout(resolve, 300))
    }
  } catch {
    // getCurrentGraph非搭載の旧ホストでは即座に抜ける
  }
}

logseq.ready(main).catch(console.error)
