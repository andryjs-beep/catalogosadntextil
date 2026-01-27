/**
 * Modelo TenantProduct - Personalización de productos por tenant
 * Permite a cada cliente editar nombre, precio, descripción, galería y CTA
 */
import mongoose, { Schema, Document } from 'mongoose';

export type GalleryMode = 'album' | 'slider-auto' | 'slider-manual';

export interface ITenantProduct extends Document {
    _id: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    // Textos personalizados
    customTitle: string; // Título destacado del producto
    customName: string;
    customPrice: string;
    customDescription: string; // Descripción larga con soporte para viñetas
    // Galería
    galleryMode: GalleryMode;
    sliderSpeed: number; // Segundos entre slides (solo para slider-auto)
    // CTA / WhatsApp
    ctaText: string;
    ctaSubtext: string; // Texto pequeño debajo del botón
    // Footer
    footerNote: string; // Texto de disclaimer al final
    showLocation: boolean; // Mostrar sección "Ubícanos" en este producto
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
        customTitle: {
            type: String,
            default: '',
            trim: true,
            maxlength: [200, 'El título no puede exceder 200 caracteres'],
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
            maxlength: [5000, 'La descripción no puede exceder 5000 caracteres'],
        },
        galleryMode: {
            type: String,
            enum: ['album', 'slider-auto', 'slider-manual'],
            default: 'album',
        },
        sliderSpeed: {
            type: Number,
            default: 3,
            min: 1,
            max: 30,
        },
        ctaText: {
            type: String,
            default: '',
            maxlength: [100, 'El texto del CTA no puede exceder 100 caracteres'],
        },
        ctaSubtext: {
            type: String,
            default: '',
            maxlength: [200, 'El subtexto no puede exceder 200 caracteres'],
        },
        footerNote: {
            type: String,
            default: '',
            maxlength: [500, 'La nota de pie no puede exceder 500 caracteres'],
        },
        showLocation: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Índice compuesto único
TenantProductSchema.index({ tenantId: 1, productId: 1 }, { unique: true });

export default mongoose.models.TenantProduct ||
    mongoose.model<ITenantProduct>('TenantProduct', TenantProductSchema);
