
import { ChatMessageRoleEnum, MentalProcess, useActions, useProcessMemory, useSoulMemory } from "@opensouls/engine";
import mentalQuery from "../cognitiveSteps/mentalQuery.js";
import internalMonologue from "../cognitiveSteps/internalMonologue.js";
import userNotes from "../cognitiveSteps/userNotes.js";

const modelsChatters: MentalProcess = async ({ workingMemory }) => {
  const { log } = useActions()
  const lastProcessed = useProcessMemory("")

  let unprocessedMessages = workingMemory.filter((m) => m.role === ChatMessageRoleEnum.User)

  if (lastProcessed.current) {
    const idx = unprocessedMessages.memories.findIndex((m) => (m.metadata?.discordMessage as any)?.id === lastProcessed.current)
    if (idx > 0) {
      unprocessedMessages = unprocessedMessages.slice(idx + 1)
    }
  }

  log("unprocessedMessages count", unprocessedMessages.memories.length)

  for (const message of unprocessedMessages.memories) {
    const discordMessage = message.metadata?.discordMessage as any
    if (!discordMessage) {
      continue
    }
    const userName = discordMessage.username
    if (!userName) {
      continue
    }
    const userModel = useSoulMemory(userName, "")
    let memory = workingMemory

    const [, modelQuery] = await mentalQuery(
      memory,
      `${memory.soulName} has learned something new and they need to update the mental model of ${userName}.`
    )

    // const modelQuery = await memory.compute(mentalQuery(`${memory.entityName} has learned something new and they need to update the mental model of ${userName}.`));
    log("Update model?", userName, modelQuery)
    if (modelQuery) {
      let userLearnings;
      [memory, userLearnings] = await internalMonologue(
        memory,
        {
          instructions: `What has bumbles learned specifically about their chat companion from the last few messages?`,
          verb: "noted",
        }
      )
      log("Learnings:", userLearnings)
      const [, notes] = await userNotes(memory, userName)
      userModel.current = notes
    }
  }

  lastProcessed.current = (unprocessedMessages.slice(-1).memories[0]?.metadata?.discordMessage as any).id || ""

  // no memories on the users for now
  return workingMemory
}

export default modelsChatters
