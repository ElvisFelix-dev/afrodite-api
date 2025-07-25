import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    brand: { type: String, required: true },
    category: { type: String, required: true },
    size: { type: String, required: true },
    codings: { type: String, required: true, unique: true },
    priceIncome: { type: Number, required: true, default: 0 },
    priceOutcome: { type: Number, required: true, default: 0 },
    description: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    countInStock: { type: Number, required: true, default: 0 },
  },
  {
    timestamps: true,
  },
)

const Product = mongoose.model('Product', productSchema)
export default Product
