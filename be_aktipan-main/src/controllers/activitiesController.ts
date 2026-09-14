import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { ActivityModel, SavedActivityModel, AuditLogModel } from '../models/index.js';

export async function getActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { q, category, energy, format, is_free } = req.query;
    const filter: any = {};

    if (q && typeof q === 'string') {
      filter.$or = [
        { activity_name: { $regex: q, $options: 'i' } },
        { short_description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { tools_needed: { $regex: q, $options: 'i' } }
      ];
    }
    if (category && typeof category === 'string' && category !== 'Semua') {
      filter.category = { $regex: category, $options: 'i' };
    }
    if (energy && typeof energy === 'string' && energy !== 'Semua') {
      filter.energy_level = { $regex: energy, $options: 'i' };
    }
    if (format && typeof format === 'string' && format !== 'Semua') {
      filter.format = { $regex: format, $options: 'i' };
    }
    if (is_free !== undefined && is_free !== '') {
      filter.is_free = is_free === 'true' || is_free === '1';
    }

    const activities = await ActivityModel.find(filter).lean();

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error: any) {
    console.error('getActivities error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat daftar aktivitas.', error: error.message });
  }
}

export async function getActivityById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID aktivitas tidak valid.' });
      return;
    }

    const activity = await ActivityModel.findOne({ id }).lean();
    if (!activity) {
      res.status(404).json({ success: false, message: 'Aktivitas tidak ditemukan.' });
      return;
    }

    res.status(200).json({ success: true, activity });
  } catch (error: any) {
    console.error('getActivityById error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat aktivitas.', error: error.message });
  }
}

export async function createActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Anda harus login untuk membuat aktivitas.' });
      return;
    }

    const body = req.body;
    if (!body.activity_name || !body.category) {
      res.status(400).json({ success: false, message: 'Nama aktivitas dan kategori wajib diisi.' });
      return;
    }

    const maxActivity = await ActivityModel.findOne().sort({ id: -1 }).lean() as any;
    const nextId = (maxActivity?.id || 0) + 1;

    const created = await ActivityModel.create({
      id: nextId,
      activity_number: `ACT-CUSTOM-${Date.now().toString().slice(-4)}`,
      activity_name: body.activity_name.trim(),
      category: body.category || 'Ice Breaking',
      short_description: body.short_description || body.activity_name,
      long_description: body.long_description || body.short_description || body.activity_name,
      objective: body.objective || 'Membangun keakraban dan sinergi tim',
      main_goal: body.main_goal || 'Tujuan aktivitas tercapai secara interaktif',
      suitable_for: body.suitable_for || ['Trainer', 'MC / Host', 'Fasilitator'],
      suitable_event_filter: body.suitable_event_filter || ['Corporate Training', 'Team Building'],
      participant_min: Number(body.participant_min) || 5,
      participant_max: Number(body.participant_max) || 100,
      duration_min: Number(body.duration_min) || 10,
      duration_max: Number(body.duration_max) || 20,
      format: body.format || 'Offline',
      indoor_outdoor: body.indoor_outdoor || 'Indoor',
      energy_level: body.energy_level || 'Medium',
      difficulty_level: body.difficulty_level || 'Easy',
      tools_needed: Array.isArray(body.tools_needed) ? body.tools_needed : [body.tools_needed || 'Tanpa Alat'],
      step_by_step: Array.isArray(body.step_by_step) ? body.step_by_step : [
        'Briefing pembukaan aktivitas oleh fasilitator.',
        'Membagi kelompok atau mengatur posisi peserta.',
        'Memulai aktivitas game dan mencatat hasil.',
        'Sesi refleksi atau penutup.'
      ],
      mc_script: body.mc_script || `"Ayo kita mulai game '${body.activity_name}'!"`,
      debrief_questions: Array.isArray(body.debrief_questions) ? body.debrief_questions : ['Apa pembelajaran utama dari game ini?'],
      variations: Array.isArray(body.variations) ? body.variations : ['Versi 5 menit langsung tanpa alat'],
      risk_notes: body.risk_notes || 'Pastikan area aman dan kondusif.',
      mitigation_tips: body.mitigation_tips || 'Fasilitator memberikan contoh jelas di awal.',
      professional_tips: body.professional_tips || 'Pertahankan antusiasme dan apresiasi peserta.',
      rating: 5.0,
      usage_count: 1,
      is_free: body.is_free !== undefined ? Boolean(body.is_free) : true,
      estimated_fun_level: Number(body.estimated_fun_level) || 5,
      estimated_impact_level: Number(body.estimated_impact_level) || 4,
      illustration_url: body.illustration_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&auto=format&fit=crop&q=60',
      created_by: req.user.userId
    });

    await AuditLogModel.create({
      action: 'CREATE_ACTIVITY',
      details: `Aktivitas baru dibuat: ${created.activity_name} (ID: ${created.id})`,
      userId: req.user.userId,
      userName: req.user.name,
      ipAddress: req.ip
    });

    res.status(201).json({
      success: true,
      message: 'Aktivitas baru berhasil disimpan ke database!',
      activity: created
    });
  } catch (error: any) {
    console.error('createActivity error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat aktivitas.', error: error.message });
  }
}

