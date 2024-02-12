import { ChatMessageRoleEnum, brainstorm, externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, usePerceptions, useProcessManager, useSoulMemory } from "soul-engine";
import shouts from "./mentalProcesses/shouts.js";
import { defaultEmotion } from "./subprocesses/emotionalSystem.js";

const gainsTrustWithTheUser: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log, dispatch } = useActions()
  const { setNextProcess } = useProcessManager()
  const { invokingPerception, pendingPerceptions } = usePerceptions()

  const discordMessage = invokingPerception?._metadata?.discordMessage as any
  const userName = discordMessage?.username || "Anonymous"
  const userModel = useSoulMemory(userName, "")

  // this is here to set a default.
  const bumblesEmotions = useSoulMemory("emotionalState", defaultEmotion)

  const emojis = await initialStep.compute(brainstorm("What emoji should Bumbles use to react to the last message"))
  dispatch({
    action: "reacts",
    content: emojis[0],
    _metadata: {
      helloWorld: true,
    }
  })

  let step = userModel.current ? 
    initialStep.withMemory([{
      role: ChatMessageRoleEnum.Assistant,
      content: `Bumbles remembers this about ${userName}:\n${userModel.current}`
    }]) :
    initialStep

  log(`Bumbles remembers this about ${userName}:\n${userModel.current}`)

  const { stream, nextStep } = await step.next(
    externalDialog(`Bumble feels ${bumblesEmotions.current.emotion}. She wants to engage with everyone and understand them better.`),
    { stream: true, model: "quality" }
  );
  dispatch({
    action: "says",
    content: stream,
    _metadata: {
      helloWorld: "works!",
    }
  })
  // speak(stream);

  let lastStep = initialStep.withMemory((await nextStep).memories.slice(-1))

  const shouldShout = await lastStep.compute(
    mentalQuery("The interlocuter is being rude")
  )
  log("User attacked bumbles?", shouldShout)
  if (shouldShout) {
    setNextProcess(shouts)
  }

  return lastStep
}

export default gainsTrustWithTheUser
