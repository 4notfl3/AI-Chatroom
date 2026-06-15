import mongoose from 'mongoose'

export default defineNitroPlugin(async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/chatroom'
  try {
    await mongoose.connect(uri)
    console.log('MongoDB connected')
  } catch (e) {
    console.error('MongoDB connection failed:', e)
  }
})
