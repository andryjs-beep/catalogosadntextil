'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';

interface Size {
    name: string;
    available: boolean;
}

interface SizeSelectorProps {
    sizes: Size[];
    onSelect?: (size: string) => void;
    selectedSize?: string;
}

export function SizeSelector({ sizes, onSelect, selectedSize }: SizeSelectorProps) {
    const [selected, setSelected] = useState(selectedSize || '');

    if (!sizes || sizes.length === 0) return null;

    const handleSelect = (size: Size) => {
        if (!size.available) return;
        setSelected(size.name);
        onSelect?.(size.name);
    };

    return (
        <div className="py-6">
            <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold text-slate-700">Talla:</span>
                {selected && <span className="text-primary font-bold">{selected}</span>}
            </div>

            <div className="flex flex-wrap gap-3">
                {sizes.map((size) => (
                    <button
                        key={size.name}
                        onClick={() => handleSelect(size)}
                        disabled={!size.available}
                        className={`
                            relative min-w-[48px] h-12 px-4 rounded-lg font-bold text-sm
                            transition-all duration-200 border-2
                            ${size.available
                                ? selected === size.name
                                    ? 'bg-primary text-white border-primary shadow-lg scale-105'
                                    : 'bg-white text-slate-700 border-slate-200 hover:border-primary hover:text-primary'
                                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                            }
                        `}
                    >
                        {size.name}

                        {/* Indicador de disponibilidad */}
                        {size.available && selected === size.name && (
                            <span className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5">
                                <Check className="h-3 w-3" />
                            </span>
                        )}

                        {!size.available && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5">
                                <X className="h-3 w-3" />
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Guía de tallas */}
            <button className="mt-4 text-sm text-primary hover:underline">
                📏 Ver guía de tallas
            </button>
        </div>
    );
}
