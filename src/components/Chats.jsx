import { collection, doc, getDoc, getDocs, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContext";
import { db } from "../firebase";

const Chats = () => {
  const [chats, setChats] = useState([]);
  const [groups, setGroups] = useState([]);
  const [users, setUsers] = useState([]);

  const { currentUser } = useContext(AuthContext);
  const { dispatch } = useContext(ChatContext);

  const getUserStatus = (userId) => {
    const user = users.find((user) => user.uid === userId);
    return user ? user.online : false;
  };

  const getAllGroups = async () => {
    try {
      // Query the "groups" collection to fetch all documents
      const groupsCollection = collection(db, "groups");
      const groupsSnapshot = await getDocs(groupsCollection);

      // Map the documents to an array of objects containing the document ID and data
      const allGroups = groupsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return allGroups;
    } catch (error) {
      console.error("Error fetching all groups:", error);
      throw error;
    }
  };

  const filterGroupsByUID = (groups, uid) => {
    // Filter the groups data based on the given UID
    const filteredGroups = groups.filter(group => {
      // Check if the UID exists in the members array of the group
      return group.members.some(member => member.uid === uid);
    });

    return filteredGroups;
  };

  useEffect(() => {
    const getChats = () => {
      const unsub = onSnapshot(doc(db, "userChats", currentUser.uid), (doc) => {
        setChats(doc.data());
      });

      return () => {
        unsub();
      };
    };

    getAllGroups()
      .then(groups => {
        setGroups(filterGroupsByUID(groups, currentUser.uid));
      })
      .catch(error => {
        console.error("Error:", error);
      });

    if (currentUser.uid) {
      getChats();
    }

    const unsubscribeGroups = onSnapshot(collection(db, "groups"), (snapshot) => {
      const updatedGroups = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setGroups(filterGroupsByUID(updatedGroups, currentUser.uid));
    });

    return () => {
      unsubscribeGroups();
    };
    
  }, [currentUser.uid]);


  const handleSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  const handleGroupSelect = async (group) => {
    //check whether the group(chats in firestore) exists, if not create
    const combinedId = `${group?.groupName}${group?.uid}`;
    try {
      const res = await getDoc(doc(db, "groupChats", combinedId));

      if (!res.exists()) {
        //create a chat in chats collection
        await setDoc(doc(db, "groupChats", combinedId), { messages: [] });

        //create user chats
        await updateDoc(doc(db, "groupChats", group.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser?.uid,
            displayName: currentUser?.displayName,
            photoURL: currentUser?.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "groupChats", group.uid), {
          [combinedId + ".userInfo"]: {
            uid: currentUser?.uid,
            displayName: currentUser?.displayName,
            photoURL: currentUser?.photoURL,
          },
          [combinedId + ".date"]: serverTimestamp(),
        });
      }
    } catch (err) { }
    dispatch({ type: "CHANGE_GROUP", payload: group });
  };
  

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const updatedUsers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(updatedUsers);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="chats">
      {chats && Object.entries(chats)?.sort((a,b)=>b[1].date - a[1].date).map((chat) => (
        <div
          className="userChat"
          key={chat[0]}
          onClick={() => handleSelect(chat[1].userInfo)}
        >
          <div className="userInfoWrapper">
          <img src={chat[1].userInfo?.photoURL} alt="" />
          <div className="userChatInfo">
            <span>{chat[1].userInfo?.displayName}</span>
              <p>{chat[1]?.lastMessage?.text ? (chat[1].lastMessage.text.length > 12 ? `${chat[1].lastMessage.text.substring(0, 15)}...` : chat[1].lastMessage.text) : ""}</p>
          </div>
          </div>
          <div className={getUserStatus(chat[1].userInfo?.uid) ? "online" : "offline"}>
            {getUserStatus(chat[1].userInfo?.uid) ? "Online" : "Offline"}
          </div>
        </div>
      ))}
      {groups.map((group) => (
        <div
          className="userChat"
          key={group.id}
          onClick={() => handleGroupSelect({
            uid: group.id,
            photoURL: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCvKU3M4ozHwhhnT5yMr56k44UWlAKijTi0Un5sGUIdQ&s',
            displayName: group?.name,
            groupName: group?.name
          })}
        >
          <div className="userInfoWrapper">
          <img src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCvKU3M4ozHwhhnT5yMr56k44UWlAKijTi0Un5sGUIdQ&s' alt="" />
          <div className="userChatInfo">
            <span>{group.name}</span>
          </div>
          </div>
            <div className="groupLabel">Group</div>
        </div>
      ))}
    </div>
  );
};

export default Chats;
