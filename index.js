const { sendEmail } = require('./lib/EmailUtils');
const handlebars = require("handlebars");
const pdf = require('html-pdf-node');
const express = require('express');
const path = require('path');
const cors = require("cors");
const cookieParser = require('cookie-parser');
const fs = require('fs');
const mongoose = require("mongoose")

const authRouter = require("./routers/AuthRouter");
const uploadRouter = require("./routers/UploadRouter");
const builderRouter = require("./routers/BuilderRouter");
const propertyRouter = require("./routers/PropertyRouter");

const {
    generateQuotePDF,
    generateMaterialOrderPDF,
    generateArchitectureDesignPDF,
    generateInteriorDesignPDF
} = require('./lib/PDFUtils');

const initializeDefaultAdmin = require("./lib/AuthUtils");

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('❌ MONGO_URI not found in .env');
    process.exit(1);
}

app.use(cors({     
    origin: "http://localhost:5173", 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

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
    const { contactDetails, quoteDetails, builders } = req.body;

    if (!contactDetails || !quoteDetails) {
        return res.status(400).json({ error: 'Contact details and quote details are required.' });
    }

    const timestamp = Date.now();
    const safeName = contactDetails.name.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    const fileName = `${safeName}_${timestamp}.pdf`;


    const pdfResp = await generateQuotePDF(contactDetails, quoteDetails, builders);
    let pdfBuffer;
    if (pdfResp.message) {
        pdfBuffer = pdfResp.buffer;
        console.log('PDF generated successfully in memory.');
    } else {
        console.error('Error generating PDF:', e);
        return res.status(500).json(pdfResp.error);
    }

    const adminMailContent = getCompiledTemplate('construction-request.html', { username: "Admin" });
    const userMailContent = getCompiledTemplate('construction-request.html', { username: contactDetails.name });

    try {
        console.log('Sending emails...');

        await sendEmail({
            to: [`${process.env.ADMIN_EMAIL}`],
            subject: `A new ${builders.length ? "Multiple" : ''} quote request from ${contactDetails.name}`,
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

app.post('/submit-material-order', async (req, res) => {
    const { groupedMaterials, contactDetails } = req.body;

    if (!contactDetails || !groupedMaterials || !Array.isArray(groupedMaterials)) {
        return res.status(400).json({ error: 'Contact details and grouped materials are required.' });
    }

    const timestamp = Date.now();
    const safeName = contactDetails.name.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    const fileName = `${safeName}_material_order_${timestamp}.pdf`;

    const pdfResp = await generateMaterialOrderPDF(contactDetails, groupedMaterials);
    let pdfBuffer;
    if (pdfResp.message) {
        pdfBuffer = pdfResp.buffer;
        console.log('✅ PDF generated successfully.');
    } else {
        console.error('❌ Error generating PDF:', err);
        return res.status(500).json({ error: 'PDF generation failed', details: err.toString() });
    }

    const adminMailContent = getCompiledTemplate('construction-request.html', { username: "Admin" });
    const userMailContent = getCompiledTemplate('construction-request.html', { username: contactDetails.name });

    try {
        await sendEmail({
            to: [`${process.env.ADMIN_EMAIL}`],
            subject: `New Material Order from ${contactDetails.name}`,
            html: adminMailContent,
            attachments: [{
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        await sendEmail({
            to: contactDetails.email,
            subject: `Your material order has been submitted - ${contactDetails.name}`,
            html: userMailContent,
            attachments: [{
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        console.log('📧 Emails sent successfully.');
        res.status(200).json({ message: 'Material order submitted and emails sent!' });

    } catch (error) {
        console.error('❌ Email sending failed:', error);
        res.status(500).json({ error: 'Email sending failed', reason: error.toString() });
    }
});

app.post("/submit-architecture-design", async (req, res) => {
    const { contactDetails, mainData } = req.body;

    if (!contactDetails || !mainData || !Array.isArray(mainData)) {
        return res.status(400).json({ error: 'Contact details and mainData are required.' });
    }

    const timestamp = Date.now();
    const safeName = contactDetails.name.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    const fileName = `${safeName}_architecture_design_${timestamp}.pdf`;

    const pdfResp = await generateArchitectureDesignPDF(contactDetails, mainData);
    let pdfBuffer;
    if (pdfResp.message) {
        pdfBuffer = pdfResp.buffer;
        console.log('✅ Architecture PDF generated successfully.');
    } else {
        console.error('❌ Error generating architecture PDF:', err);
        return res.status(500).json({ error: 'PDF generation failed', details: err.toString() });
    }

    const adminMailContent = getCompiledTemplate('architecture-request.html', { username: "Admin" });
    const userMailContent = getCompiledTemplate('architecture-request.html', { username: contactDetails.name });

    try {
        await sendEmail({
            to: [`${process.env.ADMIN_EMAIL}`],
            subject: `New Architecture Design Request - ${contactDetails.name}`,
            html: adminMailContent,
            attachments: [{
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        await sendEmail({
            to: contactDetails.email,
            subject: `Your architecture design request has been received - ${contactDetails.name}`,
            html: userMailContent,
            attachments: [{
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        console.log('📧 Architecture request emails sent successfully.');
        res.status(200).json({ message: 'Architecture request submitted and emails sent!' });

    } catch (error) {
        console.error('❌ Email sending failed:', error);
        res.status(500).json({ error: 'Email sending failed', reason: error.toString() });
    }
});

app.post("/submit-interior-design", async (req, res) => {
    const { contactDetails, designDetails } = req.body;

    if (!contactDetails || !designDetails) {
        return res.status(400).json({ error: 'Contact details and designDetails are required.' });
    }

    const timestamp = Date.now();
    const safeName = contactDetails.name.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    const fileName = `${safeName}_interior_design_${timestamp}.pdf`;


    const pdfResp = await generateInteriorDesignPDF(contactDetails, designDetails);
    let pdfBuffer;
    if (pdfResp.message) {
        pdfBuffer = pdfResp.buffer;
        console.log('✅ Interior Design PDF generated successfully.');
    } else {
        console.error('❌ Error generating PDF:', err);
        return res.status(500).json({ error: 'PDF generation failed', details: err.toString() });
    }

    const adminMailContent = getCompiledTemplate('interior-request.html', { username: "Admin" });
    const userMailContent = getCompiledTemplate('interior-request.html', { username: contactDetails.name });

    try {
        await sendEmail({
            to: [`${process.env.ADMIN_EMAIL}`],
            subject: `New Interior Design Request - ${contactDetails.name}`,
            html: adminMailContent,
            attachments: [{
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        // Optional: Send to user
        await sendEmail({
            to: contactDetails.email,
            subject: `Your interior design request has been received - ${contactDetails.name}`,
            html: userMailContent,
            attachments: [{
                filename: fileName,
                content: pdfBuffer,
                contentType: 'application/pdf'
            }]
        });

        console.log('📧 Interior request emails sent successfully.');
        res.status(200).json({ message: 'Interior design request submitted and emails sent!' });

    } catch (error) {
        console.error('❌ Email sending failed:', error);
        res.status(500).json({ error: 'Email sending failed', reason: error.toString() });
    }
});

app.post("/submit-contact-details", async (req, res) => {
    const contactDetails = req.body;

    if (!contactDetails) {
        return res.status(400).json({ error: 'Contact details are required.' });
    }

    const adminMailContent = getCompiledTemplate('contact-details.html', contactDetails);

    try {
        await sendEmail({
            to: [`${process.env.ADMIN_EMAIL}`],
            subject: `New Contact Request - ${contactDetails.name}`,
            html: adminMailContent,
        });

        console.log('📧 Contact request emails sent successfully.');
        res.status(200).json({ message: 'Contact request submitted successfully' });

    } catch (error) {
        console.error('❌ Email sending failed:', error);
        res.status(500).json({ error: 'Email sending failed', reason: error.toString() });
    }
});

app.get("/", (req, res) => {
    return res.status(200).json({ "status": "UP" })
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/builders", builderRouter);
app.use("/api/v1/properties", propertyRouter);

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('✅ Connected to MongoDB');

    initializeDefaultAdmin();

    app.listen(PORT, () => {
        console.log(`🚀 Server started on http://localhost:${PORT}`);
    });

}).catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
});

