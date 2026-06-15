import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  channel: { type: String, required: true, index: true },
  type: { type: String, required: true },
  from: String,
  fromId: String,
  to: String,
  content: { type: String, default: '' },
  time: { type: String, required: true },
  model: String,
  event: String,
  streaming: Boolean
}, { timestamps: true })

export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema)