export async function updateActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
      return;
    }

    const id = parseInt(req.params.id, 10);
    const existing = await ActivityModel.findOne({ id }).lean() as any;
    if (!existing) {
      res.status(404).json({ success: false, message: 'Aktivitas tidak ditemukan.' });
      return;
    }

    if (req.user.role !== 'Admin' && existing.created_by !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki hak untuk mengubah aktivitas ini.' });
      return;
    }

    const updated = await ActivityModel.findOneAndUpdate({ id }, req.body, { new: true }).lean();

    await AuditLogModel.create({
      action: 'UPDATE_ACTIVITY',
      details: `Aktivitas diubah: ${existing.activity_name} (ID: ${id})`,
      userId: req.user.userId,
      userName: req.user.name,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Aktivitas berhasil diperbarui.', activity: updated });
  } catch (error: any) {
    console.error('updateActivity error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui aktivitas.', error: error.message });
  }
}

export async function deleteActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
      return;
    }

    const id = parseInt(req.params.id, 10);
    const existing = await ActivityModel.findOne({ id }).lean() as any;
    if (!existing) {
      res.status(404).json({ success: false, message: 'Aktivitas tidak ditemukan.' });
      return;
    }

    if (req.user.role !== 'Admin' && existing.created_by !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki hak untuk menghapus aktivitas ini.' });
      return;
    }

    await ActivityModel.deleteOne({ id });

    await AuditLogModel.create({
      action: 'DELETE_ACTIVITY',
      details: `Aktivitas dihapus: ${existing.activity_name} (ID: ${id})`,
      userId: req.user.userId,
      userName: req.user.name,
      ipAddress: req.ip
    });

    res.status(200).json({ success: true, message: 'Aktivitas berhasil dihapus.' });
  } catch (error: any) {
    console.error('deleteActivity error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus aktivitas.', error: error.message });
  }
}

export async function getSavedActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
      return;
    }

    const savedDocs = await SavedActivityModel.find({ userId: req.user.userId }).lean() as any[];
    const savedIds = savedDocs.map((s: any) => s.activityId);
    const activities = savedIds.length > 0
      ? await ActivityModel.find({ id: { $in: savedIds } }).lean()
      : [];

    res.status(200).json({ success: true, savedIds, activities });
  } catch (error: any) {
    console.error('getSavedActivities error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat koleksi tersimpan.', error: error.message });
  }
}

export async function toggleSaveActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
      return;
    }

    const activityId = parseInt(req.params.id, 10);
    if (isNaN(activityId)) {
      res.status(400).json({ success: false, message: 'ID aktivitas tidak valid.' });
      return;
    }

    const existing = await SavedActivityModel.findOne({ userId: req.user.userId, activityId });
    let isSaved: boolean;

    if (existing) {
      await SavedActivityModel.deleteOne({ _id: existing._id });
      isSaved = false;
    } else {
      await SavedActivityModel.create({ userId: req.user.userId, activityId });
      isSaved = true;
    }

    const savedDocs = await SavedActivityModel.find({ userId: req.user.userId }).lean() as any[];
    const savedIds = savedDocs.map((s: any) => s.activityId);

    res.status(200).json({
      success: true,
      isSaved,
      savedIds,
      message: isSaved ? 'Aktivitas ditambahkan ke koleksi.' : 'Aktivitas dihapus dari koleksi.'
    });
  } catch (error: any) {
    console.error('toggleSaveActivity error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status koleksi.', error: error.message });
  }
}


