import cn from "clsx";
import { useEffect, useMemo, useRef } from "react";
import { getElementPosition } from "@instill-ai/design-system";

import { ProgressStep } from "./ProgressStep";
import {
  useOnScreen,
  useCreateResourceFormStore,
  type Nullable,
} from "../../../../lib";

//  Currently, we make number 0 & 1 stay at the first step
//  0: Choose pipeline mode
//  1: Choose pipeline mode (This should be choose source in the future, when
//     we let user create source)
//  2: choose model
//  3: choose destination
//  4: setup pipeline details

export type CreatePipelineProgressProps = {
  marginBottom: Nullable<string>;
};

export const CreatePipelineProgress = ({
  marginBottom,
}: CreatePipelineProgressProps) => {
  const pipelineFormStep = useCreateResourceFormStore(
    (state) => state.pipelineFormStep
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const firstStepCubeRef = useRef<HTMLDivElement>(null);
  const secondStepCubeRef = useRef<HTMLDivElement>(null);
  const thirdStepCubeRef = useRef<HTMLDivElement>(null);
  const lastStepCubeRef = useRef<HTMLDivElement>(null);
  const firstConnectionLineRef = useRef<HTMLDivElement>(null);
  const secondConnectionLineRef = useRef<HTMLDivElement>(null);
  const thirdConnectionLineRef = useRef<HTMLDivElement>(null);

  const contanierIsOnScreen = useOnScreen(containerRef);

  // Calculate the position and wdith of three connection line

  const connectionLine = useMemo(() => {
    if (!contanierIsOnScreen) {
      return null;
    }

    const containerPosition = getElementPosition(
      containerRef.current as HTMLDivElement
    );
    const firstStepCubePosition = getElementPosition(
      firstStepCubeRef.current as HTMLDivElement
    );
    const secondStepCubePosition = getElementPosition(
      secondStepCubeRef.current as HTMLDivElement
    );
    const thirdStepCubePosition = getElementPosition(
      thirdStepCubeRef.current as HTMLDivElement
    );
    const lastStepCubePosition = getElementPosition(
      lastStepCubeRef.current as HTMLDivElement
    );

    return (
      <>
        <div
          ref={firstConnectionLineRef}
          className="absolute h-[1px] border-t border-instillGrey20"
          style={{
            top:
              firstStepCubePosition.y -
              containerPosition.y +
              firstStepCubePosition.height / 2,
            left:
              firstStepCubePosition.x -
              containerPosition.x +
              firstStepCubePosition.width,
            width: `${
              secondStepCubePosition.x -
              firstStepCubePosition.x -
              firstStepCubePosition.width
            }px`,
          }}
        />
        <div
          ref={secondConnectionLineRef}
          className="absolute h-[1px] border-t border-instillGrey20"
          style={{
            top:
              secondStepCubePosition.y -
              containerPosition.y +
              secondStepCubePosition.height / 2,
            left:
              secondStepCubePosition.x -
              containerPosition.x +
              secondStepCubePosition.width,
            width: `${
              thirdStepCubePosition.x -
              secondStepCubePosition.x -
              secondStepCubePosition.width
            }px`,
          }}
        />
        <div
          ref={thirdConnectionLineRef}
          className="absolute h-[1px] border-t border-instillGrey20"
          style={{
            top:
              thirdStepCubePosition.y -
              containerPosition.y +
              thirdStepCubePosition.height / 2,
            left:
              thirdStepCubePosition.x -
              containerPosition.x +
              thirdStepCubePosition.width,
            width: `${
              lastStepCubePosition.x -
              thirdStepCubePosition.x -
              thirdStepCubePosition.width
            }px`,
          }}
        />
      </>
    );
  }, [contanierIsOnScreen]);

  // Update connection line's color according to current progression

  useEffect(() => {
    if (pipelineFormStep >= 2) {
      firstConnectionLineRef.current?.classList.remove("border-instillGrey20");
      firstConnectionLineRef.current?.classList.add("border-instillBlue50");
    }

    if (pipelineFormStep >= 3) {
      secondConnectionLineRef.current?.classList.remove("border-instillGrey20");
      secondConnectionLineRef.current?.classList.add("border-instillBlue50");
    }

    if (pipelineFormStep === 4) {
      thirdConnectionLineRef.current?.classList.remove("border-instillGrey20");
      thirdConnectionLineRef.current?.classList.add("border-instillBlue50");
    }
  }, [pipelineFormStep]);

  return (
    <div ref={containerRef} className={cn("relative", marginBottom)}>
      <div className="grid grid-cols-4">
        <ProgressStep
          stepNum={1}
          stepName="Source"
          ref={firstStepCubeRef}
          isCurrent={
            pipelineFormStep === 0
              ? true
              : pipelineFormStep === 1
              ? true
              : false
          }
          isPassed={pipelineFormStep > 1 ? true : false}
        />
        <ProgressStep
          stepNum={2}
          ref={secondStepCubeRef}
          stepName="Model"
          isCurrent={pipelineFormStep === 2 ? true : false}
          isPassed={pipelineFormStep > 2 ? true : false}
        />
        <ProgressStep
          stepNum={3}
          ref={thirdStepCubeRef}
          stepName="Destination"
          isCurrent={pipelineFormStep === 3 ? true : false}
          isPassed={pipelineFormStep > 3 ? true : false}
        />
        <ProgressStep
          stepNum={4}
          stepName="Pipeline"
          ref={lastStepCubeRef}
          isCurrent={pipelineFormStep === 4 ? true : false}
          isPassed={pipelineFormStep > 4 ? true : false}
        />
      </div>
      {connectionLine}
    </div>
  );
};