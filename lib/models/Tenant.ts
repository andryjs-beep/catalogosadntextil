/**
 * Modelo Tenant - Clientes con subdominios propios
 * Contiene branding, redes sociales y textos globales
 */
import mongoose, { Schema, Document } from 'mongoose';

export interface IBranding {
    logo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    fontFamily: string;
}

export interface ISocialLinks {
    instagram: string;
    facebook: string;
    tiktok: string;
    whatsappLink: string;
    address: string;
    googleMapsLink: string;
    locationImage: string;
}

export interface IGlobalTexts {
    headerText: string;
    footerText: string;
    ctaButtonText: string;
}

export interface ITenant extends Document {
    _id: mongoose.Types.ObjectId;
    slug: string;
    branding: IBranding;
    socialLinks: ISocialLinks;
    globalTexts: IGlobalTexts;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
    {
        slug: {
            type: String,
            required: [true, 'El slug del tenant es requerido'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^[a-z0-9-]+$/,
                'El slug solo puede contener letras minúsculas, números y guiones',
            ],
        },
        branding: {
            logo: { type: String, default: '' },
            favicon: { type: String, default: '' },
            primaryColor: { type: String, default: '#3b82f6' }, // blue-500
            secondaryColor: { type: String, default: '#1e40af' }, // blue-800
            accentColor: { type: String, default: '#f59e0b' }, // amber-500
            fontFamily: { type: String, default: 'Inter' },
        },
        socialLinks: {
            instagram: { type: String, default: '' },
            facebook: { type: String, default: '' },
            tiktok: { type: String, default: '' },
            whatsappLink: { type: String, default: '' },
            address: { type: String, default: '' },
            googleMapsLink: { type: String, default: '' },
            locationImage: { type: String, default: '' },
        },
        globalTexts: {
            headerText: { type: String, default: '' },
            footerText: { type: String, default: '' },
            ctaButtonText: { type: String, default: 'Consultar por WhatsApp' },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Índices
TenantSchema.index({ slug: 1 }, { unique: true });
TenantSchema.index({ isActive: 1 });

export default mongoose.models.Tenant ||
    mongoose.model<ITenant>('Tenant', TenantSchema);
