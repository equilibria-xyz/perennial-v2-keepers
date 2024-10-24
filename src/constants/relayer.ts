export const CallGasLimitMultiplier = !Number.isNaN(Number(process.env.CALL_GAS_LIMIT_MULTIPLIER)) ? Number(process.env.CALL_GAS_LIMIT_MULTIPLIER) : 1.5
export const BaseTipMultiplier = !Number.isNaN(Number(process.env.TIP_MULTIPLIER)) ? Number(process.env.TIP_MULTIPLIER) : 2
