import express from 'express'
import expressAsyncHandler from 'express-async-handler'

import Customer from '../models/customerModel.js'
import Product from '../models/productModel.js'
import Order from '../models/orderModel.js'

import { isAuth, isAdmin } from '../utils.js'

const orderRouter = express.Router()

orderRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find().populate()
    res.send(orders)
  }),
)

orderRouter.post(
  '/',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const newOrder = new Order({
      orderItems: req.body.orderItems.map((x) => ({ ...x, product: x._id })),
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      itemsPrice: req.body.itemsPrice,

      totalPrice: req.body.totalPrice,
    })

    const order = await newOrder.save()
    res.status(201).send({ message: 'Nova Compra Criada', order })
  }),
)

orderRouter.get(
  '/summary',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          numOrders: { $sum: 1 },
          totalSales: { $sum: '$totalPrice' },
        },
      },
    ])
    const users = await Customer.aggregate([
      {
        $group: {
          _id: null,
          numCustomers: { $sum: 1 },
        },
      },
    ])
    const dailyOrders = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          orders: { $sum: 1 },
          sales: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
    ])
    const productCategories = await Product.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ])
    res.send({ users, orders, dailyOrders, productCategories })
  }),
)

orderRouter.get(
  '/mine',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const orders = await Order.find({ user: req.user._id })
    res.send(orders)
  }),
)

orderRouter.get(
  '/:id',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (order) {
      res.send(order)
    } else {
      res.status(404).send({ message: 'Compra não encontrada' })
    }
  }),
)

orderRouter.put(
  '/:id/deliver',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (order) {
      order.isDelivered = true
      order.deliveredAt = Date.now()
      await order.save()
      res.send({ message: 'Compra Finalizada' })
    } else {
      res.status(404).send({ message: 'Compra não encontrada' })
    }
  }),
)

orderRouter.put(
  '/:id/pay',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
    if (order) {
      order.isPaid = true
      order.paidAt = Date.now()
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
      }

      const updatedOrder = await order.save()
      res.send({ message: 'Compra Paga', order: updatedOrder })
    } else {
      res.status(404).send({ message: 'Compra não encontrada' })
    }
  }),
)

/* orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate(
      'user',
      'email name',
    )
    if (order) {
      await order.deleteOne()
      res.send({ message: 'Pedido apagado' })
    } else {
      res.status(404).send({ message: 'Compra não encontrada' })
    }
  }),
) */

orderRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)

    if (!order) {
      return res.status(404).send({ message: 'Order não encontrada' })
    }

    await order.deleteOne()

    return res.send({ message: 'Order apagada' })
  }),
)

export default orderRouter
