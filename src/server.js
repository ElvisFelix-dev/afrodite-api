import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import cors from 'cors'

import customerRouter from './routes/customerRouter.js'
import userRouter from './routes/userRouter.js'
import orderRouter from './routes/OrderRouter.js'
import uploadRouter from './routes/uploadRouter.js'
import seedRouter from './routes/seedRouter.js'
import productRouter from './routes/productRouter.js'

dotenv.config()

const app = express()

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('📊 connected to db')
  })
  .catch((err) => {
    console.log(err.message)
  })

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/api/keys/paypal', (req, res) => {
  res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use('/api/user', userRouter)
app.use('/api/customer', customerRouter)
app.use('/api/orders', orderRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/seed', seedRouter)
app.use('/api/products', productRouter)

app.listen(3333, () => {
  console.log(`💻 server running`)
})
