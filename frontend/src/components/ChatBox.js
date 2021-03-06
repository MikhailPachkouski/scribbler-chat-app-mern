import { Box } from '@chakra-ui/react';
import { ChatState } from '../Context/ChatProvider';
import SingleChat from './SingleChat';

const ChatBox = () => {
	const { selectedChat } = ChatState();

	return (
		<Box
			d={{ base: selectedChat ? 'flex' : 'none', md: 'flex' }}
			alignItems='center'
			flexDir='column'
			p={3}
			bg='white'
			w={{ base: '100%', md: '68%' }}
			h={'87vh'}
			borderRadius='lg'
			borderWidth='1px'
		>
			<SingleChat />
		</Box>
	);
};

export default ChatBox;
