import { currentGraphName, keyCssRemoveDrafts } from '..'


export const addLeftMenuNavHeader = (divId: string, icon: string, title: string, goPageName: string) => {
  try {
    clearEle(divId)
  } finally {
    const leftSidebarElement = parent.document.querySelector("#left-sidebar div.nav-header") as HTMLElement | null
    if (leftSidebarElement) {
      const div = document.createElement("div")
      div.id = divId
      leftSidebarElement.appendChild(div)

      const anchor = document.createElement("a")
      anchor.className = "item group flex items-center text-sm font-medium rounded-md"
      anchor.addEventListener("click", () => logseq.App.pushState('page', { name: goPageName }) // ページを開く
      )
      div.appendChild(anchor)

      const spanIcon = document.createElement("span")
      spanIcon.className = "ui__icon ti ls-icon-files"
      spanIcon.textContent = icon
      anchor.appendChild(spanIcon)

      const span = document.createElement("span")
      span.className = ("flex-1")
      span.textContent = title
      anchor.appendChild(span)
    }
  }
}


export const clearEle = (elementById: string): boolean => {
  const ele = parent.document.getElementById(elementById) as HTMLElement | null
  if (ele) {
    ele.remove()
    return true
  } else
    return false
}


export const removeProvideStyle = (className: string) => {
  const doc = parent.document.head.querySelector(
    `style[data-injected-style^="${className}"]`
  ) as HTMLStyleElement
  if (doc) doc.remove()
}
// 左メニューの履歴リストから、各ドラフトを取り除く
export const removeDraftsFromRecent = async () => {
  if (logseq.settings![currentGraphName + "draftTitleWord"])
    logseq.provideStyle({
      style: `
  #left-sidebar li[title^="${logseq.settings![currentGraphName + "draftTitleWord"] as string}"i] {
      display: none;
  }
    `,
      key: keyCssRemoveDrafts,
    })
}

