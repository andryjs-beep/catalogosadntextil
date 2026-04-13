/**
 * Página de Gestión de Tenants/Clientes (Super-Admin)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Store, Settings, ExternalLink, Boxes, Users } from 'lucide-react';
import Link from 'next/link';

const createTenantSchema = z.object({
    slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(8),
    adminName: z.string().min(1),
});

type CreateTenantInput = z.infer<typeof createTenantSchema>;

interface Tenant {
    _id: string;
    slug: string;
    branding: {
        primaryColor: string;
        logo: string;
    };
    isActive: boolean;
    createdAt: string;
}

export default function TenantsPage() {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<CreateTenantInput>({
        resolver: zodResolver(createTenantSchema),
        defaultValues: {
            slug: '',
            adminEmail: '',
            adminPassword: '',
            adminName: '',
        },
    });

    const fetchTenants = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/tenants?includeInactive=true');
            const data = await response.json();
            if (response.ok) {
                setTenants(data.tenants);
            }
        } catch {
            toast.error('Error al cargar clientes');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTenants();
    }, [fetchTenants]);

    const closeDialog = () => {
        setIsDialogOpen(false);
        form.reset();
    };

    const onSubmit = async (data: CreateTenantInput) => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/admin/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                toast.success('Cliente creado correctamente');
                closeDialog();
                fetchTenants();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error al crear cliente');
            }
        } catch {
            toast.error('Error al crear cliente');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleActive = async (tenant: Tenant) => {
        try {
            const response = await fetch(`/api/admin/tenants/${tenant._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: tenant.slug,
                    isActive: !tenant.isActive,
                }),
            });

            if (response.ok) {
                toast.success(tenant.isActive ? 'Cliente desactivado' : 'Cliente activado');
                fetchTenants();
            }
        } catch {
            toast.error('Error al actualizar');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar este cliente y todos sus datos?')) return;

        try {
            const response = await fetch(`/api/admin/tenants/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Cliente eliminado');
                fetchTenants();
            }
        } catch {
            toast.error('Error al eliminar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Clientes</h1>
                    <p className="text-slate-600 mt-1">Gestiona los clientes con subdominios propios</p>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Cliente
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Store className="h-5 w-5" />
                        Lista de Clientes ({tenants.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : tenants.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No hay clientes registrados
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Subdominio</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Creado</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tenants.map((tenant) => (
                                    <TableRow key={tenant._id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="h-4 w-4 rounded-full"
                                                    style={{ backgroundColor: tenant.branding.primaryColor }}
                                                />
                                                {tenant.slug}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={tenant.isActive ? 'default' : 'secondary'}
                                                className="cursor-pointer"
                                                onClick={() => toggleActive(tenant)}
                                            >
                                                {tenant.isActive ? 'Activo' : 'Inactivo'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(tenant.createdAt).toLocaleDateString('es-ES')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/tenants/${tenant._id}/settings`}>
                                                    <Button size="icon" variant="ghost" title="Configurar branding y acceso">
                                                        <Settings className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/tenants/${tenant._id}/assign`}>
                                                    <Button size="icon" variant="ghost" title="Asignar colecciones">
                                                        <Boxes className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <Link href={`/admin/tenants/${tenant._id}/reseller`}>
                                                    <Button size="icon" variant="ghost" title="Modo Revendedor">
                                                        <Users className="h-4 w-4" />
                                                    </Button>
                                                </Link>
                                                <a
                                                    href={`https://${tenant.slug}.${process.env.NEXT_PUBLIC_BASE_DOMAIN || 'catalogo.dpdns.org'}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <Button size="icon" variant="ghost" title="Ver tienda">
                                                        <ExternalLink className="h-4 w-4" />
                                                    </Button>
                                                </a>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-500"
                                                    onClick={() => handleDelete(tenant._id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nuevo Cliente</DialogTitle>
                        <DialogDescription>
                            Crea un nuevo cliente con subdominio y usuario administrador
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="slug">Subdominio</Label>
                            <div className="flex items-center gap-2">
                                <Input id="slug" {...form.register('slug')} placeholder="mi-empresa" />
                                <span className="text-slate-500">.{process.env.NEXT_PUBLIC_BASE_DOMAIN || 'catalogo.dpdns.org'}</span>
                            </div>
                            {form.formState.errors.slug && (
                                <p className="text-sm text-red-500">Solo minúsculas, números y guiones</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminName">Nombre del administrador</Label>
                            <Input id="adminName" {...form.register('adminName')} placeholder="Juan Pérez" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminEmail">Email del administrador</Label>
                            <Input id="adminEmail" type="email" {...form.register('adminEmail')} placeholder="admin@empresa.com" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="adminPassword">Contraseña</Label>
                            <Input id="adminPassword" type="password" {...form.register('adminPassword')} placeholder="Mínimo 8 caracteres" />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Crear Cliente
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
