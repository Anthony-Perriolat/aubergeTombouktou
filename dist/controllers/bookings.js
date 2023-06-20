"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBooking = exports.updateBooking = exports.createBooking = exports.getAllBookingsPreview = exports.getAllBookings = exports.getMyBookings = exports.getBookingById = void 0;
const regex_1 = require("../lib/regex");
const client_1 = __importDefault(require("../client"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(`${process.env.STRIPE_KEY_SECRET}`, {
    apiVersion: '2022-11-15',
});
const getBookingById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    try {
        const result = yield client_1.default.booking.findFirst({
            where: {
                id: id,
                userId: req.auth.userId,
            },
            include: {
                room: true,
                user: true,
            }
        });
        if (!result) {
            res.status(404).json({ message: 'La reservation n\'existe pas' });
        }
        else {
            res.status(200).json(result);
        }
    }
    catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.getBookingById = getBookingById;
const getMyBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_1.default.booking.findMany({ where: { userId: req.auth.userId } });
        res.status(200).json(result);
    }
    catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.getMyBookings = getMyBookings;
const getAllBookings = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_1.default.booking.findMany();
        res.status(200).json(result);
    }
    catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.getAllBookings = getAllBookings;
const getAllBookingsPreview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    try {
        const result = yield client_1.default.booking.findMany({
            where: {
                roomId: Number(req.params.id),
                dateCheckIn: { gte: now },
            },
            select: {
                dateCheckIn: true,
                dateCheckOut: true,
            },
        });
        res.status(200).json(result);
    }
    catch (error) {
        // gestion de l'erreur
        res.status(500).json({ message: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.getAllBookingsPreview = getAllBookingsPreview;
const createBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const dataToCreate = req.body.data;
    if (!(0, regex_1.ValidateEmail)(dataToCreate.email)) {
        res.status(400).json({ message: 'e-mail invalide' });
    }
    else {
        const dateCheckInISO = new Date(dataToCreate.dateCheckIn).toISOString();
        const dateCheckOutISO = new Date(dataToCreate.dateCheckOut).toISOString();
        try {
            if (dateCheckInISO > dateCheckOutISO) {
                res.status(400).json({ message: "DateCheckIn doit être inferieur à DateCheckOut" });
            }
            const room = yield client_1.default.room.findUnique({ where: { id: dataToCreate.roomId } });
            if (dataToCreate.personNumber && (room === null || room === void 0 ? void 0 : room.personNumberPerRoom) && room.personNumberPerRoom < dataToCreate.personNumber) {
                res.status(400).json({ message: "le nombre de personne doit être inferieur à la capacité de la chambre" });
            }
            else {
                const ifRoomIsUnavailable = yield client_1.default.booking.findFirst({
                    where: {
                        AND: [
                            { roomId: dataToCreate.roomId },
                            { dateCheckIn: { gte: dateCheckInISO, lt: dateCheckOutISO } },
                            { dateCheckOut: { gt: dateCheckInISO, lte: dateCheckOutISO, } }
                        ]
                    },
                });
                if (ifRoomIsUnavailable) {
                    res.status(409).json({ message: "Une reservation est déjà en place pour les dates demandés" });
                }
                else {
                    const room = yield client_1.default.room.findUnique({ where: { id: dataToCreate.roomId } });
                    if (room) {
                        const timeDiff = Math.abs(new Date(dateCheckOutISO).getTime() - new Date(dateCheckInISO).getTime());
                        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                        const amount = room.price * diffDays;
                        const paymentIntent = yield stripe.paymentIntents.create({
                            amount: amount,
                            currency: 'EUR',
                            description: `${room} pour ${dataToCreate.email} du ${dataToCreate.dateCheckIn} au ${dataToCreate.dateCheckOut} `,
                            payment_method_types: ['card'],
                        });
                        const result = yield client_1.default.booking.create({
                            data: Object.assign(Object.assign({}, dataToCreate), { price: amount, duration: diffDays, userId: req.auth.userId, roomId: dataToCreate.roomId, 
                                // user: {
                                //     connect: { id: req.auth.userId }
                                // },
                                // room: {
                                //     connect: { id: dataToCreate.roomId }
                                // },
                                stripePaymentIntent: paymentIntent.id })
                        });
                        res.status(201).json(result);
                    }
                    else {
                        res.status(400).json({ message: "la chambre n'existe pas" });
                    }
                }
            }
        }
        catch (error) {
            // gestion de l'erreur
            res.status(500).json({ error: 'Une erreur est survenue.' });
        }
        finally {
            yield client_1.default.$disconnect();
        }
    }
});
exports.createBooking = createBooking;
const updateBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const dataToUpdate = req.body.data;
    if (dataToUpdate.email && !(0, regex_1.ValidateEmail)(dataToUpdate.email)) {
        res.status(400).json({ message: 'e-mail invalide' });
    }
    else {
        try {
            const room = yield client_1.default.room.findUnique({ where: { id: dataToUpdate.roomId } });
            if (dataToUpdate.personNumber && (room === null || room === void 0 ? void 0 : room.personNumberPerRoom) && room.personNumberPerRoom < dataToUpdate.personNumber) {
                res.status(400).json({ message: "le nombre de personne doit être inferieur à la capacité de la chambre" });
            }
            else {
                yield client_1.default.booking.updateMany({
                    where: { id: id, userId: req.auth.userId, roomId: dataToUpdate.roomId },
                    data: dataToUpdate,
                });
                const result = client_1.default.booking.findUnique({ where: { id: id } });
                res.status(201).json(result);
            }
        }
        catch (error) {
            // gestion de l'erreur
            res.status(500).json({ error: 'Une erreur est survenue.' });
        }
        finally {
            yield client_1.default.$disconnect();
        }
    }
});
exports.updateBooking = updateBooking;
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
const deleteBooking = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield client_1.default.booking.deleteMany({
            where: {
                id: Number(id),
                userId: req.auth.userId
            },
        });
        if (!result) {
            res.status(404).json({ message: 'La reservation n\'existe pas' });
        }
        else {
            res.status(201).json(result);
        }
        res.status(201).json(result);
    }
    catch (error) {
        // gestion de l'erreur
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.deleteBooking = deleteBooking;
