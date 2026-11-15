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
  {name: 'info-circle', label: 'Information'},
  {name: 'bell-exclamation', label: 'Notice'},
  {name: 'help-circle', label: 'Help'},
  {name: 'droplet', label: 'Water'},
  {name: 'droplet-off', label: 'Water outage'},
  {name: 'tool', label: 'Maintenance'},
  {name: 'barrier-block', label: 'Construction'},
  {name: 'building-community', label: 'Office or facility'},
  {name: 'phone-off', label: 'Phones down'},
  {name: 'credit-card', label: 'Payments'},
  {name: 'receipt-dollar', label: 'Billing'},
  {name: 'directions', label: 'Directions'},
  {name: 'calendar-event', label: 'Event'},
  {name: 'clock', label: 'Hours'},
  {name: 'map-pin', label: 'Location'},
  {name: 'flame', label: 'Fire'},
  {name: 'cloud-storm', label: 'Storm'},
  {name: 'bolt', label: 'Power'},
  {name: 'wifi-off', label: 'Online services down'},
  {name: 'mail', label: 'Mail'}
] as const

export type AlertIconName = (typeof ALERT_ICONS)[number]['name']

export const isAlertIconName = (value: unknown): value is AlertIconName =>
  ALERT_ICONS.some((icon) => icon.name === value)
