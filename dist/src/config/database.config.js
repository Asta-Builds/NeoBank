"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("@nestjs/config");
exports.default = (0, config_1.registerAs)('database', () => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'neobank',
    autoLoadEntities: true,
    synchronize: process.env.NODE_ENV !== 'production',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    logging: process.env.NODE_ENV === 'development',
}));
//# sourceMappingURL=database.config.js.map