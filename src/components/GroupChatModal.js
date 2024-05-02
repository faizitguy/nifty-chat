import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Spinner
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { collection, getDocs, addDoc, serverTimestamp, writeBatch, doc, arrayUnion, query, where } from "firebase/firestore";
import { db } from "../firebase";
import Select from 'react-select';
// import Loader from "./Loader/Loader";

const GroupChatModal = ({ children }) => {
  const toast = useToast();
  const [usersData, setUsersData] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState("");
   const [loading, setLoading] = useState(false);


  const getAllUsers = async () => {
    const usersCollection = collection(db, "users");
    try {
      const querySnapshot = await getDocs(usersCollection);
      const users = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      return users;
    } catch (error) {
      console.error("Error getting documents: ", error);
      throw error;
    }
  };


  useEffect(() => {
    getAllUsers()
      .then((users) => {
        const options = users.map(user => ({
        value: user.id,
        label: user.displayName
      }));

        setUsersData(options);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);



const createGroup = async (groupName, selectedUsers) => {
  try {
    // Check if a group with the same name already exists
    const groupQuery = query(collection(db, "groups"), where("name", "==", groupName));
    const existingGroups = await getDocs(groupQuery);

    if (!existingGroups.empty) {
      // If a group with the same name already exists, show an error toast
      toast({
        title: "Error",
        description: "A group with the same name already exists.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return; // Exit the function early
    }


    // Add the group to the "groups" collection
    setLoading(true);
    const groupRef = await addDoc(collection(db, "groups"), {
      name: groupName,
      members: selectedUsers.map(user => ({ uid: user.value })),
      createdAt: serverTimestamp()
    });


    // Get the newly created group ID
    const groupId = groupRef.id;

    // Add the group ID to each user's document
    const batch = writeBatch(db);
    selectedUsers.forEach(user => {
      const userRef = doc(db, "users", user.value);
      batch.update(userRef, {
        groups: arrayUnion(groupId)
      });
    });
    await batch.commit();
    // Show success toast
    setLoading(false);
    toast({
      title: "Group Created",
      description: "Your group has been created successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    // Close the modal after successful group creation
    onClose();
  } catch (error) {
    console.error("Error creating group:", error);
    setLoading(false);
    // Show error toast
    toast({
      title: "Error",
      description: "An error occurred while creating the group.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  }
};

  const handleDelete = (delUser) => {
    // setSelectedUsers(selectedUsers.filter(user => user.id !== delUser.id));
  };

const handleSubmit = async () => {
  if (!groupChatName) {
    toast({
      title: "Validation Error",
      description: "Please provide a group name for creating the group!",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
    return;
  }
  if (selectedUsers.length < 2) {
    toast({
      title: "Validation Error",
      description: "Please add at least two users for creating the group!",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
    return;
  }

  if (selectedUsers.length >= 2) {
    await createGroup(groupChatName, selectedUsers);
  }

};


  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleSelectChange = (selectedOptions) => {
    setSelectedUsers(selectedOptions);
  };

  return (
    <>
      {loading && <Spinner />}
      <span onClick={onOpen}>{children}</span>
      <Modal onClose={onClose} isOpen={isOpen} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            d="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody d="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Group Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Select
                options={usersData && usersData}
                isMulti value={selectedUsers}
                onChange={handleSelectChange}
              />
            </FormControl>
            {/* <Box w="100%" d="flex" flexWrap="wrap">
              {selectedUsers.map((user) => (
                <Box key={user.id} m={1}>
                  {user.displayName}
                  <Button
                    size="xs"
                    ml={1}
                    onClick={() => handleDelete(user)}
                  >
                    Remove
                  </Button>
                </Box>
              ))}
            </Box> */}
            {loading && <div>Loading...</div>}
          </ModalBody>
          <ModalFooter>
            <Button onClick={handleSubmit} colorScheme="blue">
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
