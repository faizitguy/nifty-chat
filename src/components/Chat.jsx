import React, { useContext } from "react";
import { AddIcon } from "@chakra-ui/icons";
import Messages from "./Messages";
import Input from "./Input";
import { ChatContext } from "../context/ChatContext";
import GroupChatModal from "./GroupChatModal";
import { Button } from "@chakra-ui/react";

const Chat = () => {
  const { data } = useContext(ChatContext);

  return (
    <div className="chat">
      <div className="chatInfo">
        <span style={{ marginLeft: '45px' }}>{data.user?.displayName}</span>
        <div className="chatIcons">
          <GroupChatModal>
            <Button
              d="flex"
              fontSize={{ base: "17px", md: "10px", lg: "17px" }}
              rightIcon={<AddIcon />}
            >
              New Group Chat
            </Button>
          </GroupChatModal>
        </div>
      </div>
      <Messages />
      <Input />
    </div>
  );
};

export default Chat;
