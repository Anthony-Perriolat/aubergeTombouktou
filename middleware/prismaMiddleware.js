// const { PrismaClient } = require('@prisma/client');

// const prisma = new PrismaClient();

// const prismaMiddleware = (req, res, next) => {
//     console.log("before")
  
//     req.prisma = prisma;
//   console.log("crash after")
//   next();
// };

// const closePrismaMiddleware = async () => {
//   await prisma.$disconnect();
// };

// module.exports = { prismaMiddleware, closePrismaMiddleware };