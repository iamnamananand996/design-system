import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BasicProgressMessageBox,
  Button,
  ComplicateIcons,
  Form,
  Icons,
  Input,
  Logos,
  OutlineButton,
  ProgressMessageBoxState,
  Select,
  SolidButton,
  Textarea,
} from "@instill-ai/design-system";
import { DeleteResourceModal, ImageWithFallback } from "../../components";
import {
  ConnectorWithWatchState,
  ModalStore,
  Nullable,
  UpdateConnectorPayload,
  getInstillApiErrorMessage,
  sendAmplitudeData,
  testConnectorConnectionAction,
  useAmplitudeCtx,
  useConnectConnector,
  useDeleteConnector,
  useDisonnectConnector,
  useModalStore,
  useUpdateConnector,
} from "../../lib";
import { isAxiosError } from "axios";
import { shallow } from "zustand/shallow";

const ConfigureAIFormSchema = z
  .object({
    id: z.string().min(1, { message: "ID is required" }),
    description: z.string().optional(),
    connector_definition_name: z.string(),
    configuration: z.object({
      // Instill Model
      api_token: z.string().optional(),
      server_url: z.string().optional(),
      model_id: z.string().optional(),

      // Stability AI / Open AI
      api_key: z.string().optional(),
      task: z.string().optional(),

      // Stability AI
      engine: z.string().optional(),

      // Open AI
      organization: z.string().optional(),
      model: z.string().optional(),
      system_message: z.string().optional(),
      temperature: z.coerce
        .number()
        .positive({ message: "Value must be positive" })
        .min(0, "Value must be greater than or equal to 0")
        .max(2, "Value must be less than or equal to 2")
        .optional(),
      n: z.coerce
        .number()
        .positive({ message: "Value must be positive" })
        .int({ message: "Value must be an integer" })
        .min(1, "Value must be greater than or equal to 1")
        .max(5, "Value must be less than or equal to 5")
        .optional(),
      max_tokens: z.coerce
        .number()
        .positive({ message: "Value must be positive" })
        .int({ message: "Value must be an integer" })
        .min(1, "Value must be greater than or equal to 1")
        .optional(),
    }),
  })
  .superRefine((state, ctx) => {
    if (
      state.connector_definition_name ===
      "connector-definitions/ai-instill-model"
    ) {
      if (!state.configuration.model_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Model ID is required",
          path: ["configuration", "model_id"],
        });
      }

      if (!state.configuration.server_url) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Server URL is required",
          path: ["configuration", "server_url"],
        });
      }
    }

    if (
      state.connector_definition_name ===
      "connector-definitions/ai-stability-ai"
    ) {
      if (!state.configuration.api_key) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "API Key is required",
          path: ["configuration", "api_key"],
        });
      }

      if (!state.configuration.task) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Task is required",
          path: ["configuration", "task"],
        });
      }

      if (!state.configuration.engine) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Engine is required",
          path: ["configuration", "engine"],
        });
      }
    }

    if (state.connector_definition_name === "connector-definitions/ai-openai") {
      if (!state.configuration.api_key) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "API Key is required",
          path: ["configuration", "api_key"],
        });
      }

      if (!state.configuration.task) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Task is required",
          path: ["configuration", "task"],
        });
      }

      if (state.configuration.task === "Text Generation") {
        if (!state.configuration.temperature) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Temperature is required",
            path: ["configuration", "temperature"],
          });
        }

        if (!state.configuration.n) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "N is required",
            path: ["configuration", "n"],
          });
        }

        if (!state.configuration.model) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Model is required",
            path: ["configuration", "model"],
          });
        }
      }

      if (state.configuration.task === "Text Embeddings") {
        if (!state.configuration.model) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Model is required",
            path: ["configuration", "model"],
          });
        }
      }
    }
  });

const modalSelector = (state: ModalStore) => ({
  closeModal: state.closeModal,
  openModal: state.openModal,
});

