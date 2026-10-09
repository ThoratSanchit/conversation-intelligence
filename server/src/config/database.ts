import fs from 'fs';
import path from 'path';
import { Sequelize } from 'sequelize';
import env from './env';

interface SslOptions {
  require: boolean;
  rejectUnauthorized: boolean;
  ca?: string;
}

/**
 * Determines whether SSL/TLS is required and constructs dialectOptions.ssl.
 * Handles:
 * - Explicit DB_SSL env var (true, require, false, disable)
 * - URL query parameters (?sslmode=require, ?ssl=true)
 * - Cloud database providers enforcing TLS by default (Aiven, Neon, Supabase, Render, AWS)
 * - Certificate verification preservation when a CA certificate is provided
 */
function getSslConfig(): SslOptions | false {
  const explicitSsl = env.database.ssl?.trim().toLowerCase();
  if (explicitSsl === 'false' || explicitSsl === 'disable' || explicitSsl === 'disabled') {
    return false;
  }

  let host = env.database.host || '';
  let hasSslInUrl = false;

  if (env.database.url) {
    try {
      const parsed = new URL(env.database.url);
      host = parsed.hostname || host;
      const sslmode = parsed.searchParams.get('sslmode')?.toLowerCase();
      const ssl = parsed.searchParams.get('ssl')?.toLowerCase();
      hasSslInUrl =
        sslmode === 'require' ||
        sslmode === 'verify-ca' ||
        sslmode === 'verify-full' ||
        ssl === 'true';
    } catch {
      hasSslInUrl =
        env.database.url.includes('sslmode=require') ||
        env.database.url.includes('ssl=true');
    }
  }

  const isCloudProvider =
    host.includes('aivencloud.com') ||
    host.includes('neon.tech') ||
    host.includes('supabase.co') ||
    host.includes('render.com') ||
    host.includes('amazonaws.com');

  const requiresSsl =
    explicitSsl === 'true' ||
    explicitSsl === 'require' ||
    hasSslInUrl ||
    isCloudProvider ||
    env.nodeEnv === 'production';

  if (!requiresSsl) {
    return false;
  }

  // Preserve certificate verification if a CA certificate is provided
  let caCert: string | undefined;
  if (env.database.sslCa) {
    if (fs.existsSync(env.database.sslCa)) {
      caCert = fs.readFileSync(env.database.sslCa, 'utf8');
    } else if (env.database.sslCa.includes('BEGIN CERTIFICATE')) {
      caCert = env.database.sslCa;
    }
  } else {
    const defaultCaPath = path.resolve(process.cwd(), 'ca.pem');
    if (fs.existsSync(defaultCaPath)) {
      caCert = fs.readFileSync(defaultCaPath, 'utf8');
    }
  }

  if (caCert) {
    return {
      require: true,
      rejectUnauthorized: true,
      ca: caCert,
    };
  }

  // When connecting to managed cloud databases (such as Aiven) that use project-specific
  // certificate authorities, default rejectUnauthorized to false unless explicitly overridden,
  // while ensuring TLS encryption is strictly enforced.
  const rejectUnauthorized = env.database.sslRejectUnauthorized === 'true';

  return {
    require: true,
    rejectUnauthorized,
  };
}

const sslConfig = getSslConfig();
const dialectOptions: Record<string, any> = {};

if (sslConfig) {
  dialectOptions.ssl = sslConfig;
}

export const sequelize = env.database.url
  ? new Sequelize(env.database.url, {
      dialect: 'postgres',
      logging: env.database.logging ? console.log : false,
      dialectOptions,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    })
  : new Sequelize(env.database.name, env.database.user, env.database.password, {
      host: env.database.host,
      port: env.database.port,
      dialect: 'postgres',
      logging: env.database.logging ? console.log : false,
      dialectOptions,
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
    });

export async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log(
      `PostgreSQL database connected successfully via Sequelize (TLS: ${sslConfig ? 'enabled' : 'disabled'}).`
    );
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error);
    throw error;
  }
}

export default sequelize;
