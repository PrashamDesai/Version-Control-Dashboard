const nodemailer = require('nodemailer');

/**
 * Email transporter configured via env vars.
 * Uses SMTP with the provided sender credentials.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Allow self-signed certs on corp mail servers
  tls: { rejectUnauthorized: false },
});

/**
 * Send email notification to a team member when a bug is assigned.
 * @param {Object} opts
 * @param {string} opts.toEmail    - Recipient email
 * @param {string} opts.toName     - Recipient name
 * @param {string} opts.gameName   - Game name the bug belongs to
 * @param {string} opts.gameSlug   - Game slug for the dashboard link
 * @param {string} opts.reportedBy - Name of the user who filed the bug
 * @param {string} opts.where      - Bug location
 * @param {string} opts.how        - Repro steps
 * @param {string} opts.frequency  - Bug frequency
 */
async function sendBugEmail({ toEmail, toName, gameName, gameSlug, reportedBy, where, how, frequency }) {
  if (!process.env.SMTP_USER || !toEmail) return;

  const subject = `🐛 New bug assigned to you – ${gameName}`;
  const dashboardUrl = process.env.DASHBOARD_URL || 'http://localhost:5173';
  const bugUrl = `${dashboardUrl}/games/${gameSlug}/qa-bug`;

  const html = `
    <div style="font-family:sans-serif;max-width:520px;margin:auto;background:#111;color:#e4e4e7;padding:32px;border-radius:12px;border:1px solid #27272a">
      <h2 style="margin:0 0 6px;color:#fff;font-size:18px">🐛 New Bug Assigned</h2>
      <p style="margin:0 0 20px;color:#a1a1aa;font-size:13px">Hi <strong style="color:#f4f4f5">${toName}</strong>, a new bug has been assigned to you.</p>

      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <tr>
          <td style="padding:8px 12px;background:#1c1c1f;border-radius:6px 6px 0 0;color:#a1a1aa;width:120px">Game</td>
          <td style="padding:8px 12px;background:#1c1c1f;border-radius:6px 6px 0 0;color:#f4f4f5;font-weight:600">${gameName}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#a1a1aa;border-top:1px solid #27272a">Reported by</td>
          <td style="padding:8px 12px;color:#f4f4f5;border-top:1px solid #27272a">${reportedBy}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#a1a1aa;border-top:1px solid #27272a">Where</td>
          <td style="padding:8px 12px;color:#f4f4f5;border-top:1px solid #27272a">${where}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;color:#a1a1aa;border-top:1px solid #27272a">How to reproduce</td>
          <td style="padding:8px 12px;color:#f4f4f5;border-top:1px solid #27272a;white-space:pre-line">${how}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;background:#1c1c1f;border-radius:0 0 6px 6px;color:#a1a1aa;border-top:1px solid #27272a">Frequency</td>
          <td style="padding:8px 12px;background:#1c1c1f;border-radius:0 0 6px 6px;color:#f4f4f5;border-top:1px solid #27272a">${frequency}</td>
        </tr>
      </table>

      <div style="margin-top:24px;">
        <a href="${bugUrl}" style="display:inline-block;padding:10px 18px;background:#dc2626;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:6px;">View Bug in Dashboard</a>
      </div>

      <p style="margin:24px 0 0;font-size:11px;color:#52525b">Sent by EchoGames Dash · Do not reply to this email.</p>
    </div>`;

  try {
    await transporter.sendMail({
      from: `"EchoGames" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`[notify] Email sent to ${toEmail}`);
  } catch (err) {
    console.error(`[notify] Email failed: ${err.message}`);
  }
}

/**
 * Central notifier called from bugController when a bug is assigned.
 * Fires email – failures are logged but never throw.
 */
async function notifyBugAssigned({ teamMember, gameName, gameSlug, reportedBy, bug }) {
  const email = teamMember.email;
  const name = teamMember.name;

  const payload = {
    gameName,
    gameSlug,
    reportedBy,
    where: bug.where,
    how: bug.how,
    frequency: bug.frequency,
  };

  if (email) {
    await sendBugEmail({ toEmail: email, toName: name, ...payload });
  }
}

module.exports = { notifyBugAssigned };
