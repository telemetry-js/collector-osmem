'use strict'

const singleMetric = require('@telemetry-js/metric').single
const match = require('@telemetry-js/match-metric-names')
const EventEmitter = require('events').EventEmitter
const os = require('os')

const ALL_METRICS = [
  'telemetry.osmem.free.percent',
  'telemetry.osmem.free.bytes',
  'telemetry.osmem.used.percent',
  'telemetry.osmem.used.bytes',
  'telemetry.osmem.total.bytes'
]

module.exports = function (options) {
  return new MemCollector(options)
}

class MemCollector extends EventEmitter {
  constructor (options) {
    if (!options) options = {}
    super()

    this._metrics = new Set(match(ALL_METRICS, options.metrics))
    this._percentOptions = { unit: 'percent' }
    this._byteOptions = { unit: 'bytes' }
  }

  // TODO: reuse metric objects between pings
  ping (callback) {
    const free = os.freemem()
    const total = os.totalmem()

    if (this._metrics.has('telemetry.osmem.used.percent')) {
      const metric = singleMetric('telemetry.osmem.used.percent', this._percentOptions)
      metric.record((total - free) / total * 100)
      this.emit('metric', metric)
    }

    if (this._metrics.has('telemetry.osmem.free.percent')) {
      const metric = singleMetric('telemetry.osmem.free.percent', this._percentOptions)
      metric.record(free / total * 100)
      this.emit('metric', metric)
    }

    if (this._metrics.has('telemetry.osmem.used.bytes')) {
      const metric = singleMetric('telemetry.osmem.used.bytes', this._byteOptions)
      metric.record(total - free)
      this.emit('metric', metric)
    }

    if (this._metrics.has('telemetry.osmem.free.bytes')) {
      const metric = singleMetric('telemetry.osmem.free.bytes', this._byteOptions)
      metric.record(free)
      this.emit('metric', metric)
    }

    if (this._metrics.has('telemetry.osmem.total.bytes')) {
      const metric = singleMetric('telemetry.osmem.total.bytes', this._byteOptions)
      metric.record(total)
      this.emit('metric', metric)
    }

    // No need to dezalgo ping()
    callback()
  }
}
