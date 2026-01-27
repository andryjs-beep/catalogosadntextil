'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, LayoutTemplate, ExternalLink, FolderOpen } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ClientCollectionsPage() {
    const [collections, setCollections] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [tenant, setTenant] = useState<any>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Reutilizamos el endpoint de productos de cliente para obtener info del tenant si hace falta
            // O mejor uno específico o el de branding que ya devuelve el tenantId
            const res = await fetch('/api/client-admin/products');
            const data = await res.json();

            if (res.ok) {
                setTenant(data.tenant);
                // Necesitamos obtener las colecciones asignadas.
                // Como no hay un endpoint directo para el cliente todavía, 
                // aprovechamos que el super-admin tiene uno. 
                // Pero el cliente no puede llamar a /api/admin/...
                // Crearemos /api/client-admin/collections
                const colRes = await fetch('/api/client-admin/collections');
                const colData = await colRes.json();
                if (colRes.ok) {
                    setCollections(colData.collections);
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mis Colecciones</h1>
                    <p className="text-slate-500">Configura tus Landing Pages de alta conversión.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {collections.map((tc) => (
                    <Card key={tc._id} className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                        <div className="relative h-48 bg-slate-100">
                            {tc.collectionId.coverImage ? (
                                <Image
                                    src={tc.collectionId.coverImage}
                                    alt={tc.collectionId.name}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center">
                                    <FolderOpen className="h-12 w-12 text-slate-300" />
                                </div>
                            )}
                            <div className="absolute top-2 right-2 flex gap-2">
                                <Badge variant={tc.isPublished ? 'default' : 'secondary'}>
                                    {tc.isPublished ? 'Publicada' : 'Borrador'}
                                </Badge>
                                {tc.useLandingLayout && (
                                    <Badge className="bg-amber-500 text-white border-none">
                                        Modo Landing
                                    </Badge>
                                )}
                            </div>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl">{tc.collectionId.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <Link href={`/client-admin/collections/${tc.collectionId._id}/landing`}>
                                    <Button className="w-full gap-2 border-primary/20 text-primary hover:bg-primary/5" variant="outline">
                                        <LayoutTemplate className="h-4 w-4" />
                                        Diseñar Landing Page
                                    </Button>
                                </Link>
                                <Link href={`https://${tenant?.slug}.catalogo.dpdns.org/${tc.collectionId.slug}`} target="_blank">
                                    <Button variant="ghost" className="w-full gap-2 text-slate-500">
                                        Ver en catálogo <ExternalLink className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {collections.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl border-2 border-dashed border-slate-200">
                        <FolderOpen className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900">No tienes colecciones asignadas</h3>
                        <p className="text-slate-500">Contacta con el administrador para asignar colecciones a tu catálogo.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
