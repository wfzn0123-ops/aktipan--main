import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';
import { UserModel, AuditLogModel } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aktipan_super_secret_jwt_key_2026_production_grade';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export async function register(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, email, phone, password, role, location, whatsapp } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi.' });
      return;
    }

    if (!email || !email.trim() || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'Alamat email yang valid wajib diisi.' });
      return;
    }

    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password harus memiliki minimal 6 karakter.' });
      return;
    }

    // Check if email already registered
    const existingUser = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        message: 'Alamat email ini sudah terdaftar. Silakan gunakan email lain atau langsung masuk.'
      });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const validRole: UserRole = ['Trainer', 'MC / Host', 'Fasilitator', 'HR / L&D', 'Guru / Dosen', 'EO', 'Admin'].includes(role)
      ? role
      : 'Trainer';

    const newUser = await UserModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: validRole,
      location: location ? location.trim() : 'Indonesia',
      whatsapp: whatsapp ? whatsapp.trim() : (phone ? phone.trim() : ''),
      photoUrl: '',
      isActive: true
    });

    // Audit log
    await AuditLogModel.create({
      action: 'USER_REGISTER',
      details: `Pendaftaran akun baru: ${newUser.name} (${newUser.email}) - Peran: ${newUser.role}`,
      userId: newUser.id,
      userName: newUser.name,
      ipAddress: req.ip
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    // Remove password from response
    const userSafe = newUser.toJSON();
    delete userSafe.password;

    // Set cookie for browser session support
    res.cookie('aktipan_auth_token', token, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({
      success: true,
      message: 'Pendaftaran akun berhasil! Selamat datang di Aktipan Workspace.',
      token,
      user: userSafe
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat memproses pendaftaran.',
      error: error.message
    });
  }
}

export async function login(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email dan password wajib diisi.' });
      return;
    }

    const user = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Kombinasi email atau password salah. Pastikan data akun Anda benar.'
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: 'Akun Anda sedang dinonaktifkan oleh administrator. Silakan hubungi tim support.'
      });
      return;
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Kombinasi email atau password salah. Pastikan data akun Anda benar.'
      });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    // Audit log
    await AuditLogModel.create({
      action: 'USER_LOGIN',
      details: `Login sukses: ${user.name} (${user.email}) - Peran: ${user.role}`,
      userId: user.id,
      userName: user.name,
      ipAddress: req.ip
    });

    // Remove password from response
    const userSafe = user.toJSON();
    delete userSafe.password;

    // Set cookie for browser session support
    res.cookie('aktipan_auth_token', token, {
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      message: `Selamat datang kembali, ${user.name}!`,
      token,
      user: userSafe
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat memproses login.',
      error: error.message
    });
  }
}

export async function getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
      return;
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Data pengguna tidak ditemukan.' });
      return;
    }

    const userSafe = user.toJSON();
    delete userSafe.password;

    res.status(200).json({
      success: true,
      user: userSafe
    });
  } catch (error: any) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data profil.', error: error.message });
  }
}

export async function logout(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (req.user) {
      await AuditLogModel.create({
        action: 'USER_LOGOUT',
        details: `Logout sukses: ${req.user.name}`,
        userId: req.user.userId,
        userName: req.user.name,
        ipAddress: req.ip
      });
    }
    res.clearCookie('aktipan_auth_token', { path: '/' });
    res.clearCookie('aktipan_token', { path: '/' });
    res.status(200).json({
      success: true,
      message: 'Berhasil keluar dari akun (Logout).'
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Terjadi kesalahan saat logout.' });
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
      return;
    }

    const { name, phone, role, photoUrl, location, whatsapp } = req.body;
    const updates: any = {};

    if (name && name.trim()) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone.trim();
    if (photoUrl !== undefined) updates.photoUrl = photoUrl;
    if (location !== undefined) updates.location = location;
    if (whatsapp !== undefined) updates.whatsapp = whatsapp;

    // Allow user to change role
    if (role && ['Trainer', 'MC / Host', 'Fasilitator', 'HR / L&D', 'Guru / Dosen', 'EO', 'Admin'].includes(role)) {
      if (role === 'Admin' && req.user.role !== 'Admin') {
        // Non-admins cannot self-promote to Admin via general profile update
      } else {
        updates.role = role as UserRole;
      }
    }

    const updatedUser = await UserModel.findByIdAndUpdate(req.user.userId, updates, { new: true });
    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      return;
    }

    await AuditLogModel.create({
      action: 'USER_UPDATE_PROFILE',
      details: `Pembaruan profil pengguna: ${updatedUser.name}`,
      userId: updatedUser.id,
      userName: updatedUser.name,
      ipAddress: req.ip
    });

    const userSafe = updatedUser.toJSON();
    delete userSafe.password;

    res.status(200).json({
      success: true,
      message: 'Profil berhasil diperbarui.',
      user: userSafe
    });
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui profil.', error: error.message });
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
      return;
    }

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Password lama dan baru wajib diisi.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'Password baru minimal 6 karakter.' });
      return;
    }

    const user = await UserModel.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password || '');
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Password lama tidak sesuai.' });
      return;
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    await AuditLogModel.create({
      action: 'PASSWORD_CHANGED',
      details: `Password diubah oleh user: ${user.name}`,
      userId: user.id,
      userName: user.name,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: 'Password berhasil diperbarui.'
    });
  } catch (error: any) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah password.', error: error.message });
  }
}
