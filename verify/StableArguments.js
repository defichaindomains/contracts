const hre = require('hardhat')

const prices = [
  hre.ethers.BigNumber.from('5000000000000000000000'),
  hre.ethers.BigNumber.from('2500000000000000000000'),
  hre.ethers.BigNumber.from('1000000000000000000000'),
  hre.ethers.BigNumber.from('500000000000000000000'),
  hre.ethers.BigNumber.from('100000000000000000000'),
]

module.exports = ['0xD378892F25c516f9074Ec6801c06710508C53FB2', prices]
