import { ChatMessageRoleEnum, brainstorm, externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, usePerceptions, useProcessManager, useSoulMemory } from "soul-engine";
// import shouts from "./mentalProcesses/shouts.js";
import { defaultEmotion } from "./subprocesses/emotionalSystem.js";

const gainsTrustWithTheUser: MentalProcess = async ({ step: initialStep }) => {
  const { log, dispatch } = useActions()
  const { invocationCount } = useProcessManager()
  const { invokingPerception, pendingPerceptions } = usePerceptions()
  log("pendingPerceptions", pendingPerceptions.current)

  log("env: ", soul.env)

  let step = initialStep

  if (invocationCount === 0) {
    step = step.withMemory([
      {
        role: ChatMessageRoleEnum.Assistant,
        content: `This is the start of a new conversation.`,
        metadata: {
          conversationSummary: true,
        }
      },
    ])
  }

  if (pendingPerceptions.current.length > 0) {
    log("I'm busy right now.")
    return step
  }

  const discordMessage = invokingPerception?._metadata?.discordMessage as any
  const userName = discordMessage?.username || "Anonymous"
  const userModel = useSoulMemory(userName, "")

  // this is here to set a default.
  const bumblesEmotions = useSoulMemory("emotionalState", defaultEmotion)

  // if (Math.random() > 0.5) {
    const emojis = await step.compute(brainstorm("What emoji should Bumbles use to react to the last message"))
    dispatch({
      action: "reacts",
      content: emojis[0],
      _metadata: {
        helloWorld: true,
      }
    })
  // }

  step = userModel.current ?
    step.withMemory([{
      role: ChatMessageRoleEnum.Assistant,
      content: `Bumbles remembers this about ${userName}:\n${userModel.current}`
    }]) :
    step

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

  let lastStep = step.withMemory((await nextStep).memories.slice(-1))

  return lastStep
}

export default gainsTrustWithTheUser
