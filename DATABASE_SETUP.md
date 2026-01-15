# Configuración de Base de Datos

Este documento explica cómo configurar la base de datos de Supabase para el proyecto Marketplace.

## Requisitos Previos

1. Una cuenta en [Supabase](https://supabase.com)
2. Un proyecto creado en Supabase
3. Acceso al SQL Editor de Supabase

## Pasos de Instalación

### 1. Ejecutar el Script SQL Principal

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Navega a **SQL Editor** en el menú lateral
3. Haz clic en **New Query**
4. Abre el archivo `supabase-complete-setup.sql` del repositorio
5. Copia y pega todo el contenido en el editor
6. Haz clic en **Run** (o presiona `Ctrl+Enter`)

**Nota:** Este script es **idempotente**, lo que significa que puedes ejecutarlo múltiples veces sin problemas. Si algo ya existe, simplemente se omitirá.

### 2. Verificar la Instalación

Después de ejecutar el script, puedes verificar que todo se creó correctamente ejecutando estas consultas en el SQL Editor:

```sql
-- Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('businesses', 'products', 'notifications');

-- Verificar que los triggers están creados
SELECT tgname, tgrelid::regclass, 
  CASE tgenabled 
    WHEN 'O' THEN '✅ Enabled'
    WHEN 'D' THEN '❌ Disabled'
    ELSE '❓ Unknown'
  END as status
FROM pg_trigger 
WHERE tgname IN ('trigger_product_added', 'trigger_product_sold', 'trigger_business_added');

-- Verificar que las funciones existen
SELECT proname 
FROM pg_proc 
WHERE proname IN (
  'notify_product_added', 
  'notify_product_sold', 
  'notify_business_added',
  'mark_notification_read', 
  'mark_all_notifications_read', 
  'get_unread_notifications_count'
);

-- Verificar Realtime
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('businesses', 'products', 'notifications');
```

### 3. Configurar Storage (Opcional pero Recomendado)

Para subir imágenes de productos, necesitas configurar un bucket de Storage:

1. Ve a **Storage** en el Dashboard de Supabase
2. Haz clic en **New bucket**
3. Nombre: `marketplace-images`
4. Marca como **PUBLIC** (para que las imágenes sean accesibles públicamente)
5. Haz clic en **Create bucket**

Después de crear el bucket, configura las políticas de acceso:

1. Ve a **Storage** > **marketplace-images** > **Policies**
2. Crea las siguientes políticas:

**Política 1: Lectura Pública**
- Nombre: "Public read access"
- Operación: SELECT
- Definición: `(bucket_id = 'marketplace-images')`
- Expresión USING: `true`

**Política 2: Subir Archivos**
- Nombre: "Allow uploads"
- Operación: INSERT
- Definición: `(bucket_id = 'marketplace-images')`
- Expresión USING: `true`
- Expresión WITH CHECK: `true`

**Política 3: Actualizar Archivos**
- Nombre: "Allow updates"
- Operación: UPDATE
- Definición: `(bucket_id = 'marketplace-images')`
- Expresión USING: `true`
- Expresión WITH CHECK: `true`

**Política 4: Eliminar Archivos**
- Nombre: "Allow deletes"
- Operación: DELETE
- Definición: `(bucket_id = 'marketplace-images')`
- Expresión USING: `true`

## ¿Qué Crea el Script?

El script `supabase-complete-setup.sql` crea:

### Tablas
- ✅ `businesses` - Almacena información de negocios
- ✅ `products` - Almacena información de productos
- ✅ `notifications` - Almacena notificaciones del sistema

### Índices
- ✅ Índices en `products` para mejor rendimiento (business_id, status, category, etc.)
- ✅ Índices en `notifications` para búsquedas rápidas

### Seguridad (RLS)
- ✅ Row Level Security habilitado en todas las tablas
- ✅ Políticas que permiten todas las operaciones (puedes restringirlas después)

### Realtime
- ✅ Suscripciones en tiempo real habilitadas para:
  - `businesses`
  - `products`
  - `notifications`

### Triggers Automáticos
- ✅ `trigger_product_added` - Crea notificación cuando se agrega un producto
- ✅ `trigger_product_sold` - Crea notificación cuando un producto se marca como vendido
- ✅ `trigger_business_added` - Crea notificación cuando se agrega un negocio

### Funciones Helper
- ✅ `mark_notification_read()` - Marca una notificación como leída
- ✅ `mark_all_notifications_read()` - Marca todas las notificaciones como leídas
- ✅ `get_unread_notifications_count()` - Obtiene el contador de no leídas

## Solución de Problemas

### Error: "relation already exists"
Este error es normal si ejecutas el script múltiples veces. El script usa `IF NOT EXISTS` para evitar este problema, pero si aparece, simplemente ignóralo o elimina las tablas existentes primero.

### Error: "policy already exists"
Si ves este error, significa que las políticas ya existen. El script ahora incluye `DROP POLICY IF EXISTS` para evitar este problema.

### Error: "table is already in publication"
Este error puede aparecer si Realtime ya está configurado. El script ahora verifica antes de agregar las tablas a la publicación.

### Los triggers no funcionan
1. Verifica que los triggers estén habilitados:
   ```sql
   SELECT tgname, tgenabled FROM pg_trigger 
   WHERE tgname LIKE 'trigger_%';
   ```
   `tgenabled` debe ser `'O'` (enabled)

2. Prueba crear un producto de prueba y verifica que se crea la notificación automáticamente.

### Realtime no funciona
1. Ve a **Database** > **Replication** en el Dashboard
2. Verifica que las tablas `businesses`, `products` y `notifications` estén habilitadas
3. Si no están, habilítalas manualmente con el toggle

## Scripts Adicionales

### `create-retroactive-notifications.sql`
Si ya tienes productos/negocios creados antes de ejecutar el script principal, puedes usar este script para crear notificaciones retroactivas (solo para los últimos 30 días).

### `test-notifications.sql`
Script de prueba para verificar que los triggers funcionan correctamente.

## Notas Importantes

- ✅ El script es **seguro de ejecutar múltiples veces**
- ✅ No elimina datos existentes
- ✅ Usa `IF NOT EXISTS` y `DROP IF EXISTS` para evitar conflictos
- ✅ Las políticas RLS permiten todas las operaciones por defecto (puedes restringirlas después según tus necesidades de seguridad)

## Próximos Pasos

Después de ejecutar el script:

1. ✅ Configura las variables de entorno en tu proyecto (`.env` o `.env.local`):
   ```
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima
   ```

2. ✅ Configura el bucket de Storage (ver paso 3 arriba)

3. ✅ Inicia la aplicación y verifica que se conecta correctamente a Supabase

4. ✅ Crea un negocio y un producto de prueba para verificar que todo funciona
