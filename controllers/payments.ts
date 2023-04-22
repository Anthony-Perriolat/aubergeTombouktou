import { NextFunction, Request, Response } from "express";
import prisma from "../client";
import { sendMailCreateBooking } from "../lib/senderMail";

const stripe = require('stripe')(process.env.STRIPE_KEY_SECRET);

interface PaymentData {
  idPaymentIntent: string,
  booking: {
    id: number,
    uuid: string,
  }
}
const retrievePaymentIntents = async (clientSecret: string) => {
  try {
    const { status, client_secret } = await stripe.paymentIntents.retrieve(clientSecret);
    return { client_secret, status };
  } catch (error) {
    console.log(error);
    throw new Error('Impossible de récupérer le paiement');
  }
};


export const retrievePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Récupérer les informations de paiement du corps de la requête
    const paymentData: PaymentData = req.body.data
    const payment = await retrievePaymentIntents(paymentData.idPaymentIntent)
    const booking = await prisma.booking.findUniqueOrThrow({ where: { id: paymentData.booking.id } })
    // Vérifier le statut du paiement
    if (payment.status === 'succeeded' && !booking.paymentDate) {
      const booking = await prisma.booking.update({
        where: {
          id: paymentData.booking.id
        },
        data: {
          hasPaid: true,
          paymentDate: new Date(Date.now()).toISOString().replace(/\.\d{3}Z$/, 'Z')
        }
      })
      const user = await prisma.user.findUniqueOrThrow({ where: { id: booking.userId } })
      const room = await prisma.room.findUniqueOrThrow({ where: { id: booking.roomId } })
      sendMailCreateBooking({
        nameUser: `${user.lastName} ${user.firstName}`,
        email: booking.email,
        dateCheckIn: booking.dateCheckIn,
        dateCheckOut: booking.dateCheckOut,
        nameRoom: room.name,
        duration: booking.duration,
        price: booking.price / 100,
        nbCustomer: booking.personNumber,
      })
      res.status(200).json({
        message: 'Paiement effectué avec succès',
        paymentIntent: payment,
      });
    } else {
      res.status(400).json({
        message: 'Le paiement a échoué ou est en attente.',
        paymentIntent: payment,
      });
    }
  } catch (error) {
    // Gérer les erreurs en renvoyant une réponse d'erreur au client
    res.status(500).json({
      message: 'Une erreur est survenue lors du traitement du paiement',
    });
  } finally {
    await prisma.$disconnect();
  }
}
