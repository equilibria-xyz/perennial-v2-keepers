import 'dotenv/config'
import './tracer.js'
import { PythOracleListener } from './listeners/oracleListener/pythOracle.js'
import { Chain, Task, TaskType, oracleAccount, client, oracleSigner, IsMainnet } from './config.js'
import { MetricsListener } from './listeners/metricsListener/metricsListener.js'
import deployBatchKeeper from './scripts/DeployBatchKeeper.js'
import { OrderListener } from './listeners/orderListener/orderListener.js'
import { LiqListener } from './listeners/liqListener/liqListener.js'

const run = async () => {
  switch (Task) {
    case TaskType.liq: {
      const liqListener = new LiqListener()
      await liqListener.init()

      setInterval(
        () => {
          liqListener.run()
        },
        IsMainnet ? LiqListener.PollingInterval : 5 * LiqListener.PollingInterval,
      )
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
      await deployBatchKeeper()
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
