/**
 * Página de Gestión de Productos (Super-Admin)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema, type ProductInput } from '@/lib/validations';
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
import { Plus, Pencil, Trash2, Loader2, Package, Upload, X, AlignLeft } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';

interface Product {
    _id: string;
    name: string;
    description: string;
    images: string[];
    tags: string[];
    createdAt: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [uploadedImages, setUploadedImages] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const form = useForm<ProductInput>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            description: '',
            images: [],
            tags: [],
        },
    });

    const fetchProducts = useCallback(async () => {
        try {
            const response = await fetch('/api/admin/products');
            const data = await response.json();
            if (response.ok) {
                setProducts(data.products);
            }
        } catch (error) {
            toast.error('Error al cargar productos');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                setUploadedImages((prev) => [...prev, ...data.urls]);
                form.setValue('images', [...uploadedImages, ...data.urls]);
                toast.success('Imágenes subidas correctamente');
            } else {
                toast.error(data.error || 'Error al subir imágenes');
            }
        } catch {
            toast.error('Error al subir imágenes');
        } finally {
            setIsUploading(false);
        }
    };

    const removeImage = (index: number) => {
        const newImages = uploadedImages.filter((_, i) => i !== index);
        setUploadedImages(newImages);
        form.setValue('images', newImages);
    };

    const openDialog = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            form.reset({
                name: product.name,
                description: product.description || '',
                images: product.images,
                tags: product.tags,
            });
            setUploadedImages(product.images);
        } else {
            setEditingProduct(null);
            form.reset({ name: '', description: '', images: [], tags: [] });
            setUploadedImages([]);
        }
        setIsDialogOpen(true);
    };

    const closeDialog = () => {
        setIsDialogOpen(false);
        setEditingProduct(null);
        form.reset();
        setUploadedImages([]);
    };

    const onSubmit = async (data: ProductInput) => {
        setIsSubmitting(true);
        try {
            const url = editingProduct
                ? `/api/admin/products/${editingProduct._id}`
                : '/api/admin/products';
            const method = editingProduct ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, images: uploadedImages }),
            });

            if (response.ok) {
                toast.success(
                    editingProduct ? 'Producto actualizado' : 'Producto creado'
                );
                closeDialog();
                fetchProducts();
            } else {
                const error = await response.json();
                toast.error(error.error || 'Error al guardar');
            }
        } catch {
            toast.error('Error al guardar producto');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        try {
            const response = await fetch(`/api/admin/products/${id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                toast.success('Producto eliminado');
                fetchProducts();
            } else {
                toast.error('Error al eliminar producto');
            }
        } catch {
            toast.error('Error al eliminar producto');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Productos</h1>
                    <p className="text-slate-600 mt-1">
                        Gestiona los productos del catálogo master
                    </p>
                </div>
                <Button onClick={() => openDialog()} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nuevo Producto
                </Button>
            </div>

            {/* Tabla */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Lista de Productos ({products.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                            No hay productos registrados
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-20">Imagen</TableHead>
                                    <TableHead>Nombre</TableHead>
                                    <TableHead>Tags</TableHead>
                                    <TableHead className="text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product._id}>
                                        <TableCell>
                                            {product.images[0] ? (
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    width={48}
                                                    height={48}
                                                    className="rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                                                    <Package className="h-6 w-6 text-slate-400" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {product.tags.slice(0, 3).map((tag) => (
                                                    <Badge key={tag} variant="secondary">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                                {product.tags.length > 3 && (
                                                    <Badge variant="outline">
                                                        +{product.tags.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    onClick={() => openDialog(product)}
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="text-red-500 hover:text-red-600"
                                                    onClick={() => handleDelete(product._id)}
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

            {/* Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingProduct
                                ? 'Modifica los datos del producto'
                                : 'Completa los datos del nuevo producto'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre del producto</Label>
                            <Input
                                id="name"
                                {...form.register('name')}
                                placeholder="Ej: Gorra personalizada"
                            />
                            {form.formState.errors.name && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label>Imágenes</Label>
                            <div className="grid grid-cols-4 gap-2">
                                {uploadedImages.map((url, index) => (
                                    <div key={url} className="relative group">
                                        <Image
                                            src={url}
                                            alt={`Imagen ${index + 1}`}
                                            width={100}
                                            height={100}
                                            className="rounded-lg object-cover w-full aspect-square"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                                    {isUploading ? (
                                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                    ) : (
                                        <>
                                            <Upload className="h-6 w-6 text-slate-400" />
                                            <span className="text-xs text-slate-500 mt-1">Subir</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="tags">Tags (separados por coma)</Label>
                            <Input
                                id="tags"
                                placeholder="gorras, personalizado, algodón"
                                onChange={(e) => {
                                    const tags = e.target.value.split(',').map((t) => t.trim()).filter(Boolean);
                                    form.setValue('tags', tags);
                                }}
                                defaultValue={editingProduct?.tags.join(', ')}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeDialog}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar'
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
