// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require('hardhat')
const crypto = require('crypto')
const {
  getNamedAccounts,
  hardhatArguments,
  deployments,
  web3,
  ethers,
  config,
} = hre

async function main() {
  const { deployer } = await getNamedAccounts()
  const getContract = async (name) => {
    const contract = await deployments.get(name)
    return ethers.getContractAt(contract.abi, contract.address)
  }

  const registrar = await getContract('BaseRegistrarImplementation')

  console.log('Setting Base URI')

  await registrar.setBaseURI(
    'https://metadata.defichain-domains.com/metachain/0x562F812346a7078B5304705cE65C48929E61050c/',
  )

  console.log('Done!')
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
