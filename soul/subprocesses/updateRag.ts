import { externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager, useRag } from "soul-engine";

const updateRag: MentalProcess = async ({ step: initialStep }) => {
  const { log } = useActions()
  const { withRagContext  } = useRag("soul-engine-docs")

  log("updating rag")
  return withRagContext(initialStep)
}

export default updateRag
