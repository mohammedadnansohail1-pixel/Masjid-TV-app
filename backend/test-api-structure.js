// Test API structure and routes
const fs = require('fs');
const path = require('path');

console.log('=== Analyzing API Structure ===\n');

// Find all controller files
const srcDir = path.join(__dirname, 'src');
const controllers = [];

function findControllers(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      findControllers(filePath);
    } else if (file.endsWith('.controller.ts')) {
      controllers.push(filePath);
    }
  });
}

findControllers(srcDir);

console.log(`Found ${controllers.length} controllers:\n`);

let totalEndpoints = 0;
const endpointsByModule = {};

controllers.forEach(controllerPath => {
  const moduleName = path.basename(path.dirname(controllerPath));
  const content = fs.readFileSync(controllerPath, 'utf8');

  // Count HTTP method decorators
  const getMethods = (content.match(/@Get/g) || []).length;
  const postMethods = (content.match(/@Post/g) || []).length;
  const patchMethods = (content.match(/@Patch/g) || []).length;
  const deleteMethods = (content.match(/@Delete/g) || []).length;
  const putMethods = (content.match(/@Put/g) || []).length;

  const total = getMethods + postMethods + patchMethods + deleteMethods + putMethods;
  totalEndpoints += total;

  // Extract route decorators
  const routeMatches = content.match(/@(Get|Post|Patch|Delete|Put)\(['"]([^'"]*)['"]\)/g) || [];
  const routes = routeMatches.map(match => {
    const methodMatch = match.match(/@(Get|Post|Patch|Delete|Put)/);
    const pathMatch = match.match(/\(['"]([^'"]*)['"]\)/);
    return {
      method: methodMatch ? methodMatch[1].toUpperCase() : 'UNKNOWN',
      path: pathMatch ? pathMatch[1] : ''
    };
  });

  // Get base path from controller
  const controllerMatch = content.match(/@Controller\(['"]([^'"]*)['"]\)/);
  const basePath = controllerMatch ? controllerMatch[1] : '';

  // Check for public endpoints
  const publicEndpoints = (content.match(/@Public\(\)/g) || []).length;

  console.log(`📁 ${moduleName}/`);
  console.log(`   Controller: ${path.basename(controllerPath)}`);
  console.log(`   Base Path: /${basePath}`);
  console.log(`   Endpoints: ${total} (GET:${getMethods}, POST:${postMethods}, PATCH:${patchMethods}, DELETE:${deleteMethods})`);
  console.log(`   Public: ${publicEndpoints}`);

  if (routes.length > 0) {
    console.log(`   Routes:`);
    routes.slice(0, 5).forEach(route => {
      const fullPath = basePath ? `/${basePath}${route.path ? '/' + route.path : ''}` : route.path;
      console.log(`      ${route.method.padEnd(6)} ${fullPath || '/'}`);
    });
    if (routes.length > 5) {
      console.log(`      ... and ${routes.length - 5} more`);
    }
  }
  console.log('');

  endpointsByModule[moduleName] = {
    total,
    getMethods,
    postMethods,
    patchMethods,
    deleteMethods,
    publicEndpoints,
    routes
  };
});

console.log('=== Summary ===');
console.log(`Total Controllers: ${controllers.length}`);
console.log(`Total Endpoints: ${totalEndpoints}`);
console.log('');

console.log('Endpoints by HTTP Method:');
let totalGet = 0, totalPost = 0, totalPatch = 0, totalDelete = 0;
Object.values(endpointsByModule).forEach(stats => {
  totalGet += stats.getMethods;
  totalPost += stats.postMethods;
  totalPatch += stats.patchMethods;
  totalDelete += stats.deleteMethods;
});
console.log(`  GET:    ${totalGet}`);
console.log(`  POST:   ${totalPost}`);
console.log(`  PATCH:  ${totalPatch}`);
console.log(`  DELETE: ${totalDelete}`);
console.log('');

// Check for authentication
console.log('Security Features:');
const hasJWT = fs.existsSync(path.join(srcDir, 'auth/strategies/jwt.strategy.ts'));
const hasGuards = fs.existsSync(path.join(srcDir, 'auth/guards'));
const hasRoles = fs.readFileSync(path.join(srcDir, 'common/decorators/roles.decorator.ts'), 'utf8').includes('UserRole');
console.log(`  ✅ JWT Strategy: ${hasJWT ? 'Configured' : 'Missing'}`);
console.log(`  ✅ Auth Guards: ${hasGuards ? 'Implemented' : 'Missing'}`);
console.log(`  ✅ Role-Based Access: ${hasRoles ? 'Enabled' : 'Disabled'}`);
console.log('');

console.log('=== API Structure Analysis Complete ===');
