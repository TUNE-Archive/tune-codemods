import React from 'react';

import TxlBase from '../base/Base';
import TetheredPopoverTarget from '../_popover/_TetheredPopoverTarget';
import { gridUnits as gu } from '../styles/helpers';

const TETHER_CONFIGURATION = {
  attachment: 'top center',
  constraints: [{
    attachment: 'none',
    pin: true,
    to: 'window', // @TODO: make configurable (props) between window and scrollParent
  }],
  offset: `-${gu(1)} 0`,
  optimizations: {
    moveElement: false,
  },
  targetAttachment: 'bottom center',
  targetOffset: '0 0',
};

export default class TxlFlyoutTargetBase extends TxlBase {
  render() {
    const {
      children,
      content,
      style,
      visible,
      ...otherProps
    } = this.props;

    return (
      <TetheredPopoverTarget
        {...otherProps}
        content={content}
        style={style}
        visible={visible}
        popoverZIndex={this.props.popoverZIndex}
        configuration={TETHER_CONFIGURATION}
      >
        {children}
      </TetheredPopoverTarget>
    );
  }
}

TxlFlyoutTargetBase.propTypes = {
  children: TetheredPopoverTarget.propTypes.children,
  componentName: TetheredPopoverTarget.propTypes.componentName,
  content: TetheredPopoverTarget.propTypes.content,
  popoverZIndex: TetheredPopoverTarget.propTypes.popoverZIndex,
  style: TetheredPopoverTarget.propTypes.style,
  visible: TetheredPopoverTarget.propTypes.visible,
};