export async function getActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const { q, category, energy, format, is_free } = req.query;
    let activities = db.getActivities();

    if (q && typeof q === 'string') {
      const query = q.toLowerCase();
      activities = activities.filter(
        a => a.activity_name.toLowerCase().includes(query) ||
             a.short_description.toLowerCase().includes(query) ||
             a.category.toLowerCase().includes(query) ||
             (a.tools_needed && a.tools_needed.some(t => t.toLowerCase().includes(query)))
      );
    }

    if (category && typeof category === 'string' && category !== 'Semua') {
      activities = activities.filter(a => a.category.toLowerCase() === category.toLowerCase());
    }

    if (energy && typeof energy === 'string' && energy !== 'Semua') {
      activities = activities.filter(a => a.energy_level.toLowerCase() === energy.toLowerCase());
    }

    if (format && typeof format === 'string' && format !== 'Semua') {
      activities = activities.filter(a => a.format.toLowerCase() === format.toLowerCase());
    }

    if (is_free !== undefined && is_free !== '') {
      const isFreeBool = is_free === 'true' || is_free === '1';
      activities = activities.filter(a => a.is_free === isFreeBool);
    }

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error: any) {
    console.error('getActivities error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat daftar aktivitas.', error: error.message });
  }
}

export async function getActivityById(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'ID aktivitas tidak valid.' });
      return;
    }

    const activity = db.getActivityById(id);
    if (!activity) {
      res.status(404).json({ success: false, message: 'Aktivitas tidak ditemukan.' });
      return;
    }

    res.status(200).json({
      success: true,
      activity
    });
  } catch (error: any) {
    console.error('getActivityById error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat aktivitas.', error: error.message });
  }
}

export async function createActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Anda harus login untuk membuat aktivitas.' });
      return;
    }

    const body = req.body;
    if (!body.activity_name || !body.category) {
      res.status(400).json({ success: false, message: 'Nama aktivitas dan kategori wajib diisi.' });
      return;
    }

    const newActivity: Activity = {
      id: 0, // will be autoincremented in db.insertActivity
      activity_number: `ACT-CUSTOM-${Date.now().toString().slice(-4)}`,
      activity_name: body.activity_name.trim(),
      category: body.category || 'Ice Breaking',
      short_description: body.short_description || body.activity_name,
      long_description: body.long_description || body.short_description || body.activity_name,
      objective: body.objective || 'Membangun keakraban dan sinergi tim',
      main_goal: body.main_goal || 'Tujuan aktivitas tercapai secara interaktif',
      suitable_for: body.suitable_for || ['Trainer', 'MC / Host', 'Fasilitator'],
      suitable_event_filter: body.suitable_event_filter || ['Corporate Training', 'Team Building'],
      participant_min: Number(body.participant_min) || 5,
      participant_max: Number(body.participant_max) || 100,
      duration_min: Number(body.duration_min) || 10,
      duration_max: Number(body.duration_max) || 20,
      format: body.format || 'Offline',
      indoor_outdoor: body.indoor_outdoor || 'Indoor',
      energy_level: body.energy_level || 'Medium',
      difficulty_level: body.difficulty_level || 'Easy',
      tools_needed: Array.isArray(body.tools_needed) ? body.tools_needed : [body.tools_needed || 'Tanpa Alat'],
      step_by_step: Array.isArray(body.step_by_step) ? body.step_by_step : [
        'Briefing pembukaan aktivitas oleh fasilitator.',
        'Membagi kelompok atau mengatur posisi peserta.',
        'Memulai aktivitas game dan mencatat hasil.',
        'Sesi refleksi atau penutup.'
      ],
      mc_script: body.mc_script || `"Ayo kita mulai game '${body.activity_name}'!"`,
      debrief_questions: Array.isArray(body.debrief_questions) ? body.debrief_questions : ['Apa pembelajaran utama dari game ini?'],
      variations: Array.isArray(body.variations) ? body.variations : ['Versi 5 menit langsung tanpa alat'],
      risk_notes: body.risk_notes || 'Pastikan area aman dan kondusif.',
      mitigation_tips: body.mitigation_tips || 'Fasilitator memberikan contoh jelas di awal.',
      professional_tips: body.professional_tips || 'Pertahankan antusiasme dan apresiasi peserta.',
      rating: 5.0,
      usage_count: 1,
      is_free: body.is_free !== undefined ? Boolean(body.is_free) : true,
      estimated_fun_level: Number(body.estimated_fun_level) || 5,
      estimated_impact_level: Number(body.estimated_impact_level) || 4,
      illustration_url: body.illustration_url || 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&auto=format&fit=crop&q=60',
      created_by: req.user.userId,
      created_at: new Date().toISOString()
    };

    const created = db.insertActivity(newActivity);

    db.insertAuditLog('CREATE_ACTIVITY', `Aktivitas baru dibuat: ${created.activity_name} (ID: ${created.id})`, req.user.userId, req.user.name, req.ip);

    res.status(201).json({
      success: true,
      message: 'Aktivitas baru berhasil disimpan ke database!',
      activity: created
    });
  } catch (error: any) {
    console.error('createActivity error:', error);
    res.status(500).json({ success: false, message: 'Gagal membuat aktivitas.', error: error.message });
  }
}

