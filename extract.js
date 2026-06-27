const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: fs.createReadStream('/Users/charankumarkamasani/.gemini/antigravity-ide/brain/0198a839-9b92-4da3-b6ac-fd089805ac07/.system_generated/logs/transcript.jsonl')
});

let imgCount = 0;
rl.on('line', (line) => {
  if (line.includes('"type":"USER_INPUT"')) {
    try {
      const data = JSON.parse(line);
      const text = data.content.text || '';
      if (text.includes('check attachment i added all assets')) {
         if (data.content.media) {
             data.content.media.forEach((m, idx) => {
                 if (m.data) {
                     const buf = Buffer.from(m.data, 'base64');
                     fs.writeFileSync('asset_sheet_' + idx + '.' + m.mime_type.split('/')[1], buf);
                     console.log('Saved asset_sheet_' + idx + '.' + m.mime_type.split('/')[1]);
                 }
             });
         }
      }
    } catch(e) {}
  }
});
