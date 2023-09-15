import mongoose from 'mongoose'

const orderSchema = new mongoose.Schema(
  {
    orderItems: [
      {
        slug: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        image: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
      },
    ],

    paymentMethod: { type: String, required: true },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
    },
  },
  {
    timestamps: true,
  },
)

const Order = mongoose.model('Order', orderSchema)

export default Order
