import { BlockEntity } from '@logseq/libs/dist/LSPlugin.user'
import { t } from 'logseq-l10n'
import { checkGraphName, keyCloseButton, keyPageBarId, keySettingsButton, keyToggleButton, mainPageTitle, mainPageTitleLower } from '.'
import { resetPageBlocks } from './custom/page'
import { generateEmbed } from './embed/generateBlock'
import { keySettingsViewMode } from './settings'


// ページを開いたとき
let isProcessingRootChanged = false

export const handleRouteChange = async (path: string, template: string) => {
  if (template !== "/page/:name" //ページ以外は除外
    || isProcessingRootChanged === true) return
  isProcessingRootChanged = true
  setTimeout(() => isProcessingRootChanged = false, 100)

  const pageName = path.replace(/^\/page\//, "")
  if (pageName !== mainPageTitle) {// それ以外のページの場合
    // 右サイドバーで検索結果ページを開いていない場合、検索結果ページをリセット
    if (Array.from(parent.document.querySelectorAll("#right-sidebar div.sidebar-item-header div.page-title>span.ui__icon+span") as NodeListOf<HTMLElement>)
      .some((pageTitle) => pageTitle.textContent === mainPageTitle) as boolean === false)
      await updateMainContent("", { reset: true })
  }
  isProcessingRootChanged = false
}


let processingUpdateMainContent = false
export const updateMainContent = async (value: string, flag?: { force?: boolean, reset?: boolean, favorites?: boolean, recent?: boolean }) => {
  // console.log("updateMainContent", value, flag)
  if (processingUpdateMainContent === true) return
  processingUpdateMainContent = true
  setTimeout(() => processingUpdateMainContent = false, 400)
  const currentGraphName = await checkGraphName()
  const blocks = await logseq.Editor.getPageBlocksTree(mainPageTitle) as { uuid: BlockEntity["uuid"] }[]
  // console.log("blocks", blocks)
  if (blocks)
    if (flag && flag.reset)
      await resetPageBlocks(blocks, mainPageTitle)
    else
      await generateEmbed(
        value,
        mainPageTitle,
        blocks,
        flag?.favorites === true ? "Favorites"
          : flag?.recent === true ? "Recent history"
            : logseq.settings![currentGraphName + keySettingsViewMode] as string,
        currentGraphName,
        flag)
  processingUpdateMainContent = false
}


export const AddMenuButton = () => {
  logseq.App.registerUIItem('pagebar', { // ページバーにボタンを追加
    key: keyPageBarId,
    template: `
      <div id="${keyPageBarId}" title="${mainPageTitle} ${t("plugin")}">
      <button id="${keyToggleButton}" data-on-click="${keyToggleButton}" title="${t("Change Style")}">🎨</button>
      <button id="${keySettingsButton}" data-on-click="${keySettingsButton}" title="${t("Plugin Settings")}">⚙</button>
      <button id="${keyCloseButton}" data-on-click="${keyCloseButton}" title="${t("Press this button when finished.")}">✖ ${t("Close")}</button>
      </div>
      <style>
      #${keyPageBarId} {
        display: none;
      }
      div.page:has([id="${t(mainPageTitleLower)}"]) #${keyPageBarId} {
        display: block;
      }
      </style>
      `,
  })
}