export type ConfigureAIFormProps = {
  accessToken: Nullable<string>;
  onDelete: Nullable<() => void>;
  onConfigure: Nullable<() => void>;
  onTestConnection: Nullable<() => void>;
  ai: ConnectorWithWatchState;
  disabledConfigure?: boolean;
  disabledDelete?: boolean;
  disabledTestConnection?: boolean;
};

export const ConfigureAIForm = (props: ConfigureAIFormProps) => {
  const {
    accessToken,
    onDelete,
    onConfigure,
    onTestConnection,
    ai,
    disabledConfigure,
    disabledDelete,
    disabledTestConnection,
  } = props;
  const { amplitudeIsInit } = useAmplitudeCtx();

  // We will disable all the fields if the connector is public (which mean
  // it is provided by Instill AI)
  let disabledAll = false;
  if ("visibility" in ai && ai.visibility === "VISIBILITY_PUBLIC") {
    disabledAll = true;
  }

  const { openModal, closeModal } = useModalStore(modalSelector, shallow);

  const form = useForm<z.infer<typeof ConfigureAIFormSchema>>({
    resolver: zodResolver(ConfigureAIFormSchema),
    defaultValues: {
      ...ai,
    },
  });

  // Read the state before render to subscribe the form state through Proxy
  const {
    reset,
    formState: { isDirty },
  } = form;

  React.useEffect(() => {
    reset({
      ...ai,
    });
  }, [ai, reset]);

  const [messageBoxState, setMessageBoxState] =
    React.useState<ProgressMessageBoxState>({
      activate: false,
      message: null,
      description: null,
      status: null,
    });

  const updateConnector = useUpdateConnector();

  function onSubmit(data: z.infer<typeof ConfigureAIFormSchema>) {
    form.trigger([
      "configuration",
      "connector_definition_name",
      "description",
      "id",
    ]);

    const payload: UpdateConnectorPayload = {
      connectorName: `connectors/${data.id}`,
      description: data.description,
      configuration: data.configuration,
    };

    setMessageBoxState(() => ({
      activate: true,
      status: "progressing",
      description: null,
      message: "Creating...",
    }));

    updateConnector.mutate(
      { payload, accessToken },
      {
        onSuccess: () => {
          setMessageBoxState(() => ({
            activate: true,
            status: "success",
            description: null,
            message: "Succeed.",
          }));
          if (amplitudeIsInit) {
            sendAmplitudeData("create_ai", {
              type: "critical_action",
              process: "source",
            });
          }
          if (onConfigure) onConfigure();
        },
        onError: (error) => {
          if (isAxiosError(error)) {
            setMessageBoxState(() => ({
              activate: true,
              status: "error",
              description: getInstillApiErrorMessage(error),
              message: error.message,
            }));
          } else {
            setMessageBoxState(() => ({
              activate: true,
              status: "error",
              description: null,
              message: "Something went wrong when update the AI",
            }));
          }
        },
      }
    );
  }

  const deleteConnector = useDeleteConnector();
  const handleDeleteAI = React.useCallback(() => {
    if (!ai) return;

    setMessageBoxState(() => ({
      activate: true,
      status: "progressing",
      description: null,
      message: "Deleting...",
    }));

    closeModal();

    deleteConnector.mutate(
      {
        connectorName: ai.name,
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

          if (amplitudeIsInit) {
            sendAmplitudeData("delete_source", {
              type: "critical_action",
              process: "source",
            });
          }
          if (onDelete) onDelete();
        },
        onError: (error) => {
          if (isAxiosError(error)) {
            setMessageBoxState(() => ({
              activate: true,
              message: error.message,
              description: getInstillApiErrorMessage(error),
              status: "error",
            }));
          } else {
            setMessageBoxState(() => ({
              activate: true,
              status: "error",
              description: null,
              message: "Something went wrong when delete the source",
            }));
          }
        },
      }
    );
  }, [ai, amplitudeIsInit, deleteConnector, closeModal, onDelete, accessToken]);

  const handleTestAI = React.useCallback(
    async function () {
      if (!ai) return;

      setMessageBoxState(() => ({
        activate: true,
        status: "progressing",
        description: null,
        message: "Testing...",
      }));

      try {
        const state = await testConnectorConnectionAction({
          connectorName: ai.name,
          accessToken,
        });

        setMessageBoxState(() => ({
          activate: true,
          status: state === "STATE_ERROR" ? "error" : "success",
          description: null,
          message: `The AI's state is ${state}`,
        }));

        if (onTestConnection) onTestConnection();
      } catch (err) {
        setMessageBoxState(() => ({
          activate: true,
          status: "error",
          description: null,
          message: "Something went wrong when test the AI",
        }));
      }
    },
    [accessToken, ai, onTestConnection]
  );

  const [isConnecting, setIsConnecting] = React.useState(false);

  const connectBlockchain = useConnectConnector();
  const disconnectBlockchain = useDisonnectConnector();

  const handleConnectAI = async function () {
    if (!ai) return;
    setIsConnecting(true);
    if (ai.watchState === "STATE_CONNECTED") {
      disconnectBlockchain.mutate(
        {
          connectorName: ai.name,
          accessToken,
        },
        {
          onSuccess: () => {
            setMessageBoxState(() => ({
              activate: true,
              status: "success",
              description: null,
              message: `Successfully disconnect ${ai.id}`,
            }));

            setIsConnecting(false);
          },
          onError: (error) => {
            setIsConnecting(false);

            if (isAxiosError(error)) {
              setMessageBoxState(() => ({
                activate: true,
                message: error.message,
                description: getInstillApiErrorMessage(error),
                status: "error",
              }));
            } else {
              setMessageBoxState(() => ({
                activate: true,
                status: "error",
                description: null,
                message: "Something went wrong when disconnect the AI",
              }));
            }
          },
        }
      );
    } else {
      connectBlockchain.mutate(
        {
          connectorName: ai.name,
          accessToken,
        },
        {
          onSuccess: () => {
            setMessageBoxState(() => ({
              activate: true,
              status: "success",
              description: null,
              message: `Successfully connect ${ai.id}`,
            }));
            setIsConnecting(false);
          },
          onError: (error) => {
            setIsConnecting(false);

            if (isAxiosError(error)) {
              setMessageBoxState(() => ({
                activate: true,
                message: error.message,
                description: getInstillApiErrorMessage(error),
                status: "error",
              }));
            } else {
              setMessageBoxState(() => ({
                activate: true,
                status: "error",
                description: null,
                message: "Something went wrong when connect the AI",
              }));
            }
          },
        }
      );
    }
  };

  return (
    <Form.Root {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mb-10 flex flex-col space-y-5">
          <Form.Field
            control={form.control}
            name="id"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>ID *</Form.Label>
                  <Form.Control>
                    <Input.Root className="!rounded-none">
                      <Input.Core
                        {...field}
                        type="text"
                        value={field.value ?? ""}
                        autoComplete="off"
                        disabled={
                          disabledAll ? disabledAll : "uid" in ai ? true : false
                        }
                      />
                    </Input.Root>
                  </Form.Control>
                  <Form.Description>
                    Pick an ID to help you identify this resource. The ID
                    conforms to RFC-1034, which restricts to letters, numbers,
                    and hyphen, with the first character a letter, the last a
                    letter or a number, and a 63 character maximum.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>Description</Form.Label>
                  <Form.Control>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      className="!rounded-none"
                      disabled={disabledAll}
                    />
                  </Form.Control>
                  <Form.Description>
                    Fill with a short description.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="connector_definition_name"
            render={({ field }) => {
              return (
                <Form.Item>
                  <Form.Label>AI Connector Type</Form.Label>
                  <Select.Root
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={true}
                  >
                    <Form.Control>
                      <Select.Trigger className="w-full !rounded-none">
                        <Select.Value />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      <Select.Item
                        key="connector-definitions/ai-instill-model"
                        value="connector-definitions/ai-instill-model"
                        className="text-semantic-fg-primary product-body-text-2-regular group-hover:text-semantic-bg-primary data-[highlighted]:text-semantic-bg-primary"
                      >
                        <div className="flex flex-row space-x-2">
                          <Logos.MDLSquare className="h-5 w-5 my-auto" />
                          <p className="my-auto">Instill Model</p>
                        </div>
                      </Select.Item>
                      <Select.Item
                        key="connector-definitions/ai-stability-ai"
                        value="connector-definitions/ai-stability-ai"
                        className="text-semantic-fg-primary product-body-text-2-regular group-hover:text-semantic-bg-primary data-[highlighted]:text-semantic-bg-primary"
                      >
                        <div className="flex flex-row space-x-2">
                          <div className="my-auto">
                            <ImageWithFallback
                              src={"/icons/stabilityAI/stabilityai.svg"}
                              width={20}
                              height={20}
                              alt="Stability AI logo"
                              fallbackImg={
                                <Icons.Model className="h-5 w-5 stroke-semantic-fg-primary" />
                              }
                            />
                          </div>
                          <p className="my-auto">Stability AI</p>
                        </div>
                      </Select.Item>
                      <Select.Item
                        key="connector-definitions/ai-openai"
                        value="connector-definitions/ai-openai"
                        className="text-semantic-fg-primary product-body-text-2-regular group-hover:text-semantic-bg-primary data-[highlighted]:text-semantic-bg-primary"
                      >
                        <div className="flex flex-row space-x-2">
                          <div className="my-auto">
                            <ImageWithFallback
                              src={"/icons/openAI/openai.svg"}
                              width={20}
                              height={20}
                              alt="Open AI model logo"
                              fallbackImg={
                                <Icons.Model className="h-5 w-5 stroke-semantic-fg-primary" />
                              }
                            />
                          </div>
                          <p className="my-auto">OpenAI</p>
                        </div>
                      </Select.Item>
                    </Select.Content>
                  </Select.Root>
                  <Form.Description>
                    Select an AI connector type.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />

          {/* 
            Instill Model
          */}

          <Form.Field
            control={form.control}
            name="configuration.api_token"
            render={({ field }) => {
              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                    "connector-definitions/ai-instill-model"
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>API Token</Form.Label>
                  <Form.Control>
                    <Input.Root className="!rounded-none">
                      <Input.Core
                        {...field}
                        type="password"
                        value={field.value ?? ""}
                        autoComplete="off"
                        onFocus={() => {
                          if (field.value === "*****MASK*****") {
                            field.onChange("");
                          }
                        }}
                        onBlur={() => {
                          if (
                            field.value === "" &&
                            ai.configuration.api_key === "*****MASK*****"
                          ) {
                            form.resetField("configuration.api_token", {
                              defaultValue: "*****MASK*****",
                            });
                          }
                        }}
                        disabled={disabledAll}
                      />
                    </Input.Root>
                  </Form.Control>
                  <Form.Description>
                    {`To access models on Instill Cloud, enter your Instill Cloud API Token. You can find your tokens by visiting your Instill Cloud's Settings > API Tokens page. Leave this field empty to access models on your local Instill Model.`}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="configuration.server_url"
            render={({ field }) => {
              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                    "connector-definitions/ai-instill-model"
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>Server URL *</Form.Label>
                  <Form.Control>
                    <Input.Root className="!rounded-none">
                      <Input.Core
                        {...field}
                        type="text"
                        value={field.value ?? ""}
                        autoComplete="off"
                        disabled={disabledAll}
                      />
                    </Input.Root>
                  </Form.Control>
                  <Form.Description>
                    Base URL for the Instill Model API. To access models on
                    Instill Cloud, use the base URL
                    `https://api-model.instill.tech`. To access models on your
                    local Instill Model, use the base URL
                    `http://localhost:9080`.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="configuration.model_id"
            render={({ field }) => {
              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                    "connector-definitions/ai-instill-model"
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>Model ID *</Form.Label>
                  <Form.Control>
                    <Input.Root className="!rounded-none">
                      <Input.Core
                        {...field}
                        id={field.name}
                        type="text"
                        value={field.value ?? ""}
                        autoComplete="off"
                        disabled={disabledAll}
                      />
                    </Input.Root>
                  </Form.Control>
                  <Form.Description>
                    ID of the Instill Model model to be used.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />

          {/* 
            General field for OpenAI and StabilityAI connector
          */}

          <Form.Field
            control={form.control}
            name="configuration.api_key"
            render={({ field }) => {
              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                      "connector-definitions/ai-stability-ai" ||
                    form.watch("connector_definition_name") ===
                      "connector-definitions/ai-openai"
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>API Key *</Form.Label>
                  <Form.Control>
                    <Input.Root className="!rounded-none">
                      <Input.Core
                        {...field}
                        type="password"
                        value={field.value ?? ""}
                        autoComplete="off"
                        onFocus={() => {
                          if (field.value === "*****MASK*****") {
                            field.onChange("");
                          }
                        }}
                        onBlur={() => {
                          if (
                            field.value === "" &&
                            ai.configuration.api_key === "*****MASK*****"
                          ) {
                            form.resetField("configuration.api_key", {
                              defaultValue: "*****MASK*****",
                            });
                          }
                        }}
                        disabled={disabledAll}
                      />
                    </Input.Root>
                  </Form.Control>
                  <Form.Description>
                    {form.watch("connector_definition_name") ===
                    "connector-definitions/ai-openai"
                      ? "Fill your OpenAI API key. To find your keys, visit your OpenAI's API Keys page."
                      : null}
                    {form.watch("connector_definition_name") ===
                    "connector-definitions/ai-stability-ai"
                      ? "Fill your Stability AI API key. To find your keys, navigate to your DreamStudio's Account page."
                      : null}
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="configuration.task"
            render={({ field }) => {
              const tasks =
                form.watch("connector_definition_name") ===
                "connector-definitions/ai-stability-ai"
                  ? [
                      {
                        label: "Text to Image",
                        icon: (
                          <ComplicateIcons.TextToImage
                            className="w-5 h-5 my-auto"
                            fillAreaColor="fill-semantic-fg-primary"
                          />
                        ),
                      },
                      {
                        label: "Image to Image",
                        icon: (
                          <ComplicateIcons.ImageToImage
                            className="w-5 h-5 my-auto"
                            pathColor="stroke-semantic-fg-primary"
                          />
                        ),
                      },
                    ]
                  : [
                      {
                        label: "Text Generation",
                        icon: (
                          <ComplicateIcons.TextGeneration
                            className="w-5 h-5 my-auto"
                            fillAreaColor="fill-semantic-fg-primary"
                          />
                        ),
                      },
                      {
                        label: "Text Embeddings",
                        icon: (
                          <ComplicateIcons.TextEmbedding
                            className="w-5 h-5 my-auto"
                            pathColor="stroke-semantic-fg-primary"
                            fillAreaColor="fill-semantic-fg-primary"
                          />
                        ),
                      },
                      {
                        label: "Speech Recognition",
                        icon: (
                          <Icons.SpeechRecognition className="my-auto h-5 w-5 stroke-semantic-fg-primary" />
                        ),
                      },
                    ];

              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                      "connector-definitions/ai-stability-ai" ||
                    form.watch("connector_definition_name") ===
                      "connector-definitions/ai-openai"
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>Task *</Form.Label>
                  <Select.Root
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                    disabled={disabledAll}
                  >
                    <Form.Control>
                      <Select.Trigger className="w-full !rounded-none">
                        <Select.Value />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {tasks.map((task) => (
                        <Select.Item
                          className="text-semantic-fg-primary product-body-text-2-regular group-hover:text-semantic-bg-primary data-[highlighted]:text-semantic-bg-primary"
                          key={task.label}
                          value={task.label}
                        >
                          <div className="flex flex-row gap-x-2">
                            {task.icon}
                            <p className="my-auto">{task.label}</p>
                          </div>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                  <Form.Description>AI task type.</Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />

          {/* 
            StabilityAI connector fields
          */}

          <Form.Field
            control={form.control}
            name="configuration.engine"
            render={({ field }) => {
              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                    "connector-definitions/ai-stability-ai"
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>Engine</Form.Label>
                  <Select.Root
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                    disabled={disabledAll}
                  >
                    <Form.Control>
                      <Select.Trigger className="w-full !rounded-none">
                        <Select.Value />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {[
                        "stable-diffusion-v1",
                        "stable-diffusion-v1-5",
                        "stable-diffusion-512-v2-0",
                        "stable-diffusion-768-v2-0",
                        "stable-diffusion-512-v2-1",
                        "stable-diffusion-768-v2-1",
                        "stable-diffusion-xl-beta-v2-2-2",
                        "stable-inpainting-v1-0",
                        "stable-inpainting-512-v2-0",
                        "esrgan-v1-x2plus",
                        "stable-diffusion-x4-latent-upscaler",
                        "stable-diffusion-xl-1024-v0-9",
                        "stable-diffusion-xl-1024-v1-0",
                      ].map((engine) => (
                        <Select.Item
                          className="text-semantic-fg-primary product-body-text-2-regular group-hover:text-semantic-bg-primary data-[highlighted]:text-semantic-bg-primary"
                          key={engine}
                          value={engine}
                        >
                          <p className="my-auto">{engine}</p>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                  <Form.Description>
                    Stability AI Engine (model) to be used.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />

          {/* 
            OpenAI connector fields
          */}

          <Form.Field
            control={form.control}
            name="configuration.model"
            render={({ field }) => {
              let models: string[] = [];
              switch (form.watch("configuration.task")) {
                case "Text Generation":
                  models = [
                    "gpt-4",
                    "gpt-4-32k",
                    "gpt-3.5-turbo",
                    "gpt-3.5-turbo-16k",
                  ];
                  break;
                case "Text Embeddings":
                  models = ["text-embedding-ada-002"];
                  break;
                case "Speech Recognition":
                  models = ["whisper-1"];
                  break;
                default:
                  models = [];
              }

              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                      "connector-definitions/ai-openai" &&
                    form.watch("configuration.task")
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>Model *</Form.Label>
                  <Select.Root
                    onValueChange={field.onChange}
                    defaultValue={field.value ?? undefined}
                    disabled={disabledAll}
                  >
                    <Form.Control>
                      <Select.Trigger className="w-full !rounded-none">
                        <Select.Value />
                      </Select.Trigger>
                    </Form.Control>
                    <Select.Content>
                      {models.map((model) => (
                        <Select.Item
                          className="text-semantic-fg-primary product-body-text-2-regular group-hover:text-semantic-bg-primary data-[highlighted]:text-semantic-bg-primary"
                          key={model}
                          value={model}
                        >
                          <p className="my-auto">{model}</p>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                  <Form.Description>OpenAI model to be used.</Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />

          {/* 
            OpenAI Text Generation connector fields
          */}

          <Form.Field
            control={form.control}
            name="configuration.system_message"
            render={({ field }) => {
              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                      "connector-definitions/ai-openai" &&
                    form.watch("configuration.task") === "Text Generation"
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>System message</Form.Label>
                  <Form.Control>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      className="!rounded-none"
                      disabled={disabledAll}
                    />
                  </Form.Control>
                  <Form.Description>
                    The system message helps set the behavior of the assistant.
                    For example, you can modify the personality of the assistant
                    or provide specific instructions about how it should behave
                    throughout the conversation. By default, the model&apos;s
                    behavior is using a generic message as &quot;You are a
                    helpful assistant.&quot;
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="configuration.temperature"
            render={({ field }) => {
              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                      "connector-definitions/ai-openai" &&
                    form.watch("configuration.task") === "Text Generation"
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>Temperature *</Form.Label>
                  <Form.Control>
                    <Input.Root className="!rounded-none">
                      <Input.Core
                        {...field}
                        type="number"
                        value={field.value}
                        autoComplete="off"
                        disabled={disabledAll}
                      />
                    </Input.Root>
                  </Form.Control>
                  <Form.Description>
                    What sampling temperature to use, between 0 and 2. Higher
                    values like 0.8 will make the output more random, while
                    lower values like 0.2 will make it more focused and
                    deterministic. Defaults to 1.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="configuration.n"
            render={({ field }) => {
              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                      "connector-definitions/ai-openai" &&
                    form.watch("configuration.task") === "Text Generation"
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>Number of text completions *</Form.Label>
                  <Form.Control>
                    <Input.Root className="!rounded-none">
                      <Input.Core
                        {...field}
                        type="number"
                        value={field.value}
                        autoComplete="off"
                        disabled={disabledAll}
                      />
                    </Input.Root>
                  </Form.Control>
                  <Form.Description>
                    How many chat completion choices to generate for each input
                    message.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="configuration.max_tokens"
            render={({ field }) => {
              return (
                <Form.Item
                  className={
                    form.watch("connector_definition_name") ===
                      "connector-definitions/ai-openai" &&
                    form.watch("configuration.task") === "Text Generation"
                      ? ""
                      : "hidden"
                  }
                >
                  <Form.Label>Max tokens</Form.Label>
                  <Form.Control>
                    <Input.Root className="!rounded-none">
                      <Input.Core
                        {...field}
                        type="number"
                        value={field.value}
                        autoComplete="off"
                        disabled={disabledAll}
                      />
                    </Input.Root>
                  </Form.Control>
                  <Form.Description>
                    The maximum number of tokens to generate in the chat
                    completion. If it is not set, meaning no maximum number. The
                    total length of input tokens and generated tokens is limited
                    by the model&apos;s context length.
                  </Form.Description>
                  <Form.Message />
                </Form.Item>
              );
            }}
          />
        </div>

        <div className="flex flex-col">
          <div className="mb-10 flex flex-row items-center">
            <div className="flex flex-row items-center space-x-5 mr-auto">
              <SolidButton
                type="button"
                disabled={disabledTestConnection}
                color="primary"
                onClickHandler={handleTestAI}
              >
                Test
              </SolidButton>
              <Button
                onClick={handleConnectAI}
                className="gap-x-2 !rounded-none"
                variant="primary"
                size="lg"
                type="button"
                disabled={disabledAll}
              >
                {ai.watchState === "STATE_CONNECTED" ||
                ai.watchState === "STATE_ERROR"
                  ? "Disconnect"
                  : "Connect"}
                {isConnecting ? (
                  <svg
                    className="m-auto h-4 w-4 animate-spin text-white"
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
                ) : ai.watchState === "STATE_CONNECTED" ||
                  ai.watchState === "STATE_ERROR" ? (
                  <Icons.Stop className="h-4 w-4 fill-semantic-fg-on-default stroke-semantic-fg-on-default group-disabled:fill-semantic-fg-disabled group-disabled:stroke-semantic-fg-disabled" />
                ) : (
                  <Icons.Play className="h-4 w-4 stroke-semantic-fg-on-default group-disabled:stroke-semantic-fg-disabled" />
                )}
              </Button>
              <button
                className="bg-instillBlue50 hover:bg-instillBlue80 text-instillGrey05 hover:text-instillBlue10 ml-auto rounded-[1px] px-5 py-2.5 my-auto disabled:cursor-not-allowed disabled:bg-instillGrey15 disabled:text-instillGrey50"
                type="submit"
                disabled={
                  disabledAll
                    ? disabledAll
                    : disabledConfigure
                    ? true
                    : isDirty === true
                    ? false
                    : true
                }
              >
                Update
              </button>
            </div>

            <OutlineButton
              disabled={
                disabledAll ? disabledAll : disabledDelete ? true : false
              }
              onClickHandler={() => openModal()}
              position="my-auto"
              type="button"
              color="danger"
              hoveredShadow={null}
            >
              Delete
            </OutlineButton>
          </div>
          <div className="flex">
            <BasicProgressMessageBox
              state={messageBoxState}
              setActivate={(activate) =>
                setMessageBoxState((prev) => ({
                  ...prev,
                  activate,
                }))
              }
              width="w-[25vw]"
              closable={true}
            />
          </div>
        </div>
      </form>
      <DeleteResourceModal
        resource={ai}
        handleDeleteResource={handleDeleteAI}
      />
    </Form.Root>
  );
};
