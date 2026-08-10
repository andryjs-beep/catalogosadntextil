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
import { Plus, Pencil, Trash2, Loader2, FolderOpen, Upload, ArrowUp, ArrowDown, X, GripVertical } from 'lucide-react';
import Image from 'next/image';

interface Collection {
    _id: string;
    slug: string;
    name: string;
    coverImage: string;
    productIds: { _id: string; name: string; images?: string[] }[];
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
    // selectedProducts preserva el ORDEN: el array es la secuencia exacta de aparición
    const [selectedProducts, setSelectedProducts] = useState<{ _id: string; name: string }[]>([]);
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
            // Preservar el orden de productIds tal como está guardado
            setSelectedProducts(collection.productIds.map((p) => ({ _id: p._id, name: p.name })));
        } else {
            setEditingCollection(null);
            form.reset({ slug: '', name: '', coverImage: '', productIds: [], order: collections.length });
            setCoverImage('');
            setSelectedProducts([]);
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingCollection(null);
        form.reset();
        setCoverImage('');
        setSelectedProducts([]);
    };

    // Agregar producto al final de la lista ordenada
    const addProduct = (product: { _id: string; name: string }) => {
        setSelectedProducts((prev) =>
            prev.some((p) => p._id === product._id) ? prev : [...prev, product]
        );
    };

    // Quitar producto de la lista
    const removeProduct = (productId: string) => {
        setSelectedProducts((prev) => prev.filter((p) => p._id !== productId));
    };

    // Mover producto arriba o abajo en la lista
    const moveProduct = (index: number, direction: 'up' | 'down') => {
        const newList = [...selectedProducts];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newList.length) return;
        [newList[index], newList[targetIndex]] = [newList[targetIndex], newList[index]];
        setSelectedProducts(newList);
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
                    // Enviar productIds EN EL ORDEN que el usuario definió
                    productIds: selectedProducts.map((p) => p._id),
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

    const handleMove = async (collectionId: string, direction: 'up' | 'down') => {
        // Actualización optimista: reordenar localmente de inmediato
        const currentIndex = collections.findIndex(c => c._id === collectionId);
        const neighborIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;

        if (neighborIndex < 0 || neighborIndex >= collections.length) return;

        const newCollections = [...collections];
        [newCollections[currentIndex], newCollections[neighborIndex]] = [
            newCollections[neighborIndex],
            newCollections[currentIndex],
        ];
        setCollections(newCollections);

        try {
            const response = await fetch('/api/admin/collections/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ collectionId, direction }),
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.error || 'Error al reordenar');
                // Revertir si hubo error
                fetchCollections();
            }
        } catch {
            toast.error('Error al reordenar');
            fetchCollections();
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
                                {collections.map((col, index) => (
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
                                            <div className="flex justify-end gap-1">
                                                <div className="flex flex-col gap-1 mr-2">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={() => handleMove(col._id, 'up')}
                                                        disabled={index === 0}
                                                    >
                                                        <ArrowUp className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8"
                                                        onClick={() => handleMove(col._id, 'down')}
                                                        disabled={index === collections.length - 1}
                                                    >
                                                        <ArrowDown className="h-4 w-4" />
                                                    </Button>
                                                </div>
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
                <DialogContent className="max-w-6xl w-[95vw] h-[95vh] flex flex-col overflow-hidden p-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
                        <DialogTitle className="text-xl">
                            {editingCollection ? 'Editar Colección' : 'Nueva Colección'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingCollection ? 'Modifica los datos' : 'Crea una nueva colección'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        {/* Layout dos columnas */}
                        <div className="flex flex-1 overflow-hidden">

                            {/* Columna izquierda: datos básicos */}
                            <div className="w-[320px] shrink-0 border-r flex flex-col gap-4 p-6 overflow-y-auto">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nombre</Label>
                                    <Input id="name" {...form.register('name')} placeholder="Gorras" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="slug">Slug (URL)</Label>
                                    <Input id="slug" {...form.register('slug')} placeholder="gorras" />
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
                            </div>

                            {/* Columna derecha: productos */}
                            <div className="flex-1 flex flex-col gap-4 p-6 overflow-hidden">

                                {/* Panel superior: seleccionados con orden */}
                                <div className="flex flex-col flex-1 min-h-0">
                                    <Label className="flex items-center gap-2 mb-3 text-base font-semibold">
                                        <GripVertical className="h-5 w-5 text-slate-400" />
                                        Productos en la colección ({selectedProducts.length}) — usa ↑↓ para reordenar
                                    </Label>
                                    {selectedProducts.length === 0 ? (
                                        <div className="flex-1 flex items-center justify-center border-2 border-dashed rounded-xl text-slate-400 text-sm">
                                            Añade productos desde la sección de abajo
                                        </div>
                                    ) : (
                                        <div className="border rounded-xl divide-y overflow-y-auto flex-1">
                                            {selectedProducts.map((p, index) => (
                                                <div key={p._id} className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors">
                                                    <span className="text-sm font-black text-blue-400 w-7 text-center">{index + 1}</span>
                                                    <span className="flex-1 text-base font-medium text-slate-800">{p.name}</span>
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveProduct(index, 'up')}
                                                            disabled={index === 0}
                                                            className="p-2 rounded-lg hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            title="Subir"
                                                        >
                                                            <ArrowUp className="h-5 w-5 text-blue-600" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveProduct(index, 'down')}
                                                            disabled={index === selectedProducts.length - 1}
                                                            className="p-2 rounded-lg hover:bg-blue-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            title="Bajar"
                                                        >
                                                            <ArrowDown className="h-5 w-5 text-blue-600" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeProduct(p._id)}
                                                            className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="Quitar de la colección"
                                                        >
                                                            <X className="h-5 w-5 text-red-500" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Panel inferior: disponibles para añadir */}
                                <div className="shrink-0">
                                    <Label className="mb-3 block text-sm font-semibold text-slate-600">
                                        Añadir productos — clic en un producto para agregarlo
                                    </Label>
                                    <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto border rounded-xl p-3 bg-slate-50">
                                        {products
                                            .filter((product) => !selectedProducts.some((s) => s._id === product._id))
                                            .map((product) => (
                                                <button
                                                    key={product._id}
                                                    type="button"
                                                    onClick={() => addProduct({ _id: product._id, name: product.name })}
                                                    className="p-3 rounded-xl text-left text-sm bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-colors font-medium"
                                                    title={product.name}
                                                >
                                                    <span className="text-blue-500 mr-1">+</span>{product.name}
                                                </button>
                                            ))
                                        }
                                        {products.filter((product) => !selectedProducts.some((s) => s._id === product._id)).length === 0 && (
                                            <p className="col-span-3 text-center text-slate-400 text-sm py-4">Todos los productos están en la colección</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <DialogFooter className="px-6 py-4 border-t shrink-0">
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
