const {
  Connection,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  PublicKey,
  Keypair,
} = require('@solana/web3.js')
const fs = require('fs')
const colors = require('colors')
const base58 = require('bs58')
const WALLET_ADDRESS = require('./walletAddress')
const DEVNET_URL = 'https://devnet.sonic.game/'
const connection = new Connection(DEVNET_URL, 'confirmed')

const HOW_MANY_TRANSACTIONS = 105
const AMOUNT_TO_SEND = 0.001 // 0.001 SOL

async function sendSol(fromKeypair, toPublicKey, amount) {
  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: fromKeypair.publicKey,
      toPubkey: toPublicKey,
      lamports: amount * LAMPORTS_PER_SOL,
    })
  )

  const signature = await sendAndConfirmTransaction(connection, transaction, [
    fromKeypair,
  ])

  console.log(colors.green('Transaksi di Konfirmasi: '), signature)
}

function getKeypairFromPrivateKey(privateKeyBase58) {
  const privateKeyBytes = base58.decode(privateKeyBase58)
  const keypair = Keypair.fromSecretKey(privateKeyBytes)
  return keypair
}

;(async () => {
  console.log(colors.magenta('--- Solana Transaction Script ---'))

  const walletJson = JSON.parse(fs.readFileSync('privateKey.json', 'utf-8'))
  const walletPrivateKey = walletJson.key

  if (!walletPrivateKey) {
    throw new Error(
      colors.red('privateKey.json is not set correctly or is empty')
    )
  }

  const fromKeypair = getKeypairFromPrivateKey(walletPrivateKey)

  for (let i = 0; i < HOW_MANY_TRANSACTIONS; i++) {
    // tunggu 5-8 detik untuk setiap transaksi
    await new Promise((resolve) =>
      setTimeout(resolve, 5000 + Math.random() * 3000)
    )

    console.log(colors.blue(`\nTransaksi ${i + 1}:`))
    const randomWalletIndex = Math.floor(Math.random() * WALLET_ADDRESS.length)
    const address = WALLET_ADDRESS[randomWalletIndex]
    const toPublicKey = new PublicKey(address)
    try {
      await sendSol(fromKeypair, toPublicKey, AMOUNT_TO_SEND)
      console.log(colors.green(`Sukses ${AMOUNT_TO_SEND} SOL to ${address}`))
    } catch (error) {
      console.error(colors.red(`Failed to send SOL to ${address}:`), error)
    }
  }

  console.log(
    colors.green('\n================== WELLLLLL DONE!! ==================')
  )
})()
