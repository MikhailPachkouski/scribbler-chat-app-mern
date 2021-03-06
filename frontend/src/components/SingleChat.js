import { EditIcon } from '@chakra-ui/icons';
import {
	Box,
	FormControl,
	IconButton,
	Input,
	Spinner,
	Text,
	useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getSender } from '../config/ChatLogics';
import { ChatState } from '../Context/ChatProvider';
import ChatMessages from './ChatMessages';
import ProfileModal from './miscellaneous/ProfileModal';
import UpgradeGroupChatModal from './miscellaneous/UpgradeGroupChatModal';
import './style.css';
import Lottie from 'react-lottie';
import animationData from './typing.json';

import io from 'socket.io-client';

// const ENDPOINT = 'https://scribbler-mern-pmv.herokuapp.com/';
const ENDPOINT = 'http://localhost:5000';
let socket, selectedChatCompare;

const SingleChat = () => {
	const {
		user,
		selectedChat,
		setSelectedChat,
		fetchAgain,
		setFetchAgain,
		notification,
		setNotification,
		chats,
		setChats
	} = ChatState();
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [newMessage, setNewMessage] = useState("");
	const [socketConnected, setSocketConnected] = useState(false);
	const [typing, setTyping] = useState(false);
	const [isTyping, setIsTyping] = useState(false);

	const defaultOptions = {
		loop: true,
		autoplay: true,
		animationData: animationData,
		rendererSettings: {
			preserveAspectRatio: 'xMidYMid slice',
		},
	};

	const toast = useToast();

	const fetchMessages = async () => {
		if (!selectedChat) return;

		try {
			const config = {
				headers: {
					Authorization: `Bearer ${user.token}`,
				},
			};

			setLoading(true);

			const { data } = await axios.get(
				`/api/message/${selectedChat._id}`,
				config
			);

			setMessages(data);
			setLoading(false);

			socket.emit('join chat', selectedChat._id);
		} catch (error) {
			toast({
				title: 'Error Occured!',
				description: 'Failed to load the Message',
				status: 'error',
				duration: 5000,
				isClosable: true,
				position: 'bottom',
			});
		}
	};

	useEffect(() => {
		socket = io(ENDPOINT);
		socket.emit('setup', user);
		socket.on('connected', () => setSocketConnected(true));
		socket.on('typing', () => setIsTyping(true));
		socket.on('stop typing', () => setIsTyping(false));
		// eslint-disable-next-line
	}, []);

	useEffect(() => {
		fetchMessages();

		selectedChatCompare = selectedChat;
		// eslint-disable-next-line
	}, [selectedChat]);

	useEffect(() => {
		socket.on('message recieved', newMessageRecieved => {
			if (
				!selectedChatCompare ||
				selectedChatCompare._id !== newMessageRecieved.chat._id
			) {
				if (!notification.includes(newMessageRecieved)) {
					setNotification([newMessageRecieved, ...notification]);
					setFetchAgain(!fetchAgain);
				}
			} else {
				setMessages([...messages, newMessageRecieved]);
			}
		});
	});

	const sendMessage = async e => {
		if (e.key === 'Enter' && newMessage) {
			socket.emit('stop typing', selectedChat._id);
			try {
				const config = {
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${user.token}`,
					},
				};

				setNewMessage('');
				const { data } = await axios.post(
					'/api/message',
					{
						content: newMessage,
						chatId: selectedChat._id,
					},
					config
				);
				// console.log(data);
				socket.emit('new message', data);
				setMessages([...messages, data]);
				setFetchAgain(!fetchAgain);
			} catch (error) {
				toast({
					title: 'Error Occured!',
					description: 'Failed to send the Message',
					status: 'error',
					duration: 5000,
					isClosable: true,
					position: 'bottom',
				});
			}
		}
	};

	const inputHandler = e => {
		setNewMessage(e.target.value);

		if (!socketConnected) return;

		if (!typing) {
			setTyping(true);
			socket.emit('typing', selectedChat._id);
		}

		let lastTypingTime = new Date().getTime();
		let timer = 3000;
		setTimeout(() => {
			let timeNow = new Date().getTime();
			let timeDiff = timeNow - lastTypingTime;

			if (timeDiff >= timer && typing) {
				socket.emit('stop typing', selectedChat._id);
				setTyping(false);
			}
		}, timer);
	};

	return (
		<>
			{selectedChat ? (
				<>
					<Text
						fontSize={{ base: '28px', md: '30px' }}
						pb={3}
						px={2}
						w='100%'
						fontFamily='Work sans'
						d='flex'
						justifyContent={{ base: 'space-between' }}
						alignItems='center'
					>
						<IconButton
							d={{ base: 'flex', md: 'none' }}
							icon={<EditIcon />}
							onClick={() => setSelectedChat('')}
						/>
						{!selectedChat.isGroupChat ? (
							<>
								{getSender(user, selectedChat.users)}
								<ProfileModal user2={selectedChat.users[1]} chat={selectedChat} setChat={setSelectedChat} chats={chats} setChats={setChats}/>
							</>
						) : (
							<>
								{selectedChat.chatName}
								<UpgradeGroupChatModal fetchMessages={fetchMessages} />
							</>
						)}
					</Text>
					<Box
						d='flex'
						flexDir='column'
						justifyContent='flex-end'
						p={3}
						bg='#E8E8E8'
						w='100%'
						h='100%'
						borderRadius='lg'
						overflowY='hidden'
					>
						{loading ? (
							<Spinner
								// size={"xs"}
								w={20}
								h={20}
								// alignSelf={"center"}
								margin={'auto'}
							/>
						) : (
							<div className='messages'>
								<ChatMessages messages={messages} />
							</div>
						)}
						<FormControl onKeyDown={sendMessage} isRequired mt={3}>
							{isTyping ? (
								<div>
									<Lottie
										options={defaultOptions}
										// height={50}
										width={70}
										style={{ marginBottom: 15, marginLeft: 0 }}
									/>
								</div>
							) : (
								<></>
							)}
							<Input
								variant={'filled'}
								bg={'E0E0E0'}
								onChange={inputHandler}
								value={newMessage}
								placeholder={'Enter a text...'}
							/>
						</FormControl>
					</Box>
				</>
			) : (
				<Box
					d={'flex'}
					justifyContent={'center'}
					alignItems={'center'}
					h={'100%'}
				>
					<Text fontFamily={'Work sans'} fontSize={'3xl'} pb={3}>
						Click on a user to start chatting
					</Text>
				</Box>
			)}
		</>
	);
};

export default SingleChat;
