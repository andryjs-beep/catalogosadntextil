/**
 * Modelo Analytics - Estadísticas de visitas y clicks
 * Registra eventos de visualización y conversión por tenant
 */
import mongoose, { Schema, Document } from 'mongoose';

export type AnalyticsType = 'collection_view' | 'product_view' | 'whatsapp_click';

export interface IAnalyticsMetadata {
    userAgent: string;
    referer: string;
    ipAnonymized: string;
}

export interface IAnalytics extends Document {
    _id: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    type: AnalyticsType;
    collectionId: mongoose.Types.ObjectId | null;
    productId: mongoose.Types.ObjectId | null;
    timestamp: Date;
    metadata: IAnalyticsMetadata;
}

const AnalyticsSchema = new Schema<IAnalytics>({
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: [true, 'El tenantId es requerido'],
        index: true,
    },
    type: {
        type: String,
        enum: ['collection_view', 'product_view', 'whatsapp_click'],
        required: [true, 'El tipo de evento es requerido'],
        index: true,
    },
    collectionId: {
        type: Schema.Types.ObjectId,
        ref: 'Collection',
        default: null,
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: null,
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true,
    },
    metadata: {
        userAgent: { type: String, default: '' },
        referer: { type: String, default: '' },
        ipAnonymized: { type: String, default: '' },
    },
});

// Índices compuestos para queries de analytics
AnalyticsSchema.index({ tenantId: 1, timestamp: -1 });
AnalyticsSchema.index({ tenantId: 1, type: 1, timestamp: -1 });
AnalyticsSchema.index({ tenantId: 1, collectionId: 1, timestamp: -1 });

// TTL: Opcional, eliminar registros después de 365 días
// AnalyticsSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

export default mongoose.models.Analytics ||
    mongoose.model<IAnalytics>('Analytics', AnalyticsSchema);
