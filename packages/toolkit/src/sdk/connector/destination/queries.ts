import { Nullable } from "../../../type";
import { createInstillAxiosClient, getQueryString } from "../../helper";
import { ConnectorDefinition } from "../types";
import { Destination } from "./types";

// ############################################################################
// # Destination definition                                                   #
// ############################################################################

export type ListDestinationDefinitionsResponse = {
  destination_connector_definitions: ConnectorDefinition[];
  next_page_token: string;
  total_size: string;
};

export type ListDestinationDefinitionsPayload = {
  pageSize: Nullable<number>;
  nextPageToken: Nullable<string>;
};

export const listDestinationDefinitionsQuery = async (
  pageSize: Nullable<number>,
  nextPageToken: Nullable<string>
): Promise<ConnectorDefinition[]> => {
  try {
    const client = createInstillAxiosClient();
    const definitions: ConnectorDefinition[] = [];
    const queryString = getQueryString(
      `/destination-connector-definitions?view=VIEW_FULL`,
      pageSize,
      nextPageToken
    );

    const { data } = await client.get<ListDestinationDefinitionsResponse>(
      queryString
    );

    definitions.push(...data.destination_connector_definitions);

    if (data.next_page_token) {
      definitions.push(
        ...(await listDestinationDefinitionsQuery(
          pageSize,
          data.next_page_token
        ))
      );
    }

    return Promise.resolve(definitions);
  } catch (err) {
    return Promise.reject(err);
  }
};

export type GetDestinationDefinitionResponse = {
  destination_connector_definition: ConnectorDefinition;
};

export const getDestinationDefinitionQuery = async (
  destinationDefinitionName: string
) => {
  try {
    const client = createInstillAxiosClient();

    const { data } = await client.get<GetDestinationDefinitionResponse>(
      `/${destinationDefinitionName}?view=VIEW_FULL`
    );

    return Promise.resolve(data.destination_connector_definition);
  } catch (err) {
    return Promise.reject(err);
  }
};

// ############################################################################
// # Destination                                                              #
// ############################################################################

export type GetDestinationResponse = {
  destination_connector: Destination;
};

export const getDestinationQuery = async (
  destinationName: string
): Promise<Destination> => {
  try {
    const client = createInstillAxiosClient();

    const { data } = await client.get<GetDestinationResponse>(
      `/${destinationName}?view=VIEW_FULL`
    );

    return Promise.resolve(data.destination_connector);
  } catch (err) {
    return Promise.reject(err);
  }
};

export type ListDestinationsResponse = {
  destination_connectors: Destination[];
  next_page_token: string;
  total_size: string;
};

export const listDestinationsQuery = async (): Promise<Destination[]> => {
  try {
    const client = createInstillAxiosClient();

    const { data } = await client.get<ListDestinationsResponse>(
      `/destination-connectors?view=VIEW_FULL`
    );

    return Promise.resolve(data.destination_connectors);
  } catch (err) {
    return Promise.reject(err);
  }
};