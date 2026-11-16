/**
 * The icons an alert can show, shared by the CMS (which offers them in a
 * picker and stores the `name`) and PCWA.net (which draws them). Names are
 * Tabler icon names; each app renders them with its own `@tabler/icons-react`,
 * since this library deliberately doesn't depend on an icon set.
 *
 * Keep this list short and deliberate. Each app maps every name to a component
 * in a `Record<AlertIconName, …>`, so adding a name here fails both apps'
 * type-checks until they draw it.
 */
export const ALERT_ICONS = [
  {name: 'alert-triangle', label: 'Warning'},
  {name: 'alert-circle', label: 'Alert'},
  {name: 'alert-octagon', label: 'Important'},
  {name: 'shield-exclamation', label: 'Fraud or scam'},
  {name: 'info-circle', label: 'Information'},
  {name: 'bell-exclamation', label: 'Notice'},
  {name: 'speakerphone', label: 'Announcement'},
  {name: 'help-circle', label: 'Help'},
  {name: 'droplet', label: 'Water'},
  {name: 'droplet-off', label: 'Water outage'},
  {name: 'tool', label: 'Maintenance'},
  {name: 'barrier-block', label: 'Construction'},
  {name: 'truck', label: 'Crews working'},
  {name: 'building-community', label: 'Office or facility'},
  {name: 'door-off', label: 'Office closed'},
  {name: 'phone-off', label: 'Phones down'},
  {name: 'credit-card', label: 'Payments'},
  {name: 'receipt-dollar', label: 'Billing'},
  {name: 'directions', label: 'Directions'},
  {name: 'calendar-event', label: 'Event'},
  {name: 'clock', label: 'Hours'},
  {name: 'map-pin', label: 'Location'},
  {name: 'flame', label: 'Fire'},
  {name: 'cloud-storm', label: 'Storm'},
  {name: 'snowflake', label: 'Freeze'},
  {name: 'temperature-sun', label: 'Heat'},
  {name: 'bolt', label: 'Power'},
  {name: 'wifi-off', label: 'Online services down'},
  {name: 'world-www', label: 'Website'},
  {name: 'mail', label: 'Mail'},
  {name: 'mail-off', label: 'Email down'},
  {name: 'file-text', label: 'Notice or document'}
] as const

export type AlertIconName = (typeof ALERT_ICONS)[number]['name']

export const isAlertIconName = (value: unknown): value is AlertIconName =>
  ALERT_ICONS.some((icon) => icon.name === value)
