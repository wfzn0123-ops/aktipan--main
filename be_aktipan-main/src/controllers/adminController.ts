import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { UserRole } from '../types/index.js';
import { UserModel, ActivityModel, ActivityPackModel, SessionModel, AuditLogModel } from '../models/index.js';
import { resetSeedToDefaults } from '../database/seed.js';

export async function getStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const [users, activities, packs, sessions, auditLogs] = await Promise.all([
      UserModel.find().lean(),
      ActivityModel.find().lean(),
      ActivityPackModel.find().lean(),
      SessionModel.find().lean(),
      AuditLogModel.find().sort({ createdAt: -1 }).limit(10).lean()
    ]);

    const roleCounts: Record<string, number> = {
      Admin: 0, Trainer: 0, 'MC / Host': 0, Fasilitator: 0,
      'HR / L&D': 0, 'Guru / Dosen': 0, EO: 0
    };

    users.forEach((u: any) => {
      if (roleCounts[u.role] !== undefined) roleCounts[u.role]++;
      else roleCounts[u.role] = 1;
    });

    const activeUsersCount = users.filter((u: any) => u.isActive).length;
    const freeActivitiesCount = activities.filter((a: any) => a.is_free).length;

    res.status(200).json({
      success: true,
      stats: {
        totalUsers: users.length,
        activeUsers: activeUsersCount,
        totalActivities: activities.length,
        freeActivities: freeActivitiesCount,
        premiumActivities: activities.length - freeActivitiesCount,
        totalPacks: packs.length,
        totalSessions: sessions.length,
        roleDistribution: roleCounts,
        recentLogs: auditLogs,
        systemHealth: {
          status: 'HEALTHY',
          uptimeSeconds: Math.floor(process.uptime()),
          nodeVersion: process.version,
          memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          serverTime: new Date().toISOString()
        }
      }
    });
  } catch (error: any) {
    console.error('Admin getStats error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat statistik admin.', error: error.message });
  }
}

export async function getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { q, role, status } = req.query;
    const filter: any = {};

    if (q && typeof q === 'string') {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } }
      ];
    }
    if (role && typeof role === 'string' && role !== 'all') filter.role = role;
    if (status && typeof status === 'string' && status !== 'all') {
      filter.isActive = status === 'active';
    }

    const users = await UserModel.find(filter).select('-password').lean();

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error: any) {
    console.error('Admin getUsers error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat daftar pengguna.', error: error.message });
  }
}

export async function updateUserRole(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { role, isActive } = req.body;

    const updates: any = {};
    if (role) {
      const validRoles: UserRole[] = ['Admin', 'Trainer', 'MC / Host', 'Fasilitator', 'HR / L&D', 'Guru / Dosen', 'EO'];
      if (!validRoles.includes(role)) {
        res.status(400).json({ success: false, message: 'Peran tidak valid.' });
        return;
      }
      updates.role = role;
    }
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    const updatedUser = await UserModel.findByIdAndUpdate(id, updates, { new: true }).select('-password');
    if (!updatedUser) {
      res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      return;
    }

    await AuditLogModel.create({
      action: 'ADMIN_UPDATE_USER',
      details: `Admin ${req.user?.name} mengubah user ${updatedUser.name} (${updatedUser.email}): role=${updatedUser.role}, active=${updatedUser.isActive}`,
      userId: req.user?.userId,
      userName: req.user?.name,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Data pengguna ${updatedUser.name} berhasil diperbarui.`,
      user: updatedUser
    });
  } catch (error: any) {
    console.error('Admin updateUserRole error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui pengguna.', error: error.message });
  }
}

export async function deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    if (id === req.user?.userId) {
      res.status(400).json({
        success: false,
        message: 'Anda tidak dapat menghapus akun admin yang sedang Anda gunakan saat ini.'
      });
      return;
    }

    const targetUser = await UserModel.findByIdAndDelete(id);
    if (!targetUser) {
      res.status(404).json({ success: false, message: 'Pengguna tidak ditemukan.' });
      return;
    }

    await AuditLogModel.create({
      action: 'ADMIN_DELETE_USER',
      details: `Admin ${req.user?.name} menghapus user: ${targetUser.name} (${targetUser.email})`,
      userId: req.user?.userId,
      userName: req.user?.name,
      ipAddress: req.ip
    });

    res.status(200).json({
      success: true,
      message: `Pengguna ${targetUser.name} berhasil dihapus.`
    });
  } catch (error: any) {
    console.error('Admin deleteUser error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus pengguna.', error: error.message });
  }
}

export async function getAuditLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 100;
    const logs = await AuditLogModel.find().sort({ createdAt: -1 }).limit(limit).lean();

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error: any) {
    console.error('Admin getAuditLogs error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat audit log.', error: error.message });
  }
}

export async function createUser(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { name, email, phone, password, role, location, whatsapp } = req.body;

    if (!name || !name.trim()) {
      res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi.' });
      return;
    }
    if (!email || !email.trim() || !email.includes('@')) {
      res.status(400).json({ success: false, message: 'Email tidak valid.' });
      return;
    }
    if (!password || password.length < 6) {
      res.status(400).json({ success: false, message: 'Password minimal 6 karakter.' });
      return;
    }

    const existingUser = await UserModel.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Alamat email sudah terdaftar.' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const validRoles: UserRole[] = ['Admin', 'Trainer', 'MC / Host', 'Fasilitator', 'HR / L&D', 'Guru / Dosen', 'EO'];
    const assignedRole: UserRole = validRoles.includes(role) ? role : 'Trainer';

    const newUser = await UserModel.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      role: assignedRole,
      location: location ? location.trim() : 'Indonesia',
      whatsapp: whatsapp ? whatsapp.trim() : (phone ? phone.trim() : ''),
      photoUrl: '',
      isActive: true
    });

    await AuditLogModel.create({
      action: 'ADMIN_CREATE_USER',
      details: `Admin ${req.user?.name} membuat akun baru: ${newUser.name} (${newUser.email}) - Peran: ${newUser.role}`,
      userId: req.user?.userId,
      userName: req.user?.name,
      ipAddress: req.ip
    });

    const safeUser = newUser.toJSON();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: `Pengguna ${newUser.name} berhasil ditambahkan ke sistem.`,
      user: safeUser
    });
  } catch (error: any) {
    console.error('Admin createUser error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat pengguna baru.', error: error.message });
  }
}

export async function resetDatabaseSeed(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    await resetSeedToDefaults();
    await AuditLogModel.create({
      action: 'ADMIN_SEED_RESET',
      details: `Admin ${req.user?.name} me-reset database ke data awal standar.`,
      userId: req.user?.userId,
      userName: req.user?.name,
      ipAddress: req.ip
    });
    res.status(200).json({
      success: true,
      message: 'Database berhasil di-reset ke data bawaan awal (132 aktivitas, 10 paket, 3 akun).'
    });
  } catch (error: any) {
    console.error('Admin resetDatabaseSeed error:', error);
    res.status(500).json({ success: false, message: 'Gagal mereset database seed.', error: error.message });
  }
}

