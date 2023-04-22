import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import prisma from '../client';


export const getRoomById = async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  try {
    const result = await prisma.room.findUnique({
      where: {
        id: Number(id),
      },
      include: {
        ImageRoom: true
      }
    });
    if (!result) {
      res.status(404).json({ message: "Pas d'enregistrement pour cette id" })
    }
    else {
      res.status(200).json(result);
    }
  } catch (error) {
    // gestion de l'erreur
    res.status(500).json({ error: 'Une erreur est survenue.' });
  } finally {
    await prisma.$disconnect();
  }
};

export const getAllRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer les paramètres de la requête
    const { price, bed, dateStart, dateEnd } = req.query;

    // Convertir les chaînes de requête en types appropriés
    const priceQuery: number | undefined = price ? Number(price) : undefined;
    const bedQuery: number | undefined = bed ? Number(bed) : undefined;
    const dateStartQuery: Date | undefined = dateStart ? new Date(dateStart as string) : undefined;
    const dateEndQuery: Date | undefined = dateEnd ? new Date(dateEnd as string) : undefined;

    // Construire la requête pour obtenir les chambres réservées pour une plage de dates donnée
    const bookedRoomsQuery = await prisma.booking.findMany({
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
    const availableRoomsQuery = await prisma.room.findMany({
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

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Une erreur est survenue." });
  } finally {
    await prisma.$disconnect();
  };
};

export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  const dataToCreateRoom = req.body.data.room;
  try {
    if (req.files) {
      const dataToCreateImageRoom = req.body.data.imageRoom;
      const images = (req.files as Express.Multer.File[]).map(file => ({
        title: file.filename,
        description: dataToCreateImageRoom.description,
        urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/${file.filename}`
      }));
      const result = await prisma.room.create({
        data: {
          ...dataToCreateRoom,
          ImageRoom: {
            create: images
          }
        },
        include: {
          ImageRoom: true
        }
      });

      res.status(201).json(result);
    } else {
      const result = await prisma.room.create({
        data: { ...dataToCreateRoom },
      });
      res.status(201).json(result);

    }
  } catch (error) {
    // gestion de l'erreur
    res.status(500).json({ error: 'Une erreur est survenue.' });
  } finally {
    await prisma.$disconnect();
  }
};

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
export const updateRoom = async (req: Request, res: Response, next: NextFunction) => {
  const roomId = Number(req.params.id);
  const dataToUpdate = req.body.data;
  try {
    if (req.files) {
      const images = (req.files as Express.Multer.File[]).map(file => ({
        title: file.filename,
        description: dataToUpdate.description,
        urlStorage: `${process.env.PROTOCOL}://${process.env.HOSTNAME}:${process.env.PORT}/public/images/${file.filename}`
      }));

      // erreur ici 
      const result = await prisma.room.update({
        where: { id: roomId },

        data: {
          ...dataToUpdate,
          ImageRoom: {
            upsert: {
              create: images,
              update: images,
            }
          }
        },
        include: {
          ImageRoom: true
        }
      });
      res.status(200).json(result);
    }
    else {
      const result = await prisma.room.update({
        where: { id: roomId },
        data: { ...dataToUpdate },
      });
      res.status(201).json(result);
    }
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue.' });
  } finally {
    await prisma.$disconnect();
  }
};


export const deleteImageRoom = async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const imgDel = await prisma.imageRoom.delete({ where: { id: Number(id) } })
    fs.unlink(`public/images/${imgDel.title}`, () => { console.log(`img ${imgDel.title} delete`) })
    res.status(200).json({ message: "l'élément a bien été supprimé" })
  } catch (error) {
    res.status(500).json({ error: 'Une erreur est survenue.' });
  } finally {
    await prisma.$disconnect();
  }
}



export const deleteRoom = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { id } = req.params;
  try {
    const imgArray = await prisma.imageRoom.findMany({
      where: {
        roomId: Number(id),
      },
    });
    for (const i of imgArray) {
      fs.unlink(`public/images/${i.title}`, () => { console.log(`img ${i.title} delete`) })
    }
    await prisma.room.update({
      where: {
        id: Number(id),
      },
      data: {
        ImageRoom: {
          deleteMany: {},
        },
      },
    })
    const result = await prisma.room.delete({
      where: {
        id: Number(id),
      },
    });
    res.status(201).json(result);
  } catch (error) {
    // gestion de l'erreur
    res.status(500).json({ error: 'Une erreur est survenue.' });
  } finally {
    await prisma.$disconnect();
  }
};