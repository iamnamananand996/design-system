import { createInstillAxiosClient, getQueryString } from "../helper";
import type {
  Model,
  ModelReadme,
  ModelDefinition,
  ModelWatchState,
} from "./types";
import type { Nullable } from "../../type";

/* -------------------------------------------------------------------------
 * Model Definition
 * -----------------------------------------------------------------------*/

export type GetModelDefinitionResponse = {
  model_definition: ModelDefinition;
};

export async function getModelDefinitionQuery({
  modelDefinitionName,
  accessToken,
}: {
  modelDefinitionName: string;
  accessToken: Nullable<string>;
}) {
  try {
    const client = createInstillAxiosClient(accessToken, "model");

    const { data } = await client.get<GetModelDefinitionResponse>(
      `/${modelDefinitionName}`
    );

    return Promise.resolve(data.model_definition);
  } catch (err) {
    return Promise.reject(err);
  }
}

export type ListModelDefinitionsResponse = {
  model_definitions: ModelDefinition[];
  next_page_token: string;
  total_size: string;
};

export async function listModelDefinitionsQuery({
  pageSize,
  nextPageToken,
  accessToken,
}: {
  pageSize: Nullable<number>;
  nextPageToken: Nullable<string>;
  accessToken: Nullable<string>;
}) {
  try {
    const client = createInstillAxiosClient(accessToken, "model");

    const modelDefinitions: ModelDefinition[] = [];

    const queryString = getQueryString(
      "/model-definitions",
      pageSize,
      nextPageToken,
      null
    );

    const { data } = await client.get<ListModelDefinitionsResponse>(
      queryString
    );

    modelDefinitions.push(...data.model_definitions);

    if (data.next_page_token) {
      modelDefinitions.push(
        ...(await listModelDefinitionsQuery({
          pageSize,
          accessToken,
          nextPageToken: data.next_page_token,
        }))
      );
    }

    return Promise.resolve(modelDefinitions);
  } catch (err) {
    return Promise.reject(err);
  }
}

/* -------------------------------------------------------------------------
 * Model
 * -----------------------------------------------------------------------*/

export type GetModelResponse = {
  model: Model;
};

export async function getModelQuery({
  modelName,
  accessToken,
}: {
  modelName: string;
  accessToken: Nullable<string>;
}) {
  try {
    const client = createInstillAxiosClient(accessToken, "model");

    const { data } = await client.get<GetModelResponse>(
      `/${modelName}?view=VIEW_FULL`
    );
    return Promise.resolve(data.model);
  } catch (err) {
    return Promise.reject(err);
  }
}

export type ListModelsResponse = {
  models: Model[];
  next_page_token: string;
  total_size: string;
};

export async function listModelsQuery({
  pageSize,
  nextPageToken,
  accessToken,
}: {
  pageSize: Nullable<number>;
  nextPageToken: Nullable<string>;
  accessToken: Nullable<string>;
}) {
  try {
    const client = createInstillAxiosClient(accessToken, "model");

    const models: Model[] = [];

    const queryString = getQueryString(
      "/models?view=VIEW_FULL",
      pageSize,
      nextPageToken,
      null
    );

    const { data } = await client.get<ListModelsResponse>(queryString);

    models.push(...data.models);

    if (data.next_page_token) {
      models.push(
        ...(await listModelsQuery({
          pageSize,
          accessToken,
          nextPageToken: data.next_page_token,
        }))
      );
    }

    return Promise.resolve(models);
  } catch (err) {
    return Promise.reject(err);
  }
}

export type GetModelReadmeQueryResponse = {
  readme: ModelReadme;
};

export async function getModelReadmeQuery({
  modelName,
  accessToken,
}: {
  modelName: string;
  accessToken: Nullable<string>;
}) {
  try {
    const client = createInstillAxiosClient(accessToken, "model");

    const { data } = await client.get<GetModelReadmeQueryResponse>(
      `/${modelName}/readme`
    );
    return Promise.resolve(data.readme);
  } catch (err) {
    return Promise.reject(err);
  }
}

/* -------------------------------------------------------------------------
 * Watch Model State
 * -----------------------------------------------------------------------*/

export async function watchModel({
  modelName,
  accessToken,
}: {
  modelName: string;
  accessToken: Nullable<string>;
}) {
  try {
    const client = createInstillAxiosClient(accessToken, "model");
    const { data } = await client.get<ModelWatchState>(`/${modelName}/watch`);
    return Promise.resolve(data);
  } catch (err) {
    return Promise.reject(err);
  }
}
