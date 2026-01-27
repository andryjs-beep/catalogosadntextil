/**
 * Modelo TenantCollection - Asignación de colecciones a tenants
 * Permite personalizar textos persuasivos por cliente
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface ITenantCollection extends Document {
    _id: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    collectionId: mongoose.Types.ObjectId;
    persuasiveTextTop: string;
    persuasiveTextBottom: string;
    ctaButtonText: string;
    isPublished: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

const TenantCollectionSchema = new Schema<ITenantCollection>(
    {
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: [true, 'El tenantId es requerido'],
        },
        collectionId: {
            type: Schema.Types.ObjectId,
            ref: 'Collection',
            required: [true, 'El collectionId es requerido'],
        },
        persuasiveTextTop: {
            type: String,
            default: '',
            maxlength: [500, 'El texto no puede exceder 500 caracteres'],
        },
        persuasiveTextBottom: {
            type: String,
            default: '',
            maxlength: [500, 'El texto no puede exceder 500 caracteres'],
        },
        ctaButtonText: {
            type: String,
            default: '',
            maxlength: [50, 'El texto del botón no puede exceder 50 caracteres'],
        },
        isPublished: {
            type: Boolean,
            default: false,
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

// Índices compuestos para consultas eficientes
TenantCollectionSchema.index({ tenantId: 1, collectionId: 1 }, { unique: true });
TenantCollectionSchema.index({ tenantId: 1, isPublished: 1, order: 1 });

export default mongoose.models.TenantCollection ||
    mongoose.model<ITenantCollection>('TenantCollection', TenantCollectionSchema);
