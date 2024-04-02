import { ChatMessageRoleEnum, MentalProcess, useActions, usePerceptions, useSoulMemory } from "@opensouls/engine";
import { defaultEmotion } from "./subprocesses/emotionalSystem.js";
import brainstorm from "./cognitiveSteps/brainstorm.js";
import externalDialog from "./cognitiveSteps/externalDialog.js";

const gainsTrustWithTheUser: MentalProcess = async ({ workingMemory }) => {
  const { log, dispatch } = useActions()
  const { invokingPerception, pendingPerceptions } = usePerceptions()
  log("pendingPerceptions", pendingPerceptions.current)

  log("env: ", soul.env)

  if (pendingPerceptions.current.length > 0) {
    log("I'm busy right now.")
    return workingMemory
  }

  const discordMessage = invokingPerception?._metadata?.discordMessage as any
  const userName = discordMessage?.username || "Anonymous"
  const userModel = useSoulMemory(userName, "")

  // this is here to set a default.
  const bumblesEmotions = useSoulMemory("emotionalState", defaultEmotion)

  // if (Math.random() > 0.5) {

  const [, emojis] = await brainstorm(workingMemory, "What emoji should Bumbles use to react to the last message")

    dispatch({
      action: "reacts",
      content: emojis[0],
      _metadata: {
        helloWorld: true,
      }
    })
  // }

  let memory = userModel.current ?
    workingMemory.withMemory({
      role: ChatMessageRoleEnum.Assistant,
      content: `Bumbles remembers this about ${userName}:\n${userModel.current}`
    }) :
    workingMemory

  log(`Bumbles remembers this about ${userName}:\n${userModel.current}`)

  const [withExternalDialog, stream] = await externalDialog(
    memory,
    `Bumble feels ${bumblesEmotions.current.emotion}. She wants to engage with everyone and understand them better.`,
    { model: "quality", stream: true }
  )
  
  dispatch({
    action: "says",
    content: stream,
    _metadata: {
      helloWorld: "works!",
    }
  })
  // speak(stream);
  await withExternalDialog.finished

  return workingMemory.concat(withExternalDialog.slice(-1))
}

export default gainsTrustWithTheUser
