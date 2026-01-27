/**
 * Componente de tracking de analytics en cliente
 */
'use client';

import { useEffect } from 'react';

interface AnalyticsTrackerProps {
    tenantId: string;
    type: 'collection_view' | 'product_view';
    collectionId?: string;
    productId?: string;
}

export function AnalyticsTracker({
    tenantId,
    type,
    collectionId,
    productId,
}: AnalyticsTrackerProps) {
    useEffect(() => {
        // Registrar evento sin bloquear renderizado
        const trackEvent = async () => {
            try {
                await fetch('/api/analytics/track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        tenantId,
                        type,
                        collectionId,
                        productId,
                    }),
                });
            } catch {
                // Ignorar errores de tracking
            }
        };

        trackEvent();
    }, [tenantId, type, collectionId, productId]);

    return null;
}
