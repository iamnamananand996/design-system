import * as React from "react";
import { Button, Dialog, Icons, Input } from "@instill-ai/design-system";
import { ConnectorWithDefinition, Model, Nullable, Pipeline } from "../lib";
import { IconWithBackground } from "./IconWithBackground";

export type GenralDeleteResourceModalProps = {
  resource: Nullable<ConnectorWithDefinition | Pipeline | Model>;
  handleDeleteResource: (
    resource: Nullable<ConnectorWithDefinition | Pipeline | Model>
  ) => void;
  isDeleting: boolean;
};

export const GeneralDeleteResourceModal = (
  props: GenralDeleteResourceModalProps
) => {
  const { resource, handleDeleteResource, isDeleting } = props;

  const modalDetails = React.useMemo<{
    title: string;
    description: string;
  }>(() => {
    if (!resource) {
      return {
        title: "",
        description: "",
      };
    }

    let title: string;
    let description: string;

    if ("connector_definition" in resource) {
      if (resource.connector_type === "CONNECTOR_TYPE_OPERATOR") {
        title = `Delete ${resource.id} Source`;
        description =
          "This action cannot be undone. This will permanently delete the source.";
      } else if (resource.connector_type === "CONNECTOR_TYPE_DATA") {
        title = `Delete ${resource.id} Destination`;
        description =
          "This action cannot be undone. This will permanently delete the destination.";
      } else if (resource.connector_type === "CONNECTOR_TYPE_AI") {
        title = `Delete ${resource.id} AI`;
        description =
          "This action cannot be undone. This will permanently delete the AI.";
      } else if (resource.connector_type === "CONNECTOR_TYPE_BLOCKCHAIN") {
        title = `Delete ${resource.id} Blockchain`;
        description =
          "This action cannot be undone. This will permanently delete the blockchain.";
      } else {
        title = `Delete ${resource.id} Connector`;
        description =
          "This action cannot be undone. This will permanently delete the connector.";
      }
    } else if ("recipe" in resource) {
      title = `Delete ${resource.id} Pipeline`;
      description =
        "This action cannot be undone. This will permanently delete the pipeline.";
    } else if ("model_definition" in resource) {
      title = `Delete ${resource.id} Model`;
      description =
        "This action cannot be undone. This will permanently delete the model.";
    } else {
      title = "Delete resource";
      description =
        "Something went wrong when try to activate the flow of deleting resource, please contact our support.";
      console.error(
        "You have passed resource not included in Pipeline, Model, Connector, BlockChain and AI"
      );
    }

    return {
      title,
      description,
    };
  }, [resource]);

  // ###################################################################
  // #                                                                 #
  // # Check whether confirmation code is correct                      #
  // #                                                                 #
  // ###################################################################

  const [confirmationCode, setConfirmationCode] =
    React.useState<Nullable<string>>(null);

  React.useEffect(() => {
    setConfirmationCode(null);
  }, [open]);

  const handleCodeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmationCode(event.target.value);
    },
    []
  );

  const canDeleteResource = React.useMemo(() => {
    if (!resource || confirmationCode !== resource.id) return false;
    return true;
  }, [confirmationCode, resource]);

  return (
    <div className="flex flex-col">
      <IconWithBackground
        iconElement={
          <Icons.AlertTriangle className="h-6 w-6 stroke-semantic-warning-on-bg" />
        }
        className={"mx-auto mb-6 flex !h-12 !w-12 bg-semantic-warning-bg !p-3"}
      />
      <div className="mb-6 flex flex-col">
        <h2 className="mb-1 text-center text-semantic-fg-primary product-headings-heading-3">
          {modalDetails.title}
        </h2>
        <p className="mb-6 text-center text-semantic-fg-primary product-body-text-2-regular">
          {modalDetails.description}
        </p>

        <div className="mb-2.5">
          <label htmlFor="confirmationCode">
            Please type
            <span className="mx-1 select-all font-bold">{`${
              resource ? resource.id : ""
            }`}</span>
            to confirm.
          </label>
        </div>

        <Input.Root className="!rounded-none">
          <Input.Core
            id="confirmationCode"
            type="text"
            onChange={handleCodeChange}
            value={confirmationCode || ""}
          />
        </Input.Root>
      </div>
      <div className="flex flex-row gap-x-2">
        <Dialog.Close>
          <Button
            variant="secondaryGrey"
            size="lg"
            className="flex-1 !px-4 !py-3"
          >
            <span className="text-semantic-fg-primary product-button-button-1">
              Cancel
            </span>
          </Button>
        </Dialog.Close>

        <Button
          variant="danger"
          size="lg"
          onClick={() => handleDeleteResource(resource)}
          disabled={canDeleteResource ? false : true}
          className="flex-1 rounded px-4 py-3"
        >
          <span className="flex text-semantic-fg-on-default product-button-button-1">
            {isDeleting ? (
              <svg
                className="m-auto h-5 w-5 animate-spin text-semantic-fg-on-default"
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
            ) : (
              <p className="m-auto">Delete</p>
            )}
          </span>
        </Button>
      </div>
    </div>
  );
};
