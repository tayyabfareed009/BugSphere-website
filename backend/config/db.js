
import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true)

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 120000, // 2 minutes
      socketTimeoutMS: 120000,
      connectTimeoutMS: 120000,
      maxPoolSize: 10,
      family: 4
    })

    console.log('MongoDB Connected')
  } catch (err) {
    console.error(err)
    throw err
  }
}