export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { nit } = req.query;
  if (!nit) return res.status(400).json({ error: 'NIT requerido' });

  const nitLimpio = nit.replace(/[.\-\s]/g, '');

  // 1. Base local
  const local = BASE_LOCAL[nitLimpio];
  if (local) return res.status(200).json({ ok: true, fuente: 'local', ...local });

  // 2. API datos.gov.co (abierta, sin token)
  try {
    const url = `https://www.datos.gov.co/resource/c82u-588k.json?$where=nit=${nitLimpio}&$limit=1`;
    const resp = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (resp.ok) {
      const data = await resp.json();
      if (data?.length > 0) {
        const e = data[0];
        return res.status(200).json({
          ok: true, fuente: 'datos.gov',
          razonSocial: e.razon_social || e.nombre_empresa || e.nombre || '',
          ciudad: e.municipio || e.ciudad || 'Colombia',
          direccion: e.direccion || '',
          estado: e.estado || 'ACTIVA',
        });
      }
    }
  } catch (e) {}

  // 3. NIT válido pero no encontrado
  if (nitLimpio.length >= 9) {
    return res.status(200).json({
      ok: false,
      pendienteVerificacion: true,
      mensaje: 'NIT no encontrado. Por favor ingresa la razón social manualmente.'
    });
  }

  return res.status(200).json({ ok: false, mensaje: 'NIT no válido. Verifica el número.' });
}

const BASE_LOCAL = {
  "9014725487": { razonSocial: "Paisamole SAS", ciudad: "Medellín, Antioquia", direccion: "Medellín" },
  "8001259891": { razonSocial: "Supermercados La 14 S.A.", ciudad: "Cali, Valle del Cauca", direccion: "Calle 5 # 44-20, Cali" },
  "8909039388": { razonSocial: "Almacenes Éxito S.A.", ciudad: "Medellín, Antioquia", direccion: "Carrera 48 # 32-195, Medellín" },
  "8600915522": { razonSocial: "Grupo Éxito S.A.", ciudad: "Medellín, Antioquia", direccion: "Carrera 48 # 32-195" },
  "8300038650": { razonSocial: "Olímpica S.A.", ciudad: "Barranquilla, Atlántico", direccion: "Carrera 46 # 68-10" },
  "8909525609": { razonSocial: "Makro Supermayorista S.A.S.", ciudad: "Bogotá, Cundinamarca", direccion: "Av. NQS # 20-23" },
};
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
