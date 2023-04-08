const { PrismaClient } = require('@prisma/client');

module.exports = async (req, res, next) => {
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({ where: { id: req.auth.userId } })
  if(user.permission === process.env.CODE_PERMISSION) {
    next()
  } else {
    res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." })
  }
};