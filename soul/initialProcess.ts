import { externalDialog, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessManager } from "soul-engine";
import shouts from "./mentalProcesses/shouts.js";

const gainsTrustWithTheUser: MentalProcess = async ({ step: initialStep }) => {
  const { speak, log } = useActions()
  const { setNextProcess } = useProcessManager()

  const { stream, nextStep } = await initialStep.next(
    externalDialog("Bumbles wants to know everything about the person she's talking to."),
    { stream: true, model: "quality" }
  );
  speak(stream);

  const lastStep = await nextStep
  const shouldShout = await lastStep.compute(
    mentalQuery("The interlocuter is being rude")
  )
  log("User attacked soul?", shouldShout)
  if (shouldShout) {
    setNextProcess(shouts)
  }

  return lastStep
}

export default gainsTrustWithTheUser
