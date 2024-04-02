import { MentalProcess, useActions, useRag } from "@opensouls/engine";

const updateRag: MentalProcess = async ({ workingMemory }) => {
  const { log } = useActions()
  const { withRagContext } = useRag()

  log("updating rag")
  return withRagContext(workingMemory)
}

export default updateRag
