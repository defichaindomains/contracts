// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const sha3 = require('web3-utils').sha3
const hre = require('hardhat')
const {
  getNamedAccounts,
  hardhatArguments,
  deployments,
  web3,
  ethers,
  config,
} = hre
const fs = require('fs')

async function main() {
  const { deployer } = await getNamedAccounts()
  const getContract = async (name) => {
    const contract = await deployments.get(name)
    return ethers.getContractAt(contract.abi, contract.address)
  }

  const ens = await getContract('ENSRegistry')
  const registrar = await getContract('BaseRegistrarImplementation')

  // Deploying PublicResolver
  const ResolverContract = await hre.ethers.getContractFactory('PublicResolver')
  const resolver = await ResolverContract.deploy(ens.address)
  console.log('PublicResolver deployed to:', resolver.address)

  console.log('set the public resolver')
  await registrar.setResolver(resolver.address)

  console.log('All Set! New resolver address is: ' + resolver.address)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
