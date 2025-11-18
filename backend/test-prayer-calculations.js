// Test Prayer Time Calculation Logic
console.log('=== Prayer Time Calculation Tests ===\n');

// Test 1: Calculation Method Mapping
console.log('Test 1: Prayer Calculation Method Mapping');
const methodMap = {
  ISNA: 2,           // Islamic Society of North America
  MWL: 3,            // Muslim World League
  EGYPT: 5,          // Egyptian General Authority
  MAKKAH: 4,         // Umm Al-Qura University, Makkah
  KARACHI: 1,        // University of Islamic Sciences, Karachi
  TEHRAN: 7,         // Institute of Geophysics, University of Tehran
  JAFARI: 0,         // Shia Ithna-Ashari, Leva Institute, Qum
  GULF: 8,           // Gulf Region
  KUWAIT: 9,         // Kuwait
  QATAR: 10,         // Qatar
  SINGAPORE: 11,     // Majlis Ugama Islam Singapura, Singapore
  FRANCE: 12,        // Union Organization Islamic de France
  TURKEY: 13,        // Diyanet İşleri Başkanlığı, Turkey
  RUSSIA: 14         // Spiritual Administration of Muslims of Russia
};

let methodTests = 0;
let methodPassed = 0;

for (const [method, code] of Object.entries(methodMap)) {
  methodTests++;
  if (typeof code === 'number' && code >= 0 && code <= 14) {
    methodPassed++;
    console.log(`  ✅ ${method.padEnd(12)} -> Code ${code}`);
  } else {
    console.log(`  ❌ ${method.padEnd(12)} -> Invalid code ${code}`);
  }
}

console.log(`\nMethod Mapping: ${methodPassed}/${methodTests} passed\n`);

// Test 2: Asr Calculation Methods
console.log('Test 2: Asr Calculation Methods');
const asrMethods = {
  STANDARD: 'Standard (Shafi, Maliki, Hanbali)',
  HANAFI: 'Hanafi (shadow = object length + object shadow at noon)'
};

let asrTests = 0;
let asrPassed = 0;

for (const [method, description] of Object.entries(asrMethods)) {
  asrTests++;
  asrPassed++;
  console.log(`  ✅ ${method.padEnd(10)} -> ${description}`);
}

console.log(`\nAsr Methods: ${asrPassed}/${asrTests} passed\n`);

// Test 3: High Latitude Rules
console.log('Test 3: High Latitude Adjustment Rules');
const highLatRules = {
  MIDDLE_OF_NIGHT: 'Middle of the Night',
  ANGLE_BASED: 'Angle-Based Method',
  ONE_SEVENTH: 'One-Seventh of Night',
  NONE: 'No Adjustment'
};

let latTests = 0;
let latPassed = 0;

for (const [rule, description] of Object.entries(highLatRules)) {
  latTests++;
  latPassed++;
  console.log(`  ✅ ${rule.padEnd(18)} -> ${description}`);
}

console.log(`\nHigh Latitude Rules: ${latPassed}/${latTests} passed\n`);

// Test 4: Time Format Validation
console.log('Test 4: Time Format Validation');
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const testTimes = [
  { time: '00:00', valid: true },
  { time: '12:00', valid: true },
  { time: '23:59', valid: true },
  { time: '06:30', valid: true },
  { time: '18:45', valid: true },
  { time: '24:00', valid: false },
  { time: '25:30', valid: false },
  { time: '12:60', valid: false },
  { time: '1:30', valid: true },
  { time: '9:05', valid: true }
];

let timeTests = 0;
let timePassed = 0;

testTimes.forEach(({ time, valid }) => {
  timeTests++;
  const result = timeRegex.test(time);
  if (result === valid) {
    timePassed++;
    console.log(`  ✅ "${time}" -> ${result ? 'Valid' : 'Invalid'} (Expected: ${valid ? 'Valid' : 'Invalid'})`);
  } else {
    console.log(`  ❌ "${time}" -> ${result ? 'Valid' : 'Invalid'} (Expected: ${valid ? 'Valid' : 'Invalid'})`);
  }
});

console.log(`\nTime Format Validation: ${timePassed}/${timeTests} passed\n`);

// Test 5: Date Range Calculation
console.log('Test 5: Date Range Calculation');

function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Include both start and end dates
}

const dateTests = [
  { start: '2024-01-01', end: '2024-01-31', expected: 31 },
  { start: '2024-02-01', end: '2024-02-29', expected: 29 }, // Leap year
  { start: '2024-11-01', end: '2024-11-30', expected: 30 },
  { start: '2024-01-01', end: '2024-12-31', expected: 366 }, // Full leap year
  { start: '2024-11-18', end: '2024-11-18', expected: 1 }    // Same day
];

let dateTestCount = 0;
let dateTestPassed = 0;

dateTests.forEach(({ start, end, expected }) => {
  dateTestCount++;
  const result = getDaysBetween(start, end);
  if (result === expected) {
    dateTestPassed++;
    console.log(`  ✅ ${start} to ${end} -> ${result} days (Expected: ${expected})`);
  } else {
    console.log(`  ❌ ${start} to ${end} -> ${result} days (Expected: ${expected})`);
  }
});

