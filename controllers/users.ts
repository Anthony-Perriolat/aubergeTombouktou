/// <reference path="../middleware/index.d.ts" />
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {
  sendMailWelcome,
  sendMailGoodbye,
  sendMailUpdateEmail
} from '../lib/senderMail';
import { ValidateEmail } from '../lib/regex';
import { Request, Response } from 'express';
import prisma from '../client';






export const getMyUser = async (req: Request, res: Response) => {
  const idMyUser = req.auth.userId;
  try {
    const result = await prisma.user.findUnique({
      where: {
        id: idMyUser,
      },
    });
    if (!result) {
      // gestion de l'erreur si aucun utilisateur n'est trouvé
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }
    const { password, ...fieldUser } = result
    // delete result.password;
    res.status(200).json(fieldUser);
  } catch {
    // gestion de l'erreur
    res.status(500).json({ error: 'Une erreur est survenue.' });
  } finally {
    await prisma.$disconnect();
  }
};


export const updateMyUser = async (req: Request, res: Response) => {
  const idMyUser = req.auth.userId;
  const dataToUpdate = req.body.data;
  if (dataToUpdate.email) {
    ValidateEmail(dataToUpdate.email) ? null : res.status(400).json({ message: 'e-mail invalide' });
  }
  try {
    const result = await prisma.user.update({
      where: { id: Number(idMyUser) },
      data: dataToUpdate,
    });
    dataToUpdate['email'] ? sendMailUpdateEmail({ nameUser: `${result.lastName} ${result.firstName}`, email: result.email }) : null;
    res.status(201).json(result);
  } catch (error) {
    // gestion de l'erreur
    res.status(500).json({ error: 'Une erreur est survenue.' });
  } finally {
    await prisma.$disconnect();
  }
};


export const deleteMyUser = async (req: Request, res: Response) => {
  const idMyUser = req.auth.userId;
  try {
    const result = await prisma.user.delete({
      where: {
        id: Number(idMyUser),
      },
    });
    const { password, ...fieldUser } = result
    sendMailGoodbye({ nameUser: `${result.lastName} ${result.firstName}`, email: result.email });
    res.status(201).json(fieldUser);
  } catch {
    // gestion de l'erreur
    res.status(500).json({ error: 'Une erreur est survenue.' });
  } finally {
    await prisma.$disconnect();
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await prisma.user.findMany();
    res.status(200).json(result);
  } catch {
    // gestion de l'erreur
    res.status(500).json({ error: 'Une erreur est survenue.' });
  } finally {
    await prisma.$disconnect();
  }
};
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body.data;

  if (!ValidateEmail(email)) {
    res.status(400).json({ message: 'e-mail invalide' });
  }

  try {
    const foundUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!foundUser) {
      res.status(401).json({ message: 'mauvaise combinaison de mdp et mail' });
    }
    else {

      if (!foundUser.password) {
        res.status(400).json({ message: "Le mot de passe est vide" });
      }

      const valid = await bcrypt.compare(password, foundUser.password);

      if (!valid) {
        res.status(401).json({ message: 'mauvaise combinaison de mdp et mail' });
      }

      res.status(200).json({
        userId: foundUser.id,
        token: jwt.sign({ userId: foundUser.id }, `${process.env.TOKEN_SECRET}`, { expiresIn: process.env.TIME_LIVE_TOKEN }),
      });
    }

  } catch (err) {
    res.status(401).json({ message: 'mauvaise combinaison de mdp et mail' });
  } finally {
    await prisma.$disconnect();
  }
};


export const signUpUser = async (req: Request, res: Response): Promise<void> => {
  const { data } = req.body;

  try {
    if (!ValidateEmail(data.email)) {
      res.status(400).json({ message: 'e-mail invalide' });
    }
    else {
      const hash = await bcrypt.hash(data.password, 10);
      const result = await prisma.user.create({
        data: { ...data, password: hash },
      });
  
      sendMailWelcome({ nameUser: `${result.lastName} ${result.firstName}`, email: result.email });
  
      const { password, ...fieldUser } = result;
      res.status(201).json(fieldUser);
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "l'utilisateur existe déjà ou une erreur c'est produite" })
  } finally {
    await prisma.$disconnect();
  }
}
  
  export const updateUser = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id;
    const dataToUpdate = req.body.data;

    if (dataToUpdate.email) {
      ValidateEmail(dataToUpdate.email) ? null : res.status(400).json({ message: 'e-mail invalide' });
    }

    try {
      const result = await prisma.user.update({
        where: { id: Number(id) },
        data: dataToUpdate,
      });

      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Une erreur est survenue.' });
    } finally {
      await prisma.$disconnect();
    }
  };
