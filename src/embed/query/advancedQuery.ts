
export const executeDataQuery = async (query: string): Promise<any | null> => {
  try {
    return (await logseq.DB.datascriptQuery(query) as any)?.flat()
  } catch (err: any) {
    console.warn(err)
  }
  return null
}


export const getBlockContentFromPageName = async (pageName: string) =>
  await executeDataQuery(`
            [:find (pull ?b [:block/content])
            :where [?p :block/name "${pageName}"]
            [?b :block/page ?p]]`) as any | null

export const getUuidFromPageName = async (pageName: string) =>
  await executeDataQuery(`
                        [:find (pull ?b [:block/uuid])
                        :where [?p :block/name "${pageName}"]
                        [?b :block/page ?p]]`) as any | null

export const getPageNameListFromKeyword = async (keyword: string) =>
  await executeDataQuery(`
                        [:find (pull ?p [:block/name])
                        :where [?p :block/original-name ?page]
                        [(clojure.string/includes? ?page "${keyword}")]]`) as any | null
