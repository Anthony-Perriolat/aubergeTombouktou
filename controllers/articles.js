// const prismaMiddleware = require('../middleware/prismaMiddleware')

exports.getArticleById = (req, res, next) => {
    return res.json({ message: 'getArticleById' })
}
exports.getAllArticles = async (req, res, next) => {
    try {
        const result = await req.context.prisma.article.findMany()
        res.status(200).json(result);
      } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
      }
}
exports.createArticle = async (req, res, next) => {
    // try {
    //     console.log(req.context.prisma)
    //     // logique de votre contrôleur
    //     const result = await prismaMiddleware.prismaMiddleware.article.create({
    //         data: {
    //             title: 'Alice',
    //             description: 'alice@prisma.io',
    //             content: "<h1>coucou</h1>",
    //         },
    //     })
    //     res.status(200).json(result);
    //   } catch (error) {
    //     // gestion de l'erreur
    //     console.error(error);
    //     res.status(500).json({ error: 'Une erreur est survenue.' });
    //   }
    return res.json({message: "message"})
}
exports.updateArticle = (req, res, next) => {
    return res.json({ message: 'updateArticle' })

}
exports.deleteArticle = (req, res, next) => {
    return res.json({ message: 'deleteArticle' })

}
