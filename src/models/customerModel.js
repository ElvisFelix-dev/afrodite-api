import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    social: { type: String, required: true, unique: true },
    address: { type: String, required: true, unique: true },
    city: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    cpf: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
)

const Customer = mongoose.model('Customer', customerSchema)
export default Customer
