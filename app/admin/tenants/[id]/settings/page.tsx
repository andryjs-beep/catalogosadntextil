'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function TenantSettingsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [password, setPassword] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchTenant();
    }, [id]);

    const fetchTenant = async () => {
        try {
            const res = await fetch(`/api/admin/tenants/${id}`);
            if (!res.ok) throw new Error('Error al cargar datos');
            const data = await res.json();

            // Asegurar que todas las propiedades anidadas existan con defaults
            const defaults = {
                branding: {
                    logo: '',
                    favicon: '',
                    primaryColor: '#3b82f6',
                    secondaryColor: '#10b981',
                    accentColor: '#f59e0b',
                    buttonPrimaryColor: '#25D366',
                    buttonSecondaryColor: '#1e40af',
                    fontFamily: 'Inter'
                },
                socialLinks: {
                    whatsappLink: '',
                    instagram: '',
                    facebook: '',
                    tiktok: '',
                    address: '',
                    googleMapsLink: ''
                },
                businessInfo: { businessName: '', niche: '', usp: '', tone: 'profesional' }
            };

            if (data.tenant) {
                data.tenant.branding = { ...defaults.branding, ...(data.tenant.branding || {}) };
                data.tenant.socialLinks = { ...defaults.socialLinks, ...(data.tenant.socialLinks || {}) };
                data.tenant.businessInfo = { ...defaults.businessInfo, ...(data.tenant.businessInfo || {}) };
            }

            setTenant(data);
        } catch (error) {
            toast.error('No se pudo cargar la información del cliente');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBranding = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/tenants/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ branding: tenant.tenant.branding }),
            });
            if (!res.ok) throw new Error('Error al actualizar');
            toast.success('Branding actualizado correctamente');
        } catch (error) {
            toast.error('No se pudo actualizar el branding');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateSocial = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/tenants/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ socialLinks: tenant.tenant.socialLinks }),
            });
            if (!res.ok) throw new Error('Error al actualizar');
            toast.success('Información de contacto actualizada');
        } catch (error) {
            toast.error('No se pudo actualizar la información de contacto');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/tenants/${id}`, {
                method: 'PATCH',
                body: JSON.stringify({ businessInfo: tenant.tenant.businessInfo }),
            });
            if (!res.ok) throw new Error('Error al actualizar');
            toast.success('Información de negocio actualizada');
        } catch (error) {
            toast.error('No se pudo actualizar la información de negocio');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/admin/tenants/${id}/password`, {
                method: 'PATCH',
                body: JSON.stringify({ newPassword: password }),
            });
            if (!res.ok) throw new Error('Error al cambiar contraseña');
            toast.success('Contraseña actualizada con éxito');
            setPassword('');
        } catch (error) {
            toast.error('Error al cambiar contraseña');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    // Verificar que tenant y tenant.tenant existan
    if (!tenant || !tenant.tenant) {
        return (
            <div className="container mx-auto py-10 text-center">
                <p className="text-red-500">Error al cargar la información del cliente.</p>
                <Button className="mt-4" onClick={() => router.back()}>Volver</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <h1 className="text-3xl font-bold">Ajustes de {tenant.tenant.slug}</h1>
                </div>
                <Link href={`https://${tenant.tenant.slug}.catalogo.dpdns.org`} target="_blank">
                    <Button variant="ghost" className="gap-2">
                        Ver Tienda <ExternalLink className="h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="branding" className="w-full">
                <TabsList className="grid w-full grid-cols-5 lg:w-[750px]">
                    <TabsTrigger value="branding">Branding</TabsTrigger>
                    <TabsTrigger value="social">Contacto/Redes</TabsTrigger>
                    <TabsTrigger value="business">Negocio (IA)</TabsTrigger>
                    <TabsTrigger value="acceso">Acceso Admin</TabsTrigger>
                    <TabsTrigger value="textos">Textos Globales</TabsTrigger>
                </TabsList>

                {/* --- Pestaña Branding --- */}
                <TabsContent value="branding">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identidad Visual</CardTitle>
                            <CardDescription>Logo, favicon, colores y apariencia del catálogo público.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleUpdateBranding}>
                            <CardContent className="space-y-6">
                                {/* Logo y Favicon */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>URL del Logo</Label>
                                        <Input value={tenant.tenant.branding.logo || ''} placeholder="https://..."
                                            onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, logo: e.target.value } } })} />
                                        <p className="text-xs text-slate-500">Imagen de logo (recomendado: 200x60px)</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>URL del Favicon</Label>
                                        <Input value={tenant.tenant.branding.favicon || ''} placeholder="https://..."
                                            onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, favicon: e.target.value } } })} />
                                        <p className="text-xs text-slate-500">Icono del navegador (32x32px)</p>
                                    </div>
                                </div>

                                {/* Colores de Marca */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Colores de Marca</h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Color Primario</Label>
                                            <div className="flex gap-2">
                                                <Input type="color" value={tenant.tenant.branding.primaryColor}
                                                    onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, primaryColor: e.target.value } } })} className="w-14 h-10" />
                                                <Input type="text" value={tenant.tenant.branding.primaryColor} readOnly className="w-20 text-xs" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Color Secundario</Label>
                                            <div className="flex gap-2">
                                                <Input type="color" value={tenant.tenant.branding.secondaryColor}
                                                    onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, secondaryColor: e.target.value } } })} className="w-14 h-10" />
                                                <Input type="text" value={tenant.tenant.branding.secondaryColor} readOnly className="w-20 text-xs" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Color de Acento</Label>
                                            <div className="flex gap-2">
                                                <Input type="color" value={tenant.tenant.branding.accentColor || '#f59e0b'}
                                                    onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, accentColor: e.target.value } } })} className="w-14 h-10" />
                                                <Input type="text" value={tenant.tenant.branding.accentColor || '#f59e0b'} readOnly className="w-20 text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Colores de Botones */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Colores de Botones</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Botón Primario (CTA/WhatsApp)</Label>
                                            <div className="flex gap-2">
                                                <Input type="color" value={tenant.tenant.branding.buttonPrimaryColor || '#25D366'}
                                                    onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, buttonPrimaryColor: e.target.value } } })} className="w-14 h-10" />
                                                <Input type="text" value={tenant.tenant.branding.buttonPrimaryColor || '#25D366'} readOnly className="w-24 text-xs" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Botón Secundario</Label>
                                            <div className="flex gap-2">
                                                <Input type="color" value={tenant.tenant.branding.buttonSecondaryColor || '#1e40af'}
                                                    onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, buttonSecondaryColor: e.target.value } } })} className="w-14 h-10" />
                                                <Input type="text" value={tenant.tenant.branding.buttonSecondaryColor || '#1e40af'} readOnly className="w-24 text-xs" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Tipografía */}
                                <div className="border-t pt-4">
                                    <div className="space-y-2">
                                        <Label>Fuente (Font Family)</Label>
                                        <Input value={tenant.tenant.branding.fontFamily} placeholder="Inter, Roboto, etc."
                                            onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, fontFamily: e.target.value } } })} />
                                        <p className="text-xs text-slate-500">Usa fuentes de Google Fonts</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Branding
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* --- Pestaña Contacto --- */}
                <TabsContent value="social">
                    <Card>
                        <CardHeader>
                            <CardTitle>Redes Sociales y Contacto</CardTitle>
                            <CardDescription>Configura cómo tus clientes se comunican contigo.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleUpdateSocial}>
                            <CardContent className="space-y-6">
                                {/* WhatsApp */}
                                <div className="space-y-2">
                                    <Label>WhatsApp (Número con código de país)</Label>
                                    <Input value={tenant.tenant.socialLinks.whatsappLink || ''} placeholder="584121234567"
                                        onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, socialLinks: { ...tenant.tenant.socialLinks, whatsappLink: e.target.value } } })} />
                                    <p className="text-xs text-slate-500">Ej: 584121234567 (Venezuela) o 573101234567 (Colombia)</p>
                                </div>

                                {/* Redes Sociales */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Redes Sociales</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label>Instagram</Label>
                                            <Input value={tenant.tenant.socialLinks.instagram || ''} placeholder="https://instagram.com/tu_cuenta"
                                                onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, socialLinks: { ...tenant.tenant.socialLinks, instagram: e.target.value } } })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Facebook</Label>
                                            <Input value={tenant.tenant.socialLinks.facebook || ''} placeholder="https://facebook.com/tu_pagina"
                                                onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, socialLinks: { ...tenant.tenant.socialLinks, facebook: e.target.value } } })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>TikTok</Label>
                                            <Input value={tenant.tenant.socialLinks.tiktok || ''} placeholder="https://tiktok.com/@tu_cuenta"
                                                onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, socialLinks: { ...tenant.tenant.socialLinks, tiktok: e.target.value } } })} />
                                        </div>
                                    </div>
                                </div>

                                {/* Ubicación */}
                                <div className="border-t pt-4">
                                    <h4 className="font-medium mb-3">Ubicación Física</h4>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label>Dirección (texto que verá el cliente)</Label>
                                            <Input value={tenant.tenant.socialLinks.address || ''} placeholder="Av. Principal #123, Ciudad"
                                                onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, socialLinks: { ...tenant.tenant.socialLinks, address: e.target.value } } })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Link de Google Maps</Label>
                                            <Input value={tenant.tenant.socialLinks.googleMapsLink || ''} placeholder="https://maps.google.com/..."
                                                onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, socialLinks: { ...tenant.tenant.socialLinks, googleMapsLink: e.target.value } } })} />
                                            <p className="text-xs text-slate-500">Al hacer clic en la dirección, se abrirá este link de Google Maps</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Contacto
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* --- Pestaña Negocio (IA) --- */}
                <TabsContent value="business">
                    <Card>
                        <CardHeader>
                            <CardTitle>Información de Negocio para IA</CardTitle>
                            <CardDescription>Esta información ayuda a la IA a generar mejores textos persuasivos.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleUpdateBusiness}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Nombre Comercial</Label>
                                    <Input value={tenant.tenant.businessInfo.businessName}
                                        onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, businessInfo: { ...tenant.tenant.businessInfo, businessName: e.target.value } } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Nicho / Audiencia</Label>
                                    <Input value={tenant.tenant.businessInfo.niche} placeholder="Ej: Gorras para jóvenes, Ropa de trabajo..."
                                        onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, businessInfo: { ...tenant.tenant.businessInfo, niche: e.target.value } } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Propuesta Única (USP)</Label>
                                    <Input value={tenant.tenant.businessInfo.usp} placeholder="Ej: Calidad premium con bordados artesanales"
                                        onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, businessInfo: { ...tenant.tenant.businessInfo, usp: e.target.value } } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tono de Voz</Label>
                                    <select
                                        className="w-full p-2 border rounded-md"
                                        value={tenant.tenant.businessInfo.tone}
                                        onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, businessInfo: { ...tenant.tenant.businessInfo, tone: e.target.value } } })}
                                    >
                                        <option value="profesional">Profesional</option>
                                        <option value="casual">Casual</option>
                                        <option value="juvenil">Juvenil</option>
                                        <option value="persuasivo">Persuasivo</option>
                                    </select>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={saving}>Guardar Info de Negocio</Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* --- Pestaña Acceso --- */}
                <TabsContent value="acceso">
                    <Card>
                        <CardHeader>
                            <CardTitle>Administración de Acceso</CardTitle>
                            <CardDescription>Email y contraseña del administrador de este cliente.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Nombre Admin</Label>
                                <Input value={tenant.adminName} readOnly className="bg-slate-50" />
                            </div>
                            <div className="space-y-2">
                                <Label>Correo de Acceso</Label>
                                <Input value={tenant.adminEmail} readOnly className="bg-slate-50" />
                            </div>
                            <form onSubmit={handleChangePassword} className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label>Nueva Contraseña</Label>
                                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 8 caracteres" />
                                </div>
                                <Button type="submit" variant="destructive" disabled={saving}>Cambiar Contraseña</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
