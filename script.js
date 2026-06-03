const connectBtn =
document.getElementById("connectBtn");

const walletAddress =
document.getElementById("walletAddress");

async function connectWallet(){

  if(!window.ethereum){

    alert("Please install MetaMask");

    return;
  }

  try{

    const accounts =
    await ethereum.request({
      method:"eth_requestAccounts"
    });

    const user =
    accounts[0];

    walletAddress.innerText =
      user.substring(0,6) +
      "..." +
      user.substring(user.length - 4);

    connectBtn.innerText =
      "Connected";

  }catch(error){

    console.log(error);

    walletAddress.innerText =
      "Connection Failed";
  }
}

connectBtn.addEventListener(
  "click",
  connectWallet
);
