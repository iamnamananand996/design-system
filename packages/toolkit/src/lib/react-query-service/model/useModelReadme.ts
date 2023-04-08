import { getModelReadmeQuery } from "../../vdp-sdk";
import { Nullable } from "../../type";
import { useQuery } from "@tanstack/react-query";

export const useModelReadme = ({
  modelName,
  accessToken,
  enable,
}: {
  modelName: Nullable<string>;
  accessToken: Nullable<string>;
  enable: boolean;
}) => {
  let enableQuery = false;

  if (modelName && enable) {
    enableQuery = true;
  }

  return useQuery(
    ["models", modelName, "readme"],
    async () => {
      if (!modelName) {
        return Promise.reject(new Error("Modelname not provided"));
      }

      const modelReadme = await getModelReadmeQuery({
        modelName,
        accessToken,
      });

      return Promise.resolve(window.atob(modelReadme.content));
    },
    {
      enabled: enableQuery,
      retry: 3,
    }
  );
};
