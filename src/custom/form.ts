import { PageEntity } from '@logseq/libs/dist/LSPlugin'
import { t } from 'logseq-l10n'
import { checkGraphName, icon, keyLeftMenuSearchForm, keyOnSidebarCheckbox, keyPageBarId, keyRunButton, keySearchInput, keyViewSelect, mainPageTitle } from '..'
import { updateMainContent } from '../handle'
import { clearEle } from '../lib'
import { keySettingsSearchFormDetails, keySettingsViewMode, modeList } from '../settings'
import { resetPage } from './page'

export const submit = async () => {
  const currentGraphName = await checkGraphName()
  const input = parent.document.getElementById(keySearchInput) as HTMLInputElement | null // 検索ワードの入力欄
  if (input && input.value !== "") {
    // 検索ワードを設定に保存
    logseq.updateSettings({ [currentGraphName + "searchWord"]: input.value })
    // ページ内容の更新をおこなう
    // console.log("input.value", input.value)
    await updateMainContent(input.value, { force: true }) // 検索ワード
    if (logseq.settings![currentGraphName + keySettingsViewMode] === "Recent history" || logseq.settings![currentGraphName + keySettingsViewMode] === "Favorites") {
      // 通知しない
    } else
      await logseq.UI.showMsg("'" + input.value + "'\n\n" + t("Search"), "success", { timeout: 2200 })

    setTimeout(async () => {
      await logseq.Editor.exitEditingMode(false)
      // 先頭にスクロールする
      const pageBar = parent.document.getElementById(keyPageBarId) as HTMLElement | null
      // pageBarの位置までスクロール
      if (pageBar)
        pageBar.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 300)
  } else
    logseq.UI.showMsg(t("Please enter a search word."), "error", { timeout: 2200 })
}


let processingButton = false
export const addLeftMenuSearchForm = async () => {
  const currentGraphName = await checkGraphName()
  try {
    clearEle(keyLeftMenuSearchForm)
  } finally {
    const leftSidebarNavContentsElement = parent.document.querySelector("#left-sidebar div.nav-contents-container") as HTMLElement | null
    if (leftSidebarNavContentsElement) {
      const details = document.createElement("details")
      details.id = keyLeftMenuSearchForm
      details.style.background = "var(--ls-page-blockquote-bg-color)"
      details.style.borderRadius = "0 0 0 1em"
      details.style.zIndex = "1"
      if (logseq.settings![currentGraphName + keySettingsSearchFormDetails] === true)
        details.open = true
      setTimeout(() =>
        details.addEventListener("toggle", () => {
          logseq.updateSettings({ [currentGraphName + keySettingsSearchFormDetails]: details.open as boolean })
        }), 100)

      const summary = document.createElement("summary")
      summary.textContent = `${icon} ${mainPageTitle}`
      details.appendChild(summary)

      // 選択肢
      const select = document.createElement("select")
      select.id = keyViewSelect
      select.title = t("Change View")
      select.className = "form-select"
      const defaultOption = document.createElement("option")
      defaultOption.value = ""
      defaultOption.textContent = `-- ${t("Select")}--`
      select.appendChild(defaultOption)
      // モードリストを選択肢に追加
      modeList().forEach((m) => {
        const option = document.createElement("option")
        option.value = m.value
        option.label = m.translate
        if (logseq.settings![currentGraphName + keySettingsViewMode] === m.value)
          option.selected = true
        option.title = m.description
        select.appendChild(option)
      })

      // 検索送信ボタン
      const submitButton = document.createElement("input")
      submitButton.type = "submit"
      submitButton.id = keyRunButton
      submitButton.title = t("Search")
      submitButton.style.width = "100%"
      submitButton.style.cursor = "pointer"
      submitButton.style.display = "none"
      submitButton.className = "ui__button .bg-primary/90 hover:text-primary-foreground text-lg"
      submitButton.addEventListener("click", async (ev: MouseEvent) => {
        ev.preventDefault()
        if (processingButton === true) return
        processingButton = true
        setTimeout(() => processingButton = false, 100)

        //selectの値を保存
        if (select.value !== "")
          logseq.updateSettings({ [currentGraphName + keySettingsViewMode]: select.value })

        await submit()

        setTimeout(async () => {
          if (ev.shiftKey === true // シフトキーが押されている場合
            || logseq.settings![currentGraphName + keySettingsViewMode] === modeList()[2].value // リストのみの場合
            || logseq.settings![currentGraphName + "openInRightSidebar"] === true) { // チェックボックスがオン場合
            const pageEntity = await logseq.Editor.getPage(mainPageTitle) as { uuid: PageEntity["uuid"] } | null
            if (pageEntity)
              logseq.Editor.openInRightSidebar(pageEntity.uuid)
          } else
            logseq.App.pushState('page', { name: mainPageTitle })// ページを開く
        }, 500)
        processingButton = false
      })

      // 入力欄のコンテナ
      const containerKeyWordInput = document.createElement("div")
      containerKeyWordInput.style.display = "flex"
      containerKeyWordInput.style.alignItems = "center"
      containerKeyWordInput.style.gap = "0.5em"

      // 現在のページ名を入力欄に追加するボタン
      const currentPageButton = document.createElement("button")
      currentPageButton.textContent = "▶️"
      currentPageButton.title = t("Use current page name")
      currentPageButton.style.cursor = "pointer"
      currentPageButton.className = "ui__button .bg-primary/90 hover:text-primary-foreground text-lg"
      currentPageButton.addEventListener("click", async (ev: MouseEvent) => {
        ev.preventDefault()
        const currentPage = await logseq.Editor.getCurrentPage() as { "originalName": PageEntity["originalName"] } | null
        if (currentPage)
          input.value = currentPage["originalName"]
        else {
          const pageTitleElement = parent.document.querySelector("h1.title") as HTMLElement | null // ジャーナルの場合
          if (pageTitleElement)
            input.value = pageTitleElement.textContent || ""
          else
            logseq.UI.showMsg(t("No page is currently open."), "error", { timeout: 2200 })
        }
      })
      containerKeyWordInput.appendChild(currentPageButton)
      // 検索ワードの入力欄
      const input = document.createElement("input")
      input.type = "text"
      input.id = keySearchInput
      input.placeholder = t("Search pages")
      input.className = "form-input hover:text-primary-foreground text-lg"
      input.value = logseq.settings![currentGraphName + "searchWord"] as string || ""
      // mouseoverでフォーカス
      input.addEventListener("mouseover", () => input.focus())
      // Enterキーでsubmit
      input.addEventListener("keydown", async (ev: KeyboardEvent) => {
        if (ev.key === "Enter") {
          ev.preventDefault()
          submitButton.click()  // クリックイベントを発火
        }
      })
      // Escキーで文字列を選択
      input.addEventListener("keydown", async (ev: KeyboardEvent) => {
        if (ev.key === "Escape") {
          ev.preventDefault()
          input.select()
        }
      })
      containerKeyWordInput.appendChild(input)
      // 右サイドバーで開くチェックボックス
      const checkbox = document.createElement("input")
      checkbox.type = "checkbox"
      checkbox.id = keyOnSidebarCheckbox
      checkbox.className = "form-checkbox"
      checkbox.title = t("Open in right sidebar")
      checkbox.style.cursor = "pointer"
      checkbox.checked = logseq.settings![currentGraphName + "openInRightSidebar"] as boolean || true
      checkbox.addEventListener("change", () => {
        logseq.updateSettings({ [currentGraphName + "openInRightSidebar"]: checkbox.checked })
      })
      containerKeyWordInput.appendChild(checkbox)
      details.appendChild(containerKeyWordInput)


      // submitボタンと同じ行に配置するコンテナ
      const containerSubmit = document.createElement("div")
      containerSubmit.style.display = "flex"
      containerSubmit.style.alignItems = "center"
      containerSubmit.style.gap = "0.5em"

      // 設定を開くボタン
      const settingsButton = document.createElement("button")
      settingsButton.textContent = "⚙️"
      settingsButton.title = t("Settings")
      settingsButton.style.cursor = "pointer"
      settingsButton.className = "ui__button .bg-primary/90 hover:text-primary-foreground text-sm"
      settingsButton.addEventListener("click", async (ev: MouseEvent) => {
        ev.preventDefault()
        if (processingButton === true) return
        processingButton = true
        setTimeout(() => processingButton = false, 100)
        logseq.showSettingsUI()
        processingButton = false
      })
      containerSubmit.appendChild(settingsButton)

      // クリア処理をおこなうボタン
      const clearButton = document.createElement("button")
      clearButton.textContent = "🗑️"
      // 検索用ページのクリア処理 (任意)
      clearButton.title = t("Clear the page of search results")
      clearButton.style.cursor = "pointer"
      clearButton.className = "ui__button .bg-primary/90 hover:text-primary-foreground text-sm"
      clearButton.addEventListener("click", async (ev: MouseEvent) => {
        ev.preventDefault()
        if (processingButton === true) return
        processingButton = true
        setTimeout(() => processingButton = false, 100)
        await resetPage(mainPageTitle)
        // 結果のページをクリア
        logseq.UI.showMsg(t("Clear the results page"), "success", { timeout: 2200 })
        processingButton = false
      })
      containerSubmit.appendChild(select)
      containerSubmit.appendChild(clearButton)
      containerSubmit.appendChild(submitButton)

      // コンテナ
      const underContainer = document.createElement("div")
      underContainer.style.display = "flex"
      underContainer.style.alignItems = "center"
      underContainer.style.gap = "0.5em"
      // 履歴ボタン
      const historyButton = document.createElement("button")
      historyButton.textContent = "🕒"
      historyButton.title = t("Recent history")
      historyButton.style.cursor = "pointer"
      historyButton.className = "ui__button .bg-primary/90 hover:text-primary-foreground text-sm"
      historyButton.addEventListener("click", async (ev: MouseEvent) => {
        ev.preventDefault()
        if (processingButton === true) return
        processingButton = true
        setTimeout(() => processingButton = false, 100)
        select.value = "Recent history"
        setTimeout(() => submitButton.click(), 10)
        processingButton = false
      })
      underContainer.appendChild(historyButton)
      // お気に入りボタン
      const favoriteButton = document.createElement("button")
      favoriteButton.textContent = "⭐"
      favoriteButton.title = t("Favorites")
      favoriteButton.style.cursor = "pointer"
      favoriteButton.className = "ui__button .bg-primary/90 hover:text-primary-foreground text-sm"
      favoriteButton.addEventListener("click", async (ev: MouseEvent) => {
        ev.preventDefault()
        if (processingButton === true) return
        processingButton = true
        setTimeout(() => processingButton = false, 100)
        select.value = "Favorites"
        setTimeout(() => submitButton.click(), 10)
        processingButton = false
      })
      underContainer.appendChild(favoriteButton)

      details.appendChild(containerSubmit)
      details.appendChild(underContainer)
      leftSidebarNavContentsElement.appendChild(details)
    }
  }
}
