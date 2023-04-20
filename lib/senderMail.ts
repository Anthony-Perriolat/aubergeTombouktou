import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs/promises';

interface SendMailData {
  name: string;
  email: string;
}

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_SENDER!, // your email address
    pass: process.env.MAIL_PW! // your email password
  }
});

async function sendMailWelcome(data: SendMailData) {
  // compile the template
  const template = handlebars.compile(await fs.readFile('lib/templateMail/welcomeUser.hbs', 'utf8'));
  // generate the HTML content of the email using the template and data
  const htmlContent = template({ name: data.name });
  await transporter.sendMail({
    from: process.env.MAIL_SENDER!, // sender address
    to: data.email, // list of receivers
    subject: "Bienvenue chez l'auberge de Tombouktou", // Subject line
    html: htmlContent // html body
  });
}

async function sendMailGoodbye(data: SendMailData) {
  // compile the template
  const template = handlebars.compile(await fs.readFile('lib/templateMail/goodbyeUser.hbs', 'utf8'));
  // generate the HTML content of the email using the template and data
  const htmlContent = template({ name: data.name });
  await transporter.sendMail({
    from: process.env.MAIL_SENDER!, // sender address
    to: data.email, // list of receivers
    subject: "Au revoir de la part de l'auberge de Tombouktou", // Subject line
    html: htmlContent // html body
  });
}

async function sendMailUpdateEmail(data: SendMailData) {
  // compile the template
  const template = handlebars.compile(await fs.readFile('lib/templateMail/updateMail.hbs', 'utf8'));
  // generate the HTML content of the email using the template and data
  const htmlContent = template({ name: data.name });
  await transporter.sendMail({
    from: process.env.MAIL_SENDER!, // sender address
    to: data.email, // list of receivers
    subject: "Modification d'adresse e-mail pour l'auberge de Tombouktou", // Subject line
    html: htmlContent // html body
  });
}

export {
  sendMailWelcome,
  sendMailGoodbye,
  sendMailUpdateEmail,
};