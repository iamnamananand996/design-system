import React from "react";
import {
  basicInputDescriptionConfig,
  BasicInputDescriptionOmitKeys,
} from "../../InputDescriptions";
import SingleSelectBase, { SingleSelectBaseProps } from "../SingleSelectBase";

export type BasicSingleSelectRequiredKeys =
  | "id"
  | "instanceId"
  | "label"
  | "value"
  | "options"
  | "onChange";

export type BasicSingleSelectOmitKeys =
  | "labelFontSize"
  | "labelFontWeight"
  | "labelTextColor"
  | "labelLineHeight"
  | "labelFontFamily"
  | "labelActivateStyle"
  | "labelDeActivateStyle"
  | "errorLabelFontFamily"
  | "errorLabelFontSize"
  | "errorLabelFontWeight"
  | "errorLabelLineHeight"
  | "errorLabelTextColor";

export type FullBasicSingleSelectProps = Omit<
  SingleSelectBaseProps,
  BasicSingleSelectOmitKeys | BasicInputDescriptionOmitKeys
>;

export type BasicSingleSelectRequiredProps = Pick<
  FullBasicSingleSelectProps,
  BasicSingleSelectRequiredKeys
>;

export type BasicSingleSelectOptionalProps = Partial<
  Omit<FullBasicSingleSelectProps, BasicSingleSelectRequiredKeys>
>;

export type BasicSingleSelectConfig = Pick<
  SingleSelectBaseProps,
  BasicSingleSelectOmitKeys
>;

export const basicSingleSelectConfig: BasicSingleSelectConfig = {
  labelFontSize: "text-sm",
  labelFontWeight: "font-normal",
  labelTextColor: "text-instillGrey50",
  labelLineHeight: "leading-[18.2px]",
  labelFontFamily: "font-sans",
  labelActivateStyle: "top-1/2 -translate-y-[120%]",
  labelDeActivateStyle: "top-1/2 -translate-y-1/2",
  errorLabelFontFamily: "font-sans",
  errorLabelFontSize: "text-sm",
  errorLabelFontWeight: "font-normal",
  errorLabelLineHeight: "leading-[18.2px]",
  errorLabelTextColor: "text-instillRed",
};

export type BasicSingleSelectProps = BasicSingleSelectRequiredProps &
  BasicSingleSelectOptionalProps;

const BasicSingleSelect: React.FC<BasicSingleSelectProps> = (props) => {
  const {
    id,
    inputLabelType,
    instanceId,
    onChange,
    value,
    options,
    label,
    onFocus,
    onBlur,
    additionalMessageOnLabel,
    menuPlacement,
    description,
    error,
    disabled,
    readOnly,
    required,
    isClearable,
  } = props;

  return (
    <SingleSelectBase
      id={id}
      inputLabelType={inputLabelType ?? "inset"}
      instanceId={instanceId}
      onChange={onChange}
      value={value}
      options={options}
      label={label}
      onFocus={onFocus ?? null}
      onBlur={onBlur ?? null}
      additionalMessageOnLabel={additionalMessageOnLabel ?? null}
      menuPlacement={menuPlacement ?? "auto"}
      description={description ?? ""}
      error={error ?? null}
      disabled={disabled ?? false}
      readOnly={readOnly ?? false}
      required={required ?? false}
      isClearable={isClearable ?? false}
      {...basicInputDescriptionConfig}
      {...basicSingleSelectConfig}
    />
  );
};

export default BasicSingleSelect;
