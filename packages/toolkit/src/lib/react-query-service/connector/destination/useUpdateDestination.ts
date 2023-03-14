import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Nullable } from "../../../type";
import { env } from "../../../utility";
import {
  DestinationWithDefinition,
  getDestinationDefinitionQuery,
  updateDestinationMutation,
  UpdateDestinationPayload,
} from "../../../vdp-sdk";

export const useUpdateDestination = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      accessToken,
      payload,
    }: {
      accessToken: Nullable<string>;
      payload: UpdateDestinationPayload;
    }) => {
      if (
        env("NEXT_PUBLIC_ENABLE_INSTILL_API_AUTH") === "true" &&
        !accessToken
      ) {
        throw new Error(
          "You had set NEXT_PUBLIC_ENABLE_INSTILL_API_AUTH=true but didn't provide necessary access token"
        );
      }
      const res = await updateDestinationMutation({ payload, accessToken });
      return Promise.resolve({ newDestination: res, accessToken });
    },
    {
      onSuccess: async ({ newDestination, accessToken }) => {
        const destinationDefinition = await getDestinationDefinitionQuery({
          destinationDefinitionName:
            newDestination.destination_connector_definition,
          accessToken,
        });

        const newDestinationWithDefinition: DestinationWithDefinition = {
          ...newDestination,
          destination_connector_definition: destinationDefinition,
        };

        queryClient.setQueryData<DestinationWithDefinition>(
          ["destinations", newDestination.id],
          newDestinationWithDefinition
        );

        queryClient.setQueryData<DestinationWithDefinition[]>(
          ["destinations"],
          (old) =>
            old
              ? [
                  ...old.filter((e) => e.id !== newDestination.id),
                  newDestinationWithDefinition,
                ]
              : [newDestinationWithDefinition]
        );
      },
    }
  );
};