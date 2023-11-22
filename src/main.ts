import 'dotenv/config'
import './tracer.js'
import { PythOracleListener } from './listeners/oracleListener/pythOracle.js'
import { Chain, Task, TaskType, oracleAccount, client, oracleSigner, IsMainnet } from './config.js'
import { MarketUserListener } from './listeners/marketListener/marketUserListener.js'
import { MetricsListener } from './listeners/metricsListener/metricsListener.js'
import deployBatchLiq from './scripts/DeployBatchLiq.js'
import deployBatchExec from './scripts/DeployBatchExec.js'
import { OrderListener } from './listeners/orderListener/orderListener.js'

const run = async () => {
  switch (Task) {
    case TaskType.liq: {
      const marketUsers = new MarketUserListener()
      await marketUsers.init()
      break
    }
    case TaskType.orders: {
      const orderListener = new OrderListener()
      await orderListener.init()

      setInterval(
        () => {
          orderListener.run()
        },
        IsMainnet ? OrderListener.PollingInterval : 5 * OrderListener.PollingInterval,
      )
      break
    }
    case TaskType.oracle: {
      const pythListener = new PythOracleListener(Chain, client)
      await pythListener.init()

      setInterval(
        () => {
          pythListener.run(oracleAccount, oracleSigner)
        },
        IsMainnet ? PythOracleListener.PollingInterval : 2 * PythOracleListener.PollingInterval,
      )
      break
    }
    case TaskType.deploy: {
      await deployBatchLiq()
      await deployBatchExec()
      break
    }
    case TaskType.metrics: {
      const metricsListener = new MetricsListener()
      await metricsListener.init()

      console.log('Running Metrics Event Watchers')
      metricsListener.watchEvents()

      console.log('Starting Metrics Listener')
      setInterval(
        () => {
          metricsListener.onInterval()
        },
        IsMainnet ? MetricsListener.PollingInterval : 5 * MetricsListener.PollingInterval,
      )
      console.log('Starting Upkeep Listener')
      setInterval(
        () => {
          metricsListener.onUpkeepInterval()
        },
        IsMainnet ? MetricsListener.UpkeepInterval : 5 * MetricsListener.UpkeepInterval,
      )
      break
    }
    default:
      return
  }
}

run()
