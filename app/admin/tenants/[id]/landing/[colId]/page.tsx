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
import { Loader2, ArrowLeft, Sparkles, Save, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function LandingEditorPage({ params }: { params: Promise<{ id: string, colId: string }> }) {
    const { id: tenantId, colId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [tenantId, colId]);

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
                        // Campos Premium
                        countdown: { enabled: false, durationMinutes: 30, title: "⚡ ¡OFERTA POR TIEMPO LIMITADO!", subtitle: "Aprovecha antes de que termine" },
                        sizes: { enabled: false, items: [] },
                        buttonStyles: { bgColor: "#25D366", textColor: "#ffffff", borderRadius: "pill", animation: "scale" },
                        termsAndConditions: { enabled: false, content: "", requireAcceptance: false },
                        badge: { enabled: false, type: "new", customText: "", discount: 0 },
                        showProductGallery: true,
                        showStickyCTA: true
                    };

                    // Asegurar que tenant tenga businessInfo con defaults
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
            const response = await fetch('/api/ai/generate-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'collection',
                    section,
                    productInfo: {
                        name: data.collectionId?.name || 'Colección',
                    },
                    tenantInfo: data.tenant?.businessInfo || {},
                    productContext: data.productContext || ''
                })
            });

            const aiData = await response.json();
            if (aiData.success) {
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
            // Obtener todas las asignaciones actuales para no sobreescribir las demás
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
                return {
                    collectionId: tc.collectionId._id || tc.collectionId,
                    persuasiveTextTop: tc.persuasiveTextTop,
                    persuasiveTextBottom: tc.persuasiveTextBottom,
                    ctaButtonText: tc.ctaButtonText,
                    isPublished: tc.isPublished,
                    order: tc.order,
                    useLandingLayout: tc.useLandingLayout,
                    landingPageSections: tc.landingPageSections
                };
            });

            const saveRes = await fetch(`/api/admin/tenants/${tenantId}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignments })
            });

            if (saveRes.ok) {
                toast.success('Landing Page guardada con éxito');
                router.back();
            } else {
                toast.error('Error al guardar cambios');
            }
        } catch (error) {
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
                                    Proporciona información extra sobre tu producto: características especiales, precios, materiales, ventajas, o incluso un enlace a la competencia para inspirar el copy.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={data.productContext || ''}
                                    onChange={(e) => setData({ ...data, productContext: e.target.value })}
                                    rows={6}
                                    placeholder="Ej: - Material: Algodón 100% peruano
- Precio: $29.990 oferta (antes $45.990)
- Envío gratis en pedidos +$50.000
- Competencia: https://ejemplo.com/producto-similar
- Beneficio clave: Durabilidad superior"
                                    className="bg-white"
                                />
                            </CardContent>
                        </Card>

                        {/* ===== CONFIGURACIÓN PREMIUM ===== */}

                        {/* CONTADOR DE OFERTA */}
                        <Card className="border-red-200 bg-red-50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-red-900 flex items-center gap-2">
                                            🔥 Contador de Oferta (Urgencia)
                                        </CardTitle>
                                        <CardDescription className="text-red-700">
                                            Crea urgencia con un contador que se reinicia al entrar.
                                        </CardDescription>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-6 w-6 rounded border-red-300 text-red-500 focus:ring-red-500"
                                        checked={data.landingPageSections.countdown?.enabled || false}
                                        onChange={(e) => setData({
                                            ...data,
                                            landingPageSections: {
                                                ...data.landingPageSections,
                                                countdown: { ...data.landingPageSections.countdown, enabled: e.target.checked }
                                            }
                                        })}
                                    />
                                </div>
                            </CardHeader>
                            {data.landingPageSections.countdown?.enabled && (
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Duración (minutos)</Label>
                                            <Input
                                                type="number"
                                                value={data.landingPageSections.countdown?.durationMinutes || 30}
                                                onChange={(e) => setData({
                                                    ...data,
                                                    landingPageSections: {
                                                        ...data.landingPageSections,
                                                        countdown: { ...data.landingPageSections.countdown, durationMinutes: parseInt(e.target.value) }
                                                    }
                                                })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Título del Contador</Label>
                                        <Input
                                            value={data.landingPageSections.countdown?.title || ''}
                                            onChange={(e) => setData({
                                                ...data,
                                                landingPageSections: {
                                                    ...data.landingPageSections,
                                                    countdown: { ...data.landingPageSections.countdown, title: e.target.value }
                                                }
                                            })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Subtítulo</Label>
                                        <Input
                                            value={data.landingPageSections.countdown?.subtitle || ''}
                                            onChange={(e) => setData({
                                                ...data,
                                                landingPageSections: {
                                                    ...data.landingPageSections,
                                                    countdown: { ...data.landingPageSections.countdown, subtitle: e.target.value }
                                                }
                                            })}
                                        />
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* BADGE/ETIQUETA */}
                        <Card className="border-purple-200 bg-purple-50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-purple-900 flex items-center gap-2">
                                            🏷️ Etiqueta de Producto (Badge)
                                        </CardTitle>
                                        <CardDescription className="text-purple-700">
                                            Agrega etiquetas como "Más Vendido", "Nuevo", "Oferta".
                                        </CardDescription>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-6 w-6 rounded border-purple-300 text-purple-500 focus:ring-purple-500"
                                        checked={data.landingPageSections.badge?.enabled || false}
                                        onChange={(e) => setData({
                                            ...data,
                                            landingPageSections: {
                                                ...data.landingPageSections,
                                                badge: { ...data.landingPageSections.badge, enabled: e.target.checked }
                                            }
                                        })}
                                    />
                                </div>
                            </CardHeader>
                            {data.landingPageSections.badge?.enabled && (
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Tipo de Etiqueta</Label>
                                        <select
                                            className="w-full p-2 border rounded-md bg-white"
                                            value={data.landingPageSections.badge?.type || 'new'}
                                            onChange={(e) => setData({
                                                ...data,
                                                landingPageSections: {
                                                    ...data.landingPageSections,
                                                    badge: { ...data.landingPageSections.badge, type: e.target.value }
                                                }
                                            })}
                                        >
                                            <option value="bestseller">🏆 Más Vendido</option>
                                            <option value="new">✨ Nuevo</option>
                                            <option value="sale">🔥 Oferta</option>
                                            <option value="limited">⏰ Edición Limitada</option>
                                            <option value="exclusive">⭐ Exclusivo</option>
                                            <option value="custom">Personalizado</option>
                                        </select>
                                    </div>
                                    {data.landingPageSections.badge?.type === 'sale' && (
                                        <div className="space-y-2">
                                            <Label>Porcentaje de Descuento</Label>
                                            <Input
                                                type="number"
                                                value={data.landingPageSections.badge?.discount || 0}
                                                onChange={(e) => setData({
                                                    ...data,
                                                    landingPageSections: {
                                                        ...data.landingPageSections,
                                                        badge: { ...data.landingPageSections.badge, discount: parseInt(e.target.value) }
                                                    }
                                                })}
                                                placeholder="Ej: 30"
                                            />
                                        </div>
                                    )}
                                    {data.landingPageSections.badge?.type === 'custom' && (
                                        <div className="space-y-2">
                                            <Label>Texto Personalizado</Label>
                                            <Input
                                                value={data.landingPageSections.badge?.customText || ''}
                                                onChange={(e) => setData({
                                                    ...data,
                                                    landingPageSections: {
                                                        ...data.landingPageSections,
                                                        badge: { ...data.landingPageSections.badge, customText: e.target.value }
                                                    }
                                                })}
                                                placeholder="Ej: 🎉 Super Promo"
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            )}
                        </Card>

                        {/* TALLAS */}
                        <Card className="border-blue-200 bg-blue-50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-blue-900 flex items-center gap-2">
                                            👕 Selector de Tallas
                                        </CardTitle>
                                        <CardDescription className="text-blue-700">
                                            Permite a los clientes seleccionar tallas antes de contactar.
                                        </CardDescription>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-6 w-6 rounded border-blue-300 text-blue-500 focus:ring-blue-500"
                                        checked={data.landingPageSections.sizes?.enabled || false}
                                        onChange={(e) => setData({
                                            ...data,
                                            landingPageSections: {
                                                ...data.landingPageSections,
                                                sizes: { ...data.landingPageSections.sizes, enabled: e.target.checked }
                                            }
                                        })}
                                    />
                                </div>
                            </CardHeader>
                            {data.landingPageSections.sizes?.enabled && (
                                <CardContent className="space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        {(data.landingPageSections.sizes?.items || []).map((size: any, index: number) => (
                                            <div key={index} className="flex items-center gap-2 bg-white p-2 rounded-lg border">
                                                <span className="font-bold">{size.name}</span>
                                                <input
                                                    type="checkbox"
                                                    checked={size.available}
                                                    onChange={(e) => {
                                                        const newItems = [...data.landingPageSections.sizes.items];
                                                        newItems[index].available = e.target.checked;
                                                        setData({
                                                            ...data,
                                                            landingPageSections: {
                                                                ...data.landingPageSections,
                                                                sizes: { ...data.landingPageSections.sizes, items: newItems }
                                                            }
                                                        });
                                                    }}
                                                    className="h-4 w-4"
                                                />
                                                <button
                                                    onClick={() => {
                                                        const newItems = data.landingPageSections.sizes.items.filter((_: any, i: number) => i !== index);
                                                        setData({
                                                            ...data,
                                                            landingPageSections: {
                                                                ...data.landingPageSections,
                                                                sizes: { ...data.landingPageSections.sizes, items: newItems }
                                                            }
                                                        });
                                                    }}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex gap-2">
                                        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                            <Button
                                                key={size}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const exists = data.landingPageSections.sizes?.items?.some((s: any) => s.name === size);
                                                    if (!exists) {
                                                        const newItems = [...(data.landingPageSections.sizes?.items || []), { name: size, available: true }];
                                                        setData({
                                                            ...data,
                                                            landingPageSections: {
                                                                ...data.landingPageSections,
                                                                sizes: { ...data.landingPageSections.sizes, items: newItems }
                                                            }
                                                        });
                                                    }
                                                }}
                                            >
                                                + {size}
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* TÉRMINOS Y CONDICIONES */}
                        <Card className="border-slate-200 bg-slate-50">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-slate-900 flex items-center gap-2">
                                            📜 Términos y Condiciones
                                        </CardTitle>
                                        <CardDescription className="text-slate-700">
                                            Añade políticas de envío, devolución, garantías, etc.
                                        </CardDescription>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-6 w-6 rounded border-slate-300 text-slate-500 focus:ring-slate-500"
                                        checked={data.landingPageSections.termsAndConditions?.enabled || false}
                                        onChange={(e) => setData({
                                            ...data,
                                            landingPageSections: {
                                                ...data.landingPageSections,
                                                termsAndConditions: { ...data.landingPageSections.termsAndConditions, enabled: e.target.checked }
                                            }
                                        })}
                                    />
                                </div>
                            </CardHeader>
                            {data.landingPageSections.termsAndConditions?.enabled && (
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Contenido de Términos</Label>
                                        <Textarea
                                            value={data.landingPageSections.termsAndConditions?.content || ''}
                                            onChange={(e) => setData({
                                                ...data,
                                                landingPageSections: {
                                                    ...data.landingPageSections,
                                                    termsAndConditions: { ...data.landingPageSections.termsAndConditions, content: e.target.value }
                                                }
                                            })}
                                            rows={8}
                                            placeholder="**Políticas de Envío**
- Envío gratis en compras mayores a $50.000
- Tiempo de entrega: 3-5 días hábiles

**Devoluciones**
- Tienes 30 días para solicitar devolución
- El producto debe estar sin usar"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded"
                                            checked={data.landingPageSections.termsAndConditions?.requireAcceptance || false}
                                            onChange={(e) => setData({
                                                ...data,
                                                landingPageSections: {
                                                    ...data.landingPageSections,
                                                    termsAndConditions: { ...data.landingPageSections.termsAndConditions, requireAcceptance: e.target.checked }
                                                }
                                            })}
                                        />
                                        <Label>Requerir aceptación antes de contactar</Label>
                                    </div>
                                </CardContent>
                            )}
                        </Card>

                        {/* OPCIONES DE VISUALIZACIÓN */}
                        <Card>
                            <CardHeader>
                                <CardTitle>⚙️ Opciones de Visualización</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Mostrar Galería de Imágenes</p>
                                        <p className="text-sm text-slate-500">Muestra las imágenes del producto al inicio</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5"
                                        checked={data.landingPageSections.showProductGallery !== false}
                                        onChange={(e) => setData({
                                            ...data,
                                            landingPageSections: { ...data.landingPageSections, showProductGallery: e.target.checked }
                                        })}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-medium">Botón Flotante (Móvil)</p>
                                        <p className="text-sm text-slate-500">CTA fijo que sigue al usuario</p>
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="h-5 w-5"
                                        checked={data.landingPageSections.showStickyCTA !== false}
                                        onChange={(e) => setData({
                                            ...data,
                                            landingPageSections: { ...data.landingPageSections, showStickyCTA: e.target.checked }
                                        })}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* SECCIÓN HERO */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                                <div>
                                    <CardTitle>Sección Hero (Encabezado)</CardTitle>
                                    <CardDescription>La primera impresión que verá el usuario.</CardDescription>
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
                                        value={data.landingPageSections.hero.headline}
                                        onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, headline: e.target.value } } })}
                                        placeholder="Ej: Gorras que definen tu estilo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Subheadline (Bajada)</Label>
                                    <Textarea
                                        value={data.landingPageSections.hero.subheadline}
                                        onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, subheadline: e.target.value } } })}
                                        placeholder="Ej: Nuestra nueva colección combina diseño urbano con la mejor calidad."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Texto Botón CTA</Label>
                                        <Input
                                            value={data.landingPageSections.hero.ctaText}
                                            onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, ctaText: e.target.value } } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Imagen URL (Hero)</Label>
                                        <Input
                                            value={data.landingPageSections.hero.heroImage}
                                            onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, heroImage: e.target.value } } })}
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
                                    <CardDescription>3-4 puntos fuertes que destaquen el valor de tu oferta.</CardDescription>
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
                                {data.landingPageSections.benefits.items.map((benefit: any, index: number) => (
                                    <div key={index} className="p-4 border rounded-xl bg-slate-50 relative group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500"
                                            onClick={() => {
                                                const newItems = [...data.landingPageSections.benefits.items];
                                                newItems.splice(index, 1);
                                                setData({ ...data, landingPageSections: { ...data.landingPageSections, benefits: { items: newItems } } });
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label>Icono (Lucide)</Label>
                                                <select
                                                    className="w-full p-2 border rounded-md bg-white"
                                                    value={benefit.icon}
                                                    onChange={(e) => {
                                                        const newItems = [...data.landingPageSections.benefits.items];
                                                        newItems[index].icon = e.target.value;
                                                        setData({ ...data, landingPageSections: { ...data.landingPageSections, benefits: { items: newItems } } });
                                                    }}
                                                >
                                                    <option value="shield">Escudo</option>
                                                    <option value="truck">Camión (Inmediato)</option>
                                                    <option value="star">Estrella (Calidad)</option>
                                                    <option value="zap">Rayo (Rápido)</option>
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
                                                        const newItems = [...data.landingPageSections.benefits.items];
                                                        newItems[index].title = e.target.value;
                                                        setData({ ...data, landingPageSections: { ...data.landingPageSections, benefits: { items: newItems } } });
                                                    }}
                                                />
                                            </div>
                                            <div className="md:col-span-3 space-y-2">
                                                <Label>Descripción Corta</Label>
                                                <Textarea
                                                    rows={2}
                                                    value={benefit.description}
                                                    onChange={(e) => {
                                                        const newItems = [...data.landingPageSections.benefits.items];
                                                        newItems[index].description = e.target.value;
                                                        setData({ ...data, landingPageSections: { ...data.landingPageSections, benefits: { items: newItems } } });
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
                                        const newItems = [...data.landingPageSections.benefits.items, { icon: 'star', title: '', description: '' }];
                                        setData({ ...data, landingPageSections: { ...data.landingPageSections, benefits: { items: newItems } } });
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
                                {data.landingPageSections.faq.map((item: any, index: number) => (
                                    <div key={index} className="p-4 border rounded-xl relative group">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-red-500"
                                            onClick={() => {
                                                const newFaq = [...data.landingPageSections.faq];
                                                newFaq.splice(index, 1);
                                                setData({ ...data, landingPageSections: { ...data.landingPageSections, faq: newFaq } });
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
                                                        const newFaq = [...data.landingPageSections.faq];
                                                        newFaq[index].question = e.target.value;
                                                        setData({ ...data, landingPageSections: { ...data.landingPageSections, faq: newFaq } });
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs uppercase text-slate-500">Respuesta</Label>
                                                <Textarea
                                                    value={item.answer}
                                                    onChange={(e) => {
                                                        const newFaq = [...data.landingPageSections.faq];
                                                        newFaq[index].answer = e.target.value;
                                                        setData({ ...data, landingPageSections: { ...data.landingPageSections, faq: newFaq } });
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
                                        const newFaq = [...data.landingPageSections.faq, { question: '', answer: '' }];
                                        setData({ ...data, landingPageSections: { ...data.landingPageSections, faq: newFaq } });
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
                                        value={data.landingPageSections.finalCTA.headline}
                                        onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, finalCTA: { ...data.landingPageSections.finalCTA, headline: e.target.value } } })}
                                        placeholder="Ej: ¿Listo para llevar tu estilo al siguiente nivel?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Descripción de Cierre</Label>
                                    <Textarea
                                        value={data.landingPageSections.finalCTA.description}
                                        onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, finalCTA: { ...data.landingPageSections.finalCTA, description: e.target.value } } })}
                                        placeholder="Ej: Haz clic abajo y uno de nuestros asesores te ayudará con tu pedido."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Texto Botón Final</Label>
                                    <Input
                                        value={data.landingPageSections.finalCTA.ctaText}
                                        onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, finalCTA: { ...data.landingPageSections.finalCTA, ctaText: e.target.value } } })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            <div className="mt-8 flex justify-end gap-3 pb-20">
                <Button variant="outline" size="lg" onClick={() => router.back()}>Cancelar</Button>
                <Button size="lg" onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Cambios
                </Button>
            </div>
        </div>
    );
}
