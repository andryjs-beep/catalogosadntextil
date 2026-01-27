/**
 * Índice de modelos Mongoose
 * Facilita la importación de todos los modelos desde un solo punto
 */
export { default as Product, type IProduct } from './Product';
export { default as Collection, type ICollection } from './Collection';
export { default as Tenant, type ITenant, type IBranding, type ISocialLinks, type IGlobalTexts } from './Tenant';
export { default as TenantCollection, type ITenantCollection } from './TenantCollection';
export { default as TenantProduct, type ITenantProduct } from './TenantProduct';
export { default as User, type IUser, type UserRole } from './User';
export { default as Analytics, type IAnalytics, type AnalyticsType } from './Analytics';
