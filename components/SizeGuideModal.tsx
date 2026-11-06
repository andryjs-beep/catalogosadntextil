'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Ruler, X, Check, ArrowLeft } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface SizeGuideModalProps {
    damaImage?: string;
    caballeroImage?: string;
    ninosImage?: string;
    primaryColor?: string;
}

export function SizeGuideModal({
    damaImage,
    caballeroImage,
    ninosImage,
    primaryColor = '#4f46e5',
}: SizeGuideModalProps) {
    const [open, setOpen] = useState(false);

    // Determinar qué pestañas están disponibles
    const tabs: Array<{ id: 'dama' | 'caballero' | 'ninos'; label: string; icon: string; image?: string }> = [];

    if (damaImage) {
        tabs.push({ id: 'dama', label: 'Dama', icon: '👚', image: damaImage });
    }
    if (caballeroImage) {
        tabs.push({ id: 'caballero', label: 'Caballero', icon: '👕', image: caballeroImage });
    }
    if (ninosImage) {
        tabs.push({ id: 'ninos', label: 'Niños', icon: '👶', image: ninosImage });
    }

    // Si no hay ninguna imagen subida, no renderizar nada
    if (tabs.length === 0) return null;

    const [activeTab, setActiveTab] = useState<'dama' | 'caballero' | 'ninos'>(tabs[0].id);
    const currentTab = tabs.find((t) => t.id === activeTab) || tabs[0];

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="w-full mt-3 py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-slate-800 transition-all flex items-center justify-between group shadow-2xs cursor-pointer"
                >
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform"
                            style={{ background: primaryColor }}
                        >
                            <Ruler className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                            <span className="text-xs font-black text-slate-900 block tracking-tight group-hover:text-indigo-600 transition-colors">
                                Ver Tabla de Medidas y Tallas
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">
                                Consulta centímetros de ancho y largo
                            </span>
                        </div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                        Ver Guía ↗
                    </span>
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-xl max-w-[95vw] p-0 overflow-hidden rounded-3xl border-0 shadow-2xl bg-white max-h-[92vh] flex flex-col">
                {/* Cabecera */}
                <DialogHeader className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/80 flex flex-row items-center justify-between shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                            style={{ background: primaryColor }}
                        >
                            <Ruler className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-base sm:text-lg font-black text-slate-900">
                                Guía de Medidas Oficial
                            </DialogTitle>
                            <p className="text-[11px] text-slate-500 font-medium">
                                Revisa las dimensiones antes de realizar tu pedido
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Selector de Pestañas (Dama, Caballero, Niños) */}
                {tabs.length > 1 && (
                    <div className="p-2 sm:px-4 bg-slate-100/70 border-b border-slate-200/60 flex items-center gap-1.5 shrink-0">
                        {tabs.map((tab) => {
                            const isSelected = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                        isSelected
                                            ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                            : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Contenedor de la Imagen con Scroll si es necesario */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50 flex flex-col items-center justify-center min-h-[300px]">
                    {currentTab?.image ? (
                        <div className="relative w-full rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
                            <Image
                                src={currentTab.image}
                                alt={`Tabla de medidas ${currentTab.label}`}
                                width={800}
                                height={900}
                                unoptimized
                                className="w-full h-auto object-contain mx-auto"
                            />
                        </div>
                    ) : (
                        <div className="py-12 text-center text-slate-400">
                            <Ruler className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p className="text-sm font-medium">Imagen no disponible para esta categoría</p>
                        </div>
                    )}

                    <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/80 w-full text-center">
                        <p className="text-[11px] text-amber-800 font-semibold leading-relaxed">
                            💡 <strong>Tip:</strong> Te recomendamos medir una franela que te quede cómoda extendida sobre una superficie plana para confirmar tu talla ideal.
                        </p>
                    </div>
                </div>

                {/* Pie con botón de volver al producto */}
                <div className="p-4 border-t border-slate-100 bg-white flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        className="w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span>Volver al Producto</span>
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
