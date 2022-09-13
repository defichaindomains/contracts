const hre = require('hardhat')

const prices = [
  hre.ethers.BigNumber.from('5000000000000000000000'),
  hre.ethers.BigNumber.from('2500000000000000000000'),
  hre.ethers.BigNumber.from('1000000000000000000000'),
  hre.ethers.BigNumber.from('500000000000000000000'),
  hre.ethers.BigNumber.from('100000000000000000000'),
]

module.exports = ['0xb835C0C3Ea8b132b55fddf8988366b89f13599Dc', prices]
