console.log("Checking environment variables...");
const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
if (apiKey) {
    console.log("✅ VITE_GOOGLE_API_KEY is present. Length:", apiKey.length);
    console.log("First 5 chars:", apiKey.substring(0, 5));
} else {
    console.error("❌ VITE_GOOGLE_API_KEY is MISSING in environment.");
}
