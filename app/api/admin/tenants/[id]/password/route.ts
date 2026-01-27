import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/lib/models';
import { requireSuperAdmin, hashPassword } from '@/lib/auth';

/**
 * PATCH: Cambiar contraseña del admin de un tenant
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const { newPassword } = await request.json();

        if (!newPassword || newPassword.length < 8) {
            return NextResponse.json(
                { error: 'La contraseña debe tener al menos 8 caracteres' },
                { status: 400 }
            );
        }

        // Buscar el usuario admin del tenant
        const user = await User.findOne({ tenantId: params.id, role: 'client-admin' });
        if (!user) {
            return NextResponse.json({ error: 'Administrador no encontrado' }, { status: 404 });
        }

        // Hashear y actualizar
        user.password = await hashPassword(newPassword);
        await user.save();

        return NextResponse.json({ message: 'Contraseña actualizada con éxito' });
    } catch (error) {
        console.error('Error cambiando contraseña del tenant:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
