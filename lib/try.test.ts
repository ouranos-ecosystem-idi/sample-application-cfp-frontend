import { doTry } from './try';

describe('Try', () => {
  test('成功時の処理', () => {
    const result = doTry(() => 'abc');
    expect(result.isSuccess).toBe(true);
    expect(result.getValue()).toBe('abc');
    expect(result.map((value) => value.length).getValue()).toBe(3);
    expect(
      result.fold(
        () => -1,
        (value) => value.length
      )
    ).toBe(3);
  });
  test('成功時の処理', () => {
    const result = doTry<string>(() => {
      throw 'error';
    });
    expect(result.isSuccess).toBe(false);
    expect(() => result.getValue()).toThrow('error');
    expect(() => result.map((value) => value.length).getValue()).toThrow(
      'error'
    );
    expect(
      result.fold(
        () => -1,
        (value) => value.length
      )
    ).toBe(-1);
  });
});
