
import { MentalProcess, indentNicely, useActions, useSoulMemory, z } from "@opensouls/engine";
import { humanEmotions } from "../lib/emotions.js";
import { html } from "common-tags";
import internalMonologue from "../cognitiveSteps/internalMonologue.js";
import decision from "../cognitiveSteps/decision.js";

export const defaultEmotion = {
  emotion: "happy",
  why: "Bumbles is happy to be chatting with folks."
}

const emotionalSystem: MentalProcess = async ({ workingMemory }) => {
  const { log } = useActions()
  const bumblesEmotions = useSoulMemory("emotionalState", defaultEmotion)

  const [withEmotionalFeeling, emotion] = await internalMonologue(
    workingMemory,
    {
      instructions: indentNicely`
        Bumbles currently feels: ${bumblesEmotions.current.emotion}.
        Has anything happened that would change how Bumbles feels?
        Respond with how Bumbles is feeling. Make sure to include one of these emotions: ${humanEmotions.join(", ")} and a very short sentence as to why she feels that way.
      `,
      verb: "felt",
    }
  )

  log("Bumbles' feelings", emotion)
  const [, extractedEmotion] = await decision(
    withEmotionalFeeling,
    {
      description: "Extract the emotion that Bumbles just said they are feeling.",
      choices: humanEmotions as z.EnumValues,
    },
  )

  bumblesEmotions.current = {
    emotion: extractedEmotion.toString(),
    why: emotion
  }

  log("Bumbles' emotions", bumblesEmotions.current)

  // no memories on the users for now
  return workingMemory
}

export default emotionalSystem
