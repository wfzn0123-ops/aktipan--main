import { Response } from 'express';
import { db } from '../database/db.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { Session } from '../types/index.js';

export async function getSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
      return;
    }

    // Admin can see all sessions or filtered, regular user sees their own sessions
    const sessions = req.user.role === 'Admin' && req.query.all === 'true'
      ? db.getSessions()
      : db.getSessions(req.user.userId);

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
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
    const session = db.getSessionById(id);

    if (!session) {
      res.status(404).json({ success: false, message: 'Sesi acara tidak ditemukan.' });
      return;
    }

    if (session.userId !== req.user.userId && req.user.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak.' });
      return;
    }

    res.status(200).json({
      success: true,
      session
    });
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

    const newSession: Session = {
      id: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: req.user.userId,
      name: name.trim(),
      date: date || new Date().toISOString().split('T')[0],
      context: context || 'Corporate Gathering',
      audience: audience || 'Peserta Umum',
      participantCount: Number(participantCount) || 30,
      activityIds: Array.isArray(activityIds) ? activityIds : [],
      notes: notes || '',
      status: status || 'Draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const created = db.insertSession(newSession);

    db.insertAuditLog('CREATE_SESSION', `Sesi acara dibuat: ${created.name}`, req.user.userId, req.user.name, req.ip);

    res.status(201).json({
      success: true,
      message: 'Sesi acara berhasil dibuat.',
      session: created
    });
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
    const existing = db.getSessionById(id);

    if (!existing) {
      res.status(404).json({ success: false, message: 'Sesi acara tidak ditemukan.' });
      return;
    }

    if (existing.userId !== req.user.userId && req.user.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak.' });
      return;
    }

    const updated = db.updateSession(id, req.body);

    res.status(200).json({
      success: true,
      message: 'Sesi acara berhasil diperbarui.',
      session: updated
    });
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
    const existing = db.getSessionById(id);

    if (!existing) {
      res.status(404).json({ success: false, message: 'Sesi acara tidak ditemukan.' });
      return;
    }

    if (existing.userId !== req.user.userId && req.user.role !== 'Admin') {
      res.status(403).json({ success: false, message: 'Akses ditolak.' });
      return;
    }

    db.deleteSession(id);

    res.status(200).json({
      success: true,
      message: 'Sesi acara berhasil dihapus.'
    });
  } catch (error: any) {
    console.error('deleteSession error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus sesi acara.', error: error.message });
  }
}
