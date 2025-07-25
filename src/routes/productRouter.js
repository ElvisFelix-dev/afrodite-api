import express from 'express'
import expressAsyncHandler from 'express-async-handler'

import Product from '../models/productModel.js'
import { isAuth, isAdmin } from '../utils.js'

const productRouter = express.Router()

productRouter.get('/', async (req, res) => {
  const products = await Product.find()
  res.send(products)
})

productRouter.post(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const newProduct = new Product({
      name: 'sample name ' + Date.now(),
      slug: 'sample-name-' + Date.now(),
      image: '/images/p1.jpg',
      size: 'PP',
      codings: 'blusa-01',
      price: 0,
      priceIncome: 0,
      priceOutcome: 0,
      category: 'sample category',
      brand: 'sample brand',
      countInStock: 0,
      description: 'sample description',
    })
    const product = await newProduct.save()
    res.send({ message: 'Produto Criado', product })
  }),
)

productRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const productId = req.params.id
    const product = await Product.findById(productId)
    if (product) {
      product.name = req.body.name
      product.slug = req.body.slug
      product.price = req.body.price
      product.codings = req.body.codings
      product.image = req.body.image
      product.size = req.body.size
      product.category = req.body.category
      product.brand = req.body.brand
      product.countInStock = req.body.countInStock
      product.description = req.body.description
      await product.save()
      res.send({ message: 'Product Updated' })
    } else {
      res.status(404).send({ message: 'Product Not Found' })
    }
  }),
)

productRouter.delete(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).send({ message: 'Product Not Found' })
    }

    await product.deleteOne()

    return res.send({ message: 'Product Deleted' })
  }),
)

const PAGE_SIZE = 30

productRouter.get(
  '/admin',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const { query } = req
    const page = query.page || 1
    const pageSize = query.pageSize || PAGE_SIZE

    const products = await Product.find()
      .skip(pageSize * (page - 1))
      .limit(pageSize)
    const countProducts = await Product.countDocuments()
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    })
  }),
)

productRouter.get(
  '/search',
  expressAsyncHandler(async (req, res) => {
    const { query } = req
    const pageSize = query.pageSize || PAGE_SIZE
    const page = query.page || 1
    const codings = query.codings || ''
    const category = query.category || ''
    const price = query.price || ''
    const rating = query.rating || ''
    const order = query.order || ''
    const searchQuery = query.query || ''

    const queryFilter =
      searchQuery && searchQuery !== 'all'
        ? {
            name: {
              $regex: searchQuery,
              $options: 'i',
            },
          }
        : {}
    const codingFilter = codings && codings !== 'all' ? { codings } : {}
    const categoryFilter = category && category !== 'all' ? { category } : {}
    const ratingFilter =
      rating && rating !== 'all'
        ? {
            rating: {
              $gte: Number(rating),
            },
          }
        : {}
    const priceFilter =
      price && price !== 'all'
        ? {
            // 1-50
            price: {
              $gte: Number(price.split('-')[0]),
              $lte: Number(price.split('-')[1]),
            },
          }
        : {}
    const sortOrder =
      order === 'featured'
        ? { featured: -1 }
        : order === 'lowest'
        ? { price: 1 }
        : order === 'highest'
        ? { price: -1 }
        : order === 'toprated'
        ? { rating: -1 }
        : order === 'newest'
        ? { createdAt: -1 }
        : { _id: -1 }

    const products = await Product.find({
      ...queryFilter,
      ...categoryFilter,
      ...codingFilter,
      ...priceFilter,
      ...ratingFilter,
    })
      .sort(sortOrder)
      .skip(pageSize * (page - 1))
      .limit(pageSize)

    const countProducts = await Product.countDocuments({
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    })
    res.send({
      products,
      countProducts,
      page,
      pages: Math.ceil(countProducts / pageSize),
    })
  }),
)

productRouter.get(
  '/categories',
  expressAsyncHandler(async (req, res) => {
    const categories = await Product.find().distinct('category')
    res.send(categories)
  }),
)

productRouter.get(
  '/codings',
  expressAsyncHandler(async (req, res) => {
    const codings = await Product.find().distinct('codings')
    res.send(codings)
  }),
)

productRouter.get(
  '/codings/:codings',
  expressAsyncHandler(async (req, res) => {
    const codings = req.params.codings // Obtém o valor do parâmetro da URL
    const product = await Product.findOne({ codings })
    if (product) {
      res.send(product)
    } else {
      res.status(404).send({ message: 'Codigo não encontrado' })
    }
  }),
)

productRouter.get('/slug/:slug', async (req, res) => {
  const product = await Product.findOne({ slug: { $eq: req.params.slug } })

  if (product) {
    res.send(product)
  } else {
    res.status(404).send({ message: 'Product not found' })
  }
})

productRouter.get('/:id', async (req, res) => {
  const product = await Product.findById(req.params.id)
  if (product) {
    res.send(product)
  } else {
    res.status(404).send({ message: 'Product Not Found' })
  }
})

export default productRouter
