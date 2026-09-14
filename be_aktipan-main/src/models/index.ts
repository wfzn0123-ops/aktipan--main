import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  password: { type: String, required: true },
  role: { type: String, required: true },
  photoUrl: String,
  location: String,
  whatsapp: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const activitySchema = new Schema({
  id: { type: Number, required: true, unique: true },
  activity_number: String,
  activity_name: { type: String, required: true },
  category: String,
  short_description: String,
  long_description: String,
  objective: String,
  main_goal: String,
  suitable_for: [String],
  suitable_event_filter: [String],
  participant_min: Number,
  participant_max: Number,
  duration_min: Number,
  duration_max: Number,
  format: String,
  indoor_outdoor: String,
  energy_level: String,
  difficulty_level: String,
  tools_needed: [String],
  step_by_step: [String],
  mc_script: String,
  debrief_questions: [String],
  variations: [String],
  risk_notes: String,
  mitigation_tips: String,
  professional_tips: String,
  rating: { type: Number, default: 0 },
  usage_count: { type: Number, default: 0 },
  is_free: { type: Boolean, default: true },
  estimated_fun_level: Number,
  estimated_impact_level: Number,
  illustration_url: String,
  created_by: String
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const activityPackSchema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: String,
  description: String,
  category: String,
  activityCount: Number,
  price: String,
  isPro: Boolean,
  activities: [Number],
  highlights: [String]
}, { timestamps: true });

const sessionSchema = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  date: String,
  context: String,
  audience: String,
  participantCount: Number,
  activityIds: [Number],
  notes: String,
  status: { type: String, default: 'Draft' }
}, { timestamps: true });

const savedActivitySchema = new Schema({
  userId: { type: String, required: true },
  activityId: { type: Number, required: true }
}, { timestamps: true });

const auditLogSchema = new Schema({
  userId: String,
  userName: String,
  action: { type: String, required: true },
  details: String,
  ipAddress: String
}, { timestamps: true });

// To map _id to id in JSON serialization
const applyTransform = (schema: Schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      if (ret._id) {
        ret.id = ret.id || ret._id.toString();
        delete ret._id;
      }
    }
  });
};
applyTransform(userSchema);
applyTransform(activitySchema);
applyTransform(activityPackSchema);
applyTransform(sessionSchema);
applyTransform(savedActivitySchema);
applyTransform(auditLogSchema);

export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const ActivityModel = mongoose.models.Activity || mongoose.model('Activity', activitySchema);
export const ActivityPackModel = mongoose.models.ActivityPack || mongoose.model('ActivityPack', activityPackSchema);
export const SessionModel = mongoose.models.Session || mongoose.model('Session', sessionSchema);
export const SavedActivityModel = mongoose.models.SavedActivity || mongoose.model('SavedActivity', savedActivitySchema);
export const AuditLogModel = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
