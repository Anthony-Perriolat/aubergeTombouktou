import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { ValidateEmail } from '../lib/regex';
import prisma from '../client';
import moment = require('moment');

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
    }
}

export const getMyBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await prisma.booking.findMany({ where: { userId: req.auth.userId } })
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}

export const getAllBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const result = await prisma.booking.findMany()
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const dataToCreate = req.body.data;
    if (!ValidateEmail(dataToCreate.email)) {
        res.status(400).json({ message: 'e-mail invalide' });
    } else {
        try {
            if (dataToCreate.dateCheckIn > dataToCreate.dateCheckOut) {
                res.status(400).json({ message: "DateCheckIn doit être inferieur à DateCheckOut" })
            } else {
                const ifRoomIsUnavailable = await prisma.booking.findFirst({
                    where: {
                        AND: [
                            { roomId: dataToCreate.roomId },
                            { dateCheckIn: { gte: dataToCreate.dateCheckIn, lt: dataToCreate.dateCheckOut } },
                            { dateCheckOut: { gt: dataToCreate.dateCheckIn, lte: dataToCreate.dateCheckOut, } }
                        ]
                    },
                })
                if (ifRoomIsUnavailable) {
                    res.status(409).json({ message: "Une reservation est déjà en place pour les dates demandés" })
                } else {
                    const result = await prisma.booking.create({
                        data: dataToCreate,
                    })
                    res.status(201).json(result);
                }
            }
        } catch (error) {
            // gestion de l'erreur
            res.status(500).json({ error: 'Une erreur est survenue.' });
        }
    }
}

export const updateBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = Number(req.params.id);
    const dataToUpdate = req.body.data;
    if (!ValidateEmail(dataToUpdate.email)) {
        res.status(400).json({ message: 'e-mail invalide' });
    } else {
        try {
            if (dataToUpdate.dateCheckIn > dataToUpdate.dateCheckOut) {
                res.status(400).json({ message: "DateCheckIn doit être inferieur à DateCheckOut" })
            } else {
                const ifRoomIsUnavailable = await prisma.booking.findFirst({
                    where: {
                        AND: [
                            { roomId: dataToUpdate.roomId },
                            { dateCheckIn: { gte: dataToUpdate.dateCheckIn, lt: dataToUpdate.dateCheckOut } },
                            { dateCheckOut: { gt: dataToUpdate.dateCheckIn, lte: dataToUpdate.dateCheckOut, } }
                        ]
                    },
                })
                console.log(ifRoomIsUnavailable)
                if (ifRoomIsUnavailable) {
                    res.status(409).json({ message: "Une reservation est déjà en place pour les dates demandés" })
                } else {
                const result = await prisma.booking.updateMany({
                    where: { id:id, userId: req.auth.userId },
                    data: dataToUpdate,
                })
                    res.status(201).json(result);
                }
            }
        } catch (error) {
            // gestion de l'erreur
            res.status(500).json({ error: 'Une erreur est survenue.' });
        }
    }
    // if (dataToUpdate.email) {
    //     ValidateEmail(dataToUpdate.email) ? null : res.status(400).json({ message: "e-mail invalide" })
    // } else {
    //     try {
    //         const ifRoomIsUnavailable = await prisma.booking.findFirst({
    //             where: {
    //                 AND: [
    //                     { roomId: dataToUpdate.roomId },
    //                     { dateCheckIn: { gte: dataToUpdate.dateCheckIn, lt: dataToUpdate.dateCheckOut } },
    //                     { dateCheckOut: { gt: dataToUpdate.dateCheckIn, lte: dataToUpdate.dateCheckOut, } }
    //                 ]
    //             },
    //         })
    //         console.log(ifRoomIsUnavailable)

    //         if (ifRoomIsUnavailable) {
    //             console.log("409")
    //             res.status(409).json({ message: "Une reservation est déjà en place pour les dates demandés" })
    //         } else {
    //             const result = await prisma.booking.updateMany({
    //                 where: { id, userId: req.auth.userId },
    //                 data: dataToUpdate,
    //             })
    //             res.status(201).json(result);
    //         }
    //     }
    //     catch (error) {
    //         res.status(500).json({ error: 'Une erreur est survenue.' });
            
    //     }
    // } 
}
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
    }
}
