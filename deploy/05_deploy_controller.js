module.exports = async ({
  getNamedAccounts,
  hardhatArguments,
  deployments,
  ethers,
  config,
}) => {
  const { deploy } = deployments
  const { deployer } = await getNamedAccounts()

  const registrar = await deployments.get('BaseRegistrarImplementation')
  const priceOracle = await deployments.get('StablePriceOracle')
  const minCommitmentAge = 60
  const maxCommitmentAge = 86400
  const minDomainLength = 3

  await deploy('ETHRegistrarController', {
    from: deployer,
    args: [
      registrar.address,
      priceOracle.address,
      minCommitmentAge,
      maxCommitmentAge,
      minDomainLength,
    ],
    log: true,
  })
}

module.exports.tags = ['ETHRegistrarController']
module.exports.dependencies = [
  'BaseRegistrarImplementation',
  'StablePriceOracle',
]
