/**
 * Modelo Collection - Colecciones de productos (Super-Admin)
 * Agrupa productos en catálogos temáticos
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IResellerDetails {
    enabled?: boolean;
    adultSizes?: string;
    kidsSizes?: string;
    material?: string;
    printMethod?: string;
    delivery?: string;
    extraNote?: string;
    sizeGuideDama?: string;
    sizeGuideCaballero?: string;
    sizeGuideNinos?: string;
}

export interface ICollection extends Document {
    _id: mongoose.Types.ObjectId;
    slug: string;
    name: string;
    coverImage: string;
    productIds: mongoose.Types.ObjectId[];
    order: number;
    resellerDetails?: IResellerDetails;
    createdAt: Date;
    updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
    {
        slug: {
            type: String,
            required: [true, 'El slug es requerido'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-z0-9-]+$/,
                'El slug solo puede contener letras minúsculas, números y guiones',
            ],
        },
        name: {
            type: String,
            required: [true, 'El nombre de la colección es requerido'],
            trim: true,
            maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        },
        coverImage: {
            type: String,
            default: '',
        },
        productIds: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        order: {
            type: Number,
            default: 0,
        },
        resellerDetails: {
            enabled: { type: Boolean, default: true },
            adultSizes: { type: String, default: '' },
            kidsSizes: { type: String, default: '' },
            material: { type: String, default: '' },
            printMethod: { type: String, default: '' },
            delivery: { type: String, default: '' },
            extraNote: { type: String, default: '' },
            sizeGuideDama: { type: String, default: '' },
            sizeGuideCaballero: { type: String, default: '' },
            sizeGuideNinos: { type: String, default: '' },
        },
    },
    {
        timestamps: true,
    }
);

// Índices
CollectionSchema.index({ slug: 1 }, { unique: true });
CollectionSchema.index({ order: 1 });

export default mongoose.models.Collection ||
    mongoose.model<ICollection>('Collection', CollectionSchema);
