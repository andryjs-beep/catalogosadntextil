'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Sparkles, Save, Trash2, Plus, Package, Tag, Layers, Coins } from 'lucide-react';
import Link from 'next/link';
import { RichTextEditor } from '@/components/RichTextEditor';

export default function LandingEditorPage({ params }: { params: Promise<{ id: string, colId: string }> }) {
    const { id: tenantId, colId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<any>(null);
    const [products, setProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(true);

    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const [localProductContent, setLocalProductContent] = useState<any>(null);

    useEffect(() => {
        fetchData();
        fetchProducts();
    }, [tenantId, colId]);

    // Al cambiar el producto seleccionado, cargar su contenido local o el de la colección
    useEffect(() => {
        if (selectedProductId) {
            const product = products.find(p => p._id === selectedProductId);
            if (product) {
                setLocalProductContent({
                    hero: product.customization?.landingContent?.hero || { headline: product.customization?.customTitle || product.name, subheadline: "", ctaText: "Consultar", heroImage: "", videoUrl: "" },
                    benefits: { items: product.customization?.landingContent?.features || [] },
                    faq: product.customization?.landingContent?.faq || [],
                    finalCTA: product.customization?.landingContent?.hero ? {
                        headline: product.customization.landingContent.hero.headline,
                        description: "",
                        ctaText: "Pedir Ahora"
                    } : { headline: "", description: "", ctaText: "Contactar Ahora" }
                });
            }
        } else {
            setLocalProductContent(null);
        }
    }, [selectedProductId, products]);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`/api/admin/tenants/${tenantId}/products`);
            const json = await res.json();
            if (res.ok) {
                // Filtrar solo productos que pertenecen a esta colección
                const relevantProducts = json.products.filter((p: any) =>
                    (data?.collectionId?.productIds || []).includes(p._id)
                );
                setProducts(json.products || []);
            }
        } catch (error) {
            console.error("Error fetching products", error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const fetchData = async () => {
        try {
            const res = await fetch(`/api/admin/tenants/${tenantId}/assign`);
            const json = await res.json();
            if (res.ok) {
                const tc = json.tenantCollections.find((c: any) =>
                    (c.collectionId._id === colId || c.collectionId === colId)
                );
                if (tc) {
                    // Asegurar estructura de landingPageSections con campos premium
                    const baseLanding = {
                        hero: { headline: "", subheadline: "", ctaText: "Ver Catálogo", heroImage: "", videoUrl: "" },
                        benefits: { items: [] },
                        faq: [],
                        finalCTA: { headline: "", description: "", ctaText: "Contactar Ahora" },
                        socialProof: { stats: [], testimonials: [], logos: [] },
                        countdown: { enabled: false, durationMinutes: 30, title: "⚡ ¡OFERTA POR TIEMPO LIMITADO!", subtitle: "Aprovecha antes de que termine" },
                        sizes: { enabled: false, items: [] },
                        buttonStyles: { bgColor: "#25D366", textColor: "#ffffff", borderRadius: "pill", animation: "scale" },
                        termsAndConditions: { enabled: false, content: "", requireAcceptance: false },
                        badge: { enabled: false, type: "new", customText: "", discount: 0 },
                        showProductGallery: true,
                        showStickyCTA: true
                    };

                    const tenantWithDefaults = {
                        ...json.tenant,
                        businessInfo: {
                            businessName: '',
                            niche: '',
                            usp: '',
                            tone: 'profesional',
                            ...(json.tenant?.businessInfo || {})
                        }
                    };

                    setData({
                        ...tc,
                        landingPageSections: { ...baseLanding, ...(tc.landingPageSections || {}) },
                        tenant: tenantWithDefaults
                    });
                } else {
                    toast.error('Colección no encontrada para este cliente');
                }
            }
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const generateSection = async (section: string) => {
        setGenerating(true);
        try {
            const currentProduct = selectedProductId ? products.find(p => p._id === selectedProductId) : null;

            const response = await fetch('/api/ai/generate-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: selectedProductId ? 'product' : 'collection',
                    section,
                    productInfo: {
                        name: currentProduct ? (currentProduct.customization?.customName || currentProduct.name) : (data.collectionId?.name || 'Colección'),
                        description: currentProduct ? (currentProduct.customization?.customDescription || currentProduct.description) : ''
                    },
                    tenantInfo: data.tenant?.businessInfo || {},
                    productContext: data.productContext || ''
                })
            });

            const aiData = await response.json();
            if (aiData.success) {
                if (selectedProductId) {
                    // Actualizar contenido local del producto
                    setLocalProductContent((prev: any) => {
                        const next = { ...prev };
                        if (section === 'hero') next.hero = { ...next.hero, ...aiData.content };
                        else if (section === 'benefits') next.benefits = { items: aiData.content };
                        else if (section === 'faq') next.faq = aiData.content;
                        return next;
                    });
                } else {
                    // Actualizar contenido de la colección
                    if (section === 'hero') {
                        setData((prev: any) => ({
                            ...prev,
                            landingPageSections: { ...prev.landingPageSections, hero: { ...prev.landingPageSections.hero, ...aiData.content } }
                        }));
                    } else if (section === 'benefits') {
                        setData((prev: any) => ({
                            ...prev,
                            landingPageSections: { ...prev.landingPageSections, benefits: { items: aiData.content } }
                        }));
                    } else if (section === 'faq') {
                        setData((prev: any) => ({
                            ...prev,
                            landingPageSections: { ...prev.landingPageSections, faq: aiData.content }
                        }));
                    }
                }
                toast.success('Contenido generado con éxito');
            } else {
                toast.error(aiData.error || 'Error al generar');
            }
        } catch (error) {
            toast.error('Error de conexión con la IA');
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Si hay un producto seleccionado, actualizar su personalización en el array de productos antes de guardar
            let updatedProducts = [...products];
            if (selectedProductId && localProductContent) {
                const idx = updatedProducts.findIndex(p => p._id === selectedProductId);
                if (idx > -1) {
                    updatedProducts[idx].customization = {
                        ...(updatedProducts[idx].customization || { productId: selectedProductId }),
                        landingContent: {
                            hero: localProductContent.hero,
                            features: localProductContent.benefits.items,
                            faq: localProductContent.faq
                        }
                    };
                }
            }

            // 1. Guardar Landing Page (TenantCollection)
            const res = await fetch(`/api/admin/tenants/${tenantId}/assign`);
            const json = await res.json();

            const assignments = json.tenantCollections.map((tc: any) => {
                const isCurrent = (tc.collectionId._id === colId || tc.collectionId === colId);
                if (isCurrent) {
                    return {
                        collectionId: colId,
                        persuasiveTextTop: data.persuasiveTextTop,
                        persuasiveTextBottom: data.persuasiveTextBottom,
                        ctaButtonText: data.ctaButtonText,
                        isPublished: data.isPublished,
                        order: data.order,
                        useLandingLayout: data.useLandingLayout,
                        landingPageSections: data.landingPageSections
                    };
                }
                return tc;
            });

            const saveRes = await fetch(`/api/admin/tenants/${tenantId}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignments })
            });

            // 2. Guardar Personalización de Productos
            const productSavePromises = updatedProducts
                .filter(p => (data.collectionId?.productIds || []).includes(p._id))
                .map(p => {
                    if (!p.customization) return Promise.resolve();
                    return fetch(`/api/admin/tenants/${tenantId}/products`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            productId: p._id,
                            ...p.customization
                        })
                    });
                });

            await Promise.all(productSavePromises);

            if (saveRes.ok) {
                toast.success('Cambios guardados correctamente');
                router.back();
            } else {
                toast.error('Error al guardar cambios principales');
            }
        } catch (error) {
            console.error("Save error", error);
            toast.error('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    if (!data) return <div className="p-8 text-center">No se encontró la información.</div>;


    return (
        <div className="container mx-auto py-8 max-w-5xl">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Editor de Landing Page</h1>
                        <p className="text-slate-500">{data.collectionId.name} - {data.tenant.slug}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.back()}>Cancelar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Landing
                    </Button>
                </div>
            </div>

            <div className="space-y-8">
                {/* Selector de Modo de Edición */}
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-blue-800">
                            <Layers className="h-5 w-5" />
                            <CardTitle className="text-lg">Modo de Edición</CardTitle>
                        </div>
                        <CardDescription>
                            Selecciona si quieres editar el contenido general de la colección o personalizar un producto específico.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant={selectedProductId === null ? "default" : "outline"}
                                onClick={() => setSelectedProductId(null)}
                                className="rounded-full"
                            >
                                <Tag className="h-4 w-4 mr-2" />
                                Toda la Colección
                            </Button>
                            {products
                                .filter(p => (data.collectionId?.productIds || []).includes(p._id))
                                .map(p => (
                                    <Button
                                        key={p._id}
                                        variant={selectedProductId === p._id ? "default" : "outline"}
                                        onClick={() => setSelectedProductId(p._id)}
                                        className="rounded-full border-blue-200"
                                    >
                                        {p.customization?.customName || p.name}
                                    </Button>
                                ))}
                        </div>
                        {selectedProductId && (
                            <p className="mt-4 text-sm text-blue-700 font-medium animate-in fade-in duration-300">
                                ✨ Estás personalizando la landing solo para este producto. Los cambios sobrescribirán el contenido general en su página de detalle.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Configuración General */}
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="font-bold text-lg">Activar Diseño Landing Page</h3>
                                <p className="text-sm text-slate-600">Si se activa, esta colección usará secciones (Hero, Beneficios, etc.) en lugar del diseño estándar.</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    className="h-6 w-6 rounded border-slate-300 text-primary focus:ring-primary"
                                    checked={data.useLandingLayout}
                                    onChange={(e) => setData({ ...data, useLandingLayout: e.target.checked })}
                                />
                                <Label className="text-lg font-bold">Activo</Label>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {data.useLandingLayout && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* CAJA DE CONTEXTO PARA IA */}
                        <Card className="border-amber-200 bg-amber-50">
                            <CardHeader>
                                <CardTitle className="text-amber-900 flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    Datos para la IA (Contexto Adicional)
                                </CardTitle>
                                <CardDescription className="text-amber-700">
                                    Proporciona información extra sobre tu producto: características especiales, materiales, ventajas, o inspira el copy con un enlace.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={data.productContext || ''}
                                    onChange={(e) => setData({ ...data, productContext: e.target.value })}
                                    rows={4}
                                    placeholder="Ej: Material 100% Algodón, No destiñe, Tallas Oversize..."
                                    className="bg-white"
                                />
                            </CardContent>
                        </Card>

                        {/* SECCIÓN HERO */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle>Sección Hero {selectedProductId ? '(Personalizado)' : '(General)'}</CardTitle>
                                    <CardDescription>Impacto inicial para {selectedProductId ? 'este producto' : 'toda la colección'}.</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                                    onClick={() => generateSection('hero')}
                                    disabled={generating}
                                >
                                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Generar con IA
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Headline (Título Principal)</Label>
                                    <Input
                                        value={selectedProductId ? localProductContent?.hero?.headline : data.landingPageSections.hero.headline}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (selectedProductId) {
                                                setLocalProductContent((prev: any) => ({ ...prev, hero: { ...prev.hero, headline: val } }));
                                            } else {
                                                setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, headline: val } } });
                                            }
                                        }}
                                        placeholder="Ej: Gorras que definen tu estilo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subheadline (Bajada Pro)</Label>
                                    <RichTextEditor
                                        value={selectedProductId ? localProductContent?.hero?.subheadline : data.landingPageSections.hero.subheadline}
                                        onChange={(val) => {
                                            if (selectedProductId) {
                                                setLocalProductContent((prev: any) => ({ ...prev, hero: { ...prev.hero, subheadline: val } }));
                                            } else {
                                                setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, subheadline: val } } });
                                            }
                                        }}
                                        placeholder="Describe el beneficio principal con negritas, centrado y GIFs..."
                                    />
                                    <p className="text-[10px] text-slate-400">
                                        Tip: El contenido se guarda como HTML para soportar el diseño Silicon Valley 2026.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Texto Botón CTA</Label>
                                        <Input
                                            value={selectedProductId ? localProductContent?.hero?.ctaText : data.landingPageSections.hero.ctaText}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (selectedProductId) {
                                                    setLocalProductContent((prev: any) => ({ ...prev, hero: { ...prev.hero, ctaText: val } }));
                                                } else {
                                                    setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, ctaText: val } } });
                                                }
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Imagen URL (Hero)</Label>
                                        <Input
                                            value={selectedProductId ? localProductContent?.hero?.heroImage : data.landingPageSections.hero.heroImage}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (selectedProductId) {
                                                    setLocalProductContent((prev: any) => ({ ...prev, hero: { ...prev.hero, heroImage: val } }));
                                                } else {
                                                    setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, heroImage: val } } });
                                                }
                                            }}
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* SECCIÓN BENEFICIOS */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle>Beneficios Clave</CardTitle>
                                    <CardDescription>Puntos fuertes que destacan el valor de tu oferta.</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                                    onClick={() => generateSection('benefits')}
                                    disabled={generating}
                                >
                                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Sugerir con IA
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {(selectedProductId ? localProductContent?.benefits?.items : data.landingPageSections.benefits.items || []).map((benefit: any, index: number) => (
                                    <div key={index} className="p-4 border rounded-xl bg-slate-50 relative group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500"
                                            onClick={() => {
                                                if (selectedProductId) {
                                                    const newItems = [...localProductContent.benefits.items];
                                                    newItems.splice(index, 1);
                                                    setLocalProductContent((prev: any) => ({ ...prev, benefits: { items: newItems } }));
                                                } else {
                                                    const newItems = [...data.landingPageSections.benefits.items];
                                                    newItems.splice(index, 1);
                                                    setData({ ...data, landingPageSections: { ...data.landingPageSections, benefits: { items: newItems } } });
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Icono</Label>
                                                <select
                                                    className="w-full p-2 border rounded-md bg-white"
                                                    value={benefit.icon}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (selectedProductId) {
                                                            const newItems = [...localProductContent.benefits.items];
                                                            newItems[index].icon = val;
                                                            setLocalProductContent((prev: any) => ({ ...prev, benefits: { items: newItems } }));
                                                        } else {
                                                            const newItems = [...data.landingPageSections.benefits.items];
                                                            newItems[index].icon = val;
                                                            setData({ ...data, landingPageSections: { ...data.landingPageSections, benefits: { items: newItems } } });
                                                        }
                                                    }}
                                                >
                                                    <option value="shield">Escudo</option>
                                                    <option value="truck">Camión</option>
                                                    <option value="star">Estrella</option>
                                                    <option value="zap">Rayo</option>
                                                    <option value="award">Premio</option>
                                                    <option value="check-circle">Check</option>
                                                    <option value="heart">Corazón</option>
                                                    <option value="sparkles">Brillos</option>
                                                </select>
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <Label>Título</Label>
                                                <Input
                                                    value={benefit.title}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (selectedProductId) {
                                                            const newItems = [...localProductContent.benefits.items];
                                                            newItems[index].title = val;
                                                            setLocalProductContent((prev: any) => ({ ...prev, benefits: { items: newItems } }));
                                                        } else {
                                                            const newItems = [...data.landingPageSections.benefits.items];
                                                            newItems[index].title = val;
                                                            setData({ ...data, landingPageSections: { ...data.landingPageSections, benefits: { items: newItems } } });
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-3 space-y-2">
                                                <Label>Descripción Corta</Label>
                                                <Textarea
                                                    rows={1}
                                                    value={benefit.description}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (selectedProductId) {
                                                            const newItems = [...localProductContent.benefits.items];
                                                            newItems[index].description = val;
                                                            setLocalProductContent((prev: any) => ({ ...prev, benefits: { items: newItems } }));
                                                        } else {
                                                            const newItems = [...data.landingPageSections.benefits.items];
                                                            newItems[index].description = val;
                                                            setData({ ...data, landingPageSections: { ...data.landingPageSections, benefits: { items: newItems } } });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed"
                                    onClick={() => {
                                        const newItem = { icon: 'star', title: '', description: '' };
                                        if (selectedProductId) {
                                            setLocalProductContent((prev: any) => ({ ...prev, benefits: { items: [...prev.benefits.items, newItem] } }));
                                        } else {
                                            setData((prev: any) => ({ ...prev, landingPageSections: { ...prev.landingPageSections, benefits: { items: [...prev.landingPageSections.benefits.items, newItem] } } }));
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Agregar Beneficio
                                </Button>
                            </CardContent>
                        </Card>

                        {/* SECCIÓN FAQ */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle>Preguntas Frecuentes (FAQ)</CardTitle>
                                    <CardDescription>Resuelve las dudas típicas antes de la compra.</CardDescription>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 text-primary border-primary/20 hover:bg-primary/5"
                                    onClick={() => generateSection('faq')}
                                    disabled={generating}
                                >
                                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                    Generar FAQ con IA
                                </Button>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {(selectedProductId ? localProductContent?.faq : data.landingPageSections?.faq || []).map((item: any, index: number) => (
                                    <div key={index} className="p-4 border rounded-xl relative group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500"
                                            onClick={() => {
                                                if (selectedProductId) {
                                                    const newFaq = [...localProductContent.faq];
                                                    newFaq.splice(index, 1);
                                                    setLocalProductContent((prev: any) => ({ ...prev, faq: newFaq }));
                                                } else {
                                                    const newFaq = [...data.landingPageSections.faq];
                                                    newFaq.splice(index, 1);
                                                    setData({ ...data, landingPageSections: { ...data.landingPageSections, faq: newFaq } });
                                                }
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <Label className="text-xs uppercase text-slate-500">Pregunta</Label>
                                                <Input
                                                    value={item.question}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (selectedProductId) {
                                                            const newFaq = [...localProductContent.faq];
                                                            newFaq[index].question = val;
                                                            setLocalProductContent((prev: any) => ({ ...prev, faq: newFaq }));
                                                        } else {
                                                            const newFaq = [...data.landingPageSections.faq];
                                                            newFaq[index].question = val;
                                                            setData({ ...data, landingPageSections: { ...data.landingPageSections, faq: newFaq } });
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs uppercase text-slate-500">Respuesta</Label>
                                                <Textarea
                                                    value={item.answer}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        if (selectedProductId) {
                                                            const newFaq = [...localProductContent.faq];
                                                            newFaq[index].answer = val;
                                                            setLocalProductContent((prev: any) => ({ ...prev, faq: newFaq }));
                                                        } else {
                                                            const newFaq = [...data.landingPageSections.faq];
                                                            newFaq[index].answer = val;
                                                            setData({ ...data, landingPageSections: { ...data.landingPageSections, faq: newFaq } });
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    className="w-full border-dashed"
                                    onClick={() => {
                                        const newItem = { question: '', answer: '' };
                                        if (selectedProductId) {
                                            setLocalProductContent((prev: any) => ({ ...prev, faq: [...prev.faq, newItem] }));
                                        } else {
                                            setData((prev: any) => ({ ...prev, landingPageSections: { ...prev.landingPageSections, faq: [...(prev.landingPageSections.faq || []), newItem] } }));
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Agregar Pregunta
                                </Button>
                            </CardContent>
                        </Card>

                        {/* FINAL CTA */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Cierre de Venta (Final CTA)</CardTitle>
                                <CardDescription>El último empujón antes de contactar por WhatsApp.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Headline de Cierre</Label>
                                    <Input
                                        value={selectedProductId ? localProductContent?.finalCTA?.headline : data.landingPageSections.finalCTA.headline}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (selectedProductId) {
                                                setLocalProductContent((prev: any) => ({ ...prev, finalCTA: { ...prev.finalCTA, headline: val } }));
                                            } else {
                                                setData({ ...data, landingPageSections: { ...data.landingPageSections, finalCTA: { ...data.landingPageSections.finalCTA, headline: val } } });
                                            }
                                        }}
                                        placeholder="Ej: ¿Listo para llevar tu estilo al siguiente nivel?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción de Cierre</Label>
                                    <Textarea
                                        value={selectedProductId ? localProductContent?.finalCTA?.description : data.landingPageSections.finalCTA.description}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (selectedProductId) {
                                                setLocalProductContent((prev: any) => ({ ...prev, finalCTA: { ...prev.finalCTA, description: val } }));
                                            } else {
                                                setData({ ...data, landingPageSections: { ...data.landingPageSections, finalCTA: { ...data.landingPageSections.finalCTA, description: val } } });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Texto Botón Final</Label>
                                    <Input
                                        value={selectedProductId ? localProductContent?.finalCTA?.ctaText : data.landingPageSections.finalCTA.ctaText}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (selectedProductId) {
                                                setLocalProductContent((prev: any) => ({ ...prev, finalCTA: { ...prev.finalCTA, ctaText: val } }));
                                            } else {
                                                setData({ ...data, landingPageSections: { ...data.landingPageSections, finalCTA: { ...data.landingPageSections.finalCTA, ctaText: val } } });
                                            }
                                        }}
                                    />
                                </div>
                            </CardContent>
                        </Card>


                        {/* ===== GESTIÓN DE PRECIOS ===== */}
                        <div className="pt-8 space-y-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                    <Tag className="h-6 w-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Gestión de Precios de Productos</h2>
                                    <p className="text-slate-500">Configura los precios normales y por volumen para los productos de esta colección.</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {products
                                    .filter(p => (data.collectionId?.productIds || []).includes(p._id))
                                    .filter(p => !selectedProductId || p._id === selectedProductId)
                                    .map((product) => {
                                        const pIdx = products.findIndex(pr => pr._id === product._id);
                                        return (
                                            <Card key={product._id} className="overflow-hidden border-slate-200 shadow-sm">
                                                <div className="bg-slate-50 px-6 py-4 border-b flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        {product.images?.[0] && (
                                                            <div className="h-12 w-12 rounded-lg overflow-hidden border bg-white">
                                                                <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="font-bold text-slate-900">{product.name}</h3>
                                                            <p className="text-xs text-slate-500 uppercase">REF: {product._id.toString().slice(-6).toUpperCase()}</p>
                                                        </div>
                                                    </div>
                                                    <Badge variant="outline" className="bg-white">
                                                        Precio Base: ${(product.price || 0).toLocaleString()}
                                                    </Badge>
                                                </div>
                                                <CardContent className="p-6 space-y-6">
                                                    <div className="grid md:grid-cols-2 gap-6">
                                                        <div className="space-y-2">
                                                            <Label className="flex items-center gap-2">
                                                                <Tag className="h-4 w-4 text-blue-500" />
                                                                Precio Personalizado para Tenant
                                                            </Label>
                                                            <div className="relative">
                                                                <span className="absolute left-3 top-2.5 text-slate-400">$</span>
                                                                <Input
                                                                    type="text"
                                                                    className="pl-7 font-bold text-lg"
                                                                    value={product.customization?.customPrice || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        const newProducts = [...products];
                                                                        newProducts[pIdx].customization = {
                                                                            ...(newProducts[pIdx].customization || { productId: product._id }),
                                                                            customPrice: val
                                                                        };
                                                                        setProducts(newProducts);
                                                                    }}
                                                                    placeholder={product.price?.toString()}
                                                                />
                                                            </div>
                                                            <p className="text-[10px] text-slate-500">Deja vacío para usar el precio base de la tienda.</p>
                                                        </div>

                                                        <div className="space-y-2">
                                                            <Label className="flex items-center gap-2">
                                                                <Layers className="h-4 w-4 text-purple-500" />
                                                                Nombre Personalizado
                                                            </Label>
                                                            <Input
                                                                value={product.customization?.customName || ''}
                                                                onChange={(e) => {
                                                                    const val = e.target.value;
                                                                    const newProducts = [...products];
                                                                    newProducts[pIdx].customization = {
                                                                        ...(newProducts[pIdx].customization || { productId: product._id }),
                                                                        customName: val
                                                                    };
                                                                    setProducts(newProducts);
                                                                }}
                                                                placeholder={product.name}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="border-t pt-6 space-y-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="p-1.5 bg-amber-100 rounded text-amber-600">
                                                                <Coins className="h-4 w-4" />
                                                            </div>
                                                            <h4 className="font-bold text-slate-800">Precios Multinivel (Venta por Volumen)</h4>
                                                        </div>

                                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                                            {[1, 2, 3, 6, 12].map((units) => {
                                                                const tier = (product.customization?.tieredPricing || []).find((t: any) => t.unitCount === units) || { unitCount: units, price: '', enabled: false };
                                                                return (
                                                                    <div key={units} className={`p-3 rounded-xl border transition-all ${tier.enabled ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200 opacity-60'}`}>
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <span className="text-[10px] font-bold uppercase">{units} {units === 1 ? 'Unidad' : 'Unidades'}</span>
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={tier.enabled}
                                                                                onChange={(e) => {
                                                                                    const enabled = e.target.checked;
                                                                                    const newProducts = [...products];
                                                                                    const customization = newProducts[pIdx].customization || { productId: product._id, tieredPricing: [] };
                                                                                    const tiers = [...(customization.tieredPricing || [])];
                                                                                    const tIdx = tiers.findIndex((t: any) => t.unitCount === units);

                                                                                    if (tIdx > -1) {
                                                                                        tiers[tIdx].enabled = enabled;
                                                                                    } else {
                                                                                        tiers.push({ unitCount: units, price: '', enabled });
                                                                                    }

                                                                                    newProducts[pIdx].customization = { ...customization, tieredPricing: tiers };
                                                                                    setProducts(newProducts);
                                                                                }}
                                                                                className="h-4 w-4 accent-amber-500"
                                                                            />
                                                                        </div>
                                                                        <div className="relative">
                                                                            <span className="absolute left-2 top-1.5 text-xs text-slate-400">$</span>
                                                                            <Input
                                                                                className="h-8 pl-5 text-sm font-bold bg-white"
                                                                                value={tier.price || ''}
                                                                                disabled={!tier.enabled}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value;
                                                                                    const newProducts = [...products];
                                                                                    const customization = newProducts[pIdx].customization || { productId: product._id, tieredPricing: [] };
                                                                                    const tiers = [...(customization.tieredPricing || [])];
                                                                                    const tIdx = tiers.findIndex((t: any) => t.unitCount === units);

                                                                                    if (tIdx > -1) {
                                                                                        tiers[tIdx].price = val;
                                                                                    } else {
                                                                                        tiers.push({ unitCount: units, price: val, enabled: true });
                                                                                    }

                                                                                    newProducts[pIdx].customization = { ...customization, tieredPricing: tiers };
                                                                                    setProducts(newProducts);
                                                                                }}
                                                                                placeholder="0.00"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                            </div>
                        </div>

                        {/* ===== BOTONES DE ACCIÓN ===== */}
                        <div className="pt-12 pb-24 flex justify-end gap-4">
                            <Button variant="outline" size="lg" onClick={() => router.back()}>Cancelar</Button>
                            <Button
                                size="lg"
                                className="px-10 h-14 text-lg font-bold gap-2 shadow-xl shadow-primary/20"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                                {saving ? "Guardando..." : "Guardar Cambios"}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
