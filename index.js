const express = require('express');
const path = require('path');
const cors = require("cors");
const fs = require('fs');
const handlebars = require("handlebars");
const { sendEmail } = require('./lib/EmailUtils');
require('dotenv').config();
const pdf = require('html-pdf-node');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

function getCompiledTemplate(templateName, replacements) {
    const filePath = path.join(__dirname, 'public', templateName);
    if (!fs.existsSync(filePath)) {
        console.error(`Template file ${templateName} not found.`);
        return '';
    }
    const source = fs.readFileSync(filePath, 'utf8');
    const template = handlebars.compile(source);
    return template(replacements);
}

app.post('/submit-quote', async (req, res) => {
    const { contactDetails, quoteDetails } = req.body;

    if (!contactDetails || !quoteDetails) {
        return res.status(400).json({ error: 'Contact details and quote details are required.' });
    }

    const timestamp = Date.now();
    const safeName = contactDetails.name.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    const fileName = `${safeName}_${timestamp}.pdf`;

    const htmlContent = `
    <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; padding: 40px; }
                h1 { text-align: center; }
                h2 { margin-top: 40px; color: #444; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color: #f3f3f3; }
            </style>
        </head>
        <body>
            <h1>Quote Request for ${contactDetails.name}</h1>
            <h2>Contact Details</h2>
            <table>
                <tr><th>Name</th><td>${contactDetails.name}</td></tr>
                <tr><th>Email</th><td>${contactDetails.email}</td></tr>
                <tr><th>Phone</th><td>${contactDetails.phone}</td></tr>
                <tr><th>Address</th><td>${contactDetails.address}</td></tr>
            </table>

            ${quoteDetails.map(section => `
                <h2>${section.sectionTitle}</h2>
                <table>
                    <tr><th>Label</th><th>Specification</th></tr>
                    ${section.sectionData.map(item => `
                    <tr>
                        <td>${item.label}</td>
                        <td>${item.value}</td>
                    </tr>
                    `).join('')}
                </table>
            `).join('')}
        </body>
    </html>
    `;

    let pdfBuffer;
    try {
        const file = { content: htmlContent };
        pdfBuffer = await pdf.generatePdf(file, { format: 'A4' });
        console.log('PDF generated successfully in memory.');
    } catch (e) {
        console.error('Error generating PDF:', e);
        return res.status(500).json({ error: 'Error generating PDF', errorMsg: e.toString() });
    }

    const adminMailContent = getCompiledTemplate('constrution-request.html', { username: "Admin" });
    const userMailContent = getCompiledTemplate('constrution-request.html', { username: contactDetails.name });

    try {
        console.log('Sending emails...');

        await sendEmail({
            to: ["karnamshyam9009@gmail.com"],
            subject: `A new quote request from ${contactDetails.name}`,
            html: adminMailContent,
            attachments: [{
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        await sendEmail({
            to: contactDetails.email,
            subject: `Your (${contactDetails.name}) construction has been submitted successfully`,
            html: userMailContent,
            attachments: [{
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        console.log('Emails sent successfully with in-memory PDF.');
        res.status(200).json({ message: 'Emails sent successfully!' });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ error: 'Error sending emails', reason: error.toString() });
    }
});

app.get("/", (req, res) => {
    return res.status(200).json({"status" : "UP"})
})

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}....`);
});
