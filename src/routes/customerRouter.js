import express from 'express'
import expressAsyncHandler from 'express-async-handler'

import Customer from '../models/customerModel.js'
import { isAuth, isAdmin } from '../utils.js'

const customerRouter = express.Router()

customerRouter.post(
  '/create-customer',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newcustomer = new Customer({
      name: req.body.name,
      email: req.body.email,
      social: req.body.social,
      address: req.body.address,
      phone: req.body.phone,
      city: req.body.city,
    })
    const customer = await newcustomer.save()
    res.send({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      social: customer.social,
      address: customer.address,
      phone: customer.phone,
      city: customer.city,
    })
  }),
)

customerRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const customerId = req.params.id
    const customer = await Customer.findById(customerId)
    if (customer) {
      customer.name = req.body.name
      customer.email = req.body.email
      customer.social = req.body.social
      customer.address = req.body.address
      customer.phone = req.body.phone
      customer.city = req.body.city
      await customer.save()
      res.send({ message: 'Customer Updated' })
    } else {
      res.status(404).send({ message: 'Cliente Não encontrado' })
    }
  }),
)

customerRouter.get('/:id', async (req, res) => {
  const customer = await Customer.findById(req.params.id)
  if (customer) {
    res.send(customer)
  } else {
    res.status(404).send({ message: 'Cliente Não Encontrado' })
  }
})

// Rota GET para listar todos os clientes
customerRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const customers = await Customer.find({}) // Busca todos os clientes no banco de dados
    res.send(customers)
  }),
)

export default customerRouter
