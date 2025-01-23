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

import { useEffect, useState } from "react";
import { getBalance, requestAccount } from "./services/contractServices";
import { ToastContainer } from "react-toastify";
import ConnectWalletPage from "./pages/ConnectWalletPage";
import Home from "./pages/Home";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { AppBar, Tab, Tabs, Toolbar, Typography } from "@mui/material";
import EventListener from "./eventListener/EventListener";
import { ThemeProvider } from "@mui/material/styles";
import theme from "./theme/theme";

function App() {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<string>("0");


  useEffect(() => {
    const fetchCurAccount = async () => {
      const account = await requestAccount();
      setAccount(account);
    };
    fetchCurAccount();
  }, []);

  useEffect(() => {
    const handleAccountChanged = (newAccounts: any) =>
      setAccount(newAccounts.length > 0 ? newAccounts[0] : null);

    if (window.ethereum) {
      (window.ethereum as any).on("accountsChanged", handleAccountChanged);
    }
    return () => {
      (window.ethereum as any)?.removeListener("accountsChanged", handleAccountChanged);
    };
  });

  useEffect(() => {
    const fetchBalance = async () => {
      if (!account) {
        return;
      }
      const balance = await getBalance(account);
      setBalance(balance || "0");
    };
    fetchBalance();
  }, [account]);

  const updateBalance = async () => {
    if (!account) {
      return;
    }
    const balance = await getBalance(account);
    setBalance(balance || "0");
  };

  return (
  <ThemeProvider theme={theme}>
    <BrowserRouter>
      <div>
        <ToastContainer />

        <EventListener />
        {!account ? (
          <ConnectWalletPage setAccount={setAccount} />
        ) : (
          <>
            <AppBar position="static">
              <Toolbar>
                <Typography variant="h6">
                  <strong>Fundchain</strong> - a decentralized crowdfunding platform (dApp) built on blockchain.
                </Typography>
                <Tabs
                  value={false}
                  textColor="inherit"
                  indicatorColor="secondary"
                  sx={{ marginLeft: "auto" }}
                >
                  <Tab label="Home" to="/" component={Link} />

                </Tabs>
              </Toolbar>
            </AppBar>
            <Routes>
              <Route
                path="/"
                element={
                  <Home
                    account={account}
                    balance={balance}
                    updateBalance={updateBalance}
                  />
                }
              />
            </Routes>
          </>
        )}
      </div>
    </BrowserRouter>
  </ThemeProvider>
  );
}

export default App;