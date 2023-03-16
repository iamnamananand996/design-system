import { Nullable } from "../../type";
import { getModelOperationQuery } from "./queries";
import { ModelHubPreset } from "./types";

export const checkCreateModelOperationUntilDone = async ({
  operationName,
  accessToken,
}: {
  operationName: string;
  accessToken: Nullable<string>;
}) => {
  try {
    const operation = await getModelOperationQuery({
      operationName,
      accessToken,
    });
    if (operation.done) {
      return Promise.resolve(true);
    } else {
      return new Promise((resolve) => {
        setTimeout(async () => {
          const result = await checkCreateModelOperationUntilDone({
            operationName,
            accessToken,
          });
          resolve(result);
        }, 1500);
      });
    }
  } catch (err) {
    return Promise.reject(err);
  }
};

export const modelHubPresetsList: ModelHubPreset[] = [
  {
    id: "mobilenetv2",
    description:
      "An efficient image classification model, pretrained on ImageNet dataset which contains images from 1,000 classes.",
    task: "TASK_CLASSIFICATION",
    model_definition: "model-definitions/github",
    configuration: {
      repository: "instill-ai/model-mobilenetv2",
    },
  },
  {
    id: "vit-base-patch16-224",
    description:
      "Vision Transformer (ViT) model pretrained on ImageNet-21k and fine-tuned on ImageNet 2012, which contains images from 1,000 classes, at resolution 224x224.",
    task: "TASK_CLASSIFICATION",
    model_definition: "model-definitions/huggingface",
    configuration: {
      repo_id: "google/vit-base-patch16-224",
    },
  },
  {
    id: "yolov4",
    description:
      "YOLOv4 is a classic object detector pretrained on MS COCO dataset with 80 object classes.",
    task: "TASK_DETECTION",
    model_definition: "model-definitions/github",
    configuration: {
      repository: "instill-ai/model-yolov4-dvc",
    },
  },
  {
    id: "yolov7",
    description:
      "YOLOv7 is a state-of-the-art real-time object detector pretrained on MS COCO dataset with 80 object classes.",
    task: "TASK_DETECTION",
    model_definition: "model-definitions/github",
    configuration: {
      repository: "instill-ai/model-yolov7-dvc",
    },
  },
  {
    id: "keypoint-r-cnn-r50-fpn",
    description:
      "A keypoint detector, extended on the basis of Mask R-CNN, to detect keypoints in the human body. The model is pretrained on MS COCO dataset with 17 keypoints.",
    task: "TASK_KEYPOINT",
    model_definition: "model-definitions/github",
    configuration: {
      repository: "instill-ai/model-keypoint-detection-dvc",
    },
  },
  {
    id: "psnet-easyocr",
    description:
      "An OCR model that combines the PSNet model to localise bounding boxes that contain texts and the EasyOCR model to recognise texts in the detected bounding boxes.",
    task: "TASK_OCR",
    model_definition: "model-definitions/github",
    configuration: {
      repository: "instill-ai/model-ocr-dvc",
    },
  },
  {
    id: "mask-rcnn",
    description:
      "Mask R-CNN is a state-of-the-art instance segmentation model, pretrained on MS COCO dataset with 80 object classes.",
    task: "TASK_INSTANCE_SEGMENTATION",
    model_definition: "model-definitions/github",
    configuration: {
      repository: "instill-ai/model-instance-segmentation-dvc",
    },
  },
  {
    id: "semantic-segmentation",
    description:
      "A semantic segmentation model based on MobileNetV3 from the OpenMMLab semantic segmentation toolbox and benchmark.",
    task: "TASK_SEMANTIC_SEGMENTATION",
    model_definition: "model-definitions/github",
    configuration: {
      repository: "instill-ai/model-semantic-segmentation-dvc",
    },
  },
  {
    id: "stable-diffusion-2-fp32-txt2img",
    description:
      "Stable Diffusion v2 generates high quality images based on text prompts.",
    task: "TASK_TEXT_TO_IMAGE",
    model_definition: "model-definitions/github",
    configuration: {
      repository: "instill-ai/model-stable-diffusion-2-dvc",
    },
  },
  {
    id: "gpt-2",
    description:
      "GPT-2, from OpenAI, is trained to generate text based on your prompts.",
    task: "TASK_TEXT_GENERATION",
    model_definition: "model-definitions/github",
    configuration: {
      repository: "instill-ai/model-gpt2-dvc",
    },
  },
];
