import { Message } from '../../models/Message'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const doc = await Message.create({
    channel: body.channel,
    type: body.type,
    from: body.from,
    fromId: body.fromId,
    to: body.to,
    content: body.content,
    time: body.time,
    model: body.model,
    event: body.event,
    streaming: body.streaming
  })
  return { id: doc._id.toString() }
})
