import { isAxiosError } from "axios";
import { useRouter } from "next/router";
import { shallow } from "zustand/shallow";

import { Button, Icons, useToast } from "@instill-ai/design-system";
import {
  CreatePipelinePayload,
  Nullable,
  PipelineBuilderStore,
  UpdatePipelinePayload,
  getInstillApiErrorMessage,
  useActivatePipeline,
  useCreatePipeline,
  useDeActivatePipeline,
  usePipeline,
  usePipelineBuilderStore,
  useRenamePipeline,
  useUpdatePipeline,
  useWatchPipeline,
} from "../../../lib";
import { constructPipelineRecipe } from "../../../lib/pipeline-builder";

const pipelineBuilderSelector = (state: PipelineBuilderStore) => ({
  nodes: state.nodes,
  edges: state.edges,
  pipelineId: state.pipelineId,
  pipelineDescription: state.pipelineDescription,
  setPipelineUid: state.setPipelineUid,
});

export type FlowControlProps = {
  accessToken: Nullable<string>;
  enableQuery: boolean;
};

export const FlowControl = (props: FlowControlProps) => {
  const { accessToken, enableQuery } = props;
  const router = useRouter();
  const { nodes, pipelineId, pipelineDescription, setPipelineUid, edges } =
    usePipelineBuilderStore(pipelineBuilderSelector, shallow);

  const { toast } = useToast();
  const { id } = router.query;

  const pipeline = usePipeline({
    pipelineName: `pipelines/${id}`,
    accessToken,
    enabled: !!id && enableQuery,
  });

  const pipelineWatchState = useWatchPipeline({
    pipelineName: `pipelines/${id}`,
    accessToken,
    enabled: !!id && enableQuery,
  });

  const updatePipeline = useUpdatePipeline();
  const createPipeline = useCreatePipeline();
  const activatePipeline = useActivatePipeline();
  const deactivatePipeline = useDeActivatePipeline();
  const renamePipeline = useRenamePipeline();

  function handleTogglePipeline() {
    if (!pipeline.isSuccess || !pipelineWatchState.isSuccess) return;

    if (
      pipelineWatchState.data.state === "STATE_ACTIVE" ||
      pipelineWatchState.data.state === "STATE_ERROR"
    ) {
      deactivatePipeline.mutate(
        {
          pipelineName: `pipelines/${pipelineId}`,
          accessToken,
        },
        {
          onSuccess: () => {
            toast({
              title: "Successfully deativated the pipeline",
              variant: "alert-success",
              size: "small",
            });
          },
          onError: (error) => {
            if (isAxiosError(error)) {
              toast({
                title: "Something went wrong when deactivated the pipeline",
                description: getInstillApiErrorMessage(error),
                variant: "alert-error",
                size: "large",
              });
            } else {
              toast({
                title: "Something went wrong when deactivated the pipeline",
                variant: "alert-error",
                size: "large",
              });
            }
          },
        }
      );
    } else {
      activatePipeline.mutate(
        {
          pipelineName: `pipelines/${pipelineId}`,
          accessToken,
        },
        {
          onSuccess: () => {
            toast({
              title: "Successfully activated the pipeline",
              variant: "alert-success",
              size: "small",
            });
          },
          onError: (error) => {
            if (isAxiosError(error)) {
              toast({
                title: "Something went wrong when activated the pipeline",
                description: getInstillApiErrorMessage(error),
                variant: "alert-error",
                size: "large",
              });
            } else {
              toast({
                title: "Something went wrong when activated the pipeline",
                variant: "alert-error",
                size: "large",
              });
            }
          },
        }
      );
    }
  }

  async function handleUpdatePipeline() {
    if (!pipelineId) {
      toast({
        title: "Pipeline ID not set",
        description:
          "The pipeline ID should be set before saving the pipeline.",
        variant: "alert-error",
        size: "large",
      });
      return;
    }

    if (pipeline.isSuccess) {
      if (pipelineId !== pipeline.data.id) {
        try {
          await renamePipeline.mutateAsync({
            payload: {
              pipelineId: pipeline.data.id,
              newPipelineId: pipelineId,
            },
            accessToken,
          });

          router.push(`/pipelines/${pipelineId}`, undefined, {
            shallow: true,
          });
        } catch (error) {
          if (isAxiosError(error)) {
            toast({
              title: "Something went wrong when rename the pipeline",
              description: getInstillApiErrorMessage(error),
              variant: "alert-error",
              size: "large",
            });
          } else {
            toast({
              title: "Something went wrong when rename the pipeline",
              variant: "alert-error",
              description: "Please try again later",
              size: "large",
            });
          }
        }
      }

      const payload: UpdatePipelinePayload = {
        name: `pipelines/${pipelineId}`,
        description: pipelineDescription ?? undefined,
        recipe: constructPipelineRecipe(nodes, edges),
      };

      updatePipeline.mutate(
        {
          payload,
          accessToken,
        },
        {
          onSuccess: () => {
            toast({
              title: "Pipeline is saved",
              variant: "alert-success",
              size: "small",
            });
          },
          onError: (error) => {
            if (isAxiosError(error)) {
              toast({
                title: "Something went wrong when save the pipeline",
                description: getInstillApiErrorMessage(error),
                variant: "alert-error",
                size: "large",
              });
            } else {
              toast({
                title: "Something went wrong when save the pipeline",
                variant: "alert-error",
                size: "large",
              });
            }
          },
        }
      );

      return;
    }

    const payload: CreatePipelinePayload = {
      id: pipelineId,
      recipe: constructPipelineRecipe(nodes, edges),
    };

    createPipeline.mutate(
      {
        payload,
        accessToken,
      },
      {
        onSuccess: async (res) => {
          setPipelineUid(res.pipeline.uid);

          router.push(`/pipelines/${pipelineId}`, undefined, {
            shallow: true,
          });

          if (!pipelineDescription) {
            toast({
              title: "Pipeline is saved",
              variant: "alert-success",
              size: "small",
            });
            return;
          }
          updatePipeline.mutate(
            {
              payload: {
                name: res.pipeline.name,
                description: pipelineDescription,
                recipe: {
                  version: "v1alpha",
                  components: [],
                },
              },
              accessToken,
            },
            {
              onSuccess: () => {
                toast({
                  title: "Pipeline is saved",
                  variant: "alert-success",
                  size: "small",
                });
              },
              onError: (error) => {
                if (isAxiosError(error)) {
                  toast({
                    title: "Something went wrong when save the pipeline",
                    description: getInstillApiErrorMessage(error),
                    variant: "alert-error",
                    size: "large",
                  });
                } else {
                  toast({
                    title: "Something went wrong when save the pipeline",
                    variant: "alert-error",
                    size: "large",
                  });
                }
              },
            }
          );
        },
        onError: (error) => {
          if (isAxiosError(error)) {
            toast({
              title: "Something went wrong when save the pipeline",
              description: getInstillApiErrorMessage(error),
              variant: "alert-error",
              size: "large",
            });
          } else {
            toast({
              title: "Something went wrong when save the pipeline",
              variant: "alert-error",
              size: "large",
            });
          }
        },
      }
    );
  }

  return (
    <div className="absolute bottom-4 right-4 flex flex-row-reverse gap-x-4">
      <Button
        onClick={handleTogglePipeline}
        className="gap-x-2"
        variant="primary"
        size="lg"
        disabled={
          pipeline.isSuccess && pipelineWatchState.isSuccess ? false : true
        }
      >
        {pipelineWatchState.isSuccess ? (
          pipelineWatchState.data.state === "STATE_ACTIVE" ||
          pipelineWatchState.data.state === "STATE_ERROR" ? (
            <>
              <span>Deactivate</span>
              <Icons.Stop className="h-4 w-4 fill-semantic-fg-on-default stroke-semantic-fg-on-default group-disabled:fill-semantic-fg-disabled group-disabled:stroke-semantic-fg-disabled" />
            </>
          ) : (
            <>
              <span>Activate</span>
              <Icons.Play className="h-4 w-4 fill-semantic-fg-on-default stroke-semantic-fg-on-default group-disabled:fill-semantic-fg-disabled group-disabled:stroke-semantic-fg-disabled" />
            </>
          )
        ) : (
          "Disabled"
        )}
      </Button>
      <Button
        onClick={handleUpdatePipeline}
        className="gap-x-2"
        variant="secondaryGrey"
        size="lg"
      >
        {pipeline.isSuccess ? (
          <>
            Save
            <Icons.Save01 className="h-5 w-5 stroke-semantic-fg-primary" />
          </>
        ) : (
          "Create"
        )}
      </Button>
    </div>
  );
};
