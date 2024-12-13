export const getValidPortNumber = (port: string | undefined): number => {
  if (!port) throw new Error(`Environment variables BE_PORT and FE_PORT must be defined.`);

  const portNumber = Number(port);

  if (!Number.isInteger(portNumber) || portNumber < 1024 || portNumber > 65535) {
    throw new Error(`Environment variables BE_PORT and FE_PORT must be a valid non-root port number (1024–65535).`);
  }

  return portNumber;
};
