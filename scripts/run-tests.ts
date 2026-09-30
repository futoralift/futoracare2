import fs from 'fs';
import path from 'path';
import { runAllTests } from '../src/__tests__/services.test';

console.log('\n🏥 ========================================================');
console.log('   FUTORACARE AI OS — AUTOMATED TEST SUITE EXECUTION');
console.log('========================================================\n');

const DB_PATH = path.resolve(process.cwd(), 'src/server/db/database.json');
const dbSnapshot = fs.readFileSync(DB_PATH, 'utf-8');

let results: ReturnType<typeof runAllTests> = [];
try {
  results = runAllTests();
} finally {
  // Always restore database so test records never persist into production data
  fs.writeFileSync(DB_PATH, dbSnapshot, 'utf-8');
}

let passed = 0;
let failed = 0;

results.forEach((r) => {
  if (r.passed) {
    passed++;
    console.log(`  ✅ [${r.suite}] ${r.test}`);
  } else {
    failed++;
    console.error(`  ❌ [${r.suite}] ${r.test}`);
    console.error(`     Error: ${r.error}`);
  }
});

console.log('\n--------------------------------------------------------');
console.log(`Results: ${passed} Passed, ${failed} Failed, ${results.length} Total`);
console.log('--------------------------------------------------------\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 ALL TEST SUITES PASSED WITH 100% SUCCESS.\n');
  process.exit(0);
}