export async function updateActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
      return;
    }

    const id = parseInt(req.params.id, 10);
    const existing = db.getActivityById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Aktivitas tidak ditemukan.' });
      return;
    }

    // Only Admin or the creator can update
    if (req.user.role !== 'Admin' && existing.created_by !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki hak untuk mengubah aktivitas ini.' });
      return;
    }

    const updated = db.updateActivity(id, req.body);

    db.insertAuditLog('UPDATE_ACTIVITY', `Aktivitas diubah: ${existing.activity_name} (ID: ${id})`, req.user.userId, req.user.name, req.ip);

    res.status(200).json({
      success: true,
      message: 'Aktivitas berhasil diperbarui.',
      activity: updated
    });
  } catch (error: any) {
    console.error('updateActivity error:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui aktivitas.', error: error.message });
  }
}

export async function deleteActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Tidak terautentikasi.' });
      return;
    }

    const id = parseInt(req.params.id, 10);
    const existing = db.getActivityById(id);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Aktivitas tidak ditemukan.' });
      return;
    }

    // Only Admin or the creator can delete
    if (req.user.role !== 'Admin' && existing.created_by !== req.user.userId) {
      res.status(403).json({ success: false, message: 'Anda tidak memiliki hak untuk menghapus aktivitas ini.' });
      return;
    }

    db.deleteActivity(id);

    db.insertAuditLog('DELETE_ACTIVITY', `Aktivitas dihapus: ${existing.activity_name} (ID: ${id})`, req.user.userId, req.user.name, req.ip);

    res.status(200).json({
      success: true,
      message: 'Aktivitas berhasil dihapus.'
    });
  } catch (error: any) {
    console.error('deleteActivity error:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus aktivitas.', error: error.message });
  }
}

export async function getSavedActivities(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
      return;
    }

    const savedIds = db.getSavedActivities(req.user.userId);
    const allActivities = db.getActivities();
    const savedList = allActivities.filter(a => savedIds.includes(a.id));

    res.status(200).json({
      success: true,
      savedIds,
      activities: savedList
    });
  } catch (error: any) {
    console.error('getSavedActivities error:', error);
    res.status(500).json({ success: false, message: 'Gagal memuat koleksi tersimpan.', error: error.message });
  }
}

export async function toggleSaveActivity(req: AuthenticatedRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Harap login terlebih dahulu.' });
      return;
    }

    const activityId = parseInt(req.params.id, 10);
    if (isNaN(activityId)) {
      res.status(400).json({ success: false, message: 'ID aktivitas tidak valid.' });
      return;
    }

    const result = db.toggleSaveActivity(req.user.userId, activityId);

    res.status(200).json({
      success: true,
      isSaved: result.isSaved,
      savedIds: result.savedIds,
      message: result.isSaved ? 'Aktivitas ditambahkan ke koleksi.' : 'Aktivitas dihapus dari koleksi.'
    });
  } catch (error: any) {
    console.error('toggleSaveActivity error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengubah status koleksi.', error: error.message });
  }
}
