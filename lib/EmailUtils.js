const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail({ to, subject, html, attachments }) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Admin | ATTICA INFRA SERVICES" <${process.env.EMAIL_USERNAME}>`,
        to,
        subject,
        html,
        attachments
    };

    return await transporter.sendMail(mailOptions);
}

module.exports = { sendEmail };
