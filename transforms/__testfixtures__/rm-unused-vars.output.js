import React from 'react';
import { mount as mt } from 'enzyme';

import LoadingIndicator from '../progress-indicators/LoadingIndicator';
import SearchBox from '../input-fields/SearchBox';

const VALUE = 'search value';
const HEADER = (<div className="header">a header</div>);
const { HEADER_SELECTOR } = '.header';
const CLICK_HANDLER = Function.prototype;
const SELECTED_INDEX = '1';

HEADER_SELECTOR;
CLICK_HANDLER;
SELECTED_INDEX;

export const test = () => {
  return <LoadingIndicator value={VALUE} />;
};

export const test2 = () => {
  return mt(<SearchBox header={HEADER} />);
};
