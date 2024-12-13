export const logErrorAndExit = (error: unknown): void => {
  // eslint-disable-next-line no-console
  console.error(error);

  // eslint-disable-next-line n/no-process-exit
  process.exit(1);
};
