import './index.scss'
const SHA256 = require('crypto-js/sha256')
const secp = require('@noble/secp256k1')

const server = 'http://localhost:3042'

document
	.getElementById('exchange-address')
	.addEventListener('input', ({ target: { value } }) => {
		if (value === '') {
			document.getElementById('balance').innerHTML = 0
			return
		}

		fetch(`${server}/balance/${value}`)
			.then((response) => {
				return response.json()
			})
			.then(({ balance }) => {
				document.getElementById('balance').innerHTML = balance
			})
	})

// function messageToServer(privateKey, sender, amount, recipient) {
// 	const messageData = {
// 		sender: sender,
// 		amount: amount,
// 		recipient: recipient,
// 	}
// 	const message = JSON.stringify(messageData)
// 	const messageHash = SHA256(message)

// 	let signature = secp.sign(messageHash.toString(), privateKey)
// 	signature = Buffer.from(signature).toString('hex')

// 	return { message: message, signature: signature }
// }

document
	.getElementById('transfer-amount')
	.addEventListener('click', async () => {
		const sender = document.getElementById('exchange-address').value
		const amount = document.getElementById('send-amount').value
		const recipient = document.getElementById('recipient').value
		const privateKey = document.getElementById('private-key').value
		// const messageInfo = messageToServer(privateKey, sender, amount, recipient)

		const messageData = { sender, amount, recipient }
		const message = JSON.stringify(messageData)
		const messageHash = SHA256(message).toString()

		let signature = await secp.sign(messageHash, privateKey)
		signature = Buffer.from(signature).toString('hex')

		const body = JSON.stringify({ sender, amount, recipient, signature })

		const request = new Request(`${server}/send`, { method: 'POST', body })

		fetch(request, { headers: { 'Content-Type': 'application/json' } })
			.then((response) => {
				return response.json()
			})
			.then(({ balance }) => {
				document.getElementById('balance').innerHTML = balance
			})
	})
