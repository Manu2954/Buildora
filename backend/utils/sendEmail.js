const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter object using SMTP transport
    // This now uses your Mailtrap credentials from the .env file
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    // 2. Define the email options
    const mailOptions = {
        from: '"Buildora" <support@buildora.com>', // Sender address
        to: options.to, // The recipient's email from the options object
        subject: options.subject, // The subject line
        html: options.html, // The HTML body content
    };

    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent via Mailtrap: %s', info.messageId);
};

module.exports = sendEmail;