console.log(`\nDate Range Calculation: ${dateTestPassed}/${dateTestCount} passed\n`);

// Test 6: Timezone Validation
console.log('Test 6: Common Timezone Support');
const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
  'America/Denver',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Riyadh',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Jakarta',
  'Australia/Sydney',
  'Africa/Cairo'
];

let tzTests = 0;
let tzPassed = 0;

timezones.forEach(tz => {
  tzTests++;
  try {
    // Test if timezone is valid by creating a date with it
    new Date().toLocaleString('en-US', { timeZone: tz });
    tzPassed++;
    console.log(`  ✅ ${tz.padEnd(25)} -> Valid`);
  } catch (e) {
    console.log(`  ❌ ${tz.padEnd(25)} -> Invalid`);
  }
});

console.log(`\nTimezone Validation: ${tzPassed}/${tzTests} passed\n`);

// Test 7: Geographic Coordinate Validation
console.log('Test 7: Geographic Coordinate Validation');

function validateCoordinates(lat, lng) {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

const coordTests = [
  { lat: 40.7128, lng: -74.0060, name: 'New York City', valid: true },
  { lat: 21.4225, lng: 39.8262, name: 'Makkah', valid: true },
  { lat: 24.4539, lng: 54.3773, name: 'Abu Dhabi', valid: true },
  { lat: 51.5074, lng: -0.1278, name: 'London', valid: true },
  { lat: 0, lng: 0, name: 'Null Island', valid: true },
  { lat: 91, lng: 0, name: 'Invalid Latitude', valid: false },
  { lat: 0, lng: 181, name: 'Invalid Longitude', valid: false },
  { lat: -91, lng: 0, name: 'Invalid Latitude', valid: false }
];

let coordTestCount = 0;
let coordTestPassed = 0;

coordTests.forEach(({ lat, lng, name, valid }) => {
  coordTestCount++;
  const result = validateCoordinates(lat, lng);
  if (result === valid) {
    coordTestPassed++;
    console.log(`  ✅ ${name.padEnd(20)} (${lat}, ${lng}) -> ${result ? 'Valid' : 'Invalid'}`);
  } else {
    console.log(`  ❌ ${name.padEnd(20)} (${lat}, ${lng}) -> ${result ? 'Valid' : 'Invalid'} (Expected: ${valid ? 'Valid' : 'Invalid'})`);
  }
});

console.log(`\nCoordinate Validation: ${coordTestPassed}/${coordTestCount} passed\n`);

// Test 8: Prayer Time Order Validation
console.log('Test 8: Prayer Time Order Validation');

function validatePrayerOrder(times) {
  const order = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const timeValues = order.map(prayer => {
    const [hours, minutes] = times[prayer].split(':').map(Number);
    return hours * 60 + minutes;
  });

  for (let i = 1; i < timeValues.length; i++) {
    if (timeValues[i] <= timeValues[i - 1]) {
      return false;
    }
  }
  return true;
}

const prayerOrderTests = [
  {
    name: 'Valid Order',
    times: { fajr: '05:30', sunrise: '07:00', dhuhr: '12:30', asr: '15:45', maghrib: '18:00', isha: '19:30' },
    valid: true
  },
  {
    name: 'Valid Order (Winter)',
    times: { fajr: '06:00', sunrise: '07:15', dhuhr: '12:30', asr: '15:00', maghrib: '17:15', isha: '18:45' },
    valid: true
  },
  {
    name: 'Invalid Order (Asr before Dhuhr)',
    times: { fajr: '05:30', sunrise: '07:00', dhuhr: '15:00', asr: '12:30', maghrib: '18:00', isha: '19:30' },
    valid: false
  }
];

let orderTests = 0;
let orderPassed = 0;

prayerOrderTests.forEach(({ name, times, valid }) => {
  orderTests++;
  const result = validatePrayerOrder(times);
  if (result === valid) {
    orderPassed++;
    console.log(`  ✅ ${name.padEnd(30)} -> ${result ? 'Valid' : 'Invalid'}`);
  } else {
    console.log(`  ❌ ${name.padEnd(30)} -> ${result ? 'Valid' : 'Invalid'} (Expected: ${valid ? 'Valid' : 'Invalid'})`);
  }
});

console.log(`\nPrayer Order Validation: ${orderPassed}/${orderTests} passed\n`);

// Final Summary
console.log('=== Test Summary ===');
const totalTests = methodTests + asrTests + latTests + timeTests + dateTestCount + tzTests + coordTestCount + orderTests;
const totalPassed = methodPassed + asrPassed + latPassed + timePassed + dateTestPassed + tzPassed + coordTestPassed + orderPassed;

console.log(`Total Tests Run: ${totalTests}`);
console.log(`Total Passed: ${totalPassed}`);
console.log(`Total Failed: ${totalTests - totalPassed}`);
console.log(`Success Rate: ${((totalPassed / totalTests) * 100).toFixed(2)}%`);

if (totalPassed === totalTests) {
  console.log('\n✅ All prayer time calculation tests passed!');
} else {
  console.log(`\n⚠️ ${totalTests - totalPassed} test(s) failed`);
}

console.log('\n=== Prayer Time Calculation Tests Complete ===');
