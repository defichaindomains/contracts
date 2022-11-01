require('@nomiclabs/hardhat-truffle5')
require('@nomiclabs/hardhat-waffle')
require('hardhat-abi-exporter')
require('@nomiclabs/hardhat-solhint')
require('hardhat-gas-reporter')
require('hardhat-deploy')
require('@nomiclabs/hardhat-ethers')
require('@nomiclabs/hardhat-etherscan')
require('dotenv').config()

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async () => {
  const accounts = await ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

// TLD to use in deployment
const TLD = 'dfi'

// Replace this private key with your account private key
// To export your private key from Metamask, open Metamask and
// go to Account Details > Export Private Key
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accountKey = PRIVATE_KEY === '' ? '0x00' : '0x' + PRIVATE_KEY

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  tld: TLD,
  networks: {
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/EZKHx-Re3Vy6pE9s2XUIgiJotOsEqUQW`,
      usdOracle: null,
      chainId: 80001,
      accounts: [accountKey],
      tags: ['production'],
    },
    hardhat: {
      // Required for real DNS record tests
      initialDate: '2019-03-15T14:06:45.000+13:00',
      tags: ['test', 'local'],
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      tags: ['local'],
    },
  },
  etherscan: {
    apiKey: process.env.POLYGONSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  mocha: {},
  abiExporter: {
    path: './build/contracts',
    clear: true,
    flat: true,
    runOnCompile: true,
    except: ['Ownable', 'NameResolver'],
    spacing: 2,
  },
  solidity: {
    compilers: [
      {
        version: '0.8.4',
      },
      {
        version: '0.8.4',
      },
    ],
  },
}
