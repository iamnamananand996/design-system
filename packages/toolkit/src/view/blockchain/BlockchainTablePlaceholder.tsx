import {
  TablePlaceholderBase,
  type TablePlaceholderBaseProps,
} from "../../components";
import { PlaceholderSVG } from "./PlaceholderSVG";

export type BlockchainTablePlaceholderProps = Pick<
  TablePlaceholderBaseProps,
  "enableCreateButton" | "marginBottom"
>;

export const BlockchainTablePlaceholder = (
  props: BlockchainTablePlaceholderProps
) => {
  const { marginBottom, enableCreateButton } = props;

  return (
    <TablePlaceholderBase
      placeholderItems={[]}
      placeholderTitle="No blockchain"
      createButtonTitle="Set up your first blockchain"
      createButtonLink="/ais/create"
      marginBottom={marginBottom}
      enableCreateButton={enableCreateButton}
      svgElement={PlaceholderSVG()}
    />
  );
};
