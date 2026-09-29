import {TZDate} from '@date-fns/tz'
import {LOCAL_TIMEZONE} from './localTz'

/**
 * Type definition for the possible argument combinations for the LocalDate constructor.
 *
 * Permutations include:
 * - No arguments: Defaults to the current date.
 * - Date string: Parses the string into a Date.
 * - Date object: Uses the provided Date.
 * - Timestamp: A number representing milliseconds since the Unix Epoch.
 * - Year and month: Defaults other components like day, hours, etc.
 * - Year, month, and date: Allows specifying the day.
 * - Year, month, date, hours: Allows specifying the time down to hours.
 * - Year, month, date, hours, minutes: Allows specifying the time down to minutes.
 * - Year, month, date, hours, minutes, seconds: Allows specifying time down to seconds.
 * - Year, month, date, hours, minutes, seconds, milliseconds: Allows specifying time down to milliseconds.
 */
export type LocalDateProps =
  | []
  | [dateStr: string]
  | [date: Date]
  | [timestamp: number]
  | [year: number, month: number]
  | [year: number, month: number, date: number]
  | [year: number, month: number, date: number, hours: number]
  | [year: number, month: number, date: number, hours: number, minutes: number]
  | [
      year: number,
      month: number,
      date: number,
      hours: number,
      minutes: number,
      seconds: number
    ]
  | [
      year: number,
      month: number,
      date: number,
      hours: number,
      minutes: number,
      seconds: number,
      milliseconds: number
    ]

/**
 * A date string with no offset ("2026-09-28", "2026-09-28T09:30",
 * "2026-09-28 09:30:15.250"): wall-clock time with no zone of its own.
 */
const ZONELESS_DATE =
  /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?)?$/

/** Zoneless string -> [year, monthIndex, date, h, m, s, ms], else null. */
const zonelessParts = (str: string) => {
  const match = ZONELESS_DATE.exec(str)
  if (!match) {
    return null
  }
  const [, year, month, date, hours, minutes, seconds, ms] = match
  return [
    Number(year),
    Number(month) - 1,
    Number(date),
    Number(hours ?? 0),
    Number(minutes ?? 0),
    Number(seconds ?? 0),
    Number((ms ?? '0').padEnd(3, '0'))
  ] as const
}

/**
 * LocalDate class extends TZDate and sets the timezone to locally defined timezone.
 *
 * This class allows the creation of a date object in the locale timezone
 * using various permutations of date arguments. It supports:
 * - Date string
 * - Date object
 * - Timestamp
 * - Year, month, and optionally other components like day, time, etc.
 *
 * Wall-clock input (year/month/... parts, or a date string without an
 * offset) is read as local time in LOCAL_TIMEZONE, never in the machine's
 * zone, so the result is the same in a browser and on a UTC server.
 */
export default class LocalDate extends TZDate {
  /**
   * Constructs a new LocalDate instance.
   *
   * @param {...LocalDateProps} args - The date arguments, which can be any valid permutation as described by the LocalDateProps type.
   * If no arguments are provided, the current date is used.
   * If a date string or Date object is provided, it is used as the date. A
   * string without an offset ("2026-09-28", "2026-09-28T09:30") is local
   * time; one with "Z" or an offset is that exact moment.
   * If a timestamp is provided, it is treated as milliseconds since the Unix Epoch.
   * If year and month are provided, additional time components (day, hours, etc.) can be optionally provided.
   *
   * All date instances are created in the local timezone.
   */
  constructor(...args: LocalDateProps) {
    // If no arguments are passed, use the current date and local timezone
    if (args.length === 0) {
      super(new Date(), LOCAL_TIMEZONE)
    } else if (typeof args[0] === 'string') {
      const parts = zonelessParts(args[0])
      if (parts) {
        // Wall-clock time: build it in the local zone. (Passing the string
        // to TZDate would read it in the machine's zone first.)
        super(...parts, LOCAL_TIMEZONE)
      } else {
        // Has "Z" or an offset (or another format Date can parse): an
        // exact moment, shown in the local zone.
        super(args[0], LOCAL_TIMEZONE)
      }
    } else if (args[0] instanceof Date) {
      // Handle case when the first argument is a Date object
      super(args[0], LOCAL_TIMEZONE)
    } else if (typeof args[0] === 'number' && args.length === 1) {
      // Handle case when the first argument is a timestamp (number)
      super(args[0], LOCAL_TIMEZONE)
    } else {
      // Handle case when arguments represent a flexible date breakdown (year, month, etc.)
      const [
        year,
        month,
        date = 1, // Default to 1 if not provided
        hours = 0, // Default to 0 if not provided
        minutes = 0, // Default to 0 if not provided
        seconds = 0, // Default to 0 if not provided
        milliseconds = 0 // Default to 0 if not provided
      ] = args as [number, number, number?, number?, number?, number?, number?]

      // Built in the local zone directly: new Date(year, month, ...) would
      // read the parts in the machine's zone (UTC on a server).
      super(
        year,
        month,
        date,
        hours,
        minutes,
        seconds,
        milliseconds,
        LOCAL_TIMEZONE
      )
    }
  }
}
