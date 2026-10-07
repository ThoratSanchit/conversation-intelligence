import { Sequelize } from 'sequelize';
import env from './env';

export const sequelize = env.database.url
  ? new Sequelize(env.database.url, {
      dialect: 'postgres',
      logging: env.database.logging ? console.log : false,
      dialectOptions: {
        ssl: env.nodeEnv === 'production' ? { require: true, rejectUnauthorized: false } : false,
      },
    })
  : new Sequelize(env.database.name, env.database.user, env.database.password, {
      host: env.database.host,
      port: env.database.port,
      dialect: 'postgres',
      logging: env.database.logging ? console.log : false,
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
    console.log('PostgreSQL database connected successfully via Sequelize.');
  } catch (error) {
    console.error('Unable to connect to the PostgreSQL database:', error);
    throw error;
  }
}

export default sequelize;
