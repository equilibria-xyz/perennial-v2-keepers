import ddTrace from 'dd-trace'
const tracer = ddTrace.tracer.init() // initialized in a different file to avoid hoisting.
export default tracer
