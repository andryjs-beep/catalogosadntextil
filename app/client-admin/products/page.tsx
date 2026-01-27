/**
 * Página de Gestión de Productos (Client-Admin)
 * Permite personalizar productos asignados al tenant
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Pencil, Loader2, Package, Image as ImageIcon, Settings } from 'lucide-react';
import Image from 'next/image';

interface Product {
    _id: string;
    name: string;
    images: string[];
    customization: {
        customTitle?: string;
        customName?: string;
        customPrice?: string;
        customDescription?: string;
        galleryMode?: string;
        sliderSpeed?: number;
        ctaText?: string;
        ctaSubtext?: string;
        footerNote?: string;
    } | null;
}

interface FormData {
    customTitle: string;
    customName: string;
    customPrice: string;
    customDescription: string;
    galleryMode: 'album' | 'slider-auto' | 'slider-manual';
    sliderSpeed: number;
    ctaText: string;
    ctaSubtext: string;
    footerNote: string;
}

export default function ClientProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const form = useForm<FormData>({
        defaultValues: {
            customTitle: '',
            customName: '',
            customPrice: '',
            customDescription: '',
            galleryMode: 'album',
            sliderSpeed: 3,
            ctaText: '',
            ctaSubtext: '',
            footerNote: '',
        },
    });

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch('/api/client-admin/products');
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products);
            }
        } catch {
            toast.error('Error al cargar productos');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const openDialog = (product: Product) => {
        setEditingProduct(product);
        const c = product.customization;
        form.reset({
            customTitle: c?.customTitle || '',
            customName: c?.customName || product.name,
            customPrice: c?.customPrice || '',
            customDescription: c?.customDescription || '',
            galleryMode: (c?.galleryMode as FormData['galleryMode']) || 'album',
            sliderSpeed: c?.sliderSpeed || 3,
            ctaText: c?.ctaText || '',
            ctaSubtext: c?.ctaSubtext || '',
            footerNote: c?.footerNote || '',
        });
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingProduct(null);
        form.reset();
    };

    const onSubmit = async (data: FormData) => {
        if (!editingProduct) return;
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/client-admin/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: editingProduct._id,
                    ...data,
                }),
            });

            if (response.ok) {
                toast.success('Producto personalizado correctamente');
                closeDialog();
                fetchProducts();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error al guardar');
            }
        } catch {
            toast.error('Error al guardar producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Personalizar Productos</h1>
                <p className="text-slate-600 mt-1">
                    Configura título, descripción, precios y galería de cada producto
                </p>
            </div>

            {/* Grid de productos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                ) : products.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-slate-500">
                        No hay productos asignados a tu cuenta
                    </div>
                ) : (
                    products.map((product) => (
                        <Card key={product._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="relative aspect-video bg-slate-100">
                                {product.images[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Package className="h-12 w-12 text-slate-300" />
                                    </div>
                                )}
                                {product.images.length > 1 && (
                                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                        <ImageIcon className="h-3 w-3" />
                                        {product.images.length}
                                    </div>
                                )}
                            </div>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-lg line-clamp-1">
                                    {product.customization?.customName || product.name}
                                </CardTitle>
                                {product.customization?.customPrice && (
                                    <p className="text-lg font-semibold text-blue-600">
                                        {product.customization.customPrice}
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Settings className="h-3 w-3" />
                                        {product.customization?.galleryMode || 'album'}
                                    </div>
                                    <Button size="sm" onClick={() => openDialog(product)} className="gap-1">
                                        <Pencil className="h-3 w-3" />
                                        Editar
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Dialog de edición */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Personalizar Producto</DialogTitle>
                        <DialogDescription>
                            Configura cómo se mostrará este producto en tu catálogo
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Sección: Textos principales */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700 border-b pb-2">Textos principales</h3>

                            <div className="space-y-2">
                                <Label htmlFor="customTitle">Título destacado (header oscuro)</Label>
                                <Input
                                    id="customTitle"
                                    {...form.register('customTitle')}
                                    placeholder="Ej: PACK BODY + SUDADERA SUPER CÓMODA"
                                />
                                <p className="text-xs text-slate-500">
                                    Se muestra en un banner oscuro arriba del producto
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customName">Nombre del producto</Label>
                                <Input
                                    id="customName"
                                    {...form.register('customName')}
                                    placeholder="Ej: Body + Sudadera Premium"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customPrice">Precio</Label>
                                <Input
                                    id="customPrice"
                                    {...form.register('customPrice')}
                                    placeholder="Ej: $45.990 o OFERTA: $29.990"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="customDescription">
                                    Descripción / Características
                                </Label>
                                <Textarea
                                    id="customDescription"
                                    {...form.register('customDescription')}
                                    rows={6}
                                    placeholder={`Usa guiones para crear viñetas:
- Tela de doble capa sin transparencias
- Sudadera hasta talla L
- Comodidad garantizada
- Excelente calidad`}
                                />
                                <p className="text-xs text-slate-500">
                                    Líneas que empiezan con - se convierten en viñetas con ✓
                                </p>
                            </div>
                        </div>

                        {/* Sección: Galería */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700 border-b pb-2">Configuración de galería</h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Modo de galería</Label>
                                    <Select
                                        value={form.watch('galleryMode')}
                                        onValueChange={(v) => form.setValue('galleryMode', v as FormData['galleryMode'])}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="album">📷 Álbum (grid)</SelectItem>
                                            <SelectItem value="slider-auto">🎠 Slider automático</SelectItem>
                                            <SelectItem value="slider-manual">👆 Slider manual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {form.watch('galleryMode') === 'slider-auto' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="sliderSpeed">Velocidad (segundos)</Label>
                                        <Input
                                            id="sliderSpeed"
                                            type="number"
                                            min={1}
                                            max={30}
                                            {...form.register('sliderSpeed', { valueAsNumber: true })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Sección: Botón WhatsApp */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700 border-b pb-2">Botón de WhatsApp</h3>

                            <div className="space-y-2">
                                <Label htmlFor="ctaText">Texto del botón</Label>
                                <Input
                                    id="ctaText"
                                    {...form.register('ctaText')}
                                    placeholder="Ej: ¡PEDIR Y PAGAR EN CASA! 🏠"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="ctaSubtext">Texto debajo del botón</Label>
                                <Input
                                    id="ctaSubtext"
                                    {...form.register('ctaSubtext')}
                                    placeholder="Ej: Recuerda que el pago es contraentrega 👍"
                                />
                            </div>
                        </div>

                        {/* Sección: Pie de página */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-slate-700 border-b pb-2">Nota de pie</h3>

                            <div className="space-y-2">
                                <Label htmlFor="footerNote">Disclaimer / Nota final</Label>
                                <Textarea
                                    id="footerNote"
                                    {...form.register('footerNote')}
                                    rows={2}
                                    placeholder="Ej: LA PROMOCIÓN NO INCLUYE ACCESORIOS: CADENA, GAFAS, RELOJ, ETC."
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar cambios'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
