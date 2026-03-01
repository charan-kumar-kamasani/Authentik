/**
 * Migration: Backfill place names for scans that have valid lat/lng but
 * "Unknown location" / null / empty place. Uses Nominatim reverse geocoding
 * with rate-limit compliance (1 req/sec).
 *
 * Usage:  node src/migrations/backfillPlaces.js
 */
const mongoose = require('mongoose');
require('dotenv').config();
const Scan = require('../models/Scan');
const db = require('../config/db');

async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
      { headers: { 'User-Agent': 'Authentik-Backfill/1.0 (contact@authentik.com)' } }
    );
    const data = await res.json();
    const city  = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
    const state = data.address?.state || '';
    return [city, state].filter(Boolean).join(', ') || null;
  } catch { return null; }
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  await db();
  console.log('Connected to MongoDB');

  // Find scans with valid coords but bad place
  const scans = await Scan.find({
    latitude:  { $ne: null },
    longitude: { $ne: null },
    $or: [
      { place: null },
      { place: '' },
      { place: 'Unknown location' },
      { place: 'Unknown' },
    ],
  }).select('latitude longitude place').lean();

  console.log(`Found ${scans.length} scans with unknown place to backfill.`);

  // Deduplicate by approx coordinates (2-decimal precision ≈ 1 km)
  const coordMap = new Map();
  for (const s of scans) {
    const key = `${s.latitude.toFixed(2)},${s.longitude.toFixed(2)}`;
    if (!coordMap.has(key)) {
      coordMap.set(key, { lat: s.latitude, lng: s.longitude, ids: [] });
    }
    coordMap.get(key).ids.push(s._id);
  }

  console.log(`Unique coordinate clusters: ${coordMap.size}`);

  let updated = 0;
  let failed  = 0;

  for (const [key, { lat, lng, ids }] of coordMap) {
    const city = await reverseGeocode(lat, lng);
    if (city) {
      await Scan.updateMany(
        { _id: { $in: ids } },
        { $set: { place: city } }
      );
      updated += ids.length;
      console.log(`  ✓ ${key} → ${city}  (${ids.length} scans)`);
    } else {
      failed += ids.length;
      console.log(`  ✗ ${key} → failed  (${ids.length} scans)`);
    }
    // Nominatim rate limit: 1 request per second
    await sleep(1100);
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
