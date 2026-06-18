const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const mediaStorage = require('./mediaStorageService');
const { InspectionReport, InspectionRequest, School, District, GeneratedReport } = require('../models');
const logger = require('../config/logger');

class ReportService {
  async generateInspectionPDF(reportId) {
    logger.info(`Generating PDF report for Inspection Report ID: ${reportId}`);
    
    const report = await InspectionReport.findByPk(reportId, {
      include: [{
        model: InspectionRequest,
        include: [{
          model: School,
          include: [{ model: District }]
        }]
      }]
    });

    if (!report) {
      throw new Error(`Inspection report ${reportId} not found`);
    }

    const school = report.InspectionRequest?.School;
    const district = school?.District;

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });
    const tempFileName = `report-${reportId}-${Date.now()}.pdf`;
    const tempFilePath = path.join(path.resolve(mediaStorage.uploadDir), tempFileName);
    
    const stream = fs.createWriteStream(tempFilePath);
    doc.pipe(stream);

    // Draw header / banner
    doc.fillColor('#1e3a8a')
       .rect(0, 0, 612, 100)
       .fill();

    doc.fillColor('#ffffff')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('GDS SCHOOL INSPECTION REPORT', 50, 35);

    // School Details Section
    doc.fillColor('#000000')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('SCHOOL INFORMATION', 50, 130);

    doc.moveTo(50, 150)
       .lineTo(562, 150)
       .strokeColor('#d1d5db')
       .stroke();

    doc.fontSize(12)
       .font('Helvetica')
       .text(`School Name: ${school?.school_name || 'Unknown'}`, 50, 165)
       .text(`School Code: ${school?.school_code || 'N/A'}`, 50, 185)
       .text(`District: ${district?.district_name || 'N/A'}`, 50, 205)
       .text(`Email: ${school?.email || 'N/A'}`, 50, 225);

    // Inspection Score Section
    doc.fillColor('#1e3a8a')
       .rect(350, 160, 210, 80)
       .fill();
    
    doc.fillColor('#ffffff')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('INSPECTION SCORE', 370, 175)
       .fontSize(28)
       .text(`${report.score || 0}/100`, 370, 195);

    // Inspection Log Info
    doc.fillColor('#000000')
       .fontSize(16)
       .font('Helvetica-Bold')
       .text('INSPECTION METADATA', 50, 270);

    doc.moveTo(50, 290)
       .lineTo(562, 290)
       .strokeColor('#d1d5db')
       .stroke();

    doc.fontSize(12)
       .font('Helvetica')
       .text(`Inspection Request ID: #${report.inspection_request_id}`, 50, 305)
       .text(`Scheduled Date: ${report.schedule_date}`, 50, 325)
       .text(`Completion Date: ${report.completion_date || 'N/A'}`, 50, 345)
       .text(`Status: ${report.status}`, 50, 365);

    // Reviewer/Inspector Details
    doc.text(`Inspector User ID: #${report.inspector_id}`, 350, 305);

    // Feedback Remarks Section
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .text('INSPECTION FEEDBACK & REMARKS', 50, 420);

    doc.moveTo(50, 440)
       .lineTo(562, 440)
       .strokeColor('#d1d5db')
       .stroke();

    doc.fontSize(11)
       .font('Helvetica-Oblique')
       .text(report.feedback || 'No comments or feedback logs provided for this inspection.', 50, 455, {
         width: 512,
         align: 'left',
         lineGap: 4
       });

    // Footer banner
    doc.fontSize(9)
       .fillColor('#9ca3af')
       .font('Helvetica')
       .text('CONFIDENTIAL - GLOBAL DISCOVERY SCHOOLS REGIONAL INVENTORY CONTROL', 50, 720, {
         align: 'center',
         width: 512
       });

    // End document
    doc.end();

    // Wait for the stream to close writing
    await new Promise((resolve, reject) => {
      stream.on('finish', resolve);
      stream.on('error', reject);
    });

    // Handle upload (Local path URL or S3 upload)
    let finalUrl = `/uploads/${tempFileName}`;
    if (mediaStorage.provider === 's3') {
      const fileBuffer = fs.readFileSync(tempFilePath);
      const s3UploadResult = await mediaStorage.uploadFile({
        originalname: tempFileName,
        mimetype: 'application/pdf',
        buffer: fileBuffer
      });
      finalUrl = s3UploadResult.fileUrl;
      
      // Clean up temporary local file
      fs.unlinkSync(tempFilePath);
    }

    // Update the inspection report url
    await report.update({ report_file_url: finalUrl });

    // Also log in GeneratedReport table
    await GeneratedReport.create({
      school_id: school?.id || null,
      report_type: 'INSPECTION',
      date_generated: new Date(),
      generated_by: report.inspector_id,
      file_url: finalUrl
    });

    return finalUrl;
  }
}

module.exports = new ReportService();
