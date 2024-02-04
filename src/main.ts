import { createServer } from "node:http"
import { readFileSync } from "node:fs"
import {
  createApp,
  eventHandler,
  fromNodeMiddleware,
  toNodeListener,
  readBody,
  getQuery,
  createRouter,
  createError
} from "h3"
import { GoogleGenerativeAI, HarmBlockThreshold } from "@google/generative-ai"
import {
  generationConfig,
  getMessage,
  getSafetyConfig
} from "./utils/functions"
import User from "./structures/User"

const MODEL_NAME = "gemini-pro"
const API_KEY = process.env.GOOGLE_AI_STUDIO_KEY

const genAI = new GoogleGenerativeAI(API_KEY)
const model = genAI.getGenerativeModel({ model: MODEL_NAME })

const properties = JSON.parse(readFileSync("./config.json", "utf-8"))

async function runChat(
  id: string,
  message: string,
  config = {
    generation: generationConfig,
    safety: getSafetyConfig(HarmBlockThreshold.BLOCK_NONE)
  }
) {
  const user = new User(id)

  const userHistory = await user.getHistory()

  const history = [...properties.definedHistory, ...userHistory]

  const chat = model.startChat({
    generationConfig: config.generation,
    safetySettings: config.safety,
    history
  })

  try {
    const result = await chat.sendMessage(message)
    const response = result.response

    if (response?.promptFeedback?.blockReason)
      return getMessage(response?.promptFeedback?.blockReason)

    const text = response.text()
    if (!text.length) throw new Error("Empty response")

    user.append([
      {
        role: "user",
        parts: [{ text: message }]
      },
      {
        role: "model",
        parts: [{ text: text }]
      }
    ])

    await user.save()

    return text
  } catch (error) {
    return "Üzgünüm, şu anda cevap veremiyorum."
  }
}

const app = createApp()

const router = createRouter()
  .post(
    "/ask",
    eventHandler(async (event) => {
      const { id, message, allowNsfw } = await readBody(event)
      const answer = await runChat(id, message, {
        generation: generationConfig,
        safety: getSafetyConfig(
          allowNsfw
            ? HarmBlockThreshold.BLOCK_NONE
            : HarmBlockThreshold.BLOCK_ONLY_HIGH
        )
      })
      return { answer }
    })
  )
  .get(
    "/history",
    eventHandler(async (event) => {
      const { id } = (await getQuery(event)) as { id: string }

      if (!id)
        return createError({
          statusCode: 400,
          statusMessage: "Bad Request",
          data: {
            missing: ["id"]
          }
        })

      const user = new User(id)
      const history = await user.getHistory()

      return history
    })
  )

app
  .use(
    fromNodeMiddleware((req, res, next) => {
      const token = req.headers.authorization
      if (!token || token !== process.env.WEB_TOKEN)
        return createError({
          statusCode: 401,
          statusMessage: "Unauthroized"
        })
      next()
    })
  )
  .use(router)

createServer(toNodeListener(app)).listen(process.env.PORT || 3000, () => {
  console.log("Listening on port " + process.env.PORT || 3000)
})
