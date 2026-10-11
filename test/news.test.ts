import { hashPassword, verifyPassword } from '../server/db';
import { toBengaliNumber, getFullHeaderDate, formatBengaliDateTime } from '../src/utils/bengali';

async function runTests() {
  console.log('--- শুরু হচ্ছে দৈনিক কুষ্টিয়া দিগন্ত টেস্ট স্যুট ---');
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✓ [পাস] ${testName}`);
      passed++;
    } else {
      console.error(`✗ [ফেল] ${testName}`);
    }
  }

  // 1. Bengali number conversion
  assert(toBengaliNumber('12345') === '১২৩৪৫', 'ইংরেজি সংখ্যা বাংলায় রূপান্তর (12345 -> ১২৩৪৫)');
  assert(toBengaliNumber(2026) === '২০২৬', 'সংখ্যা ২০২৬ বাংলায় রূপান্তর');

  // 2. Bengali date utilities
  const headerDate = getFullHeaderDate();
  assert(headerDate.length > 5, 'মাস্টহেড তারিখ জেনারেশন');

  // 3. Password hashing & salt verification
  const testPass = 'Kushtia@Diganta2026';
  const { hash, salt } = hashPassword(testPass);
  assert(verifyPassword(testPass, hash, salt), 'সঠিক পাসওয়ার্ড যাচাই (Password Verification)');
  assert(!verifyPassword('WrongPass123', hash, salt), 'ভুল পাসওয়ার্ড প্রতিরোধ (Prevent invalid login)');

  console.log(`\nফলাফল: ${passed}/${total} টি টেস্ট সফলভাবে সম্পন্ন হয়েছে।`);
  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
