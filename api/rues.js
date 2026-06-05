export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { nit } = req.query;
  if (!nit) return res.status(400).json({ error: 'NIT requerido' });

  const nitLimpio = nit.replace(/[.\-\s]/g, '');

  try {
    const token = await obtenerToken();
    if (!token) throw new Error('Sin token');

    const url = `https://ruesapi.rues.org.co/api/ConsultasRUES/BusquedaAvanzadaRM?TipoIdentificacion=NI&Identificacion=${nitLimpio}&Token=${token}`;
    const resp = await fetch(url, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    });

    if (!resp.ok) throw new Error('Error RUES');
    const data = await resp.json();
    const rm = data?.resultado?.[0];

    if (rm) {
      return res.status(200).json({
        ok: true,
        razonSocial: rm.razon_social || rm.nombre || '',
        ciudad: rm.municipio || rm.ciudad || 'Colombia',
        direccion: rm.direccion || '',
        estado: rm.estado_matricula || '',
        camara: rm.camara_comercio || '',
      });
    }
    return res.status(200).json({ ok: false, mensaje: 'NIT no encontrado en RUES' });

  } catch (e) {
    // Fallback: buscar en base local
    const local = BASE_LOCAL[nitLimpio];
    if (local) return res.status(200).json({ ok: true, ...local });
    return res.status(200).json({ ok: false, mensaje: 'No se pudo consultar el RUES. Ingresa la razón social manualmente.' });
  }
}

async function obtenerToken() {
  try {
    const r = await fetch('https://ruesapi.rues.org.co/Token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: 'grant_type=password&username=ruesapp&password=ruesapp'
    });
    const d = await r.json();
    return d?.access_token || null;
  } catch { return null; }
}

const BASE_LOCAL = {
  "9014725487": { razonSocial: "Paisamole SAS", ciudad: "Medellín, Antioquia", direccion: "Medellín" },
  "8001259891": { razonSocial: "Supermercados La 14 S.A.", ciudad: "Cali, Valle del Cauca", direccion: "Calle 5 # 44-20, Cali" },
  "8909039388": { razonSocial: "Almacenes Éxito S.A.", ciudad: "Medellín, Antioquia", direccion: "Carrera 48 # 32-195, Medellín" },
};
