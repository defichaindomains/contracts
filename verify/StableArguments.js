const hre = require('hardhat')

const prices = [
  hre.ethers.BigNumber.from('5000000000000000000000'), // price for 1 char
  hre.ethers.BigNumber.from('2500000000000000000000'), // price for 2 char
  hre.ethers.BigNumber.from('1000000000000000000000'), // price for 3 char
  hre.ethers.BigNumber.from('500000000000000000000'), // price for 4 char
  hre.ethers.BigNumber.from('100000000000000000000'), // price for 5+ char
]

module.exports = ['0x28c3D5Bf36A51c4305D32629B801aC7CC0b1aeeC', prices] // dummy oracle address
