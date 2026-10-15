'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Sparkles, Save, Plus, Trash2, CheckCircle2, Store } from 'lucide-react';
import { CustomerReviewsSection, TestimonialItem } from '@/components/CustomerReviewsSection';

const VENEZUELAN_CITIES = [
    'Maracaibo', 'Caracas', 'Valencia', 'Barquisimeto', 
    'San Cristóbal', 'Lechería', 'Mérida', 'Ciudad Guayana', 
    'San Francisco', 'Maracay', 'Maturín', 'Puerto La Cruz'
];

export default function SuperAdminTestimonialsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [selectedTenantId, setSelectedTenantId] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);

    const [enabled, setEnabled] = useState(true);
    const [displayScope, setDisplayScope] = useState<'all' | 'custom'>('all');
    const [title, setTitle] = useState('Clientes felices en toda Venezuela');
    const [score, setScore] = useState('4.8');
    const [totalReviewsText, setTotalReviewsText] = useState('+189 reseñas verificadas');
    const [items, setItems] = useState<TestimonialItem[]>([]);

    useEffect(() => {
        fetchTenants();
    }, []);

    const fetchTenants = async () => {
        try {
            const res = await fetch('/api/admin/tenants');
            const data = await res.json();
            if (res.ok && data.tenants && data.tenants.length > 0) {
                setTenants(data.tenants);
                const firstId = data.tenants[0]._id;
                setSelectedTenantId(firstId);
                loadTenantReviews(firstId);
            }
        } catch {
            toast.error('Error al cargar clientes');
        } finally {
            setLoading(false);
        }
    };

    const loadTenantReviews = async (tenantId: string) => {
        try {
            const res = await fetch(`/api/admin/tenants/${tenantId}`);
            const data = await res.json();
            if (res.ok && data.tenant) {
                const conf = data.tenant.testimonialsConfig || {};
                setEnabled(conf.enabled !== false);
                setDisplayScope(conf.displayScope || 'all');
                setTitle(conf.title || 'Clientes felices en toda Venezuela');
                setScore(conf.score || '4.8');
                setTotalReviewsText(conf.totalReviewsText || '+189 reseñas verificadas');
                setItems(conf.items || [
                    {
                        name: 'Sandra G.',
                        city: 'Maracaibo',
                        text: 'Me encanta, la calidad de la tela es insuperable y el estampado no se cae con las lavadas. Pagué al recibir con delivery.',
                        rating: 5,
                        verified: true
                    },
                    {
                        name: 'Carlos L.',
                        city: 'Valencia',
                        text: 'Tenía dudas al principio pero llegó súper rápido por MRW. Muy bien empaquetado y la talla exacta. Súper recomendado.',
                        rating: 5,
                        verified: true
                    },
                    {
                        name: 'Luisa M.',
                        city: 'Caracas',
                        text: 'Llegó en el tiempo prometido. Los colores están súper vivos y la atención por WhatsApp fue excelente.',
                        rating: 4,
                        verified: true
                    }
                ]);
            }
        } catch {
            toast.error('Error al cargar datos del cliente');
        }
    };

    const handleTenantChange = (tenantId: string) => {
        setSelectedTenantId(tenantId);
        loadTenantReviews(tenantId);
    };

    const handleSave = async () => {
        if (!selectedTenantId) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/tenants/${selectedTenantId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    testimonialsConfig: {
                        enabled,
                        displayScope,
                        title,
                        score,
                        totalReviewsText,
                        items
                    }
                })
            });

            if (res.ok) {
                toast.success('Reseñas guardadas exitosamente');
            } else {
                toast.error('Error al guardar reseñas');
            }
        } catch {
            toast.error('Error de conexión');
        } finally {
            setSaving(false);
        }
    };

    const handleGenerateAI = async () => {
        setGenerating(true);
        try {
            const currentTenant = tenants.find(t => t._id === selectedTenantId);
            const res = await fetch('/api/ai/generate-copy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'collection',
                    section: 'testimonials',
                    productInfo: { name: currentTenant?.slug ? `Catálogo ${currentTenant.slug}` : 'Catálogo Textil' },
                    tenantInfo: { niche: 'Moda y Ropa Personalizada' }
                })
            });

            const data = await res.json();
            if (data.success && data.content) {
                if (data.content.title) setTitle(data.content.title);
                if (data.content.score) setScore(data.content.score);
                if (data.content.totalReviewsText) setTotalReviewsText(data.content.totalReviewsText);
                if (Array.isArray(data.content.items) && data.content.items.length > 0) {
                    setItems(data.content.items);
                }
                toast.success('Reseñas de Venezuela generadas con éxito');
            } else {
                toast.error(data.error || 'No se pudieron generar las reseñas');
            }
        } catch {
            toast.error('Error de conexión con la IA');
        } finally {
            setGenerating(false);
        }
    };

    const handleAddItem = () => {
        setItems([
            ...items,
            {
                name: 'Cliente Nuevo',
                city: 'Caracas',
                text: 'Excelente servicio, muy recomendado.',
                rating: 5,
                verified: true
            }
        ]);
    };

    const handleRemoveItem = (index: number) => {
        const next = [...items];
        next.splice(index, 1);
        setItems(next);
    };

    const handleUpdateItem = (index: number, field: keyof TestimonialItem, value: any) => {
        const next = [...items];
        next[index] = { ...next[index], [field]: value };
        setItems(next);
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header Superior con Selector de Cliente y Acciones */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                        Reseñas de Clientes (Social Proof)
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Configura las reseñas verificadas en Venezuela para cada catálogo.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Selector de Tenant */}
                    <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border shadow-sm">
                        <Store className="h-4 w-4 text-slate-500" />
                        <select
                            value={selectedTenantId}
                            onChange={(e) => handleTenantChange(e.target.value)}
                            className="bg-transparent text-sm font-semibold text-slate-800 focus:outline-none cursor-pointer"
                        >
                            {tenants.map((t) => (
                                <option key={t._id} value={t._id}>
                                    {t.slug}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        variant="outline"
                        className="gap-2 border-primary/20 text-primary hover:bg-primary/5"
                        onClick={handleGenerateAI}
                        disabled={generating}
                    >
                        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                        Sugerir Reseñas con IA
                    </Button>
                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Guardar Cambios
                    </Button>
                </div>
            </div>

            {/* Configuración General y Alcance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">Configuración del Banner</CardTitle>
                        <CardDescription>
                            Personaliza el título, puntuación global y contador de reseñas.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>Título Principal</Label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Clientes felices en toda Venezuela"
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Puntuación Global (1.0 a 5.0)</Label>
                                <Input
                                    value={score}
                                    onChange={(e) => setScore(e.target.value)}
                                    placeholder="4.8"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Texto de Reseñas Verificadas</Label>
                                <Input
                                    value={totalReviewsText}
                                    onChange={(e) => setTotalReviewsText(e.target.value)}
                                    placeholder="+189 reseñas verificadas"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Control de Visibilidad */}
                <Card className="shadow-sm border-primary/20 bg-primary/[0.02]">
                    <CardHeader>
                        <CardTitle className="text-lg">Visibilidad y Alcance</CardTitle>
                        <CardDescription>
                            Decide dónde se muestran estas referencias.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl border">
                            <div className="space-y-0.5">
                                <Label className="font-bold">Activar Sección</Label>
                                <p className="text-xs text-slate-500">Muestra u oculta las reseñas.</p>
                            </div>
                            <input
                                type="checkbox"
                                className="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                                checked={enabled}
                                onChange={(e) => setEnabled(e.target.checked)}
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-xs font-bold uppercase text-slate-400">¿Dónde mostrarlas?</Label>
                            <div className="space-y-2">
                                <label className="flex items-start gap-3 p-3 bg-white rounded-xl border cursor-pointer hover:border-slate-300 transition-colors">
                                    <input
                                        type="radio"
                                        name="scope"
                                        value="all"
                                        checked={displayScope === 'all'}
                                        onChange={() => setDisplayScope('all')}
                                        className="mt-1 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900">En todas las páginas</p>
                                        <p className="text-xs text-slate-500">Aparecerá en el home del catálogo y en todas las landings.</p>
                                    </div>
                                </label>

                                <label className="flex items-start gap-3 p-3 bg-white rounded-xl border cursor-pointer hover:border-slate-300 transition-colors">
                                    <input
                                        type="radio"
                                        name="scope"
                                        value="custom"
                                        checked={displayScope === 'custom'}
                                        onChange={() => setDisplayScope('custom')}
                                        className="mt-1 text-primary focus:ring-primary"
                                    />
                                    <div>
                                        <p className="font-semibold text-sm text-slate-900">Solo en landings de productos</p>
                                        <p className="text-xs text-slate-500">Se mostrará exclusivamente en las páginas de venta directa.</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Listado de Reseñas Editables */}
            <Card className="shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-lg">Tarjetas de Reseñas ({items.length})</CardTitle>
                        <CardDescription>
                            Edita el nombre del cliente, su ciudad venezolana y el testimonio.
                        </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-2">
                        <Plus className="h-4 w-4" /> Agregar Reseña
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {items.map((item, index) => (
                        <div key={index} className="p-5 border rounded-2xl bg-slate-50/50 space-y-4 relative group">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-3 right-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleRemoveItem(index)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>

                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                <div className="sm:col-span-4 space-y-1">
                                    <Label className="text-xs">Nombre del Cliente</Label>
                                    <Input
                                        value={item.name}
                                        onChange={(e) => handleUpdateItem(index, 'name', e.target.value)}
                                        placeholder="Ej: Sandra G."
                                    />
                                </div>

                                <div className="sm:col-span-4 space-y-1">
                                    <Label className="text-xs">Ciudad de Venezuela</Label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={item.city}
                                        onChange={(e) => handleUpdateItem(index, 'city', e.target.value)}
                                    >
                                        {VENEZUELAN_CITIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="sm:col-span-2 space-y-1">
                                    <Label className="text-xs">Estrellas</Label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                        value={item.rating}
                                        onChange={(e) => handleUpdateItem(index, 'rating', Number(e.target.value))}
                                    >
                                        <option value={5}>5 Estrellas</option>
                                        <option value={4}>4 Estrellas</option>
                                    </select>
                                </div>

                                <div className="sm:col-span-2 flex items-center pt-5">
                                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                                        <input
                                            type="checkbox"
                                            className="h-4 w-4 rounded text-primary focus:ring-primary"
                                            checked={item.verified !== false}
                                            onChange={(e) => handleUpdateItem(index, 'verified', e.target.checked)}
                                        />
                                        Verificado
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Label className="text-xs">Comentario</Label>
                                <Textarea
                                    rows={2}
                                    value={item.text}
                                    onChange={(e) => handleUpdateItem(index, 'text', e.target.value)}
                                    placeholder="Opinión del cliente..."
                                />
                            </div>
                        </div>
                    ))}

                    {items.length === 0 && (
                        <div className="text-center py-12 border-2 border-dashed rounded-2xl text-slate-400">
                            No hay reseñas agregadas. Pulsa "Sugerir Reseñas con IA" o "Agregar Reseña".
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Vista Previa en Vivo */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900">Vista Previa en Vivo de la Sección</h2>
                </div>
                <div className="rounded-3xl border overflow-hidden shadow-sm">
                    <CustomerReviewsSection
                        title={title}
                        score={score}
                        totalReviewsText={totalReviewsText}
                        items={items}
                    />
                </div>
            </div>
        </div>
    );
}
