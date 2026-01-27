/**
 * Modelo User - Usuarios para autenticación
 * Roles: super-admin (acceso total) o client-admin (solo su tenant)
 */
import mongoose, { Schema, Document } from 'mongoose';

export type UserRole = 'super-admin' | 'client-admin';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    email: string;
    password: string;
    role: UserRole;
    tenantId: mongoose.Types.ObjectId | null;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'El email es requerido'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [
                /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                'Por favor ingresa un email válido',
            ],
        },
        password: {
            type: String,
            required: [true, 'La contraseña es requerida'],
            minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
        },
        role: {
            type: String,
            enum: ['super-admin', 'client-admin'],
            required: [true, 'El rol es requerido'],
        },
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            default: null,
        },
        name: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            maxlength: [100, 'El nombre no puede exceder 100 caracteres'],
        },
    },
    {
        timestamps: true,
    }
);

// Validación: client-admin debe tener tenantId
UserSchema.pre('save', function (next) {
    if (this.role === 'client-admin' && !this.tenantId) {
        next(new Error('Los usuarios client-admin deben tener un tenantId asignado'));
    }
    if (this.role === 'super-admin' && this.tenantId) {
        this.tenantId = null; // Super-admin no tiene tenant
    }
    next();
});

// Índices
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ tenantId: 1 });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
