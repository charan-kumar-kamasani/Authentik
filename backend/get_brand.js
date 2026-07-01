const { MongoClient } = require('mongodb');
async function run() {
  const client = new MongoClient('mongodb://localhost:27017');
  await client.connect();
  const db = client.db('authentik');
  const brand = await db.collection('brands').findOne({ brandName: 'XYZ' });
  console.log(brand);
  process.exit(0);
}
run();
