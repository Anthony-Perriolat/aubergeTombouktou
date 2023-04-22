import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import { Decimal } from '@prisma/client/runtime';

interface SendMailUserData {
  nameUser: string;
  email: string;
}
interface SendMailBookingData {
  nameUser: string;
  email: string;
  dateCheckIn: Date;
  dateCheckOut: Date;
  nameRoom: string;
  duration: Number;
  price: Number;
  nbCustomer: Number;
}
// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true, // utilisation du TLS
  auth: {
    user: 'contact@soin-dargan.fr',
    pass: 'Perriolat26!'
  },
});

async function sendMailWelcome(data: SendMailUserData) {
  // compile the template
  const template = handlebars.compile(await fs.readFile('lib/templateMail/welcomeUser.hbs', 'utf8'));
  // generate the HTML content of the email using the template and data
  const htmlContent = template({ nameUser: data.nameUser });
  await transporter.sendMail({
    // from: 'contact@soin-dargan.fr', // sender address
    from: process.env.MAIL_SENDER,
    to: data.email, // list of receivers
    subject: "Bienvenue chez l'auberge de Tombouktou", // Subject line
    html: htmlContent // html body
  });

}

async function sendMailGoodbye(data: SendMailUserData) {
  // compile the template
  const template = handlebars.compile(await fs.readFile('lib/templateMail/goodbyeUser.hbs', 'utf8'));
  // generate the HTML content of the email using the template and data
  const htmlContent = template({ nameUser: data.nameUser });
  await transporter.sendMail({
    from: process.env.MAIL_SENDER, // sender address
    to: data.email, // list of receivers
    subject: "Au revoir de la part de l'auberge de Tombouktou", // Subject line
    html: htmlContent // html body
  });
}

async function sendMailUpdateEmail(data: SendMailUserData) {
  // compile the template
  const template = handlebars.compile(await fs.readFile('lib/templateMail/updateMail.hbs', 'utf8'));
  // generate the HTML content of the email using the template and data
  const htmlContent = template({ nameUser: data.nameUser });
  await transporter.sendMail({
    from: process.env.MAIL_SENDER!, // sender address
    to: data.email, // list of receivers
    subject: "Modification d'adresse e-mail pour l'auberge de Tombouktou", // Subject line
    html: htmlContent // html body
  });
}

async function sendMailCreateBooking(data: SendMailBookingData) {
  // compile the template
  const template = handlebars.compile(await fs.readFile('lib/templateMail/createBookingMail.hbs', 'utf8'));
  // generate the HTML content of the email using the template and data
  const htmlContent = template({ nameUser: data.nameUser, dateCheckIn: data.dateCheckIn, dataCheckOut: data.dateCheckOut, nameRoom: data.nameRoom, price: data.price, duration: data.duration, nbCustomer: data.nbCustomer });
  await transporter.sendMail({
    from: process.env.MAIL_SENDER!, // sender address
    to: data.email, // list of receivers
    subject: "Reservation pour l'auberge de Tombouktou", // Subject line
    html: htmlContent // html body
  });
}

async function sendMailUpdateBooking(data: SendMailBookingData) {
  // compile the template
  const template = handlebars.compile(await fs.readFile('lib/templateMail/updateBookingMail.hbs', 'utf8'));
  // generate the HTML content of the email using the template and data
  const htmlContent = template({ nameUser: data.nameUser, dateCheckIn: data.dateCheckIn, dataCheckOut: data.dateCheckOut, nameRoom: data.nameRoom, price: data.price, duration: data.duration, nbCustomer: data.nbCustomer });
  await transporter.sendMail({
    from: process.env.MAIL_SENDER!, // sender address
    to: data.email, // list of receivers
    subject: "Modification de la reservation pour l'auberge de Tombouktou", // Subject line
    html: htmlContent // html body
  });
}


export {
  sendMailWelcome,
  sendMailGoodbye,
  sendMailUpdateEmail,
  sendMailCreateBooking,
  sendMailUpdateBooking,
};