const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getcategoriesArticleById = async (req, res, next) => {
    const id = req.params.id
    try {
        const result = await prisma.categorieArticle.findUnique({
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
exports.getAllcategoriesArticle = async (req, res, next) => {
    try {
        const result = await prisma.categorieArticle.findMany()
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
exports.createcategoriesArticle = async (req, res, next) => {
    const dataToCreate = req.body.data
    try {
        const result = await prisma.categorieArticle.create({
            data: dataToCreate,
        })
        res.status(201).json(result);
    } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
exports.updatecategoriesArticle = async (req, res, next) => {
    const id = req.params.id
    const dataToUpdate = req.body.data
    try {
        const result = await prisma.categorieArticle.update({
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
exports.deletecategoriesArticle = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await prisma.categorieArticle.delete({
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
