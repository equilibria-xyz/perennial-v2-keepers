import 'dotenv/config'
import './tracer.js'
import { Task, TaskType, IsMainnet, Chain } from './config.js'
import { MetricsListener } from './listeners/metricsListener/metricsListener.js'
import deployBatchKeeper from './scripts/DeployBatchKeeper.js'
import { OrderListener } from './listeners/orderListener/orderListener.js'
import { LiqListener } from './listeners/liqListener/liqListener.js'
import { SettlementListener } from './listeners/settlementListener/settlementListener.js'
import ClaimBatchKeeper from './scripts/claimBatchKeeper.js'
import { OracleListener } from './listeners/oracleListener/oracleListener.js'
import { CryptexFactoryAddresses, PythFactoryAddresses } from './constants/network.js'

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

      setInterval(
        () => {
          liqListener.refreshMarketUsers()
        },
        IsMainnet ? LiqListener.UserRefreshInterval : 5 * LiqListener.UserRefreshInterval,
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
      const pythListener = new OracleListener(PythFactoryAddresses[Chain.id], 'pythOracle')
      const cryptexListener = new OracleListener(CryptexFactoryAddresses[Chain.id], 'cryptexOracle')
      await pythListener.init()
      await cryptexListener.init()

      setInterval(
        () => {
          pythListener.run()
          cryptexListener.run()
        },
        IsMainnet ? OracleListener.PollingInterval : 2 * OracleListener.PollingInterval,
      )
      break
    }
    case TaskType.settlement: {
      const settlementListener = new SettlementListener()
      await settlementListener.init()

      settlementListener.listen()
      setInterval(
        () => {
          settlementListener.run()
        },
        IsMainnet ? SettlementListener.PollingInterval : 2 * SettlementListener.PollingInterval,
      )
      break
    }
    case TaskType.deploy: {
      await deployBatchKeeper()
      break
    }
    case TaskType.claim: {
      await ClaimBatchKeeper()
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
