'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function TenantSettingsPage({ params }: { params: { id: string } }) {
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [password, setPassword] = useState('');
    const router = useRouter();

    useEffect(() => {
        fetchTenant();
    }, [params.id]);

    const fetchTenant = async () => {
        try {
            const res = await fetch(`/api/admin/tenants/${params.id}`);
            if (!res.ok) throw new Error('Error al cargar datos');
            const data = await res.json();
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
            const res = await fetch(`/api/admin/tenants/${params.id}`, {
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
            const res = await fetch(`/api/admin/tenants/${params.id}`, {
                method: 'PATCH',
                body: JSON.stringify({ socialLinks: tenant.tenant.socialLinks }),
            });
            if (!res.ok) throw new Error('Error al actualizar');
            toast.success('Redes sociales actualizadas');
        } catch (error) {
            toast.error('No se pudo actualizar');
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
            const res = await fetch(`/api/admin/tenants/${params.id}/password`, {
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
                <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="branding">Branding</TabsTrigger>
                    <TabsTrigger value="social">Contacto/Redes</TabsTrigger>
                    <TabsTrigger value="acceso">Acceso Admin</TabsTrigger>
                    <TabsTrigger value="textos">Textos Globales</TabsTrigger>
                </TabsList>

                {/* --- Pestaña Branding --- */}
                <TabsContent value="branding">
                    <Card>
                        <CardHeader>
                            <CardTitle>Identidad Visual</CardTitle>
                            <CardDescription>Colores y apariencia del catálogo público.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleUpdateBranding}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Color Primario</Label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={tenant.tenant.branding.primaryColor}
                                                onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, primaryColor: e.target.value } } })} />
                                            <Input type="text" value={tenant.tenant.branding.primaryColor} readOnly className="w-24" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Color Secundario</Label>
                                        <div className="flex gap-2">
                                            <Input type="color" value={tenant.tenant.branding.secondaryColor}
                                                onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, secondaryColor: e.target.value } } })} />
                                            <Input type="text" value={tenant.tenant.branding.secondaryColor} readOnly className="w-24" />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Fuente (Font Family)</Label>
                                    <Input value={tenant.tenant.branding.fontFamily}
                                        onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, branding: { ...tenant.tenant.branding, fontFamily: e.target.value } } })} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={saving}>
                                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </TabsContent>

                {/* --- Pestaña Contacto --- */}
                <TabsContent value="social">
                    <Card>
                        <CardHeader>
                            <CardTitle>Redes Sociales y WhatsApp</CardTitle>
                            <CardDescription>Configura cómo tus clientes se comunican contigo.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleUpdateSocial}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label>WhatsApp (Link o Número)</Label>
                                    <Input value={tenant.tenant.socialLinks.whatsappLink} placeholder="https://wa.me/..."
                                        onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, socialLinks: { ...tenant.tenant.socialLinks, whatsappLink: e.target.value } } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Instagram</Label>
                                    <Input value={tenant.tenant.socialLinks.instagram} placeholder="https://instagram.com/..."
                                        onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, socialLinks: { ...tenant.tenant.socialLinks, instagram: e.target.value } } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Dirección Física</Label>
                                    <Input value={tenant.tenant.socialLinks.address}
                                        onChange={(e) => setTenant({ ...tenant, tenant: { ...tenant.tenant, socialLinks: { ...tenant.tenant.socialLinks, address: e.target.value } } })} />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={saving}>Guardar Ajustes</Button>
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
