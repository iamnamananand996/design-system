import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listRepoFileContent } from "../../github";

export const usePipelineSchema = () => {
  const fetchPipelineSchema = async (): Promise<string> => {
    const data = await listRepoFileContent(
      "instill-ai",
      "pipeline-backend",
      "configs/models/pipeline.json"
    );
    return data.content;
  };

  const queryInfo = useQuery(
    ["pipeline", "encoded-definition"],
    fetchPipelineSchema
  );

  return {
    ...queryInfo,
    data: useMemo(() => {
      if (queryInfo.data) {
        return JSON.parse(window.atob(queryInfo.data));
      }
    }, [queryInfo.data]),
  };
};