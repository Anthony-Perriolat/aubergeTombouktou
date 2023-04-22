import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { ValidateEmail } from '../lib/regex';
import prisma from '../client';
import { sendMailCreateBooking } from '../lib/senderMail';
import Stripe from 'stripe';

const stripe = new Stripe(`${process.env.STRIPE_KEY_SECRET}`, {
    apiVersion: '2022-11-15',
});


export const getBookingById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = Number(req.params.id);
    try {
        const result = await prisma.booking.findFirst({
            where: {
                id: id,
                userId: req.auth.userId,
            },
            include: {
                room: true,
                user: true,
            }
        })
        if (!result) {
            res.status(404).json({ message: 'La reservation n\'existe pas' })
        } else {
            res.status(200).json(result);
        }
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    } finally {
        await prisma.$disconnect();
      }
}

export const getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await prisma.booking.findMany({ where: { userId: req.auth.userId } })
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    } finally {
        await prisma.$disconnect();
      }
}

export const getAllBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await prisma.booking.findMany()
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    } finally {
        await prisma.$disconnect();
      }
}
interface createBookingData {
    email: string,
    phone: string,
    dateCheckIn: Date,
    dateCheckOut: Date,
    personNumber: number,
    comment?: string,
    roomId: number,
}
export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dataToCreate: createBookingData = req.body.data;
    if (!ValidateEmail(dataToCreate.email)) {
        res.status(400).json({ message: 'e-mail invalide' });
    } else {
        const dateCheckInISO = new Date(dataToCreate.dateCheckIn).toISOString()
        const dateCheckOutISO = new Date(dataToCreate.dateCheckOut).toISOString()
        try {
            if (dateCheckInISO > dateCheckOutISO) {
                res.status(400).json({ message: "DateCheckIn doit être inferieur à DateCheckOut" })
            }
            const room = await prisma.room.findUnique({where:{id:dataToCreate.roomId}})
            if (dataToCreate.personNumber && room?.personNumberPerRoom && room.personNumberPerRoom < dataToCreate.personNumber) {
                res.status(400).json({ message: "le nombre de personne doit être inferieur à la capacité de la chambre" })
            } else {
                const ifRoomIsUnavailable = await prisma.booking.findFirst({
                    where: {
                        AND: [
                            { roomId: dataToCreate.roomId },
                            { dateCheckIn: { gte: dateCheckInISO, lt: dateCheckOutISO } },
                            { dateCheckOut: { gt: dateCheckInISO, lte: dateCheckOutISO, } }
                        ]
                    },
                })
                if (ifRoomIsUnavailable) {
                    res.status(409).json({ message: "Une reservation est déjà en place pour les dates demandés" })
                } else {
                    const room = await prisma.room.findUnique({ where: { id: (dataToCreate.roomId as number) } })
                    if (room) {
                        const timeDiff = Math.abs(new Date(dateCheckOutISO).getTime() - new Date(dateCheckInISO).getTime());
                        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        const amount = room.price * diffDays
                        const paymentIntent = await stripe.paymentIntents.create({
                            amount: amount,
                            currency: 'EUR',
                            description: `${room} pour ${dataToCreate.email} du ${dataToCreate.dateCheckIn} au ${dataToCreate.dateCheckOut} `,
                            payment_method_types: ['card'],
                        });
                        const result = await prisma.booking.create({
                            data: {
                                ...dataToCreate,
                                price: amount,
                                duration: diffDays,
                                userId: req.auth.userId,
                                roomId: dataToCreate.roomId,
                                // user: {
                                //     connect: { id: req.auth.userId }
                                // },
                                // room: {
                                //     connect: { id: dataToCreate.roomId }
                                // },
                                stripePaymentIntent: paymentIntent.id,
                            }
                        })
                        res.status(201).json(result);
                    }
                    else {
                        res.status(400).json({ message: "la chambre n'existe pas" })
                    }
                }
            }
        } catch (error) {
            // gestion de l'erreur
            res.status(500).json({ error: 'Une erreur est survenue.' });
        } finally {
            await prisma.$disconnect();
          }
    }
}
interface updateBookingData {
    email?: string,
    phone?: string,
    // dateCheckIn?: Date,
    // dateCheckOut?: Date,
    personNumber?: number,
    comment?: string,
    roomId: number,
}
export const updateBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = Number(req.params.id);
    const dataToUpdate: updateBookingData = req.body.data;
    if (dataToUpdate.email && !ValidateEmail(dataToUpdate.email)) {
        res.status(400).json({ message: 'e-mail invalide' });
    } else {
        try {
            const room = await prisma.room.findUnique({where:{id:dataToUpdate.roomId}})
            if (dataToUpdate.personNumber && room?.personNumberPerRoom && room.personNumberPerRoom < dataToUpdate.personNumber) {
                res.status(400).json({ message: "le nombre de personne doit être inferieur à la capacité de la chambre" })
            } else {
                    await prisma.booking.updateMany({
                        where: { id: id, userId: req.auth.userId, roomId: dataToUpdate.roomId },
                        data: dataToUpdate,
                    })
                    const result = prisma.booking.findUnique({where:{id:id}})
                    res.status(201).json(result);
            }
        } catch (error) {
            // gestion de l'erreur
            res.status(500).json({ error: 'Une erreur est survenue.' });
        } finally {
            await prisma.$disconnect();
          }
    }
    
}
// update with modify date
// if (dataToUpdate.dateCheckIn && dataToUpdate.dateCheckOut && new Date(dataToUpdate.dateCheckIn).toISOString() > new Date(dataToUpdate.dateCheckOut).toISOString()) {
//                 res.status(400).json({ message: "DateCheckIn doit être inferieur à DateCheckOut" })
//             } else {
//                 const ifRoomIsUnavailable = await prisma.booking.findFirst({
//                     where: {
//                         AND: [
//                             { roomId: dataToUpdate.roomId },
//                             { dateCheckIn: { gte: dataToUpdate.dateCheckIn, lt: dataToUpdate.dateCheckOut } },
//                             { dateCheckOut: { gt: dataToUpdate.dateCheckIn, lte: dataToUpdate.dateCheckOut, } }
//                         ]
//                     },
//                 })
//                 if (ifRoomIsUnavailable) {
//                     res.status(409).json({ message: "Une reservation est déjà en place pour les dates demandés" })
//                 } else {
//                     const result = await prisma.booking.updateMany({
//                         where: { id: id, userId: req.auth.userId, roomId: dataToUpdate.roomId },
//                         data: dataToUpdate,
//                     })
//                     res.status(201).json(result);
//                 }
//             }



export const deleteBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    try {
        const result = await prisma.booking.deleteMany({
            where: {
                id: Number(id),
                userId: req.auth.userId
            },
        });
        if (!result) {
            res.status(404).json({ message: 'La reservation n\'existe pas' })
        } else {
            res.status(201).json(result);
        }
        res.status(201).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    } finally {
        await prisma.$disconnect();
      }
}
