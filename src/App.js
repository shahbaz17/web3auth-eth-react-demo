import {useEffect, useState} from 'react'
import {Web3Auth} from '@web3auth/web3auth'
import Web3 from 'web3'
import './App.css'

const clientId = process.env.REACT_APP_CLIENT_ID // get the clientId from https://dashboard.web3auth.io

function App() {
  const [web3auth, setWeb3auth] = useState(null)
  const [provider, setProvider] = useState(null)

  useEffect(() => {
    const init = async () => {
      try {
        const web3auth = new Web3Auth({
          clientId,
          chainConfig: {
            chainNamespace: 'eip155',
            chainId: '0x3', // ropsten, use '0x1' if don't want to use Infura/Ropsten.
            rpcTarget: `https://ropsten.infura.io/v3/${process.env.REACT_APP_INFURA_ID}`, // use 'https://rpc.ankr.com/eth' if don't want to use Infura/Ropsten.
          },
        })

        setWeb3auth(web3auth)

        await web3auth.initModal()
        if (web3auth.provider) {
          setProvider(web3auth.provider)
        }
      } catch (error) {
        console.error(error)
      }
    }

    init()
  }, [])

  const login = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    // const web3authProvider = await web3auth.connect()
    // setProvider(web3authProvider)
    await web3auth.connect().then(web3authProvider => {
      setProvider(web3authProvider)
      getUserInfo()
    })
  }

  const getUserInfo = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    const user = await web3auth.getUserInfo()
    // console.log(JSON.stringify(user, null, 2))
    uiConsole(user)
  }

  const logout = async () => {
    if (!web3auth) {
      uiConsole('web3auth not initialized yet')
      return
    }
    await web3auth.logout()
    setProvider(null)
  }

  const getAccounts = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const web3 = new Web3(provider)
    const userAccounts = await web3.eth.getAccounts()
    uiConsole(userAccounts)
  }

  const getBalance = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const web3 = new Web3(provider)
    const accounts = await web3.eth.getAccounts()
    const balance = await web3.eth.getBalance(accounts[0])
    uiConsole(web3.utils.fromWei(balance) + ' ETH')
  }

  const signMessage = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const web3 = new Web3(provider)
    // Get user's Ethereum public address
    const fromAddress = (await web3.eth.getAccounts())[0]

    const originalMessage = 'Your Message'

    const signedMessage = await web3.eth.personal.sign(
      originalMessage,
      fromAddress,
    )
    uiConsole(signedMessage)
  }

  const sendTransaction = async () => {
    if (!provider) {
      uiConsole('provider not initialized yet')
      return
    }
    const web3 = new Web3(provider)
    const accounts = await web3.eth.getAccounts()

    const txRes = await web3.eth.sendTransaction({
      from: accounts[0],
      to: accounts[0],
      value: web3.utils.toWei('0.0001'),
    })
    uiConsole(txRes.transactionHash)
  }

  function uiConsole(...args) {
    const el = document.querySelector('#console>p')
    if (el) {
      el.innerHTML = JSON.stringify(args || {}, null, 2)
    }
  }

  const loggedInView = (
    <>
      <div className="flex-container">
        <div>
          <button onClick={getUserInfo} className="card">
            Get User Info
          </button>
        </div>
        <div>
          <button onClick={getAccounts} className="card">
            Get Accounts
          </button>
        </div>
        <div>
          <button onClick={getBalance} className="card">
            Get Balance
          </button>
        </div>
        <div>
          <button onClick={signMessage} className="card">
            Sign Message
          </button>
        </div>
        <div>
          <button onClick={sendTransaction} className="card">
            Send Transaction
          </button>
        </div>
        <div>
          <button onClick={logout} className="card">
            Log Out
          </button>
        </div>
      </div>

      <div id="console" style={{whiteSpace: 'pre-line'}}>
        <p style={{whiteSpace: 'pre-line'}}></p>
      </div>
    </>
  )

  const unloggedInView = (
    <button onClick={login} className="card">
      Login
    </button>
  )

  return (
    <div className="container">
      <h1 className="title">
        <a target="_blank" href="http://web3auth.io/" rel="noreferrer">
          Web3Auth
        </a>{' '}
        & ReactJS Example using Ethereum
      </h1>

      <div className="grid">{provider ? loggedInView : unloggedInView}</div>

      <footer className="footer">
        <a
          href="https://github.com/shahbaz17/web3auth-eth-react-demo"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source code
        </a>
      </footer>
    </div>
  )
}

export default App
