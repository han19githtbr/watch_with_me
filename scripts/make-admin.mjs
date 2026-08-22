// scripts/make-admin.mjs
//
// Promotes an existing account to the "admin" role so it can access
// the /admin dashboard. There's no sign-up flag for this on purpose —
// admin status has to be granted deliberately from the database side.
//
// Run with:
//   npm run make-admin -- your-email@example.com
//
import { config } from 'dotenv';
config({ path: '.env.local' });
import mongoose from 'mongoose';

const email = process.argv[2];

if (!email) {
  console.error('Usage: npm run make-admin -- <email>');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI is not set. Check your .env.local file.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const User = mongoose.models.User || mongoose.model('User', UserSchema);

  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { new: true }
  );

  if (!user) {
    console.error(`No user found with email "${email}". Register the account first, then run this again.`);
    process.exit(1);
  }

  console.log(`✔ ${user.name} <${user.email}> is now an admin.`);
  console.log('Sign out and back in on the app for the change to take effect.');

  const allowlist = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length > 0 && !allowlist.includes(user.email.toLowerCase())) {
    console.warn(
      `⚠ Heads up: ADMIN_EMAILS is set but does not include "${user.email}". ` +
        'The admin panel will still reject this account until you add it to ADMIN_EMAILS.'
    );
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('make-admin failed:', err);
  process.exit(1);
});
