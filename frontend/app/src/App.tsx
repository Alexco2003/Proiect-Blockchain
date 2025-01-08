/*import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
*/

import { useState } from 'react';
import { ethers } from 'ethers';
import './App.css';

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = (await window.ethereum.request({
                method: 'eth_requestAccounts',
            })) as string[];

            setAccount(accounts[0]);
            getBalance(accounts[0]);
        } catch (error) {
            console.error('User rejected connection', error);
        }
    } else {
        alert('MetaMask is not installed! Please install MetaMask to use this app.');
    }
};



const getBalance = async (account: string) => {
  if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const balance = await provider.getBalance(account);
      setBalance(ethers.formatEther(balance));
  }
};



  return (
    <div className="App">
      <h1>Crowdfunding dApp</h1>
      {!account ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p><strong>Connected Account:</strong> {account}</p>
          <p><strong>Balance:</strong> {balance} ETH</p>
        </div>
      )}
    </div>
  );
}

export default App;
