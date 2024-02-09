import { MentalProcess, useActions, useRag } from "soul-engine";

const updateRag: MentalProcess = async ({ step: initialStep }) => {
  const { log } = useActions()
  const { withRagContext } = useRag()

  log("updating rag")
  return withRagContext(initialStep)
}

export default updateRag
