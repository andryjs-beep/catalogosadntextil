/**
 * Configuración de Redes Sociales y Ubicación (Client-Admin)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Share2, MapPin, ExternalLink, MessageCircle } from 'lucide-react';

interface SocialLinks {
    instagram: string;
    facebook: string;
    tiktok: string;
    whatsappLink: string;
    address: string;
    googleMapsLink: string;
    locationImage: string;
}

export default function SocialSettingsPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<SocialLinks>({
        defaultValues: {
            instagram: '',
            facebook: '',
            tiktok: '',
            whatsappLink: '',
            address: '',
            googleMapsLink: '',
            locationImage: '',
        },
    });

    const fetchSocial = useCallback(async () => {
        try {
            const response = await fetch('/api/client-admin/social');
            const data = await response.json();
            if (response.ok) {
                form.reset(data.socialLinks);
            }
        } catch {
            toast.error('Error al cargar redes sociales');
        } finally {
            setIsLoading(false);
        }
    }, [form]);

    useEffect(() => {
        fetchSocial();
    }, [fetchSocial]);

    const onSubmit = async (data: SocialLinks) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/client-admin/social', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Redes sociales y ubicación actualizadas');
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
                <h1 className="text-3xl font-bold text-slate-900">Redes Sociales y Ubicación</h1>
                <p className="text-slate-600 mt-1">
                    Configura cómo tus clientes pueden contactarte y encontrarte
                </p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Redes Sociales */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Share2 className="h-5 w-5 text-blue-500" />
                            Redes Sociales
                        </CardTitle>
                        <CardDescription>
                            Tus redes aparecerán en el catálogo para generar confianza
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram (URL o usuario)</Label>
                                <Input
                                    id="instagram"
                                    {...form.register('instagram')}
                                    placeholder="Ej: @adntextil o instagram.com/adntextil"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facebook">Facebook (URL)</Label>
                                <Input
                                    id="facebook"
                                    {...form.register('facebook')}
                                    placeholder="Ej: facebook.com/adntextil"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tiktok">TikTok (URL o usuario)</Label>
                                <Input
                                    id="tiktok"
                                    {...form.register('tiktok')}
                                    placeholder="Ej: @adntextil"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="whatsappLink">WhatsApp (Número o Link)</Label>
                                <Input
                                    id="whatsappLink"
                                    {...form.register('whatsappLink')}
                                    placeholder="Ej: 573001234567"
                                />
                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                    <MessageCircle className="h-3 w-3" />
                                    Solo el número con código de país (ej: 57 para Colombia)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Ubicación / Ubícanos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-red-500" />
                            Ubícanos (Punto Físico)
                        </CardTitle>
                        <CardDescription>
                            Ayuda a tus clientes a llegar a tu tienda o taller
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Dirección Física</Label>
                            <Input
                                id="address"
                                {...form.register('address')}
                                placeholder="Ej: Calle 123 #45-67, Envigado, Antioquia"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="googleMapsLink">Link de Google Maps</Label>
                            <Input
                                id="googleMapsLink"
                                {...form.register('googleMapsLink')}
                                placeholder="Ej: https://maps.app.goo.gl/..."
                            />
                            <p className="text-xs text-slate-500">
                                Pega el enlace de "Compartir" de Google Maps
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="locationImage">URL de Imagen del Mapa (Opcional)</Label>
                            <Input
                                id="locationImage"
                                {...form.register('locationImage')}
                                placeholder="Ej: https://.../mapa.png"
                            />
                            <p className="text-xs text-slate-500">
                                Puedes subir un pantallazo de tu ubicación y pegar el link aquí
                            </p>
                        </div>

                        {form.watch('googleMapsLink') && (
                            <div className="mt-4 p-4 bg-slate-50 rounded-lg flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4" />
                                    Ubicación configurada correctamente
                                </div>
                                <a
                                    href={form.watch('googleMapsLink')}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 text-sm flex items-center gap-1 hover:underline"
                                >
                                    Probar link <ExternalLink className="h-3 w-3" />
                                </a>
                            </div>
                        )}
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
                            'Guardar cambios'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
