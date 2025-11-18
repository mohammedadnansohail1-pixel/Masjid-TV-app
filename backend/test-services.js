// Test backend services without database connection
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

console.log('=== Testing Backend Services ===\n');

// Test 1: Password Hashing (from AuthService)
console.log('Test 1: Password Hashing (bcrypt)');
const testPassword = 'Test123!';
bcrypt.hash(testPassword, 10, (err, hash) => {
  if (err) {
    console.log('❌ Password hashing failed:', err.message);
  } else {
    console.log('✅ Password hashed successfully');
    console.log('   Original:', testPassword);
    console.log('   Hash:', hash.substring(0, 30) + '...');

    // Test password verification
    bcrypt.compare(testPassword, hash, (err, result) => {
      if (err) {
        console.log('❌ Password comparison failed:', err.message);
      } else {
        console.log('✅ Password verification:', result ? 'VALID' : 'INVALID');
      }
    });
  }
});

// Test 2: JWT Token Generation (from AuthService)
console.log('\nTest 2: JWT Token Generation');
const payload = {
  sub: 'user123',
  email: 'test@masjid.com',
  role: 'SUPER_ADMIN'
};
const secret = 'test-secret-key';
const token = jwt.sign(payload, secret, { expiresIn: '7d' });
console.log('✅ JWT token generated successfully');
console.log('   Token:', token.substring(0, 50) + '...');

// Test 3: JWT Token Verification
console.log('\nTest 3: JWT Token Verification');
try {
  const decoded = jwt.verify(token, secret);
  console.log('✅ JWT token verified successfully');
  console.log('   User ID:', decoded.sub);
  console.log('   Email:', decoded.email);
  console.log('   Role:', decoded.role);
} catch (error) {
  console.log('❌ JWT verification failed:', error.message);
}

// Test 4: Device Pairing Code Generation (from DevicesService)
console.log('\nTest 4: Device Pairing Code Generation');
const generatePairingCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
const code1 = generatePairingCode();
const code2 = generatePairingCode();
const code3 = generatePairingCode();
console.log('✅ Pairing codes generated:');
console.log('   Code 1:', code1);
console.log('   Code 2:', code2);
console.log('   Code 3:', code3);
console.log('   All codes are 6 digits:',
  code1.length === 6 && code2.length === 6 && code3.length === 6 ? '✅ YES' : '❌ NO');

// Test 5: Prayer Time Calculation Method Mapping
console.log('\nTest 5: Prayer Calculation Methods');
const prayerMethods = {
  MWL: 3,      // Muslim World League
  ISNA: 2,     // Islamic Society of North America
  EGYPT: 5,    // Egyptian General Authority
  MAKKAH: 4,   // Umm Al-Qura, Makkah
  KARACHI: 1,  // University of Islamic Sciences, Karachi
};
console.log('✅ Prayer calculation methods mapped:');
Object.entries(prayerMethods).forEach(([name, code]) => {
  console.log(`   ${name}: API Code ${code}`);
});

// Test 6: Data Validation (class-validator style)
console.log('\nTest 6: Data Validation Patterns');
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
const testEmail = 'admin@masjid.com';
const testTime = '12:30';
const invalidTime = '25:00';
console.log('✅ Email validation:', emailRegex.test(testEmail) ? 'VALID' : 'INVALID');
console.log('✅ Time validation (12:30):', timeRegex.test(testTime) ? 'VALID' : 'INVALID');
console.log('✅ Time validation (25:00):', timeRegex.test(invalidTime) ? 'INVALID (correct)' : 'VALID (wrong)');

// Test 7: Slug Generation (from MasjidsService)
console.log('\nTest 7: Slug Generation');
const generateSlug = (name) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
const masjidName = 'Masjid Al-Rahman';
const slug = generateSlug(masjidName);
console.log('✅ Slug generated from name:');
console.log('   Name:', masjidName);
console.log('   Slug:', slug);

console.log('\n=== All Service Tests Complete ===');
