import { Message } from '../../models/Message'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const channel = query.channel as string
  if (!channel) return []

  const msgs = await Message.find({ channel })
    .sort({ createdAt: 1 })
    .limit(500)
    .lean()
  return msgs.map(m => ({
    id: m._id.toString(),
    type: m.type,
    from: m.from,
    fromId: m.fromId,
    to: m.to,
    content: m.content,
    time: m.time,
    model: m.model,
    event: m.event,
    streaming: false
  }))
})
