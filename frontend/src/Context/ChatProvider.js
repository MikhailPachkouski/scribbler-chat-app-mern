import { createContext, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

const ChatContext = createContext();

const ChatProvider = ({ children }) => {
	const [user, setUser] = useState();
	const [selectedChat, setSelectedChat] = useState();
	const [notification, setNotification] = useState([]);
	const [chats, setChats] = useState();
	const [fetchAgain, setFetchAgain] = useState(false);

	const history = useHistory();

	useEffect(() => {
		const userInfo = JSON.parse(localStorage.getItem('userInfo'));
		setUser(userInfo);

		if (!userInfo) history.push('/');
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [history]);

	return (
		<ChatContext.Provider
			value={{
				user,
				selectedChat,
				setSelectedChat,
				setUser,
				notification,
				setNotification,
				chats,
				setChats,
				fetchAgain,
				setFetchAgain,
			}}
		>
			{children}
		</ChatContext.Provider>
	);
};

export const ChatState = () => {
	return useContext(ChatContext);
};

export default ChatProvider;