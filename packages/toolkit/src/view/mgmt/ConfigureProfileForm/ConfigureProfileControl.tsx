import * as React from "react";
import { z } from "zod";
import {
  BasicProgressMessageBox,
  OutlineButton,
  ProgressMessageBoxState,
  SolidButton,
} from "@instill-ai/design-system";
import {
  Nullable,
  useConfigureProfileFormStore,
  useUpdateUser,
  validateConfigureProfileFormFieldSchema,
  type ConfigureProfileFormState,
  checkUserIdExist,
} from "../../../lib";

export type ConfigureProfileControlProps = {
  accessToken: Nullable<string>;
  onConfigure: Nullable<() => void>;
};

export const ConfigureProfileControl = (
  props: ConfigureProfileControlProps
) => {
  const { accessToken, onConfigure } = props;
  const fields = useConfigureProfileFormStore((state) => state.fields);
  const setFieldError = useConfigureProfileFormStore(
    (state) => state.setFieldError
  );

  const [messageBoxState, setMessageBoxState] =
    React.useState<ProgressMessageBoxState>({
      activate: false,
      message: null,
      description: null,
      status: null,
    });

  const updateUser = useUpdateUser();

  const handleSubmit = async () => {
    try {
      validateConfigureProfileFormFieldSchema(fields);

      setMessageBoxState(() => ({
        activate: true,
        status: "progressing",
        description: null,
        message: "Updating...",
      }));

      // Check whether user id exist
      const userIdExist = await checkUserIdExist({
        id: fields.userName as string,
        accessToken,
      });

      if (userIdExist) {
        setFieldError(
          "userName",
          "User ID already exists. Please try another one."
        );
        return;
      }

      updateUser.mutate(
        {
          payload: {
            first_name: fields.firstName || "",
            last_name: fields.lastName || "",
            org_name: fields.orgName || "",
            id: fields.userName || "",
            role: fields.role || undefined,
            newsletter_subscription: fields.newsletterSubscription || undefined,
          },
          accessToken,
        },
        {
          onSuccess: () => {
            setMessageBoxState(() => ({
              activate: true,
              status: "success",
              description: null,
              message: "Succeed.",
            }));
            if (onConfigure) onConfigure();
          },
        }
      );
    } catch (err) {
      if (err instanceof z.ZodError) {
        for (const issue of err.issues) {
          setFieldError(
            issue.path.toString() as keyof ConfigureProfileFormState["errors"],
            issue.message
          );
        }
      }
    }
  };

  return (
    <div className="flex flex-row">
      <div className="mb-auto">
        <BasicProgressMessageBox
          state={messageBoxState}
          setActivate={(activate) =>
            setMessageBoxState((prev) => ({ ...prev, activate }))
          }
          width="w-[25vw]"
          closable={true}
        />
      </div>
      <div className="ml-auto flex flex-row gap-x-2">
        <OutlineButton
          disabled={false}
          onClickHandler={null}
          position="my-auto"
          type="button"
          color="secondary"
          hoveredShadow={null}
        >
          Cancel
        </OutlineButton>
        <SolidButton
          type="button"
          color="primary"
          disabled={false}
          position="my-auto"
          onClickHandler={() => handleSubmit()}
        >
          Save Changes
        </SolidButton>
      </div>
    </div>
  );
};
