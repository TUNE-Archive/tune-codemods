import React, { PropTypes } from 'react';
import Radium from 'radium';
import moment from 'moment';

import { WRAPPER_STYLE } from '../dropdowns/_Dropdown.style';
import {
  DROPDOWN_CONTAINER_STYLE,
  DROPDOWN_CONTENT_STYLE,
} from './DatePicker.style';
import { autobind, NOOP } from '../base/Base';
import Calendar from '../calendar-picker/_SingleCalendarPicker';
import DropdownContent from '../dropdowns/_DropdownContentWithArrow';
import IconButton from '../buttons/IconButton';
import IconCalendarOutline from '../icons/CalendarOutline';
import TextField from './TextField';
import { isDateWithinRange } from '../calendar-picker/_CalendarUtils';

const DEFAULT_DATE_PATTERN = 'MM/DD/YYYY';
const DEFAULT_ERROR_TEXT_PREFIX = 'Invalid date:';
const NOT_WITHIN_RANGE_ERROR_TEXT = 'Date is not within valid range';

@Radium
export default class DatePicker extends React.Component {
  constructor(...args) {
    super(...args);
    this._isBlurDisabled = false;
  }

  @autobind
  _handleBlur() {
    if (!this._isBlurDisabled) {
      this._triggerPropFunc('updateDropdown', { open: false });
    }
    this._triggerPropFunc('onBlur', {});
    this._isBlurDisabled = false;
  }

  @autobind
  _handleFocus() {
    this._triggerPropFunc('updateDropdown', { open: true });
    this._triggerPropFunc('onFocus', {});
  }

  @autobind
  _handleCalendarClick() {
    this._triggerPropFunc('updateDropdown', { open: !this.props.open });
    this._triggerPropFunc('onFocus', {});
  }

  @autobind
  _handleDateClick({ date }) {
    const { pattern } = this.props;
    this._triggerPropFunc('updateDropdown', { open: false });
    this._triggerPropFunc('onChange', { value: date.format(pattern) });
    this._isBlurDisabled = false;
  }

  @autobind
  _disableBlur() {
    this._isBlurDisabled = true;
  }

  @autobind
  _getValidationText(isWithinValidRange) {
    const {
      pattern,
      validationText,
    } = this.props;

    if (validationText) { return validationText; }
    // TODO Make this component no longer control its own validation text
    if (!isWithinValidRange) { return NOT_WITHIN_RANGE_ERROR_TEXT; }

    return `${DEFAULT_ERROR_TEXT_PREFIX} ${pattern}`;
  }

  render() {
    const {
      isValid,
      label,
      onChange,
      open,
      pattern,
      rangeEndBoundary,
      rangeStartBoundary,
      secondaryText,
      value,
    } = this.props;
    const date = moment(value, pattern, true);
    const isValidDate = isValid !== undefined ? isValid : date.isValid();

    const rangeIsDefined = rangeEndBoundary || rangeStartBoundary;
    const isWithinValidRange = rangeIsDefined ?
      isDateWithinRange(date, rangeStartBoundary, rangeEndBoundary) :
      true;

    const validationState = (isValidDate && isWithinValidRange) ? 'base' : 'error';
    // TODO Make this component not control its own validation text
    const secondaryTextVal = (isValidDate && isWithinValidRange) ?
      secondaryText :
      this._getValidationText(isWithinValidRange);

    const dropdownIcon = (
      <IconButton
        icon={IconCalendarOutline}
        onClick={this._handleCalendarClick}
        size="large"
        variant="plain"
      />
    );

    return (
      <div
        data-component="DatePicker"
        style={WRAPPER_STYLE}
      >
        <TextField
          _afterContent={dropdownIcon}
          label={label}
          onBlur={this._handleBlur}
          onChange={onChange}
          onFocus={this._handleFocus}
          ref="dateTextField"
          secondaryText={secondaryTextVal}
          type="text"
          validationState={validationState}
          value={value}
        />
        <DropdownContent
          style={DROPDOWN_CONTAINER_STYLE}
          contentStyle={DROPDOWN_CONTENT_STYLE}
          onMouseEnter={this._disableBlur}
          open={open}
        >
          <Calendar
            date={isValidDate ? date : moment()}
            rangeEndBoundary={rangeEndBoundary}
            rangeStartBoundary={rangeStartBoundary}
            onDateClick={this._handleDateClick}
          />
        </DropdownContent>
      </div>
    );
  }
}

DatePicker.propTypes = {
  isValid: PropTypes.bool,
  label: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  open: PropTypes.bool,
  pattern: PropTypes.string,
  rangeEndBoundary: Calendar.propTypes.rangeEndBoundary,
  rangeStartBoundary: Calendar.propTypes.rangeStartBoundary,
  secondaryText: PropTypes.node,
  updateDropdown: PropTypes.func,
  validationText: PropTypes.string,
  value: PropTypes.string,
};

DatePicker.defaultProps = {
  onBlur: (hi) => console.log(hi),
  onChange: NOOP,
  open: false,
  pattern: DEFAULT_DATE_PATTERN,
  updateDropdown: NOOP,
  value: moment().format(DEFAULT_DATE_PATTERN),
};
