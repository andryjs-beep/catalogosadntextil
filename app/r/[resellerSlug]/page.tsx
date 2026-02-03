/**
 * Página principal del Catálogo de Revendedor
 * Muestra las colecciones disponibles
 */
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import dbConnect from '@/lib/db';
import { Tenant, TenantCollection, Collection } from '@/lib/models';
import type { ITenant } from '@/lib/models/Tenant';
import { Grid3X3, ArrowRight } from 'lucide-react';

interface CollectionData {
    _id: string;
    slug: string;
    name: string;
    description: string;
    image: string;
}

export default async function ResellerHomePage({
    params,
}: {
    params: Promise<{ resellerSlug: string }>;
}) {
    const { resellerSlug } = await params;
    await dbConnect();

    // Buscar tenant por el slug del revendedor
    const tenant = await Tenant.findOne({
        'resellerConfig.slug': resellerSlug,
        'resellerConfig.enabled': true,
        isActive: true,
    }).lean<ITenant>();

    if (!tenant) {
        notFound();
    }

    // Obtener colecciones asignadas usando el tenant._id
    const tenantId = tenant._id;
    console.log('Reseller page - tenantId:', tenantId, 'type:', typeof tenantId);

    const tenantCollections = await TenantCollection.find({
        tenantId: tenantId,
    }).lean();

    console.log('Reseller page - tenantCollections found:', tenantCollections.length);

    const collectionIds = tenantCollections.map((tc: any) => tc.collectionId);
    const collections = await Collection.find({
        _id: { $in: collectionIds },
        isActive: true,
    })
        .select('_id slug name description image')
        .lean<CollectionData[]>();

    console.log('Reseller page - collections found:', collections.length);

    if (collections.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
                <Grid3X3 className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-700 mb-2">
                    Sin colecciones
                </h2>
                <p className="text-slate-500">
                    Este catálogo aún no tiene colecciones disponibles.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Grid de colecciones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collections.map((collection) => (
                    <Link
                        key={collection._id.toString()}
                        href={`/r/${resellerSlug}/${collection.slug}`}
                        className="group relative bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                    >
                        {/* Imagen */}
                        <div className="relative aspect-[4/3] overflow-hidden">
                            {collection.image ? (
                                <Image
                                    src={collection.image}
                                    alt={collection.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                                    <Grid3X3 className="h-12 w-12 text-slate-400" />
                                </div>
                            )}
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>

                        {/* Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <h3 className="text-lg font-bold mb-1 group-hover:underline">
                                {collection.name}
                            </h3>
                            {collection.description && (
                                <p className="text-sm text-white/80 line-clamp-2">
                                    {collection.description}
                                </p>
                            )}
                            <div className="mt-2 flex items-center gap-1 text-sm text-white/90">
                                <span>Ver productos</span>
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
