require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/admission', async (req, res) => {
  const d = req.body || {};
  const required = ['applicantName', 'dob', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country', 'course'];
  const missing = required.filter(k => !String(d[k] || '').trim());
  if (missing.length) return res.status(400).json({ message: 'Please complete all required fields.', missing });
  if (!/^\S+@\S+\.\S+$/.test(d.email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(503).json({ message: 'Admission form is ready, but email delivery has not been configured yet. Please configure SMTP settings in the .env file.' });
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
    const labels = {
      applicantName: "Applicant's name", dob: 'Date of birth', gender: 'Gender', age: 'Age', email: 'Email', phone: 'Contact number', bloodGroup: 'Blood group',
      fatherName: "Father's name", fatherPhone: "Father's contact", fatherEmail: "Father's email", fatherQualification: "Father's qualification",
      motherName: "Mother's name", motherPhone: "Mother's contact", motherEmail: "Mother's email", motherQualification: "Mother's qualification",
      address: 'Permanent address', address2: 'Address line 2', city: 'City', state: 'State', postalCode: 'Postal / PIN code', country: 'Country',
      course: 'Course applied for', specialization: 'Department / specialization', batch: 'Preferred batch',
      qualificationLevel: 'Qualification level', board: 'Board / University', passingYear: 'Year of passing', percentage: 'Percentage / CGPA', stream: 'Stream / specialization', declaration: 'Declaration accepted'
    };
    const rows = Object.entries(labels).filter(([k]) => d[k] !== undefined && String(d[k]).trim() !== '').map(([k, label]) => `<tr><td style="padding:9px;border:1px solid #e5e7eb;font-weight:600;background:#f8fafc">${label}</td><td style="padding:9px;border:1px solid #e5e7eb">${escapeHtml(Array.isArray(d[k]) ? d[k].join(', ') : String(d[k]))}</td></tr>`).join('');
    const recipient = process.env.ADMISSIONS_EMAIL || 'build.career@dsilvainstitute.com';
    await transporter.sendMail({
      from: `Dsilva Institute Website <${process.env.SMTP_USER}>`,
      to: recipient,
      cc: process.env.ADMISSIONS_CC || 'sz.dsilva@gmail.com',
      replyTo: d.email,
      subject: `New Admission Application — ${d.applicantName} (${d.course})`,
      html: `<div style="font-family:Arial,sans-serif;max-width:760px;margin:auto;color:#172033"><h2 style="background:#14233f;color:#fff;padding:20px">Dsilva Institute — New Admission Application</h2><p>A new student has submitted the admission application form.</p><table style="width:100%;border-collapse:collapse">${rows}</table><p style="color:#64748b;font-size:12px">Submitted through the Dsilva Institute website.</p></div>`,
      text: Object.entries(labels).filter(([k]) => d[k] !== undefined && String(d[k]).trim() !== '').map(([k, label]) => `${label}: ${Array.isArray(d[k]) ? d[k].join(', ') : d[k]}`).join('\n')
    });
    res.json({ message: 'Your application has been submitted successfully. The admissions team will contact you soon.' });
  } catch (err) {
    console.error('Admission email failed:', err.message);
    res.status(500).json({ message: 'We could not send your application right now. Please try again or contact us by phone.' });
  }
});
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.listen(PORT, () => console.log(`Dsilva Institute website running at http://localhost:${PORT}`));
