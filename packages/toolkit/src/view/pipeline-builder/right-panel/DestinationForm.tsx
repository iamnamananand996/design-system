import * as React from "react";
import * as yup from "yup";
import { isAxiosError } from "axios";
import { shallow } from "zustand/shallow";

import {
  FormRoot,
  BasicSingleSelect,
  BasicTextArea,
  DataDestinationIcon,
  useToast,
  Button,
  Icons,
  BasicTextField,
  type FormRootProps,
} from "@instill-ai/design-system";
import {
  useAirbyteFormTree,
  useBuildAirbyteYup,
  dot,
  useAirbyteSelectedConditionMap,
  useUpdateConnector,
  useAmplitudeCtx,
  sendAmplitudeData,
  getInstillApiErrorMessage,
  useCreateConnector,
  useConnectConnector,
  useDisonnectConnector,
  useConnectors,
  useAirbyteFieldValues,
  usePipelineBuilderStore,
  type AirbyteFieldErrors,
  type AirbyteFieldValues,
  type UpdateConnectorPayload,
  type Nullable,
  type CreateConnectorPayload,
  type IncompleteConnectorWithWatchState,
  type PipelineBuilderStore,
  type ConnectorWithWatchState,
} from "../../../lib";
import { ImageWithFallback } from "../../../components";
import { AirbyteDestinationFields } from "../../airbyte";

export type DestinationFormProps = {
  accessToken: Nullable<string>;
  destination: ConnectorWithWatchState | IncompleteConnectorWithWatchState;
  enableQuery: boolean;
} & Pick<FormRootProps, "marginBottom" | "width">;

const pipelineBuilderSelector = (state: PipelineBuilderStore) => ({
  updateResourceFormIsDirty: state.updateResourceFormIsDirty,
  updateSelectedNode: state.updateSelectedNode,
  updateNodes: state.updateNodes,
});

