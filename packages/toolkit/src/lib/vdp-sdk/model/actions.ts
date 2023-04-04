import { Operation } from "../types";
import { createInstillAxiosClient } from "../helper";
import { Nullable } from "../../type";

export type DeployModelResponse = {
  operation: Operation;
};

export const deployModelAction = async ({
  modelName,
  accessToken,
}: {
  modelName: string;
  accessToken: Nullable<string>;
}) => {
  try {
    const client = createInstillAxiosClient(accessToken);

    const { data } = await client.post<DeployModelResponse>(
      `/${modelName}/deploy`
    );
    return Promise.resolve(data.operation);
  } catch (err) {
    return Promise.reject(err);
  }
};

export type UnDeployModelResponse = {
  operation: Operation;
};

export const unDeployModeleAction = async ({
  modelName,
  accessToken,
}: {
  modelName: string;
  accessToken: Nullable<string>;
}) => {
  try {
    const client = createInstillAxiosClient(accessToken);

    const { data } = await client.post<UnDeployModelResponse>(
      `/${modelName}/undeploy`
    );
    return Promise.resolve(data.operation);
  } catch (err) {
    return Promise.reject(err);
  }
};
