import express from 'express'
import bcrypt from 'bcryptjs'
import expressAsyncHandler from 'express-async-handler'

import User from '../models/userModel.js'
import { isAuth, isAdmin, generateToken } from '../utils.js'

const userRouter = express.Router()

userRouter.get(
  '/',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const users = await User.find({})
    res.send(users)
  }),
)

userRouter.get(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
      res.send(user)
    } else {
      res.status(404).send({ message: 'User Not Found' })
    }
  }),
)

userRouter.put(
  '/:id',
  isAuth,
  isAdmin,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      user.isAdmin = Boolean(req.body.isAdmin)
      const updatedUser = await user.save()
      res.send({ message: 'User Updated', user: updatedUser })
    } else {
      res.status(404).send({ message: 'User Not Found' })
    }
  }),
)

userRouter.post(
  '/signin',
  expressAsyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email })
    if (user) {
      if (bcrypt.compareSync(req.body.password, user.password)) {
        res.send({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user),
        })
        return
      }
    }
    res.status(401).send({ message: 'Invalid email or password' })
  }),
)

userRouter.post('/signup', async (req, res) => {
  try {
    const userExists = await User.findOne({ email: req.body.email })
    if (userExists) {
      return res
        .status(200)
        .send({ message: 'Usuário já existe', success: false })
    }
    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    req.body.password = hashedPassword
    const newuser = new User(req.body)
    await newuser.save()
    res
      .status(200)
      .send({ message: 'Usuário criado com sucesso', success: true })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .send({ message: 'Erro ao criar o usuário', success: false, error })
  }
})

userRouter.put(
  '/profile',
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (user) {
      user.name = req.body.name || user.name
      user.email = req.body.email || user.email
      if (req.body.password) {
        user.password = bcrypt.hashSync(req.body.password, 8)
      }

      const updatedUser = await user.save()
      res.send({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser),
      })
    } else {
      res.status(404).send({ message: 'User not found' })
    }
  }),
)

export default userRouter
