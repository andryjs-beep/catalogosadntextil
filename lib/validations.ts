/**
 * Schemas de validación con Zod
 * Reutilizables en formularios y API routes
 */
import { z } from 'zod';

// ============ PRODUCTOS ============
export const productSchema = z.object({
    name: z
        .string()
        .min(1, 'El nombre es requerido')
        .max(200, 'El nombre no puede exceder 200 caracteres'),
    description: z.string().max(2000).default(''),
    images: z.array(z.string().url('URL de imagen inválida')).default([]),
    tags: z.array(z.string()).default([]),
});

export type ProductInput = z.infer<typeof productSchema>;

// ============ COLECCIONES ============
export const collectionSchema = z.object({
    slug: z
        .string()
        .min(1, 'El slug es requerido')
        .max(50, 'El slug no puede exceder 50 caracteres')
        .regex(
            /^[a-z0-9-]+$/,
            'El slug solo puede contener letras minúsculas, números y guiones'
        ),
    name: z
        .string()
        .min(1, 'El nombre es requerido')
        .max(100, 'El nombre no puede exceder 100 caracteres'),
    coverImage: z.string().default(''),
    productIds: z.array(z.string()).default([]),
    order: z.number().int().min(0).default(0),
});

export type CollectionInput = z.infer<typeof collectionSchema>;

// ============ TENANTS ============
export const brandingSchema = z.object({
    logo: z.string().default(''),
    favicon: z.string().default(''),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido').default('#3b82f6'),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido').default('#1e40af'),
    accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hex inválido').default('#f59e0b'),
    fontFamily: z.string().default('Inter'),
});

export const socialLinksSchema = z.object({
    instagram: z.string().default(''),
    facebook: z.string().default(''),
    tiktok: z.string().default(''),
    whatsappLink: z.string().default(''),
    address: z.string().default(''),
    googleMapsLink: z.string().default(''),
    locationImage: z.string().default(''),
});

export const globalTextsSchema = z.object({
    headerText: z.string().max(200).default(''),
    footerText: z.string().max(500).default(''),
    ctaButtonText: z.string().max(50).default('Consultar por WhatsApp'),
});

export const businessInfoSchema = z.object({
    businessName: z.string().default(''),
    niche: z.string().default(''),
    usp: z.string().default(''),
    tone: z.enum(['profesional', 'casual', 'juvenil', 'persuasivo']).default('profesional'),
});

export const tenantSchema = z.object({
    slug: z
        .string()
        .min(1, 'El slug es requerido')
        .max(50, 'El slug no puede exceder 50 caracteres')
        .regex(
            /^[a-z0-9-]+$/,
            'El slug solo puede contener letras minúsculas, números y guiones'
        ),
    branding: brandingSchema.default({}),
    socialLinks: socialLinksSchema.default({}),
    globalTexts: globalTextsSchema.default({}),
    businessInfo: businessInfoSchema.default({}),
    isActive: z.boolean().default(true),
});

export type TenantInput = z.infer<typeof tenantSchema>;
export type BrandingInput = z.infer<typeof brandingSchema>;
export type SocialLinksInput = z.infer<typeof socialLinksSchema>;
export type GlobalTextsInput = z.infer<typeof globalTextsSchema>;

// ============ LANDING PAGE SECTIONS ============
export const landingPageSectionsSchema = z.object({
    hero: z.object({
        headline: z.string().default(''),
        subheadline: z.string().default(''),
        ctaText: z.string().default('Ver Catálogo'),
        heroImage: z.string().default(''),
        videoUrl: z.string().default(''),
    }),
    benefits: z.object({
        items: z.array(z.object({
            icon: z.string(),
            title: z.string(),
            description: z.string(),
        })).default([]),
    }),
    howItWorks: z.object({
        steps: z.array(z.object({
            number: z.number(),
            title: z.string(),
            description: z.string(),
            image: z.string(),
        })).default([]),
    }),
    socialProof: z.object({
        stats: z.array(z.object({ number: z.string(), label: z.string() })).default([]),
        testimonials: z.array(z.object({
            name: z.string(),
            role: z.string(),
            text: z.string(),
            avatar: z.string(),
            rating: z.number(),
        })).default([]),
        logos: z.array(z.string()).default([]),
    }),
    faq: z.array(z.object({
        question: z.string(),
        answer: z.string(),
    })).default([]),
    finalCTA: z.object({
        headline: z.string().default(''),
        description: z.string().default(''),
        ctaText: z.string().default('Contactar Ahora'),
    }),
});

// ============ ASIGNACIÓN COLECCIONES ============
export const tenantCollectionSchema = z.object({
    collectionId: z.string().min(1, 'El ID de colección es requerido'),
    persuasiveTextTop: z.string().max(500).default(''),
    persuasiveTextBottom: z.string().max(500).default(''),
    ctaButtonText: z.string().max(50).default(''),
    isPublished: z.boolean().default(false),
    order: z.number().int().min(0).default(0),
    useLandingLayout: z.boolean().default(false),
    landingPageSections: landingPageSectionsSchema.optional(),
});

export type TenantCollectionInput = z.infer<typeof tenantCollectionSchema>;

// ============ PERSONALIZACIÓN PRODUCTOS ============
export const tenantProductSchema = z.object({
    productId: z.string().min(1, 'El ID de producto es requerido'),
    customTitle: z.string().max(200).default(''),
    customName: z.string().max(200).default(''),
    customPrice: z.string().max(50).default(''),
    customDescription: z.string().max(5000).default(''),
    galleryMode: z.enum(['album', 'slider-auto', 'slider-manual']).default('album'),
    sliderSpeed: z.number().int().min(1).max(30).default(3),
    ctaText: z.string().max(100).default(''),
    ctaSubtext: z.string().max(200).default(''),
    footerNote: z.string().max(500).default(''),
    showLocation: z.boolean().default(true),
});

export type TenantProductInput = z.infer<typeof tenantProductSchema>;

// ============ USUARIOS ============
export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
});

export const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    name: z.string().min(1, 'El nombre es requerido').max(100),
    role: z.enum(['super-admin', 'client-admin']),
    tenantId: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;

// ============ ANALYTICS ============
export const trackEventSchema = z.object({
    tenantId: z.string().min(1, 'El tenantId es requerido'),
    type: z.enum(['collection_view', 'product_view', 'whatsapp_click']),
    collectionId: z.string().optional(),
    productId: z.string().optional(),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>;
