/* Imports: External */
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory, utils } from 'ethers'
import { getContractFactory } from '@eth-optimism/contracts'

/* eslint-disable */
require('dotenv').config()

import { registerAddress } from './000-L1MessengerFast.deploy'
import L1ERC20Json from '../artifacts/contracts/test-helpers/L1ERC20.sol/L1ERC20.json'
import L1LiquidityPoolJson from '../artifacts/contracts/LP/L1LiquidityPool.sol/L1LiquidityPool.json'
import L2LiquidityPoolJson from '../artifacts/contracts/LP/L2LiquidityPool.sol/L2LiquidityPool.json'
import preSupportedTokens from '../preSupportedTokens.json'

let Factory__L1ERC20: ContractFactory
let Factory__L2ERC20: ContractFactory

let L1ERC20: Contract
let L2ERC20: Contract

let Proxy__L1LiquidityPool: Contract
let Proxy__L2LiquidityPool: Contract

const initialSupply_6 = utils.parseUnits('10000', 6)
const initialSupply_18 = utils.parseEther('10000000000')

const deployFn: DeployFunction = async (hre) => {
  // register token pool in LPs
  const registerLPToken = async (L1TokenAddress, L2TokenAddress) => {
    const registerL1LP = await Proxy__L1LiquidityPool.registerPool(
      L1TokenAddress,
      L2TokenAddress
    )
    await registerL1LP.wait()

    const registerL2LP = await Proxy__L2LiquidityPool.registerPool(
      L1TokenAddress,
      L2TokenAddress
    )
    await registerL2LP.wait()
  }

  // get address manager
  const addressManager = getContractFactory('Lib_AddressManager')
    .connect((hre as any).deployConfig.deployer_l1)
    .attach(process.env.ADDRESS_MANAGER_ADDRESS) as any

  // get ContractFactory of L1/L2ERC20
  Factory__L1ERC20 = new ContractFactory(
    L1ERC20Json.abi,
    L1ERC20Json.bytecode,
    (hre as any).deployConfig.deployer_l1
  )

  Factory__L2ERC20 = getContractFactory(
    'L2StandardERC20',
    (hre as any).deployConfig.deployer_l2
  )

  // support address pre-deployed contract in goerli, mainnet
  let tokenAddressL1 = null

  // loop
  for (const token of preSupportedTokens.supportedTokens) {
    if (
      process.env.CONTRACTS_TARGET_NETWORK === 'local'
    ) {
      // token supply
      let supply = initialSupply_18
      // USDC
      if (token.decimals === 6) {
        supply = initialSupply_6
      }

      // deploy ERC20 token in L1
      L1ERC20 = await Factory__L1ERC20.deploy(
        supply,
        token.name,
        token.symbol,
        token.decimals
      )
      await L1ERC20.deployTransaction.wait()

      tokenAddressL1 = L1ERC20.address

      const L1ERC20DeploymentSubmission: DeploymentSubmission = {
        ...L1ERC20,
        receipt: L1ERC20.receipt,
        address: L1ERC20.address,
        abi: L1ERC20Json.abi,
      }

      // hre.deployments에 저장
      await hre.deployments.save(
        'TK_L1' + token.symbol,
        L1ERC20DeploymentSubmission
      )
      await registerAddress(
        addressManager,
        'TK_L1' + token.symbol,
        tokenAddressL1
      )
      console.log(
        `TK_L1${token.symbol} was newly deployed to ${tokenAddressL1}`
      )
      // goerli: use pre-deployed contracts
    } else if (process.env.CONTRACTS_TARGET_NETWORK === 'goerli') {
      tokenAddressL1 = token.address.goerli

      await hre.deployments.save('TK_L1' + token.symbol, {
        abi: L1ERC20Json.abi,
        address: tokenAddressL1,
      })
      await registerAddress(
        addressManager,
        'TK_L1' + token.symbol,
        tokenAddressL1
      )

      console.log(`TK_L1${token.name} is located at ${tokenAddressL1}`)
      // mainnet: use pre-deployed contracts
    } else if (process.env.CONTRACTS_TARGET_NETWORK === 'mainnet') {
      tokenAddressL1 = token.address.mainnet

      await hre.deployments.save('TK_L1' + token.symbol, {
        abi: L1ERC20Json.abi,
        address: tokenAddressL1,
      })
      await registerAddress(
        addressManager,
        'TK_L1' + token.symbol,
        tokenAddressL1
      )

      console.log(`TK_L1${token.name} is located at ${tokenAddressL1}`)
    }

    // get ethers.Contract
    L1ERC20 = new Contract(
      tokenAddressL1,
      L1ERC20Json.abi,
      (hre as any).deployConfig.deployer_l1
    )

    // Set up things on L2 for these tokens
    L2ERC20 = await Factory__L2ERC20.deploy(
      (hre as any).deployConfig.L2StandardBridgeAddress,
      tokenAddressL1,
      token.name,
      token.symbol
    )
    await L2ERC20.deployTransaction.wait()

    const L2ERC20DeploymentSubmission: DeploymentSubmission = {
      ...L2ERC20,
      receipt: L2ERC20.receipt,
      address: L2ERC20.address,
      abi: L2ERC20.abi,
    }
    await hre.deployments.save(
      'TK_L2' + token.symbol,
      L2ERC20DeploymentSubmission
    )
    await registerAddress(
      addressManager,
      'TK_L2' + token.symbol,
      L2ERC20.address
    )
    console.log(`TK_L2${token.symbol} was deployed to ${L2ERC20.address}`)

    // check deployment of LPs
    const Proxy__L1LiquidityPoolDeployment = await hre.deployments.getOrNull(
      'Proxy__L1LiquidityPool'
    )
    const Proxy__L2LiquidityPoolDeployment = await hre.deployments.getOrNull(
      'Proxy__L2LiquidityPool'
    )

    // get LPs
    Proxy__L1LiquidityPool = new Contract(
      Proxy__L1LiquidityPoolDeployment.address,
      L1LiquidityPoolJson.abi,
      (hre as any).deployConfig.deployer_l1
    )
    Proxy__L2LiquidityPool = new Contract(
      Proxy__L2LiquidityPoolDeployment.address,
      L2LiquidityPoolJson.abi,
      (hre as any).deployConfig.deployer_l2
    )

    // Register tokens in LPs
    await registerLPToken(tokenAddressL1, L2ERC20.address)
    console.log(`${token.name} was registered in LPs`)
  }
}

deployFn.tags = ['L1ERC20', 'test']
export default deployFn
