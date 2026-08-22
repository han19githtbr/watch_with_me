// models/User.ts
import mongoose from 'mongoose';

const AccessLogSchema = new mongoose.Schema(
  {
    loginAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    userAgent: { type: String, default: '' },
    ip: { type: String, default: '' },
  },
  { _id: false }
);

const ViewEntrySchema = new mongoose.Schema(
  {
    movieId: { type: String, required: true },
    title: { type: String, default: '' },
    genre: { type: String, default: '' },
    poster: { type: String, default: '' },
    viewedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const SearchEntrySchema = new mongoose.Schema(
  {
    query: { type: String, required: true },
    searchedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  favorites: [{
    type: String,
  }],
  // Login/session history — one entry per login, updated with a
  // heartbeat while the person is active so we can approximate how
  // long each session lasted.
  accessLogs: {
    type: [AccessLogSchema],
    default: [],
  },
  // Every movie detail page the user opens, used to derive "most
  // watched" titles/genres.
  viewHistory: {
    type: [ViewEntrySchema],
    default: [],
  },
  // Every search the user runs, used to derive "most searched" terms.
  searchHistory: {
    type: [SearchEntrySchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);