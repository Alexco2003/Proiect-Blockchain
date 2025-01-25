# Proiect-Blockchain

# Fundchain - a decentralized crowdfunding platform (dApp) built on blockchain.

## Requirements

## Partea 1: Implementarea smart-contractelor
---
### Cerințe obligatorii :
- utilizarea tipurilor de date specifice Solidity (mappings, address).

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/DonationsManager.sol#L5-L9

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/Project.sol#L11-L23

- înregistrarea de events.

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/Project.sol#L25-L28

- utilizarea de modifiers.

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/Project.sol#L47-L52

- exemple pentru toate tipurile de funcții (external, pure, view etc.).

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/Project.sol#L54-L142

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/DonationsManager.sol#L14-L110

- exemple de transfer de eth.

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/DonationsManager.sol#L14-L33

- ilustrarea interacțiunii dintre smart contracte.

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/Crowdfunding.sol#L16-L30

- deploy pe o rețea locală sau pe o rețea de test Ethereum.

```
npx hardhat node
npx hardhat ignition deploy ignition/modules/Crowdfunding.js --network localhost
```

### Cerințe opționale :
- utilizare librării.

Am utilizat OpenZeppelin pentru ca oferă Ownable pentru implementarea proprietății în contractul Project.

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/Project.sol#L9

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/Project.sol#L44

- implementarea de teste (cu tool-uri la alegerea echipelor).

```
npx hardhat test
```
https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/test/Crowdfunding.js#L1-L177

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/test/Project.js#L1-L181

- utilizarea unor elemente avansate de OOP (interfețe, moștenire) pentru implementarea unor pattern-uri utilizate frecvent (exemple Proxy Pattern,
Withdrawal Pattern, Library Pattern etc.)

Am utilizat Withdrawal Pattern, folosind clase abstracte și moșteniri.

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/DonationsManager.sol#L1-L43

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/DonationsManager.sol#L97-L106

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/backend/contracts/Project.sol#L1-L9

## Partea 2: Interacțiunea cu blockchain printr-o aplicație web3.
---

### Cerințe obligatorii :
- Utilizarea unei librării web3 (exemple web3 sau ethersjs) și conectarea cu un Web3 Provider pentru accesarea unor informații generale despre conturi (adresa, balance).

Am utilizat ethersjs.

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/frontend/app/src/others/global.d.ts#L1-L8

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/frontend/app/src/services/contractServices.tsx#L1-L32

- Inițierea tranzacțiilor de transfer sau de apel de funcții, utilizând clase din librăriile web3.

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/frontend/app/src/services/contractServices.tsx#L36-L82

### Cerințe opționale :
- Tratare events (Observer Pattern).

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/frontend/app/src/eventListener/EventListener.tsx#L1-L185

- Control al stării tranzacțiilor (tratare excepții).

https://github.com/Alexco2003/Proiect-Blockchain/blob/main/frontend/app/src/services/contractServices.tsx#L45-L82