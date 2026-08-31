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

    const [productSearch, setProductSearch] = useState('');

    const openDialog = (collection?: Collection) => {
        setProductSearch('');
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
                                                    unoptimized
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
                <DialogContent className="sm:max-w-[95vw] sm:w-[95vw] w-[95vw] max-w-[95vw] h-[90vh] max-h-[90vh] flex flex-col overflow-hidden p-0 rounded-2xl">
                    <DialogHeader className="px-6 py-4 border-b shrink-0 bg-slate-50 flex-row items-center justify-between">
                        <div>
                            <DialogTitle className="text-xl font-bold text-slate-800">
                                {editingCollection ? 'Editar Colección' : 'Nueva Colección'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-slate-500">
                                {editingCollection ? 'Configura los datos y el orden de los productos' : 'Crea una nueva colección y asigna productos'}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
                        {/* Seccion 1: Datos basicos de la Colección */}
                        <div className="px-6 py-3 bg-white border-b shrink-0 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div className="space-y-1">
                                <Label htmlFor="name" className="text-xs font-semibold text-slate-700">Nombre de la colección</Label>
                                <Input id="name" {...form.register('name')} placeholder="Ej: Franelas Emprendedores" className="h-9 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="slug" className="text-xs font-semibold text-slate-700">Slug (URL)</Label>
                                <Input id="slug" {...form.register('slug')} placeholder="catalogo-franelas" className="h-9 text-sm" />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs font-semibold text-slate-700 block">Imagen de portada</Label>
                                <div className="flex items-center gap-3">
                                    {coverImage ? (
                                        <Image
                                            src={coverImage}
                                            alt="Cover"
                                            width={36}
                                            height={36}
                                            unoptimized
                                            className="rounded-md object-cover h-9 w-9 border"
                                        />
                                    ) : (
                                        <div className="h-9 w-9 rounded-md bg-slate-100 border flex items-center justify-center">
                                            <FolderOpen className="h-4 w-4 text-slate-400" />
                                        </div>
                                    )}
                                    <label className="cursor-pointer flex-1">
                                        <Button type="button" variant="outline" size="sm" className="w-full h-9 text-xs gap-1.5" asChild>
                                            <span>
                                                {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                                                {coverImage ? 'Cambiar Imagen' : 'Subir Imagen'}
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

                        {/* Seccion 2: Paneles Side-by-Side para Productos */}
                        <div className="flex flex-1 min-h-0 overflow-hidden bg-slate-100/60 p-4 gap-4">
                            {/* Panel Izquierdo: Productos en la Colección */}
                            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
                                <div className="px-4 py-3 border-b bg-blue-50/50 flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <GripVertical className="h-4 w-4 text-blue-600" />
                                        <span className="font-bold text-sm text-slate-800">
                                            Productos en esta colección ({selectedProducts.length})
                                        </span>
                                    </div>
                                    <span className="text-xs text-blue-600 font-medium">
                                        Usa las flechas ↑ ↓ para mover la posición
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 divide-y divide-slate-100">
                                    {selectedProducts.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
                                            <FolderOpen className="h-10 w-10 text-slate-300" />
                                            <span>Esta colección no tiene productos aún.</span>
                                            <span className="text-xs text-slate-400">Añádelos desde el panel de la derecha 👉</span>
                                        </div>
                                    ) : (
                                        selectedProducts.map((p, index) => (
                                            <div key={p._id} className="flex items-center gap-3 py-2.5 px-3 hover:bg-slate-50 rounded-lg transition-colors group">
                                                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0 shadow-xs">
                                                    {index + 1}
                                                </span>
                                                <span className="flex-1 text-sm font-semibold text-slate-800 truncate">
                                                    {p.name}
                                                </span>
                                                <div className="flex items-center gap-1.5 shrink-0">
                                                    <button
                                                        type="button"
                                                        onClick={() => moveProduct(index, 'up')}
                                                        disabled={index === 0}
                                                        className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs"
                                                        title="Subir posición"
                                                    >
                                                        <ArrowUp className="h-4 w-4 text-blue-700" />
                                                        <span>Subir</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => moveProduct(index, 'down')}
                                                        disabled={index === selectedProducts.length - 1}
                                                        className="px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 font-bold text-xs hover:bg-blue-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-1 shadow-2xs"
                                                        title="Bajar posición"
                                                    >
                                                        <ArrowDown className="h-4 w-4 text-blue-700" />
                                                        <span>Bajar</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProduct(p._id)}
                                                        className="p-1.5 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-all ml-1"
                                                        title="Quitar de la colección"
                                                    >
                                                        <X className="h-4 w-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Panel Derecho: Productos Disponibles para Añadir */}
                            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
                                <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between shrink-0 gap-3">
                                    <span className="font-bold text-sm text-slate-800 shrink-0">
                                        Catálogo de Productos
                                    </span>
                                    <div className="relative flex-1 max-w-xs">
                                        <Input
                                            type="text"
                                            placeholder="🔍 Buscar por nombre..."
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            className="h-8 text-xs pr-7"
                                        />
                                        {productSearch && (
                                            <button
                                                type="button"
                                                onClick={() => setProductSearch('')}
                                                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3">
                                    {(() => {
                                        const available = products.filter(
                                            (product) =>
                                                !selectedProducts.some((s) => s._id === product._id) &&
                                                product.name.toLowerCase().includes(productSearch.toLowerCase())
                                        );

                                        if (available.length === 0) {
                                            return (
                                                <div className="h-full flex items-center justify-center text-slate-400 text-xs py-8">
                                                    {productSearch ? 'No se encontraron productos con esa búsqueda' : 'Todos los productos ya están en la colección'}
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                {available.map((product) => (
                                                    <button
                                                        key={product._id}
                                                        type="button"
                                                        onClick={() => addProduct({ _id: product._id, name: product.name })}
                                                        className="p-3 rounded-lg text-left bg-slate-50 border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group shadow-2xs"
                                                    >
                                                        <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-900 truncate">
                                                            {product.name}
                                                        </span>
                                                        <span className="text-xs font-bold text-blue-600 bg-blue-100 group-hover:bg-blue-600 group-hover:text-white px-2 py-0.5 rounded-full transition-colors shrink-0 ml-2">
                                                            + Añadir
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <DialogFooter className="px-6 py-3 border-t shrink-0 bg-white flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                                Recuerda hacer clic en <strong>Guardar</strong> para aplicar los cambios de orden.
                            </span>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={closeDialog}>
                                    Cancelar
                                </Button>
                                <Button type="submit" size="sm" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold">
                                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Guardar Cambios
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
