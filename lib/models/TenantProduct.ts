/**
 * Modelo TenantProduct - Personalización de productos por tenant
 * Permite a cada cliente editar nombre, precio y descripción
 * SIN duplicar las imágenes del producto master
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface ITenantProduct extends Document {
    _id: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    customName: string;
    customPrice: string;
    customDescription: string;
    ctaText: string;
    createdAt: Date;
    updatedAt: Date;
}

const TenantProductSchema = new Schema<ITenantProduct>(
    {
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: [true, 'El tenantId es requerido'],
        },
        productId: {
            type: Schema.Types.ObjectId,
            ref: 'Product',
            required: [true, 'El productId es requerido'],
        },
        customName: {
            type: String,
            default: '',
            trim: true,
            maxlength: [200, 'El nombre no puede exceder 200 caracteres'],
        },
        customPrice: {
            type: String,
            default: '',
            trim: true,
            maxlength: [50, 'El precio no puede exceder 50 caracteres'],
        },
        customDescription: {
            type: String,
            default: '',
            maxlength: [1000, 'La descripción no puede exceder 1000 caracteres'],
        },
        ctaText: {
            type: String,
            default: '',
            maxlength: [50, 'El texto del CTA no puede exceder 50 caracteres'],
        },
    },
    {
        timestamps: true,
    }
);

// Índice compuesto único: un tenant solo puede personalizar cada producto una vez
TenantProductSchema.index({ tenantId: 1, productId: 1 }, { unique: true });

export default mongoose.models.TenantProduct ||
    mongoose.model<ITenantProduct>('TenantProduct', TenantProductSchema);
