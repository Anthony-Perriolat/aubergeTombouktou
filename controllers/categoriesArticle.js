const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.getcategoriesArticleById = (req, res, next) => {
    return res.json({ message: 'getcategoriesArticleById' })

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
    // console.log(title, description)
    console.log("cef")
    const { title, description } = req.body.data
    console.log(title)
    console.log(description)
    try {
            const result = await prisma.categorieArticle.create({
            data: {
                title: title,
                description: description
            },
        })
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
    // return res.json({message: 'createcategoriesArticle'})

}
exports.updatecategoriesArticle = (req, res, next) => {
    return res.json({ message: 'updatecategoriesArticle' })

}
exports.deletecategoriesArticle = (req, res, next) => {
    return res.json({ message: 'deletecategoriesArticle' })

}
