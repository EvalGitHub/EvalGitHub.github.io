# 创建一个全局toast

- 需求

1、具有函数open并且可以以函数的形式调用传递参数

2、具有函数close，用于关闭销毁弹窗组件

global_toast.js
```
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import './global_toast.scss';

function textInfo(msg) {
  return (
    <div className="toast_info_wrapper">
      <p className="text_des_wrapper">
        <span>{msg}</span>
      </p>
    </div>
  )
};

function iconInfo(msg) {
  return (
    <div className="toast_error_info_wrapper">
      <div className='toast_conten'>
        <img className='err_icon' src={require('@/assets/toast_ico_success 2@2x.png')} />
        <p className="text_des_wrapper">
          {msg}
        </p>
      </div>
    </div>
  )
};

export default class Toast extends Component {
  render() {
    let { tip, infoType } = this.props;
    return (
      <Fragment>
        {
          infoType === 'text' ? textInfo(tip) : iconInfo(tip)
        }
      </Fragment>
    );
  }
}

Toast.propTypes = {
  tip: PropTypes.string, // err msg
  infoType: PropTypes.string // toast type  [text, iconText]
};

Toast.newInstance = function newNotificationInstance(properties) {
  let props = properties || {};
  let div = document.createElement('div');
  document.body.appendChild(div);
  ReactDOM.render(React.createElement(Toast, props), div);
  return {
    destroy() {
      ReactDOM.unmountComponentAtNode(div);
      document.body.removeChild(div);
    },
  };
};
```
newNotificationInstance具备两个作用，第一个是可用于在body上创建一个toast节点，并且返回一个销毁函数。

index.js
```
import Toast from './global_toast.js';

let loadingInstance = 0;
let getLoadingInstance = (tip, infoType) => {
    loadingInstance = loadingInstance || Toast.newInstance({
        tip,
        infoType
    });
    return loadingInstance;
};
export default {
  open(obj) {
    let {tip, infoType, selfCloseConfig, callback} = obj;
    getLoadingInstance(tip, infoType);
    if (selfCloseConfig && selfCloseConfig.flag) {
      setTimeout(() => {
        this.close();
        if (callback) {
            callback();
        };
      }, selfCloseConfig.timer);
    }
  },
  close() {
    if (loadingInstance) {
      loadingInstance.destroy();
      loadingInstance = null;
    }
  },
};
```
调用：
```
import GlobalToast from '@/common/globalToast';
GlobalToast.open({
  tip: OrderErrorCode[code].err_msg,
  infoType: OrderErrorCode[code].err_type,
  selfCloseConfig: {
    flag: true,
    timer: 1000
  }
});
```
css样式参考：[全局toast的样式文件](<https://github.com/EvalGitHub/webpack_reactJS/blob/master/src/common/globalToast/global_toast.scss>)
