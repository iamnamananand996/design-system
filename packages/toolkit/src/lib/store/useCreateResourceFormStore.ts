import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Nullable, dot } from "../../lib";
import { z } from "zod";
import produce from "immer";

type resourceType = Nullable<"new" | "existing">;

// We haven't had a good way to guarantee the correctness of formIsDirty
// Right now it just counts on whether the form had been changed from null
// to some value, it won't return to formIsDirty: false even the user
// rollback to previous value.

export const createResourceFormFieldSchema = z.object({
  source: z.object({
    type: z.union([z.literal("new"), z.literal("existing")]).nullable(),
    existing: z.object({
      id: z.string().nullable(),
      definition: z.string().nullable(),
    }),
    new: z.object({
      id: z.string().nullable(),
      definition: z.string().nullable(),
    }),
  }),
  destination: z.object({
    type: z.union([z.literal("new"), z.literal("existing")]).nullable(),
    existing: z.object({
      id: z.string().nullable(),
      definition: z.string().nullable(),
    }),
    new: z.object({
      id: z.string().nullable(),
      definition: z.string().nullable(),
    }),
  }),
  model: z.object({
    type: z.union([z.literal("new"), z.literal("existing")]).nullable(),
    existing: z.object({
      id: z.string().nullable(),
      instanceTag: z.string().nullable(),
      definition: z.string().nullable(),
    }),
    new: z.object({
      id: z.string().nullable(),
      definition: z.string().nullable(),
      instanceTag: z.string().nullable(),
      description: z.string().nullable(),
      local: z.object({
        file: z.custom<File>((v) => v instanceof File).nullable(),
      }),
      github: z.object({
        repoUrl: z.string().nullable(),
      }),
      artivc: z.object({
        gcsBucketPath: z.string().nullable(),
        credentials: z.string().nullable(),
      }),
      huggingFace: z.object({
        repoUrl: z.string().nullable(),
      }),
      modelIsSet: z.boolean(),
    }),
  }),
  pipeline: z.object({
    id: z.string().nullable(),
    mode: z.union([
      z.literal("MODE_UNSPECIFIED"),
      z.literal("MODE_SYNC"),
      z.literal("MODE_ASYNC"),
    ]),
    description: z.string().nullable(),
  }),
});

export const validateCreateReourceFormSchema = (value: any) =>
  createResourceFormFieldSchema.parse(value);

export type CreateResourceFormFields = z.infer<
  typeof createResourceFormFieldSchema
>;

type ConvertToErrors<T> = T extends Array<any>
  ? string | null
  : T extends object
  ? { [K in keyof Omit<T, "type" | "modelIsSet">]: ConvertToErrors<T[K]> }
  : string | null;

export type CreateResourceFormState = {
  formIsDirty: boolean;
  createNewResourceIsComplete: boolean;
  pipelineFormStep: number;
  fields: CreateResourceFormFields;
  errors: ConvertToErrors<CreateResourceFormFields>;
};

export type CreateResourceFormAction = {
  setFormIsDirty: (isDirty: boolean) => void;
  setCreateNewResourceIsComplete: (isComplete: boolean) => void;
  setPipelineFormStep: (step: number) => void;
  init: () => void;
  // We may need to better type this
  setFieldError: (errorPath: string, value: any) => void;
  setFieldValue: (fieldPath: string, value: any) => void;
  setFieldsValue: (fields: CreateResourceFormFields) => void;
  setErrorsValue: (errors: CreateResourceFormState["errors"]) => void;
};

const createResourceInitialState: CreateResourceFormState = {
  formIsDirty: false,
  createNewResourceIsComplete: false,
  pipelineFormStep: 0,
  fields: {
    source: {
      type: null,
      new: {
        id: null,
        definition: null,
      },
      existing: {
        id: null,
        definition: null,
      },
    },
    destination: {
      type: null,
      new: {
        id: null,
        definition: null,
      },
      existing: {
        id: null,
        definition: null,
      },
    },
    model: {
      type: null,
      new: {
        id: null,
        definition: null,
        instanceTag: null,
        description: null,
        local: {
          file: null,
        },
        github: { repoUrl: null },
        artivc: {
          gcsBucketPath: null,
          credentials: null,
        },
        huggingFace: { repoUrl: null },
        modelIsSet: false,
      },
      existing: {
        id: null,
        definition: null,
        instanceTag: null,
      },
    },
    pipeline: {
      id: null,
      mode: "MODE_SYNC",
      description: null,
    },
  },

  errors: {
    source: {
      new: {
        id: null,
        definition: null,
      },
      existing: {
        id: null,
        definition: null,
      },
    },
    destination: {
      new: {
        id: null,
        definition: null,
      },
      existing: {
        id: null,
        definition: null,
      },
    },
    model: {
      new: {
        id: null,
        definition: null,
        instanceTag: null,
        description: null,
        local: {
          file: null,
        },
        github: { repoUrl: null },
        artivc: {
          gcsBucketPath: null,
          credentials: null,
        },
        huggingFace: { repoUrl: null },
      },
      existing: {
        id: null,
        definition: null,
        instanceTag: null,
      },
    },
    pipeline: {
      id: null,
      mode: "",
      description: null,
    },
  },
};

export type CreateResourceFormStore = CreateResourceFormState &
  CreateResourceFormAction;

export const useCreateResourceFormStore = create<CreateResourceFormStore>()(
  devtools((set) => ({
    ...createResourceInitialState,
    init: () => set(createResourceInitialState),
    setFormIsDirty: (isDirty: boolean) =>
      set({
        formIsDirty: isDirty,
      }),
    setPipelineFormStep: (step: number) =>
      set({
        pipelineFormStep: step,
      }),
    setCreateNewResourceIsComplete(isComplete: boolean) {
      set({
        createNewResourceIsComplete: isComplete,
      });
    },
    setFieldError: (errorPath, value) =>
      set(
        produce((state) => {
          dot.setter(state.errors, errorPath, value);
        })
      ),
    setFieldValue: (fieldPath, value) =>
      set(
        produce((draft: CreateResourceFormStore) => {
          dot.setter(draft.fields, fieldPath, value);
        })
      ),
    setFieldsValue: (fields) =>
      set(
        produce((draft: CreateResourceFormStore) => {
          draft.fields = fields;
        })
      ),
    setErrorsValue: (errors) =>
      set(
        produce((state) => {
          state.errors = errors;
        })
      ),
  }))
);