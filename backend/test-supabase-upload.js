const { uploadToSupabaseStorage } = require("./src/utils/supabaseStorage");
async function test() {
  try {
    const buf = Buffer.from("test pdf content");
    const url = await uploadToSupabaseStorage(buf, `test_${Date.now()}.pdf`);
    console.log("Success:", url);
  } catch (err) {
    console.error("Error:", err.message);
  }
}
test();
