/**
 * LocalDate must give the same moment whatever the machine's zone. `npm
 * test` runs this under TZ=UTC (like Vercel) and TZ=America/Los_Angeles.
 */
import {test} from 'node:test'
import assert from 'node:assert/strict'
import LocalDate from './LocalDate'

const iso = (date: Date) => new Date(date.getTime()).toISOString()

test(`wall-clock parts are local time (machine TZ=${process.env.TZ})`, () => {
  // September is PDT (UTC-7), January is PST (UTC-8).
  assert.equal(
    iso(new LocalDate(2026, 8, 28, 9, 30)),
    '2026-09-28T16:30:00.000Z'
  )
  assert.equal(
    iso(new LocalDate(2026, 0, 15, 9, 30)),
    '2026-01-15T17:30:00.000Z'
  )
  assert.equal(iso(new LocalDate(2026, 8, 28)), '2026-09-28T07:00:00.000Z')
  assert.equal(iso(new LocalDate(2026, 8)), '2026-09-01T07:00:00.000Z')
  assert.equal(
    iso(new LocalDate(2026, 8, 28, 9, 30, 15, 250)),
    '2026-09-28T16:30:15.250Z'
  )
  // Out-of-range parts roll over, as with Date.
  assert.equal(iso(new LocalDate(2026, 12, 1)), '2027-01-01T08:00:00.000Z')
})

test('zoneless strings are local time', () => {
  assert.equal(iso(new LocalDate('2026-09-28')), '2026-09-28T07:00:00.000Z')
  assert.equal(iso(new LocalDate('2026-01-15')), '2026-01-15T08:00:00.000Z')
  assert.equal(
    iso(new LocalDate('2026-07-23T17:00:00')),
    '2026-07-24T00:00:00.000Z'
  )
  assert.equal(
    iso(new LocalDate('2026-09-28T09:30')),
    '2026-09-28T16:30:00.000Z'
  )
  assert.equal(
    iso(new LocalDate('2026-09-28 09:30:15.25')),
    '2026-09-28T16:30:15.250Z'
  )
})

test('strings with an offset are that exact moment', () => {
  assert.equal(
    iso(new LocalDate('2026-09-28T16:30:00.000Z')),
    '2026-09-28T16:30:00.000Z'
  )
  assert.equal(
    iso(new LocalDate('2026-09-28T09:30:00-07:00')),
    '2026-09-28T16:30:00.000Z'
  )
})

test('Date objects and timestamps keep their moment', () => {
  const moment = new Date('2026-09-28T16:30:00Z')
  assert.equal(iso(new LocalDate(moment)), moment.toISOString())
  assert.equal(iso(new LocalDate(moment.getTime())), moment.toISOString())
})

test('getters read local time', () => {
  const date = new LocalDate('2026-09-28T09:30')
  assert.equal(date.getFullYear(), 2026)
  assert.equal(date.getMonth(), 8)
  assert.equal(date.getDate(), 28)
  assert.equal(date.getHours(), 9)
  assert.equal(date.getMinutes(), 30)
  // A date-only string stays on its calendar day.
  assert.equal(new LocalDate('2025-10-21').getDate(), 21)
})

test('no arguments is now', () => {
  const before = Date.now()
  const now = new LocalDate().getTime()
  assert.ok(now >= before && now <= Date.now())
})
