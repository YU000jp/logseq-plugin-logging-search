
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

