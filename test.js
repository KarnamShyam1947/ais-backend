const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const handlebars = require("handlebars");
const express = require("express")
const path = require("path");
const fs = require("fs");
require('dotenv').config()

app = express()

const PORT = process.env.PORT || 3000
require('dotenv').config();

app.use(bodyParser.json());

function getCompiledTemplate(templateName, replacements) {
    const filePath = path.join(__dirname, 'public', templateName);
    const source = fs.readFileSync(filePath, 'utf8');
    const template = handlebars.compile(source);
    return template(replacements);
}

app.post('/send-email', async (req, res) => {
    const { to, subject, username } = req.body;

    const htmlContent = getCompiledTemplate('welcome-template.html', {
        username
    });

    const transporter = nodemailer.createTransport({
        host : process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: false,  
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const mailOptions = {
        from: `"Admin" <${process.env.EMAIL_USERNAME}>`,
        to,
        subject,
        // text,
        html: htmlContent
    };
    

    try {
        const info = await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Email sent!', info });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending email', error });
    }
});

app.get("/", (req, res) => {
    res.status(200).json({
        message: "API status is UP"
    })
})

app.listen(PORT, () => {
    console.log(`App is running on PORT ${PORT}`);
})


