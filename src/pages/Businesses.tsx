import { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { uploadImage, validateImageFile } from '@/lib/storage';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Plus, 
  Building2, 
  Edit, 
  Trash2, 
  CheckCircle,
  Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Business } from '@/data/mockData';

export default function Businesses() {
  const { 
    businesses, 
    activeBusiness, 
    setActiveBusiness, 
    addBusiness, 
    updateBusiness, 
    deleteBusiness,
    getProductsByBusiness 
  } = useApp();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: ''
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenDialog = (business?: Business) => {
    if (business) {
      setEditingBusiness(business);
      setFormData({
        name: business.name,
        logo: business.logo,
        description: business.description
      });
      setLogoPreview(business.logo);
    } else {
      setEditingBusiness(null);
      setFormData({ name: '', logo: '', description: '' });
      setLogoPreview('');
    }
    setLogoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsDialogOpen(true);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast.error(validation.error || 'Error al validar la imagen');
      return;
    }

    setLogoFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    if (!logoFile && !formData.logo.trim()) {
      toast.error('Debes subir un logo o proporcionar una URL');
      return;
    }

    setIsUploadingLogo(true);

    try {
      let logoUrl = formData.logo.trim();

      // Upload logo if a new file was selected
      if (logoFile) {
        try {
          logoUrl = await uploadImage(logoFile, 'businesses');
          toast.success('Logo subido exitosamente');
        } catch (error) {
          console.error('Error uploading logo:', error);
          toast.error('Error al subir el logo. Intenta nuevamente.');
          setIsUploadingLogo(false);
          return;
        }
      }

      const businessData = {
        name: formData.name.trim(),
        logo: logoUrl,
        description: formData.description.trim()
      };

      if (editingBusiness) {
        await updateBusiness(editingBusiness.id, businessData);
      } else {
        await addBusiness(businessData);
      }

      setIsDialogOpen(false);
      setFormData({ name: '', logo: '', description: '' });
      setLogoPreview('');
      setLogoFile(null);
      setEditingBusiness(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al guardar el negocio');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteBusiness(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <MainLayout 
      title="Negocios" 
      subtitle="Gestiona todos tus negocios registrados"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-muted-foreground">
          {businesses.length} negocio{businesses.length !== 1 ? 's' : ''} registrado{businesses.length !== 1 ? 's' : ''}
        </p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Negocio
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingBusiness ? 'Editar Negocio' : 'Nuevo Negocio'}
                </DialogTitle>
                <DialogDescription>
                  {editingBusiness 
                    ? 'Modifica la información de tu negocio'
                    : 'Completa los datos para registrar un nuevo negocio'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del negocio</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Mi Tienda"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo del negocio</Label>
                  <Input
                    ref={fileInputRef}
                    id="logo"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleLogoChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formatos permitidos: JPEG, PNG, WEBP, GIF. Tamaño máximo: 5MB
                  </p>
                  {logoPreview && (
                    <div className="relative mt-2">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview"
                        className="h-24 w-24 rounded-lg object-cover border border-border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0"
                        onClick={handleRemoveLogo}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe tu negocio..."
                    rows={3}
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploadingLogo}>
                  {isUploadingLogo ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Subiendo logo...
                    </div>
                  ) : (
                    editingBusiness ? 'Guardar Cambios' : 'Crear Negocio'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Business Grid */}
      {businesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => {
            const productCount = getProductsByBusiness(business.id).length;
            const isActive = activeBusiness?.id === business.id;

            return (
              <div
                key={business.id}
                className={cn(
                  "bg-card rounded-xl border-2 p-6 card-hover animate-fade-in relative",
                  isActive ? "border-primary" : "border-border"
                )}
              >
                {isActive && (
                  <div className="absolute top-4 right-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                      <CheckCircle className="h-3 w-3" />
                      Activo
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <img 
                    src={business.logo} 
                    alt={business.name}
                    className="h-16 w-16 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate pr-16">
                      {business.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {business.description}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      {productCount} producto{productCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-4 border-t border-border">
                  {!isActive && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => setActiveBusiness(business)}
                    >
                      Seleccionar
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleOpenDialog(business)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteId(business.id)}
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Building2}
          title="Sin negocios"
          description="Aún no has registrado ningún negocio. Comienza creando uno nuevo."
          action={
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Negocio
            </Button>
          }
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar negocio?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán también todos los productos asociados a este negocio.
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
