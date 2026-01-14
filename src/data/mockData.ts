export interface Business {
  id: string;
  name: string;
  logo: string;
  description: string;
  createdAt: string;
}

export interface Product {
  id: string;
  businessId: string;
  name: string;
  price: number;
  category: string;
  status: 'available' | 'sold' | 'reserved';
  description: string;
  image: string;
  createdAt: string;
}

export const categories = [
  'Electrónica',
  'Ropa y Accesorios',
  'Hogar y Jardín',
  'Deportes',
  'Vehículos',
  'Muebles',
  'Juguetes',
  'Libros',
  'Arte y Manualidades',
  'Otros'
];

export const initialBusinesses: Business[] = [
  {
    id: '1',
    name: 'TechStore Plus',
    logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=100&h=100&fit=crop',
    description: 'Tienda especializada en tecnología y electrónica de consumo. Los mejores productos al mejor precio.',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'ModaUrban',
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&h=100&fit=crop',
    description: 'Moda urbana y accesorios para todos los estilos. Tendencias actuales a precios accesibles.',
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    name: 'Casa & Deco',
    logo: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=100&h=100&fit=crop',
    description: 'Todo para tu hogar: decoración, muebles y artículos de jardín con estilo único.',
    createdAt: '2024-03-10'
  }
];

export const initialProducts: Product[] = [
  // TechStore Plus products
  {
    id: '1',
    businessId: '1',
    name: 'iPhone 14 Pro Max 256GB',
    price: 899,
    category: 'Electrónica',
    status: 'available',
    description: '📱 iPhone 14 Pro Max en excelente estado\n\n✅ 256GB de almacenamiento\n✅ Batería al 95%\n✅ Sin rayones ni golpes\n✅ Incluye caja original y cargador\n✅ Liberado para cualquier operador\n\n💬 Escríbeme para más información\n📍 Entrega en persona o envío disponible',
    image: 'https://images.unsplash.com/photo-1678652197831-2d180705cd2c?w=500&h=500&fit=crop',
    createdAt: '2024-12-01'
  },
  {
    id: '2',
    businessId: '1',
    name: 'MacBook Pro M2 2023',
    price: 1299,
    category: 'Electrónica',
    status: 'available',
    description: '💻 MacBook Pro M2 como nueva\n\n✅ Chip M2 de última generación\n✅ 16GB RAM + 512GB SSD\n✅ Pantalla Retina 14"\n✅ Solo 50 ciclos de batería\n✅ AppleCare+ hasta 2025\n\n🔥 Perfecta para profesionales\n📦 Envío gratis a todo el país',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=500&fit=crop',
    createdAt: '2024-12-05'
  },
  {
    id: '3',
    businessId: '1',
    name: 'AirPods Pro 2da Generación',
    price: 179,
    category: 'Electrónica',
    status: 'reserved',
    description: '🎧 AirPods Pro 2 originales\n\n✅ Cancelación activa de ruido\n✅ Estuche con carga MagSafe\n✅ Batería al 100%\n✅ Sellados en caja\n\n🎵 El mejor sonido Apple\n💯 Garantía de autenticidad',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&h=500&fit=crop',
    createdAt: '2024-12-10'
  },
  // ModaUrban products
  {
    id: '4',
    businessId: '2',
    name: 'Zapatillas Nike Air Max 90',
    price: 120,
    category: 'Ropa y Accesorios',
    status: 'available',
    description: '👟 Nike Air Max 90 originales\n\n✅ Talla 42 EU / 9 US\n✅ Color: Blanco/Negro/Rojo\n✅ Nuevas, sin usar\n✅ Caja original incluida\n\n🏃 Clásico del streetwear\n✨ Envío express disponible',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    createdAt: '2024-11-28'
  },
  {
    id: '5',
    businessId: '2',
    name: 'Chaqueta Denim Vintage',
    price: 65,
    category: 'Ropa y Accesorios',
    status: 'available',
    description: '🧥 Chaqueta denim estilo vintage\n\n✅ Talla M\n✅ 100% algodón premium\n✅ Lavado a la piedra\n✅ Botones originales\n\n😎 Perfecta para cualquier outfit\n📸 Más fotos disponibles',
    image: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&h=500&fit=crop',
    createdAt: '2024-12-02'
  },
  {
    id: '6',
    businessId: '2',
    name: 'Reloj Casio G-Shock',
    price: 89,
    category: 'Ropa y Accesorios',
    status: 'sold',
    description: '⌚ Casio G-Shock DW-5600\n\n✅ Resistente al agua 200m\n✅ Cronómetro y alarma\n✅ Luz LED automática\n✅ Batería nueva\n\n💪 Indestructible y clásico\n🎁 Ideal para regalo',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    createdAt: '2024-11-15'
  },
  // Casa & Deco products
  {
    id: '7',
    businessId: '3',
    name: 'Sofá Modular 3 Plazas',
    price: 450,
    category: 'Muebles',
    status: 'available',
    description: '🛋️ Sofá modular contemporáneo\n\n✅ 3 plazas + chaise longue\n✅ Tapizado en tela gris claro\n✅ Estructura de madera maciza\n✅ Cojines desenfundables\n\n🏠 Transforma tu sala\n🚚 Servicio de entrega incluido',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=500&fit=crop',
    createdAt: '2024-12-08'
  },
  {
    id: '8',
    businessId: '3',
    name: 'Lámpara de Pie Industrial',
    price: 85,
    category: 'Hogar y Jardín',
    status: 'available',
    description: '💡 Lámpara de pie estilo industrial\n\n✅ Altura ajustable: 150-180cm\n✅ Base de metal negro mate\n✅ Bombilla LED incluida\n✅ Cable de 2 metros\n\n✨ Iluminación con personalidad\n📍 Recogida disponible',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
    createdAt: '2024-12-12'
  },
  {
    id: '9',
    businessId: '3',
    name: 'Set de Macetas Decorativas',
    price: 35,
    category: 'Hogar y Jardín',
    status: 'available',
    description: '🌿 Set de 3 macetas cerámicas\n\n✅ Tamaños: S, M, L\n✅ Color blanco mate\n✅ Diseño minimalista\n✅ Con platos de drenaje\n\n🪴 Perfectas para suculentas\n🎨 Decora con estilo natural',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500&h=500&fit=crop',
    createdAt: '2024-12-14'
  }
];
