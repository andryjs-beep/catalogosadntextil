import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant, User, TenantCollection, Collection } from '@/lib/models';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();
        await dbConnect();

        const debug: any = {
            session,
            dbState: mongoose.connection.readyState,
        };

        if (session.isAuthenticated && session.tenantId) {
            debug.tenantIdSearched = session.tenantId;

            const tc = await TenantCollection.find({ tenantId: session.tenantId }).lean();
            debug.tenantCollectionsCount = tc.length;
            debug.tenantCollections = tc;

            if (tc.length > 0) {
                const collIds = tc.map(t => t.collectionId);
                debug.collectionIds = collIds;

                const cols = await Collection.find({ _id: { $in: collIds } }).lean();
                debug.collectionsFound = cols.length;
                debug.collections = cols;
            }
        }

        return NextResponse.json(debug);
    } catch (error: any) {
        return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 });
    }
}

import mongoose from 'mongoose';
