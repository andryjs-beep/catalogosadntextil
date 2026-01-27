/**
 * Página de Gestión de Colecciones (Super-Admin)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { collectionSchema, type CollectionInput } from '@/lib/validations';
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
import { Plus, Pencil, Trash2, Loader2, FolderOpen, Upload } from 'lucide-react';
import Image from 'next/image';

interface Collection {
    _id: string;
    slug: string;
    name: string;
    coverImage: string;
    productIds: { _id: string; name: string }[];
    order: number;
    createdAt: string;
}

interface Product {
    _id: string;
    name: string;
    images: string[];
}

export default function CollectionsPage() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [coverImage, setCoverImage] = useState('');
    const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<CollectionInput>({
        resolver: zodResolver(collectionSchema),
        defaultValues: {
            slug: '',
            name: '',
            coverImage: '',
            productIds: [],
            order: 0,
        },
    });

    const fetchCollections = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/collections');
            const data = await response.json();
            if (response.ok) {
                setCollections(data.collections);
            }
        } catch {
            toast.error('Error al cargar colecciones');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/products?limit=100');
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products);
            }
        } catch {
            toast.error('Error al cargar productos');
        }
    }, []);

    useEffect(() => {
        fetchCollections();
        fetchProducts();
    }, [fetchCollections, fetchProducts]);

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
                setCoverImage(data.urls[0]);
                form.setValue('coverImage', data.urls[0]);
                toast.success('Imagen subida');
            }
        } catch {
            toast.error('Error al subir imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const openDialog = (collection?: Collection) => {
        if (collection) {
            setEditingCollection(collection);
            form.reset({
                slug: collection.slug,
                name: collection.name,
                coverImage: collection.coverImage,
                productIds: collection.productIds.map((p) => p._id),
                order: collection.order,
            });
            setCoverImage(collection.coverImage);
            setSelectedProductIds(collection.productIds.map((p) => p._id));
        } else {
            setEditingCollection(null);
            form.reset({ slug: '', name: '', coverImage: '', productIds: [], order: collections.length });
            setCoverImage('');
            setSelectedProductIds([]);
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCollection(null);
        form.reset();
        setCoverImage('');
        setSelectedProductIds([]);
    };

    const toggleProduct = (productId: string) => {
        setSelectedProductIds((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        );
    };

    const onSubmit = async (data: CollectionInput) => {
        setIsSubmitting(true);
        try {
            const url = editingCollection
                ? `/api/admin/collections/${editingCollection._id}`
                : '/api/admin/collections';
            const method = editingCollection ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    coverImage,
                    productIds: selectedProductIds,
                }),
            });

            if (response.ok) {
                toast.success(
                    editingCollection ? 'Colección actualizada' : 'Colección creada'
                );
                closeDialog();
                fetchCollections();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error al guardar');
            }
        } catch {
            toast.error('Error al guardar colección');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta colección?')) return;

        try {
            const response = await fetch(`/api/admin/collections/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Colección eliminada');
                fetchCollections();
            }
        } catch {
            toast.error('Error al eliminar');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Colecciones</h1>
                    <p className="text-slate-600 mt-1">
                        Organiza productos en catálogos temáticos
                    </p>
                </div>
                <Button onClick={() => openDialog()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Colección
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        Lista de Colecciones ({collections.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : collections.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No hay colecciones registradas
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Cover</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Slug</TableHead>
                                    <TableHead>Productos</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {collections.map((col) => (
                                    <TableRow key={col._id}>
                                        <TableCell>
                                            {col.coverImage ? (
                                                <Image
                                                    src={col.coverImage}
                                                    alt={col.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <FolderOpen className="h-6 w-6 text-slate-400" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{col.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{col.slug}</Badge>
                                        </TableCell>
                                        <TableCell>{col.productIds.length} productos</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => openDialog(col)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-500"
                                                    onClick={() => handleDelete(col._id)}
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
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingCollection ? 'Editar Colección' : 'Nueva Colección'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCollection ? 'Modifica los datos' : 'Crea una nueva colección'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input id="name" {...form.register('name')} placeholder="Gorras" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input id="slug" {...form.register('slug')} placeholder="gorras" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Imagen de portada</Label>
                            <div className="flex items-center gap-4">
                                {coverImage ? (
                                    <Image
                                        src={coverImage}
                                        alt="Cover"
                                        width={100}
                                        height={100}
                                        className="rounded-lg object-cover"
                                    />
                                ) : (
                                    <div className="h-24 w-24 rounded-lg bg-slate-100 flex items-center justify-center">
                                        <FolderOpen className="h-8 w-8 text-slate-400" />
                                    </div>
                                )}
                                <label className="cursor-pointer">
                                    <Button type="button" variant="outline" className="gap-2" asChild>
                                        <span>
                                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                            Subir imagen
                                        </span>
                                    </Button>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleCoverUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Productos ({selectedProductIds.length} seleccionados)</Label>
                            <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto border rounded-lg p-2">
                                {products.map((product) => (
                                    <button
                                        key={product._id}
                                        type="button"
                                        onClick={() => toggleProduct(product._id)}
                                        className={`p-2 rounded-lg text-left text-sm transition-colors ${selectedProductIds.includes(product._id)
                                                ? 'bg-blue-100 border-blue-500 border-2'
                                                : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'
                                            }`}
                                    >
                                        <div className="truncate">{product.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Guardar
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
