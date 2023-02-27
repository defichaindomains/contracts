const hre = require('hardhat')

module.exports = [
  '0xCa33092AE06D170791C1d0E1177e884Db8b1eEBF', // ens registry address
  hre.ethers.utils.namehash('dfi'),
]
