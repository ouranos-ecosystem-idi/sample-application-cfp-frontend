let globalAbortController = new AbortController();

export const getSignal = () => globalAbortController.signal;

export const onAbort = () => {
  globalAbortController.abort();
  globalAbortController = new AbortController();
};
