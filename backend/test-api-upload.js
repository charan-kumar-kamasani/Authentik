const fs = require('fs');
async function test() {
  const tokenData = await fetch('http://127.0.0.1:5000/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'superadmin@example.com', password: 'password123' }) // Need a real admin login if possible, or just skip if we don't have one
  });
  console.log(tokenData.status);
}
test();
