import { IconStyle } from "../types/general";
import cn from "clsx";
import {
  ImageClassificationIcon,
  ImageToImageIcon,
  ImageToTextIcon,
  InstanceSegmentationIcon,
  KeypointDetectionIcon,
  ObjectDetectionIcon,
  OpticalCharacterRecognitionIcon,
  SemanticSegmentationIcon,
  TextGenerationIcon,
  TextToImageIcon,
} from "../ui";

export const getModelInstanceTaskToolkit = (task: string) => {
  switch (task) {
    case "TASK_CLASSIFICATION":
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <ImageClassificationIcon {...iconStyle} />;
        },
        label: "Classification",
      };
    case "TASK_DETECTION":
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <ObjectDetectionIcon {...iconStyle} />;
        },
        label: "Object Detection",
      };

    case "TASK_KEYPOINT":
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <KeypointDetectionIcon {...iconStyle} />;
        },
        label: "Keypoint Detection",
      };

    case "TASK_OCR":
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <OpticalCharacterRecognitionIcon {...iconStyle} />;
        },
        label: "Ocr",
      };

    case "TASK_INSTANCE_SEGMENTATION":
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <InstanceSegmentationIcon {...iconStyle} />;
        },
        label: "Instance Segmentation",
      };

    case "TASK_SEMANTIC_SEGMENTATION":
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <SemanticSegmentationIcon {...iconStyle} />;
        },
        label: "Semantic Segmentation",
      };

    case "TASK_TEXT_GENERATION":
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <TextGenerationIcon {...iconStyle} />;
        },
        label: "Text Generation",
      };

    case "TASK_TEXT_TO_IMAGE":
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <TextToImageIcon {...iconStyle} />;
        },
        label: "Text To Image",
      };

    case "TASK_IMAGE_TO_IMAGE":
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <ImageToImageIcon {...iconStyle} />;
        },
        label: "Image To Image",
      };

    case "TASK_IMAGE_TO_TEXT":
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <ImageToTextIcon {...iconStyle} />;
        },
        label: "Image To Text",
      };

    default:
      return {
        getIcon: (iconStyle: IconStyle) => {
          return <div className={cn(iconStyle.width, iconStyle.height)} />;
        },
        label: "",
      };
  }
};