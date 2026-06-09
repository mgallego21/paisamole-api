export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const nit = (req.query.nit || '').replace(/[.\-\s]/g, '');
  if (!nit) return res.status(400).json({ error: 'NIT requerido' });

  // 1. Base local (respuesta inmediata para clientes frecuentes)
  const local = BASE_LOCAL[nit];
  if (local) return res.status(200).json({ ok: true, fuente: 'local', ...local });

  // 2. API Colombia (api.co) - gratuita, sin token
  try {
    const r = await fetch(`https://api.co/rues/nit/${nit}`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    });
    if (r.ok) {
      const d = await r.json();
      if (d && (d.razon_social || d.nombre)) {
        return res.status(200).json({
          ok: true, fuente: 'api.co',
          razonSocial: d.razon_social || d.nombre || '',
          ciudad: d.municipio || d.ciudad || 'Colombia',
          direccion: d.direccion || '',
          estado: d.estado || 'ACTIVA',
        });
      }
    }
  } catch(e) {}

  // 3. OpenAPI RUES (endpoint alternativo)
  try {
    const r = await fetch(`https://www.rues.org.co/RM/api/RM/BusquedaEmpresa?TipoIdentificacion=NI&Identificacion=${nit}`, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://www.rues.org.co/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    if (r.ok) {
      const d = await r.json();
      const emp = d?.resultado?.[0] || d?.[0];
      if (emp) {
        return res.status(200).json({
          ok: true, fuente: 'rues',
          razonSocial: emp.razon_social || emp.nombre || '',
          ciudad: emp.municipio || emp.ciudad || 'Colombia',
          direccion: emp.direccion || '',
          estado: emp.estado_matricula || 'ACTIVA',
          camara: emp.camara_comercio || '',
        });
      }
    }
  } catch(e) {}

  // 4. NIT válido pero no encontrado — ingresar manualmente
  if (nit.length >= 9) {
    return res.status(200).json({
      ok: false,
      pendienteVerificacion: true,
      mensaje: 'NIT no encontrado automáticamente. Por favor ingresa la razón social manualmente.'
    });
  }

  return res.status(200).json({ ok: false, mensaje: 'NIT no válido. Verifica el número.' });
}

const BASE_LOCAL = {
  "9014725487": { razonSocial: "Paisamole SAS", ciudad: "Medellín, Antioquia", direccion: "Medellín" },
  "9015579390": { razonSocial: "AVOPAK SAS", ciudad: "Medellín, Antioquia", direccion: "Medellín" },
  "8001259891": { razonSocial: "Supermercados La 14 S.A.", ciudad: "Cali, Valle del Cauca", direccion: "Calle 5 # 44-20, Cali" },
  "8909039388": { razonSocial: "Almacenes Éxito S.A.", ciudad: "Medellín, Antioquia", direccion: "Carrera 48 # 32-195, Medellín" },
  "8600915522": { razonSocial: "Grupo Éxito S.A.", ciudad: "Medellín, Antioquia", direccion: "Carrera 48 # 32-195" },
  "8300038650": { razonSocial: "Olímpica S.A.", ciudad: "Barranquilla, Atlántico", direccion: "Carrera 46 # 68-10" },
  "8909525609": { razonSocial: "Makro Supermayorista S.A.S.", ciudad: "Bogotá, Cundinamarca", direccion: "Av. NQS # 20-23" },
  "8600296529": { razonSocial: "PriceSmart Colombia S.A.S.", ciudad: "Bogotá, Cundinamarca", direccion: "Autopista Norte" },
  "9001285976": { razonSocial: "Mercadería Justo & Bueno S.A.S.", ciudad: "Bogotá, Cundinamarca", direccion: "Bogotá" },
  "8909186633": { razonSocial: "Cencosud Colombia S.A.", ciudad: "Bogotá, Cundinamarca", direccion: "Av. El Dorado" },
};
