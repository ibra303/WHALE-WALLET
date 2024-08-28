

var keyss = null;

var createAccountForm = document.getElementById("createAccountForm"); // listener method
if (createAccountForm) {
  createAccountForm.addEventListener("submit", function (event) {
    event.preventDefault();
    createAccount();
  });
}

function login() {
    // login function
    var username = document.getElementById("loginUsername").value;
    var password = document.getElementById("loginPassword").value;
    var loginResult = document.getElementById("loginResult");
  
    var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  
    // If any user is logged in already, prevent new login
    var loggedInUser = allUsers.find((user) => user.isLoggedIn);
    if (loggedInUser) {
      loginResult.innerText =
        "Another user is already logged in.";
      return;
    }
  
    var user = allUsers.find(
      (user) => user.username === username && user.password === password
    ); // check if its the correct username and password
  
    if (!user) {
      loginResult.innerText = "Invalid Username or Password";
      return;
    }
  
    loginResult.innerText = "Login Successful, Hello " + username;
    setTimeout(function () {
      window.location.href = "Profile.html";
    }, 2000);
    user.isLoggedIn = true;
    localStorage.setItem("userData", JSON.stringify(allUsers));
  }
  
  function logOut() {
    // logout
    var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  
    // Find the logged in user and set isLoggedIn to false
    var loggedInUser = allUsers.find((user) => user.isLoggedIn);
    if (loggedInUser) {
      loggedInUser.isLoggedIn = false;
    }
  
    // Update the localStorage
    localStorage.setItem("userData", JSON.stringify(allUsers));
  
    // Get the current page URL
    var currentPage = window.location.href;
  
    // Check if the current page is not the login page
    if (
      currentPage.indexOf("Login.html") === -1 &&
      currentPage.indexOf("RestoreAccount.html") === -1
    ) {
      window.location.href = "Login.html"; // redirect to login page
    }
  }

  function createAccount() {
    //create a new account to use the wallet
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var seedPhrase = lightwallet.keystore.generateRandomSeed();
  
    lightwallet.keystore.createVault(
      {
        password: password,
        seedPhrase: seedPhrase,
        hdPathString: "m/44'/60'/0'/0",
      },
      function (err, keyStore) {
        // Renamed keyss to keyStore
        if (err) throw err;
  
        keyStore.keyFromPassword(password, function (err, pwDerivedKey) {
          if (err) throw err;
          keyStore.generateNewAddress(pwDerivedKey, 1);
          var addr = keyStore.getAddresses()[0];
  
          var userData = {
            username: username,
            password: password,
            address: addr,
            seedPhrase: seedPhrase,
            isLoggedIn: true,
            serializedKeystore: keyStore.serialize(),
            transactions: [],
          };
  
          // Retrieve all the users from localStorage
          var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  
          // Add new user to the list and save it in localStorage
          allUsers.push(userData);
          localStorage.setItem("userData", JSON.stringify(allUsers));
  
          document.getElementById("accountAddress").innerText =
            "Username: " + username + "\nAccount Address: " + addr;
          document.getElementById("seedPhraseDisplay").innerText = seedPhrase; // Display the seed phrase
        });
      }
    );
  }
  // This function gets the address of the currently logged in user
function getLoggedInUserAddress() {
    var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
    var loggedInUser = allUsers.find((user) => user.isLoggedIn);
  
    if (!loggedInUser) {
      console.log("No logged in user found");
      return;
    }
  
    console.log("User Address: ", loggedInUser.address);
    document.getElementById(
      "walletAddress"
    ).innerText = ` ${loggedInUser.address}`;
  }
  
  function loginStatus() {
    // this function to display the user username on the screen on the top left
  
    var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
    var loggedInUser = allUsers.find((user) => user.isLoggedIn);
  
    if (loggedInUser) {
      document.getElementById(
        "loginStatus"
      ).innerHTML = `<div class="logged-in-message"><span class="username">${loggedInUser.username}</span>'s Wallet</div>`;
      getLoggedInUserAddress();
      getETHBalance();
      getAVAXBalance();
      }
      else {
      document.getElementById("loginStatus").innerHTML =
        "Log in to use the wallet";
      window.location.href = "Login.html";
    }
  }



  function restoreAccount(seedPhraseInput) {
    // Retrieve all the users from localStorage
    var allUsers = JSON.parse(localStorage.getItem("userData")) || [];
  
    // Check if there is a user currently logged in
    var loggedInUser = allUsers.find((user) => user.isLoggedIn);
    if (loggedInUser) {
      return "A user is already logged in";
    }
  
    // Find the user whose seed phrase matches the input seed phrase
    var user = allUsers.find((user) => user.seedPhrase === seedPhraseInput);
    allUsers.forEach((user) => console.log(user.seedPhrase));
    console.log(seedPhraseInput);
  
    if (user) {
      user.password = document.getElementById("newPassword").value; // update password
  
      // Log in the user associated with the seed phrase
      user.isLoggedIn = true;
      localStorage.setItem("userData", JSON.stringify(allUsers));
      // window.location.href = "Login.html";
      return "Wallet Restored Successfully";
    } else {
      return "User not found, please enter a valid seed phrase";
    }
  }