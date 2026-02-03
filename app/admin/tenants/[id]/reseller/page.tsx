/**
 * Página de Configuración del Modo Revendedor
 * Admin panel para configurar el catálogo neutral para revendedores
 */
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
} from 'lucide-react';

interface ResellerConfig {
    enabled: boolean;
    slug: string;
    headerTitle: string;
    headerSubtitle: string;
    hideLogo: boolean;
    hideBusinessName: boolean;
    hideSocialLinks: boolean;
    footerText: string;
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
    const [copied, setCopied] = useState(false);
    const [tenantSlug, setTenantSlug] = useState('');
    const [config, setConfig] = useState<ResellerConfig>({
        enabled: false,
        slug: '',
        headerTitle: 'Catálogo Online',
        headerSubtitle: 'Encuentra los mejores productos',
        hideLogo: true,
        hideBusinessName: true,
        hideSocialLinks: true,
        footerText: '© Catálogo Online',
    });

    useEffect(() => {
        fetchConfig();
    }, [id]);

    const fetchConfig = async () => {
        try {
            const res = await fetch(`/api/admin/tenants/${id}/reseller`);
            if (res.ok) {
                const data = await res.json();
                setConfig(data.resellerConfig);
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
                alert('Configuración guardada exitosamente');
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

    const resellerUrl = config.slug
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/r/${config.slug}`
        : '';

    const copyUrl = () => {
        if (resellerUrl) {
            navigator.clipboard.writeText(resellerUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link
                        href={`/admin/tenants/${id}/settings`}
                        className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <Users className="h-6 w-6 text-blue-600" />
                            Modo Revendedor
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Configura un catálogo neutro para compartir con revendedores
                        </p>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Enable Toggle */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    Habilitar Modo Revendedor
                                </h3>
                                <p className="text-sm text-slate-500">
                                    Permite acceso al catálogo sin precios ni tu información
                                </p>
                            </div>
                            <button
                                onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                                className={`p-2 rounded-lg transition-colors ${config.enabled
                                        ? 'text-green-600 bg-green-50'
                                        : 'text-slate-400 bg-slate-50'
                                    }`}
                            >
                                {config.enabled ? (
                                    <ToggleRight className="h-8 w-8" />
                                ) : (
                                    <ToggleLeft className="h-8 w-8" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Configuration Fields */}
                    <div className="p-6 space-y-6">
                        {/* Slug */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                <Link2 className="h-4 w-4 inline mr-1" />
                                URL del Catálogo (slug)
                            </label>
                            <input
                                type="text"
                                value={config.slug}
                                onChange={(e) =>
                                    setConfig({
                                        ...config,
                                        slug: e.target.value
                                            .toLowerCase()
                                            .replace(/[^a-z0-9-]/g, ''),
                                    })
                                }
                                placeholder="catalogo-telas"
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-slate-400 mt-1">
                                Solo letras minúsculas, números y guiones
                            </p>
                        </div>

                        {/* URL Preview */}
                        {config.slug && (
                            <div className="bg-slate-50 rounded-lg p-4">
                                <p className="text-sm text-slate-500 mb-2">URL para revendedores:</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-white px-3 py-2 rounded border border-slate-200 text-sm text-slate-700 truncate">
                                        {resellerUrl}
                                    </code>
                                    <button
                                        onClick={copyUrl}
                                        className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                    >
                                        {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                    </button>
                                    {config.enabled && (
                                        <a
                                            href={resellerUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                                        >
                                            <ExternalLink className="h-5 w-5" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Header Title */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Título del Header
                            </label>
                            <input
                                type="text"
                                value={config.headerTitle}
                                onChange={(e) => setConfig({ ...config, headerTitle: e.target.value })}
                                placeholder="Catálogo Online"
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Header Subtitle */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Subtítulo del Header
                            </label>
                            <input
                                type="text"
                                value={config.headerSubtitle}
                                onChange={(e) => setConfig({ ...config, headerSubtitle: e.target.value })}
                                placeholder="Encuentra los mejores productos"
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Footer Text */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Texto del Footer
                            </label>
                            <input
                                type="text"
                                value={config.footerText}
                                onChange={(e) => setConfig({ ...config, footerText: e.target.value })}
                                placeholder="© Catálogo Online"
                                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Privacy Options */}
                        <div className="border-t border-slate-100 pt-6">
                            <h4 className="font-medium text-slate-700 mb-4">
                                Opciones de Privacidad
                            </h4>
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.hideLogo}
                                        onChange={(e) =>
                                            setConfig({ ...config, hideLogo: e.target.checked })
                                        }
                                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-slate-700">Ocultar logo</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.hideBusinessName}
                                        onChange={(e) =>
                                            setConfig({ ...config, hideBusinessName: e.target.checked })
                                        }
                                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-slate-700">Ocultar nombre del negocio</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={config.hideSocialLinks}
                                        onChange={(e) =>
                                            setConfig({ ...config, hideSocialLinks: e.target.checked })
                                        }
                                        className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-slate-700">Ocultar redes sociales</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="p-6 bg-slate-50 border-t border-slate-100">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                        >
                            {saving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="h-5 w-5" />
                                    Guardar Configuración
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Preview Section */}
                {config.enabled && config.slug && (
                    <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <Eye className="h-5 w-5 text-blue-600" />
                            Vista Previa
                        </h3>
                        <div className="border border-slate-200 rounded-lg overflow-hidden">
                            {/* Preview Header */}
                            <div className="bg-white border-b border-slate-100 p-4 text-center">
                                <h4 className="text-lg font-bold text-slate-800">
                                    {config.headerTitle}
                                </h4>
                                {config.headerSubtitle && (
                                    <p className="text-sm text-slate-500">{config.headerSubtitle}</p>
                                )}
                            </div>
                            {/* Preview Body */}
                            <div className="p-4 bg-slate-50 text-center text-slate-400 text-sm">
                                [Productos sin precios]
                            </div>
                            {/* Preview Footer */}
                            <div className="bg-slate-800 text-white text-center p-3 text-sm">
                                {config.footerText}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
