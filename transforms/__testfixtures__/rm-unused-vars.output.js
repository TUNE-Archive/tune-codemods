jest.unmock('lodash/range');
jest.unmock('../progress-indicators/LoadingIndicator');
jest.unmock('../input-fields/SearchBox');
jest.unmock('../lists/_SelectableItemList');
jest.unmock('./TwoPanelSelector');

import range from 'lodash/range';
import { mount } from 'enzyme';

import TwoPanelSelector from './TwoPanelSelector';

const VALUE = 'search value';
const HEADER = (<div className="header">a header</div>);
const { HEADER_SELECTOR } = '.header';
const CLICK_HANDLER = Function.prototype;
const SELECTED_INDEX = '1';

const TAB_ITEMS = range(12).map(i => ({
  label: (
  <div className="items-tester" id={`item-${i}`}>
Tab {i}
</div>
),
}));

describe('TwoPanelSelector (Controlled)', () => {
  const getItemList = twoPanelSelector => twoPanelSelector.ref('itemList');
  const getSearchBox = twoPanelSelector => twoPanelSelector.ref('searchBox');

  it('should pass search value to TextField', () => {
    const rendered = mount(
      <TwoPanelSelector
    items={TAB_ITEMS}
    searchValue={VALUE}
    shouldShowSearch
    />
    );
    expect(getSearchBox(rendered).prop('value')).toEqual(VALUE);
  });

  it('should render a header if supplied', () => {
    const rendered = mount(
      <TwoPanelSelector header={HEADER} items={TAB_ITEMS} />
    );
    const header = rendered.find(HEADER_SELECTOR);
    expect(header).not.toBeEmpty();
  });

  it('should render a SearchBox if shouldShowSearch is true', () => {
    const rendered = mount(
      <TwoPanelSelector items={TAB_ITEMS} shouldShowSearch />
    );
    expect(getSearchBox(rendered)).not.toBeEmpty();
  });

  it('should show loading spinner if contentLoading is true', () => {
    const rendered = mount(
      <TwoPanelSelector contentLoading items={TAB_ITEMS} />
    );
    expect(rendered.ref('contentLoadingLoader')).not.toBeEmpty();
    expect(rendered.ref('itemsLoadingLoader')).toBeEmpty();
  });

  it('should show loading spinner if itemsLoading is true', () => {
    const rendered = mount(
      <TwoPanelSelector itemsLoading items={TAB_ITEMS} />
    );
    expect(rendered.ref('itemsLoadingLoader')).not.toBeEmpty();
    expect(rendered.ref('contentLoadingLoader')).toBeEmpty();
  });

  it('should pass selectedValues to SelectableItemList', () => {
    const rendered = mount(
      <TwoPanelSelector
    onItemClick={CLICK_HANDLER}
    items={TAB_ITEMS}
    selectedValue={SELECTED_INDEX}
      />
    );
    expect(getItemList(rendered).prop('selectedValues')).toEqual([SELECTED_INDEX]);
  });

  it('should call onSearchChange with correct signature', () => {
    const clickSpy = jasmine.createSpy();
    const value = 'gallager';
    const rendered = mount(
      <TwoPanelSelector
    onSearchChange={clickSpy}
    items={TAB_ITEMS}
    shouldShowSearch
    />
    );
    getSearchBox(rendered).prop('onChange')({ value });
    expect(clickSpy).toHaveBeenCalledWith({ value });
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('should call onItemClick with correct signature', () => {
    const clickSpy = jasmine.createSpy();
    const rendered = mount(
      <TwoPanelSelector
    onItemClick={clickSpy}
    items={TAB_ITEMS}
      />
    );
    getItemList(rendered).prop('onClick')();
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });
});

