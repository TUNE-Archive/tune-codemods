import React from 'react';
import range from 'lodash/range';

import DataGrid from './DataGrid';
import Pager from './Pager';
import IconCell from './IconCell';
import Editbox from '../icons/Editbox';
import FlagOutline from '../icons/FlagOutline';
import Gear from '../icons/Gear';

const getRandomString = () => Math.random().toString(36).slice(2);
const demoData = range(1, 1000).map(() => ({ value: getRandomString() }));
const getCustomHeader = model => <h1>{model.key.toUpperCase()}</h1>;
const getIdCell = cellArgs => (
<IconCell
componentName="TxlDataGridBodyRow"
{...cellArgs}
text="Lorem ipsum dolor"
hoverMenuItems={[
{
  label: 'Settings',
  node: <Gear />,
  onClick: () => console.log('Settings clicked'),
},
{
  label: 'Edit',
  node: <Editbox />,
  onClick: () => console.log('Edit clicked'),
},
{
  label: 'Flag as spam',
    node: <FlagOutline />,
  onClick: () => console.log('Flag clicked'),
},
{
  label: 'I don\'t like this cell',
    node: <Editbox />,
  onClick: () => console.log('Dont like clicked'),
},
{
  label: 'Do something amazing',
    node: <Editbox />,
  onClick: () => console.log('Amazing clicked'),
},
]}
/>
);

class DataGridDemo extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      columnModel: [
        {
          cell: getIdCell,
          growRatio: 1,
          header: 'ID Long',
          key: 'id',
          maxWidth: 300,
          pinned: true,
          sortType: 'alpha',
          width: 200,
        },
        {
          cell: cellArgs => cellArgs.row.value,
          growRatio: 1,
          header: 'Link',
          key: 'link',
          maxWidth: 200,
          minWidth: 150,
          resizeable: true,
          sortType: 'number',
          width: 200,
        },
        {
          cell: cellArgs => cellArgs.row.value,
          growRatio: 1,
          header: cellArgs => `${cellArgs.model.key} blah yo`,
          key: 'link2',
          resizeable: true,
          sortType: 'age',
          width: 200,
        },
      ],
      data: demoData.slice(0, 10),
      page: 1,
      resultsPerPage: 25,
      sortedDirection: 'ASC',
      sortedKey: 'id',
    };
    this._updateColumnModel = this._updateColumnModel.bind(this);
    this._withoutData = this._withoutData.bind(this);
    this._pagerChanged = this._pagerChanged.bind(this);
    this._updatePageNumber = this._updatePageNumber.bind(this);
  }

  _updatePageNumber() {
    this.setState({ page: 15 });
  }

  _withoutData() {
    const DATA = this.state.data.length ? [] : demoData.slice(0, 10);
    this.setState({ data: DATA });
  }

  _pagerChanged({ page, resultsPerPage }) {
    console.log('pager changed', page, resultsPerPage);
    this.setState({ page, resultsPerPage });
  }

  _updateColumnModel() {
    const columnModel = [
      {
        cell: args => args.row.value,
        growRatio: 1,
        header: ({ model }) => getCustomHeader(model),
        headerSimple: 'Link',
        key: 'link3',
        width: 400,
      }, {
        cell: args => args.row.value,
        growRatio: 1,
        header: 'Link 4',
        key: 'link4',
        width: 400,
      },
    ].concat(this.state.columnModel);

    this.setState({
      columnModel,
      demoData,
      sortedDirection: 'DESC',
      sortedKey: 'link',
    });
  }

  render() {
    const {
      data,
      sortedKey,
      sortedDirection,
      columnModel,
      page,
      resultsPerPage,
    } = this.state;
    return (
      <div>
      <button onClick={this._updateColumnModel}>Update Model</button>
    <button onClick={this._updatePageNumber}>Update PageNumber</button>
    <button onClick={this._withoutData}>Remove/Revert Data Content</button>
    <DataGrid
    stickTop={0}
    stickyHeader
    id="demo-data-grid"
    data={data}
    onSortRequested={(args) => { console.log('sortRequested', args); }}
    sortedKey={sortedKey}
    sortedDirection={sortedDirection}
    columnModel={columnModel}
      />
      <Pager
    results={5000}
    resultsPerPage={resultsPerPage}
    page={page}
    onChange={this._pagerChanged}
  />
  </div>
  );
  }
}

export default <DataGridDemo />;
