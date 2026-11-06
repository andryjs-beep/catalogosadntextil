'use client';

import { useState } from 'react';
import { Database, Download, ShieldCheck, HardDrive, Check, AlertCircle, Loader2 } from 'lucide-react';

export default function BackupPage() {
    const [downloading, setDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);

    const handleDownloadBackup = async () => {
        setDownloading(true);
        setDownloadSuccess(false);
        try {
            const res = await fetch('/api/admin/backup');
            if (!res.ok) {
                throw new Error('Error al generar la copia de seguridad');
            }

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const dateStr = new Date().toISOString().split('T')[0];
            a.download = `backup-catalogos-${dateStr}.json`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 5000);
        } catch (err: any) {
            console.error('Error descargando backup:', err);
            alert('Error al descargar la copia de seguridad');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <Database className="h-8 w-8 text-emerald-600" />
                    Copia de Seguridad y Respaldo
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Descarga y resguarda toda la información de tus clientes, revendedores, productos y colecciones.
                </p>
            </div>

            {/* Tarjeta Principal de Descarga */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
                        <HardDrive className="h-8 w-8" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">Descargar Copia Completa (JSON)</h2>
                        <p className="text-slate-500 text-sm mt-1">
                            Genera un archivo con el 100% de los datos de la base de datos MongoDB Atlas en tiempo real.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3">
                        Colecciones incluidas en el respaldo:
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Tenants (Clientes)
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Revendedores y WhatsApps
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Colecciones
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Productos
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Personalizaciones
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Usuarios y Roles
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="button"
                        onClick={handleDownloadBackup}
                        disabled={downloading}
                        className={`w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl font-bold text-white shadow-lg transition-all cursor-pointer ${
                            downloadSuccess
                                ? 'bg-emerald-500'
                                : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-xl'
                        } disabled:opacity-60`}
                    >
                        {downloading ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Generando copia de seguridad...</span>
                            </>
                        ) : downloadSuccess ? (
                            <>
                                <Check className="h-5 w-5" />
                                <span>¡Copia descargada con éxito!</span>
                            </>
                        ) : (
                            <>
                                <Download className="h-5 w-5" />
                                <span>Descargar Copia de Seguridad Ahora</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Consejos y buenas prácticas */}
            <div className="bg-blue-50/60 rounded-3xl p-6 border border-blue-100 flex items-start gap-4">
                <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 space-y-1">
                    <p className="font-bold">Recomendación de Seguridad:</p>
                    <p className="text-blue-800/80 leading-relaxed">
                        Descarga una copia de seguridad antes de realizar cambios masivos o nuevas colecciones. Guarda los archivos en tu disco duro o en Google Drive/Dropbox para tener un respaldo histórico seguro.
                    </p>
                </div>
            </div>
        </div>
    );
}
