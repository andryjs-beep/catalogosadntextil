import dbConnect from '@/lib/db';
import { Tenant } from '@/lib/models';
import type { ITenant, IResellerItem } from '@/lib/models/Tenant';

export interface ResellerContext {
    tenant: ITenant;
    activeReseller?: IResellerItem;
    whatsappNumber: string;
    resellerSlug: string;
}

/**
 * Busca el tenant y el revendedor activo correspondiente al slug.
 * Soporta tanto el slug principal de resellerConfig como slugs de la lista de revendedores.
 */
export async function getResellerContext(resellerSlug: string): Promise<ResellerContext | null> {
    await dbConnect();

    // 1. Buscar si coincide con un revendedor espec?fico dentro del array de resellers
    const tenantWithItem = await Tenant.findOne({
        'resellerConfig.enabled': true,
        'resellerConfig.resellers': {
            $elemMatch: {
                slug: resellerSlug,
                isActive: true,
            },
        },
        isActive: true,
    }).lean<ITenant>();

    if (tenantWithItem) {
        const item = tenantWithItem.resellerConfig?.resellers?.find(
            (r) => r.slug === resellerSlug && r.isActive
        );
        return {
            tenant: tenantWithItem,
            activeReseller: item,
            whatsappNumber: item?.whatsappNumber || tenantWithItem.resellerConfig?.whatsappNumber || '',
            resellerSlug,
        };
    }

    // 2. Si no es un revendedor espec?fico, buscar si coincide con el slug principal del tenant
    const tenantMain = await Tenant.findOne({
        'resellerConfig.slug': resellerSlug,
        'resellerConfig.enabled': true,
        isActive: true,
    }).lean<ITenant>();

    if (tenantMain) {
        return {
            tenant: tenantMain,
            whatsappNumber: tenantMain.resellerConfig?.whatsappNumber || '',
            resellerSlug,
        };
    }

    return null;
}
