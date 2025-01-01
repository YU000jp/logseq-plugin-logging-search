import { BlockEntity, IBatchBlock, PageEntity } from "@logseq/libs/dist/LSPlugin"
import { t } from "logseq-l10n"
import { checkGraphName } from '..'
import { clearPageBlocks, resetPageBlocks } from "../custom/page"
import { keySettingsPageStyle, keySettingsViewMode } from "../settings"
import { getBlockContentFromPageName, getPageNameListFromKeyword } from './query/advancedQuery'

export const generateEmbed = async (keyword: string, pageName: string, blocks: { uuid: BlockEntity["uuid"] }[], flag?: { force?: boolean }) => {
  const currentGraphName = await checkGraphName()
  const limit = logseq.settings![currentGraphName + keySettingsViewMode] === "references" ?
    8
    : logseq.settings![currentGraphName + "count"] as number || 30

  //  console.log("generateEmbed", value, pageName, blocks, flag)
  // ブロックの編集モードを終了
  await logseq.Editor.exitEditingMode()

  logseq.showMainUI({ autoFocus: false })
  setTimeout(() => logseq.hideMainUI({ restoreEditingCursor: false }), 3000)

  const pageEntities = await getPageNameListFromKeyword(keyword) as { name: PageEntity["name"] }[] | null
  // console.log(pageEntities)
  if (pageEntities && pageEntities.length > 0) {

    const batch: IBatchBlock[] = await createBatch(pageEntities.map((v) => v.name), limit, currentGraphName, keyword)
    //  console.log(batch)
    if (batch.length > 0)
      await outputList(blocks, pageName, batch, keyword) // ページコンテンツを生成
    else
      await resetPageBlocks(blocks, pageName)// batchが空の場合
  } else
    await resetPageBlocks(blocks, pageName)// 見つからなかった場合

  // ブロックの編集モードを終了
  setTimeout(() => logseq.Editor.exitEditingMode(false), 300)

  logseq.hideMainUI({ restoreEditingCursor: false })
}



const outputList = async (blocks: { uuid: BlockEntity["uuid"] }[], pageName: string, batch: IBatchBlock[], value: string) => {
  const currentGraphName = await checkGraphName()
  const newBlockEntity = await clearPageBlocks("", blocks, pageName) as { uuid: BlockEntity["uuid"] } | null
  if (newBlockEntity) {
    await logseq.Editor.insertBatchBlock(newBlockEntity.uuid, batch, { before: false, sibling: false })
    if (logseq.settings![currentGraphName + keySettingsViewMode] === "Recent history" || logseq.settings![currentGraphName + keySettingsViewMode] === "Favorites")
      await logseq.Editor.updateBlock(newBlockEntity.uuid, `# ${logseq.settings![await checkGraphName() + keySettingsViewMode]}`) // 先頭行
    else
      await logseq.Editor.updateBlock(newBlockEntity.uuid, `# ${t("Search result")}: ${value}\n${logseq.settings![await checkGraphName() + keySettingsViewMode]}`) // 先頭行
    logseq.Editor.exitEditingMode(false)
  }
}


