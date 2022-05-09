import {
	Button,
	FormControl,
	FormLabel,
	Input,
	InputGroup,
	InputRightElement,
	useToast,
	VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { ChatState } from '../../Context/ChatProvider';

const Login = () => {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);

	const { chats, setChats, fetchAgain, setFetchAgain } = ChatState();

	const history = useHistory();

	const toast = useToast();

	const handleClick = () => setShow(!show);

	const handleEmailChange = e => {
		setEmail(e.target.value);
	};

	const submitHandler = async () => {
		setLoading(true);
		if (!email || !password) {
			toast({
				title: 'Please Fill all the Feilds',
				status: 'warning',
				duration: 5000,
				isClosable: true,
				position: 'bottom',
			});
			setLoading(false);
			return;
		}

		try {
			const config = {
				headers: {
					'Content-type': 'application/json',
				},
			};

			const { data } = await axios.post(
				'/api/user/login',
				{ email, password },
				config
			);
			
			await setChats([])
			localStorage.setItem('userInfo', JSON.stringify(data));
			setLoading(false);
			history.push('/chats');
			await setFetchAgain(!fetchAgain)
			toast({
				title: 'Login Successful',
				status: 'success',
				duration: 5000,
				isClosable: true,
				position: 'bottom',
			});
		} catch (error) {
			toast({
				title: 'Error Occured!',
				description: error.message,
				status: 'error',
				duration: 5000,
				isClosable: true,
				position: 'bottom',
			});
			setLoading(false);
		}
	};

	return (
		<VStack spacing={'5px'}>
			<FormControl id='emailLogin' isRequired>
				<FormLabel>Email</FormLabel>
				<Input
					value={email}
					type='email'
					placeholder='Enter Your Email'
					onChange={handleEmailChange}
				/>
			</FormControl>

			<FormControl id='passwordLogin' isRequired>
				<FormLabel>Password</FormLabel>
				<InputGroup>
					<Input
						pr='4.5rem'
						type={show ? 'text' : 'password'}
						placeholder='Enter Password'
						onChange={e => setPassword(e.target.value)}
						value={password}
					/>
					<InputRightElement width='4.5rem'>
						<Button h='1.75rem' size='sm' onClick={handleClick}>
							{show ? 'Hide' : 'Show'}
						</Button>
					</InputRightElement>
				</InputGroup>
			</FormControl>
			<Button
				colorScheme={'blue'}
				width='100%'
				style={{ marginTop: 15 }}
				onClick={submitHandler}
				isLoading={loading}
			>
				Login
			</Button>

			<Button
				variant={'solid'}
				colorScheme={'red'}
				width='100%'
				style={{ marginTop: 5 }}
				onClick={() => {
					setEmail('guestuser@example.com');
					setPassword('123456');
				}}
			>
				Get Guest User Credentials
			</Button>
		</VStack>
	);
};

export default Login;
