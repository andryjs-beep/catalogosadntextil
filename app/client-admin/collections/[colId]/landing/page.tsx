'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Sparkles, Save, Trash2, Plus } from 'lucide-react';

export default function ClientLandingEditorPage({ params }: { params: Promise<{ colId: string }> }) {
    const { colId } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, [colId]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/client-admin/collections');
            const json = await res.json();

            // También necesitamos la info de branding/businessInfo del tenant para la IA
            const tenantRes = await fetch('/api/client-admin/branding');
            const tenantData = await tenantRes.json();

            if (res.ok && tenantRes.ok) {
                const tc = json.collections.find((c: any) =>
                    (c.collectionId._id === colId || c.collectionId === colId)
                );

                if (tc) {
                    const baseLanding = {
                        hero: { headline: "", subheadline: "", ctaText: "Ver Catálogo", heroImage: "", videoUrl: "" },
                        benefits: { items: [] },
                        faq: [],
                        finalCTA: { headline: "", description: "", ctaText: "Contactar Ahora" },
                        socialProof: { stats: [], testimonials: [], logos: [] }
                    };

                    setData({
                        ...tc,
                        landingPageSections: { ...baseLanding, ...(tc.landingPageSections || {}) },
                        tenant: tenantData.tenant
                    });
                } else {
                    toast.error('Colección no encontrada');
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
                        name: data.collectionId.name,
                    },
                    tenantInfo: data.tenant.businessInfo
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
            const saveRes = await fetch(`/api/client-admin/collections/${colId}/landing`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    useLandingLayout: data.useLandingLayout,
                    landingPageSections: data.landingPageSections,
                    persuasiveTextTop: data.persuasiveTextTop,
                    persuasiveTextBottom: data.persuasiveTextBottom,
                    ctaButtonText: data.ctaButtonText,
                    isPublished: data.isPublished
                })
            });

            if (saveRes.ok) {
                toast.success('Landing Page guardada con éxito');
                router.push('/client-admin/collections');
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
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            <div className="flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-sm z-30 py-4 border-b">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{data.collectionId.name}</h1>
                        <p className="text-sm text-slate-500">Diseño de landing page</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.back()}>Descartar</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Guardar Cambios
                    </Button>
                </div>
            </div>

            {/* Configuración General */}
            <Card className="border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="font-bold text-lg text-primary">Modo Landing Page (Alta Conversión)</h3>
                            <p className="text-sm text-slate-600">Activa secciones especiales para atraer más clientes.</p>
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
                <div className="space-y-8">
                    {/* SECCIÓN HERO */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Cabecera Principal (Hero)</CardTitle>
                                <CardDescription>Lo primero que verán tus clientes.</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-primary border-primary/20"
                                onClick={() => generateSection('hero')}
                                disabled={generating}
                            >
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Ayuda de IA
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Título Impactante (Headline)</Label>
                                <Input
                                    value={data.landingPageSections.hero.headline}
                                    onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, headline: e.target.value } } })}
                                    placeholder="Ej: Calidad extrema en cada puntada"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Descripción persuasiva (Subheadline)</Label>
                                <Textarea
                                    value={data.landingPageSections.hero.subheadline}
                                    onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, subheadline: e.target.value } } })}
                                    placeholder="Cuéntales por qué tu producto es único."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Texto del Botón</Label>
                                    <Input
                                        value={data.landingPageSections.hero.ctaText}
                                        onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, ctaText: e.target.value } } })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Imagen URL</Label>
                                    <Input
                                        value={data.landingPageSections.hero.heroImage}
                                        onChange={(e) => setData({ ...data, landingPageSections: { ...data.landingPageSections, hero: { ...data.landingPageSections.hero, heroImage: e.target.value } } })}
                                        placeholder="Usa una imagen de tu galería"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* SECCIÓN BENEFICIOS */}
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Beneficios de la Colección</CardTitle>
                                <CardDescription>Dales razones para comprar ahora.</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-primary border-primary/20"
                                onClick={() => generateSection('benefits')}
                                disabled={generating}
                            >
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Generar con IA
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
                                            <Label>Icono</Label>
                                            <select
                                                className="w-full p-2 border rounded-md bg-white"
                                                value={benefit.icon}
                                                onChange={(e) => {
                                                    const newItems = [...data.landingPageSections.benefits.items];
                                                    newItems[index].icon = e.target.value;
                                                    setData({ ...data, landingPageSections: { ...data.landingPageSections, benefits: { items: newItems } } });
                                                }}
                                            >
                                                <option value="truck">Envío rápido</option>
                                                <option value="shield">Garantía</option>
                                                <option value="star">Calidad Premium</option>
                                                <option value="zap">Velocidad</option>
                                                <option value="heart">Hecho con amor</option>
                                                <option value="award">Certificado</option>
                                            </select>
                                        </div>
                                        <div className="md:col-span-2 space-y-2">
                                            <Label>Título del beneficio</Label>
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
                                            <Label>Por qué importa</Label>
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
                    <Card className="shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle>Preguntas y Respuestas</CardTitle>
                                <CardDescription>Elimina dudas finales.</CardDescription>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2 text-primary border-primary/20"
                                onClick={() => generateSection('faq')}
                                disabled={generating}
                            >
                                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                                Sugerir FAQ
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
                                            <Label className="text-xs uppercase text-slate-400">Pregunta del cliente</Label>
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
                                            <Label className="text-xs uppercase text-slate-400">Tu respuesta</Label>
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
                                <Plus className="h-4 w-4 mr-2" /> Agregar FAQ
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
