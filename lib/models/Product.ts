/**
 * Modelo Product - Productos master (Super-Admin)
 * Contiene las imágenes y datos base de cada producto
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    _id: mongoose.Types.ObjectId;
    slug: string;
    name: string;
    description: string;
    images: string[];
    tags: string[];
    collectionId: mongoose.Types.ObjectId;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        slug: {
            type: String,
            required: [true, 'El slug es requerido'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        name: {
            type: String,
            required: [true, 'El nombre del producto es requerido'],
            trim: true,
            maxlength: [200, 'El nombre no puede exceder 200 caracteres'],
        },
        description: {
            type: String,
            default: '',
            maxlength: [2000, 'La descripción no puede exceder 2000 caracteres'],
        },
        images: {
            type: [String],
            default: [],
        },
        tags: {
            type: [String],
            default: [],
        },
        collectionId: {
            type: Schema.Types.ObjectId,
            ref: 'Collection',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        order: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Índices para búsquedas eficientes
ProductSchema.index({ name: 'text', tags: 'text' });
ProductSchema.index({ createdAt: -1 });

export default mongoose.models.Product ||
    mongoose.model<IProduct>('Product', ProductSchema);
