import { setLocale, LocaleObject } from 'yup';

type Types = {
  [key: string]: string;
};
const types: Types = {
  number: '数値',
};

export const jpConfig: LocaleObject = {
  mixed: {
    required: `入力必須`,
    notType: (prm: { type: string; }) => `${types[prm.type]}で入力`,
  },
  string: {
    length: (prm: { length: number; }) => `${prm.length}文字で入力`,
    min: (prm: { min: number; }) => `${prm.min}文字以上`,
    max: (prm: { max: number; }) => `${prm.max}文字以内`,
  },
  number: {
    min: (prm: { min: number; }) => `${prm.min}以上`,
    max: (prm: { max: number; }) => `${prm.max}以下`,
    integer: `数字で入力`,
  },
  boolean: {
    isValue: `入力必須`,
  },
  array: {
    min: (prm: { min: number; }) => `${prm.min}つ以上入力`,
  },
};

setLocale(jpConfig);
