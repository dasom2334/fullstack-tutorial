import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { Flex, IconButton, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import React from "react";
import {
  PostSnippetFragment,
  useDeletePostMutation,
} from "../generated/graphql";

interface editDeletePostButtonProps {
  post: PostSnippetFragment;
}

export const EditDeletePostButton: React.FC<editDeletePostButtonProps> = ({
  post,
}) => {
  const [, deletePost] = useDeletePostMutation();

  return (
    <>
      <NextLink href={`/post/edit/${post._id}`}>
        <IconButton
          ml="auto"
          mr={3}
          as={Link}
          icon={<EditIcon />}
          aria-label="Edit Post"
        ></IconButton>
      </NextLink>
      <IconButton
        // ml="auto"
        icon={<DeleteIcon />}
        aria-label="Delete Post"
        onClick={() => deletePost({ identifier: post._id })}
      ></IconButton>
    </>
  );
};
