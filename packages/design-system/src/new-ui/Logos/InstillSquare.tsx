import * as React from "react";
import { LogoBase, LogoBaseProps } from "./LogoBase";

export const InstillSquare = React.forwardRef<
  SVGSVGElement,
  Omit<LogoBaseProps, "viewBox" | "children">
>((props, ref) => {
  const { className, ...passThrough } = props;
  return (
    <LogoBase
      {...passThrough}
      ref={ref}
      viewBox="0 0 60 60"
      className={className}
    >
      <g clip-path="url(#clip0_220_93)">
        <path
          d="M54.0017 50.3244V54.0185H6.00003V5.99997H54.0017V50.3244ZM50.309 50.3244V39.2032H46.6146V50.3244H50.309ZM50.309 35.5091V24.4689H39.187V35.5091H50.309ZM50.309 20.7748V17.0807H39.187V20.7748H50.309ZM50.309 13.3882V9.6941H39.187V13.3882H50.309ZM42.9236 50.3244V39.2032H39.187V50.3244H42.9236ZM35.4943 46.6303V39.1981H31.8455V42.9142H28.1967V46.6303H35.4943ZM35.4943 35.5091V24.4689H31.8455V35.5091H35.4943ZM35.4943 17.057V9.6941H28.1545V13.3494L28.1326 13.4136H24.4618V20.7748H31.8455V17.0587L35.4943 17.057ZM28.1545 42.8551V39.2032H24.4618V42.8551H28.1545ZM28.1545 35.5091V24.4689H24.4618V35.5091H28.1545ZM20.7691 50.3244V39.2032H9.69273V50.3244H20.7691ZM20.7691 35.5091V24.4689H17.0764V35.5091H20.7691ZM20.7691 20.7748V13.4136H20.7387V9.69747H17.0764V20.7782L20.7691 20.7748ZM13.3854 35.5091V24.4689H9.69273V35.5091H13.3854ZM13.3854 20.7748V9.6941H9.69273V20.7748H13.3854Z"
          fill="#1A1A1A"
        />
        <path
          d="M50.3073 39.2032H46.6146V50.3244H50.3073V39.2032Z"
          fill="#40A8F5"
        />
        <path
          d="M50.3073 24.4689H39.187V35.5091H50.3073V24.4689Z"
          fill="#40A8F5"
        />
        <path
          d="M50.3073 17.0807H39.187V20.7748H50.3073V17.0807Z"
          fill="#FF5353"
        />
        <path
          d="M50.3073 9.69412H39.187V13.3882H50.3073V9.69412Z"
          fill="#FFDF3A"
        />
        <path
          d="M42.9219 39.2032H39.187V50.3244H42.9219V39.2032Z"
          fill="#FFDF3A"
        />
        <path
          d="M35.496 39.2032V46.6303H28.1967V42.9159H31.8455V39.2032H35.496Z"
          fill="#FF5353"
        />
        <path
          d="M35.4943 24.4689H31.8455V35.5091H35.4943V24.4689Z"
          fill="#FFDF3A"
        />
        <path
          d="M35.496 9.69412V17.057H31.8455H31.8235V13.3494H28.1528V9.69412H35.496Z"
          fill="#40A8F5"
        />
        <path
          d="M31.8455 17.057V20.7748H24.4618V13.4136H28.1309V17.057H31.8235H31.8455Z"
          fill="#FFDF3A"
        />
        <path
          d="M31.8236 13.3494V17.057H28.1309V13.4136L28.1528 13.3494H31.8236Z"
          fill="#1A1A1A"
        />
        <path
          d="M28.1545 39.2032H24.4618V42.8551H28.1545V39.2032Z"
          fill="#28F77E"
        />
        <path
          d="M28.1545 24.4689H24.4618V35.5091H28.1545V24.4689Z"
          fill="#FF5353"
        />
        <path
          d="M20.7691 39.2032V50.3244H9.69269V39.2032H13.3837H17.0764H20.7691Z"
          fill="#40A8F5"
        />
        <path
          d="M20.7691 24.4689H17.0764V35.5091H20.7691V24.4689Z"
          fill="#40A8F5"
        />
        <path
          d="M20.7691 13.4136V20.7748H17.0764V9.69412H20.7438V13.4136H20.7691Z"
          fill="#FFDF3A"
        />
        <path
          d="M13.3854 24.4689H9.69269V35.5091H13.3854V24.4689Z"
          fill="#FFDF3A"
        />
        <path
          d="M13.3854 9.69412H9.69269V20.7748H13.3854V9.69412Z"
          fill="#FF5353"
        />
      </g>
      <defs>
        <clipPath id="clip0_220_93">
          <rect
            width="48"
            height="48"
            fill="white"
            transform="translate(6 6)"
          />
        </clipPath>
      </defs>
    </LogoBase>
  );
});
InstillSquare.displayName = "InstillSquare";
