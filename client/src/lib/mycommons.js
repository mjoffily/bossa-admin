import * as R from 'ramda';


export const ESCAPE_KEY = 27;
export const ENTER_KEY = 'Enter';
export const NO_PHOTO_IMG = 'resources/nophoto.png';
//export const DEFAULT_PAGE = 
export const BOSSA_PRODUCTS_URL = 'https://bossa-online.myshopify.com/admin/products/';
export const baseURL = '';


export const round = places =>
  R.pipe(
    num => num * Math.pow(10, places),
    Math.round,
    num => num * Math.pow(10, -1 * places),
  );

const formatMoney = R.curry(
  (symbol, places, number) => {
    return R.pipe(
      R.defaultTo(0),
      round(places),
      num => num.toFixed(places),
      R.concat(symbol),
    )(number);
  }
);

export const toBRL = formatMoney('R$', 2);
export const toUSD = formatMoney('$', 2);
export const toAUD = formatMoney('A$', 2);