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
const fs = require('fs')

function randomSecret() {
  return '0x' + crypto.randomBytes(32).toString('hex')
}

async function main() {
  const reservedNames = [
    'julian',
    'stefano',
    'uzyn',
    'peddy',
    'leonardo',
    'apple',
    'this',
    'that',
  ]

  const minCommitmentAge = 60
  const maxCommitmentAge = 86400
  const originalPrices = [
    ethers.BigNumber.from('5000000000000000000000'),
    ethers.BigNumber.from('2500000000000000000000'),
    ethers.BigNumber.from('1000000000000000000000'),
    ethers.BigNumber.from('500000000000000000000'),
    ethers.BigNumber.from('100000000000000000000'),
  ]
  const { BigNumber, utils } = ethers
  const { deployer } = await getNamedAccounts()
  const getContract = async (name) => {
    const contract = await deployments.get(name)
    return ethers.getContractAt(contract.abi, contract.address)
  }

  const controller = await getContract('ETHRegistrarController')
  const resolver = await getContract('PublicResolver')
  const stableOracle = await getContract('StablePriceOracle')

  console.log('setting price to zero')

  await stableOracle.setPrices([ethers.BigNumber.from('100000000000')])

  console.log('setting the commitment age to 1 second')

  await controller.setCommitmentAges(1, 60)

  for (let index = 0; index < reservedNames.length; index++) {
    try {
      const domainName = reservedNames[index]

      console.log('registering domain ', domainName, '.dfi')

      const salt = randomSecret()
      const commitment = await controller.makeCommitmentWithConfig(
        domainName,
        deployer,
        salt,
        resolver.address,
        deployer,
      )

      await controller.commit(commitment)

      const price = await controller.price(domainName)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      await controller.registerWithConfig(
        domainName,
        deployer,
        salt,
        resolver.address,
        deployer,
        {
          value: price.mul(210).div(100),
          gasLimit: 7920027,
        },
      )
      console.log(domainName, '.dfi Domain registered successfully!')
    } catch (error) {
      console.log('error registering domain ', domainName, '.dfi')
      console.log('error message: ', error)
    }
  }

  console.log('setting the commitment age to original values')

  await controller.setCommitmentAges(minCommitmentAge, maxCommitmentAge)

  console.log('setting the prices to original values')

  await stableOracle.setPrices(originalPrices)

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
