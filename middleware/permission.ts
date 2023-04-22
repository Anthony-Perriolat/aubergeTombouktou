import { PrismaClient, User } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user: User | null = await prisma.user.findUnique({ where: { id: req.auth.userId } });
    if (user && user.permission === process.env.CODE_PERMISSION) {
      next();
    } else {
      res.status(403).json({ message: "Vous n'êtes pas autorisé à accéder à cette ressource." });
    }
  } catch (error) {
    next();
  } finally {
    await prisma.$disconnect();
  }
};