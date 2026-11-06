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
    // Top Bar (Barra de contacto superior)
    topBarEnabled?: boolean;
    topBarBgColor?: string;
    topBarTextColor?: string;
    // Secciones
    showProducts?: boolean;
}

export interface ISocialLinks {
    instagram: string;
    facebook: string;
    tiktok: string;
    youtube?: string;
    x?: string;
    whatsappLink: string;
    address: string;
    googleMapsLink: string;
    locationImage: string;
    // Contact Info
    phoneNumber?: string;
    email?: string;
}

export interface IGlobalTexts {
    headerText: string;
    footerText: string;
    ctaButtonText: string;
    homeTitle?: string;
    homeSubtitle?: string;
}

export interface IBusinessInfo {
    businessName: string;
    niche: string;
    usp: string;
    tone: 'profesional' | 'casual' | 'juvenil' | 'persuasivo';
}

export interface IResellerItem {
    name: string;
    slug: string;
    whatsappNumber: string;
    isActive: boolean;
    createdAt?: Date;
}

export interface IResellerConfig {
    enabled: boolean;
    slug: string;                    // URL personalizada: /r/[slug]
    whatsappNumber?: string;
    resellers?: IResellerItem[];
    headerTitle: string;             // Ej: "Catálogo Online"
    headerSubtitle: string;          // Ej: "Encuentra los mejores productos"
    hideLogo: boolean;               // No mostrar logo
    hideBusinessName: boolean;       // No mostrar nombre del negocio
    hideSocialLinks: boolean;        // No mostrar redes sociales
    footerText: string;              // Texto del footer: "© Catálogo Online"
    // Personalización visual Pro
    shareImage?: string;
    primaryColor?: string;
    buttonText?: string;
    buttonSubtext?: string;
    ctaText?: string;
    badgeText?: string;
    whatsappMessage?: string;
    trustBadge1?: string;
    trustBadge2?: string;
    trustBadge3?: string;
    step1Title?: string;
    step1Desc?: string;
    step2Title?: string;
    step2Desc?: string;
    step3Title?: string;
    step3Desc?: string;
    // Ticker / Cinta informativa animada
    tickerEnabled?: boolean;
    tickerText?: string;
    tickerBgColor?: string;
    tickerTextColor?: string;
    tickerSpeed?: 'slow' | 'normal' | 'fast';
    tickerDirection?: 'left' | 'right';
}

export interface ITestimonialItem {
    name: string;
    city: string;
    text: string;
    rating: number; // 1-5
    verified: boolean;
}

export interface ITestimonialsConfig {
    enabled: boolean;
    displayScope: 'all' | 'custom'; // 'all' = en todas las páginas, 'custom' = solo landings elegidas
    score: string; // ej: "4.7"
    totalReviewsText: string; // ej: "+189 reseñas verificadas"
    title: string; // ej: "Clientes felices en toda Venezuela"
    items: ITestimonialItem[];
}