export const DestinationForm = (props: DestinationFormProps) => {
  const { destination, accessToken, enableQuery, width, marginBottom } = props;
  const { amplitudeIsInit } = useAmplitudeCtx();

  /* -------------------------------------------------------------------------
   * Initialize form state
   * -----------------------------------------------------------------------*/

  const { updateResourceFormIsDirty, updateSelectedNode, updateNodes } =
    usePipelineBuilderStore(pipelineBuilderSelector, shallow);

  /* -------------------------------------------------------------------------
   * Get the destination definition and static state for fields
   * -----------------------------------------------------------------------*/

  const isResponseOperator = React.useMemo(() => {
    if (destination.connector_definition.id === "response") {
      return true;
    }

    return false;
  }, [destination]);

  const destinationDefinitionOption = React.useMemo(() => {
    return {
      label: destination.connector_definition.title,
      value: destination.connector_definition.id,
      startIcon: (
        <ImageWithFallback
          src={
            destination.connector_definition.id.startsWith("airbyte")
              ? `/icons/airbyte/${destination.connector_definition.icon}`
              : `/icons/instill/${destination.connector_definition.icon}`
          }
          width={24}
          height={24}
          alt={`${destination.connector_definition.title}-icon`}
          fallbackImg={<DataDestinationIcon width="w-6" height="h-6" />}
        />
      ),
    };
  }, [destination]);

  /* -------------------------------------------------------------------------
   * Create interior state for managing the form
   * -----------------------------------------------------------------------*/

  const [airbyteFormIsDirty, setAirbyteFormIsDirty] = React.useState(false);

  React.useEffect(() => {
    updateResourceFormIsDirty(() => airbyteFormIsDirty);
  }, [airbyteFormIsDirty, updateResourceFormIsDirty]);

  const [fieldErrors, setFieldErrors] =
    React.useState<Nullable<AirbyteFieldErrors>>(null);

  const destinationFormTree = useAirbyteFormTree(
    destination.connector_definition
  );

  const initialValues: AirbyteFieldValues = {
    id: destination.id,
    configuration: destination.configuration,
    ...dot.toDot(destination.configuration),
    description:
      "description" in destination ? destination.description : undefined,
  };

  const [selectedConditionMap, setSelectedConditionMap] =
    useAirbyteSelectedConditionMap(destinationFormTree, initialValues);

  const { fieldValues, setFieldValues } = useAirbyteFieldValues(
    destinationFormTree,
    initialValues
  );

  const airbyteYup = useBuildAirbyteYup(
    destination.connector_definition.spec.connection_specification ?? null,
    selectedConditionMap,
    null
  );

  const formYup = React.useMemo(() => {
    if (!airbyteYup) return null;

    return yup.object({
      configuration: airbyteYup,
    });
  }, [airbyteYup]);

  const updateFieldValues = React.useCallback(
    (field: string, value: string) => {
      setAirbyteFormIsDirty(true);
      setFieldValues((prev) => {
        return {
          ...prev,
          [field]: value,
        };
      });
    },
    [setFieldValues, setAirbyteFormIsDirty]
  );

  /* -------------------------------------------------------------------------
   * get destinations
   * -----------------------------------------------------------------------*/

  const destinations = useConnectors({
    connectorType: "CONNECTOR_TYPE_DATA",
    accessToken,
    enabled: enableQuery,
  });

  // We will disable all the fields if the connector is public (which mean
  // it is provided by Instill AI)
  const disabledAll = React.useMemo(() => {
    if (!destinations.isSuccess) {
      return true;
    }

    if (
      "visibility" in destination &&
      destination.visibility === "VISIBILITY_PUBLIC"
    ) {
      return true;
    }

    if (destinations.data.some((e) => e.name === destination.name)) {
      if (destination.name === "connectors/response") {
        return true;
      }
    }

    return false;
  }, [destinations.isSuccess, destinations.data, destination]);

  /* -------------------------------------------------------------------------
   * Configure destination
   * -----------------------------------------------------------------------*/

  const updateDestination = useUpdateConnector();
  const createDestination = useCreateConnector();
  const { toast } = useToast();

  const handleSubmit = React.useCallback(async () => {
    if (!fieldValues || !formYup) {
      return;
    }

    let stripValues = {} as { configuration: AirbyteFieldValues };

    if (!airbyteFormIsDirty) {
      if (destination.name !== "connectors/response") {
        return;
      }
    }

    // We use yup to strip not necessary condition value. Please read
    // /lib/airbyte/README.md for more information, especially the section
    // How to remove old condition configuration when user select new one?

    try {
      stripValues = formYup.validateSync(fieldValues, {
        abortEarly: false,
        strict: false,
        stripUnknown: true,
      });
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        const errors = {} as AirbyteFieldErrors;
        for (const err of error.inner) {
          if (err.path) {
            const message = err.message.replace(err.path, "This field");
            const pathList = err.path.split(".");

            // Because we are using { configuration: airbyteYup } to construct the yup, yup will add "configuration" as prefix at the start
            // of the path like configuration.tunnel_method
            if (pathList[0] === "configuration") {
              pathList.shift();
            }

            const removeConfigurationPrefixPath = pathList.join(".");
            errors[removeConfigurationPrefixPath] = message;
          }
        }
        setFieldErrors(errors);
      }

      return;
    }

    // Optimistically update the selectedNode'id, because if the user change the pre-defined id
    // and the previous nodes and selectedNodes stay unchanged, we will have a problem to update
    // it once new data is coming in.

    const oldId = destination.id;
    const newId = fieldValues.id as string;

    updateSelectedNode((prev) => {
      if (prev === null) return prev;

      return {
        ...prev,
        data: {
          ...prev.data,
          connector: {
            ...prev.data.connector,
            id: newId,
            name: `connectors/${newId}`,
          },
        },
      };
    });

    updateNodes((prev) => {
      return prev.map((node) => {
        if (node.data.connector.id === oldId) {
          return {
            ...node,
            data: {
              ...node.data,
              connector: {
                ...node.data.connector,
                id: newId,
                name: `connectors/${newId}`,
              },
            },
          };
        }

        return node;
      });
    });

    if ("uid" in destination) {
      const payload: UpdateConnectorPayload = {
        connectorName: destination.name,
        description: fieldValues.description as string | undefined,
        ...stripValues,
      };

      updateDestination.mutate(
        { payload, accessToken },
        {
          onSuccess: () => {
            setAirbyteFormIsDirty(false);

            toast({
              title: "Succeed.",
              description: null,
              variant: "alert-success",
              size: "small",
            });

            if (amplitudeIsInit) {
              sendAmplitudeData("update_destination", {
                type: "critical_action",
                process: "destination",
              });
            }
          },
          onError: (error) => {
            // Rollback the selectedNode'id
            updateSelectedNode((prev) => {
              if (prev === null) return prev;

              return {
                ...prev,
                data: {
                  ...prev.data,
                  id: oldId,
                  name: `connectors/${oldId}`,
                },
              };
            });

            // Rollback the nodes'id
            updateNodes((prev) => {
              return prev.map((node) => {
                if (node.data.connector.id === newId) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      connector: {
                        ...node.data.connector,
                        id: oldId,
                        name: `connectors/${oldId}`,
                      },
                    },
                  };
                }

                return node;
              });
            });

            if (isAxiosError(error)) {
              toast({
                title: "Error",
                description: getInstillApiErrorMessage(error),
                variant: "alert-error",
                size: "large",
              });
            } else {
              toast({
                title: "Error",
                description: "Something went wrong when create the destination",
                variant: "alert-error",
                size: "large",
              });
            }
          },
        }
      );

      return;
    }

    let payload = {} as CreateConnectorPayload;

    // Response operator come from instill-ai and follow our own payload

    if (destination.id === "response") {
      payload = {
        connectorName: "connectors/response",
        connector_definition_name: destination.connector_definition_name,
        description: fieldValues.description as string,
        configuration: {},
      };
    } else {
      payload = {
        connectorName: `connectors/${fieldValues.id}` as string,
        connector_definition_name: destination.connector_definition_name,
        description: fieldValues.description as string,
        configuration: stripValues.configuration,
      };
    }

    createDestination.mutate(
      { payload, accessToken },
      {
        onSuccess: () => {
          toast({
            title: "Successfully create destination",
            variant: "alert-success",
            size: "small",
          });

          updateSelectedNode((prev) => {
            if (prev === null) return prev;

            return {
              ...prev,
              data: {
                ...prev.data,
                connector: {
                  ...prev.data.connector,
                  configuration: stripValues.configuration,
                  description: fieldValues.description as string,
                },
              },
            };
          });

          setAirbyteFormIsDirty(false);

          if (amplitudeIsInit) {
            sendAmplitudeData("create_destination", {
              type: "critical_action",
              process: "destination",
            });
          }
        },
        onError: (error) => {
          // Rollback the selectedNode'id
          updateSelectedNode((prev) => {
            if (prev === null) return prev;

            return {
              ...prev,
              data: {
                ...prev.data,
                id: oldId,
                name: `connectors/${oldId}`,
              },
            };
          });

          // Rollback the nodes'id
          updateNodes((prev) => {
            return prev.map((node) => {
              if (node.data.connector.id === newId) {
                return {
                  ...node,
                  data: {
                    ...node.data,
                    connector: {
                      ...node.data.connector,
                      id: oldId,
                      name: `connectors/${oldId}`,
                    },
                  },
                };
              }

              return node;
            });
          });

          if (isAxiosError(error)) {
            toast({
              title: "Something went wrong when create the AI",
              variant: "alert-error",
              size: "large",
              description: getInstillApiErrorMessage(error),
            });
          } else {
            toast({
              title: "Something went wrong when create the AI",
              variant: "alert-error",
              size: "large",
              description: "Please try again later",
            });
          }
        },
      }
    );
    return;
  }, [
    toast,
    amplitudeIsInit,
    formYup,
    fieldValues,
    airbyteFormIsDirty,
    setAirbyteFormIsDirty,
    updateDestination,
    accessToken,
    createDestination,
    destination,
    updateSelectedNode,
    updateNodes,
  ]);

  const [isConnecting, setIsConnecting] = React.useState(false);
  const connectDestination = useConnectConnector();
  const disconnectDestination = useDisonnectConnector();

  const handleConnectDestination = async function () {
    if (!destination) return;

    setIsConnecting(true);

    const oldState = destination.watchState;

    if (
      destination.watchState === "STATE_CONNECTED" ||
      destination.watchState === "STATE_ERROR"
    ) {
      disconnectDestination.mutate(
        {
          connectorName: destination.name,
          accessToken,
        },
        {
          onSuccess: () => {
            toast({
              title: `Successfully disconnect ${destination.id}`,
              variant: "alert-success",
              size: "small",
            });
            setIsConnecting(false);

            updateSelectedNode((prev) => {
              if (prev === null) return prev;

              return {
                ...prev,
                data: {
                  ...prev.data,
                  connector: {
                    ...prev.data.connector,
                    watchState: "STATE_DISCONNECTED",
                  },
                },
              };
            });
          },
          onError: (error) => {
            setIsConnecting(false);
            updateSelectedNode((prev) => {
              if (prev === null) return prev;

              return {
                ...prev,
                data: {
                  ...prev.data,
                  connector: {
                    ...prev.data.connector,
                    watchState: oldState,
                  },
                },
              };
            });

            if (isAxiosError(error)) {
              toast({
                title: "Something went wrong when disconnect the destination",
                variant: "alert-error",
                size: "large",
                description: getInstillApiErrorMessage(error),
              });
            } else {
              toast({
                title: "Something went wrong when disconnect the destination",
                variant: "alert-error",
                size: "large",
                description: "Please try again later",
              });
            }
          },
        }
      );
    } else {
      connectDestination.mutate(
        {
          connectorName: destination.name,
          accessToken,
        },
        {
          onSuccess: () => {
            toast({
              title: `Successfully connect ${destination.id}`,
              variant: "alert-success",
              size: "small",
            });
            setIsConnecting(false);
            updateSelectedNode((prev) => {
              if (prev === null) return prev;

              return {
                ...prev,
                data: {
                  ...prev.data,
                  connector: {
                    ...prev.data.connector,
                    watchState: "STATE_CONNECTED",
                  },
                },
              };
            });
          },
          onError: (error) => {
            setIsConnecting(false);
            updateSelectedNode((prev) => {
              if (prev === null) return prev;

              return {
                ...prev,
                data: {
                  ...prev.data,
                  connector: {
                    ...prev.data.connector,
                    watchState: oldState,
                  },
                },
              };
            });
            if (isAxiosError(error)) {
              toast({
                title: "Something went wrong when connect the destination",
                variant: "alert-error",
                size: "large",
                description: getInstillApiErrorMessage(error),
              });
            } else {
              toast({
                title: "Something went wrong when connect the destination",
                variant: "alert-error",
                size: "large",
                description: "Please try again later",
              });
            }
          },
        }
      );
    }
  };

  let disabledSubmit = false;

  // uid not in the connector means it havent't stored in the backend
  if ("uid" in destination) {
    // The connector can not be updated if the form is clean
    if (!airbyteFormIsDirty) {
      disabledSubmit = true;
    }

    // The connectors/response can not be updated

    if (destination.name === "connectors/response") {
      disabledSubmit = true;
    }
  } else {
    // This is for new connector
    // The connector can not be created if the form is clean
    // But the connectors/response can be created even the form is clean

    if (destination.name !== "connectors/response" && !airbyteFormIsDirty) {
      disabledSubmit = true;
    }

    if (!destinations.isSuccess) {
      disabledSubmit = true;
    } else {
      if (destinations.data.some((d) => d.name === destination.name)) {
        disabledSubmit = true;
      }
    }
  }

  return (
    <>
      <FormRoot marginBottom={marginBottom} width={width}>
        <div className="mb-8 flex flex-col gap-y-5">
          <BasicTextField
            id="destination-id"
            label="ID"
            key="id"
            description={
              "Pick a name to help you identify this resource. The ID conforms to RFC-1034, " +
              "which restricts to letters, numbers, and hyphen, with the first character a letter," +
              "the last a letter or a number, and a 63 character maximum."
            }
            required={true}
            disabled={
              disabledAll ? disabledAll : "uid" in destination ? true : false
            }
            value={fieldValues ? (fieldValues.id as string) ?? null : null}
            error={fieldErrors ? (fieldErrors.id as string) ?? null : null}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              updateFieldValues("id", event.target.value)
            }
          />
          <BasicSingleSelect
            id="destination-definition"
            key="definition"
            label="Destination type"
            disabled={true}
            value={destinationDefinitionOption}
            options={[destinationDefinitionOption]}
            description={`<a href='${destination.connector_definition.documentation_url}'>Setup Guide</a>`}
          />
          {!isResponseOperator ? (
            <BasicTextArea
              id="destination-description"
              label="Description"
              key="description"
              description="Fill with a short description."
              required={false}
              error={
                fieldErrors ? (fieldErrors.description as string) ?? null : null
              }
              value={
                fieldValues ? (fieldValues.description as string) ?? null : null
              }
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
                updateFieldValues("description", event.target.value)
              }
              disabled={disabledAll}
            />
          ) : null}
          <AirbyteDestinationFields
            destinationFormTree={destinationFormTree}
            fieldValues={fieldValues}
            setFieldValues={setFieldValues}
            fieldErrors={fieldErrors}
            selectedConditionMap={selectedConditionMap}
            setSelectedConditionMap={setSelectedConditionMap}
            disableAll={disabledAll}
            formIsDirty={airbyteFormIsDirty}
            setFormIsDirty={setAirbyteFormIsDirty}
          />
        </div>
        <div className="flex w-full flex-row-reverse gap-x-4">
          <Button
            onClick={handleConnectDestination}
            className="gap-x-2"
            variant="primary"
            size="lg"
            type="button"
            disabled={
              disabledAll ? disabledAll : "uid" in destination ? false : true
            }
          >
            {destination.watchState === "STATE_CONNECTED" ||
            destination.watchState === "STATE_ERROR"
              ? "Disconnect"
              : "Connect"}
            {isConnecting ? (
              <svg
                className="m-auto h-4 w-4 animate-spin text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : destination.watchState === "STATE_CONNECTED" ||
              destination.watchState === "STATE_ERROR" ? (
              <Icons.Stop className="h-4 w-4 fill-semantic-fg-on-default stroke-semantic-fg-on-default group-disabled:fill-semantic-fg-disabled group-disabled:stroke-semantic-fg-disabled" />
            ) : (
              <Icons.Play className="h-4 w-4 fill-semantic-fg-on-default stroke-semantic-fg-on-default group-disabled:fill-semantic-fg-disabled group-disabled:stroke-semantic-fg-disabled" />
            )}
          </Button>
          <Button
            variant="secondaryColour"
            disabled={disabledAll ? disabledAll : disabledSubmit}
            size={airbyteFormIsDirty ? "lg" : "md"}
            className="gap-x-2"
            onClick={() => handleSubmit()}
            type="button"
          >
            {"uid" in destination ? "Update" : "Create"}
            <Icons.Save01 className="h-4 w-4 stroke-semantic-accent-on-bg group-disabled:stroke-semantic-fg-disabled" />
          </Button>
        </div>
      </FormRoot>
    </>
  );
};
