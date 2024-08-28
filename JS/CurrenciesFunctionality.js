
// ETH
try {
  var web3 = new Web3(
    new Web3.providers.HttpProvider(
      "https://sepolia.infura.io/v3/31dcabced2344e7db2fa98e375858867"
    )
  );
  
  // AVAX
  var web3AVAX = new Web3(
    "https://avalanche-fuji.infura.io/v3/55e824bc56b34aff8b55d07c64d1ff7c"
  );
  console.log("api working");
}
catch {
  console.log("error loading apnetwork api");
}

async function getETHBalance() {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);

  if (!loggedInUser) {
    console.log("No logged in user found");
    return;
  }

  // Assuming web3 is already initialized and connected to the Ethereum network
  let balanceWei = await web3.eth.getBalance(loggedInUser.address);
  let balanceEth = web3.utils.fromWei(balanceWei, "ether");

  console.log("Balance: ", balanceEth);
  document.getElementById("walletBalance").innerText = `${balanceEth.toString().match(/^-?\d+(?:\.\d{0,3})?/)[0]} ETH`;
}

async function getAVAXBalance() {
  // Display the user balance on the home(index) page for AVAX
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);

  if (!loggedInUser) {
    console.log("No logged in user found");
    return;
  }

  try {
    let balanceWei = await web3AVAX.eth.getBalance(loggedInUser.address);
    let balanceAVAX = web3AVAX.utils.fromWei(balanceWei, "ether");

    console.log("AVAX Balance: ", balanceAVAX);
    
    let balanceElement = document.getElementById("walletBalanceAvax");
    
    if (balanceElement) {
      balanceElement.innerText = `${balanceAVAX.toString().match(/^-?\d+(?:\.\d{0,3})?/)[0]} AVAX`;
    } else {
      console.error("Element with ID 'walletBalanceAvax' not found.");
    }
  } catch (error) {
    console.error("Error fetching AVAX balance:", error);
  }
}

function sendETHTransaction(toAddress, amountInEther) {
  // this function is for ETH transactions
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);
  var password = loggedInUser ? loggedInUser.password : null;

  if (!password) {
    console.log("No logged in user found");
    return;
  }

  var serializedKeystore = loggedInUser.serializedKeystore;
  var keyss = lightwallet.keystore.deserialize(serializedKeystore);
  keyss.keyFromPassword(password, function (err, pwDerivedKey) {
    if (err) throw err;
    var privateKey = keyss.exportPrivateKey(loggedInUser.address, pwDerivedKey);
    var account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    var transactionParams = {
      from: account.address,
      to: toAddress,
      value: web3.utils.toWei(amountInEther.toString(), "ether"),
      gas: 21000, // standard gas limit for a simple transaction
      gasPrice: 54340000000, //  this is the average gas price for ETH transaction
    };

    // signing and sending transaction
    web3.eth
      .sendTransaction(transactionParams)
      .on("transactionHash", function (hash) {
        console.log("The transaction was successfully dispatched.\n");
        console.log("Transaction hash:\n");
        console.log(hash);
        document.getElementById("transactionStatus").innerText =
          "The transaction was successfully dispatched. \n\nThe transaction hash is as follows: \n" + hash;

        var transactionDetails = {
          hash: hash,
          from: account.address,
          to: toAddress,
          value: amountInEther,
          type: "ETH",
        };

        if (!loggedInUser.transactions) {
          loggedInUser.transactions = [];
        }

        loggedInUser.transactions.push(transactionDetails);
        localStorage.setItem("userData", JSON.stringify(allUsers));

        // Find the reciever user in the list of all users
        var ToUser = allUsers.find((user) => user.address === toAddress);

        // If the sending user is found and they don't have a transactions array, initialize one
        if (ToUser && !ToUser.transactions) {
          ToUser.transactions = [];
        }

        // If the sending user is found, add the transaction to their history
        if (ToUser) {
          ToUser.transactions.push(transactionDetails);
        }

        localStorage.setItem("userData", JSON.stringify(allUsers));
      })

      .on("error", function (error) {
        console.error(error);
        document.getElementById("transactionStatus").innerText =
          "Transaction failed. Not enough funds to complete transaction ";
      });
  });
}

