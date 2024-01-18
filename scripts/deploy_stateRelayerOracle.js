// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const sha3 = require('web3-utils').sha3
const {
  getNamedAccounts,
  hardhatArguments,
  deployments,
  web3,
  ethers,
  config,
} = hre
const fs = require('fs')

// Note: this deployment script is only intended for local testing
// use the deploy scripts in deploy/ instead.
async function main() {
  const getContract = async (name) => {
    const contract = await deployments.get(name)
    return ethers.getContractAt(contract.abi, contract.address)
  }

  const stableOracle = await getContract('StablePriceOracle')

  // Deploying DFIDUSDOracle
  const DFIDUSDOracleContract = await hre.ethers.getContractFactory(
    'DFIUSDTOracle',
  )

  // DummyOracle with 1 ETH == 2000 USD
  const oracle = await DFIDUSDOracleContract.deploy(
    hre.ethers.BigNumber.from('14000000'),
    '0xA6A853DDbfB6C85d3584E33313628555BA85753B',
  )

  await oracle.deployed()
  console.log('DFIDUSDOracleContract deployed to:', oracle.address)

  console.log('setting DFI Oracle to stablepriceOracle ')
  await stableOracle.setOracle(oracle.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
