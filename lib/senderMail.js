const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  host: 'ssl0.ovh.net',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.MAIL_SENDER, // your email address
    pass: process.env.MAIL_PW // your email password
  }
});

const handlebars = require('handlebars');
const fs = require('fs');

async function sendMailWelcome(name, email) {
    // compile the template
    const template = handlebars.compile(fs.readFileSync('lib/templateMail/welcomeUser.hbs', 'utf8'));
    // generate the HTML content of the email using the template and data
    const htmlContent = template({ name: name });
    let info = await transporter.sendMail({
        from: process.env.MAIL_SENDER, // sender address
        to: email, // list of receivers
        subject: "Bienvenu chez l'auberge de tombouktou", // Subject line
        html: htmlContent // html body
      });
};

async function sendMailGoodbye(name, email) {
  // compile the template
  const template = handlebars.compile(fs.readFileSync('lib/templateMail/goodbyeUser.hbs', 'utf8'));
  // generate the HTML content of the email using the template and data
  const htmlContent = template({ name: name });
  let info = await transporter.sendMail({
      from: process.env.MAIL_SENDER, // sender address
      to: email, // list of receivers
      subject: "Au revoir de la part de l'auberge de tombouktou", // Subject line
      html: htmlContent // html body
    });
};

async function sendMailUpdateEmail(name, email) {
  // compile the template
  const template = handlebars.compile(fs.readFileSync('lib/templateMail/updateMail.hbs', 'utf8'));
  // generate the HTML content of the email using the template and data
  const htmlContent = template({ name: name });
  let info = await transporter.sendMail({
      from: process.env.MAIL_SENDER, // sender address
      to: email, // list of receivers
      subject: "Modification de mail pour l'auberge de tombouktou", // Subject line
      html: htmlContent // html body
    });
};
module.exports = {
    sendMailWelcome,
    sendMailGoodbye,
    sendMailUpdateEmail,
  };