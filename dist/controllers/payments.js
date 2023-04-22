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
exports.retrievePayment = void 0;
const client_1 = __importDefault(require("../client"));
const senderMail_1 = require("../lib/senderMail");
const stripe = require('stripe')(process.env.STRIPE_KEY_SECRET);
const retrievePaymentIntents = (clientSecret) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, client_secret } = yield stripe.paymentIntents.retrieve(clientSecret);
        return { client_secret, status };
    }
    catch (error) {
        console.log(error);
        throw new Error('Impossible de récupérer le paiement');
    }
});
const retrievePayment = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Récupérer les informations de paiement du corps de la requête
        const paymentData = req.body.data;
        const payment = yield retrievePaymentIntents(paymentData.idPaymentIntent);
        const booking = yield client_1.default.booking.findUniqueOrThrow({ where: { id: paymentData.booking.id } });
        // Vérifier le statut du paiement
        if (payment.status === 'succeeded' && !booking.paymentDate) {
            const booking = yield client_1.default.booking.update({
                where: {
                    id: paymentData.booking.id
                },
                data: {
                    hasPaid: true,
                    paymentDate: new Date(Date.now()).toISOString().replace(/\.\d{3}Z$/, 'Z')
                }
            });
            const user = yield client_1.default.user.findUniqueOrThrow({ where: { id: booking.userId } });
            const room = yield client_1.default.room.findUniqueOrThrow({ where: { id: booking.roomId } });
            (0, senderMail_1.sendMailCreateBooking)({
                nameUser: `${user.lastName} ${user.firstName}`,
                email: booking.email,
                dateCheckIn: booking.dateCheckIn,
                dateCheckOut: booking.dateCheckOut,
                nameRoom: room.name,
                duration: booking.duration,
                price: booking.price / 100,
                nbCustomer: booking.personNumber,
            });
            res.status(200).json({
                message: 'Paiement effectué avec succès',
                paymentIntent: payment,
            });
        }
        else {
            res.status(400).json({
                message: 'Le paiement a échoué ou est en attente.',
                paymentIntent: payment,
            });
        }
    }
    catch (error) {
        // Gérer les erreurs en renvoyant une réponse d'erreur au client
        res.status(500).json({
            message: 'Une erreur est survenue lors du traitement du paiement',
        });
    }
    finally {
        yield client_1.default.$disconnect();
    }
});
exports.retrievePayment = retrievePayment;
