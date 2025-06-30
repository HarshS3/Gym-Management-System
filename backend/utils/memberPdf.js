// import puppeteer from 'puppeteer';
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();

// export const emailMemberJsPdf = async (member) => {
//   try {
//     const measurements = member.bodyMeasurements || {};
//     const workout = member.workoutRoutine || {};
//     const trainer = member.personalTrainer || {};

//     const html = `
//       <html>
//         <head>
//           <style>
//             body { font-family: Arial; padding: 30px; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
//             th { background-color: #2980b9; color: white; }
//             h2, h3 { color: #2c3e50; }
//           </style>
//         </head>
//         <body>
//           <h2>${member.name}'s Profile</h2>
//           <table>
//             <tr><th>Field</th><th>Value</th></tr>
//             <tr><td>Member ID</td><td>${member._id}</td></tr>
//             <tr><td>Email</td><td>${member.email}</td></tr>
//             <tr><td>Phone</td><td>${member.phone}</td></tr>
//             <tr><td>Gender</td><td>${member.gender}</td></tr>
//             <tr><td>Age</td><td>${member.age}</td></tr>
//             <tr><td>Address</td><td>${member.address}</td></tr>
//             <tr><td>Status</td><td>${member.status || 'Active'}</td></tr>
//             <tr><td>Membership</td><td>${member.membership?.months || 'N/A'} month(s)</td></tr>
//             <tr><td>Next Bill Date</td><td>${new Date(member.nextBillDate).toLocaleDateString()}</td></tr>
//           </table>

//           <h3>Health Metrics</h3>
//           <table>
//             <tr><th>Metric</th><th>Value</th></tr>
//             <tr><td>Height</td><td>${member.height} cm</td></tr>
//             <tr><td>Weight</td><td>${member.weight} kg</td></tr>
//             <tr><td>BMI</td><td>${member.bmi}</td></tr>
//             <tr><td>Body Fat</td><td>${member.bodyFat || 'N/A'}%</td></tr>
//             <tr><td>Muscle Mass</td><td>${member.muscleMass || 'N/A'} kg</td></tr>
//           </table>

//           <h3>Body Measurements</h3>
//           <table>
//             <tr><th>Part</th><th>Value</th></tr>
//             ${Object.entries(measurements).map(([key, value]) =>
//               `<tr><td>${key.charAt(0).toUpperCase() + key.slice(1)}</td><td>${value || 'N/A'} cm</td></tr>`
//             ).join('')}
//           </table>

//           <h3>Workout Routine</h3>
//           <table>
//             <tr><th>Day</th><th>Routine</th></tr>
//             ${Object.entries(workout).map(([day, plan]) =>
//               `<tr><td>${day.charAt(0).toUpperCase() + day.slice(1)}</td><td>${plan}</td></tr>`
//             ).join('')}
//           </table>

//           <h3>Personal Trainer</h3>
//           <table>
//             <tr><th>Name</th><td>${trainer.name || 'N/A'}</td></tr>
//             <tr><th>Phone</th><td>${trainer.phone || 'N/A'}</td></tr>
//           </table>

//           <h3>Notes</h3>
//           <p>${member.notes || 'No notes added.'}</p>
//         </body>
//       </html>
//     `;

//     const browser = await puppeteer.launch({
//       headless: "new",
//       args: ['--no-sandbox', '--disable-setuid-sandbox']
//     });
//     const page = await browser.newPage();
//     await page.setContent(html, { waitUntil: 'networkidle0' });

//     const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
//     await browser.close();

//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//       tls: {
//         rejectUnauthorized: false,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: member.email,
//       subject: `${member.name}'s Gym Profile PDF`,
//       text: `Hi ${member.name},\n\nFind your profile attached as a PDF.`,
//       attachments: [
//         {
//           filename: `${member.name.replace(/\s+/g, '_')}_profile.pdf`,
//           content: pdfBuffer,
//           contentType: 'application/pdf',
//         }
//       ]
//     });

//     return true;

//   } catch (err) {
//     console.error("❌ Failed to generate or send member PDF:", err);
//     return false;
//   }
// };


import puppeteer from 'puppeteer';
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';
// dotenv.config();

export const emailMemberJsPdf = async (member) => {
  try {
    const measurements = member.bodyMeasurements || {};
    const workout = member.workoutRoutine || {};
    const trainer = member.personalTrainer || {};

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial; padding: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            th { background-color: #2980b9; color: white; }
            h2, h3 { color: #2c3e50; }
          </style>
        </head>
        <body>
          <h2>${member.name}'s Profile</h2>
          <table>
            <tr><th>Field</th><th>Value</th></tr>
            <tr><td>Member ID</td><td>${member._id}</td></tr>
            <tr><td>Email</td><td>${member.email}</td></tr>
            <tr><td>Phone</td><td>${member.phone}</td></tr>
            <tr><td>Gender</td><td>${member.gender}</td></tr>
            <tr><td>Age</td><td>${member.age}</td></tr>
            <tr><td>Address</td><td>${member.address}</td></tr>
            <tr><td>Status</td><td>${member.status || 'Active'}</td></tr>
            <tr><td>Membership</td><td>${member.membership?.months || 'N/A'} month(s)</td></tr>
            <tr><td>Next Bill Date</td><td>${new Date(member.nextBillDate).toLocaleDateString()}</td></tr>
          </table>

          <h3>Health Metrics</h3>
          <table>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Height</td><td>${member.height} cm</td></tr>
            <tr><td>Weight</td><td>${member.weight} kg</td></tr>
            <tr><td>BMI</td><td>${member.bmi}</td></tr>
            <tr><td>Body Fat</td><td>${member.bodyFat || 'N/A'}%</td></tr>
            <tr><td>Muscle Mass</td><td>${member.muscleMass || 'N/A'} kg</td></tr>
          </table>

          <h3>Body Measurements</h3>
          <table>
            <tr><th>Part</th><th>Value</th></tr>
            ${Object.entries(measurements).map(([key, value]) =>
              `<tr><td>${key.charAt(0).toUpperCase() + key.slice(1)}</td><td>${value || 'N/A'} cm</td></tr>`
            ).join('')}
          </table>

          <h3>Workout Routine</h3>
          <table>
            <tr><th>Day</th><th>Routine</th></tr>
            ${Object.entries(workout).map(([day, plan]) =>
              `<tr><td>${day.charAt(0).toUpperCase() + day.slice(1)}</td><td>${plan}</td></tr>`
            ).join('')}
          </table>

          <h3>Personal Trainer</h3>
          <table>
            <tr><th>Name</th><td>${trainer.name || 'N/A'}</td></tr>
            <tr><th>Phone</th><td>${trainer.phone || 'N/A'}</td></tr>
          </table>

          <h3>Notes</h3>
          <p>${member.notes || 'No notes added.'}</p>
        </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: "new",
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    await browser.close();

    // Return the generated PDF buffer so it can be sent by the caller
    return pdfBuffer;
  } catch (err) {
    console.error("❌ Failed to generate or send member PDF:", err);
    return null;
  }
};

