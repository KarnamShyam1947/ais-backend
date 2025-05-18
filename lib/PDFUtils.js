const pdf = require('html-pdf-node');

const  generateQuotePDF = async (contactDetails, quoteDetails) => {
    const timestamp = Date.now();
    const safeName = contactDetails.name.replace(/\s+/g, '_').replace(/[^\w\-]/g, '');
    const fileName = `${safeName}_${timestamp}.pdf`;

    const htmlContent = `
    <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    padding: 40px;
                    position: relative;
                }
                .watermark {
                    position: fixed;
                    top: 35%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-30deg);
                    opacity: 0.2;
                    width: 70%;
                    z-index: 0;
                    pointer-events: none;
                }
                .content {
                    position: relative;
                    z-index: 1;
                }
                h1 { text-align: center; }
                h2 { margin-top: 40px; color: #444; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background-color:rgba(243, 243, 243, 0.68); }
            </style>
        </head>
        <body>
            <img src="https://res.cloudinary.com/ddm2qblsr/image/upload/v1744511093/full-removebg-preview_evknaa.png" class="watermark" />
            <div class="content">
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
            </div>
        </body>
    </html>
    `;

    try {
        const file = { content: htmlContent };
        pdfBuffer = await pdf.generatePdf(file, {
            format: 'A4',
            timeout: 60000
        });
        console.log('PDF generated successfully in memory.');
        return { message: "PDF generated successfully in memory.", buffer: pdfBuffer };
    } catch (e) {
        console.error('Error generating PDF:', e);
        return  { error: 'Error generating PDF', errorMsg: e.toString() };
    }
}

module.exports = { generateQuotePDF }
