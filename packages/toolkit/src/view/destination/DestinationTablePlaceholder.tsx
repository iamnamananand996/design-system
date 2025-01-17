import {
  AwsRdsIcon,
  MongoDbIcon,
  MySqlIcon,
  PostgreSqlIcon,
  SalesforceIcon,
  SnowflakeIcon,
} from "@instill-ai/design-system";

import {
  TablePlaceholderBase,
  type TablePlaceholderBaseProps,
} from "../../components";

export type DestinationTablePlaceholderProps = Pick<
  TablePlaceholderBaseProps,
  "marginBottom" | "enableCreateButton"
>;

export const DestinationTablePlaceholder = (
  props: DestinationTablePlaceholderProps
) => {
  const { marginBottom, enableCreateButton } = props;
  const width = "w-[136px]";
  const height = "h-[136px]";

  const placeholderItems = [
    {
      id: "destination-postgrsql",
      item: <PostgreSqlIcon position="m-auto" width={width} height={height} />,
    },
    {
      id: "destination-mysql",
      item: <MySqlIcon position="m-auto" width={width} height={height} />,
    },
    {
      id: "destination-mongodb",
      item: <MongoDbIcon position="m-auto" width={width} height={height} />,
    },
    {
      id: "destination-snowflake",
      item: <SnowflakeIcon position="m-auto" width={width} height={height} />,
    },
    {
      id: "source-saleforces",
      item: <SalesforceIcon position="m-auto" width={width} height={height} />,
    },
    {
      id: "source-aws-rds",
      item: <AwsRdsIcon position="m-auto" width={width} height={height} />,
    },
  ];

  return (
    <TablePlaceholderBase
      placeholderItems={placeholderItems}
      placeholderTitle="No data"
      createButtonTitle="Set up your first destination"
      createButtonLink="/destinations/create"
      marginBottom={marginBottom}
      enableCreateButton={enableCreateButton}
    />
  );
};
