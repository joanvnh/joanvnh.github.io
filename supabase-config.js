/**
 * SUPABASE CONFIGURACIÓN PÚBLICA
 * Anon key es pública y segura con RLS policies en la base de datos.
 * ================================================================
 */
const SUPABASE_CONFIG = {
  url: 'https://fkpdprvgmmeudspxmwtf.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcGRwcnZnbW1ldWRzcHhtd3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQxMzc4MTksImV4cCI6MjA5OTcxMzgxOX0.qWYpAzS2MKlhxqPQc2YVETFbQ9NZm74F1m6NbylWdyE'
};

/**
 * Helper genérico para llamar a la API REST de Supabase
 * @param {string} path - Ruta de la API (ej: 'bookings', 'auth/v1/token')
 * @param {object} options - { method, body, params, token }
 */
async function supabaseFetch(path, options = {}) {
  const { method = 'GET', body, params = {}, token } = options;
  
  let url = `${SUPABASE_CONFIG.url}/${path}`;
  const queryParams = new URLSearchParams(params);
  if (queryParams.toString()) url += `?${queryParams.toString()}`;

  const headers = {
    'apikey': SUPABASE_CONFIG.anonKey,
    'Content-Type': 'application/json'
  };

  // Usar token de auth si está disponible (para admin), si no, usar anon key
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    headers['Authorization'] = `Bearer ${SUPABASE_CONFIG.anonKey}`;
    headers['Prefer'] = 'return=minimal';
  }

  const fetchOptions = { method, headers };
  if (body && method !== 'GET') {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);
  const text = await response.text();
  
  if (!response.ok) {
    console.error(`Supabase error ${response.status}:`, text);
    return null;
  }
  
  return text ? JSON.parse(text) : null;
}

// ============================
// FUNCIONES PÚBLICAS (formulario)
// ============================

/**
 * Guardar una reserva en Supabase (usa anon key + RLS)
 */
async function saveBooking(bookingData) {
  return supabaseFetch('rest/v1/bookings', {
    method: 'POST',
    body: {
      name: bookingData.name,
      phone: bookingData.phone,
      service: bookingData.service,
      date: bookingData.date,
      time: bookingData.time,
      details: bookingData.details || '',
      status: 'pending'
    }
  });
}

/**
 * Incrementar el contador de visitas (usa anon key + RLS)
 */
async function incrementVisitCounter() {
  try {
    const counter = await supabaseFetch('rest/v1/visit_counter?id=eq.1', {
      method: 'GET',
      params: { select: 'count' }
    });

    if (!counter || counter.length === 0) return 0;

    const currentCount = counter[0].count;
    const newCount = currentCount + 1;

    await supabaseFetch('rest/v1/visit_counter?id=eq.1', {
      method: 'PATCH',
      body: { count: newCount }
    });

    return newCount;
  } catch (err) {
    console.error('Error con contador Supabase:', err);
    return 0;
  }
}

/**
 * Obtener el contador actual sin incrementar
 */
async function getVisitCount() {
  try {
    const counter = await supabaseFetch('rest/v1/visit_counter?id=eq.1', {
      method: 'GET',
      params: { select: 'count' }
    });
    return counter && counter.length > 0 ? counter[0].count : 0;
  } catch (err) {
    console.error('Error leyendo contador:', err);
    return 0;
  }
}

// ============================
// FUNCIONES DE ADMIN (usan Supabase Auth + RLS)
// ============================

/**
 * Iniciar sesión como admin con email y contraseña
 * @returns {object|null} { user, access_token } o null si falla
 */
async function supabaseSignIn(email, password) {
  const result = await supabaseFetch('auth/v1/token?grant_type=password', {
    method: 'POST',
    body: { email, password },
    token: SUPABASE_CONFIG.anonKey // para auth usamos anon key como token
  });

  if (!result) return null;

  // Verificar si hay error en la respuesta
  if (result.error || !result.access_token) {
    console.error('Error auth:', result.error || 'Sin token');
    return null;
  }

  return {
    user: result.user,
    access_token: result.access_token,
    expires_at: result.expires_at
  };
}

/**
 * Obtener todas las reservas (requiere token de admin autenticado)
 */
async function supabaseGetBookings(token) {
  const data = await supabaseFetch('rest/v1/bookings', {
    method: 'GET',
    params: { order: 'created_at.desc', select: '*' },
    token
  });

  return data || [];
}

/**
 * Actualizar el estado de una reserva (requiere token de admin autenticado)
 */
async function supabaseUpdateBookingStatus(id, status, token) {
  return supabaseFetch(`rest/v1/bookings?id=eq.${id}`, {
    method: 'PATCH',
    body: { status },
    token
  });
}
