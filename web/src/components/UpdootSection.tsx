import { ChevronUpIcon, ChevronDownIcon } from "@chakra-ui/icons";
import { Flex, IconButton } from "@chakra-ui/react";
import React from "react";
import { useState } from "react";
import {
  PostSnippetFragment,
  PostsQuery,
  useVoteMutation,
} from "../generated/graphql";

interface UpdootSectionProps {
  post: PostSnippetFragment ;
}

export const UpdootSection: React.FC<UpdootSectionProps> = ({ post }) => {
  const [loadingState, setloadingState] = useState<
    "updoot-loading" | "downdoot-loading" | "not-loading"
  >();
  const voteValue = (post.updoots )? post.updoots[0]?.value : 0;
  const [{}, vote] = useVoteMutation();
  return (
    <Flex direction="column" justifyContent="center" alignItems="center">
      <IconButton
        aria-label="updoot post"
        onClick={async () => {
          setloadingState("updoot-loading");
          await vote({ post_id: post._id, value: 1 });
          setloadingState("not-loading");
        }}
        bgColor={voteValue == 1? 'palegreen':undefined}
        disabled={voteValue == 1? true:undefined}
        isLoading={loadingState === "updoot-loading"}
        icon={<ChevronUpIcon fontSize={24} />}
      />
      {post.point}

      <IconButton
        aria-label="downdoot post"
        onClick={async () => {
          setloadingState("downdoot-loading");
          await vote({ post_id: post._id, value: -1 });
          setloadingState("not-loading");
        }}
        bgColor={voteValue == -1? 'indianred':undefined}
        disabled={voteValue == -1? true:undefined}
        isLoading={loadingState === "downdoot-loading"}
        icon={<ChevronDownIcon fontSize={24} />}
      />
    </Flex>
  );
};