const createBatch = async (
  array: string[],
  limit: number,
  currentGraphName: string,
  value: string
) => {

  // 文字数が少ない順にソート (/で区切られていないものをより先にする)
  array.sort((a, b) => a.length - b.length)
    .sort((a, b) => a.split("/").length - b.split("/").length)

  // console.log(array)
  if (logseq.settings![currentGraphName + keySettingsViewMode] === "Recent history" || logseq.settings![currentGraphName + keySettingsViewMode] === "Favorites") {
    // 通知しない
  } else // 件数通知
    logseq.UI.showMsg(
      t("Found") + " : " + array.length.toString() + " " + t("pages") + "\n" + (logseq.settings![currentGraphName + keySettingsViewMode] === "Page search (page-embed)" ? // embedの場合はlimitの件数を表示
        (t("Limit (by user config)") + " : " + limit.toString() + " " + t("pages"))
        : ""))

  const batch: IBatchBlock[] = []

  switch (logseq.settings![currentGraphName + keySettingsViewMode]) {
    case "Full text search":
      logseq.updateSettings({
        [currentGraphName + keySettingsPageStyle]: "Expansion"
      })
      // クエリー
      batch.push({
        content: `{{query "${value}"}}`, // フルテキスト検索を設置
      })
      break
    case "Page search (page-embed)":
      logseq.updateSettings({
        [currentGraphName + keySettingsPageStyle]: "Tile"
      })
      const arrayEmpty: string[] = []
      let count = limit
      for (const pageName of array) {
        if (count <= 0) break
        if (pageName) {
          if (logseq.settings![currentGraphName + "embedExcludeNoContent"] === true) { // ページ内容が空の場合はスキップ
            const blockContent = await getBlockContentFromPageName(pageName) as { content: BlockEntity["content"] }[] | null
            if (blockContent && blockContent.length <= (logseq.settings![currentGraphName + "embedExcludeFewLines"] as number || 0)) {
              arrayEmpty.push(pageName)
              continue
            }
          }
          count--
          batch.push({
            content: `{{embed [[${pageName}]]}}`, // embedを設置
          })
        }
      }
      // 空のページを通知
      if (arrayEmpty.length > 0)
        batch.push({
          // [[ページ名]]の形式で表示
          content: t("The following pages have no content") + ": \n" + arrayEmpty.map(page => `[[${page}]]`).join("\n"),
        })
      if (batch.length > 0)
        logseq.UI.showMsg(t("When content is found, embed is placed."), "info", { timeout: 3000 })
      break
    case "Page search (list only)":
      logseq.updateSettings({
        [currentGraphName + keySettingsPageStyle]: "Expansion"
      })
      if (array.length < 6) { // 6件以下の場合はリンクのみを表示
        array.sort()
        batch.push({
          content: array.map(page => `[[${page}]]`).join("\n"), // リンクのみを一覧表示
        })
      } else {
        // 6件以上の場合は階層化して表示
        // arrayに/が含まれているかどうかで階層化するか判断
        const arrayNested: string[] = []
        const arrayFlat: string[] = []
        for (const page of array) {
          if (page.includes("/"))
            arrayNested.push(page)
          else
            arrayFlat.push(page)
        }
        // 階層がない場合
        if (arrayNested.length < 4) {
          arrayFlat.sort()
          batch.push({
            content: arrayFlat.map(page => `[[${page}]]`).join("\n"), // リンクのみを一覧表示
          })
        } else {
          // 階層がある場合
          if (arrayFlat.length > 0) {
            arrayFlat.sort()
            batch.push({
              content: arrayFlat.map(page => `[[${page}]]`).join("\n"), // リンクのみを一覧表示
            })
          }
          // arrayNestedの階層化処理
          // 階層化の深さを取得
          const depth = arrayNested.map(page => page.split("/").length).reduce((a, b) => Math.max(a, b))
          // 階層化
          for (let i = 1; i <= depth; i++) {
            const arrayDepth = arrayNested.filter(page => page.split("/").length === i)
            if (arrayDepth.length > 0) {
              arrayDepth.sort()
              batch.push({
                content: arrayDepth.map(page => `[[${page}]]`).join("\n"), // リンクのみを一覧表示
              })
            }
          }
        }
      }
      break
    case "Related Pages References":
      logseq.updateSettings({
        [currentGraphName + keySettingsPageStyle]: "Expansion"
      })
      // クエリー
      batch.push({
        // (and [[ページ名]] [[ページ名]] [[ページ名]])の形式で表示
        content: `{{query (or ${array.map(page => `[[${page}]]`).join(" ")})}}`, //ひとつのクエリーで複数のページを検索
      })
      break
    case "Recent history":
      logseq.updateSettings({
        [currentGraphName + keySettingsPageStyle]: "Tile"
      })
      const recentList = await logseq.App.getCurrentGraphRecent() as string[] | null
      if (recentList) {
        let count = limit
        for (const pageName of recentList) {
          if (count <= 0) break
          count--
          batch.push({
            content: `{{embed [[${pageName}]]}}`, // embedを設置
          })
        }
      } else
        // ペジがない場合
        batch.push({
          content: t("No recent pages"),
        })
      break
    case "Favorites":
      logseq.updateSettings({
        [currentGraphName + keySettingsPageStyle]: "Tile"
      })
      const favoriteList = await logseq.App.getCurrentGraphFavorites() as string[] | null
      if (favoriteList) {
        let count = limit
        for (const pageName of favoriteList) {
          if (count <= 0) break
          count--
          batch.push({
            content: `{{embed [[${pageName}]]}}`, // embedを設置
          })
        }
      } else
        // ペジがない場合
        batch.push({
          content: t("No favorites"),
        })
      break
    default: // エラー
      break
  }
  return batch
}
