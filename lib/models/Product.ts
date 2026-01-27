/**
 * Modelo Product - Productos master (Super-Admin)
 * Contiene las imágenes y datos base de cada producto
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    images: string[];
    tags: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
    {
        name: {
            type: String,
            required: [true, 'El nombre del producto es requerido'],
            trim: true,
            maxlength: [200, 'El nombre no puede exceder 200 caracteres'],
        },
        images: {
            type: [String],
            default: [],
            validate: {
                validator: function (v: string[]) {
                    return v.every((url) => url.startsWith('https://res.cloudinary.com'));
                },
                message: 'Las imágenes deben ser URLs válidas de Cloudinary',
            },
        },
        tags: {
            type: [String],
            default: [],
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
