import React from 'react';
import { mount as mt } from 'enzyme';

import LoadingIndicator from '../progress-indicators/LoadingIndicator';
import SearchBox from '../input-fields/SearchBox';

const VALUE = 'search value';
const HEADER = (<div className="header">a header</div>);
const { HEADER_SELECTOR } = '.header';
const CLICK_HANDLER = Function.prototype;
const SELECTED_INDEX = '1';
const { HEADER_SELECTOR: hs } = HEADER_SELECTOR;
hs;
CLICK_HANDLER;
SELECTED_INDEX;

function Items1() {
  const { item, item2 = 'one'} = { item: 1, two: 2};

  item2;
  item;
}

function Items2() {
  const { item, two } = { item: 1, two: 2};

  item;
}

function Items3() {
  const { item, item2 = 'one', ...rest} = { item: 1, two: 2};

  rest;
}

function Items4() {
  const [test3] = [1, 2];

  test3;
}

function Items5() {
  const [test3, test4] = [1, 2];

  test4;
}

function Items6() {}

export const test = () => {
  return <LoadingIndicator value={VALUE} />;
};

export const test2 = () => {
  return mt(<SearchBox header={HEADER} />);
};
