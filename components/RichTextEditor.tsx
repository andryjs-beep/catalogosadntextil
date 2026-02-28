'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, AlignCenter, AlignLeft, AlignRight, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Sincronizar valor inicial y actualizaciones externas
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const insertGif = () => {
        const url = prompt('Introduce la URL del GIF o imagen:');
        if (url) {
            execCommand('insertImage', url);
        }
    };

    return (
        <div className={`border rounded-xl overflow-hidden transition-all ${isFocused ? 'ring-2 ring-blue-500 border-transparent' : 'border-slate-200'}`}>
            {/* Toolbar */}
            <div className="bg-slate-50 border-b border-slate-200 p-2 flex flex-wrap gap-1">
                <button
                    type="button"
                    onClick={() => execCommand('bold')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Negrita"
                >
                    <Bold className="h-4 w-4 text-slate-700" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('italic')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Itálica"
                >
                    <Italic className="h-4 w-4 text-slate-700" />
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1 self-center" />
                <button
                    type="button"
                    onClick={() => execCommand('justifyLeft')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Alinear Izquierda"
                >
                    <AlignLeft className="h-4 w-4 text-slate-700" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('justifyCenter')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Centrar"
                >
                    <AlignCenter className="h-4 w-4 text-slate-700" />
                </button>
                <button
                    type="button"
                    onClick={() => execCommand('justifyRight')}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Alinear Derecha"
                >
                    <AlignRight className="h-4 w-4 text-slate-700" />
                </button>
                <div className="w-px h-4 bg-slate-300 mx-1 self-center" />
                <button
                    type="button"
                    onClick={insertGif}
                    className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    title="Insertar GIF o Imagen"
                >
                    <ImageIcon className="h-4 w-4 text-slate-700" />
                </button>
            </div>

            {/* Editable Area */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="p-4 min-h-[150px] focus:outline-none prose prose-sm max-w-none text-slate-700"
                style={{ direction: 'ltr' }}
                data-placeholder={placeholder}
            />

            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #94a3b8;
                    cursor: text;
                }
                [contenteditable] img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 1rem auto;
                    border-radius: 0.75rem;
                }
            `}</style>
        </div>
    );
}
