'use strict'

const test = require('tape')
const proxyquire = require('proxyquire')
const collector = proxyquire('.', {
  os: {
    freemem () { return 900 },
    totalmem () { return 1000 }
  }
})

test('emits all metrics by default', function (t) {
  t.plan(2)

  const c = collector()
  const metrics = []

  c.on('metric', metrics.push.bind(metrics))

  c.ping((err) => {
    t.ifError(err, 'no ping error')
    t.same(metrics.map(simplify), [
      {
        name: 'telemetry.osmem.used.percent',
        unit: 'percent',
        resolution: 60,
        tags: {},
        value: 10
      },
      {
        name: 'telemetry.osmem.free.percent',
        unit: 'percent',
        resolution: 60,
        tags: {},
        value: 90
      },
      {
        name: 'telemetry.osmem.used.bytes',
        unit: 'bytes',
        resolution: 60,
        tags: {},
        value: 100
      },
      {
        name: 'telemetry.osmem.free.bytes',
        unit: 'bytes',
        resolution: 60,
        tags: {},
        value: 900
      },
      {
        name: 'telemetry.osmem.total.bytes',
        unit: 'bytes',
        resolution: 60,
        tags: {},
        value: 1000
      }
    ])
  })
})

test('can filter metrics with wildcard', function (t) {
  t.plan(2)

  const c = collector({ metrics: '*.percent' })
  const metrics = []

  c.on('metric', metrics.push.bind(metrics))

  c.ping((err) => {
    t.ifError(err, 'no ping error')
    t.same(metrics.map(simplify), [
      {
        name: 'telemetry.osmem.used.percent',
        unit: 'percent',
        resolution: 60,
        tags: {},
        value: 10
      },
      {
        name: 'telemetry.osmem.free.percent',
        unit: 'percent',
        resolution: 60,
        tags: {},
        value: 90
      }
    ])
  })
})

test('can filter metrics with single name', function (t) {
  t.plan(2)

  const c = collector({ metrics: ['telemetry.osmem.free.percent'] })
  const metrics = []

  c.on('metric', metrics.push.bind(metrics))

  c.ping((err) => {
    t.ifError(err, 'no ping error')
    t.same(metrics.map(simplify), [
      {
        name: 'telemetry.osmem.free.percent',
        unit: 'percent',
        resolution: 60,
        tags: {},
        value: 90
      }
    ])
  })
})

function simplify (metric) {
  delete metric.date
  delete metric.statistic

  return metric
}
