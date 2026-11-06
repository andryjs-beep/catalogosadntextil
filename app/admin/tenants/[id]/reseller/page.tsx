'use client';

import {
    useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Save,
    Users,
    Eye,
    Link2,
    Copy,
    Check,
    ExternalLink,
    ToggleLeft,
    ToggleRight,
    Plus,
    Trash2,
    Phone,
    UserCheck,
    MessageCircle,
    Palette,
    Upload,
    ImageIcon,
    Loader2,
    Type,
    Shield,
    ChevronDown,
    ChevronUp,
    Sparkles,
} from 'lucide-react';

interface ResellerItem {
    name: string;
    slug: string;
    whatsappNumber: string;
    isActive: boolean;
    createdAt?: string;
}

interface ResellerConfig {
    enabled: boolean;
    slug: string;
    whatsappNumber?: string;
    headerTitle: string;
    headerSubtitle: string;
    hideLogo: boolean;
    hideBusinessName: boolean;
    hideSocialLinks: boolean;
    footerText: string;
    resellers?: ResellerItem[];
    shareImage?: string;
    // Nuevos campos de personalización
    primaryColor?: string;
    buttonText?: string;
    buttonSubtext?: string;
    ctaText?: string;
    badgeText?: string;
    whatsappMessage?: string;
    trustBadge1?: string;
    trustBadge2?: string;
    trustBadge3?: string;
    step1Title?: string;
    step1Desc?: string;
    step2Title?: string;
    step2Desc?: string;
    step3Title?: string;
    step3Desc?: string;
    tickerEnabled?: boolean;
    tickerText?: string;
    tickerBgColor?: string;
    tickerTextColor?: string;
    tickerSpeed?: 'slow' | 'normal' | 'fast';
    tickerDirection?: 'left' | 'right';
}

// WhatsApp SVG Icon
function WhatsAppIcon({ size = 18 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
    );
}