export interface ITenant extends Document {
    name: string;
    slug: string;                    // Subdominio único: cliente.tudominio.com
    customDomain?: string;           // Dominio propio: www.cliente.com
    branding: IBranding;
    socialLinks: ISocialLinks;
    globalTexts: IGlobalTexts;
    businessInfo?: IBusinessInfo;
    resellerConfig: IResellerConfig;
    testimonialsConfig?: ITestimonialsConfig;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
    {
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
        },
        slug: {
            type: String,
            required: [true, 'El slug es requerido'],
            unique: true,
            lowercase: true,
            trim: true,
        },
        customDomain: {
            type: String,
            lowercase: true,
            trim: true,
            sparse: true,
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
            // Top Bar (Barra de contacto superior)
            topBarEnabled: { type: Boolean, default: false },
            topBarBgColor: { type: String, default: '#1e40af' },
            topBarTextColor: { type: String, default: '#ffffff' },
            // Secciones
            showProducts: { type: Boolean, default: true },
        },
        socialLinks: {
            instagram: { type: String, default: '' },
            facebook: { type: String, default: '' },
            tiktok: { type: String, default: '' },
            youtube: { type: String, default: '' },
            x: { type: String, default: '' },
            whatsappLink: { type: String, default: '' },
            address: { type: String, default: '' },
            googleMapsLink: { type: String, default: '' },
            locationImage: { type: String, default: '' },
            // Contact Info
            phoneNumber: { type: String, default: '' },
            email: { type: String, default: '' },
        },
        globalTexts: {
            headerText: { type: String, default: '' },
            footerText: { type: String, default: '' },
            ctaButtonText: { type: String, default: 'Consultar por WhatsApp' },
            homeTitle: { type: String, default: 'Bienvenido a nuestro catálogo' },
            homeSubtitle: { type: String, default: 'Explora nuestras colecciones y encuentra lo que necesitas' },
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
        resellerConfig: {
            enabled: { type: Boolean, default: false },
            slug: { type: String, default: '' },
            whatsappNumber: { type: String, default: '' },
            resellers: [
                {
                    name: { type: String, default: '' },
                    slug: { type: String, default: '' },
                    whatsappNumber: { type: String, default: '' },
                    isActive: { type: Boolean, default: true },
                    createdAt: { type: Date, default: Date.now },
                }
            ],
            headerTitle: { type: String, default: 'Catálogo Online' },
            headerSubtitle: { type: String, default: 'Encuentra los mejores productos' },
            hideLogo: { type: Boolean, default: true },
            hideBusinessName: { type: Boolean, default: true },
            hideSocialLinks: { type: Boolean, default: true },
            footerText: { type: String, default: '© Catálogo Online' },
            shareImage: { type: String, default: '' },
            primaryColor: { type: String, default: '#25D366' },
            buttonText: { type: String, default: 'Pedir por WhatsApp' },
            buttonSubtext: { type: String, default: '¡Hazlo realidad!' },
            ctaText: { type: String, default: 'Hacer mi pedido ahora' },
            badgeText: { type: String, default: 'Diseño Disponible' },
            whatsappMessage: { type: String, default: '' },
            trustBadge1: { type: String, default: '✅ Respuesta en minutos' },
            trustBadge2: { type: String, default: '🔒 Pago seguro' },
            trustBadge3: { type: String, default: '🚚 Envío rápido' },
            step1Title: { type: String, default: 'Captura el diseño' },
            step1Desc: { type: String, default: 'Navega por el catálogo y toma captura del diseño que más te guste.' },
            step2Title: { type: String, default: 'Dinos cuánto' },
            step2Desc: { type: String, default: 'Envíanos la cantidad y talla (si aplica). Atendemos desde 1 unidad.' },
            step3Title: { type: String, default: 'Espera el envío' },
            step3Desc: { type: String, default: 'Confirmamos tu pedido al instante y coordinamos la entrega rápida y segura.' },
            // Ticker / Cinta informativa revendedor
            tickerEnabled: { type: Boolean, default: false },
            tickerText: { type: String, default: '' },
            tickerBgColor: { type: String, default: '#0f172a' },
            tickerTextColor: { type: String, default: '#ffffff' },
            tickerSpeed: { type: String, enum: ['slow', 'normal', 'fast'], default: 'normal' },
            tickerDirection: { type: String, enum: ['left', 'right'], default: 'left' },
        },
        testimonialsConfig: {
            enabled: { type: Boolean, default: true },
            displayScope: { type: String, enum: ['all', 'custom'], default: 'all' },
            score: { type: String, default: '4.7' },
            totalReviewsText: { type: String, default: '+189 reseñas verificadas' },
            title: { type: String, default: 'Clientes felices en toda Venezuela' },
            items: [
                {
                    name: { type: String, default: '' },
                    city: { type: String, default: '' },
                    text: { type: String, default: '' },
                    rating: { type: Number, default: 5 },
                    verified: { type: Boolean, default: true }
                }
            ]
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
TenantSchema.index({ 'resellerConfig.slug': 1 }, { sparse: true });
TenantSchema.index({ 'resellerConfig.resellers.slug': 1 }, { sparse: true });

export default mongoose.models.Tenant ||
    mongoose.model<ITenant>('Tenant', TenantSchema);
