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
exports.deleteRoom = exports.deleteImageRoom = exports.updateRoom = exports.createRoom = exports.getAllRooms = exports.getRoomById = void 0;
const fs_1 = __importDefault(require("fs"));
const client_1 = __importDefault(require("../client"));
const getRoomById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const result = yield client_1.default.room.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                ImageRoom: true
            }
        });
        if (!result) {
            res.status(404).json({ message: "Pas d'enregistrement pour cette id" });
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
exports.getRoomById = getRoomById;
const getAllRooms = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Récupérer les paramètres de la requête
        const { price, bed, dateStart, dateEnd } = req.query;
        // Convertir les chaînes de requête en types appropriés
        const priceQuery = price ? Number(price) : undefined;
        const bedQuery = bed ? Number(bed) : undefined;
        const dateStartQuery = dateStart ? new Date(dateStart) : undefined;
        const dateEndQuery = dateEnd ? new Date(dateEnd) : undefined;
        // Construire la requête pour obtenir les chambres réservées pour une plage de dates donnée
        const bookedRoomsQuery = yield client_1.default.booking.findMany({
            select: {
                roomId: true,
            },
            where: {
                AND: [
                    {
                        dateCheckIn: {
                            lte: dateEndQuery,
                        },
                    },
                    {
                        dateCheckOut: {
                            gte: dateStartQuery,
                        },
                    },
                ],
            },
        });
        // Obtenir la liste des identifiants des chambres réservées
        const bookedRoomIds = bookedRoomsQuery.map((booking) => booking.roomId);
        // Construire la requête pour obtenir toutes les chambres, sauf celles qui sont réservées
        const availableRoomsQuery = yield client_1.default.room.findMany({
            where: {
                AND: [
                    {
                        NOT: {
                            id: {
                                in: bookedRoomIds,
                            },
                        },
                    },
                ],
                price: priceQuery,
                bed: bedQuery,
            },
            include: {
                ImageRoom: true,
            },
        });
        // Renvoyer les chambres disponibles en réponse
        res.status(200).json(availableRoomsQuery);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Une erreur est survenue." });
    }
    finally {
        yield client_1.default.$disconnect();
    }
    ;
});
exports.getAllRooms = getAllRooms;
const createRoom = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const dataToCreateRoom = req.body.data.room;
    try {
        if (req.files) {
            const dataToCreateImageRoom = req.body.data.imageRoom;
            const images = req.files.map(file => ({
                title: file.filename,
                description: dataToCreateImageRoom.description,
                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/${file.filename}`
            }));
            const result = yield client_1.default.room.create({
                data: Object.assign(Object.assign({}, dataToCreateRoom), { ImageRoom: {
                        create: images
                    } }),
                include: {
                    ImageRoom: true
                }
            });
            res.status(201).json(result);
        }
        else {
            const result = yield client_1.default.room.create({
                data: Object.assign({}, dataToCreateRoom),
            });
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
});
exports.createRoom = createRoom;
// export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
//     const id = req.params.id;
//     const dataToUpdate = req.body.data;
//     try {
//         const result = await prisma.room.update({
//             where: { id: Number(id) },
//             data: dataToUpdate,
//         });
//         let img;
//         if (req.file) {
//             const dataToUpdateImageRoom = req.body.data.imageRoom;
//             img = await prisma.imageRoom.updateMany({
//                 where: {
//                     roomId: result.id,
//                     id: dataToUpdateImageRoom.id,
//                 },
//                 data: {
//                     title: req.file.filename,
//                     description: dataToUpdateImageRoom.description,
//                     urlStorage: `${process.env.PROTOCOL}://${req.get('host')}/public/images/${req.file.filename}`,
//                     roomId: result.id,
//                 },
//             });
//         }
//         res.status(201).json({ room: result, images: img });
//     } catch (error) {
//         // gestion de l'erreur
//         console.error(error);
//         res.status(500).json({ error: 'Une erreur est survenue.' });
//     }
// };
const updateRoom = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const roomId = Number(req.params.id);
    const dataToUpdate = req.body.data;
    try {
        if (req.files) {
            const images = req.files.map(file => ({
                title: file.filename,
                description: dataToUpdate.description,
                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/${file.filename}`
            }));
            // erreur ici 
            const result = yield client_1.default.room.update({
                where: { id: roomId },
                data: Object.assign(Object.assign({}, dataToUpdate), { ImageRoom: {
                        upsert: {
                            create: images,
                            update: images,
                        }
                    } }),
                include: {
                    ImageRoom: true
                }
            });
            res.status(200).json(result);
        }
        else {
            const result = yield client_1.default.room.update({
                where: { id: roomId },
                data: Object.assign({}, dataToUpdate),
            });
            res.status(201).json(result);
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.updateRoom = updateRoom;
const deleteImageRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const imgDel = yield client_1.default.imageRoom.delete({ where: { id: Number(id) } });
        fs_1.default.unlink(`public/images/${imgDel.title}`, () => { console.log(`img ${imgDel.title} delete`); });
        res.status(200).json({ message: "l'élément a bien été supprimé" });
    }
    catch (error) {
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.deleteImageRoom = deleteImageRoom;
const deleteRoom = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const imgArray = yield client_1.default.imageRoom.findMany({
            where: {
                roomId: Number(id),
            },
        });
        for (const i of imgArray) {
            fs_1.default.unlink(`public/images/${i.title}`, () => { console.log(`img ${i.title} delete`); });
        }
        yield client_1.default.room.update({
            where: {
                id: Number(id),
            },
            data: {
                ImageRoom: {
                    deleteMany: {},
                },
            },
        });
        const result = yield client_1.default.room.delete({
            where: {
                id: Number(id),
            },
        });
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
exports.deleteRoom = deleteRoom;
