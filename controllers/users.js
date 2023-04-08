const bcrypt = require('bcrypt')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const senderMail = require('../lib/senderMail')

exports.getMyUser = async (req, res, next) => {
    const idMyUser = req.auth.userId
    try {
        const result = await prisma.user.findUnique({
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
exports.getAllUsers = async (req, res, next) => {
    try {
        const result = await prisma.user.findMany()
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
exports.login = async (req, res, next) => {

}
exports.signUpUser = (req, res, next) => {
    const dataUser = {...req.body.data}
    bcrypt.hash(dataUser.password, 10)
        .then(async (hash) => {
            dataUser.password = hash
            try {
                const result = await prisma.user.create({
                    data: dataUser,
                })
                delete result.password 
                senderMail.sendMailWelcome(`${result.lastName} ${result.firstName}`, result.email)                
                res.status(201).json(result);
            } catch (error) {
                // gestion de l'erreur
                console.error(error);
                res.status(500).json({ error: 'Une erreur est survenue.' });
            }
        }).catch((error) => {
            res.status(500).json({ error })
        });

}
exports.updateUser = async (req, res, next) => {
    const id = req.params.id
    const dataToUpdate = req.body.data
    try {
        const result = await prisma.user.update({
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

// exports.deleteUser = (req, res, next) => {}

