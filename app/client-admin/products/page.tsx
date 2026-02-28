/**
 * Página de Gestión de Productos (Client-Admin)
 * Permite personalizar productos asignados al tenant
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { RichTextEditor } from '@/components/RichTextEditor';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Pencil, Loader2, Package, Image as ImageIcon, Settings, AlignLeft, MapPin, Sparkles } from 'lucide-react';
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
        tieredPricing?: Array<{
            unitCount: number;
            price: string;
            enabled: boolean;
        }>;
        footerNote?: string;
        showLocation?: boolean;
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
    showLocation: boolean;
    tieredPricing: Array<{
        unitCount: number;
        label: string;
        price: string;
        enabled: boolean;
    }>;
    useLandingLayout: boolean;
    landingContent: {
        headline: string;
        subheadline: string;
        longDescription: string;
        features: Array<{
            icon: string;
            title: string;
            description: string;
        }>;
        faq: Array<{
            question: string;
            answer: string;
        }>;
    }
}

export default function ClientProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [tenant, setTenant] = useState<any>(null);

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
            showLocation: true,
            tieredPricing: [
                { unitCount: 1, price: '', enabled: false },
                { unitCount: 2, price: '', enabled: false },
                { unitCount: 3, price: '', enabled: false },
                { unitCount: 6, price: '', enabled: false },
                { unitCount: 12, price: '', enabled: false },
            ],
            useLandingLayout: false,
            landingContent: {
                headline: '',
                subheadline: '',
                longDescription: '',
                features: [],
                faq: [],
            }
        },
    });

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch('/api/client-admin/products');
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products);
                setTenant(data.tenant);
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
            showLocation: c?.showLocation !== false,
            tieredPricing: c?.tieredPricing?.map((t: any) => ({ ...t, label: t.label || `${t.unitCount} ${t.unitCount === 1 ? 'Unidad' : 'Unidades'}` })) || [
                { unitCount: 1, label: '1 Unidad', price: '', enabled: false },
                { unitCount: 2, label: '2 Unidades', price: '', enabled: false },
                { unitCount: 3, label: '3 Unidades', price: '', enabled: false },
                { unitCount: 6, label: '6 Unidades', price: '', enabled: false },
                { unitCount: 12, label: '12 Unidades', price: '', enabled: false },
            ],
            useLandingLayout: (c as any)?.useLandingLayout || false,
            landingContent: {
                headline: (c as any)?.landingContent?.headline || '',
                subheadline: (c as any)?.landingContent?.subheadline || '',
                longDescription: (c as any)?.landingContent?.longDescription || '',
                features: (c as any)?.landingContent?.features || [],
                faq: (c as any)?.landingContent?.faq || [],
            }
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
                        <Tabs defaultValue="basic" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="basic">Ajustes Básicos</TabsTrigger>
                                <TabsTrigger value="landing">Modo Landing ✨</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic" className="space-y-6 pt-4">
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
                                        <Label htmlFor="customPrice">Precio Individual (Opcional)</Label>
                                        <Input
                                            id="customPrice"
                                            {...form.register('customPrice')}
                                            placeholder="Ej: $45.990 o OFERTA: $29.990"
                                        />
                                        <p className="text-xs text-slate-500">
                                            Si habilitas los precios por volumen abajo, este se usará como referencia principal.
                                        </p>
                                    </div>

                                    {/* Sección: Precios por Volumen */}
                                    <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                                        <h4 className="font-bold text-blue-900 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4" />
                                            Precios por Volumen (Estilo Shopify)
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {(form.watch('tieredPricing') || []).map((tier, index) => (
                                                <div key={tier.unitCount} className="bg-white p-3 rounded-lg border border-blue-100 shadow-sm space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <Input
                                                            {...form.register(`tieredPricing.${index}.label`)}
                                                            className="font-bold text-slate-700 border-none p-0 h-auto bg-transparent focus-visible:ring-0 w-2/3"
                                                            placeholder={`${tier.unitCount} Unidades`}
                                                        />
                                                        <input
                                                            type="checkbox"
                                                            {...form.register(`tieredPricing.${index}.enabled`)}
                                                            className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <Input
                                                        placeholder="Ej: $35.000"
                                                        disabled={!form.watch(`tieredPricing.${index}.enabled`)}
                                                        {...form.register(`tieredPricing.${index}.price`)}
                                                        className="bg-slate-50 border-none"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="flex items-center gap-2">
                                            <AlignLeft className="h-4 w-4 text-slate-500" />
                                            Descripción del Producto (Silicon Valley 2026 Style)
                                        </Label>
                                        <Controller
                                            name="customDescription"
                                            control={form.control}
                                            render={({ field }) => (
                                                <RichTextEditor
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                    placeholder="Escribe beneficios, especificaciones, negritas, centrado y GIFs..."
                                                />
                                            )}
                                        />
                                        <p className="text-[10px] text-slate-400">
                                            Tip: Selecciona el texto para ver opciones de formato. Pega URLs de GIFs directamente.
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                        <div className="space-y-0.5">
                                            <Label className="text-red-900 flex items-center gap-2">
                                                <MapPin className="h-4 w-4" />
                                                Mostrar Ubicación
                                            </Label>
                                            <p className="text-xs text-red-600">
                                                Muestra el mapa y dirección física en este producto
                                            </p>
                                        </div>
                                        <input
                                            type="checkbox"
                                            {...form.register('showLocation')}
                                            className="h-6 w-11 rounded-full border-transparent bg-slate-200 checked:bg-red-500 transition-colors"
                                            style={{ appearance: 'none', position: 'relative', cursor: 'pointer' }}
                                        />
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
                                                onValueChange={(v: string) => form.setValue('galleryMode', v as FormData['galleryMode'])}
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
                            </TabsContent>

                            <TabsContent value="landing" className="space-y-6 pt-4">
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-amber-900 font-bold">Activar Diseño Landing Page</Label>
                                        <p className="text-xs text-amber-700">Muestra este producto con secciones de alta conversión.</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={form.watch('useLandingLayout')}
                                        onChange={(e) => form.setValue('useLandingLayout', e.target.checked)}
                                        className="h-6 w-6 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                    />
                                </div>

                                <div className="space-y-4 border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Headline de Producto</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-primary border-primary/20"
                                            onClick={async () => {
                                                const res = await fetch('/api/ai/generate-copy', {
                                                    method: 'POST',
                                                    body: JSON.stringify({
                                                        type: 'product',
                                                        section: 'hero',
                                                        productInfo: { name: editingProduct?.name },
                                                        tenantInfo: { ...tenant?.businessInfo }
                                                    })
                                                });
                                                const data = await res.json();
                                                if (data.success) {
                                                    form.setValue('landingContent.headline', data.content.headline);
                                                    form.setValue('landingContent.subheadline', data.content.subheadline);
                                                }
                                            }}
                                        >
                                            <Sparkles className="h-4 w-4" /> Generar con IA
                                        </Button>
                                    </div>
                                    <Input {...form.register('landingContent.headline')} placeholder="Ej: La prenda que transformará tu armario" />

                                    <Label>Subheadline Pro (Rich Text)</Label>
                                    <Controller
                                        name="landingContent.subheadline"
                                        control={form.control}
                                        render={({ field }) => (
                                            <RichTextEditor
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Describe el beneficio principal con negritas, centrado y GIFs..."
                                            />
                                        )}
                                    />
                                </div>

                                <div className="space-y-4 border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <Label>Descripción Larga (Copywriting Pro)</Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-primary border-primary/20"
                                            onClick={async () => {
                                                const res = await fetch('/api/ai/generate-copy', {
                                                    method: 'POST',
                                                    body: JSON.stringify({
                                                        type: 'product',
                                                        section: 'longDescription',
                                                        productInfo: { name: editingProduct?.name },
                                                        tenantInfo: { ...tenant?.businessInfo }
                                                    })
                                                });
                                                const data = await res.json();
                                                if (data.success) form.setValue('landingContent.longDescription', data.content);
                                            }}
                                        >
                                            <Sparkles className="h-4 w-4" /> Escribir para mí
                                        </Button>
                                    </div>
                                    <Textarea {...form.register('landingContent.longDescription')} rows={12} placeholder="Escribe una descripción completa siguiendo la fórmula AIDA..." />
                                </div>

                                {/* Sección: Beneficios (Features) */}
                                <div className="space-y-4 border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-blue-500" /> Beneficios Clave
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-primary border-primary/20"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch('/api/ai/generate-copy', {
                                                        method: 'POST',
                                                        body: JSON.stringify({
                                                            type: 'product',
                                                            section: 'benefits',
                                                            productInfo: { name: editingProduct?.name },
                                                            tenantInfo: { ...tenant?.businessInfo }
                                                        })
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        form.setValue('landingContent.features', data.content);
                                                        toast.success('Beneficios generados con IA');
                                                    }
                                                } catch (e) {
                                                    toast.error('Error al generar beneficios');
                                                }
                                            }}
                                        >
                                            Generar con IA
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {(form.watch('landingContent.features') || []).map((feature, idx) => (
                                            <div key={idx} className="p-3 border rounded-lg bg-slate-50 relative group">
                                                <button
                                                    type="button"
                                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        const current = form.getValues('landingContent.features');
                                                        form.setValue('landingContent.features', current.filter((_, i) => i !== idx));
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                                <div className="grid grid-cols-[30px_1fr] gap-3">
                                                    <Input
                                                        {...form.register(`landingContent.features.${idx}.icon` as any)}
                                                        className="p-1 text-center h-8"
                                                        placeholder="icon"
                                                    />
                                                    <div className="space-y-2">
                                                        <Input
                                                            {...form.register(`landingContent.features.${idx}.title` as any)}
                                                            className="h-8 font-bold"
                                                            placeholder="Título del beneficio"
                                                        />
                                                        <Textarea
                                                            {...form.register(`landingContent.features.${idx}.description` as any)}
                                                            className="text-xs"
                                                            rows={2}
                                                            placeholder="Descripción del beneficio"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full border-dashed border-2"
                                            onClick={() => {
                                                const current = form.getValues('landingContent.features') || [];
                                                form.setValue('landingContent.features', [...current, { icon: 'star', title: '', description: '' }]);
                                            }}
                                        >
                                            + Añadir Beneficio
                                        </Button>
                                    </div>
                                </div>

                                {/* Sección: FAQ */}
                                <div className="space-y-4 border-t pt-4">
                                    <div className="flex items-center justify-between">
                                        <Label className="flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-amber-500" /> Preguntas Frecuentes (FAQ)
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="gap-2 text-primary border-primary/20"
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch('/api/ai/generate-copy', {
                                                        method: 'POST',
                                                        body: JSON.stringify({
                                                            type: 'product',
                                                            section: 'faq',
                                                            productInfo: { name: editingProduct?.name },
                                                            tenantInfo: { ...tenant?.businessInfo }
                                                        })
                                                    });
                                                    const data = await res.json();
                                                    if (data.success) {
                                                        form.setValue('landingContent.faq', data.content);
                                                        toast.success('FAQ generado con IA');
                                                    }
                                                } catch (e) {
                                                    toast.error('Error al generar FAQ');
                                                }
                                            }}
                                        >
                                            Generar con IA
                                        </Button>
                                    </div>
                                    <div className="space-y-3">
                                        {(form.watch('landingContent.faq') || []).map((item, idx) => (
                                            <div key={idx} className="p-3 border rounded-lg bg-slate-50 relative group">
                                                <button
                                                    type="button"
                                                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        const current = form.getValues('landingContent.faq');
                                                        form.setValue('landingContent.faq', current.filter((_, i) => i !== idx));
                                                    }}
                                                >
                                                    &times;
                                                </button>
                                                <div className="space-y-2">
                                                    <Input
                                                        {...form.register(`landingContent.faq.${idx}.question` as any)}
                                                        className="h-8 font-bold"
                                                        placeholder="Pregunta"
                                                    />
                                                    <Textarea
                                                        {...form.register(`landingContent.faq.${idx}.answer` as any)}
                                                        className="text-xs"
                                                        rows={2}
                                                        placeholder="Respuesta"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full border-dashed border-2"
                                            onClick={() => {
                                                const current = form.getValues('landingContent.faq') || [];
                                                form.setValue('landingContent.faq', [...current, { question: '', answer: '' }]);
                                            }}
                                        >
                                            + Añadir Pregunta
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>

                        <DialogFooter className="mt-8 border-t pt-4">
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
