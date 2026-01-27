/**
 * API Route: Tenants (Super-Admin)
 * GET /api/admin/tenants - Listar tenants
 * POST /api/admin/tenants - Crear tenant con usuario
 */
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Tenant, User } from '@/lib/models';
import { requireSuperAdmin, hashPassword } from '@/lib/auth';
import { tenantSchema, createUserSchema } from '@/lib/validations';
import { z } from 'zod';

// Schema para crear tenant con usuario
const createTenantSchema = tenantSchema.extend({
    adminEmail: z.string().email('Email inválido'),
    adminPassword: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    adminName: z.string().min(1, 'El nombre es requerido'),
});

// GET: Listar tenants
export async function GET(request: NextRequest) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const includeInactive = searchParams.get('includeInactive') === 'true';

        const skip = (page - 1) * limit;
        const query = includeInactive ? {} : { isActive: true };

        const [tenants, total] = await Promise.all([
            Tenant.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Tenant.countDocuments(query),
        ]);

        return NextResponse.json({
            tenants,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error listando tenants:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al obtener tenants' },
            { status: 500 }
        );
    }
}

// POST: Crear tenant con usuario administrador
export async function POST(request: NextRequest) {
    try {
        await requireSuperAdmin();
        await dbConnect();

        const body = await request.json();

        // Validar entrada
        const result = createTenantSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { adminEmail, adminPassword, adminName, ...tenantData } = result.data;

        // Verificar slug único
        const existingTenant = await Tenant.findOne({ slug: tenantData.slug });
        if (existingTenant) {
            return NextResponse.json(
                { error: 'Ya existe un tenant con ese slug' },
                { status: 400 }
            );
        }

        // Verificar email único
        const existingUser = await User.findOne({ email: adminEmail.toLowerCase() });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Ya existe un usuario con ese email' },
                { status: 400 }
            );
        }

        // Crear tenant
        const tenant = await Tenant.create(tenantData);

        // --- AUTOMATIZACIÓN DE DOMINIO EN VERCEL ---
        const vercelToken = process.env.VERCEL_TOKEN;
        const vercelProjectId = process.env.VERCEL_PROJECT_ID;
        const vercelTeamId = process.env.VERCEL_TEAM_ID;
        const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'catalogo.dpdns.org';

        if (vercelToken && vercelProjectId) {
            try {
                const domainName = `${tenant.slug}.${baseDomain}`;
                console.log(`Intentando registrar dominio en Vercel: ${domainName}`);

                const response = await fetch(
                    `https://api.vercel.com/v9/projects/${vercelProjectId}/domains${vercelTeamId ? `?teamId=${vercelTeamId}` : ''}`,
                    {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${vercelToken}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ name: domainName }),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error de API Vercel:', errorData);
                    // No bloqueamos la creación del tenant si falla Vercel, pero lo logueamos
                } else {
                    console.log(`Dominio ${domainName} registrado con éxito en Vercel`);
                }
            } catch (vError) {
                console.error('Error llamando a API Vercel:', vError);
            }
        } else {
            console.warn('Faltan variables de entorno de Vercel para automatización de dominios');
        }
        // -------------------------------------------

        // Crear usuario admin para el tenant
        const hashedPassword = await hashPassword(adminPassword);
        const user = await User.create({
            email: adminEmail.toLowerCase(),
            password: hashedPassword,
            name: adminName,
            role: 'client-admin',
            tenantId: tenant._id,
        });

        return NextResponse.json({
            tenant,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Error creando tenant:', error);
        if ((error as Error).message.includes('Acceso denegado')) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }
        return NextResponse.json(
            { error: 'Error al crear tenant' },
            { status: 500 }
        );
    }
}
