import React from "react";
import { Nullable, State } from "../../../types/general";
import {
  basicInputDescriptionConfig,
  BasicInputDescriptionOmitProps,
} from "../../InputDescriptions";
import ToggleFieldBase, { ToggleFieldBaseProps } from "../ToggleFieldBase";

export type StatefulToggleFieldProps = Omit<
  ToggleFieldBaseProps,
  | "focusHighlight"
  | "dotColor"
  | "checkedDotColor"
  | "inputBorderRadius"
  | "inputBorderColor"
  | "inputBorderStyle"
  | "inputBorderWidth"
  | "inputBgColor"
  | "inputShadow"
  | "inputFocusBorderColor"
  | "inputFocusShadow"
  | "checkedInputBorderColor"
  | "disabledDotColor"
  | "disabledCheckedDotColor"
  | "disabledCursor"
  | "disabledInputBgColor"
  | "disabledInputBorderColor"
  | "disabledInputBorderStyle"
  | "disabledInputBorderWidth"
  | "disabledCheckedInputBorderColor"
  | "readOnlyCursor"
  | "readOnlyInputBgColor"
  | "readOnlyInputBorderColor"
  | "readOnlyInputBorderStyle"
  | "readOnlyInputBorderWidth"
  | "readOnlyCheckedInputBorderColor"
  | "readOnlyCheckedDotColor"
  | "readOnlyDotColor"
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
  | "errorLabelTextColor"
  | "inputShadow"
  | "inputFocusBorderColor"
  | "inputFocusShadow"
  | BasicInputDescriptionOmitProps
> & {
  state: Nullable<State>;
};

const StatefulToggleField: React.FC<StatefulToggleFieldProps> = (props) => {
  return (
    <ToggleFieldBase
      id={props.id}
      value={props.value}
      additionalMessageOnLabel={
        props.state === "STATE_LOADING"
          ? "Loading..."
          : props.additionalMessageOnLabel
      }
      description={props.description}
      error={props.error}
      readOnly={props.readOnly}
      onChangeInput={props.onChangeInput}
      required={props.required}
      label={props.label}
      focusHighlight={true}
      dotColor="bg-instillGrey30"
      checkedDotColor="bg-instillBlue50"
      inputBgColor="bg-white"
      inputBorderRadius=""
      inputBorderColor={
        props.state === "STATE_LOADING"
          ? "border-lemonYellow50"
          : "border-instillGrey20"
      }
      inputBorderStyle="border-solid"
      inputBorderWidth="border"
      inputFocusBorderColor={
        props.state === "STATE_LOADING" ? "" : "border-instillBlue50"
      }
      inputFocusShadow={
        props.state === "STATE_LOADING" ? "" : "instill-input-focus-shadow"
      }
      inputShadow={
        props.state === "STATE_LOADING" ? "instill-toggle-loading-shadow" : null
      }
      checkedInputBorderColor="border-instillBlue50"
      disabled={props.disabled}
      disabledDotColor="bg-instillGrey20"
      disabledCheckedDotColor="bg-[#8DF5FF]"
      disabledCursor="cursor-not-allowed"
      disabledInputBgColor="bg-white"
      disabledInputBorderColor="border-instillGrey20"
      disabledInputBorderStyle="border-dashed"
      disabledInputBorderWidth="border"
      disabledCheckedInputBorderColor="border-instillGrey20"
      readOnlyCursor="cursor-auto"
      readOnlyInputBgColor="bg-white"
      readOnlyInputBorderColor="border-instillGrey20"
      readOnlyInputBorderStyle="border-solid"
      readOnlyInputBorderWidth="border"
      readOnlyCheckedInputBorderColor="border-[#8DF5FF]"
      readOnlyCheckedDotColor="bg-[#8DF5FF]"
      readOnlyDotColor="bg-instillGrey20"
      labelFontSize="text-sm"
      labelFontWeight="font-normal"
      labelTextColor="text-instillGrey50"
      labelLineHeight="leading-[18.2px]"
      labelFontFamily="font-sans"
      labelActivateStyle="top-1/2 -translate-y-[120%]"
      labelDeActivateStyle="top-1/2 -translate-y-1/2"
      errorLabelFontFamily="font-sans"
      errorLabelFontSize="text-sm"
      errorLabelFontWeight="font-normal"
      errorLabelLineHeight="leading-[18.2px]"
      errorLabelTextColor="text-instillRed"
      {...basicInputDescriptionConfig}
    />
  );
};

export default StatefulToggleField;