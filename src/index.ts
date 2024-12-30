import '@logseq/libs' //https://plugins-doc.logseq.com/
import { AppGraphInfo, LSPluginBaseInfo, PageEntity } from '@logseq/libs/dist/LSPlugin.user'
import { setup as l10nSetup, t } from "logseq-l10n" //https://github.com/sethyuan/logseq-l10n
import { addLeftMenuNavHeader, clearEle, removeDraftsFromRecent, removeProvideStyle } from './embed/lib'
import { AddToolbarAndMenuButton, handleRouteChange, updateMainContent } from './handle'
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

export const mainPageTitle = "Draft-Notes-Plugin" // メインページのタイトル
export const mainPageTitleLower = mainPageTitle.toLowerCase()
export const shortKey = "drf"
const keyCssMain = "main"
export const keyToolbar = "Draft-Notes"
export const keyPageBarId = `${shortKey}--pagebar`
export const toolbarIcon = "📝"
export const keyToggleButton = `${shortKey}--changeStyleToggle`
export const keySettingsButton = `${shortKey}--pluginSettings`
export const keyRunButton = `${shortKey}--run`
export const keyCloseButton = `${shortKey}--close`
export const keyAllDeleteButton = `${shortKey}--allDelete`
const keyLeftMenu = `${shortKey}--nav-header`
export const keyCssRemoveDrafts = `${shortKey}--removeDrafts`
export const templatePageTitle = mainPageTitle + "/Template"
export const templateName = "draft-notes-plugin"

export let currentGraphName = "" // 現在のgraph名を保持する

export const getCurrentGraph = async (): Promise<string> => {
  const userGraph = await logseq.App.getCurrentGraph() as { name: AppGraphInfo["name"] } | null
  if (userGraph) {
    console.log("currentGraph", userGraph.name)
    currentGraphName = userGraph.name + "/" // 現在のgraph名を保持
    return currentGraphName
  } else {
    currentGraphName = "" // demo graphの場合は空文字
    console.warn("getCurrentGraph failed or the demo graph")
    return ""
  }
}

const loadByGraph = async () => {
  const currentGraphName = await getCurrentGraph()
  if (currentGraphName === "")
    return // demo graphの場合は実行しない
  else {
    logseq.useSettingsSchema(settingsTemplate(currentGraphName, t("Draft")))
  }
}


/* main */
const main = async () => {

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


  // ツールバーとメニュー用のボタンを追加
  AddToolbarAndMenuButton()


  // メニューバーのヘッダーに追加
  if (logseq.settings![currentGraphName + "addLeftMenu"] === true)
    addLeftMenuNavHeader(keyLeftMenu, toolbarIcon, t("Draft"), mainPageTitle)



  let processingButton = false
  //クリックイベント
  logseq.provideModel({

    // ツールバーボタンが押されたら
    [keyToolbar]: async () => {
      if (processingButton) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      const pageEntity = await logseq.Editor.getPage(mainPageTitle, { includeChildren: false }) as PageEntity | null
      if (pageEntity) {
        logseq.App.pushState('page', { name: mainPageTitle })// ページを開く
      } else {
        await logseq.Editor.createPage(mainPageTitle, { public: false }, { redirect: true, createFirstBlock: true, journal: false })
        setTimeout(() => {
          const runButton = parent.document.getElementById(keyRunButton) as HTMLElement | null
          if (runButton)
            runButton.click()
        }, 300)
      }
      logseq.UI.showMsg(`${mainPageTitle}`, "info", { timeout: 2200 })
    },

    // トグルボタンが押されたら
    [keyToggleButton]: () => {
      if (processingButton) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      // スタイルを順番に切り替える
      logseq.updateSettings({
        [currentGraphName + keySettingsPageStyle]: styleList[(styleList.indexOf(logseq.settings![currentGraphName + keySettingsPageStyle] as string) + 1) % styleList.length]
      })
    },

    // 設定ボタンが押されたら
    [keySettingsButton]: () => {
      if (processingButton) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      logseq.showSettingsUI()
    },

    // 実行ボタンが押されたら
    [keyRunButton]: async () => {
      if (processingButton) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      // ページ内容の更新をおこなう
      await updateMainContent("page")
    },

    // 閉じるボタンが押されたら
    [keyCloseButton]: () => {
      if (processingButton) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      logseq.Editor.deletePage(mainPageTitle)
    },

    // 全削除ボタンが押されたら
    [keyAllDeleteButton]: async () => {
      if (processingButton) return
      processingButton = true
      setTimeout(() => processingButton = false, 100)

      // ページの全削除
      for (let i = 1; i <= (logseq.settings![currentGraphName + "count"] as number); i++)
        await logseq.Editor.deletePage(`${logseq.settings![currentGraphName + "draftTitleWord"]}${i}`)
    },

  })


  logseq.App.onRouteChanged(async ({ path, template }) => handleRouteChange(path, template))//ページ読み込み時に実行コールバック
  // logseq.App.onPageHeadActionsSlotted(async () => handleRouteChange())//Logseqのバグあり。動作保証が必要


  // CSSを追加
  logseq.provideStyle({ style: cssMain, key: keyCssMain })

  if (logseq.settings![currentGraphName + "removeDraftFromRecent"] as boolean === true)
    removeDraftsFromRecent()// 左メニューの履歴リストから、各ドラフトを取り除く

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

    if (oldSet[currentGraphName + "addLeftMenu"] !== newSet[currentGraphName + "addLeftMenu"]) {
      if (newSet[currentGraphName + "addLeftMenu"] === false)
        clearEle(`${shortKey}--nav-header`)
      else
        addLeftMenuNavHeader(keyLeftMenu, toolbarIcon, t("Draft"), mainPageTitle)
    }

    if (oldSet[currentGraphName + "removeDraftFromRecent"] === false && newSet[currentGraphName + "removeDraftFromRecent"] === true)
      removeDraftsFromRecent()
    else
      if (oldSet[currentGraphName + "removeDraftFromRecent"] === true && newSet[currentGraphName + "removeDraftFromRecent"] === false)
        removeProvideStyle(keyCssRemoveDrafts)
    // 更新
    if (oldSet[currentGraphName + "draftTitleWord"] !== newSet[currentGraphName + "draftTitleWord"])
      removeDraftsFromRecent()

  })


  // プラグインが無効になったとき
  logseq.beforeunload(async () => {
    if (logseq.settings![currentGraphName + keySettingsPageStyle])
      parent.document.body.classList.remove(`${shortKey}-${logseq.settings![currentGraphName + keySettingsPageStyle]}`)
    clearEle(`${shortKey}--nav-header`)
  })


}/* end_main */


logseq.ready(main).catch(console.error)