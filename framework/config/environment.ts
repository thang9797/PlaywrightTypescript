import environments from '../../config/environments.json';

export interface EnvironmentCredentials {
  username: string;
  password: string;
}

export interface EnvironmentConfig {
  name: string;
  baseURL: string;
  credentials: EnvironmentCredentials;
}

type EnvironmentKey = keyof typeof environments;

export function getEnvironmentConfig(environmentName: string): EnvironmentConfig {
  const normalisedName = environmentName.toLowerCase() as EnvironmentKey;

  if (!Object.prototype.hasOwnProperty.call(environments, normalisedName)) {
    const availableEnvs = Object.keys(environments).join(', ');
    throw new Error(
      `Unknown environment "${environmentName}". Available options are: ${availableEnvs}.`
    );
  }

  return environments[normalisedName];
}

export function getAvailableEnvironments(): string[] {
  return Object.keys(environments);
}
