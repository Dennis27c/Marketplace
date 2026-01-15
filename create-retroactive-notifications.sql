-- Script para crear notificaciones retroactivas para productos y negocios existentes
-- Ejecuta este SQL si ya tienes productos/negocios creados antes de instalar el sistema de notificaciones

-- IMPORTANTE: Este script crea notificaciones para TODOS los productos y negocios existentes
-- Si tienes muchos, considera ejecutarlo solo para los más recientes

-- 1. Crear notificaciones para productos existentes (solo los últimos 30 días)
-- Usa created_at_timestamp si existe, sino created_at
INSERT INTO notifications (type, title, message, link, business_id, product_id, read, created_at)
SELECT 
  'product_added' as type,
  'Nuevo producto agregado' as title,
  p.name || ' fue agregado a ' || COALESCE(b.name, 'el sistema') as message,
  '/products/' || p.id as link,
  p.business_id,
  p.id as product_id,
  true as read, -- Marcar como leídas porque son antiguas
  COALESCE(
    p.created_at_timestamp,
    p.created_at::timestamp,
    NOW()
  ) as created_at
FROM products p
LEFT JOIN businesses b ON b.id = p.business_id
WHERE COALESCE(
    p.created_at_timestamp,
    p.created_at::timestamp,
    NOW()
  ) >= NOW() - INTERVAL '30 days'
  AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.product_id = p.id AND n.type = 'product_added'
  )
ORDER BY p.created_at DESC;

-- 2. Crear notificaciones para productos vendidos existentes
INSERT INTO notifications (type, title, message, link, business_id, product_id, read, created_at)
SELECT 
  'product_sold' as type,
  'Producto vendido' as title,
  p.name || ' fue marcado como vendido' as message,
  '/products/' || p.id as link,
  p.business_id,
  p.id as product_id,
  true as read, -- Marcar como leídas porque son antiguas
  COALESCE(
    p.created_at_timestamp,
    p.created_at::timestamp,
    NOW()
  ) as created_at
FROM products p
WHERE p.status = 'sold'
  AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.product_id = p.id AND n.type = 'product_sold'
  )
ORDER BY p.created_at DESC;

-- 3. Crear notificaciones para negocios existentes (solo los últimos 30 días)
INSERT INTO notifications (type, title, message, link, business_id, read, created_at)
SELECT 
  'business_added' as type,
  'Nuevo negocio agregado' as title,
  b.name || ' fue agregado al sistema' as message,
  '/businesses' as link,
  b.id as business_id,
  true as read, -- Marcar como leídas porque son antiguas
  COALESCE(
    b.created_at_timestamp,
    b.created_at::timestamp,
    NOW()
  ) as created_at
FROM businesses b
WHERE COALESCE(
    b.created_at_timestamp,
    b.created_at::timestamp,
    NOW()
  ) >= NOW() - INTERVAL '30 days'
  AND NOT EXISTS (
    SELECT 1 FROM notifications n 
    WHERE n.business_id = b.id AND n.type = 'business_added'
  )
ORDER BY b.created_at DESC;

-- 4. Verificar cuántas notificaciones se crearon
SELECT 
  type,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE read = false) as unread,
  COUNT(*) FILTER (WHERE read = true) as read
FROM notifications
GROUP BY type
ORDER BY type;

-- 5. Ver las últimas notificaciones creadas
SELECT 
  id,
  type,
  title,
  message,
  read,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;
