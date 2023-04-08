exports.getRoomById = async (req, res, next) => {
    const id = req.params.id
    try {
        const result = await prisma.room.findUnique({
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
exports.getAllRooms = async (req, res, next) => {
    try {
        const result = await prisma.room.findMany()
        res.status(200).json(result);
    } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
exports.createRoom = async (req, res, next) => {
    const dataToCreate = req.body.data
    try {
        const result = await prisma.room.create({
            data: dataToCreate,
        })
        res.status(201).json(result);
    } catch (error) {
        // gestion de l'erreur
        console.error(error);
        res.status(500).json({ error: 'Une erreur est survenue.' });
    }
}
exports.updateRoom = async (req, res, next) => {
    const id = req.params.id
    const dataToUpdate = req.body.data
    try {
        const result = await prisma.room.update({
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
exports.deleteRoom = async (req, res, next) => {
    const { id } = req.params
    try {
        const result = await prisma.room.delete({
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
