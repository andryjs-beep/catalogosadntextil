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
    buttonPrimaryColor?: string;
    buttonSecondaryColor?: string;
    // Ticker/Marquee
    tickerEnabled?: boolean;
    tickerText?: string;
    tickerBgColor?: string;
    tickerTextColor?: string;
    tickerSpeed?: 'slow' | 'normal' | 'fast';
    tickerDirection?: 'left' | 'right';
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

export interface IBusinessInfo {
    businessName: string;
    niche: string;
    usp: string;
    tone: 'profesional' | 'casual' | 'juvenil' | 'persuasivo';
}

export interface ITenant extends Document {
    _id: mongoose.Types.ObjectId;
    slug: string;
    branding: IBranding;
    socialLinks: ISocialLinks;
    globalTexts: IGlobalTexts;
    businessInfo: IBusinessInfo;
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
            buttonPrimaryColor: { type: String, default: '#25D366' },
            buttonSecondaryColor: { type: String, default: '#1e40af' },
            // Ticker/Marquee
            tickerEnabled: { type: Boolean, default: false },
            tickerText: { type: String, default: '' },
            tickerBgColor: { type: String, default: '#000000' },
            tickerTextColor: { type: String, default: '#ffffff' },
            tickerSpeed: { type: String, enum: ['slow', 'normal', 'fast'], default: 'normal' },
            tickerDirection: { type: String, enum: ['left', 'right'], default: 'left' },
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
        businessInfo: {
            businessName: { type: String, default: '' },
            niche: { type: String, default: '' },
            usp: { type: String, default: '' },
            tone: {
                type: String,
                enum: ['profesional', 'casual', 'juvenil', 'persuasivo'],
                default: 'profesional'
            }
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
