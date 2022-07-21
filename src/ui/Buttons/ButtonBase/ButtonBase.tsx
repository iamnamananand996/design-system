import React from "react";
import cn from "clsx";
import { Nullable } from "../../../types/general";

export type ButtonBaseProps = {
  /**
   * The action type of the button
   */
  type: "button" | "submit" | "reset";

  /**
   * Whether the button is disabled or not
   */
  disabled: boolean;

  /**
   * The onClickHandler of the button
   */
  onClickHandler: Nullable<() => any>;

  /** TailwindCSS format - The background color of the button
   * - e.g. bg-blue-100
   */
  bgColor: Nullable<string>;

  /** TailwindCSS format - The background color of the button when hovered
   * - Please use Tailwind hover state
   * - e.g. hover:bg-blue-100
   */
  hoveredBgColor: Nullable<string>;

  /** TailwindCSS format - The background color of the button when disabled
   * - e.g. bg-slate-100
   */
  disabledBgColor: Nullable<string>;

  /** TailwindCSS format - The text color of the button
   * - e.g. text-black
   */
  textColor: Nullable<string>;

  /** TailwindCSS format - The text color of the button when hovered
   * - Please use Tailwind hover state
   * - e.g. hover:text-blue-100
   */
  hoveredTextColor: Nullable<string>;

  /** TailwindCSS format - The text color of the button when disabled
   * - e.g. text-blue-100
   */
  disabledTextColor: Nullable<string>;

  /** TailwindCSS format - The border size of the button
   * - e.g. border
   */
  borderSize: Nullable<string>;

  /** TailwindCSS format - The border color of the button
   * - e.g. border-blue-100
   */
  borderColor: Nullable<string>;

  /** TailwindCSS format - The border radius of the button
   * - You could specific different corner's style here
   * - e.g. rounded
   * - e.g. rounded-r-md
   */
  borderRadius: Nullable<string>;

  /** TailwindCSS format - The border color of the button when hovered
   * - Please use Tailwind hover state
   * - e.g. hover:border-blue-100
   */
  hoveredBorderColor: Nullable<string>;

  /** TailwindCSS format - The border color of the button when disabled
   * - e.g. border-blue-100
   */
  disabledBorderColor: Nullable<string>;

  /** TailwindCSS format - The position of the button.
   * - Please use margin auto to control the position of button under flexbox
   * - e.g. mx-auto
   */
  position: Nullable<string>;

  /**
   * The dataFlag of the button
   */
  dataFlag: Nullable<string | number>;

  /**
   * TailwindCSS format - The padding of the button
   * - You could specific media query here
   * - e.g. p-5 md:p-10
   */
  padding: Nullable<string>;

  /**
   * TailwindCSS format - The width of the button
   * - e.g. w-20
   */
  width: Nullable<string>;

  /**
   * The icon present at the start of the button
   * - If the icon need to change color when hover, please use group-hover state
   *   - e.g. group-hover:fill-instillBlue50
   */
  startIcon: Nullable<React.ReactElement>;

  /**
   * The icon present at the end of the button
   * - If the icon need to change color when hover, please use group-hover state
   *   - e.g. group-hover:fill-instillBlue50
   */
  endIcon: Nullable<React.ReactElement>;

  /**
   * TailwindCSS format - Gap between icon and text in the button
   * - It will only apply when startIcon or endIcon is present
   * - e.g. gap-x-2
   */
  itemGapX: Nullable<string>;
};

const ButtonBase: React.FC<ButtonBaseProps> = ({
  bgColor,
  hoveredBgColor,
  disabled,
  disabledBgColor,
  disabledTextColor,
  textColor,
  hoveredTextColor,
  onClickHandler,
  position,
  type,
  dataFlag,
  children,
  padding,
  width,
  borderSize,
  borderColor,
  borderRadius,
  hoveredBorderColor,
  disabledBorderColor,
  startIcon,
  endIcon,
  itemGapX,
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClickHandler ? onClickHandler : undefined}
      type={type}
      data-flag={dataFlag}
      className={cn(
        "group rounded-[1px] flex flex-row",
        startIcon ? itemGapX : endIcon ? itemGapX : "",
        disabled
          ? cn(
              disabledBgColor,
              disabledTextColor,
              disabledBorderColor,
              "cursor-not-allowed"
            )
          : cn(
              bgColor,
              hoveredBgColor,
              textColor,
              hoveredTextColor,
              borderColor,
              hoveredBorderColor
            ),
        position,
        padding,
        width,
        borderSize,
        borderRadius
      )}
    >
      {startIcon}
      {children}
      {endIcon}
    </button>
  );
};

export default ButtonBase;
