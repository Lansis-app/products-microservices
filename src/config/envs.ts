import "dotenv/config";
import * as joi from "joi";

interface EnvsVars {
  PORT: number;
  DATABASE_URL: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().uri().required(),
  })
  .unknown(true);

const { error, value } = envSchema.validate(process.env) as {
  error: joi.ValidationError;
  value: EnvsVars;
};

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars = value;

export const envs = {
  port: envVars.PORT,
  databaseUrl: envVars.DATABASE_URL,
};
