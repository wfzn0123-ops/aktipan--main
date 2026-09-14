import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ActivityPackModel, AuditLogModel } from '../models/index.js';

export async function getPacks(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const packs = await ActivityPackModel.find().lean();
    res.status(200).json({ success: true, count: packs.length, packs });
  } catch (error: any) {
    console.error('getPacks error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat paket aktivitas.', error: error.message });
  }
}

export async function createPack(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const body = req.body;
    if (!body.title || !body.description) {
      res.status(400).json({ success: false, message: 'Judul dan deskripsi paket wajib diisi.' });
      return;
    }

    const maxPack = await ActivityPackModel.findOne().sort({ id: -1 }).lean() as any;
    const nextId = (maxPack?.id || 0) + 1;

    const created = await ActivityPackModel.create({
      id: nextId,
      title: body.title,
      description: body.description,
      category: body.category || 'Custom',
      activityCount: Array.isArray(body.activities) ? body.activities.length : (body.activityCount || 5),
      price: body.price || 'Free',
      isPro: Boolean(body.isPro),
      activities: Array.isArray(body.activities) ? body.activities : [],
      highlights: Array.isArray(body.highlights) ? body.highlights : ['Paket Pilihan']
    });

    await AuditLogModel.create({
      action: 'CREATE_PACK',
      details: `Paket aktivitas baru dibuat: ${created.title}`,
      userId: req.user?.userId,
      userName: req.user?.name,
      ipAddress: req.ip
    });

    res.status(201).json({ success: true, message: 'Paket aktivitas berhasil dibuat.', pack: created });
  } catch (error: any) {
    console.error('createPack error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat paket aktivitas.', error: error.message });
  }
}

export async function updatePack(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await ActivityPackModel.findOne({ id }).lean() as any;
    if (!existing) {
      res.status(404).json({ success: false, message: 'Paket tidak ditemukan.' });
      return;
    }

    const updated = await ActivityPackModel.findOneAndUpdate({ id }, req.body, { new: true }).lean();

    await AuditLogModel.create({
      action: 'UPDATE_PACK',
      details: `Paket aktivitas diubah: ${existing.title} (ID: ${id})`,
      userId: req.user?.userId,
      userName: req.user?.name,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Paket berhasil diperbarui.', pack: updated });
  } catch (error: any) {
    console.error('updatePack error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui paket.', error: error.message });
  }
}

export async function deletePack(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const existing = await ActivityPackModel.findOne({ id }).lean() as any;
    if (!existing) {
      res.status(404).json({ success: false, message: 'Paket tidak ditemukan.' });
      return;
    }

    await ActivityPackModel.deleteOne({ id });

    await AuditLogModel.create({
      action: 'DELETE_PACK',
      details: `Paket aktivitas dihapus: ${existing.title} (ID: ${id})`,
      userId: req.user?.userId,
      userName: req.user?.name,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Paket berhasil dihapus.' });
  } catch (error: any) {
    console.error('deletePack error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus paket.', error: error.message });
  }
}

