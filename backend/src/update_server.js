const fs = require('fs');

const serverFile = '/Users/charankumarkamasani/Projects/authentik/backend/src/server.js';
let content = fs.readFileSync(serverFile, 'utf8');

if (content.indexOf('./routes/plan.routes') === -1) {
    content = content.replace(
        /const adminRoutes = require\('\.\/routes\/admin\.routes'\);/,
        "const adminRoutes = require('./routes/admin.routes');\nconst planRoutes = require('./routes/plan.routes');"
    );
    
    content = content.replace(
        /app\.use\('\/api\/admin', adminRoutes\);/,
        "app.use('/api/admin', adminRoutes);\napp.use('/api/plans', planRoutes);"
    );
    
    fs.writeFileSync(serverFile, content);
}
