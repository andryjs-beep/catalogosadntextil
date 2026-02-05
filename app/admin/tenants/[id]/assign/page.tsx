/**
 * Página de Asignación de Colecciones a Tenant (Super-Admin)
 */
'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Check, FolderOpen, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Collection {
    _id: string;
    slug: string;
    name: string;
    coverImage: string;
    productIds: Array<{
        _id: string;
        name: string;
        images: string[];
    }>;
}

interface TenantCollection {
    _id: string;
    collectionId: Collection;
    persuasiveTextTop: string;
    persuasiveTextBottom: string;
    ctaButtonText: string;
    isPublished: boolean;
    order: number;
}

interface Assignment {
    collectionId: string;
    persuasiveTextTop: string;
    persuasiveTextBottom: string;
    ctaButtonText: string;
    isPublished: boolean;
    order: number;
}

export default function AssignCollectionsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id: tenantId } = use(params);
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [tenantSlug, setTenantSlug] = useState('');
    const [allCollections, setAllCollections] = useState<Collection[]>([]);
    const [assignments, setAssignments] = useState<Map<string, Assignment>>(new Map());

    const fetchData = useCallback(async () => {
        try {
            const response = await fetch(`/api/admin/tenants/${tenantId}/assign`);
            const data = await response.json();
            if (response.ok) {
                setTenantSlug(data.tenant.slug);
                setAllCollections(data.allCollections);

                const assignmentMap = new Map<string, Assignment>();
                data.tenantCollections.forEach((tc: TenantCollection) => {
                    const colId = typeof tc.collectionId === 'object' ? tc.collectionId._id : tc.collectionId;
                    assignmentMap.set(colId, {
                        collectionId: colId,
                        persuasiveTextTop: tc.persuasiveTextTop,
                        persuasiveTextBottom: tc.persuasiveTextBottom,
                        ctaButtonText: tc.ctaButtonText,
                        isPublished: tc.isPublished,
                        order: tc.order,
                    });
                });
                setAssignments(assignmentMap);
            }
        } catch {
            toast.error('Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const toggleCollection = (collectionId: string) => {
        setAssignments((prev) => {
            const newMap = new Map(prev);
            if (newMap.has(collectionId)) {
                newMap.delete(collectionId);
            } else {
                newMap.set(collectionId, {
                    collectionId,
                    persuasiveTextTop: '',
                    persuasiveTextBottom: '',
                    ctaButtonText: '',
                    isPublished: true,
                    order: newMap.size,
                });
            }
            return newMap;
        });
    };

    const updateAssignment = (collectionId: string, field: keyof Assignment, value: string | boolean | number) => {
        setAssignments((prev) => {
            const newMap = new Map(prev);
            const current = newMap.get(collectionId);
            if (current) {
                newMap.set(collectionId, { ...current, [field]: value });
            }
            return newMap;
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const assignmentsArray = Array.from(assignments.values());
            const response = await fetch(`/api/admin/tenants/${tenantId}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assignments: assignmentsArray }),
            });

            if (response.ok) {
                toast.success('Asignaciones guardadas');
                router.push('/admin/tenants');
            } else {
                toast.error('Error al guardar');
            }
        } catch {
            toast.error('Error al guardar');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/tenants">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Asignar Colecciones
                    </h1>
                    <p className="text-slate-600">
                        Cliente: <Badge variant="outline">{tenantSlug}</Badge>
                    </p>
                </div>
            </div>

            <div className="grid gap-4">
                {allCollections.map((collection) => {
                    const assignment = assignments.get(collection._id);
                    const isAssigned = !!assignment;

                    return (
                        <Card key={collection._id} className={isAssigned ? 'ring-2 ring-blue-500' : ''}>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-3">
                                        {collection.coverImage ? (
                                            <Image
                                                src={collection.coverImage}
                                                alt={collection.name}
                                                width={40}
                                                height={40}
                                                className="rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                                                <FolderOpen className="h-5 w-5 text-slate-400" />
                                            </div>
                                        )}
                                        {collection.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        {isAssigned && (
                                            <Link href={`/admin/tenants/${tenantId}/landing/${collection._id}`}>
                                                <Button variant="outline" size="sm" className="gap-2 border-primary/20 text-primary hover:bg-primary/5 transition-all active:scale-95">
                                                    <LayoutTemplate className="h-4 w-4" />
                                                    Landing Page
                                                </Button>
                                            </Link>
                                        )}
                                        <Button
                                            variant={isAssigned ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => toggleCollection(collection._id)}
                                            className="transition-all active:scale-95"
                                        >
                                            {isAssigned && <Check className="h-4 w-4 mr-1" />}
                                            {isAssigned ? 'Asignada' : 'Asignar'}
                                        </Button>
                                    </div>
                                </div>

                                {/* Product Preview List (Premium 2026) */}
                                <div className="mt-4 pt-4 border-t border-slate-50">
                                    <div className="flex flex-wrap gap-2">
                                        {collection.productIds?.length > 0 ? (
                                            collection.productIds.map((p) => (
                                                <div
                                                    key={p._id}
                                                    className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-full border border-slate-100 hover:bg-white hover:shadow-sm transition-all cursor-default group/p"
                                                >
                                                    {p.images?.[0] && (
                                                        <div className="w-5 h-5 rounded-full overflow-hidden relative border border-slate-200">
                                                            <Image
                                                                src={p.images[0]}
                                                                alt={p.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="20px"
                                                            />
                                                        </div>
                                                    )}
                                                    <span className="text-[11px] font-medium text-slate-500 group-hover/p:text-slate-900 transition-colors">
                                                        {p.name}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-[11px] text-slate-400 italic">Sin productos</span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            {isAssigned && (
                                <CardContent className="pt-4 space-y-4 border-t">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Texto persuasivo arriba</Label>
                                            <Textarea
                                                value={assignment?.persuasiveTextTop || ''}
                                                onChange={(e) => updateAssignment(collection._id, 'persuasiveTextTop', e.target.value)}
                                                placeholder="¡Descubre nuestra colección exclusiva!"
                                                rows={2}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Texto persuasivo abajo</Label>
                                            <Textarea
                                                value={assignment?.persuasiveTextBottom || ''}
                                                onChange={(e) => updateAssignment(collection._id, 'persuasiveTextBottom', e.target.value)}
                                                placeholder="¿Te gustó algo? ¡Contáctanos!"
                                                rows={2}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Texto botón CTA</Label>
                                            <Input
                                                value={assignment?.ctaButtonText || ''}
                                                onChange={(e) => updateAssignment(collection._id, 'ctaButtonText', e.target.value)}
                                                placeholder="Consultar precio"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Estado</Label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="checkbox"
                                                    checked={assignment?.isPublished || false}
                                                    onChange={(e) => updateAssignment(collection._id, 'isPublished', e.target.checked)}
                                                    className="h-4 w-4"
                                                />
                                                <span className="text-sm">Publicada (visible al público)</span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    );
                })}
            </div>

            <div className="flex justify-end gap-4 sticky bottom-4 bg-white p-4 rounded-lg shadow-lg">
                <Link href="/admin/tenants">
                    <Button variant="outline">Cancelar</Button>
                </Link>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Guardar Asignaciones ({assignments.size})
                </Button>
            </div>
        </div>
    );
}
