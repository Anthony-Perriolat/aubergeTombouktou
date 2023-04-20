import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.replace('Bearer ', '');
      if (!token) {
        throw new Error('Missing token');
      }
      const decodedToken = jwt.verify(token, `process.env.TOKEN_SECRET`) as JwtPayload;
      const userId:number = decodedToken.userId;
      if (userId) {
        // On ajoute la propriété "auth" à l'objet "req"
        const auth = req.auth!;
        auth.userId = userId ;
      }
      next();
    } else {
      throw new Error('Missing authorization header');
    }

  } catch (error) {
    res.status(401).json({ error: error, message: "error auth" });
  }
};