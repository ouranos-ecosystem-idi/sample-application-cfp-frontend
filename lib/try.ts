type Try<A> = {
  getValue: () => A;
  isSuccess: boolean;
  map: <B>(f: (value: A) => B) => Try<B>;
  fold: <B>(f0: (e: unknown) => B, f1: (value: A) => B) => B;
};

function successTry<A>(value: A): Try<A> {
  return {
    getValue: () => value,
    isSuccess: true,
    map: <B>(f: (value: A) => B) => successTry(f(value)),
    fold: <B>(f0: (e: unknown) => B, f1: (value: A) => B) => f1(value),
  };
}

function errorTry<A>(ex: any): Try<A> {
  const that: Try<A> = {
    getValue: () => {
      throw ex;
    },
    isSuccess: false,
    map: <B>(f: (value: A) => B) => errorTry<B>(ex),
    fold: <B>(f0: (e: unknown) => B, f1: (value: A) => B) => f0(ex),
  };
  return that;
}

export function doTry<A>(f: () => A): Try<A> {
  try {
    return successTry(f());
  } catch (e) {
    return errorTry(e);
  }
}
