import 'dotenv/config';

const requiredEnvironmentVariables = [
  'PORT',
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
] as const;

function getEnvironmentVariable(variableName: (typeof requiredEnvironmentVariables)[number]): string {
  if (!process.env[variableName]) {
    throw new Error(`La variable de entorno ${variableName} es obligatoria.`);
  }

  return process.env[variableName];
}

export const env = {
  port: Number(getEnvironmentVariable('PORT')),
  database: {
    host: getEnvironmentVariable('DB_HOST'),
    port: Number(getEnvironmentVariable('DB_PORT')),
    name: getEnvironmentVariable('DB_NAME'),
    user: getEnvironmentVariable('DB_USER'),
    password: getEnvironmentVariable('DB_PASSWORD'),
  },
  jwt: {
    secret: getEnvironmentVariable('JWT_SECRET'),
    expiresIn: getEnvironmentVariable('JWT_EXPIRES_IN'),
  },
};