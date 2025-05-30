import { BlockEntity } from "@logseq/libs/dist/LSPlugin"
import { t } from "logseq-l10n"



export const resetPage = async (pageName: string) => {
  const blocks = await logseq.Editor.getPageBlocksTree(pageName) as { uuid: BlockEntity["uuid"]} [] | null
  if (blocks)
    await resetPageBlocks(blocks, pageName)
}

export const resetPageBlocks = async (blocks: { uuid: BlockEntity["uuid"]} [], pageName: string) => {
  clearPageBlocks(t("No pages found"), blocks, pageName)
}

export const clearPageBlocks = async (content: string, blocks: { uuid: BlockEntity["uuid"] }[], pageName: string) => {
    // 一時的にDOMエレメントを非表示にする
    hideMainContent('#main-content-container div[id^="logging-search-plugin/"] ')
  for (const block of blocks)
    await logseq.Editor.removeBlock(block.uuid)
  //300ms待機
  await new Promise((resolve) => setTimeout(resolve, 300))
  // メインページの最初のブロックを作成
  return await logseq.Editor.appendBlockInPage(pageName, content) as { uuid: BlockEntity["uuid"]}  | null
}

const hideMainContent = (selector: string) => {
  const ele = parent.document.querySelector(selector) as HTMLElement
  if (ele)
    ele.style.display = "none"
}