/**
 * Modelo TenantCollection - Asignación de colecciones a tenants
 * Permite personalizar textos persuasivos por cliente
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface ILandingPageSections {
    hero: {
        headline: string;
        subheadline: string;
        ctaText: string;
        heroImage: string;
        videoUrl: string;
    };
    benefits: {
        items: Array<{
            icon: string;
            title: string;
            description: string;
        }>;
    };
    howItWorks: {
        steps: Array<{
            number: number;
            title: string;
            description: string;
            image: string;
        }>;
    };
    socialProof: {
        stats: Array<{ number: string; label: string }>;
        testimonials: Array<{
            name: string;
            role: string;
            text: string;
            avatar: string;
            rating: number;
        }>;
        logos: string[];
    };
    faq: Array<{
        question: string;
        answer: string;
    }>;
    finalCTA: {
        headline: string;
        description: string;
        ctaText: string;
    };
}

export interface ITenantCollection extends Document {
    _id: mongoose.Types.ObjectId;
    tenantId: mongoose.Types.ObjectId;
    collectionId: mongoose.Types.ObjectId;
    persuasiveTextTop: string;
    persuasiveTextBottom: string;
    ctaButtonText: string;
    isPublished: boolean;
    order: number;
    landingPageSections: ILandingPageSections;
    useLandingLayout: boolean;
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
        landingPageSections: {
            hero: {
                headline: { type: String, default: '' },
                subheadline: { type: String, default: '' },
                ctaText: { type: String, default: 'Ver Catálogo' },
                heroImage: { type: String, default: '' },
                videoUrl: { type: String, default: '' },
            },
            benefits: {
                items: [
                    {
                        icon: String,
                        title: String,
                        description: String,
                    },
                ],
            },
            howItWorks: {
                steps: [
                    {
                        number: Number,
                        title: String,
                        description: String,
                        image: String,
                    },
                ],
            },
            socialProof: {
                stats: [{ number: String, label: String }],
                testimonials: [
                    {
                        name: String,
                        role: String,
                        text: String,
                        avatar: String,
                        rating: Number,
                    },
                ],
                logos: [String],
            },
            faq: [
                {
                    question: String,
                    answer: String,
                },
            ],
            finalCTA: {
                headline: { type: String, default: '' },
                description: { type: String, default: '' },
                ctaText: { type: String, default: 'Contactar Ahora' },
            },
        },
        useLandingLayout: {
            type: Boolean,
            default: false,
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
