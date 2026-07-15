-- ============================================================
-- SQL PARA SUPABASE DASHBOARD
-- Ve a SQL Editor en supabase.com/dashboard y pega esto
-- ============================================================

-- 1. TABLA DE RESERVAS
CREATE TABLE IF NOT EXISTS bookings (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  service TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  details TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled'))
);

-- 2. TABLA DE CONTADOR DE VISITAS
CREATE TABLE IF NOT EXISTS visit_counter (
  id INTEGER PRIMARY KEY DEFAULT 1,
  count BIGINT DEFAULT 0
);

-- Insertar fila inicial del contador
INSERT INTO visit_counter (id, count) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

-- 3. HABILITAR ROW LEVEL SECURITY
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_counter ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS RLS

-- 4a. BOOKINGS: Cualquiera puede INSERTAR una reserva (formulario público)
CREATE POLICY "anon_insert_bookings" ON bookings
  FOR INSERT TO anon
  WITH CHECK (true);

-- 4b. BOOKINGS: Solo usuarios autenticados pueden LEER las reservas (panel admin)
CREATE POLICY "auth_select_bookings" ON bookings
  FOR SELECT TO authenticated
  USING (true);

-- 4c. BOOKINGS: Solo usuarios autenticados pueden ACTUALIZAR estados (panel admin)
CREATE POLICY "auth_update_bookings" ON bookings
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5a. VISIT_COUNTER: Cualquiera puede LEER el contador
CREATE POLICY "anon_select_counter" ON visit_counter
  FOR SELECT TO anon
  USING (true);

-- 5b. VISIT_COUNTER: Cualquiera puede INCREMENTAR (con anon key, sin auth)
CREATE POLICY "anon_update_counter" ON visit_counter
  FOR UPDATE TO anon
  USING (true)
  WITH CHECK (true);
