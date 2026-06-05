export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const nit = (req.query.nit || '').replace(/[.\-\s]/g, '');

  if (!nit) return res.status(400).json({ error: 'NIT requerido' });

  const local = {
    "9014725487": { razonSocial: "Paisamole SAS", ciudad: "Medellín, Antioquia", direccion: "Medellín" },
    "8001259891": { razonSocial: "Supermercados La 14 S.A.", ciudad: "Cali, Valle del Cauca", direccion: "Calle 5 # 44-20, Cali" },
    "8909039388": { razonSocial: "Almacenes Éxito S.A.", ciudad: "Medellín, Antioquia", direccion: "Carrera 48 # 32-195, Medellín" },
    "8600915522": { razonSocial: "Grupo Éxito S.A.", ciudad: "Medellín, Antioquia", direccion: "Carrera 48 # 32-195" },
    "8300038650": { razonSocial: "Olímpica S.A.", ciudad: "Barranquilla, Atlántico", direccion: "Carrera 46 # 68-10" },
    "8909525609": { razonSocial: "Makro Supermayorista S.A.S.", ciudad: "Bogotá, Cundinamarca", direccion: "Av. NQS # 20-23" },
  };

  if (local[nit]) {
    return res.status(200).json({ ok: true, ...local[nit] });
  }

  if (nit.length >= 9) {
    return res.status(200).json({
      ok: false,
      pendienteVerificacion: true,
      mensaje: 'NIT no encontrado. Ingresa la razón social manualmente.'
    });
  }

  return res.status(200).json({ ok: false, mensaje: 'NIT no válido.' });
}
