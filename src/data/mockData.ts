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
  postedToMarketplace: boolean;
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
