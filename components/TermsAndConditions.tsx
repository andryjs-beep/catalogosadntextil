'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface TermsAndConditionsProps {
    content: string;
    title?: string;
    requireAcceptance?: boolean;
    onAcceptChange?: (accepted: boolean) => void;
}

export function TermsAndConditions({
    content,
    title = 'Términos y Condiciones',
    requireAcceptance = false,
    onAcceptChange
}: TermsAndConditionsProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [accepted, setAccepted] = useState(false);

    if (!content) return null;

    const handleAcceptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAccepted(e.target.checked);
        onAcceptChange?.(e.target.checked);
    };

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            {/* Header - Clickeable */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-slate-500" />
                    <span className="font-semibold text-slate-700">{title}</span>
                </div>
                {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-400" />
                ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                )}
            </button>

            {/* Contenido expandible */}
            {isExpanded && (
                <div className="border-t border-slate-200 p-4 bg-slate-50">
                    <div
                        className="prose prose-sm max-w-none text-slate-600 max-h-64 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br/>') }}
                    />
                </div>
            )}

            {/* Checkbox de aceptación */}
            {requireAcceptance && (
                <div className="border-t border-slate-200 p-4 bg-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={accepted}
                            onChange={handleAcceptChange}
                            className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary"
                        />
                        <span className="text-sm text-slate-700">
                            He leído y acepto los términos y condiciones
                        </span>
                    </label>
                </div>
            )}
        </div>
    );
}
