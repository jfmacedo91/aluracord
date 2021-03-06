import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import appConfig from '../config.json';

import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
function getRealTimeMessagens(addMessage) {
	return supabaseClient
		.from("mensagens")
		.on("INSERT", (response) => {
			addMessage(response.new);
		})
		.subscribe()
}


export default function ChatPage() {
	const router = useRouter();
	const user = router.query.username;
	const [message, setMessage] = useState('')
	const [listaDeMensagens, setListaDeMensagens] = React.useState([]);

	useEffect(() => {
		supabaseClient
			.from("mensagens")
			.select("*")
			.order("id", { ascending: false })
			.then(({ data }) => {
				setListaDeMensagens(data)
			});
	
		const subscription = getRealTimeMessagens((newMessage) => {
			setListaDeMensagens((currentValue) => {
				return [newMessage, ...currentValue]
			});
		});

		return () => {
			subscription.unsubscribe();
		}
	}, []);
	
	function handleNewMessage(newMessage) {
		const message = { de: user, texto: newMessage }

		supabaseClient
			.from("mensagens")
			.insert([message])
			.then(({ data }) => {
				console.log("Criando mensagem:", data[0].texto);
			})

		setMessage('');
	}

	return (
		<Box
			styleSheet={{
				display: 'flex', alignItems: 'center', justifyContent: 'center',
				backgroundColor: appConfig.theme.colors.primary[500],
				backgroundImage: `url(https://d17lbu6bbzbdc8.cloudfront.net/wp-content/uploads/2019/09/10220850/minhas-impressoes-sobre-demon-slayer-kimetsu-no-yaiba.jpg)`,
				backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
				color: appConfig.theme.colors.neutrals['000']
			}}
		>
			<Box
				styleSheet={{
					display: 'flex',
					flexDirection: 'column',
					flex: 1,
					boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
					borderRadius: '5px',
					backgroundColor: appConfig.theme.colors.neutrals[700],
					height: '100%',
					maxWidth: '95%',
					maxHeight: '95vh',
					padding: '32px',
				}}
			>
				<Header />
				<Box
					styleSheet={{
						position: 'relative',
						display: 'flex',
						flex: 1,
						height: '80%',
						backgroundColor: appConfig.theme.colors.neutrals[600],
						flexDirection: 'column',
						borderRadius: '5px',
						padding: '16px',
					}}
				>

					<MessageList mensagens={listaDeMensagens} />

					<Box
						as="form"
						styleSheet={{
							display: 'flex',
							alignItems: 'center',
						}}
					>
						<TextField
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									handleNewMessage(message)
								}
							}}
							placeholder="Insira sua mensagem aqui..."
							type="textarea"
							styleSheet={{
								width: '100%',
								border: '0',
								resize: 'none',
								borderRadius: '5px',
								padding: '6px 8px',
								backgroundColor: appConfig.theme.colors.neutrals[800],
								marginRight: '12px',
								color: appConfig.theme.colors.neutrals[200],
							}}
						/>
						<ButtonSendSticker onStickerClick={ (sticker) => {
							handleNewMessage(`:sticker:${sticker}`);
						} }/>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}

function Header() {
	return (
		<>
			<Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
				<Text variant='heading5'>
					Chat
				</Text>
				<Button
					variant='tertiary'
					colorVariant='neutral'
					label='Logout'
					href="/"
				/>
			</Box>
		</>
	)
}

function MessageList(props) {
	console.log('MessageList', props);
	return (
		<Box
			tag="ul"
			styleSheet={{
				overflowY: 'auto',
				display: 'flex',
				flexDirection: 'column-reverse',
				flex: 1,
				color: appConfig.theme.colors.neutrals["000"],
				marginBottom: '16px',
			}}
		>
			{props.mensagens.map(mensagem => (
				<Text
					key={mensagem.id}
					tag="li"
					styleSheet={{
						borderRadius: '5px',
						padding: '6px',
						marginBottom: '12px',
						hover: {
							backgroundColor: appConfig.theme.colors.neutrals[700],
						}
					}}
				>
					<Box
						styleSheet={{
							marginBottom: '8px',
						}}
					>
						<Image
							styleSheet={{
								width: '20px',
								height: '20px',
								borderRadius: '50%',
								display: 'inline-block',
								marginRight: '8px',
							}}
							src={`https://github.com/${ mensagem.de }.png`}
						/>
						<Text tag="strong">
							{mensagem.de}
						</Text>
						<Text
							styleSheet={{
								fontSize: '10px',
								marginLeft: '8px',
								color: appConfig.theme.colors.neutrals[300],
							}}
							tag="span"
						>
							{(new Date().toLocaleDateString())}
						</Text>
					</Box>
					{ mensagem.texto.startsWith(":sticker:") ? (
						<Image src={ mensagem.texto.replace(":sticker:", "") } width={ "300px" } />
					) : (
						mensagem.texto
					)}
				</Text>
			))}
		</Box>
	)
}