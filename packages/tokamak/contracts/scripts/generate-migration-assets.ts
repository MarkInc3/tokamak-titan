import fs from 'fs'

import { ethers, BigNumber } from 'ethers'; 

// titan events 
const L2Interface = [
  "event DepositFinalized(address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data)",
  "event Mint(address indexed _account, uint256 _amount)",
  "event Burn(address indexed _account, uint256 _amount)",
  // "event WithdrawalInitiated( address indexed _l1Token, address indexed _l2Token, address indexed _from, address _to, uint256 _amount, bytes _data )"
];
const ERC20 = [
  "function balanceOf(address account) external view returns (uint256)",
  "function totalSupply() external view returns (uint256)",
  "event Transfer(address indexed _from, address indexed _to, uint256 _value)",
  "function name() public view returns (string)",
  "function symbol() public view returns (string)"
]

const L1Interface =[
  "function deposits(address _firstKey, address _secondKey) public view returns (uint256)"
]

type Closed = {
  l1Token : string;
  l2Token : string;
  tokenName : string;
  data : User[];
}

type User = {
  claimer : string;
  amount : string;
}
const out:Closed[] = []; // export assets data

const main = async () => {  
  // L2 RPC URL 
  const provider = new ethers.providers.JsonRpcProvider("https://rpc.titan.tokamak.network");
  // L1 RPC URL
  const l1Provider = new ethers.providers.JsonRpcProvider("https://eth-pokt.nodies.app");
  let L1TokenContracts:any = [];
  const L2TokenContracts:any = []; 

  const l2Bridge = "0x4200000000000000000000000000000000000010";
  const l1Bridge = "0x59aa194798Ba87D26Ba6bEF80B85ec465F4bbcfD"
  const l2BridgeContracts = new ethers.Contract(l2Bridge, L2Interface, provider);
  const l1BridgeContracts = new ethers.Contract(l1Bridge, L1Interface , l1Provider);

  //  const filter = {
  //      address: l2Bridge,
  //      fromBlock: 0, // startBlock
  //      toBlock: "latest", // lastBlock
  //  };

   // 이벤트 가져오기
  let eventName = l2BridgeContracts.filters.DepositFinalized();

  const events = await l2BridgeContracts.queryFilter(eventName, 0, 'latest');
  if(events.length === 0 || events === undefined) {
    console.log('No events');
    process.exit(1);
  }
    
  
  // const uniqueAddresses: string[] = Array.from(new Set(addresses));
  // event.args == undefined 0x000 : topic index2 
  for (const event of events) {
    if(event.args !== undefined) {
      L2TokenContracts.push(
        {
          l1 : event.args[0],
          l2 : event.args[1],
        }
      )
      L1TokenContracts.push(event.args[0])
    }
  }
  L1TokenContracts = Array.from(new Set(L1TokenContracts))

  const tokenMapper = L2TokenContracts
    .reduce((map, pair) => {
      const key = pair.l1;
      if (!map.has(key)) {
        map.set(key, pair.l2);
      }
      return map;
    }, new Map<any, any>())
    

  // token 컨트랙트 표준 준수하는것만 할까 생각이들기도 함
  //console.log(tokenMapper);
  // L1 deposit, L2 totalSupply() check

  // L1, L2 밸런스가 안맞는데 ...?  --> 브릿지를 통한 발행을 제외한 나머지는 출금 못하게 해야할거같은데 애초에 브릿지 물량이없음
  // 애초에 브릿지에 토큰 물량을 합쳐서 입금 출금하는게 말이되나 싶기도하고;; 

  console.log(tokenMapper)
  for(const contract of L1TokenContracts) {
    // L1 deposit
    const v:BigNumber = await l1BridgeContracts.deposits(contract, tokenMapper.get(contract))
    // L2 totalSupply()
    const l2Token = new ethers.Contract(tokenMapper.get(contract), ERC20 , provider);
    console.log("L1 : ", v.toString() ," L2 : ", (await l2Token.totalSupply()).toString());
  }

  // L2 tarnsfer 이벤트로 to, from 수집 중복 제거 --> L2 각 토큰 보유량 계산해서 저장
  // "event Transfer(address indexed _from, address indexed _to, uint256 _value)"

  for(const l1tokenContract of L1TokenContracts) {
    let totalAddress:any = [];
    let totalBalance: BigNumber = ethers.BigNumber.from(0);  
    const data:User[] = [];
    const token = new ethers.Contract(tokenMapper.get(l1tokenContract), ERC20 , provider);
    
  
    eventName = token.filters.Transfer();
    const transferEvent = await token.queryFilter(eventName, 0,'latest');
    for (const event of transferEvent) {
      if(event.args !== undefined) {
        totalAddress.push(event.args[0])
        totalAddress.push(event.args[1])
      }
    }
    
    totalAddress = Array.from(new Set(totalAddress))
    console.log(totalAddress.length)
    // token balance
    for(const address of totalAddress) {
      // console.log((await token.balanceOf(totalAddress[j])).toString(), 'index ', j)

      const amount = await token.balanceOf(address);
      totalBalance = totalBalance.add(amount) // total balance  
      data.push({
        claimer : address,
        amount : (await token.balanceOf(address)).toString()
      })
    }

    out.push({
      l1Token: l1tokenContract,
      l2Token: tokenMapper.get(l1tokenContract),
      tokenName: await token.name(),
      data
    })

    console.log("L1 address : ", l1tokenContract  ," L2 : ", totalBalance.toString());

  }  

  // total Balance 
  console.log(out)

  // export file
  fs.writeFile('./generate-assets.json', JSON.stringify(out, null, 1) , 'utf-8', (err)=>{
      if(err) {
          console.log(err);
      }
      process.exit();
  })
  // throw console.log('a');



  // console.log(await l1BridgeContracts.deposits())

}



main().catch((error) => {
  console.log(error)
  process.exit(1);
})
