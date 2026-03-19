 function getCurrentPlace() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported");
      resolve("Unknown location");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const controller = new AbortController();
          setTimeout(() => controller.abort(), 7000); // ⏱️ timeout

          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            {
              headers: {
                "User-Agent": "AuthentickApp/1.0",
              },
              signal: controller.signal,
            }
          );

          const data = await res.json();

          if (!data.address) {
            console.warn("No address in response", data);
            resolve("Unknown location");
            return;
          }

          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            "";

          const state = data.address.state || "";
          const country = data.address.country || "";

          const place = [city, state, country].filter(Boolean).join(", ");

          resolve(place || "Unknown location");
        } catch (err) {
          console.error("Reverse geocode failed:", err);
          resolve("Unknown location");
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        resolve("Unknown location");
      },
      {
        enableHighAccuracy: true,
        timeout: 8000,
        maximumAge: 0,
      }
    );
  });
}


function maskPhoneNumber(phone) {
  if (!phone) return "N/A";
  const str = phone.toString();
  if (str.length < 10) return str;
  // Format: 988****9144
  const first3 = str.slice(0, 3);
  const last4 = str.slice(-4);
  return `${first3}****${last4}`;
}

// Simple debounce helper
function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export { getCurrentPlace, debounce, maskPhoneNumber };