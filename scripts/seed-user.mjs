// scripts/seed-user.mjs
//
// Creates (or resets the password of) a demo account you can use to log
// in to the app right away, without needing to fill the sign-up form.
//
// Run with:
//   npm run seed
//
// This reads MONGODB_URI from .env.local via Node's built-in --env-file
// flag (see the "seed" script in package.json) — no extra dependency
// needed. It defines its own minimal copy of the User schema so it can
// run as a plain Node script outside of Next.js/TypeScript.
import { config } from 'dotenv';
config({ path: '.env.local' });
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const DEMO_EMAIL = 'demo@watchwithme.com';
const DEMO_PASSWORD = 'Demo@12345';
const DEMO_NAME = 'Demo User';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
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

  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  await User.findOneAndUpdate(
    { email: DEMO_EMAIL },
    { email: DEMO_EMAIL, password: hashedPassword, name: DEMO_NAME },
    { upsert: true, setDefaultsOnInsert: true }
  );

  console.log('Demo account ready:');
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
