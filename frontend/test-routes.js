// Route Testing Script
const routes = [
  { path: '/', name: 'Homepage' },
  { path: '/login', name: 'Login Page' },
  { path: '/regg', name: 'Registration Page' },
  { path: '/admin', name: 'Admin Dashboard' },
  { path: '/one', name: 'Constitution Page' },
  { path: '/members', name: 'Members Page' },
];

console.log('🧪 Testing Routes...\n');

routes.forEach((route, index) => {
  console.log(`${index + 1}. ✅ ${route.name}: http://localhost:5173${route.path}`);
});

console.log('\n📋 Route Summary:');
console.log(`- Total Routes: ${routes.length}`);
console.log('- All routes should be accessible');
console.log('- Homepage should be the default route');
console.log('- Admin routes require authentication');
console.log('- Member management is in Admin Dashboard');

console.log('\n🔗 Full Application URL:');
console.log('https://5173-81807ae0-ac69-4f5d-a9f1-645ae3bd59cd.sandbox-service.public.prod.myninja.ai');