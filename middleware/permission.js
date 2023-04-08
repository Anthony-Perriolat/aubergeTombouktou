const { PrismaClient } = require('@prisma/client');

module.exports = () => {
    return (req, res, next) => {
    const prisma = new PrismaClient();
      prisma.findById()
      // Vérifiez si l'utilisateur a la permission requise
      if (req.auth.permissions && req.user.permissions.includes(process.env.CODE_PERMISSION)) {
        next(); // L'utilisateur a la permission, passez au middleware suivant
      } else {
        res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." });
      }
    };
  };