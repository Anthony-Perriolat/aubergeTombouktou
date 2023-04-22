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
exports.deleteArticle = exports.deleteImageArticle = exports.updateArticle = exports.createArticle = exports.getAllArticles = exports.getArticleById = void 0;
const client_1 = __importDefault(require("../client"));
const fs_1 = __importDefault(require("fs"));
const getArticleById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const result = yield client_1.default.article.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                images: true
            }
        });
        if (!result) {
            res.status(404).json({ message: 'article inexistant' });
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
exports.getArticleById = getArticleById;
const getAllArticles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categorieIdQuery = req.query.categorieId;
        const where = categorieIdQuery ? { categorieId: Number(categorieIdQuery) } : {};
        const result = yield client_1.default.article.findMany({ where });
        res.status(200).json(result);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: "Une erreur est survenue." });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.getAllArticles = getAllArticles;
const createArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const dataToCreateArticle = req.body.data;
    try {
        if (req.files) {
            const images = req.files.map(file => ({
                title: file.filename,
                description: dataToCreateArticle.description,
                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/${file.filename}`
            }));
            const result = yield client_1.default.article.create({
                data: Object.assign(Object.assign({}, dataToCreateArticle), { images: {
                        create: images
                    }, categorieId: dataToCreateArticle.categorieId }),
                include: {
                    images: true
                }
            });
            res.status(201).json(result);
        }
        else {
            const result = yield client_1.default.article.create({
                data: Object.assign({}, dataToCreateArticle),
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
exports.createArticle = createArticle;
const updateArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = Number(req.params.id);
    const dataToUpdate = req.body.data;
    try {
        if (req.files) {
            const images = req.files.map(file => ({
                title: file.filename,
                description: dataToUpdate.description,
                urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/${file.filename}`
            }));
            const result = yield client_1.default.article.update({
                where: { id: id },
                data: Object.assign(Object.assign({}, dataToUpdate), { images: {
                        upsert: images.map(image => ({
                            where: { title: image.title },
                            create: {
                                title: image.title,
                                description: image.description,
                                urlStorage: image.urlStorage,
                            },
                            update: {
                                title: image.title,
                                description: image.description,
                                urlStorage: image.urlStorage,
                            },
                        })),
                    } }),
                include: {
                    images: true
                }
            });
            res.status(200).json(result);
        }
        else {
            const result = yield client_1.default.article.update({
                where: { id: id },
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
exports.updateArticle = updateArticle;
const deleteImageArticle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const imgDel = yield client_1.default.imageArticle.delete({ where: { id: Number(id) } });
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
exports.deleteImageArticle = deleteImageArticle;
const deleteArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const imgArray = yield client_1.default.imageArticle.findMany({
            where: {
                articleId: Number(id),
            },
        });
        for (const i of imgArray) {
            fs_1.default.unlink(`public/images/${i.title}`, () => { console.log(`img ${i.title} delete`); });
        }
        yield client_1.default.article.update({
            where: {
                id: Number(id),
            },
            data: {
                images: {
                    deleteMany: {},
                },
            },
        });
        const result = yield client_1.default.article.delete({
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
exports.deleteArticle = deleteArticle;
