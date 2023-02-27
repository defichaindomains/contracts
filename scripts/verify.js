// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
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

  const ZERO =
    '0x0000000000000000000000000000000000000000000000000000000000000000'
  const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

  const ens = await getContract('ENSRegistry')
  const registrar = await getContract('BaseRegistrarImplementation')
  const reverse = await getContract('ReverseRegistrar')
  const controller = await getContract('ETHRegistrarController')
  const resolver = await getContract('PublicResolver')
  const stableOracle = await getContract('StablePriceOracle')
  const dummyOracle = await getContract('DummyOracle')

  try {
    console.log('verifying Registry Contract ...')

    await hre.run('verify:verify', {
      address: ens.address,
    })
  } catch (error) {
    //console.log(error)
  }

  try {
    console.log('verifying Registrar Contract ...')

    await hre.run('verify:verify', {
      address: registrar.address,
      constructorArguments: [ens.address, hre.ethers.utils.namehash('dfi')],
    })
  } catch (error) {
    //console.log(error)
  }

  try {
    console.log('verifying Reverse Registrar Contract ...')

    await hre.run('verify:verify', {
      address: reverse.address,
      constructorArguments: [ens.address, resolver.address],
    })
  } catch (error) {
    //console.log(error)
  }

  try {
    console.log('verifying Controller Contract ...')

    await hre.run('verify:verify', {
      address: controller.address,
      constructorArguments: [
        registrar.address,
        stableOracle.address,
        60,
        86400,
        3,
      ],
    })
  } catch (error) {
    //console.log(error)
  }

  try {
    console.log('verifying Public Resolver ...')

    await hre.run('verify:verify', {
      address: '0xDfFD5b71f14A42dCc20f8D8553a25244cb6F0605',
      constructorArguments: [ens.address],
    })
  } catch (error) {
    console.log(error)
  }

  try {
    console.log('verifying Dummy Oracle ...')

    await hre.run('verify:verify', {
      address: dummyOracle.address,
      constructorArguments: [ethers.BigNumber.from('100000000')],
    })
  } catch (error) {
    //console.log(error)
  }

  try {
    console.log('verifying Stable Oracle ...')

    const prices = [
      ethers.BigNumber.from('5000000000000000000000'),
      ethers.BigNumber.from('2500000000000000000000'),
      ethers.BigNumber.from('1000000000000000000000'),
      ethers.BigNumber.from('500000000000000000000'),
      ethers.BigNumber.from('100000000000000000000'),
    ]

    await hre.run('verify:verify', {
      address: stableOracle.address,
      constructorArguments: [dummyOracle.address, prices],
    })
  } catch (error) {
    //console.log(error)
  }

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
