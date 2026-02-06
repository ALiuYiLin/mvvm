import { Option } from "../types";
import $ from "jquery";
import { setCurrentUpdateFn } from "./state";


export function compile(option: Option) {
  const { selector, show, text, listeners } = option;

  const element = $(selector);

  const updateFn = () => {
    const showValue = typeof show === "function" ? show() : show;
    const textValue = typeof text === "function" ? text() : text;
    if (textValue !== undefined) element.text(textValue);
    showValue || showValue === undefined ? element.show() : element.hide();
  };

  setCurrentUpdateFn(updateFn);
  updateFn();
  setCurrentUpdateFn(null);

  if (listeners && listeners.length > 0) {
    listeners.forEach((listener) => {
      element.on(listener.type, listener.callback);
    });
  }
}
