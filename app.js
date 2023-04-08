const express = require('express')
const path = require('path')
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

const app = express()

app.use(express.json())


// // Middleware to add the Prisma client to the request object
// app.use(async (req, res, next) => {
//   req.context = {
//     prisma,
//   };
//   next();
// });
// 
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
//     next();
// });



const usersRoutes = require('./routes/users')
const bookingsRoutes = require('./routes/bookings')
const categoriesArticleRoutes = require('./routes/categoriesArticle')
const roomsRoutes = require('./routes/rooms')
const articlesRoutes = require('./routes/articles')


// const userRoutes = require('./routes/user')
// app.use('/api/auth', userRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/bookings', bookingsRoutes)
app.use('/api/categoriesArticle', categoriesArticleRoutes)
app.use('/api/rooms', roomsRoutes)
app.use('/api/articles', articlesRoutes)

app.use('/images', express.static(path.join(__dirname, 'images')))

app.get('*', (req, res) => {
    res.status(404).send("Désolé, cette page n'existe pas!");
  });

module.exports = app