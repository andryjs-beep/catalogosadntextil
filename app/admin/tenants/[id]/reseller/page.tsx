'use client';

import { useState, useEffect, use } from 'react';
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
    const [copiedIndex, setCopiedIndex] = useState<number | 'main' | null>(null);
    const [tenantSlug, setTenantSlug] = useState('');
    const [config, setConfig] = useState<ResellerConfig>({
        enabled: false,
        slug: '',
        whatsappNumber: '',
        headerTitle: 'Cat?logo Online',
        headerSubtitle: 'Encuentra los mejores productos',
        hideLogo: true,
        hideBusinessName: true,
        hideSocialLinks: true,
        footerText: '? Cat?logo Online',
        resellers: [],
    });

    // Estado para nuevo revendedor r?pido
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

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/tenants/${id}/reseller`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config),
            });

            if (res.ok) {
                alert('Configuraci?n guardada exitosamente');
            } else {
                const data = await res.json();
                alert(data.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving:', error);
            alert('Error al guardar la configuraci?n');
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

        // Generar slug si no se ingres?
        const finalSlug = (newResellerSlug.trim() || newResellerName.trim())
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');

        if (!finalSlug) {
            alert('Slug inv?lido');
            return;
        }

        // Validar que no est? duplicado
        const exists = (config.resellers || []).some(
            (r) => r.slug.toLowerCase() === finalSlug.toLowerCase()
        );
        if (exists || finalSlug === config.slug) {
            alert('Este slug ya est? en uso');
            return;
        }

        const newReseller: ResellerItem = {
            name: newResellerName.trim(),
            slug: finalSlug,
            whatsappNumber: newResellerWhatsapp.trim().replace(/[^0-9]/g, ''),
            isActive: true,
        };

        setConfig({
            ...config,
            resellers: [...(config.resellers || []), newReseller],
        });

        // Limpiar inputs
        setNewResellerName('');
        setNewResellerSlug('');
        setNewResellerWhatsapp('');
    };

    const handleRemoveReseller = (index: number) => {
        if (!confirm('?Deseas eliminar este revendedor?')) return;
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-8">
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
                            Modo Revendedor Multiusuario
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Crea enlaces neutros independientes para cada revendedor con su propio n?mero de WhatsApp
                        </p>
                    </div>
                </div>

                {/* Card 1: Habilitador General */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-slate-900 text-base">
                                Habilitar Modo Revendedor
                            </h3>
                            <p className="text-xs text-slate-500">
                                Permite el acceso a los cat?logos neutros sin tus precios ni datos de contacto
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                            className={`p-1.5 rounded-xl transition-colors ${
                                config.enabled ? 'text-emerald-600 bg-emerald-50' : 'text-slate-400 bg-slate-100'
                            }`}
                        >
                            {config.enabled ? <ToggleRight className="h-9 w-9" /> : <ToggleLeft className="h-9 w-9" />}
                        </button>
                    </div>

                    {/* Configuraci?n visual del cat?logo */}
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                T?tulo del Cat?logo
                            </label>
                            <input
                                type="text"
                                value={config.headerTitle}
                                onChange={(e) => setConfig({ ...config, headerTitle: e.target.value })}
                                placeholder="Cat?logo Online"
                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Subt?tulo
                            </label>
                            <input
                                type="text"
                                value={config.headerSubtitle}
                                onChange={(e) => setConfig({ ...config, headerSubtitle: e.target.value })}
                                placeholder="Encuentra los mejores productos"
                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Card 2: Lista de Revendedores con WhatsApp Directo */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/60 to-transparent">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-emerald-600" />
                                    Revendedores Asignados
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    Cada revendedor tendr? su enlace ?nico y recibir? los pedidos directo a su WhatsApp
                                </p>
                            </div>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">
                                {(config.resellers || []).length} revendedores
                            </span>
                        </div>

                        {/* Formulario para agregar revendedor */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                            <div className="sm:col-span-4">
                                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                    Nombre del Revendedor
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ej: Mar?a P?rez"
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
                                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                    Slug (Enlace)
                                </label>
                                <div className="flex items-center">
                                    <span className="text-xs text-slate-400 mr-1 font-mono">/r/</span>
                                    <input
                                        type="text"
                                        placeholder="maria"
                                        value={newResellerSlug}
                                        onChange={(e) =>
                                            setNewResellerSlug(
                                                e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                                            )
                                        }
                                        className="w-full px-2.5 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                                    />
                                </div>
                            </div>

                            <div className="sm:col-span-3">
                                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                    WhatsApp (con c?digo pa?s)
                                </label>
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
                                    A?adir
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabla de revendedores */}
                    <div className="p-6">
                        {(config.resellers || []).length === 0 ? (
                            <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <UserCheck className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm font-semibold text-slate-600">A?n no has agregado revendedores</p>
                                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                                    A?ade a tu primer revendedor arriba con su nombre, slug y n?mero de WhatsApp para generarle su cat?logo.
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
                                                    <span className="font-bold text-slate-900 text-sm">
                                                        {reseller.name}
                                                    </span>
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

                                                {/* Enlace y WhatsApp */}
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
                                                            title="Clic para editar n?mero"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => copyToClipboard(fullUrl, idx)}
                                                    className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="Copiar enlace del revendedor"
                                                >
                                                    {copiedIndex === idx ? (
                                                        <Check className="h-4 w-4 text-emerald-600" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </button>
                                                <a
                                                    href={fullUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                                                    title="Abrir cat?logo"
                                                >
                                                    <ExternalLink className="h-4 w-4" />
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveReseller(idx)}
                                                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                    title="Eliminar revendedor"
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

                {/* Card 3: Enlace Predeterminado / Global */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-900 text-base mb-1">
                        Enlace Neutro Principal (Por defecto)
                    </h3>
                    <p className="text-xs text-slate-500 mb-4">
                        Si alguien accede sin un revendedor espec?fico, puedes asignar un slug y WhatsApp por defecto aqu?.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                Slug Principal
                            </label>
                            <input
                                type="text"
                                value={config.slug}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                                    })
                                }
                                placeholder="catalogo"
                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                WhatsApp por defecto
                            </label>
                            <input
                                type="text"
                                value={config.whatsappNumber || ''}
                                onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
                                placeholder="584121234567"
                                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    {config.slug && (
                        <div className="mt-4 p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-3">
                            <span className="text-xs font-mono text-slate-600 truncate">
                                {getFullUrl(config.slug)}
                            </span>
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

                {/* Bot?n Guardar Flotante / Abajo */}
                <div className="sticky bottom-6 z-20">
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                Guardando cambios...
                            </>
                        ) : (
                            <>
                                <Save className="h-5 w-5" />
                                Guardar Toda la Configuraci?n de Revendedores
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
