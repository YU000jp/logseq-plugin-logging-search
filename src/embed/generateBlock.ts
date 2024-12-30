import { t } from "logseq-l10n"
import { currentGraphName, templateName, templatePageTitle } from ".."
import { BlockEntity, IBatchBlock, PageEntity } from "@logseq/libs/dist/LSPlugin.user"


export const generateEmbed = async (firstBlockUuid: string) => {

  await logseq.Editor.exitEditingMode()

  logseq.showMainUI({ autoFocus: false })
  setTimeout(() => logseq.hideMainUI({ restoreEditingCursor: false }), 3000)

  // 初回のみ、ユーザーにメッセージ表示
  if (!logseq.settings!.noticeFirstSetup) {
    logseq.showSettingsUI()
    logseq.UI.showMsg(
      //初回は、すでにテンプレートが適用されているため、テンプレートの編集後に、All deleteボタンを押して、各ドラフトを更新してください。
      `${t("The first time, the template is already applied, so edit the template and press the All delete button to update each draft.")}`, "info", {
      timeout: 10000
    })
    logseq.updateSettings({ noticeFirstSetup: true }) // 初回セットアップのメッセージを表示しないように設定
  }

  const count = logseq.settings![currentGraphName + "count"] as number // 設定値を取得

  for (let i = 1; i <= count; i++) {

    const pageTitle = `${logseq.settings![currentGraphName + "draftTitleWord"] as string}${i}`
    // embed用ブロックを挿入
    await logseq.Editor.insertBlock(firstBlockUuid, `{{embed [[${pageTitle}]]}}`, { sibling: false, focus: false, })

    // ページが存在するかチェック
    const pageBlocks = await logseq.Editor.getPageBlocksTree(pageTitle) as BlockEntity[]
    if (pageBlocks[0]) {
      if (pageBlocks[0].content === "" && !pageBlocks[1]) {
        // draft-table-pluginという名称のテンプレートを先頭ブロックに適用
        if (pageBlocks[0].uuid) {
          if (await logseq.App.existTemplate(templateName) as boolean)
            await logseq.App.insertTemplate(pageBlocks[0].uuid, templateName) // テンプレートを適用
        }
      }
    } else {
      const firstBlock = await logseq.Editor.prependBlockInPage(pageTitle, "") as BlockEntity | null
      if (firstBlock) {
        const newLine = await logseq.Editor.insertBlock(firstBlock.uuid, "", { sibling: true, focus: false, }) as BlockEntity | null
        if (newLine) {
          if (await logseq.App.existTemplate(templateName) as boolean)
            await logseq.App.insertTemplate(newLine.uuid, templateName) // テンプレートを適用
          await logseq.Editor.removeBlock(newLine.uuid)
        }
      }
    }
  }

  // メインブロックのタイトル
  await logseq.Editor.updateBlock(firstBlockUuid, `# ${t("Draft List")}`)

  // テンプレートブロック用のembedを挿入
  await logseq.Editor.insertBlock(firstBlockUuid, `{{embed [[${templatePageTitle}]]}}`, { sibling: false, focus: false, })

  await firstSetupTemplatePage()

  // ブロックの編集モードを終了
  await logseq.Editor.exitEditingMode()

  logseq.hideMainUI({ restoreEditingCursor: false })
}


// 初回のみ、テンプレートページを作成する
const firstSetupTemplatePage = async () => {
  const pageBlocks = await logseq.Editor.getPageBlocksTree(templatePageTitle) as BlockEntity[]
  if (pageBlocks[0]) {
    if (pageBlocks[0].content === "")
      await createTemplateBlockBatch(pageBlocks[0].uuid)
  } else {
    const createPage = await logseq.Editor.createPage(templatePageTitle, {}, { redirect: false, createFirstBlock: false, journal: false }) as PageEntity | null
    if (createPage) {
      const firstBlock = await logseq.Editor.prependBlockInPage(createPage.uuid, "") as BlockEntity | null
      if (firstBlock)
        await createTemplateBlockBatch(firstBlock.uuid)
    }
  }

}


const createTemplateBlockBatch = async (blockUuid: string) => {
  await logseq.Editor.insertBatchBlock(blockUuid, [
    // 親ブロック
    {
      content: `# ${t("Template for draft")}`,
      children: [
        // 子ブロック
        {
          content: "",// ここから
        },
        {
          content: "",
        },
        {
          content: "",
        },
        {
          content: "",// ここまで
        },
      ],
      properties: {
        template: templateName,
        "template-including-parent": "false",
      }
    },
  ] as Array<IBatchBlock>)
  await logseq.Editor.removeBlock(blockUuid)
}