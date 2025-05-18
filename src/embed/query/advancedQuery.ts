import { BlockEntity, PageEntity } from "@logseq/libs/dist/LSPlugin.user"

const advancedQuery = async <T>(query: string, ...input: Array<any>): Promise<T | null> => {
  try {
    const result = await logseq.DB.datascriptQuery(query, ...input)
    return result?.flat() as T ?? null
  } catch (err) {
    console.warn("Query execution failed:", err)
    return null
  }
}

export type BlockContent = {
  content?: BlockEntity["content"]
  title?: string //BlockEntity["title"]
}

export const getBlockContentFromPageName = async (pageName: string, logseqVerMd: boolean): Promise<BlockContent[] | null> => {
  const result = await advancedQuery<BlockContent[]>(`
    [:find
      (pull ?b [:block/${logseqVerMd === true ? `content` : "title"}])
    :where
      [?p :block/name "${pageName}"]
      [?b :block/page ?p]]`)
  return result as BlockContent[] ?? null
}

export type BlockUuid = {
  uuid: BlockEntity["uuid"]
}

export const getUuidFromPageName = async (pageName: string, logseqVerMd: boolean): Promise<BlockUuid[] | null> => {
  const result = await advancedQuery<BlockUuid[]>(`
    [:find
      (pull ?b [:block/uuid])
    :where
      [?p :block/${logseqVerMd === true ? "name" : "title"} "${pageName}"]
      [?b :block/page ?p]]`)
  return result as BlockUuid[] ?? null
}

export type PageName = {
  name: PageEntity["name"]
}

export const getPageNameListFromKeyword = async (keyword: string, logseqVerMd: boolean): Promise<PageName[] | null> => {
  const result = await advancedQuery<PageName[]>(`
    [:find
      (pull ?p [:block/name])
    :where
      [?p :block/name ?name]
      [(clojure.string/includes? ?name "${keyword}")]]`)
  return result as PageName[] ?? null
}