/**
 * Configuración de Branding (Client-Admin)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Palette, Upload, X, Globe, Type } from 'lucide-react';
import Image from 'next/image';

interface BrandingData {
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
}

export default function BrandingSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<BrandingData>({
        defaultValues: {
            logo: '',
            favicon: '',
            primaryColor: '#3b82f6',
            secondaryColor: '#1e40af',
            accentColor: '#f59e0b',
            fontFamily: 'Inter',
        },
    });

    const fetchBranding = useCallback(async () => {
        try {
            const response = await fetch('/api/client-admin/branding');
            const data = await response.json();
            if (response.ok) {
                form.reset(data.branding);
            }
        } catch {
            toast.error('Error al cargar branding');
        } finally {
            setIsLoading(false);
        }
    }, [form]);

    useEffect(() => {
        fetchBranding();
    }, [fetchBranding]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('files', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                form.setValue(field, data.urls[0]);
                toast.success(`Imagen subida correctamente`);
            }
        } catch {
            toast.error('Error al subir imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const onSubmit = async (data: BrandingData) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/client-admin/branding', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Branding actualizado correctamente');
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error al guardar');
            }
        } catch {
            toast.error('Error al guardar');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Identidad Visual (Branding)</h1>
                <p className="text-slate-600 mt-1">
                    Personaliza los colores y logos de tu catálogo
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Logos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-purple-500" />
                            Logotipos
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <Label>Logo Principal</Label>
                            {form.watch('logo') ? (
                                <div className="relative w-full aspect-video bg-slate-100 rounded-xl overflow-hidden group">
                                    <Image
                                        src={form.watch('logo')}
                                        alt="Logo"
                                        fill
                                        className="object-contain p-4"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => form.setValue('logo', '')}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                    <span className="text-sm text-slate-500">Subir Logo</span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(e, 'logo')}
                                        disabled={isUploading}
                                    />
                                </label>
                            )}
                        </div>

                        <div className="space-y-4">
                            <Label>Favicon (Ícono del navegador)</Label>
                            {form.watch('favicon') ? (
                                <div className="relative w-16 h-16 bg-slate-100 rounded-xl overflow-hidden group">
                                    <Image
                                        src={form.watch('favicon')}
                                        alt="Favicon"
                                        fill
                                        className="object-contain p-2"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => form.setValue('favicon', '')}
                                        className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-16 h-16 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                                    <Upload className="h-4 w-4 text-slate-400" />
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*.ico"
                                        onChange={(e) => handleImageUpload(e, 'favicon')}
                                        disabled={isUploading}
                                    />
                                </label>
                            )}
                            <p className="text-xs text-slate-500">Recomendado: 32x32px (.png o .ico)</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Colores */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-pink-500" />
                            Paleta de Colores
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="primaryColor">Color Primario</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    className="w-12 h-10 p-1"
                                    {...form.register('primaryColor')}
                                />
                                <Input
                                    value={form.watch('primaryColor')}
                                    onChange={(e) => form.setValue('primaryColor', e.target.value)}
                                    placeholder="#000000"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="secondaryColor">Color Secundario</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="secondaryColor"
                                    type="color"
                                    className="w-12 h-10 p-1"
                                    {...form.register('secondaryColor')}
                                />
                                <Input
                                    value={form.watch('secondaryColor')}
                                    onChange={(e) => form.setValue('secondaryColor', e.target.value)}
                                    placeholder="#000000"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="accentColor">Color de Acento</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="accentColor"
                                    type="color"
                                    className="w-12 h-10 p-1"
                                    {...form.register('accentColor')}
                                />
                                <Input
                                    value={form.watch('accentColor')}
                                    onChange={(e) => form.setValue('accentColor', e.target.value)}
                                    placeholder="#000000"
                                    className="flex-1"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tipografía */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Type className="h-5 w-5 text-blue-500" />
                            Tipografía
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="fontFamily">Fuente Principal</Label>
                            <select
                                id="fontFamily"
                                {...form.register('fontFamily')}
                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                            >
                                <option value="Inter">Inter (Moderna)</option>
                                <option value="Outfit">Outfit (Minimalista)</option>
                                <option value="Montserrat">Montserrat (Geométrica)</option>
                                <option value="Playfair Display">Playfair Display (Elegante)</option>
                            </select>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-3">
                    <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            'Guardar Cambios'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
