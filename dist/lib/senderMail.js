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
exports.sendMailUpdateBooking = exports.sendMailCreateBooking = exports.sendMailUpdateEmail = exports.sendMailGoodbye = exports.sendMailWelcome = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const handlebars_1 = __importDefault(require("handlebars"));
const promises_1 = __importDefault(require("fs/promises"));
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer_1.default.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
        user: 'contact@soin-dargan.fr',
        pass: 'Perriolat26!'
    },
});
function sendMailWelcome(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // compile the template
        const template = handlebars_1.default.compile(yield promises_1.default.readFile('lib/templateMail/welcomeUser.hbs', 'utf8'));
        // generate the HTML content of the email using the template and data
        const htmlContent = template({ nameUser: data.nameUser });
        yield transporter.sendMail({
            // from: 'contact@soin-dargan.fr', // sender address
            from: process.env.MAIL_SENDER,
            to: data.email,
            subject: "Bienvenue chez l'auberge de Tombouktou",
            html: htmlContent // html body
        });
    });
}
exports.sendMailWelcome = sendMailWelcome;
function sendMailGoodbye(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // compile the template
        const template = handlebars_1.default.compile(yield promises_1.default.readFile('lib/templateMail/goodbyeUser.hbs', 'utf8'));
        // generate the HTML content of the email using the template and data
        const htmlContent = template({ nameUser: data.nameUser });
        yield transporter.sendMail({
            from: process.env.MAIL_SENDER,
            to: data.email,
            subject: "Au revoir de la part de l'auberge de Tombouktou",
            html: htmlContent // html body
        });
    });
}
exports.sendMailGoodbye = sendMailGoodbye;
function sendMailUpdateEmail(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // compile the template
        const template = handlebars_1.default.compile(yield promises_1.default.readFile('lib/templateMail/updateMail.hbs', 'utf8'));
        // generate the HTML content of the email using the template and data
        const htmlContent = template({ nameUser: data.nameUser });
        yield transporter.sendMail({
            from: process.env.MAIL_SENDER,
            to: data.email,
            subject: "Modification d'adresse e-mail pour l'auberge de Tombouktou",
            html: htmlContent // html body
        });
    });
}
exports.sendMailUpdateEmail = sendMailUpdateEmail;
function sendMailCreateBooking(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // compile the template
        const template = handlebars_1.default.compile(yield promises_1.default.readFile('lib/templateMail/createBookingMail.hbs', 'utf8'));
        // generate the HTML content of the email using the template and data
        const htmlContent = template({ nameUser: data.nameUser, dateCheckIn: data.dateCheckIn, dataCheckOut: data.dateCheckOut, nameRoom: data.nameRoom, price: data.price, duration: data.duration, nbCustomer: data.nbCustomer });
        yield transporter.sendMail({
            from: process.env.MAIL_SENDER,
            to: data.email,
            subject: "Reservation pour l'auberge de Tombouktou",
            html: htmlContent // html body
        });
    });
}
exports.sendMailCreateBooking = sendMailCreateBooking;
function sendMailUpdateBooking(data) {
    return __awaiter(this, void 0, void 0, function* () {
        // compile the template
        const template = handlebars_1.default.compile(yield promises_1.default.readFile('lib/templateMail/updateBookingMail.hbs', 'utf8'));
        // generate the HTML content of the email using the template and data
        const htmlContent = template({ nameUser: data.nameUser, dateCheckIn: data.dateCheckIn, dataCheckOut: data.dateCheckOut, nameRoom: data.nameRoom, price: data.price, duration: data.duration, nbCustomer: data.nbCustomer });
        yield transporter.sendMail({
            from: process.env.MAIL_SENDER,
            to: data.email,
            subject: "Modification de la reservation pour l'auberge de Tombouktou",
            html: htmlContent // html body
        });
    });
}
exports.sendMailUpdateBooking = sendMailUpdateBooking;
