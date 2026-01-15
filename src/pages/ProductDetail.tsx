import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Package,
  Download,
  Copy,
  Check,
  ClipboardList,
  Facebook
} from 'lucide-react';
import { toast } from 'sonner';

const statusConfig = {
  available: { label: 'Disponible', variant: 'success' as const },
  sold: { label: 'Vendido', variant: 'secondary' as const },
  reserved: { label: 'Reservado', variant: 'warning' as const },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, deleteProduct, businesses, updateProduct } = useApp();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const product = id ? getProductById(id) : null;
  const business = product ? businesses.find(b => b.id === product.businessId) : null;

  // Scroll al inicio cuando se carga la página o cambia el ID
  useEffect(() => {
    // Scroll instantáneo para mejor compatibilidad en móviles
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Para navegadores que soportan smooth scroll, usar después de un pequeño delay
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }, 0);
  }, [id]);

  if (!product) {
    return (
      <MainLayout title="Producto no encontrado">
        <EmptyState
          icon={Package}
          title="Producto no encontrado"
          description="El producto que buscas no existe o ha sido eliminado."
          action={
            <Button asChild>
              <Link to="/products">Ver Productos</Link>
            </Button>
          }
        />
      </MainLayout>
    );
  }

  const status = statusConfig[product.status];

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copiado al portapapeles`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Error al copiar');
    }
  };

  const copyAllForMarketplace = async () => {
    const marketplaceText = `${product.name}

💰 Precio: $${product.price.toLocaleString()}

📦 Categoría: ${product.category}

${product.description}`;

    await copyToClipboard(marketplaceText, 'Todo');
  };

  const downloadImage = async () => {
    try {
      const response = await fetch(product.image);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${product.name.replace(/\s+/g, '-').toLowerCase()}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Imagen descargada');
    } catch {
      // Fallback: open image in new tab
      window.open(product.image, '_blank');
      toast.info('Abre la imagen y guárdala manualmente');
    }
  };

  const handleDelete = () => {
    deleteProduct(product.id);
    navigate('/products');
  };

  const CopyButton = ({ text, field, label }: { text: string; field: string; label: string }) => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => copyToClipboard(text, field)}
      className="flex items-center gap-2"
    >
      {copiedField === field ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {label}
    </Button>
  );

  return (
    <MainLayout 
      title="Detalle del Producto" 
      subtitle={product.name}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Image Section */}
        <div className="space-y-4 animate-fade-in">
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="aspect-square">
              <img 
                src={product.image} 
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full"
            onClick={downloadImage}
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Imagen
          </Button>
        </div>

        {/* Info Section */}
        <div className="space-y-6 animate-slide-in-right">
          {/* Header */}
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant={status.variant} className="text-sm">
                  {status.label}
                </Badge>
                {product.postedToMarketplace && (
                  <Badge variant="default" className="text-sm bg-blue-600 hover:bg-blue-700">
                    <Facebook className="h-3 w-3 mr-1" />
                    En Marketplace
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to={`/products/${product.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {product.category}
            </p>
            <h1 className="text-2xl font-bold text-foreground mt-1">
              {product.name}
            </h1>
            <p className="text-3xl font-bold text-primary mt-3">
              ${product.price.toLocaleString()}
            </p>

            {business && (
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border">
                <img 
                  src={business.logo} 
                  alt={business.name}
                  className="h-10 w-10 rounded-lg object-cover"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Negocio</p>
                  <p className="font-medium text-foreground">{business.name}</p>
                </div>
              </div>
            )}

            {/* Marketplace Status */}
            <div className="mt-4 pt-4 border-t border-border">
              <Button
                variant={product.postedToMarketplace ? "default" : "outline"}
                className={product.postedToMarketplace ? "w-full bg-blue-600 hover:bg-blue-700" : "w-full"}
                onClick={async () => {
                  await updateProduct(product.id, { postedToMarketplace: !product.postedToMarketplace });
                  toast.success(
                    product.postedToMarketplace 
                      ? 'Marcado como no subido a Marketplace' 
                      : 'Marcado como subido a Marketplace'
                  );
                }}
              >
                <Facebook className="h-4 w-4 mr-2" />
                {product.postedToMarketplace 
                  ? 'Marcado como subido a Marketplace' 
                  : 'Marcar como subido a Marketplace'}
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-3">
              Descripción
            </h2>
            <div className="text-foreground whitespace-pre-wrap text-sm leading-relaxed bg-muted/50 rounded-lg p-4">
              {product.description}
            </div>
          </div>

          {/* Marketplace Actions */}
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              Acciones para Marketplace
            </h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <CopyButton text={product.name} field="Nombre" label="Copiar Nombre" />
              <CopyButton text={`$${product.price.toLocaleString()}`} field="Precio" label="Copiar Precio" />
              <CopyButton text={product.category} field="Categoría" label="Copiar Categoría" />
              <CopyButton text={product.description} field="Descripción" label="Copiar Descripción" />
            </div>

            <Button 
              className="w-full"
              onClick={copyAllForMarketplace}
            >
              {copiedField === 'Todo' ? (
                <Check className="h-4 w-4 mr-2" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              Copiar Todo para Marketplace
            </Button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Copia toda la información formateada para pegar en Facebook Marketplace
            </p>
          </div>

          {/* Metadata */}
          <div className="text-sm text-muted-foreground">
            <p>Creado: {new Date(product.createdAt).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto "{product.name}" será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
