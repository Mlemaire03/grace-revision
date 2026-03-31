// api/feedback.js — Envoie les feedbacks Context Pack par email via Resend

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé Resend manquante' });
  }

  const { section, type, description, date } = req.body;

  if (!description || !description.trim()) {
    return res.status(400).json({ error: 'Description manquante' });
  }

  const emailHtml = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f7f5f1;padding:32px;">
      <div style="background:#1a3a2a;padding:20px 28px;margin-bottom:0;">
        <span style="font-family:Georgia,serif;font-size:28px;color:#b8963e;letter-spacing:0.2em;">GRACE</span>
        <span style="font-size:12px;color:rgba(255,255,255,0.5);margin-left:16px;letter-spacing:0.1em;text-transform:uppercase;">Feedback Context Pack</span>
      </div>
      <div style="background:white;padding:28px;border-left:3px solid #b8963e;">
        <p style="font-size:11px;color:#7a756e;text-transform:uppercase;letter-spacing:0.15em;margin-bottom:20px;">Nouveau feedback reçu · ${date || new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr>
            <td style="padding:10px 14px;background:#e8f0eb;font-size:11px;font-weight:700;color:#2d5a40;text-transform:uppercase;letter-spacing:0.1em;width:140px;vertical-align:top;">Section</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e0dbd3;font-size:13px;color:#0f0f0f;">${section || '—'}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;background:#e8f0eb;font-size:11px;font-weight:700;color:#2d5a40;text-transform:uppercase;letter-spacing:0.1em;vertical-align:top;">Type</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e0dbd3;font-size:13px;color:#0f0f0f;">${type || '—'}</td>
          </tr>
          <tr>
            <td style="padding:10px 14px;background:#e8f0eb;font-size:11px;font-weight:700;color:#2d5a40;text-transform:uppercase;letter-spacing:0.1em;vertical-align:top;">Description</td>
            <td style="padding:10px 14px;font-size:13px;color:#0f0f0f;line-height:1.65;">${description.replace(/\n/g, '<br>')}</td>
          </tr>
        </table>

        <div style="background:#f7f5f1;border-left:2px solid #b8963e;padding:12px 16px;font-size:12px;color:#7a756e;line-height:1.6;">
          💡 Ce feedback est à intégrer dans <strong style="color:#1a3a2a;">bongenie-context.md</strong> puis à soumettre pour mise à jour du prompt Grace.
        </div>
      </div>
      <p style="font-size:11px;color:#b0a8a0;text-align:center;margin-top:16px;">Grace · Pôle Transformation & Technologie · Bongenie Grieder</p>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: 'Grace <onboarding@resend.dev>',
        to: [process.env.FEEDBACK_EMAIL || 'votre-email@bongenie.ch'],
        subject: `[Grace] Feedback Context Pack · ${section || 'Général'}`,
        html: emailHtml,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(500).json({ error: data.message || 'Erreur envoi email' });
    }

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error('Feedback error:', err);
    return res.status(500).json({ error: err.message });
  }
};
