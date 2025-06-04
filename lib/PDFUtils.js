const pdf = require('html-pdf-node');

const generateQuotePDF = async (contactDetails, quoteDetails, builderDetails = []) => {

    const builderHTML = builderDetails.length ? `
        <h2>Builder Details</h2>
        <table>
            <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Phone</th>
                <th>Email</th>
            </tr>
            ${builderDetails.map(builder => `
                <tr>
                    <td>${builder.name}</td>
                    <td>${builder.id}</td>
                    <td>${builder.phone}</td>
                    <td>${builder.email}</td>
                </tr>
            `).join('')}
        </table>
    ` : '';

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
                th { background-color: rgba(243, 243, 243, 0.68); }
            </style>
        </head>
        <body>
            <img src="https://res.cloudinary.com/ddm2qblsr/image/upload/v1744511093/full-removebg-preview_evknaa.png" class="watermark" />
            <div class="content">
                <h1>${builderDetails.length ? "Multiple" : ''} Quote Request for ${contactDetails.name}</h1>

                <h2>Contact Details</h2>
                <table>
                    <tr><th>Name</th><td>${contactDetails.name}</td></tr>
                    <tr><th>Email</th><td>${contactDetails.email}</td></tr>
                    <tr><th>Phone</th><td>${contactDetails.phone}</td></tr>
                    <tr><th>Address</th><td>${contactDetails.address}</td></tr>
                </table>

                ${builderHTML}

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
        const pdfBuffer = await pdf.generatePdf(file, {
            format: 'A4',
            timeout: 60000
        });
        console.log('PDF generated successfully in memory.');
        return { message: "PDF generated successfully in memory.", buffer: pdfBuffer };
    } catch (e) {
        console.error('Error generating PDF:', e);
        return { error: 'Error generating PDF', errorMsg: e.toString() };
    }
};

const generateMaterialOrderPDF = async (contactDetails, groupedMaterials) => {
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
                <h1>Material Order for ${contactDetails.name}</h1>
    
                <h2>Contact Details</h2>
                <table>
                    <tr><th>Name</th><td>${contactDetails.name}</td></tr>
                    <tr><th>Email</th><td>${contactDetails.email}</td></tr>
                    <tr><th>Phone</th><td>${contactDetails.phone}</td></tr>
                    <tr><th>Address</th><td>${contactDetails.address}</td></tr>
                </table>
    
                ${groupedMaterials.map(group => `
                    <h2>${group.section}</h2>
                    <table>
                        <tr>
                            <th>Material</th>
                            <th>Grade</th>
                            <th>Unit</th>
                            <th>Quantity</th>
                            <th>Brand</th>
                            <th>File Link</th>
                        </tr>
                        ${group.items.map(item => `
                            <tr>
                                <td>${item.material}</td>
                                <td>${item.grade}</td>
                                <td>${item.unit}</td>
                                <td>${item.quantity}</td>
                                <td>${item.brand}</td>
                                <td>
                                    ${item.fileUrl
            ? `<a href="${item.fileUrl}" target="_blank" rel="noopener noreferrer" style="color: #0077cc; text-decoration: underline;">View File</a>`
            : '—'}
                                </td>
                            </tr>
                        `).join('')}
                    </table>
                `).join('')}
                
            </div>
        </body>
    </html>
    `;

    let pdfBuffer;
    try {
        const file = { content: htmlContent };
        pdfBuffer = await pdf.generatePdf(file, {
            format: 'A4',
            timeout: 60000
        });
        return { message: 'PDF generated successfully.', buffer: pdfBuffer };
    } catch (err) {
        console.error('❌ Error generating PDF:', err);
        return { error: 'PDF generation failed', details: err.toString() };
    }
}

const generateArchitectureDesignPDF = async (contactDetails, mainData) => {
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
                th { background-color: rgba(243, 243, 243, 0.68); }
            </style>
        </head>
        <body>
            <img src="https://res.cloudinary.com/ddm2qblsr/image/upload/v1744511093/full-removebg-preview_evknaa.png" class="watermark" />
            <div class="content">
                <h1>Architecture Design Request - ${contactDetails.name}</h1>

                <h2>Contact Details</h2>
                <table>
                    <tr><th>Name</th><td>${contactDetails.name}</td></tr>
                    <tr><th>Email</th><td>${contactDetails.email}</td></tr>
                    <tr><th>Phone</th><td>${contactDetails.phone}</td></tr>
                    <tr><th>Address</th><td>${contactDetails.address}</td></tr>
                </table>

                <h2>Requested Services</h2>
                <table>
                    <tr>
                        <th>Service Name</th>
                        <th>Description</th>
                        <th>Included</th>
                    </tr>
                    ${mainData.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.description || '-'}</td>
                            <td>${item.option === 'Yes' ? '✅ Yes' : '❌ No'}</td>
                        </tr>
                    `).join('')}
                </table>
            </div>
        </body>
    </html>
    `;

    let pdfBuffer;
    try {
        const file = { content: htmlContent };
        pdfBuffer = await pdf.generatePdf(file, {
            format: 'A4',
            timeout: 60000
        });
        return {message: 'Architecture PDF generated successfully.', buffer: pdfBuffer};
    } catch (err) {
        console.error('❌ Error generating architecture PDF:', err);
        return { error: 'PDF generation failed', details: err.toString() };
    }
}

const generateInteriorDesignPDF = async (contactDetails, designDetails) => {
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
                    th { background-color: rgba(243, 243, 243, 0.68); }
                </style>
            </head>
            <body>
                <img src="https://res.cloudinary.com/ddm2qblsr/image/upload/v1744511093/full-removebg-preview_evknaa.png" class="watermark" />
                <div class="content">
                    <h1>Interior Design Request - ${contactDetails.name}</h1>
    
                    <h2>Contact Details</h2>
                    <table>
                        <tr><th>Name</th><td>${contactDetails.name}</td></tr>
                        <tr><th>Email</th><td>${contactDetails.email}</td></tr>
                        <tr><th>Phone</th><td>${contactDetails.phone}</td></tr>
                        <tr><th>Address</th><td>${contactDetails.address}</td></tr>
                    </table>
    
                    <h2>Interior Design Specifications</h2>
                    <table>
                        <tr><th>Feature</th><th>Value</th></tr>
                        ${Object.entries(designDetails).map(([key, value]) => `
                            <tr>
                                <td>${key.charAt(0).toUpperCase() + key.slice(1)}</td>
                                <td>${typeof value === 'boolean' ? (value ? '✅ Yes' : '❌ No') : value}</td>
                            </tr>
                        `).join('')}
                    </table>
                </div>
            </body>
        </html>
        `;
    
        let pdfBuffer;
        try {
            const file = { content: htmlContent };
            pdfBuffer = await pdf.generatePdf(file, {
                format: 'A4',
                timeout: 60000
            });
            return {message: 'Interior Design PDF generated successfully.', buffer: pdfBuffer};
        } catch (err) {
            console.error('❌ Error generating PDF:', err);
            return { error: 'PDF generation failed', details: err.toString() };
        }
}

module.exports = { 
    generateQuotePDF, 
    generateMaterialOrderPDF, 
    generateArchitectureDesignPDF, 
    generateInteriorDesignPDF 
}
