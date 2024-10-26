// Testing stubs
import { vi } from 'vitest'
vi.stubEnv('TIP_MULTIPLIER', '1')

export const CallGasLimitMultiplier = !Number.isNaN(Number(process.env.CALL_GAS_LIMIT_MULTIPLIER)) ? Number(process.env.CALL_GAS_LIMIT_MULTIPLIER) : 1.5
export const BaseTipMultiplier = !Number.isNaN(Number(process.env.TIP_MULTIPLIER)) ? Number(process.env.TIP_MULTIPLIER) : 1.3
export const TipPercentageIncrease = !Number.isNaN(Number(process.env.TIP_PERCENTAGE_INCREASE)) ? Number(process.env.TIP_PERCENTAGE_INCREASE) : 0.1
export const MaxRetries = !Number.isNaN(Number(process.env.RELAYER_MAX_RETRY)) ? Number(process.env.RELAYER_MAX_RETRY) : 3