export default function ResellerConfigPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | 'main' | null>(null);
    const [tenantSlug, setTenantSlug] = useState('');
    const [showDesignPanel, setShowDesignPanel] = useState(false);
    const [showStepsPanel, setShowStepsPanel] = useState(false);
    const [showTickerPanel, setShowTickerPanel] = useState(false);
    const [isUploadingShareImage, setIsUploadingShareImage] = useState(false);
    const [config, setConfig] = useState<ResellerConfig>({
        enabled: false,
        slug: '',
        whatsappNumber: '',
        headerTitle: 'Catálogo Online',
        headerSubtitle: 'Encuentra los mejores productos',
        hideLogo: true,
        hideBusinessName: true,
        hideSocialLinks: true,
        footerText: '© Catálogo Online',
        resellers: [],
        shareImage: '',
        primaryColor: '#25D366',
        buttonText: 'Pedir por WhatsApp',
        buttonSubtext: '¡Hazlo realidad!',
        ctaText: 'Hacer mi pedido ahora',
        badgeText: 'Diseño Disponible',
        whatsappMessage: '',
        trustBadge1: '✅ Respuesta en minutos',
        trustBadge2: '🔒 Pago seguro',
        trustBadge3: '🚚 Envío rápido',
        step1Title: 'Captura el diseño',
        step1Desc: 'Navega por el catálogo y toma captura del diseño que más te guste.',
        step2Title: 'Dinos cuánto',
        step2Desc: 'Envíanos la cantidad y talla (si aplica). Atendemos desde 1 unidad.',
        step3Title: 'Espera el envío',
        step3Desc: 'Confirmamos tu pedido al instante y coordinamos la entrega rápida y segura.',
        tickerEnabled: false,
        tickerText: '',
        tickerBgColor: '#0f172a',
        tickerTextColor: '#ffffff',
        tickerSpeed: 'normal',
        tickerDirection: 'left',
    });

    // Estado para nuevo revendedor
    const [newResellerName, setNewResellerName] = useState('');
    const [newResellerSlug, setNewResellerSlug] = useState('');
    const [newResellerWhatsapp, setNewResellerWhatsapp] = useState('');

    useEffect(() => {
        fetchConfig();
    }, [id]);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`/api/admin/tenants/${id}/reseller`);
            if (res.ok) {
                const data = await res.json();
                setConfig({
                    ...data.resellerConfig,
                    resellers: data.resellerConfig.resellers || [],
                });
                setTenantSlug(data.tenantSlug);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    
    const handleUploadShareImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setIsUploadingShareImage(true);
        try {
            const formData = new FormData();
            formData.append('files', file);
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                const data = await res.json();
                const url = data.urls?.[0] || data.url;
                if (url) {
                    setField('shareImage', url);
                }
            } else {
                alert('Error al subir imagen');
            }
        } catch (err) {
            console.error('Error uploading share image:', err);
            alert('Error al subir imagen');
        } finally {
            setIsUploadingShareImage(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/tenants/${id}/reseller`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                const data = await res.json();
                alert(data.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error al guardar la configuración');
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = (text: string, indexKey: number | 'main') => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedIndex(indexKey);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const getFullUrl = (slug: string) => {
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        return `${origin}/r/${slug}`;
    };

    const handleAddReseller = () => {
        if (!newResellerName.trim()) {
            alert('Por favor ingresa el nombre del revendedor');
            return;
        }

        const finalSlug = (newResellerSlug.trim() || newResellerName.trim())
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        if (!finalSlug) { alert('Slug inválido'); return; }

        const exists = (config.resellers || []).some(
            (r) => r.slug.toLowerCase() === finalSlug.toLowerCase()
        );
        if (exists || finalSlug === config.slug) {
            alert('Este slug ya está en uso');
            return;
        }

        const newReseller: ResellerItem = {
            name: newResellerName.trim(),
            slug: finalSlug,
            whatsappNumber: newResellerWhatsapp.trim().replace(/[^0-9]/g, ''),
            isActive: true,
        };

        setConfig({ ...config, resellers: [...(config.resellers || []), newReseller] });
        setNewResellerName('');
        setNewResellerSlug('');
        setNewResellerWhatsapp('');
    };

    const handleRemoveReseller = (index: number) => {
        if (!confirm('¿Deseas eliminar este revendedor?')) return;
        const updated = [...(config.resellers || [])];
        updated.splice(index, 1);
        setConfig({ ...config, resellers: updated });
    };

    const handleToggleReseller = (index: number) => {
        const updated = [...(config.resellers || [])];
        updated[index] = { ...updated[index], isActive: !updated[index].isActive };
        setConfig({ ...config, resellers: updated });
    };

    const handleUpdateResellerWhatsapp = (index: number, val: string) => {
        const updated = [...(config.resellers || [])];
        updated[index] = { ...updated[index], whatsappNumber: val };
        setConfig({ ...config, resellers: updated });
    };

    const setField = (field: keyof ResellerConfig, value: any) =>
        setConfig((prev) => ({ ...prev, [field]: value }));

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const primaryColor = config.primaryColor || '#25D366';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link
                        href={`/admin/tenants/${id}/settings`}
                        className="p-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow text-slate-600"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                            <Users className="h-7 w-7 text-blue-600" />
                            Modo Revendedor
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Personaliza el catálogo y gestiona tus revendedores
                        </p>
                    </div>
                </div>

                {/* ═══ CARD 1: Habilitar + Textos básicos ═══ */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">Habilitar Modo Revendedor</h3>
                            <p className="text-xs text-slate-500">Permite acceso al catálogo sin tus precios ni datos de contacto</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setField('enabled', !config.enabled)}
                            className={`p-1.5 rounded-xl transition-colors ${config.enabled ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100'}`}
                        >
                            {config.enabled ? <ToggleRight className="h-9 w-9" /> : <ToggleLeft className="h-9 w-9" />}
                        </button>
                    </div>

                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Título del Catálogo
                            </label>
                            <input
                                type="text"
                                value={config.headerTitle}
                                onChange={(e) => setField('headerTitle', e.target.value)}
                                placeholder="Catálogo Online"
                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Subtítulo
                            </label>
                            <input
                                type="text"
                                value={config.headerSubtitle}
                                onChange={(e) => setField('headerSubtitle', e.target.value)}
                                placeholder="Encuentra los mejores productos"
                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Texto del Footer
                            </label>
                            <input
                                type="text"
                                value={config.footerText}
                                onChange={(e) => setField('footerText', e.target.value)}
                                placeholder="© Mi Catálogo"
                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Badge del Producto
                            </label>
                            <input
                                type="text"
                                value={config.badgeText || ''}
                                onChange={(e) => setField('badgeText', e.target.value)}
                                placeholder="Diseño Disponible"
                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 pt-4 border-t border-slate-200">
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-2">
                                <ImageIcon className="h-4 w-4 text-emerald-600" />
                                Imagen de Portada para WhatsApp (Vista previa del enlace)
                            </label>
                            <p className="text-xs text-slate-500 mb-3">
                                Esta es la imagen que se verá cuando tú o tus revendedores compartan el enlace por WhatsApp. Si dejas esto vacío o subes una imagen neutra (ej: un flyer que diga "Tienda Online"), no aparecerá el logo de ADN.
                            </p>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                {config.shareImage ? (
                                    <div className="relative group w-36 h-24 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm bg-slate-100 flex-shrink-0">
                                        <img src={config.shareImage} alt="Vista previa WhatsApp" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => setField('shareImage', '')}
                                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-36 h-24 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 text-[11px] text-center p-2 flex-shrink-0">
                                        <ImageIcon className="h-6 w-6 mb-1 text-slate-300" />
                                        <span>Sin imagen</span>
                                    </div>
                                )}
                                <div className="flex flex-col gap-2">
                                    <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors">
                                        {isUploadingShareImage ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Subiendo imagen...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="h-4 w-4" />
                                                <span>{config.shareImage ? 'Cambiar Imagen' : 'Subir Imagen para WhatsApp'}</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleUploadShareImage}
                                            disabled={isUploadingShareImage}
                                            className="hidden"
                                        />
                                    </label>
                                    <span className="text-[11px] text-slate-400">Recomendado: 1200 x 630 px (formato horizontal para WhatsApp)</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ═══ CARD 2: Personalización del Botón WhatsApp ═══ */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowDesignPanel(!showDesignPanel)}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                                <WhatsAppIcon size={20} />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-slate-900 text-base">Botón WhatsApp y Colores</h3>
                                <p className="text-xs text-slate-500">Personaliza el botón CTA, color principal y mensajes</p>
                            </div>
                        </div>
                        {showDesignPanel ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </button>

                    {showDesignPanel && (
                        <div className="border-t border-slate-100 p-6 space-y-5 bg-slate-50/40">
                            {/* Color primario */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Color Principal del Catálogo
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={config.primaryColor || '#25D366'}
                                        onChange={(e) => setField('primaryColor', e.target.value)}
                                        className="w-12 h-12 rounded-xl border-2 border-slate-200 cursor-pointer p-1 bg-white"
                                    />
                                    <input
                                        type="text"
                                        value={config.primaryColor || '#25D366'}
                                        onChange={(e) => setField('primaryColor', e.target.value)}
                                        placeholder="#25D366"
                                        className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                                    />
                                    {/* Presets */}
                                    <div className="flex gap-2">
                                        {['#25D366', '#4f46e5', '#ef4444', '#f59e0b', '#06b6d4', '#8b5cf6'].map((c) => (
                                            <button
                                                key={c}
                                                type="button"
                                                onClick={() => setField('primaryColor', c)}
                                                title={c}
                                                className="w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110"
                                                style={{
                                                    background: c,
                                                    borderColor: config.primaryColor === c ? '#1e293b' : 'transparent',
                                                }}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5">
                                    Se aplica a botones, badges, acentos y gradientes del catálogo
                                </p>
                            </div>

                            {/* Botón CTA */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Texto Principal del Botón
                                    </label>
                                    <input
                                        type="text"
                                        value={config.buttonText || ''}
                                        onChange={(e) => setField('buttonText', e.target.value)}
                                        placeholder="Pedir por WhatsApp"
                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Subtexto del Botón
                                    </label>
                                    <input
                                        type="text"
                                        value={config.buttonSubtext || ''}
                                        onChange={(e) => setField('buttonSubtext', e.target.value)}
                                        placeholder="¡Hazlo realidad!"
                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Texto CTA Principal (Home)
                                    </label>
                                    <input
                                        type="text"
                                        value={config.ctaText || ''}
                                        onChange={(e) => setField('ctaText', e.target.value)}
                                        placeholder="Hacer mi pedido ahora"
                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Mensaje pre-escrito de WhatsApp
                                    </label>
                                    <input
                                        type="text"
                                        value={config.whatsappMessage || ''}
                                        onChange={(e) => setField('whatsappMessage', e.target.value)}
                                        placeholder="Hola! Vi el catálogo y quiero pedir..."
                                        className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {/* Preview del botón */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Vista previa del botón
                                </label>
                                <div
                                    className="inline-flex items-center gap-4 py-4 px-8 rounded-2xl text-white cursor-default"
                                    style={{
                                        background: `linear-gradient(135deg, #25D366, #128C7E)`,
                                        boxShadow: '0 8px 24px rgba(37,211,102,0.4)',
                                    }}
                                >
                                    <WhatsAppIcon size={22} />
                                    <div className="flex flex-col items-start">
                                        <span className="text-[10px] font-black uppercase tracking-wider opacity-70">
                                            {config.buttonSubtext || '¡Hazlo realidad!'}
                                        </span>
                                        <span className="text-lg font-black">{config.buttonText || 'Pedir por WhatsApp'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Trust Badges */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                                    <Shield className="h-3.5 w-3.5" />
                                    Insignias de Confianza (debajo del botón)
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {[
                                        { key: 'trustBadge1' as const, placeholder: '✅ Respuesta en minutos' },
                                        { key: 'trustBadge2' as const, placeholder: '🔒 Pago seguro' },
                                        { key: 'trustBadge3' as const, placeholder: '🚚 Envío rápido' },
                                    ].map(({ key, placeholder }) => (
                                        <input
                                            key={key}
                                            type="text"
                                            value={(config[key] as string) || ''}
                                            onChange={(e) => setField(key, e.target.value)}
                                            placeholder={placeholder}
                                            className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ═══ CARD 3: Pasos de Compra ═══ */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowStepsPanel(!showStepsPanel)}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <Type className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <h3 className="font-bold text-slate-900 text-base">Pasos de Compra</h3>
                                <p className="text-xs text-slate-500">Personaliza los textos de la sección &ldquo;Cómo recibir tu producto&rdquo;</p>
                            </div>
                        </div>
                        {showStepsPanel ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </button>

                    {showStepsPanel && (
                        <div className="border-t border-slate-100 p-6 space-y-5 bg-slate-50/40">
                            {[
                                { emoji: '📸', num: 1, titleKey: 'step1Title' as const, descKey: 'step1Desc' as const, titlePlaceholder: 'Captura el diseño', descPlaceholder: 'Navega por el catálogo y toma captura...' },
                                { emoji: '💬', num: 2, titleKey: 'step2Title' as const, descKey: 'step2Desc' as const, titlePlaceholder: 'Dinos cuánto', descPlaceholder: 'Envíanos la cantidad y talla...' },
                                { emoji: '🎉', num: 3, titleKey: 'step3Title' as const, descKey: 'step3Desc' as const, titlePlaceholder: 'Espera el envío', descPlaceholder: 'Confirmamos tu pedido al instante...' },
                            ].map((step) => (
                                <div key={step.num} className="bg-white p-5 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-2xl">{step.emoji}</span>
                                        <span className="font-black text-slate-700 text-sm uppercase tracking-wider">Paso {step.num}</span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Título</label>
                                            <input
                                                type="text"
                                                value={(config[step.titleKey] as string) || ''}
                                                onChange={(e) => setField(step.titleKey, e.target.value)}
                                                placeholder={step.titlePlaceholder}
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Descripción</label>
                                            <input
                                                type="text"
                                                value={(config[step.descKey] as string) || ''}
                                                onChange={(e) => setField(step.descKey, e.target.value)}
                                                placeholder={step.descPlaceholder}
                                                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ═══ CARD NUEVA: Banda Informativa Animada (Ticker / Marquee) ═══ */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setShowTickerPanel(!showTickerPanel)}
                        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-slate-900 text-base">Banda Informativa Animada (Ticker)</h3>
                                    {config.tickerEnabled ? (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">Activa</span>
                                    ) : (
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">Inactiva</span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">Cinta de texto continuo debajo de las categorías en el catálogo</p>
                            </div>
                        </div>
                        {showTickerPanel ? <ChevronUp className="h-5 w-5 text-slate-400" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                    </button>

                    {showTickerPanel && (
                        <div className="border-t border-slate-100 p-6 space-y-5 bg-slate-50/40">
                            {/* Toggle Activar/Desactivar */}
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                                <div>
                                    <span className="font-bold text-sm text-slate-800 block">Mostrar Banda Animada</span>
                                    <span className="text-xs text-slate-500">Activa o desactiva la cinta de texto en el catálogo del revendedor</span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setField('tickerEnabled', !config.tickerEnabled)}
                                    className={`p-1.5 rounded-xl transition-colors ${config.tickerEnabled ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100'}`}
                                >
                                    {config.tickerEnabled ? <ToggleRight className="h-7 w-7" /> : <ToggleLeft className="h-7 w-7" />}
                                </button>
                            </div>

                            {/* Texto del Ticker */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Texto Informativo que se desplazará
                                </label>
                                <input
                                    type="text"
                                    value={config.tickerText || ''}
                                    onChange={(e) => setField('tickerText', e.target.value)}
                                    placeholder="Ej: 🔥 ENVÍOS A TODA VENEZUELA • CALIDAD 100% ALGODÓN • ATENCIÓN INMEDIATA POR WHATSAPP"
                                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
                                />
                            </div>

                            {/* Opciones de Velocidad, Dirección y Colores */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Velocidad */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Velocidad
                                    </label>
                                    <select
                                        value={config.tickerSpeed || 'normal'}
                                        onChange={(e) => setField('tickerSpeed', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                                    >
                                        <option value="slow">Lenta (Suave)</option>
                                        <option value="normal">Normal (Recomendada)</option>
                                        <option value="fast">Rápida</option>
                                    </select>
                                </div>

                                {/* Dirección */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Dirección
                                    </label>
                                    <select
                                        value={config.tickerDirection || 'left'}
                                        onChange={(e) => setField('tickerDirection', e.target.value)}
                                        className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none font-medium"
                                    >
                                        <option value="left">← Derecha a Izquierda</option>
                                        <option value="right">→ Izquierda a Derecha</option>
                                    </select>
                                </div>

                                {/* Color de Fondo */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Color de Fondo
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={config.tickerBgColor || '#0f172a'}
                                            onChange={(e) => setField('tickerBgColor', e.target.value)}
                                            className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={config.tickerBgColor || '#0f172a'}
                                            onChange={(e) => setField('tickerBgColor', e.target.value)}
                                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg uppercase font-mono"
                                        />
                                    </div>
                                </div>

                                {/* Color del Texto */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Color del Texto
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={config.tickerTextColor || '#ffffff'}
                                            onChange={(e) => setField('tickerTextColor', e.target.value)}
                                            className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                                        />
                                        <input
                                            type="text"
                                            value={config.tickerTextColor || '#ffffff'}
                                            onChange={(e) => setField('tickerTextColor', e.target.value)}
                                            className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg uppercase font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Vista Previa de la Banda */}
                            {config.tickerText && (
                                <div className="mt-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                                        Vista Previa en vivo:
                                    </label>
                                    <div
                                        className="w-full py-2 px-4 rounded-xl overflow-hidden font-black text-xs uppercase tracking-wider text-center shadow-xs"
                                        style={{
                                            backgroundColor: config.tickerBgColor || '#0f172a',
                                            color: config.tickerTextColor || '#ffffff'
                                        }}
                                    >
                                        {config.tickerText}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ═══ CARD 4: Lista de Revendedores ═══ */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-emerald-600" />
                                    Revendedores Asignados
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Cada revendedor tendrá su enlace único y recibirá los pedidos a su WhatsApp
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
                                {(config.resellers || []).length} revendedores
                            </span>
                        </div>

                        {/* Formulario para agregar */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-4">
                                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Nombre del Revendedor</label>
                                <input
                                    type="text"
                                    placeholder="Ej: María Pérez"
                                    value={newResellerName}
                                    onChange={(e) => {
                                        setNewResellerName(e.target.value);
                                        if (!newResellerSlug) {
                                            setNewResellerSlug(
                                                e.target.value
                                                    .toLowerCase()
                                                    .normalize('NFD')
                                                    .replace(/[\u0300-\u036f]/g, '')
                                                    .replace(/[^a-z0-9-]/g, '-')
                                            );
                                        }
                                    }}
                                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Slug (Enlace)</label>
                                <div className="flex items-center">
                                    <span className="text-xs text-slate-400 mr-1 font-mono">/r/</span>
                                    <input
                                        type="text"
                                        placeholder="maria"
                                        value={newResellerSlug}
                                        onChange={(e) => setNewResellerSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                        className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">WhatsApp (con código país)</label>
                                <div className="relative">
                                    <Phone className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-3" />
                                    <input
                                        type="text"
                                        placeholder="584121234567"
                                        value={newResellerWhatsapp}
                                        onChange={(e) => setNewResellerWhatsapp(e.target.value)}
                                        className="w-full pl-8 pr-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-2">
                                <button
                                    type="button"
                                    onClick={handleAddReseller}
                                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
                                >
                                    <Plus className="h-4 w-4" />
                                    Añadir
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Lista de revendedores */}
                    <div className="p-6">
                        {(config.resellers || []).length === 0 ? (
                            <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <UserCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-slate-600">Aún no has agregado revendedores</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                    Añade a tu primer revendedor arriba con su nombre, slug y número de WhatsApp.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {(config.resellers || []).map((reseller, idx) => {
                                    const fullUrl = getFullUrl(reseller.slug);
                                    return (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                                                reseller.isActive
                                                    ? 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                                                    : 'bg-slate-50 border-slate-200 opacity-60'
                                            }`}
                                        >
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="font-bold text-slate-900 text-sm">{reseller.name}</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleToggleReseller(idx)}
                                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer ${
                                                            reseller.isActive
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-slate-200 text-slate-600'
                                                        }`}
                                                    >
                                                        {reseller.isActive ? 'Activo' : 'Pausado'}
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs">
                                                    <span className="text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded truncate max-w-xs">
                                                        {fullUrl}
                                                    </span>
                                                    <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                                                        <Phone className="h-3 w-3" />
                                                        <input
                                                            type="text"
                                                            value={reseller.whatsappNumber || ''}
                                                            onChange={(e) => handleUpdateResellerWhatsapp(idx, e.target.value)}
                                                            placeholder="Sin WhatsApp"
                                                            className="bg-transparent border-b border-emerald-300 focus:border-emerald-600 focus:outline-none w-28 text-xs font-mono"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(fullUrl, idx)}
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="Copiar enlace"
                                                >
                                                    {copiedIndex === idx ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                                                </button>
                                                <a
                                                    href={fullUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveReseller(idx)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ═══ CARD 5: Enlace Principal ═══ */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 text-base mb-1">Enlace Neutro Principal</h3>
                    <p className="text-xs text-slate-500 mb-4">
                        Slug y WhatsApp por defecto para accesos sin revendedor específico.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Slug Principal</label>
                            <input
                                type="text"
                                value={config.slug}
                                onChange={(e) => setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                placeholder="catalogo"
                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">WhatsApp por defecto</label>
                            <input
                                type="text"
                                value={config.whatsappNumber || ''}
                                onChange={(e) => setField('whatsappNumber', e.target.value)}
                                placeholder="584121234567"
                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                    {config.slug && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-3">
                            <span className="text-xs font-mono text-slate-600 truncate">{getFullUrl(config.slug)}</span>
                            <button
                                type="button"
                                onClick={() => copyToClipboard(getFullUrl(config.slug), 'main')}
                                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
                            >
                                {copiedIndex === 'main' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                        </div>
                    )}
                </div>

                {/* ═══ BOTÓN GUARDAR FLOTANTE ═══ */}
                <div className="sticky bottom-6 z-20">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 cursor-pointer text-white ${
                            saveSuccess
                                ? 'bg-emerald-500'
                                : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Guardando cambios...
                            </>
                        ) : saveSuccess ? (
                            <>
                                <Check className="h-5 w-5" />
                                ¡Configuración guardada con éxito!
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Guardar Toda la Configuración
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