async function sendAVAXTransaction(toAddress, amountInEther) {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);
  var password = loggedInUser ? loggedInUser.password : null;

  if (!password) {
    console.log("No logged in user found");
    return;
  }

  var serializedKeystore = loggedInUser.serializedKeystore;
  var keyss = lightwallet.keystore.deserialize(serializedKeystore);

  keyss.keyFromPassword(password, function (err, pwDerivedKey) {
    if (err) throw err;

    var privateKey = keyss.exportPrivateKey(loggedInUser.address, pwDerivedKey);
    var account = web3AVAX.eth.accounts.privateKeyToAccount(privateKey);
    web3AVAX.eth.accounts.wallet.add(account);

    var transactionParams = {
      from: account.address,
      to: toAddress,
      value: web3AVAX.utils.toWei(amountInEther.toString(), "ether"),
      gas: 21000,
      gasPrice: 54340000000,
    };

    // signing and sending transaction
    web3AVAX.eth
      .sendTransaction(transactionParams)
      .on("transactionHash", function (hash) {
        console.log("Transaction sent successfully. Transaction hash: ", hash);
        document.getElementById("transactionStatus").innerText =
          "Transaction sent successfully. Transaction hash: " + hash;

        var transactionDetails = {
          hash: hash,
          from: account.address,
          to: toAddress,
          value: amountInEther,
          type: "AVAX",
        };

        if (!loggedInUser.transactions) {
          loggedInUser.transactions = [];
        }

        loggedInUser.transactions.push(transactionDetails);

        // Find the reciever user in the list of all users
        var ToUser = allUsers.find((user) => user.address === toAddress);

        // If the recieving user is found and they don't have a transactions array, initialize one
        if (ToUser && !ToUser.transactions) {
          ToUser.transactions = [];
        }

        // If the recieving user is found, add the transaction to their history
        if (ToUser) {
          ToUser.transactions.push(transactionDetails);
        }

        localStorage.setItem("userData", JSON.stringify(allUsers));
      })
      .on("error", function (error) {
        console.error(error);
        document.getElementById("transactionStatus").innerText =
          "Transaction failed. Not enough funds to complete transaction ";
      });
  });
}



function getEthPrice() {
  // to display the ETH price on the page
  fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd"
  )
    .then((response) => response.json())
    .then((data) => {
      const ethPrice = data.ethereum.usd;
      document.getElementById("ethPrice").textContent = `${ethPrice} `;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function getAvaxPrice() {
  // to display the avalanche price
  fetch(
    "https://api.coingecko.com/api/v3/simple/price?ids=avalanche-2&vs_currencies=usd"
  )
    .then((response) => response.json())
    .then((data) => {
      const avaxPrice = data["avalanche-2"].usd;
      document.getElementById("avaxPrice").textContent = `${avaxPrice} `;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function fetchTransactions() {
  var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  var loggedInUser = allUsers.find((user) => user.isLoggedIn);

  if (!loggedInUser) {
    console.log("No logged in user found");
    return;
  }

  let transactionList = document.getElementById("transactionList");
  let transactions = loggedInUser.transactions;

  if (transactions && transactions.length) {
    transactions.forEach((tx) => {
      let transactionRow = document.createElement("tr");
      transactionRow.innerHTML = `
        <td>
          <p><h3>Transaction Hash: </h3>${tx.hash}</p>
          <p><h3>From Address: </h3>${tx.from}</p>
          <p><h3>To Address: </h3>${tx.to}</p>
        </td>
        <td>${tx.value}</td>
        <td>${tx.type}</td>
      `;
      transactionList.appendChild(transactionRow);
    });
  } else {
    console.log("No transactions found for this user");
  }
}

function sendCoins(event) {
  // this function interacts with the html send coins page
  event.preventDefault(); // prevent form from being submitted normally

  var toAddress = document.getElementById("recipient").value; // get account
  var amountInEther = document.getElementById("amount").value; // get amount
  var coinType = document.getElementById("coin").value; //get coin type

  // depending on which type of coin to choose the specific transaction function for that coin
  if (coinType === "ETH") {
    sendETHTransaction(toAddress, amountInEther);
  } else if (coinType === "AVAX") {
    sendAVAXTransaction(toAddress, amountInEther);
  }
}