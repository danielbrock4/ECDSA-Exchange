const express = require('express')
const app = express()
const cors = require('cors')
const secp = require('@noble/secp256k1')
const SHA256 = require('crypto-js/sha256')
const port = 3042

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors())
app.use(express.json())

// Comments
// let privateKey = secp.utils.randomPrivateKey()
// privateKey = Buffer.from(privateKey1).toString('hex')
// let publicKey = secp.utils.randomPublicKey(privateKey)
// // the creates a concated x and y publicKey
// publicKey = Buffer.from(publicKey1).toString('hex')
// // the creates a concated x and y publicKey
// publicKey = '0x' + publicKey.slice(publicKey1.length - 40)

const privateKey1 = Buffer.from(secp.utils.randomPrivateKey()).toString('hex')
const privateKey2 = Buffer.from(secp.utils.randomPrivateKey()).toString('hex')
const privateKey3 = Buffer.from(secp.utils.randomPrivateKey()).toString('hex')

let publicKey1 = Buffer.from(secp.getPublicKey(privateKey1)).toString('hex')
let publicKey2 = Buffer.from(secp.getPublicKey(privateKey2)).toString('hex')
let publicKey3 = Buffer.from(secp.getPublicKey(privateKey3)).toString('hex')

publicKey1 = `0x${publicKey1.slice(publicKey1.length - 40)}`
publicKey2 = `0x${publicKey2.slice(publicKey2.length - 40)}`
publicKey3 = `0x${publicKey3.slice(publicKey3.length - 40)}`

const balances = {
	//destructure the variable with array tags to make it work better
	[publicKey1]: 100,
	[publicKey2]: 50,
	[publicKey3]: 75,
}

const privateKeys = {
	1: privateKey1,
	2: privateKey2,
	3: privateKey3,
}

app.get('/balance/:address', (req, res) => {
	const { address } = req.params
	const balance = balances[address] || 0
	res.send({ balance })
})

app.post('/send', (request, resolve) => {
	const { sender, amount, recipient, signature } = request.body

	const messageData = { sender, amount, recipient }
	const message = JSON.stringify(messageData)
	const messageHash = SHA256(message).toString()

	const recoveredPublicKey = secp.recoverPublicKey(messageHash, signature, 1)
	// console.log(recoveredPublicKey)
	const isVerified = secp.verify(signature, messageHash, recoveredPublicKey)

	if (isVerified) {
		balances[sender] -= amount
		balances[recipient] = (balances[recipient] || 0) + +amount
	}

	resolve.send({ balance: balances[sender] })
})

app.listen(port, () => {
	console.log(`Listening on port ${port}!`)
	console.log('Available Accounts')
	console.log('========================')
	for (let [key, value] of Object.entries(balances)) {
		console.log(`${key} (${value} ETH)`)
	}
	console.log('Private Keys')
	console.log('========================')
	for (let value of Object.values(privateKeys)) {
		console.log(`${value}`)
	}
})
