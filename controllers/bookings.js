const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getBookingById = async (req, res, next) => {
    const id = req.params.id
    try {
        const result = await prisma.booking.findUnique({
            where: {
                id: Number(id),
            },
        })
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
exports.getAllBookings = async (req, res, next) => {
    try {
        const result = await prisma.booking.findMany()
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
exports.createBooking = async (req, res, next) => {
    const dataToCreate = req.body.data
    try {
        const result = await prisma.booking.create({
            data: dataToCreate,
        })
        res.status(201).json(result);
    } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
exports.updateBooking = async (req, res, next) => {
    const id = req.params.id
    const dataToUpdate = req.body.data
    try {
        const result = await prisma.booking.update({
            where: { id: Number(id) },
            data: dataToUpdate,
        })
        res.status(201).json(result);
    } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
exports.deleteBooking = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await prisma.booking.delete({
            where: {
                id: Number(id),
            },
        })
        res.status(201).json(result)
    } catch {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
