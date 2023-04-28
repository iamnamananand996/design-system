import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ApiToken,
  CreateApiTokenPayload,
  createApiTokenMutation,
} from "../../vdp-sdk";
import { Nullable } from "../../type";

export const useCreateApiToken = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      payload,
      accessToken,
    }: {
      payload: CreateApiTokenPayload;
      accessToken: Nullable<string>;
    }) => {
      const token = await createApiTokenMutation({
        payload,
        accessToken,
      });
      return Promise.resolve({ token });
    },
    {
      onSuccess: ({ token }) => {
        queryClient.setQueryData<ApiToken[]>(["api-tokens"], (old) =>
          old ? [...old, token] : [token]
        );
        queryClient.setQueryData<ApiToken>(["api-tokens", token.name], token);
      },
    }
  );
};
