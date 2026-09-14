import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { SessionModel, AuditLogModel } from '../models/index.js';

export async function getSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
      return;
    }

    const filter = req.user.role === 'Admin' && req.query.all === 'true'
      ? {}
      : { userId: req.user.userId };

    const sessions = await SessionModel.find(filter).lean();

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error: any) {
    console.error('getSessions error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat sesi acara.', error: error.message });
  }
}

export async function getSessionById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
      return;
    }

    const { id } = req.params;
    const session = await SessionModel.findById(id).lean() as any;

    if (!session) {
      res.status(404).json({ success: false, message: 'Sesi acara tidak ditemukan.' });
      return;
    }

    if (session.userId !== req.user.userId && req.user.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak.' });
      return;
    }

    res.status(200).json({ success: true, session });
  } catch (error: any) {
    console.error('getSessionById error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat sesi acara.', error: error.message });
  }
}

export async function createSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
      return;
    }

    const { name, date, context, audience, participantCount, activityIds, notes, status } = req.body;

    if (!name) {
      res.status(400).json({ success: false, message: 'Nama sesi acara wajib diisi.' });
      return;
    }

    const created = await SessionModel.create({
      userId: req.user.userId,
      name: name.trim(),
      date: date || new Date().toISOString().split('T')[0],
      context: context || 'Corporate Gathering',
      audience: audience || 'Peserta Umum',
      participantCount: Number(participantCount) || 30,
      activityIds: Array.isArray(activityIds) ? activityIds : [],
      notes: notes || '',
      status: status || 'Draft'
    });

    await AuditLogModel.create({
      action: 'CREATE_SESSION',
      details: `Sesi acara dibuat: ${created.name}`,
      userId: req.user.userId,
      userName: req.user.name,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, message: 'Sesi acara berhasil dibuat.', session: created });
  } catch (error: any) {
    console.error('createSession error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat sesi acara.', error: error.message });
  }
}

export async function updateSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
      return;
    }

    const { id } = req.params;
    const existing = await SessionModel.findById(id).lean() as any;

    if (!existing) {
      res.status(404).json({ success: false, message: 'Sesi acara tidak ditemukan.' });
      return;
    }

    if (existing.userId !== req.user.userId && req.user.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak.' });
      return;
    }

    const updated = await SessionModel.findByIdAndUpdate(id, req.body, { new: true }).lean();

    res.status(200).json({ success: true, message: 'Sesi acara berhasil diperbarui.', session: updated });
  } catch (error: any) {
    console.error('updateSession error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui sesi acara.', error: error.message });
  }
}

export async function deleteSession(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
      return;
    }

    const { id } = req.params;
    const existing = await SessionModel.findById(id).lean() as any;

    if (!existing) {
      res.status(404).json({ success: false, message: 'Sesi acara tidak ditemukan.' });
      return;
    }

    if (existing.userId !== req.user.userId && req.user.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak.' });
      return;
    }

    await SessionModel.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Sesi acara berhasil dihapus.' });
  } catch (error: any) {
    console.error('deleteSession error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus sesi acara.', error: error.message });
  }
}



