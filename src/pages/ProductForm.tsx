import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, ImagePlus, Save } from 'lucide-react';
import { categories, Product } from '@/data/mockData';
import { toast } from 'sonner';

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    activeBusiness, 
    businesses,
    getProductById, 
    addProduct, 
    updateProduct 
  } = useApp();

  const isEditing = !!id;
  const existingProduct = id ? getProductById(id) : null;

  const [formData, setFormData] = useState({
    businessId: activeBusiness?.id || '',
    name: '',
    price: '',
    category: '',
    status: 'available' as Product['status'],
    description: '',
    image: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (existingProduct) {
      setFormData({
        businessId: existingProduct.businessId,
        name: existingProduct.name,
        price: existingProduct.price.toString(),
        category: existingProduct.category,
        status: existingProduct.status,
        description: existingProduct.description,
        image: existingProduct.image
      });
    }
  }, [existingProduct]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.businessId) newErrors.businessId = 'Selecciona un negocio';
    if (!formData.name.trim()) newErrors.name = 'El nombre es requerido';
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Ingresa un precio válido';
    }
    if (!formData.category) newErrors.category = 'Selecciona una categoría';
    if (!formData.description.trim()) newErrors.description = 'La descripción es requerida';
    if (!formData.image.trim()) newErrors.image = 'La URL de imagen es requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const productData = {
      businessId: formData.businessId,
      name: formData.name.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      status: formData.status,
      description: formData.description.trim(),
      image: formData.image.trim()
    };

    if (isEditing && id) {
      updateProduct(id, productData);
    } else {
      addProduct(productData);
    }

    navigate('/products');
  };

  return (
    <MainLayout 
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'} 
      subtitle={isEditing ? 'Modifica la información del producto' : 'Completa los datos para agregar un producto'}
    >
      {/* Back Button */}
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Información del Producto
              </h2>
              
              <div className="grid gap-4">
                {/* Business */}
                <div className="space-y-2">
                  <Label htmlFor="business">Negocio *</Label>
                  <Select 
                    value={formData.businessId} 
                    onValueChange={(value) => setFormData({ ...formData, businessId: value })}
                  >
                    <SelectTrigger className={errors.businessId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Seleccionar negocio" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses.map((business) => (
                        <SelectItem key={business.id} value={business.id}>
                          {business.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.businessId && (
                    <p className="text-sm text-destructive">{errors.businessId}</p>
                  )}
                </div>

                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="iPhone 14 Pro Max 256GB"
                    className={errors.name ? 'border-destructive' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                {/* Price & Category Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio ($) *</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="899"
                      className={errors.price ? 'border-destructive' : ''}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">{errors.price}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Categoría *</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-destructive">{errors.category}</p>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Estado</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value) => setFormData({ ...formData, status: value as Product['status'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="reserved">Reservado</SelectItem>
                      <SelectItem value="sold">Vendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción para Marketplace *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="📱 iPhone 14 Pro Max en excelente estado&#10;&#10;✅ 256GB de almacenamiento&#10;✅ Batería al 95%&#10;✅ Sin rayones ni golpes&#10;&#10;💬 Escríbeme para más información"
                    rows={8}
                    className={errors.description ? 'border-destructive' : ''}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Usa emojis y viñetas para una mejor presentación en Facebook Marketplace
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Image Section */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Imagen del Producto
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image">URL de la imagen *</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className={errors.image ? 'border-destructive' : ''}
                  />
                  {errors.image && (
                    <p className="text-sm text-destructive">{errors.image}</p>
                  )}
                </div>

                {/* Image Preview */}
                <div className="aspect-square rounded-lg border-2 border-dashed border-border bg-muted/50 overflow-hidden">
                  {formData.image ? (
                    <img 
                      src={formData.image} 
                      alt="Preview"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <ImagePlus className="h-10 w-10 mb-2" />
                      <p className="text-sm">Vista previa</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {isEditing ? 'Guardar Cambios' : 'Crear Producto'}
                </div>
              )}
            </Button>
          </div>
        </div>
      </form>
    </MainLayout>
  );
}
