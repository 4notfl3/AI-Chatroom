import mongoose from 'mongoose'

export default defineNitroPlugin(() => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/chatroom'
  mongoose.connect(uri, { serverSelectionTimeoutMS: 3000, connectTimeoutMS: 3000 })
    .then(() => console.log('MongoDB connected'))
    .catch(() => console.warn('MongoDB 未连接，消息不会持久化'))
})
