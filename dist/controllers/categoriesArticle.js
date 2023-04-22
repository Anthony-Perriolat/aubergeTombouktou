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
exports.deletecategoriesArticle = exports.updatecategoriesArticle = exports.createcategoriesArticle = exports.getAllcategoriesArticle = exports.getcategoriesArticleById = void 0;
const client_1 = __importDefault(require("../client"));
const getcategoriesArticleById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        const result = yield client_1.default.categorieArticle.findUnique({
            where: {
                id: Number(id),
            },
            include: {
                articles: true
            }
        });
        if (!result) {
            res.status(404).json({ message: "la categorie n'existe pas" });
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
exports.getcategoriesArticleById = getcategoriesArticleById;
const getAllcategoriesArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const result = yield client_1.default.categorieArticle.findMany();
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
exports.getAllcategoriesArticle = getAllcategoriesArticle;
const createcategoriesArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const dataToCreate = req.body.data;
    try {
        const result = yield client_1.default.categorieArticle.create({
            data: dataToCreate,
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
exports.createcategoriesArticle = createcategoriesArticle;
const updatecategoriesArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    const dataToUpdate = req.body.data;
    try {
        const result = yield client_1.default.categorieArticle.update({
            where: { id: Number(id) },
            data: dataToUpdate,
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
exports.updatecategoriesArticle = updatecategoriesArticle;
const deletecategoriesArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield client_1.default.categorieArticle.delete({
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
exports.deletecategoriesArticle = deletecategoriesArticle;
